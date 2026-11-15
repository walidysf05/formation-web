// Remembers what was already loaded, saved in localStorage, with a lifetime
// (the weather changes). No fetch, no DOM.

const STORAGE_KEY_WEATHER = "meteo-cache"; // "lat,lon" => { savedAt, value }
const CACHE_MAX_AGE = 10 * 60 * 1000; // 10 minutes in milliseconds

function readStorage(storageKey) {
  try {
    const data = JSON.parse(localStorage.getItem(storageKey));
    return typeof data === "object" && data !== null ? data : {};
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
 * Is this cache entry still young enough?
 * @param {*} entry Entry `{ savedAt, value }` (anything else is "not fresh").
 * @param {number} maxAge Lifetime in milliseconds.
 * @param {number} [now=Date.now()] Current time (can be set for tests).
 * @returns {boolean}
 */
export function isFresh(entry, maxAge, now = Date.now()) {
  return typeof entry?.savedAt === "number" && now - entry.savedAt < maxAge;
}

/**
 * @typedef {Object} Cache
 * @property {(key: string) => boolean} has Is there a fresh value for this key?
 * @property {(key: string) => *} get Remembered value (only if `has` is true).
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
 * @returns {Cache}
 */
export function createCache(storageKey, maxAge) {
  const data = readStorage(storageKey);

  const has = (key) =>
    Object.hasOwn(data, key) &&
    isFresh(data[key], maxAge) &&
    Object.hasOwn(data[key], "value");
  const get = (key) => data[key].value;
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

  return { has, get, set, getOrLoad };
}

export const weatherCache = createCache(STORAGE_KEY_WEATHER, CACHE_MAX_AGE);
