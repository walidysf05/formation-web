// Entry point: connects api.js and ui.js and sets the listners.

import { searchCities } from "./api.js";
import {
  dom,
  displayMessage,
  clearMessage,
  displayLoading,
  setSearchDisabled,
  displayCities,
  clearResults,
  markSelected,
  displaySelection,
  clearSelection,
} from "./ui.js";

let cities = []; // the cities shown in the list
let selectedCity = null; // the chosen city
let isSearching = false;

function resetResults() {
  cities = [];
  selectedCity = null;
  clearResults();
  clearSelection();
}

async function handleSearchSubmit(event) {
  event.preventDefault(); // no page reload
  if (isSearching) return; // double click or double Enter

  const name = dom.input.value.trim();
  resetResults();
  if (name === "") {
    displayMessage("Enter a city name."); // no request for an empty field
    return;
  }

  isSearching = true;
  displayLoading();
  setSearchDisabled(true);
  try {
    cities = await searchCities(name);
    if (cities.length === 0) {
      displayMessage("No results found.");
    } else {
      clearMessage();
      displayCities(cities);
    }
  } catch (error) {
    displayMessage(error.message, true);
  } finally {
    isSearching = false;
    setSearchDisabled(false);
  }
}

// One Listener for the whole list (event delegation).
function handleResultsClick(event) {
  const button = event.target.closest("button[data-index]");
  if (!button) return;

  const index = Number(button.dataset.index);
  selectedCity = cities[index];
  markSelected(index);
  displaySelection(selectedCity);
}

// Listeners
// "submit" covers the click on the button AND the Enter key.
// No "input" listener: we never call API on every letter typed.

dom.form.addEventListener("submit", handleSearchSubmit);
dom.results.addEventListener("click", handleResultsClick);
