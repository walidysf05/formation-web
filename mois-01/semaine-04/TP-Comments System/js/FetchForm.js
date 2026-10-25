import { fetchJSON } from './fetchJSON.js'
import { CommentRenderer } from './CommentRenderer.js'
import { Alert } from './Alert.js'

// Intercepter l'envoi du formulaire, et ajouter le commentaire reçu en haut de la liste.
 
export class FetchForm {
  /** @param {HTMLFormElement} form */
  constructor(form) {
    this.form = form
    this.endpoint = form.dataset.endpoint
    this.target = document.querySelector(form.dataset.target)
    this.button = form.querySelector('button')
    this.renderer = new CommentRenderer(
      form.dataset.template,
      JSON.parse(form.dataset.elements)
    )
  }

  start() {
    this.form.addEventListener('submit', (event) => this.onSubmit(event))
  }

  /** @param {SubmitEvent} event */
  async onSubmit(event) {
    event.preventDefault()

    const data = Object.fromEntries(new FormData(this.form))

    if (!data.name?.trim() || !data.body?.trim()) {
      Alert.show('Please fill in the username and the message.', 'warning', this.form)
      return
    }

    this.button.disabled = true

    try {
      const comment = await fetchJSON(this.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      // jsonplaceholder renvoie les données envoyées + un id 
      
      this.target.prepend(this.renderer.render(comment))
      this.form.reset()
      Alert.show('your comment is added succefully', 'success', this.form)
    } catch (error) {
      Alert.show("Error occurred during sending", 'danger', this.form)
      console.error(error)
    } finally {
      this.button.disabled = false
    }
  }
}
