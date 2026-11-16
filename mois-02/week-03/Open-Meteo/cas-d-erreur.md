# Cas d'erreur testés


## Tableau des cas

| # | Action | Résultat attendu | Résultat obtenu |
|---|--------|------------------|-----------------|
| 1 | Ouvrir la page | « Loading… » puis la carte Paris avec la température et l'heure | Carte « Paris, 8.6 °C, As of 2026-11-14 12:30 ». Onglet Network : 1 requête `forecast?latitude=48.85&longitude=2.35&current=temperature_2m&timezone=auto`, statut 200 |
| 2 | Cliquer sur Refresh | Nouvelle requête (le cache est ignoré), carte mise à jour, bouton réactivé | Avec `force: true`, une requête part même si le cache est frais. |
| 3 | Recharger la page dans les 10 minutes | Aucune requête dans l'onglet Network (réponse prise dans le Local Storage) | 0 requête `forecast` : la réponse vient du cache. |
| 4 | Recharger la page après plus de 10 minutes | Une nouvelle requête est envoyée | Une entrée vieille de 11 minutes est ignorée, les nouvelles données sont chargées.|
| 5 | Mettre `latitude: 200` dans `PLACE` (coordonnées invalides, réponse 400) | Le message précis d'Open-Meteo (champ `reason`, ex. « Latitude must be in range of -90 to 90°. Given: 200.0. »), ou à défaut `Invalid coordinates. Check the latitude and longitude.`. Bouton réactivé | Message  précis d'Open-Meteo « Latitude must be in range of -90 to 90°. Given: 200.0. » |
| 6 | Le réseau est coupé (Network > Offline) | `Network problem: check your connection and try again.`, bouton réactivé | Message correct quand `fetch` échoue, bouton réactivé. |
| 7 | Local Storage corrompu (`localStorage.setItem("meteo-cache", "abc")`) puis recharger | L'appli démarre quand même, avec un cache vide | Pas d'erreur, la température est chargée depuis l'API et le cache est réécrit en JSON valide. |
| 8 | Température à 0 °C ou négative | Affichée normalement, pas confondue avec « manquante » | `tests.js` : `0` et `-4.5` sont conservés (pas de « Assertion failed »). |
| 9 | Réponse 200 dont le corps n'est pas du JSON (page de proxy, réponse tronquée) | `The server sent an unexpected response. Please try again later.`, jamais « Unexpected token < in JSON » | `tests.js` : HTML, corps vide, JSON tronqué. |
| 10 | Réponse 200 sans température exploitable (`{}`, `null`, `"12"`) | Même message qu'au cas 9, rien n'est écrit dans le cache | `tests.js` : aucune entrée créée après ces échecs. |
| 11 | Cache présent, puis Refresh avec le réseau coupé | La carte reste affichée avec un avertissement : message d'erreur + « Showing data saved 3 minutes ago. », bouton réactivé | « Carte conservée, encadré jaune : message réseau + “Showing data saved just now.” (13.1 °C, 13:30), requête forecast bloquée, bouton réactivé. »|
| 12 | Même chose avec une entrée de plus de 10 minutes | Les données périmées sont affichées quand même, avec l'âge dans l'avertissement | « Entrée vieillie à 43 minutes : carte affichée quand même avec “Showing data saved 43 minutes ago.”, requête bloquée, bouton réactivé. » |
| 13 | Entrée de cache de mauvaise forme (`localStorage.setItem("meteo-cache", '{"48.85,2.35":{"savedAt":'+Date.now()+',"value":{}}}')`) puis recharger | L'entrée est ignorée et supprimée, la météo est rechargée, pas de « undefined undefined » | `tests.js` : `{}`, `null`, texte, tableau, mauvais types. |
| 14 | `savedAt` dans le futur (horloge changée, stockage modifié) | Entrée ignorée (jamais « fraîche pour toujours ») | « savedAt à Date.now() + 3600000, puis rechargement avec le blocage actif : aucune carte, seulement Network problem: check your connection and try again. en rouge. » |


> [!NOTE]
> La météo change : le cache a une **durée de vie** (`CACHE_MAX_AGE`, 10 minutes). Passé ce délai, on rappelle l'API.


## Tests automatiques

**`tests.html`** : « All tests pass ✅ », 0 assertion en échec. Les tests couvrent `formatWeather` (y compris les entrées inattendues), `isCompleteWeather`, `formatTemperature`, `formatTime`, `formatAge`and `isFresh` .