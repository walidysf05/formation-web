
// With fetch, a 404 is not considered an error. You must check response.ok (or response.status) before calling .json().
// getPokemon does this: a dedicated message for 404, then a generic one for any other !response.ok.


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

// STEP 2 - getPokemon: API call with async / await

async function getPokemon(name) {
  let response;
  try {
    response = await fetch(
      `https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(name)}`,
    );
  } catch {
    // fetch only rejects on a real network failure
    throw new Error("Network problem: check your connection and try again.");
  }
  if (response.status === 404) {
    throw new Error(`Pokémon "${name}" not found. Check the spelling.`);
  }
  if (!response.ok) {
    throw new Error(`Server error (${response.status}). Please try again later.`);
  }
  return formatPokemon(await response.json());
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
  card.querySelector(".measures").textContent = `${p.height} m · ${p.weight} kg`;

  document.getElementById("result").replaceChildren(card);
}

// STEP 4 - search form

const field = document.getElementById("name");
const button = document.querySelector("#search-form button");

function displayMessage(text, isError = false) {
  const p = document.createElement("p");
  if (isError) p.className = "error";
  p.textContent = text;
  document.getElementById("result").replaceChildren(p);
}

document.getElementById("search-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  // Clean the input
  const name = field.value.trim().toLowerCase().replace(/\s+/g, "-");

  if (name === "") {
    displayMessage("Enter a Pokémon name before searching.", true);
    return;
  }

  displayMessage("Loading…");
  button.disabled = true; // prevents duplicate requests
  try {
    displayCard(await getPokemon(name));
  } catch (err) {
    displayMessage(err.message, true);
  } finally {
    button.disabled = false;
  }
});
