// Everything that touches the page. No fetch.

import { formatDay, formatValue } from "./weather.js";

let cachedDom = null;

/**
 * Elements of the page, looked up once, on the first call (not at import time:
 * the module can be imported without a page).
 */
export function getDom() {
  cachedDom ??= {
    form: document.getElementById("search-form"),
    input: document.getElementById("city-input"),
    searchButton: document.getElementById("search-button"),
    message: document.getElementById("message"),
    results: document.getElementById("results"),
    weather: document.getElementById("weather"),
  };
  return cachedDom;
}

function makeParagraph(text, isError) {
  const paragraph = document.createElement("p");
  paragraph.textContent = text; // textContent, never innerHTML
  if (isError) {
    paragraph.className = "error";
    paragraph.setAttribute("role", "alert"); // announced at once by screen readers
  }
  return paragraph;
}

// Region and country may be missing: keep only ones that exist.
function formatPlace(city) {
  return [city.admin1, city.country].filter(Boolean).join(", ");
}

/**
 * Displays a message under the form (replaces the previous one).
 * @param {string} text
 * @param {boolean} [isError=false] if true, the message is shown in red.
 */
export function displayMessage(text, isError = false) {
  getDom().message.replaceChildren(makeParagraph(text, isError));
}

export function clearMessage() {
  getDom().message.replaceChildren();
}

export function displayLoading() {
  displayMessage("Loading...");
}

/** Enables or disables the Search button (prevents duplicate requests). */
export function setSearchDisabled(disabled) {
  getDom().searchButton.disabled = disabled;
}

/**
 * Displays the list: name, region, country.
 * Each button carries its position in `data-index`: the single listener
 * on the list uses it to find the city.
 * @param {Array} cities Results of the API.
 */
export function displayCities(cities) {
  const template = document.getElementById("tpl-city");
  const items = cities.map((city, index) => {
    const item = template.content.cloneNode(true);
    item.querySelector("button").dataset.index = index;
    item.querySelector(".city-name").textContent = city.name;
    item.querySelector(".city-place").textContent = formatPlace(city);
    return item;
  });
  getDom().results.replaceChildren(...items);
}

export function clearResults() {
  getDom().results.replaceChildren();
}

/** Highlights one city of the list, and only that one. */
export function markSelected(index) {
  for (const button of getDom().results.querySelectorAll(".city")) {
    const isSelected = Number(button.dataset.index) === index;
    button.classList.toggle("selected", isSelected);
    button.setAttribute("aria-pressed", String(isSelected));
  }
}

/** Displays a message (loading, error) in the weather area. */
export function displayWeatherMessage(text, isError = false) {
  getDom().weather.replaceChildren(makeParagraph(text, isError));
}

export function displayWeatherLoading() {
  displayWeatherMessage("Loading...");
}

export function clearWeather() {
  getDom().weather.replaceChildren();
}

/**
 * Displays the weather card: current weather + one line per forecast day.
 * @param {{name: string, admin1?: string, country?: string}} city
 * @param {ReturnType<import("./weather.js").formatWeather>} weather
 */
export function displayWeather(city, weather) {
  const card = document.getElementById("tpl-weather").content.cloneNode(true);
  const place = formatPlace(city);

  card.querySelector("h2").textContent = place ? `${city.name} (${place})` : city.name;
  card.querySelector(".temperature").textContent = formatValue(
    weather.temperature,
    weather.temperatureUnit,
  );
  card.querySelector(".description").textContent = weather.description;
  card.querySelector(".wind").textContent =
    `Wind: ${formatValue(weather.windSpeed, weather.windUnit)}`;

  const dayTemplate = document.getElementById("tpl-day");
  const days = weather.days.map((day, index) => {
    const item = dayTemplate.content.cloneNode(true);
    // day 0 of the API is today
    item.querySelector(".day").textContent =
      index === 0 ? "Today" : formatDay(day.date);
    item.querySelector(".day-description").textContent = day.description;
    item.querySelector(".range").textContent =
      `min ${formatValue(day.min, weather.temperatureUnit)} · max ${formatValue(day.max, weather.temperatureUnit)}`;
    return item;
  });
  card.querySelector(".forecast").replaceChildren(...days);

  getDom().weather.replaceChildren(card);
}
