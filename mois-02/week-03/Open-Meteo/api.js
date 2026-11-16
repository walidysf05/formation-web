// API calls only: they never touch the page.
// Errors are thrown; it is up to the caller to display them.

import { formatWeather, isCompleteWeather } from "./weather.js";
import { weatherCache } from "./cache.js";

// Open-Meteo (no API key needed).
const API_URL = "https://api.open-meteo.com/v1/forecast";
const STATUS_BAD_REQUEST = 400;
const MAX_REASON_LENGTH = 200;
export const INVALID_COORDINATES_MESSAGE =
  "Invalid coordinates. Check the latitude and longitude.";
export const INVALID_RESPONSE_MESSAGE =
  "The server sent an unexpected response. Please try again later.";

// Open-Meteo aswers 400 with { "error": true, "reason": "..."}
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
    throw new Error((await readErrorReason(response)) ?? badRequestMessage);
  }
  if (!response.ok) {
    throw new Error(
      `Server error (${response.status}). Please try again later.`,
    );
  }
  try {
    // "return await" (not "return"): otherwise the catch below never runs
    return await response.json();
  } catch {
    // 200 with a non-JSON or truncated body (proxy page , connection cut)
    throw new Error(INVALID_RESPONSE_MESSAGE);
  }
}
async function loadWeather(place) {
  const params = new URLSearchParams({
    latitude: place.latitude,
    longitude: place.longitude,
    current: "temperature_2m",
    timezone: "auto", // times in the local time of the place
  });
  const weather = formatWeather(
    await fetchJson(`${API_URL}?${params}`, INVALID_COORDINATES_MESSAGE),
  );
  // An answer without a temperature is a useless as a broken one.
  if (!isCompleteWeather(weather)) throw new Error(INVALID_RESPONSE_MESSAGE);
  return weather;
}

const cacheKey = (place) => `${place.latitude},${place.longitude}`;

/**
 * Gets the current weather of a place (from the cache if it is still fresh).
 * @param {{latitude: number, longitude: number}} place
 * @param {{force?: boolean}} [options] `force: true` ignores the cache.
 * @returns {Promise<ReturnType<typeof formatWeather>>} The formatted weather.
 * @throws {Error} Readable message: network down, invalid coordinates , server error
 *   or unexpected response.
 */
export function getWeather(place, { force = false } = {}) {
  return weatherCache.getOrLoad(cacheKey(place), () => loadWeather(place), {
    force,
    // only cache a complete answer
    shouldCache: isCompleteWeather,
  });
}

/**
 * Last saved weather of a place, however old, or null. Never calls the network.
 * Used to still show something when a refresh fails.
 * @param {{latitude: number, longitude: number}} place
 * @returns {{value: ReturnType<typeof formatWeather>, savedAt: number}|null}
 */
export function getCachedWeather(place) {
  return weatherCache.peek(cacheKey(place));
}

