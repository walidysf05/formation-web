# Météo

**Démo en ligne :**[https://walidysf05.github.io/formation-web/mois-02/week-03/Open-Meteo/](https://walidysf05.github.io/formation-web/mois-02/week-03/Open-Meteo/)

## L'application

Une petite page météo en HTML, CSS et JavaScript (modules), qui utilise l'API publique [Open-Meteo](https://open-meteo.com/) (aucune clé nécessaire).

- **Carte météo** : température actuelle et heure de la mesure pour un lieu fixe (Paris par défaut, modifiable dans `app.js`).
- **Bouton Refresh** : force un nouvel appel à l'API, même si le cache est encore frais.
- **Cache dans le Local Storage avec durée de vie** : une réponse n'est pas redemandée pendant 10 minutes, même après avoir rechargé la page. Passé ce délai, on rappelle l'API.
- **Erreurs gérées** : coordonnées invalides (400, avec le message précis d'Open-Meteo quand il existe), erreur serveur, réseau coupé, réponse qui n'est pas du JSON, température manquante, Local Storage corrompu ou de mauvaise forme, date de sauvegarde dans le futur.
- **Repli hors ligne** : si un rafraîchissement échoue, les dernières données sauvegardées (même anciennes) restent affichées avec un avertissement et leur âge.
- **0 °C et températures négatives** : affichées normalement, jamais confondues avec une donnée manquante.

## Structure du projet

```
index.html        page principale
app.js            point d'entrée : lieu + écouteur
api.js            appel à l'API (aucun accès à la page)
cache.js          mémorisation dans le Local Storage, avec durée de vie
weather.js        fonctions pures (formatWeather, isCompleteWeather, formatTemperature, formatTime, formatAge)
ui.js             affichage (aucun fetch)
style.css         mise en forme
tests.html        page de tests
tests.js          tests avec console.assert
cas-d-erreur.md   cas d'erreur testés
README.md
```

Qui utilise qui :

```
app.js
+-- api.js
|   +-- cache.js
|   |   +-- weather.js
|   +-- weather.js
+-- ui.js
|   +-- weather.js
+-- weather.js
```

`api.js` n'importe jamais `ui.js`, et `ui.js` ne contient aucun `fetch`.

| Fichier                   | Rôle                                                                                          |
| ------------------------- | --------------------------------------------------------------------------------------------- |
| `index.html`              | Structure de la page, modèle (`<template>`) de la carte, charge `app.js` avec `type="module"` |
| `app.js`                  | Point d'entrée : `PLACE`, `showWeather`, écouteur, relie `api.js` et `ui.js`                  |
| `api.js`                  | `getWeather`,`getCacheWeather`, gestion des erreurs `fetch`                                   |
| `cache.js`                | `createCache`, `isFresh`, `hasValidTimestamp` et le cache de la météo                         |
| `weather.js`              | `formatWeather`, `isCompleteWeather`, `formatTemperature`, `formatTime`, `formatAge`          |
| `ui.js`                   | Carte, messages, chargement, état du bouton                                                   |
| `tests.js` + `tests.html` | Tests avec `console.assert` ; le résultat s'affiche dans la page                              |

## Lancer le projet

Les modules ne fonctionnent pas si on ouvre le fichier directement (`file://`). Il faut un petit serveur local, par exemple : L'extension Live Server de VS Code

## Tests

Ouvrir `tests.html` avec le serveur local : la page affiche « All tests pass ✅ » si tout est bon. Les détails d'un échec sont dans la console. Les cas d'erreur testés à la main sont dans [cas-d-erreur.md](cas-d-erreur.md).
