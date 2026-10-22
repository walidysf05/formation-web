/**
 * Crée un élément HTML avec ses attributs.
 * Ex : createElement("li", { class: "todo", id: "x" })
 *
 * @param {string} tagName Le nom de la balise 
 * @param {Object<string, string>} [attributes] Les attributs à ajouter 
 * @returns {HTMLElement} L'élément créé
 */
export function createElement(tagName, attributes = {}) {
  const element = document.createElement(tagName);

  for (const name in attributes) {
    element.setAttribute(name, attributes[name]);
  }

  return element;
}
