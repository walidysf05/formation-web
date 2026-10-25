
export class Alert {
  /**
   * @param {string} message
   * @param {'success'|'danger'|'warning'|'info'} type  classe Bootstrap
   * @param {Element} anchor  l'alerte est insérée juste avant cet élément
   */
  static show(message, type, anchor) {
    const template = document.querySelector('#alert')
    if (!template) return

    const fragment = template.content.cloneNode(true)
    fragment.querySelector('.alert').classList.add(`alert-${type}`)
    fragment.querySelector('.js-text').textContent = message

    anchor.before(fragment)
  }
}
