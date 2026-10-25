/**
 * fetch + conversion JSON, avec renvoie d'erreur 
 * @param {string|URL} url
 * @param {RequestInit} [options]
 * @returns {Promise<any>}
 */
export async function fetchJSON(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      Accept: 'application/json',
      ...(options.headers ?? {}),
    },
  })

  if (!response.ok) {
    throw new Error(`Error server (${response.status})`)
  }

  return response.json()
}
