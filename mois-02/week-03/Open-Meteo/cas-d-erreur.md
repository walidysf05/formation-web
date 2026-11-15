# Cas d'erreur testés


## Tableau des cas

| # | Action | Résultat attendu | Résultat obtenu |
|---|--------|------------------|-----------------|
| 1 | Ouvrir la page | « Loading… » puis la carte Paris avec la température et l'heure | Carte « Paris, 8.6 °C, As of 2026-11-14 12:30 ». Onglet Network : 1 requête `forecast?latitude=48.85&longitude=2.35&current=temperature_2m&timezone=auto`, statut 200 |
| 2 | Cliquer sur Refresh | Nouvelle requête (le cache est ignoré), carte mise à jour, bouton réactivé | Avec `force: true`, une requête part même si le cache est frais. |
| 3 | Recharger la page dans les 10 minutes | Aucune requête dans l'onglet Network (réponse prise dans le Local Storage) | 0 requête `forecast` : la réponse vient du cache. |
| 4 | Recharger la page après plus de 10 minutes | Une nouvelle requête est envoyée | Une entrée vieille de 11 minutes est ignorée, les nouvelles données sont chargées.|
| 5 | Mettre `latitude: 200` dans `PLACE` (coordonnées invalides, réponse 400) | `Invalid coordinates. Check the latitude and longitude.`, bouton réactivé | Message correct, requête en statut 400, bouton réactivé. |
| 6 | Le réseau est coupé (Network > Offline) | `Network problem: check your connection and try again.`, bouton réactivé | Message correct quand `fetch` échoue, bouton réactivé. |
| 7 | Local Storage corrompu (`localStorage.setItem("meteo-cache", "abc")`) puis recharger | L'appli démarre quand même, avec un cache vide | Pas d'erreur, la température est chargée depuis l'API et le cache est réécrit en JSON valide. |
| 8 | Température à 0 °C ou négative | Affichée normalement, pas confondue avec « manquante » | `tests.js` : `0` et `-4.5` sont conservés (pas de « Assertion failed »). |


> [!NOTE]
> La météo change : le cache a une **durée de vie** (`CACHE_MAX_AGE`, 10 minutes). Passé ce délai, on rappelle l'API.


## Tests automatiques

**`tests.html`** : « All tests pass ✅ », 0 assertion en échec. Les tests couvrent `formatWeather`, `formatTemperature`et `formatTime`.
