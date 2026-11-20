// Entry point: connects api.js and ui.js and sets the listeners.

import { searchCities, getWeather } from "./api.js";
import {
  getDom,
  displayMessage,
  clearMessage,
  displayLoading,
  setSearchDisabled,
  displayCities,
  clearResults,
  markSelected,
  displayWeather,
  displayWeatherMessage,
  displayWeatherLoading,
  clearWeather,
} from "./ui.js";

const dom = getDom();
const MIN_SEARCH_LENGTH = 2;

let cities = []; // the cities shown in the list
// The only guard against duplicate searches (works for click AND Enter).
// The disabled button is just visual feedback.
let isSearching = false;
let weatherRequestId = 0; // identifies the LAST weather request

function resetResults() {
  cities = [];
  weatherRequestId++; // a weather answer still on its way must not be displayed
  clearResults();
  clearWeather();
}

async function handleSearchSubmit(event) {
  event.preventDefault(); // no page reload
  if (isSearching) return; // double click or double Enter

  // trim + several inner spaces => one space ("La    Rochelle" => "La Rochelle")
  const name = dom.input.value.trim().replace(/\s+/g, " ");
  dom.input.value = name; // the field is rewritten cleanly
  // Validate BEFORE resetResults(): an invalid submit keeps the list and the weather.
  if (name === "") {
    displayMessage("Enter a city name."); // no request for an empty field
    return;
  }
  if (name.length < MIN_SEARCH_LENGTH) {
    displayMessage("Enter at least 2 letters."); // no request either
    return;
  }

  resetResults();
  isSearching = true;
  displayLoading();
  setSearchDisabled(true);
  try {
    cities = await searchCities(name);
    if (cities.length === 0) {
      displayMessage(`No results found for "${name}".`);
    } else {
      clearMessage();
      displayCities(cities);
    }
  } catch (error) {
    displayMessage(error.message, true);
  } finally {
    isSearching = false;
    setSearchDisabled(false);
    dom.input.focus(); // a disabled button loses the keyboard focus
  }
}

// One listener for the whole list (event delegation).
async function handleResultsClick(event) {
  const button = event.target.closest("button[data-index]");
  if (!button) return;

  const index = Number(button.dataset.index);
  const city = cities[index];
  if (!city) return;

  markSelected(index);
  displayWeatherLoading();

  // If the user clicks city A then city B, A's answer may arrive AFTER B's:
  // only the answer of the last click is displayed.
  const requestId = ++weatherRequestId;
  try {
    const weather = await getWeather(city);
    if (requestId !== weatherRequestId) return;
    displayWeather(city, weather);
  } catch (error) {
    if (requestId !== weatherRequestId) return;
    displayWeatherMessage(error.message, true);
  }
}

// Listeners
// "submit" covers the click on the button AND the Enter key.
// No "input" listener: we never call API on every letter typed.

dom.form.addEventListener("submit", handleSearchSubmit);
dom.results.addEventListener("click", handleResultsClick);
