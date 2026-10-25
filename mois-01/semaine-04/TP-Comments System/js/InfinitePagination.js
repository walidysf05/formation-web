import { fetchJSON } from './fetchJSON.js'
import { CommentRenderer } from './CommentRenderer.js'
import { Alert } from './Alert.js'

// `.js-infinite-pagination` est le sentinelle : il entre dans la fenêtre,
//  on charge la page suivante et on l'ajoute à la cible.

export class InfinitePagination {
  /** @param {HTMLElement} element */
  constructor(element) {
    this.element = element
    this.endpoint = new URL(element.dataset.endpoint)
    this.target = document.querySelector(element.dataset.target)
    this.renderer = new CommentRenderer(
      element.dataset.template,
      JSON.parse(element.dataset.elements)
    )

    this.page = 1
    this.loading = false
    this.done = false

    this.observer = new IntersectionObserver(
      (entries) => this.onIntersect(entries),
      { rootMargin: '100px' } // Anticiper avant que la sentinelle soit visible
    )
  }

  start() {
    this.observer.observe(this.element)
  }

  /** @param {IntersectionObserverEntry[]} entries */
  async onIntersect(entries) {
    const visible = entries.some((entry) => entry.isIntersecting)
    if (!visible || this.loading || this.done) return

    await this.loadPage()

    // Si la sentinelle est encore visible après l'ajout :
    // Relancer manuellement l'observer .
    if (!this.done) {
      this.observer.unobserve(this.element)
      this.observer.observe(this.element)
    }
  }

  async loadPage() {
    this.loading = true

    try {
      const url = new URL(this.endpoint)
      url.searchParams.set('_page', this.page)

      const comments = await fetchJSON(url)

      if (comments.length === 0) {
        this.finish()
        return
      }

      const fragment = document.createDocumentFragment()
      for (const comment of comments) {
        fragment.append(this.renderer.render(comment))
      }
      this.target.append(fragment)

      this.page++
    } catch (error) {
      this.finish()
      Alert.show('Unable to load comments.', 'danger', this.target)
      console.error(error)
    } finally {
      this.loading = false
    }
  }

  // Rien à charger : arrêter d'observer et retirer le spinner. 

  finish() {
    this.done = true
    this.observer.disconnect()
    this.element.remove()
  }
}
