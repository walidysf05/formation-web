import { createElement } from "../functions/dom.js";
import { saveTodos } from "../functions/storage.js";

/**
 * Une tâche.
 *
 * @typedef {object} Todo
 * @property {number | string} id Identifiant unique
 * @property {string} title Le texte de la tâche
 * @property {boolean} completed true si la tâche est faite
 * @property {Priority} priority Basse, normale , haute ou urgent
 */

//  Les 4 priorités : le texte du badge et sa couleur
/**
 * @typedef {"low" | "normal" | "high" | "urgent"} Priority
 */
const PRIORITIES = {
  low: { label: "Basse", badge: "text-bg-secondary" },
  normal: { label: "Normale", badge: "text-bg-primary" },
  high: { label: "Haute", badge: "text-bg-danger" },
  urgent: { label:"Urgente", badge: "text-bg-warning"},
};


// Une seule tâche.

class TodoListItem {
  
  constructor(todo, onToggle, onDelete) {
    const id = "todo-" + todo.id;
    const priority = PRIORITIES[todo.priority] ?? PRIORITIES.normal;

    // La ligne
    const li = createElement("li", {
      class: "todo list-group-item d-flex align-items-center",
    });

    // La case à cocher
    const checkbox = (
        createElement("input", {
        type: "checkbox",
        class: "form-check-input",
        id: id,
      })
    );
   
    checkbox.checked = todo.completed;

    // Le texte (barré si la tâche est faite)
    const label = createElement("label", {
      class: "ms-2 form-check-label",
      for: id,
    });
    label.textContent = todo.title;

    if (todo.completed) {
      label.classList.add("text-decoration-line-through");
    }

    // Le badge de priorité
    const badge = createElement("span", {
      class: "badge ms-2 " + priority.badge,
    });
    badge.textContent = priority.label;

    // Le bouton corbeille
    const trash = createElement("button", {
      type: "button",
      class: "ms-auto btn btn-danger btn-sm",
      "aria-label": "Supprimer la tâche",
    });
    trash.innerHTML = '<i class="bi bi-trash" aria-hidden="true"></i>';

    // Quand on clique, on prévient la TodoList
    checkbox.addEventListener("change", () => {
      onToggle(todo, checkbox.checked);
    });

    trash.addEventListener("click", () => {
      onDelete(todo);
    });

    li.append(checkbox, label, badge, trash);

    this.element = li;
  }
}

// Garder les tâches et gèrer les boutons de la page .

export class TodoList {
  
  constructor(todos) {
    
    this.todos = todos;

    this.filter = "all";

    // Les éléments de la page .

    this.form = document.querySelector("#task-form");
    this.input = this.form.querySelector('input[name="title"]');
    this.select = this.form.querySelector('select[name="priority"]');
    this.list = document.querySelector("#todolist ul");
    this.filterButtons = document.querySelectorAll("[data-filter]");
    this.counter = document.querySelector("#counter");
    this.clearButton = document.querySelector("#clear-done");

    this.listenToEvents();
    this.render();
  }

  listenToEvents() {
    // Ajouter une tâche
    this.form.addEventListener("submit", (event) => {
      event.preventDefault(); // empêche la page de se recharger
      this.add();
    });

    // Changer de filtre
    this.filterButtons.forEach((button) => {
      button.addEventListener("click", () => {
        this.changeFilter(button);
      });
    });

    // Supprimer les tâches terminées
    this.clearButton.addEventListener("click", () => {
      this.todos = this.todos.filter((todo) => !todo.completed);
      this.update();
    });
  }

  // Actions 

  add() {
    const title = this.input.value.trim();

    if (title === "") {
      return;
    }

    this.todos.push({
      id: Date.now(),
      title: title,
      completed: false,
      priority: /** @type {Priority} */ (this.select.value),
    });

    this.input.value = "";
    this.select.value = "normal";

    this.update();
  }

  /**
   * Coche ou décoche une tâche.
   * @param {Todo} todo La tâche concernée
   * @param {boolean} completed true pour la cocher, false pour la décocher
   * @returns {void}
   */
  toggle(todo, completed) {
    todo.completed = completed;
    this.update();
  }

  /**
   * Supprime une tâche.
   * @param {Todo} todo La tâche à supprimer
   * @returns {void}
   */
  remove(todo) {
    this.todos = this.todos.filter((t) => t.id !== todo.id);
    this.update();
  }

  /**
   * Change le filtre et met en évidence le bouton cliqué.
   * @param {HTMLElement} button Le bouton de filtre cliqué
   * @returns {void}
   */
  changeFilter(button) {
    this.filter = (button.dataset.filter);

    // Seul le bouton cliqué est mis en évidence
    this.filterButtons.forEach((b) => b.classList.remove("active"));
    button.classList.add("active");

    this.render();
  }

  // Affichage 

  // Après chaque changement : on sauvegarde, puis on redessine.
   
  update() {
    saveTodos(this.todos);
    this.render();
  }

  /**
   * Est-ce que cette tâche doit apparaître avec le filtre actuel ?
   * @param {Todo} todo La tâche à tester
   * @returns {boolean}
   */
  isVisible(todo) {
    if (this.filter === "todo") {
      return !todo.completed;
    }
    if (this.filter === "done") {
      return todo.completed;
    }
    return true;
  }

  // Redessine toute la liste à partir du tableau.
  
  render() {
    this.list.textContent = "";

    for (const todo of this.todos) {
      if (this.isVisible(todo)) {
        const item = new TodoListItem(
          todo,
          (t, completed) => this.toggle(t, completed),
          (t) => this.remove(t),
        );
        this.list.append(item.element);
      }
    }

    this.renderFooter();

  }

  renderFooter() {
    const remaining = this.todos.filter((todo) => !todo.completed).length;
    const done = this.todos.length - remaining;

    if (this.todos.length === 0) {
      this.counter.textContent = "Aucune tâche pour le moment.";
    } else if (remaining === 0) {
      this.counter.textContent = "Toutes les tâches sont terminées.";
    } else if (remaining === 1) {
      this.counter.textContent = "1 tâche restante";
    } else {
      this.counter.textContent = remaining + " tâches restantes";
    }

    this.clearButton.disabled = done === 0;
  }
}
