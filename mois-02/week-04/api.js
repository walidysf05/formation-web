// API calls only: they never touch the page.
// Errors are thrown; it is up the caller to display them.

// Open-Meteo geocoding ( no API key needed).
const API_URL = "https://geocoding-api.open-meteo.com/v1/search";
const MAX_RESULTS = 5;
const STATUS_BAD_REQUEST = 400;
const MAX_REASON_LENGTH = 200;
export const NETWORK_MESSAGE =
  "Network problem: check your connection and try again.";
export const INVALID_SEARCH_MESSAGE =
  "Invalid search. Modify the text and try again.";
export const INVALID_RESPONSE_MESSAGE =
  "The server has sent an unexpected response. Try again later.";

// Open-Meteo answers 400 with {"error": true, "reason": "..." }
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
    response = await fetch(url);
  } catch {
    // fetch only rejects on a real network failure
    throw new Error(NETWORK_MESSAGE);
  }
  // Open-Meteo answers 400 when the parameters are invalid
  if (response.status === STATUS_BAD_REQUEST) {
    throw new Error((await readErrorReason(response)) ?? badRequestMessage);
  }
  if (!response.ok) {
    throw new Error(
      `Server error (${response.status}). Please try again later.`,
    );
  }
  try {
    // "return await" (not "return"): otherwise the catch below never runs.
    return await response.json();
  } catch {
    // 200 with a non-JSON or truncated body (proxy page, connection cut )
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
  const url = `${API_URL}?name=${encodeURIComponent(name)}&count=${MAX_RESULTS}&language=fr`;
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
