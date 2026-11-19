// Everything that touches the page. No fetch;

/** Elements of the page, defined once. */
export const dom = {
  form: document.getElementById("search-form"),
  input: document.getElementById("city-input"),
  searchButton: document.getElementById("search-button"),
  message: document.getElementById("message"),
  results: document.getElementById("results"),
  selection: document.getElementById("selection"),
};

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
  const paragraph = document.createElement("p");
  paragraph.textContent = text; // textContent, never innerHTML
  if (isError) paragraph.className = "error";
  dom.message.replaceChildren(paragraph);
}

export function clearMessage() {
  dom.message.replaceChildren();
}

export function displayLoading() {
  displayMessage("Loading...");
}

/** Enables or disables the Search button (prevents duplicate requests). */
export function setSearchDisabled(disabled) {
  dom.searchButton.disabled = disabled;
}

/**
 * displays the list: name, region, country.
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
  dom.results.replaceChildren(...items);
}

export function clearResults() {
  dom.results.replaceChildren();
}

/** Highlights one city of the list, and only that one. */
export function markSelected(index) {
  for (const button of dom.results.querySelectorAll(".city")) {
    const isSelected = Number(button.dataset.index) === index;
    button.classList.toggle("selected", isSelected);
    button.setAttribute("aria-pressed", String(isSelected));
  }
}

export function displaySelection(city) {
  const place = formatPlace(city);
  dom.selection.textContent = place
    ? `Selected city : ${city.name} (${place})`
    : `Selected city : ${city.name}`;
}

export function clearSelection() {
  dom.selection.textContent = "";
}
