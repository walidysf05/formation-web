// Remembers what was already loaded, saved in localStorage
// (so it also survives a page reload). No fetch, no DOM.

const STORAGE_KEY_POKEMON = "pokedex-pokemon"; // name => formatted Pokémon
const STORAGE_KEY_PAGES = "pokedex-pages"; // offset => data of that page
const STORAGE_KEY_NAMES = "pokedex-names"; // "names" => all the names

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
 * @typedef {Object} Cache
 * @property {(key: string|number) => boolean} has Is the key already remembered?
 * @property {(key: string|number) => *} get Remembered value (or `undefined`).
 * @property {(key: string|number, value: *) => void} set Remembers and saves.
 * @property {(key: string|number, load: () => Promise<*>, isValid?: (value: *) => boolean) => Promise<*>} getOrLoad
 *   Returns the remembered value, otherwise calls `load`, remembers its result and returns it.
 */

/**
 * Creates a cache saved in localStorage under `storageKey`.
 * `Object.hasOwn` is used so that a name like "constructor" is not a false hit.
 * @param {string} storageKey localStorage key.
 * @returns {Cache}
 */
export function createCache(storageKey) {
  const data = readStorage(storageKey);

  const has = (key) => Object.hasOwn(data, key);
  const get = (key) => data[key];
  const set = (key, value) => {
    data[key] = value;
    writeStorage(storageKey, data);
  };

  async function getOrLoad(key, load, isValid = () => true) {
    if (has(key) && isValid(get(key))) return get(key);
    const value = await load(); // an error here is never remembered
    set(key, value);
    return value;
  }

  return { has, get, set, getOrLoad };
}

export const pokemonCache = createCache(STORAGE_KEY_POKEMON);
export const pageCache = createCache(STORAGE_KEY_PAGES);
export const namesCache = createCache(STORAGE_KEY_NAMES);
