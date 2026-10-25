// Construire des éléments DOM à partir d'un <template>.
 
export class CommentRenderer {
  /**
   * @param {string} templateSelector  ex : "#comment"
   * @param {Record<string, string>} elements
   */
  constructor(templateSelector, elements) {
    this.template = document.querySelector(templateSelector)
    this.elements = elements

    if (!this.template) {
      throw new Error(`Template not found : ${templateSelector}`)
    }
  }

  /**
   * @param {Record<string, any>} data
   * @returns {DocumentFragment}
   */
  render(data) {
    const fragment = this.template.content.cloneNode(true)

    for (const [key, selector] of Object.entries(this.elements)) {
      const target = fragment.querySelector(selector)
      if (target) {
        // textContent pour éviter toute injection de HTML
        target.textContent = data[key] ?? ''
      }
    }

    return fragment
  }
}
