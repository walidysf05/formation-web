/**
 * Chercher des données JSON sur internet.
 *
 * @param {string} url L'adresse à interroger
 * @returns {Promise<any>} Les données reçues (converties depuis le JSON)
 * @throws {Error} Si le serveur répond avec une erreur 
 */
export async function fetchJSON(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Erreur HTTP : " + response.status);
  }

  return response.json();
}
