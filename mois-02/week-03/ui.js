// Everything that touches the page. No fetch, no storage.

/** Elements of the page, defined once. */
export const dom = {
  form: document.getElementById("search-form"),
  field: document.getElementById("name"),
  searchButton: document.querySelector("#search-form button"),
  suggestions: document.getElementById("suggestions"),
  pagination: document.getElementById("pagination"),
  prevButton: document.getElementById("prev"),
  nextButton: document.getElementById("next"),
  list: document.getElementById("pokemon-list"),
  result: document.getElementById("result"),
};

function makeElement(tag, text, className) {
  const element = document.createElement(tag);
  element.textContent = text;
  if (className) element.className = className;
  return element;
}

function fillPicture(card, picture, name) {
  const img = card.querySelector("img");
  const empty = card.querySelector(".no-img");

  if (picture) {
    img.src = picture;
    img.alt = name;
    empty.remove();
  } else {
    img.remove();
    empty.hidden = false;
  }
}

function fillTypes(card, types) {
  card
    .querySelector(".types")
    .append(...types.map((type) => makeElement("li", type)));
}

/**
 * Displays the card of a Pokémon in the result area.
 * @param {{id: number, name: string, picture: string|null, types: string[], height: number, weight: number}} pokemon
 *   Object produced by `formatPokemon`.
 */
export function displayCard(pokemon) {
  const card = document.getElementById("tpl-card").content.cloneNode(true);

  fillPicture(card, pokemon.picture, pokemon.name);
  fillTypes(card, pokemon.types);
  card.querySelector("h2").textContent = pokemon.name;
  card.querySelector(".number").textContent = `#${pokemon.id}`;
  card.querySelector(".measures").textContent =
    `${pokemon.height} m · ${pokemon.weight} kg`;

  dom.result.replaceChildren(card);
}

/**
 * Displays a message in the result area.
 * @param {string} text The message.
 * @param {boolean} [isError=false] If true, the message is shown in red.
 */
export function displayMessage(text, isError = false) {
  dom.result.replaceChildren(makeElement("p", text, isError ? "error" : ""));
}

/** Displays "Loading…" in the result area. */
export function displayLoading() {
  displayMessage("Loading…");
}

/**
 * Enables or disables the Search button (prevents duplicate requests).
 * @param {boolean} disabled
 */
export function setSearchDisabled(disabled) {
  dom.searchButton.disabled = disabled;
}

/**
 * Enables or disables the Previous / Next buttons.
 * @param {boolean} prevDisabled
 * @param {boolean} nextDisabled
 */
export function setPaginationDisabled(prevDisabled, nextDisabled) {
  dom.prevButton.disabled = prevDisabled;
  dom.nextButton.disabled = nextDisabled;
}

/**
 * Replaces the list of clickable names.
 * @param {string[]} names
 */
export function displayList(names) {
  dom.list.replaceChildren(
    ...names.map((name) => {
      const button = makeElement("button", name, "pokemon-link");
      button.type = "button";
      const li = document.createElement("li");
      li.append(button);
      return li;
    }),
  );
}

/**
 * Replaces the suggestions of the search field (empties them if `names` is empty).
 * @param {string[]} names
 */
export function displaySuggestions(names) {
  dom.suggestions.replaceChildren(
    ...names.map((name) => {
      const option = document.createElement("option");
      option.value = name;
      return option;
    }),
  );
}
