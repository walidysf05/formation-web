// API calls only: they never touch the page.
// Errors are thrown; it is up to the caller to display them.

import { formatWeather } from "./weather.js";
import { weatherCache } from "./cache.js";

// Open-Meteo (no API key needed).
const API_URL = "https://api.open-meteo.com/v1/forecast";
const STATUS_BAD_REQUEST = 400;
const INVALID_COORDINATES_MESSAGE =
  "Invalid coordinates. Check the latitude and longitude.";

// With fetch, a 400 or 404 is not an error: check response.ok before calling .json().
async function fetchJson(url, badRequestMessage) {
  let response;
  try {
    response = await fetch(url);
  } catch {
    // fetch only rejects on a real network failure
    throw new Error("Network problem: check your connection and try again.");
  }
  // Open-Meteo answers 400 when the parameters are invalid (e.g. latitude 200)
  if (response.status === STATUS_BAD_REQUEST) {
    throw new Error(badRequestMessage);
  }
  if (!response.ok) {
    throw new Error(
      `Server error (${response.status}). Please try again later.`,
    );
  }
  return response.json();
}

async function loadWeather(place) {
  const params = new URLSearchParams({
    latitude: place.latitude,
    longitude: place.longitude,
    current: "temperature_2m",
    timezone: "auto", // times in the local time of the place
  });
  return formatWeather(
    await fetchJson(`${API_URL}?${params}`, INVALID_COORDINATES_MESSAGE),
  );
}

/**
 * Gets the current weather of a place (from the cache if it is still fresh).
 * @param {{latitude: number, longitude: number}} place
 * @param {{force?: boolean}} [options] `force: true` ignores the cache.
 * @returns {Promise<ReturnType<typeof formatWeather>>} The formatted weather.
 * @throws {Error} Readable message: network down, invalid coordinates or server error.
 */
export function getWeather(place, { force = false } = {}) {
  return weatherCache.getOrLoad(
    `${place.latitude},${place.longitude}`,
    () => loadWeather(place),
    {
      force,
      // only cache a complete answer
      shouldCache: (weather) => weather.temperature !== null,
    },
  );
}
