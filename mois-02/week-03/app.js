// Entry point: connects api.js and ui.js, holds the state and sets the listeners.

import { getPokemon, getPokemonList, getAllNames, PAGE_SIZE } from "./api.js";
import { normalizeName } from "./pokemon.js";
import {
  dom,
  displayCard,
  displayMessage,
  displayLoading,
  displayList,
  displaySuggestions,
  setSearchDisabled,
  setPaginationDisabled,
} from "./ui.js";

const MIN_SUGGESTION_CHARS = 2;
const MAX_SUGGESTIONS = 5;
const EMPTY_FIELD_MESSAGE = "Enter a Pokémon name before searching.";

// Search

async function showPokemon(name) {
  displayLoading();
  setSearchDisabled(true);
  try {
    displayCard(await getPokemon(name));
  } catch (error) {
    displayMessage(error.message, true);
  } finally {
    setSearchDisabled(false);
  }
}

function handleSearchSubmit(event) {
  event.preventDefault();
  const name = normalizeName(dom.field.value);

  if (name === "") {
    displayMessage(EMPTY_FIELD_MESSAGE, true);
    return;
  }
  showPokemon(name);
}

// Suggestions

async function updateSuggestions() {
  const prefix = normalizeName(dom.field.value);

  if (prefix.length < MIN_SUGGESTION_CHARS) {
    displaySuggestions([]);
    return;
  }
  try {
    const names = await getAllNames();
    displaySuggestions(
      names.filter((name) => name.startsWith(prefix)).slice(0, MAX_SUGGESTIONS),
    );
  } catch {
    displaySuggestions([]); // on error, just show nothing
  }
}

// List + Previous / Next

let offset = 0;
let hasNext = false;

async function showPage(newOffset) {
  setPaginationDisabled(true, true);
  try {
    const page = await getPokemonList(newOffset);
    offset = newOffset;
    hasNext = page.next !== null;
    displayList(page.results.map((p) => p.name));
  } catch (error) {
    displayMessage(error.message, true);
  } finally {
    setPaginationDisabled(offset === 0, !hasNext);
  }
}

function handlePaginationClick(event) {
  if (event.target === dom.prevButton) showPage(offset - PAGE_SIZE);
  if (event.target === dom.nextButton) showPage(offset + PAGE_SIZE);
}

function handleListClick(event) {
  const link = event.target.closest(".pokemon-link");
  if (link) showPokemon(link.textContent);
}

// Listeners

dom.form.addEventListener("submit", handleSearchSubmit);
dom.field.addEventListener("input", updateSuggestions);
dom.pagination.addEventListener("click", handlePaginationClick);
dom.list.addEventListener("click", handleListClick);

showPage(0);
