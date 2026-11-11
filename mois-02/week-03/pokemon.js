// Pure functions on Pokémon data: no DOM, no fetch, no storage.

const DECIMETRES_PER_METRE = 10;
const HECTOGRAMS_PER_KG = 10;

/**
 * Cleans what the user typed: "  Mr Mime " => "mr-mime".
 * @param {string} text What the user typed.
 * @returns {string} The name, ready to be sent to the API.
 */
export function normalizeName(text) {
  return text.trim().toLowerCase().replace(/\s+/g, "-");
}

/**
 * Turns the API JSON into a simple object.
 * @param {object} data Raw response of `/pokemon/{name}`.
 * @returns {{id: number, name: string, picture: string|null, types: string[], height: number, weight: number}}
 *   `height` in metres, `weight` in kg, `picture` is `null` when there is no image.
 */
export function formatPokemon(data) {
  return {
    id: data.id,
    name: data.name,
    picture: data.sprites?.front_default ?? null,
    types: data.types.map((t) => t.type.name),
    height: data.height / DECIMETRES_PER_METRE,
    weight: data.weight / HECTOGRAMS_PER_KG,
  };
}
