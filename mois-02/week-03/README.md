# Pokédex

**Démo en ligne :** [https://walidysf05.github.io/formation-web/mois-02/week-03/](https://walidysf05.github.io/formation-web/mois-02/week-03/)

## L'application

Un petit Pokédex en HTML, CSS et JavaScript (modules ES), qui utilise l'API publique [PokéAPI](https://pokeapi.co/).

- **Liste paginée** : 20 Pokémon par page, avec les boutons _Previous_ / _Next_ (« Previous » est désactivé sur la première page, « Next » sur la dernière).
- **Carte détaillée** : un clic sur un nom affiche son image, son numéro, ses types, sa taille et son poids. Les noms sont de vrais boutons : ils s'utilisent aussi au clavier (Tab puis Entrée).
- **Recherche** : on peut aussi taper un nom (`Pikachu`, `mr mime`,…). La saisie est nettoyée avant l'appel à l'API.
- **Suggestions automatiques** : dès qu'on tape deux caractères, une liste propose les noms qui commencent par la saisie (5 au maximum), avec un `<datalist>` HTML.
- **Cache dans le Local Storage** : un Pokémon ou une page déjà chargés ne sont jamais redemandés à l'API, même après avoir rechargé la page.
- **Erreurs gérées** : champ vide, nom inconnu (404), erreur serveur, réseau coupé, Local Storage corrompu.

## Structure du projet

```
index.html        page principale
app.js            point d'entrée : état + écouteurs
api.js            appels à l'API (aucun accès à la page)
cache.js          mémorisation dans le Local Storage
pokemon.js        fonctions pures (formatPokemon, normalizeName)
ui.js             affichage (aucun fetch)
style.css         mise en forme
tests.html        page de tests
tests.js          tests avec console.assert
cas-d-erreur.md   cas d'erreur testés (avant / après refactoring)
auto-review.md    bilan du refactoring
README.md
```

Qui utilise qui :

```
app.js => api.js => cache.js
  │          |=> pokemon.js
  |=> ui.js
  |=> pokemon.js
```

`ui.js` n'importe rien, et `api.js` n'importe jamais `ui.js`.

| Fichier                   | Rôle                                                                                          |
| ------------------------- | --------------------------------------------------------------------------------------------- |
| `index.html`              | Structure de la page, modèle (`<template>`) de la carte, charge `app.js` avec `type="module"` |
| `app.js`                  | Point d'entrée : état (`offset`, `hasNext`), écouteurs, relie `api.js` et `ui.js`             |
| `api.js`                  | `getPokemon`, `getPokemonList`, `getAllNames`, gestion des erreurs `fetch`                    |
| `cache.js`                | `createCache` et les trois caches (Pokémon, pages, noms)                                      |
| `pokemon.js`              | `formatPokemon` et `normalizeName`                                                            |
| `ui.js`                   | Carte, liste, messages, chargement, suggestions, état des boutons                             |
| `tests.js` + `tests.html` | Tests avec `console.assert` ; le résultat s'affiche dans la page                              |

## Lancer le projet

Les modules ne fonctionnent pas si on ouvre le fichier directement (`file://`). Il faut un petit serveur local, par exemple :

```
L'extension Live Server de VS Code
```

## Ce que j'ai appris sur `fetch` et la gestion d'erreurs

- **`fetch` ne considère pas un 404 ou un 500 comme une erreur.** Il ne « plante » que si le réseau est coupé. Il faut donc vérifier soi-même `response.status` et `response.ok` avant de lire le JSON.
- **Il y a deux étapes** : `await fetch(url)` donne la réponse, puis `await response.json()` lit son contenu.
- **Trois cas à distinguer** : réseau coupé (le `fetch` échoue, d'où un `try/catch`), ressource introuvable (404) et erreur serveur (autre statut non `ok`). Chacun mérite un message clair pour l'utilisateur.
- **Les fonctions qui appellent l'API lancent l'erreur (`throw`), la fonction qui affiche l'attrape (`catch`).** Chacune a un seul rôle.
- **`finally` s'exécute dans tous les cas** : c'est l'endroit pour réactiver un bouton, sinon il reste bloqué après une erreur.
- **Ne mémoriser que les réponses réussies dans le cache**, sinon on garderait une erreur en mémoire. Le Local Storage ne stocke que du texte : il faut `JSON.stringify` et `JSON.parse`.
- **Mémoriser la promesse plutôt que le résultat** évite d'envoyer plusieurs requêtes identiques quand l'utilisateur tape vite. En cas d'échec, on la vide pour pouvoir réessayer.

## Ce que j'ai appris sur le refactoring

- **Une responsabilité par fichier** : changer l'affichage ne doit pas obliger à toucher aux appels API.
- **Les modules** (`import` / `export`) remplacent les variables globales, mais demandent un serveur local.
- **Après un refactoring, on rejoue les cas d'erreur** : le comportement doit rester identique.
- **Un refactoring peut casser ce qui n'est pas dans l'appli** : les tests ont cessé de fonctionner quand `formatPokemon` a cessé d'être globale.
- **La délégation d'événements** : un seul écouteur sur la liste suffit, même quand ses boutons sont remplacés.

Le bilan complet est dans [auto-review.md](auto-review.md).
