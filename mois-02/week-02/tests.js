// Tests with console.assert

const jsonNormal = {
  id: 25,
  name: "pikachu",
  height: 4,
  weight: 60,
  sprites: {
    front_default:
            "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png",
  },
  types: [{ type: { name: "electric" } }],
};
const jsonTwoTypes = {
  id: 6,
  name: "charizard",
  height: 17,
  weight: 905,
  sprites: {
    front_default:
           "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/6.png",
  },
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

// Normal case

const a = formatPokemon(jsonNormal);
console.assert(a.id === 25, "normal: id");
console.assert(a.name === "pikachu", "normal: name");
console.assert(
  a.picture ===
        "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png",
  "normal: image",
);
console.assert(
  a.types.length === 1 && a.types[0] === "electric",
  "normal: types",
);
console.assert(a.height === 0.4, "normal: height in m");
console.assert(a.weight === 6, "normal: weight in kg");

// Two types

const b = formatPokemon(jsonTwoTypes);
console.assert(b.types.length === 2, "2 types: length");
console.assert(
  b.types[0] === "fire" && b.types[1] === "flying",
  "2 types: names",
);
console.assert(b.height === 1.7 && b.weight === 90.5, "2 types: conversions");

// Missing image

const c = formatPokemon(jsonNoImage);
console.assert(c.picture === null, "no image: image is null");
console.assert(c.name === "ditto", "no image: the rest is correct");

// Even with no sprites key at all

const d = formatPokemon({ ...jsonNoImage, sprites: {} });
console.assert(d.picture === null, "no image: empty sprites");

// Even with sprites undefined

const e = formatPokemon({ ...jsonNoImage, sprites: undefined });
console.assert(e.picture === null, "no image: sprites undefined");

console.log(
  'Tests finished: no "Assertion failed" message means everything is OK.',
);
