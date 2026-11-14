# Auto-review du refactoring

## Ce qui est mieux qu'avant

- **Une responsabilité par fichier.** On peut changer l'affichage sans toucher aux appels API, et l'inverse. `api.js` n'importe jamais `ui.js`, et `ui.js` ne contient aucun `fetch`.
- **Plus de copier-coller.** `getOrLoad` (cache), `makeElement` (DOM) et `normalizeName` remplacent des morceaux de code écrits 2 ou 3 fois.
- **Plus de valeurs « magiques ».** `PAGE_SIZE`, `API_URL`, `MAX_SUGGESTIONS`, etc. sont des constantes nommées en haut des fichiers.
- **Fonctions courtes et nommées.** `displayCard` est découpée, et les gros écouteurs sont devenus `handleSearchSubmit`, `handleListClick`…
- **Documentation.** Chaque fonction exportée a un JSDoc.
- **Comportement identique, vérifié.** Les 10 cas de `cas-d-erreur.md` sont rejoués : 10 ✅ sur 10. `tests.html` passe aussi.


## Bug causé par le refactoring

**`tests.js` ne marchait plus.** Après le déplacement de `formatPokemon` dans `pokemon.js`, elle n'était plus globale, alors que `tests.js` était toujours chargé comme script classique. Je l'ai corrigé en important la fonction et en chargeant les tests avec `type="module"`, puis dans une page `tests.html`. Les 10 cas d'erreur de l'application, eux, n'ont pas régressé.

## Rôle de chaque fichier

- `index.html` : structure de la page, modèle `<template>` de la carte, et chargement de `app.js` en module.
- `app.js` : point d'entrée qui garde l'état (`offset`, `hasNext`), relie `api.js` et `ui.js` et pose les écouteurs.
- `api.js` : appels à l'API PokéAPI, avec gestion des erreurs réseau, 404 et serveur, sans jamais toucher à la page.
- `cache.js` : mémorisation dans le Local Storage des Pokémon, des pages et de la liste de noms déjà chargés.
- `pokemon.js` : fonctions pures qui nettoient un nom (`normalizeName`) et simplifient le JSON de l'API (`formatPokemon`).
- `ui.js` : tout ce qui touche à l'affichage (carte, liste, messages, chargement, suggestions), sans aucun `fetch`.
- `style.css` : mise en forme de la page.
- `tests.js` : tests des fonctions pures avec `console.assert`.
- `tests.html` : page qui charge `tests.js` et affiche le résultat.
- `cas-d-erreur.md` : tableau des cas d'erreur, avec la colonne « Après refactoring ».
- `README.md` : présentation du projet, lien de la démo et structure.
- `auto-review.md` : ce document.
