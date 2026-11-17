// Remembers what was already loaded, saved in localStorage, with a lifetime
// (the weather changes). No fetch, no DOM.

import { isCompleteWeather } from "./weather.js";

const STORAGE_KEY_WEATHER = "meteo-cache"; // "lat,lon" => { savedAt, value }
const CACHE_MAX_AGE = 10 * 60 * 1000; // 10 minutes in milliseconds

function readStorage(storageKey) {
  try {
    const data = JSON.parse(localStorage.getItem(storageKey));
    // a plain object only : null , numbers, strings and arrays
    return typeof data === "object" && data !== null && !Array.isArray(data) 
    ? data 
    :{};
  } catch {
    return {}; // localStorage unavailable or corrupted: start empty
  }
}

function writeStorage(storageKey, data) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(data));
  } catch {
    // storage full or blocked: the in-memory cache still works
  }
}

/**
 * Is the timestamp of this entry believable? A missing, non-numeric or future
 * `savedAt` (clock changed, hand-edited storage) is not.
 * @param {*} entry Entry `{ savedAt, value }`.
 * @param {number} [now=Date.now()] Current time (can be set for tests).
 * @returns {boolean}
 */
export function hasValidTimestamp(entry, now = Date.now()) {
  return Number.isFinite(entry?.savedAt) && now - entry.savedAt >= 0;
}

/**
 * Is this cache entry still young enough?
 * @param {*} entry Entry `{ savedAt, value }` (anything else is "not fresh").
 * @param {number} maxAge Lifetime in milliseconds.
 * @param {number} [now=Date.now()] Current time (can be set for tests).
 * @returns {boolean}
 */
export function isFresh(entry, maxAge, now = Date.now()) {
  return hasValidTimestamp(entry, now) && now - entry.savedAt < maxAge;
}

/**
 * @typedef {Object} Cache
 * @property {(key: string) => boolean} has Is there a fresh value for this key?
 * @property {(key: string) => *} get Remembered value (only if `has` is true).
 * @property {(key: string) => ({value: *, savedAt: number}|null)} peek
 *   Well-formed entry of any age (for a fallback when the network fails), or null.
 * @property {(key: string, value: *) => void} set Remembers and saves.
 * @property {(key: string, load: () => Promise<*>, options?: {force?: boolean, shouldCache?: (value: *) => boolean}) => Promise<*>} getOrLoad
 *   Returns the fresh remembered value, otherwise calls `load`, remembers its result if
 *   `shouldCache` accepts it, and returns it. `force: true` ignores the cache.
 */

/**
 * Creates a cache saved in localStorage under `storageKey`.
 * `Object.hasOwn` is used so that a key like "constructor" is not a false hit.
 * @param {string} storageKey localStorage key.
 * @param {number} maxAge Lifetime of an entry, in milliseconds.
 * @param {{isValid?: (value: *) => boolean}} [options]
 *   `isValid` is checked when reading: a stored value of the wrong shape is
 *   treated as missing and removed.
 * @returns {Cache}
 */
export function createCache(storageKey, maxAge, { isValid = () => true} = {}) {
  const data = readStorage(storageKey);

    const isWellFormed = (entry) =>
    hasValidTimestamp(entry) &&
    Object.hasOwn(entry, "value") &&
    isValid(entry.value);

  const peek = (key) => {
    if (!Object.hasOwn(data, key)) return null;
    const entry = data[key];
    if (!isWellFormed(entry)) {
      // malformed (not merely expired): drop it, the next fetch rewrites it
      delete data[key];
      writeStorage(storageKey, data);
      return null;
    }
    return { value: entry.value, savedAt: entry.savedAt };
  };

  const has = (key) => {
    const entry = peek(key);
    return entry !== null && isFresh(entry, maxAge);
  };
  const get = (key) => peek(key)?.value;
  const set = (key, value) => {
    data[key] = { savedAt: Date.now(), value };
    writeStorage(storageKey, data);
  };

  async function getOrLoad(
    key,
    load,
    { force = false, shouldCache = () => true } = {},
  ) {
    if (!force && has(key)) return get(key);
    const value = await load(); // an error here is never remembered
    if (shouldCache(value)) set(key, value);
    return value;
  }

  return { has, get, peek, set, getOrLoad };
}

export const weatherCache = createCache(STORAGE_KEY_WEATHER, CACHE_MAX_AGE, {
  isValid: isCompleteWeather,
});
