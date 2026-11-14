// Tests with console.assert, run by tests.html.

import { formatPokemon, normalizeName } from "./pokemon.js";

const SPRITES_URL =
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/";
const spriteUrl = (id) => `${SPRITES_URL}${id}.png`;

let failures = 0;

function check(condition, message) {
  console.assert(condition, message);
  if (!condition) failures++;
}

const jsonNormal = {
  id: 25,
  name: "pikachu",
  height: 4,
  weight: 60,
  sprites: { front_default: spriteUrl(25) },
  types: [{ type: { name: "electric" } }],
};
const jsonTwoTypes = {
  id: 6,
  name: "charizard",
  height: 17,
  weight: 905,
  sprites: { front_default: spriteUrl(6) },
  types: [{ type: { name: "fire" } }, { type: { name: "flying" } }],
};
const jsonNoImage = {
  id: 132,
  name: "ditto",
  height: 3,
  weight: 40,
  sprites: { front_default: null },
  types: [{ type: { name: "normal" } }],
};

// formatPokemon: normal case
const a = formatPokemon(jsonNormal);
check(a.id === 25, "normal: id");
check(a.name === "pikachu", "normal: name");
check(a.picture === spriteUrl(25), "normal: image");
check(a.types.length === 1 && a.types[0] === "electric", "normal: types");
check(a.height === 0.4, "normal: height in m");
check(a.weight === 6, "normal: weight in kg");

// formatPokemon: two types
const b = formatPokemon(jsonTwoTypes);
check(b.types.length === 2, "2 types: length");
check(b.types[0] === "fire" && b.types[1] === "flying", "2 types: names");
check(b.height === 1.7 && b.weight === 90.5, "2 types: conversions");

// formatPokemon: missing image
const c = formatPokemon(jsonNoImage);
check(c.picture === null, "no image: picture is null");
check(c.name === "ditto", "no image: the rest is correct");
check(
  formatPokemon({ ...jsonNoImage, sprites: {} }).picture === null,
  "no image: empty sprites",
);
check(
  formatPokemon({ ...jsonNoImage, sprites: undefined }).picture === null,
  "no image: sprites undefined",
);

// normalizeName
check(normalizeName("  Pikachu  ") === "pikachu", "name: spaces and capitals");
check(normalizeName("Mr   Mime") === "mr-mime", "name: spaces => hyphen");
check(normalizeName("   ") === "", "name: only spaces");

document.getElementById("result").textContent =
  failures === 0
    ? "All tests pass ✅"
    : `${failures} test(s) failed ❌ — see the console.`;
