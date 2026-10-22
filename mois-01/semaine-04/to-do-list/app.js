import { fetchJSON } from "./functions/api.js";
import { createElement } from "./functions/dom.js";
import { loadTodos, saveTodos } from "./functions/storage.js";
import { TodoList } from "./components/TodoList.js";


const API_URL = "https://jsonplaceholder.typicode.com/todos?_limit=5";

// Reprendre la sauvegarde 

let todos = loadTodos();

// Tout premier lancement, interroger l'API

if (todos === null) {
  try {
    const data = await fetchJSON(API_URL);

    // L'API ne donne pas de priorité : mettre « normale »

    todos = data.map((todo) => ({
      id: todo.id,
      title: todo.title,
      completed: todo.completed,
      priority: "normal",
    }));

    saveTodos(todos);
  } catch (error) {
    console.error("Impossible de charger les tâches :", error);

    const alert = createElement("div", {
      class: "alert alert-danger",
      role: "alert",
    });
    alert.textContent =
      "Impossible de charger les tâches. Vérifie ta connexion.";
    document.querySelector("#message")?.append(alert);

    todos = [];
  }
}

// Afficher la liste
new TodoList(todos);
