# Plan de tests : appli météo

Appli : recherche d'une ville → choix d'un résultat → météo actuelle + 5 prochains jours.
APIs : Open-Meteo Geocoding (`/v1/search`) et Open-Meteo Forecast (`/v1/forecast`).

> « Résultat obtenu » et « OK / KO » restent vides : on les remplira en testant l'appli .

## 1. Notes d'exploration de l'API

| Appel | Ce que renvoie l'API |
|---|---|
| `name=Lille&count=5&language=fr` | HTTP 200, objet `{ results: [...], generationtime_ms }`. 5 « Lille » : France, Belgique, Estonie (×2), États-Unis. Chaque résultat a `name`, `latitude`, `longitude`, `country`, `country_code`, `timezone`. |
| Champs optionnels | Les résultats n'ont pas tous les mêmes champs : le Lille estonien n'a ni `admin4` ni `postcodes`, `population` peut manquer. **Ne jamais supposer qu'un champ existe.** |
| `name=xyxrx` (villes inexistantes) | **HTTP 200** , Corps : `{"generationtime_ms":0.16...}` et rien d'autre. **Pas de clé `results`** : `data.results` vaut `undefined`, pas `[]`. Aucune erreur côté API. |
| `name=a` (1 lettre) | Même réponse qu'une ville inexistante : seulement `generationtime_ms`, pas de `results`, pas d'erreur. |
| `name=` (vide) | Même réponse : seulement `generationtime_ms`. L'API ne signale rien, c'est à l'appli de refuser la saisie vide avant d'appeler. |
| `name=ab` (2 lettres) | 3 résultats seulement (pour `count=5`) : « Āb » ×2 (Iran) et « Ab » (Pakistan). Correspondance exacte, insensible aux accents, villes obscures, sans `population`, parfois sans `admin2`. |
| Forecast Lille (lien du J1) | Objet avec `current` (`time` « 2026-11-17T10:45 », `interval` 900, `temperature_2m` 14.5, `wind_speed_10m` 33.5, `weather_code` 0), `current_units` (°C, km/h, « wmo code »), `daily` en tableaux parallèles de 5 éléments : `time` (2026-11-17 → 2026-11-21), `temperature_2m_max`, `temperature_2m_min`, `weather_code` [63, 63, 63, 53, 51], et `daily_units`. Racine : `latitude` 50.638 / `longitude` 3.074 (arrondis par l'API, différents de 50.63 / 3.06 demandés), `timezone` Europe/Paris, `utc_offset_seconds`. |
| Forecast avec coordonnées invalides (`latitude=900`) | **HTTP 400** , Corps JSON : `{"error":true,"reason":"Latitude must be in range of -90 to 90°. Given: 900.0."}`. Donc `response.ok` vaut `false` : on le teste avant d'utiliser les données. | 

Points de vigilance déduits :
- « Ville introuvable » n'est **pas** une erreur réseau : `response.ok` sera `true`. Il faut tester l'absence de `results`.
- À l'inverse, des paramètres invalides donnent un vrai **400** : les deux situations (ville introuvable = 200 sans `results`, requête invalide = 400) se traitent différemment.
- `daily` est un objet de tableaux parallèles (index 0 = jour 0), pas un tableau d'objets : à transformer avant d'afficher.
- `weather_code` est un code numérique WMO : il faut une table de correspondance code → libellé/icône, y compris un cas « code inconnu ».
- **Le jour 0 de `daily` est aujourd'hui** : avec `forecast_days=5` on a aujourd'hui + 4 jours, pas 5 jours à venir. À trancher au J2 : garder 5 lignes dont « Aujourd'hui » en première, ou passer à `forecast_days=6`.
- **`current` et `daily` peuvent se contredire** : ici `current.weather_code` = 0 (ciel dégagé) alors que le code du jour = 63 (pluie modérée): `current` = maintenant, `daily` = résumé de la journée.
- Les unités ne sont pas figées : lire `current_units` / `daily_units` plutôt que d'écrire « °C » et « km/h » en dur.
- `timezone=auto` : les dates sont dans le fuseau de la ville, pas celui du navigateur.

## 2. Cas de test

Types : **N** = normal, **L** = limite, **E** = erreur.

| Cas | Action | Résultat attendu | Résultat obtenu | OK / KO |
|---|---|---|---|---|
| 1 (N) Recherche simple | Saisir « Lille », cliquer sur Rechercher | Liste de résultats (jusqu'à 5), chacun avec nom + région/pays pour les distinguer. Aucune météo affichée tant qu'on n'a pas choisi. | | |
| 2 (N) Choix d'un résultat | Après le cas 01, cliquer sur « Lille, Hauts-de-France, France » | Météo actuelle (température, vent, description) + 5 jours (date, min, max, description). Nom de la ville affiché. | | |
| 3 (N) Recherche à la touche Entrée | Saisir « Lyon », appuyer sur Entrée (sans cliquer) | Même comportement qu'un clic sur le bouton. | | |
| 4 (N) Pas de requête à chaque lettre | Taper « Marseille » lettre par lettre, sans valider ; ouvrir l'onglet Réseau | **0** requête envoyée pendant la frappe. 1 seule requête après le clic/Entrée. | | |
| 5 (N) Nombre de jours | Afficher la météo d'une ville | 5 lignes de prévisions, dans l'ordre chronologique, dates en français lisibles. La première ligne est aujourd'hui (jour 0 de l'API), libellée « Aujourd'hui ». | | |
| 6 (L) Nom avec trait d'union et accent | Rechercher « Saint-Étienne » | Résultats corrects (Saint-Étienne, Loire en tête), accent et tiret bien affichés, pas de caractère cassé. Idem sans accent : « saint etienne ». | | |
| 7 (L) Espaces autour du texte | Saisir `   Lille   ` (espaces avant/après) | Les espaces sont retirés (`trim`), résultat identique au cas 01. | | |
| 8 (L) Nom ambigu | Rechercher « Paris » | Plusieurs résultats (Paris FR, mais aussi Paris aux États-Unis, etc.), chacun distinguable par région/pays. L'utilisateur choisit celui qu'il veut. | | |
| 9 (L) Nom avec espace interne | Rechercher « La Rochelle » | Résultat correct. L'espace est bien encodé dans l'URL (`encodeURIComponent`). | | |
| 10 (L) Deux lettres | Rechercher « ab » | Peu de résultats (3 côté API, moins que `count`) mais valides. Affichage correct avec accents (« Āb »), sans région ni population, sans « undefined ». | | |
| 11 (L) Une seule lettre | Rechercher « a » | L'API renvoie seulement `generationtime_ms`. L'appli ne plante pas sur `data.results.map` et affiche un message clair (« Saisis au moins 2 lettres » ou « Aucune ville trouvée »). | | |
| 12 (L) Résultat avec champs manquants | Choisir un résultat sans `admin1` ou sans `population` (ex. petit village) | L'affichage ne casse pas et n'affiche pas « undefined ». | | |
| 13 (L) Nouvelle recherche après un résultat | Afficher la météo de Lille puis rechercher « Nice » | Ancienne liste et ancienne météo remplacées, pas de doublons ni de mélange. | | |
| 14 (L) Double clic rapide | Cliquer deux fois très vite sur Rechercher | Pas de résultats en double. Bouton désactivé pendant le chargement ou une seule requête gagnante. | | |
| 15 (L) Caractères spéciaux / injection | Saisir `<b>test</b> & "x"` | Pas de HTML injecté dans la page (utiliser `textContent`). Pas d'erreur. Message « aucune ville trouvée » probable. | | |
| 16 (E) Ville introuvable | Rechercher « xyxrx » | Réponse sans `results` : l'appli le détecte (`!data.results`) et affiche « Aucune ville trouvée pour xyxrx ». Pas d'erreur console, pas de liste vide muette. | | |
| 17 (E) Champ vide | Cliquer sur Rechercher sans rien saisir | Aucune requête envoyée (l'API répondrait sans erreur, donc le blocage doit venir de l'appli). Message « Saisis un nom de ville ». | | |
| 18 (E) Champ avec uniquement des espaces | Saisir `     ` puis Entrée | Traité comme un champ vide (cas 17). | | |
| 19 (E) Pas de connexion | Onglet Réseau → mode « Hors connexion », rechercher « Lille » | Message d'erreur compréhensible (« Impossible de joindre le service, vérifie ta connexion »). Pas de chargement infini. | | |
| 20 (E) Échec de la météo après une recherche réussie | La recherche marche, puis on coupe le réseau et on clique sur un résultat | Message d'erreur pour la météo. La liste de résultats reste visible pour réessayer. | | |
| 21 (E) Réponse serveur en erreur | Simuler un HTTP 500 / 429 (blocage de l'URL dans les DevTools), ou appeler la météo avec `latitude=900` | Message d'erreur lisible en français, pas de « undefined ». Le test `response.ok` est fait avant d'exploiter les données. Le `reason` de l'API (en anglais) n'est pas affiché tel quel à l'utilisateur. | | |
| 22 (E) Indicateur de chargement | Throttling « Slow 3G », lancer une recherche | Un message « Chargement… » s'affiche et disparaît à la fin, succès ou erreur. | | |
| 23 (L) Météo actuelle ≠ prévision du jour | Afficher une ville où `current.weather_code` diffère du code du jour (Lille le 17/11 : 0 vs 63) | Le bloc « maintenant » utilise `current`, la ligne du jour utilise `daily`. Les deux s'affichent sans erreur ni mélange. | | |
| 24 (L) Code météo inconnu | Simuler un `weather_code` absent de la table (ex. 999) | Libellé par défaut (« Conditions inconnues »), pas de « undefined » ni d'erreur. | | |
| 25 (L) Unités | Comparer l'affichage avec `current_units` / `daily_units` | Température en °C et vent en km/h, unité affichée à côté de chaque valeur. | | |

## 3. Récapitulatif (à remplir à la fin)

- Cas passés OK : __ / 25
- Cas KO à corriger : ______
- Bugs trouvés qui n'étaient pas dans le plan : ______
