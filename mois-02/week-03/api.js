// API calls only: they never touch the page.
// Errors are thrown; it is up to the caller to display them.

import { formatPokemon } from "./pokemon.js";
import { pokemonCache, pageCache, namesCache } from "./cache.js";

const API_URL = "https://pokeapi.co/api/v2";
const STATUS_NOT_FOUND = 404;
const NAMES_KEY = "names";
const MAX_NAMES = 2000;

/** Number of Pokémon per page of the list. */
export const PAGE_SIZE = 20;

// With fetch, a 404 is not an error: check response.ok before calling .json().
async function fetchJson(url, notFoundMessage) {
  let response;
  try {
    response = await fetch(url);
  } catch {
    // fetch only rejects on a real network failure
    throw new Error("Network problem: check your connection and try again.");
  }
  if (response.status === STATUS_NOT_FOUND) {
    throw new Error(notFoundMessage);
  }
  if (!response.ok) {
    throw new Error(
      `Server error (${response.status}). Please try again later.`,
    );
  }
  return response.json();
}

/**
 * Gets one Pokémon (from the cache if it is already there).
 * @param {string} name Already normalized name, e.g. "mr-mime".
 * @returns {Promise<ReturnType<typeof formatPokemon>>} The formatted Pokémon.
 * @throws {Error} Readable message: network down, Pokémon not found or server error.
 */
export function getPokemon(name) {
  return pokemonCache.getOrLoad(name, async () =>
    formatPokemon(
      await fetchJson(
        `${API_URL}/pokemon/${encodeURIComponent(name)}`,
        `Pokémon "${name}" not found. Check the spelling.`,
      ),
    ),
  );
}

/**
 * Gets one page of the Pokémon list (from the cache if possible).
 * @param {number} offset Position of the first Pokémon of the page (0, 20, 40…).
 * @returns {Promise<{next: string|null, results: {name: string}[]}>} Raw data of the page.
 * @throws {Error} Readable message: network down, page not found or server error.
 */
export function getPokemonList(offset) {
  return pageCache.getOrLoad(offset, () =>
    fetchJson(
      `${API_URL}/pokemon?limit=${PAGE_SIZE}&offset=${offset}`,
      "This page does not exist.",
    ),
  );
}

async function loadAllNames() {
  const data = await fetchJson(
    `${API_URL}/pokemon?limit=${MAX_NAMES}`,
    "Name list not found.",
  );
  return data.results.map((p) => p.name);
}

// The promise is stored, so fast typing never triggers several identical requests.
let namesPromise = null;

/**
 * Gets the names of all the Pokémon, for autocomplete.
 * The list is loaded only once, then kept in localStorage.
 * @returns {Promise<string[]>} All the names.
 * @throws {Error} On failure; a new call can try again.
 */
export function getAllNames() {
  namesPromise ??= namesCache
    .getOrLoad(NAMES_KEY, loadAllNames, Array.isArray)
    .catch((error) => {
      namesPromise = null; // allow a retry on the next keystroke
      throw error;
    });
  return namesPromise;
}
