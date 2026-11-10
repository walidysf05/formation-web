// With fetch, a 404 is not considered an error. You must check response.ok (or response.status) before calling .json().
// fetchJson does this: a dedicated message for 404, then a generic one for any other !response.ok.

const API_URL = "https://pokeapi.co/api/v2";
const PAGE_SIZE = 20;

// STEP 1 - formatPokemon: API JSON -> simple object

function formatPokemon(data) {
  return {
    id: data.id,
    name: data.name,
    picture: data.sprites?.front_default ?? null, // null if missing
    types: data.types.map((t) => t.type.name),
    height: data.height / 10, // decimetres => metres
    weight: data.weight / 10, // hectograms => kg
  };
}

// STEP 2 - API calls with async / await + a cache saved in localStorage
// Two objects remember what was already loaded, so the API is never called twice for the same data.
// They are saved in localStorage, so they also survive a page reload.
// Object.hasOwn(obj, key) is used instead of `key in obj` so that a name like "constructor" is not a false hit.

function loadCache(key) {
  try {
    const data = JSON.parse(localStorage.getItem(key));
    return typeof data === "object" && data !== null ? data : {};
  } catch {
    return {}; // localStorage unavailable or corrupted: start empty
  }
}

function saveCache(key, cache) {
  try {
    localStorage.setItem(key, JSON.stringify(cache));
  } catch {
    // storage full or blocked: the in-memory cache still works
  }
}

const pokemonCache = loadCache("pokedex-pokemon"); // name => formatted Pokémon
const pageCache = loadCache("pokedex-pages"); // offset => API data for that page

async function fetchJson(url, notFoundMessage) {
  let response;
  try {
    response = await fetch(url);
  } catch {
    // fetch only rejects on a real network failure
    throw new Error("Network problem: check your connection and try again.");
  }
  if (response.status === 404) {
    throw new Error(notFoundMessage);
  }
  if (!response.ok) {
    throw new Error(
      `Server error (${response.status}). Please try again later.`,
    );
  }
  return response.json();
}

async function getPokemon(name) {
  if (Object.hasOwn(pokemonCache, name)) return pokemonCache[name];

  const data = await fetchJson(
    `${API_URL}/pokemon/${encodeURIComponent(name)}`,
    `Pokémon "${name}" not found. Check the spelling.`,
  );
  const pokemon = formatPokemon(data);
  pokemonCache[name] = pokemon;
  saveCache("pokedex-pokemon", pokemonCache);
  return pokemon;
}

async function getPage(offset) {
  if (Object.hasOwn(pageCache, offset)) return pageCache[offset];

  const data = await fetchJson(
    `${API_URL}/pokemon?limit=${PAGE_SIZE}&offset=${offset}`,
    "This page does not exist.",
  );
  pageCache[offset] = data;
  saveCache("pokedex-pages", pageCache);
  return data;
}

// STEP 3 - display the result as a card

function displayCard(p) {
  const card = document.getElementById("tpl-card").content.cloneNode(true);
  const img = card.querySelector("img");
  const empty = card.querySelector(".no-img");

  if (p.picture) {
    img.src = p.picture;
    img.alt = p.name;
    empty.remove();
  } else {
    img.remove();
    empty.hidden = false;
  }
  card.querySelector("h2").textContent = p.name;
  card.querySelector(".number").textContent = `#${p.id}`;
  p.types.forEach((type) => {
    const li = document.createElement("li");
    li.textContent = type;
    card.querySelector(".types").append(li);
  });
  card.querySelector(".measures").textContent =
    `${p.height} m · ${p.weight} kg`;

  document.getElementById("result").replaceChildren(card);
}

function displayMessage(text, isError = false) {
  const p = document.createElement("p");
  if (isError) p.className = "error";
  p.textContent = text;
  document.getElementById("result").replaceChildren(p);
}

// STEP 4 - search form

const field = document.getElementById("name");
const searchButton = document.querySelector("#search-form button");

async function showPokemon(name) {
  displayMessage("Loading…");
  searchButton.disabled = true; // prevents duplicate requests
  try {
    displayCard(await getPokemon(name));
  } catch (err) {
    displayMessage(err.message, true);
  } finally {
    searchButton.disabled = false;
  }
}

document.getElementById("search-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  // Clean the input
  const name = field.value.trim().toLowerCase().replace(/\s+/g, "-");

  if (name === "") {
    displayMessage("Enter a Pokémon name before searching.", true);
    return;
  }
  showPokemon(name);
});

// Autocomplete suggestions
// All Pokémon names are fetched once (about 1300) and kept in localStorage.
// The promise is stored, so fast typing never triggers several identical requests.

const suggestions = document.getElementById("suggestions");
let namesPromise = null;

function getAllNames() {
  if (namesPromise) return namesPromise;

  const cached = loadCache("pokedex-names");
  if (Array.isArray(cached.names)) {
    namesPromise = Promise.resolve(cached.names);
    return namesPromise;
  }

  namesPromise = fetchJson(
    `${API_URL}/pokemon?limit=2000`,
    "Name list not found.",
  )
    .then((data) => {
      const names = data.results.map((p) => p.name);
      saveCache("pokedex-names", { names });
      return names;
    })
    .catch((err) => {
      namesPromise = null; // allow a retry on the next keystroke
      throw err;
    });
  return namesPromise;
}

field.addEventListener("input", async () => {
  const text = field.value.trim().toLowerCase().replace(/\s+/g, "-");

  if (text.length < 2) {
    suggestions.replaceChildren(); // too short: no suggestions
    return;
  }

  try {
    const names = await getAllNames();
    const matches = names.filter((n) => n.startsWith(text)).slice(0, 5);
    suggestions.replaceChildren(
      ...matches.map((name) => {
        const option = document.createElement("option");
        option.value = name;
        return option;
      }),
    );
  } catch {
    suggestions.replaceChildren(); // on error, just show nothing
  }
});

// STEP 5 - list + Previous / Next

const list = document.getElementById("pokemon-list");
const prevButton = document.getElementById("prev");
const nextButton = document.getElementById("next");
let offset = 0;
let hasNext = false;

async function showPage(newOffset) {
  prevButton.disabled = true;
  nextButton.disabled = true;
  try {
    const page = await getPage(newOffset);
    offset = newOffset;
    hasNext = page.next !== null;
    list.replaceChildren(
      ...page.results.map(({ name }) => {
        const li = document.createElement("li");
        const button = document.createElement("button");
        button.type = "button";
        button.className = "pokemon-link";
        button.textContent = name;
        li.append(button);
        return li;
      }),
    );
  } catch (err) {
    displayMessage(err.message, true);
  } finally {
    prevButton.disabled = offset === 0; // disabled on the first page
    nextButton.disabled = !hasNext; // disabled on the last page
  }
}

document.getElementById("pagination").addEventListener("click", (e) => {
  if (e.target === prevButton) showPage(offset - PAGE_SIZE);
  if (e.target === nextButton) showPage(offset + PAGE_SIZE);
});

// Click on a name => show its card
list.addEventListener("click", (e) => {
  const link = e.target.closest(".pokemon-link");
  if (link) showPokemon(link.textContent);
});

showPage(0);
