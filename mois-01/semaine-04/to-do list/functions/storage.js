/** @typedef {import("../components/TodoList.js").Todo} Todo */

// Clé sous laquelle les tâches sont rangées dans le navigateur

const STORAGE_KEY = "todolist.tasks";

// Sauvegarder les tâches dans le navigateur (localStorage).

export function saveTodos(todos) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  } catch (error) {
    console.error("Sauvegarde impossible :", error);
  }
}

/**
 * Relire les tâches sauvegardées 
 *
 * @returns {Todo[] | null} Le tableau de tâches, ou null s'il n'y a rien de sauvegardé
 */
export function loadTodos() {
  try {
    const text = localStorage.getItem(STORAGE_KEY);

    if (text === null) {
      return null;
    }

    const todos = JSON.parse(text);
    return Array.isArray(todos) ? todos : null;
  } catch (error) {
    console.error("Lecture de la sauvegarde impossible :", error);
    return null;
  }
}
