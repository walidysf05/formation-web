// Automated tests of api.js with a simulated fetch (run with `npm test`).
// The browser tests of weather.js stay in tests.html.

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  searchCities,
  getWeather,
  NETWORK_MESSAGE,
  INVALID_SEARCH_MESSAGE,
  INVALID_RESPONSE_MESSAGE,
  INVALID_COORDINATES_MESSAGE,
} from "./api.js";

const jsonResponse = (body, status = 200) =>
  new Response(JSON.stringify(body), { status });

const lilleForecast = {
  current_units: { temperature_2m: "°C", wind_speed_10m: "km/h" },
  current: { temperature_2m: 14.5, wind_speed_10m: 33.5, weather_code: 0 },
  daily: {
    time: ["2026-11-17", "2026-11-18"],
    temperature_2m_max: [15.1, 11.3],
    temperature_2m_min: [5.0, 9.0],
    weather_code: [63, 63],
  },
};
const place = { latitude: 50.63, longitude: 3.06 };

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

const stubFetch = (impl) => vi.stubGlobal("fetch", vi.fn(impl));

describe("searchCities", () => {
  it("returns the results (case 1)", async () => {
    stubFetch(async () => jsonResponse({ results: [{ name: "Lille" }] }));
    expect(await searchCities("Lille")).toEqual([{ name: "Lille" }]);
  });

  it("encodes the name and asks for English (cases 6, 9)", async () => {
    stubFetch(async () => jsonResponse({}));
    await searchCities("Saint-Étienne");
    const url = fetch.mock.calls[0][0];
    expect(url).toContain("name=Saint-%C3%89tienne");
    expect(url).toContain("language=en");
  });

  it("sends a timeout signal", async () => {
    stubFetch(async () => jsonResponse({}));
    await searchCities("Lille");
    expect(fetch.mock.calls[0][1].signal).toBeInstanceOf(AbortSignal);
  });

  it("returns [] when the answer has no results (case 16)", async () => {
    stubFetch(async () => jsonResponse({ generationtime_ms: 0.1 }));
    expect(await searchCities("xyxrx")).toEqual([]);
  });

  it("network failure => network message (case 19)", async () => {
    stubFetch(async () => {
      throw new TypeError("Failed to fetch");
    });
    await expect(searchCities("Lille")).rejects.toThrow(NETWORK_MESSAGE);
  });

  it("timeout on fetch => network message (case 34)", async () => {
    stubFetch(async () => {
      throw new DOMException("The operation timed out.", "TimeoutError");
    });
    await expect(searchCities("Lille")).rejects.toThrow(NETWORK_MESSAGE);
  });

  it("timeout while reading the body => network message (case 34)", async () => {
    stubFetch(async () => ({
      ok: true,
      status: 200,
      json: async () => {
        throw new DOMException("The operation timed out.", "TimeoutError");
      },
    }));
    await expect(searchCities("Lille")).rejects.toThrow(NETWORK_MESSAGE);
  });

  it("400 => our message, the API reason is only logged (case 21)", async () => {
    stubFetch(async () =>
      jsonResponse({ error: true, reason: "Technical reason" }, 400),
    );
    await expect(searchCities("Lille")).rejects.toThrow(INVALID_SEARCH_MESSAGE);
    expect(console.error).toHaveBeenCalledWith("Open-Meteo 400:", "Technical reason");
  });

  it("400 with a body that is not JSON => same message (case 21)", async () => {
    stubFetch(async () => new Response("<html>proxy</html>", { status: 400 }));
    await expect(searchCities("Lille")).rejects.toThrow(INVALID_SEARCH_MESSAGE);
  });

  it.each([429, 500])("HTTP %i => server error message (case 21)", async (status) => {
    stubFetch(async () => new Response("", { status }));
    await expect(searchCities("Lille")).rejects.toThrow(`Server error (${status})`);
  });

  it("200 with a non-JSON body => unexpected response", async () => {
    stubFetch(async () => new Response("<html>proxy</html>", { status: 200 }));
    await expect(searchCities("Lille")).rejects.toThrow(INVALID_RESPONSE_MESSAGE);
  });

  it.each([
    ["null", null],
    ["array", []],
    ["text", "hello"],
    ["results is not an array", { results: "x" }],
  ])("broken answer (%s) => unexpected response", async (_label, body) => {
    stubFetch(async () => jsonResponse(body));
    await expect(searchCities("Lille")).rejects.toThrow(INVALID_RESPONSE_MESSAGE);
  });
});

describe("getWeather", () => {
  it("returns the formatted weather (case 26)", async () => {
    stubFetch(async () => jsonResponse(lilleForecast));
    const weather = await getWeather(place);
    expect(weather.temperature).toBe(14.5);
    expect(weather.days).toHaveLength(2);
    const url = fetch.mock.calls[0][0];
    expect(url).toContain("forecast_days=5");
    expect(url).toContain("timezone=auto");
  });

  it("network failure => network message (case 31)", async () => {
    stubFetch(async () => {
      throw new TypeError("Failed to fetch");
    });
    await expect(getWeather(place)).rejects.toThrow(NETWORK_MESSAGE);
  });

  it("400 => invalid coordinates message (case 33)", async () => {
    stubFetch(async () =>
      jsonResponse({ error: true, reason: "Latitude must be in range" }, 400),
    );
    await expect(getWeather(place)).rejects.toThrow(INVALID_COORDINATES_MESSAGE);
  });

  it("answer without temperature => unexpected response", async () => {
    stubFetch(async () => jsonResponse({ ...lilleForecast, current: {} }));
    await expect(getWeather(place)).rejects.toThrow(INVALID_RESPONSE_MESSAGE);
  });

  it("answer without forecast => unexpected response", async () => {
    stubFetch(async () => jsonResponse({ ...lilleForecast, daily: {} }));
    await expect(getWeather(place)).rejects.toThrow(INVALID_RESPONSE_MESSAGE);
  });
});
