# Pokédex

**Démo en ligne :** [https://walidysf05.github.io/formation-web/mois-02/week-02/](https://walidysf05.github.io/formation-web/mois-02/week-02/)

## L'application

Un petit Pokédex en HTML, CSS et JavaScript, qui utilise l'API publique [PokéAPI](https://pokeapi.co/).

- **Liste paginée** : 20 Pokémon par page, avec les boutons *Previous* / *Next* (« Previous » est désactivé sur la première page, « Next » sur la dernière).
- **Carte détaillée** : un clic sur un nom affiche son image, son numéro, ses types, sa taille et son poids.
- **Recherche** : on peut aussi taper un nom (`Pikachu`, `mr mime`,…). La saisie est nettoyée avant l'appel à l'API.
- **Suggestions automatiques** : dès qu'on tape deux caractères, une liste propose les noms qui commencent par la saisie (5 au maximum). Elle utilise un `<datalist>` HTML, rempli à partir de la liste complète des noms, chargée une seule fois puis gardée dans le Local Storage.
- **Cache dans le Local Storage** : un Pokémon ou une page déjà chargés ne sont jamais redemandés à l'API, même après avoir rechargé la page. L'API demande de ne pas la surcharger.
- **Erreurs gérées** : champ vide, nom inconnu (404), erreur serveur, réseau coupé.


## Fichiers

| Fichier | Rôle |
|---|---|
| `index.html` | Structure de la page et modèle (`<template>`) de la carte |
| `app.js` | Appels à l'API, cache, affichage, pagination |
| `style.css` | Mise en forme |
| `tests.js` | Tests avec `console.assert` |
| `cas-d-erreur.md` | Tableau des cas d'erreur testés et des bugs corrigés |

## Ce que j'ai appris sur `fetch` et la gestion d'erreurs

- **`fetch` ne considère pas un 404 ou un 500 comme une erreur.** Il ne « plante » que si le réseau est coupé. Il faut donc vérifier soi-même `response.status` et `response.ok` avant de lire le JSON.
- **Il y a deux étapes** : `await fetch(url)` donne la réponse, puis `await response.json()` lit son contenu.
- **Trois cas à distinguer** : réseau coupé (le `fetch` échoue, d'où un `try/catch`), ressource introuvable (404) et erreur serveur (autre statut non `ok`). Chacun mérite un message clair pour l'utilisateur.
- **Les fonctions qui appellent l'API lancent l'erreur (`throw`), la fonction qui affiche l'attrape (`catch`).** Chacune a un seul rôle.
- **`finally` s'exécute dans tous les cas** : c'est l'endroit pour réactiver un bouton, sinon il reste bloqué après une erreur.
- **Ne mémoriser que les réponses réussies dans le cache**, sinon on garderait une erreur en mémoire. Le Local Storage ne stocke que du texte : il faut `JSON.stringify` et `JSON.parse`.
- **Mémoriser la promesse plutôt que le résultat** évite d'envoyer plusieurs requêtes identiques quand l'utilisateur tape vite. En cas d'échec, on la vide pour pouvoir réessayer. Une erreur pendant la saisie ne casse rien : la liste reste simplement vide.



