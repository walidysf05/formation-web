// API calls only: they never touch the page.
// Errors are thrown; it is up to the caller to display them.

import { formatWeather, isCompleteWeather } from "./weather.js";

// Open-Meteo geocoding (no API key needed).
const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";
const MAX_RESULTS = 5;
const FORECAST_DAYS = 5;
const STATUS_BAD_REQUEST = 400;
const MAX_REASON_LENGTH = 200;
const REQUEST_TIMEOUT_MS = 10_000;
export const NETWORK_MESSAGE =
  "Network problem: check your connection and try again.";
export const INVALID_SEARCH_MESSAGE =
  "Invalid search. Modify the text and try again.";
export const INVALID_RESPONSE_MESSAGE =
  "The server has sent an unexpected response. Try again later.";
export const INVALID_COORDINATES_MESSAGE =
  "Invalid coordinates. Check the latitude and longitude.";

// Open-Meteo answers 400 with {"error": true, "reason": "..." }
// The reason is only LOGGED (technical, English, may change): the user sees our own message.
// Best effort: the body may not be JSON (proxy page), then we return null.
async function readErrorReason(response) {
  try {
    const reason = (await response.json())?.reason;
    return typeof reason === "string" && reason.trim()
      ? reason.trim().slice(0, MAX_REASON_LENGTH)
      : null;
  } catch {
    return null;
  }
}

// With fetch, a 400 or 500 is not an error: check response.ok before calling .json().
async function fetchJson(url, badRequestMessage) {
  let response;
  try {
    // The timeout aborts fetch: it rejects like a network failure.
    response = await fetch(url, {
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch {
    // fetch only rejects on a real network failure (or on our timeout)
    throw new Error(NETWORK_MESSAGE);
  }
  // Open-Meteo answers 400 when the parameters are invalid
  if (response.status === STATUS_BAD_REQUEST) {
    console.error("Open-Meteo 400:", await readErrorReason(response));
    throw new Error(badRequestMessage);
  }
  if (!response.ok) {
    throw new Error(
      `Server error (${response.status}). Please try again later.`,
    );
  }
  try {
    // "return await" (not "return"): otherwise the catch below never runs.
    return await response.json();
  } catch (error) {
    // The timeout can also fire while the body is being read: same as a network failure.
    if (error?.name === "TimeoutError") throw new Error(NETWORK_MESSAGE);
    // 200 with a non-JSON or truncated body (proxy page, connection cut)
    throw new Error(INVALID_RESPONSE_MESSAGE);
  }
}

/**
 * Searches cities by name.
 * @param {string} name Text typed by the user (already trimmed).
 * @returns {Promise<Array>} The cities, or [] when nothing was found.
 * @throws {Error} Readable message: network down, invalid search, server error
 *   or unexpected response.
 */
export async function searchCities(name) {
  // encodeURIComponent: "Saint-Étienne" => "Saint-%C3%89tienne"
  const url = `${GEOCODING_URL}?name=${encodeURIComponent(name)}&count=${MAX_RESULTS}&language=en`;
  const data = await fetchJson(url, INVALID_SEARCH_MESSAGE);

  // Not an object (null, text, array) or "results" that is not an array: broken answer.
  if (data === null || typeof data !== "object" || Array.isArray(data)) {
    throw new Error(INVALID_RESPONSE_MESSAGE);
  }
  // Unknown city: the API answers 200 WITHOUT "results": [] is not an error.
  if (data.results === undefined) return [];
  if (!Array.isArray(data.results)) throw new Error(INVALID_RESPONSE_MESSAGE);
  return data.results;
}

/**
 * Gets the current weather and the 5-day forecast of a place.
 * @param {{latitude: number, longitude: number}} place A city of `searchCities`.
 * @returns {Promise<ReturnType<typeof formatWeather>>} The formatted weather.
 * @throws {Error} Readable message: network down, invalid coordinates, server error
 *   or unexpected response (including an answer without temperature, wind or forecast).
 */
export async function getWeather(place) {
  const params = new URLSearchParams({
    latitude: place.latitude,
    longitude: place.longitude,
    current: "temperature_2m,wind_speed_10m,weather_code",
    daily: "weather_code,temperature_2m_max,temperature_2m_min",
    timezone: "auto", // required with "daily"; dates are those of the place
    forecast_days: FORECAST_DAYS,
  });
  const weather = formatWeather(
    await fetchJson(`${FORECAST_URL}?${params}`, INVALID_COORDINATES_MESSAGE),
  );
  // An answer without temperature is as useless as a broken one.
  if (!isCompleteWeather(weather)) throw new Error(INVALID_RESPONSE_MESSAGE);
  return weather;
}
