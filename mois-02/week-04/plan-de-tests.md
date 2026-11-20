# Plan de tests : appli météo

Appli : recherche d'une ville → choix d'un résultat → météo actuelle + 5 prochains jours.
APIs : Open-Meteo Geocoding (`/v1/search`) et Open-Meteo Forecast (`/v1/forecast`).

> « Résultat obtenu » et « OK / KO » restent vides : on les remplira en testant l'appli .

## 1. Notes d'exploration de l'API

| Appel | Ce que renvoie l'API |
|---|---|
| `name=Lille&count=5&language=en` | HTTP 200, objet `{ results: [...], generationtime_ms }`. 5 « Lille » : France, Belgique, Estonie (×2), États-Unis. Chaque résultat a `name`, `latitude`, `longitude`, `country`, `country_code`, `timezone`. |
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
- **Le jour 0 de `daily` est aujourd'hui** : avec `forecast_days=5` on a aujourd'hui + 4 jours, pas 5 jours à venir. À trancher au J2 : garder 5 lignes dont « Today » en première, ou passer à `forecast_days=6`.
- **`current` et `daily` peuvent se contredire** : ici `current.weather_code` = 0 (ciel dégagé) alors que le code du jour = 63 (pluie modérée): `current` = maintenant, `daily` = résumé de la journée.
- Les unités ne sont pas figées : lire `current_units` / `daily_units` plutôt que d'écrire « °C » et « km/h » en dur.
- `timezone=auto` : les dates sont dans le fuseau de la ville, pas celui du navigateur.

## 2. Cas de test

Types : **N** = normal, **L** = limite, **E** = erreur.

| Cas | Action | Résultat attendu | Résultat obtenu | OK / KO |
|---|---|---|---|---|
| 1 (N) Recherche simple | Saisir « Lille », cliquer sur Search | Liste de résultats (jusqu'à 5), chacun avec nom + région/pays pour les distinguer. Aucune météo affichée tant qu'on n'a pas choisi. | | |
| 2 (N) Choix d'un résultat | Après le cas 01, cliquer sur « Lille, Hauts-de-France, France » | Météo actuelle (température, vent, description) + 5 jours (date, min, max, description). Nom de la ville affiché. | | |
| 3 (N) Recherche à la touche Entrée | Saisir « Lyon », appuyer sur Entrée (sans cliquer) | Même comportement qu'un clic sur le bouton. | | |
| 4 (N) Pas de requête à chaque lettre | Taper « Marseille » lettre par lettre, sans valider ; ouvrir l'onglet Réseau | **0** requête envoyée pendant la frappe. 1 seule requête après le clic/Entrée. | | |
| 5 (N) Nombre de jours | Afficher la météo d'une ville | 5 lignes de prévisions, dans l'ordre chronologique, dates en anglais lisibles. La première ligne est aujourd'hui (jour 0 de l'API), libellée « Today ». | | |
| 6 (L) Nom avec trait d'union et accent | Rechercher « Saint-Étienne » | Résultats corrects (Saint-Étienne, Loire en tête), accent et tiret bien affichés, pas de caractère cassé. Idem sans accent : « saint etienne ». | | |
| 7 (L) Espaces autour du texte | Saisir `   Lille   ` (espaces avant/après) | Les espaces sont retirés (`trim`), résultat identique au cas 01. | | |
| 8 (L) Nom ambigu | Rechercher « Paris » | Plusieurs résultats (Paris FR, mais aussi Paris aux États-Unis, etc.), chacun distinguable par région/pays. L'utilisateur choisit celui qu'il veut. | | |
| 9 (L) Nom avec espace interne | Rechercher « La Rochelle » | Résultat correct. L'espace est bien encodé dans l'URL (`encodeURIComponent`). | | |
| 10 (L) Deux lettres | Rechercher « ab » | Peu de résultats (3 côté API, moins que `count`) mais valides. Affichage correct avec accents (« Āb »), sans région ni population, sans « undefined ». | | |
| 11 (L) Une seule lettre | Rechercher « a » | Aucune requête envoyée (onglet Réseau vide). Message « Enter at least 2 letters. ». La liste et la météo déjà affichées restent visibles.| | |
| 12 (L) Résultat avec champs manquants | Choisir un résultat sans `admin1` ou sans `population` (ex. petit village) | L'affichage ne casse pas et n'affiche pas « undefined ». | | |
| 13 (L) Nouvelle recherche après un résultat | Afficher la météo de Lille puis rechercher « Nice » | Ancienne liste et ancienne météo remplacées, pas de doublons ni de mélange. | | |
| 14 (L) Double clic rapide | Cliquer deux fois très vite sur Search | Pas de résultats en double. Bouton désactivé pendant le chargement ou une seule requête gagnante. | | |
| 15 (L) Caractères spéciaux / injection | Saisir `<b>test</b> & "x"` | Pas de HTML injecté dans la page (utiliser `textContent`). Pas d'erreur. Message « No results found for "... » probable. | | |
| 16 (E) Ville introuvable | Rechercher « xyxrx » | Message « No results found for "xyxrx". » (pas en rouge). Pas d'erreur console, pas de liste vide muette. | | |
| 17 (E) Champ vide | Cliquer sur Search sans rien saisir | Aucune requête envoyée. Message « Enter a city name. ». La liste et la météo déjà affichées restent visibles. | | |
| 18 (E) Champ avec uniquement des espaces | Saisir `     ` puis Entrée | Traité comme un champ vide (cas 17) : message « Enter a city name. », liste et météo conservées. | | |
| 19 (E) Pas de connexion | Onglet Réseau → « Offline », rechercher une ville **jamais recherchée** (sinon le cache du navigateur peut répondre) | Message « Network problem: check your connection and try again. » en rouge. Pas de chargement infini, bouton réactivé, focus clavier redonné au champ. | | |
| 20 (E) Échec de la météo après une recherche réussie | La recherche marche, puis on coupe le réseau et on clique sur un résultat | Message d'erreur pour la météo. La liste de résultats reste visible pour réessayer. | | |
| 21 (E) Réponse serveur en erreur | Simuler un HTTP 500 / 429 (blocage de l'URL dans les DevTools), ou un HTTP 400 (ex. `latitude=900`) | Message d'erreur lisible en rouge, jamais « undefined ». 500 / 429 : « Server error (500). Please try again later. ». 400 : toujours un message de notre part (« Invalid search. Modify the text and try again. » pour la recherche, « Invalid coordinates. Check the latitude and longitude. » pour la météo), jamais le texte brut de l'API ; ce texte n'apparaît que dans la console. | | |
| 22 (E) Indicateur de chargement | Throttling « Slow 3G », lancer une recherche | Un message « Loading... » s'affiche et disparaît à la fin, succès ou erreur. | | |
| 23 (L) Météo actuelle ≠ prévision du jour | Afficher une ville où `current.weather_code` diffère du code du jour (Lille le 17/11 : 0 vs 63) | Le bloc « maintenant » utilise `current`, la ligne du jour utilise `daily`. Les deux s'affichent sans erreur ni mélange. | | |
| 24 (L) Code météo inconnu | Simuler un `weather_code` absent de la table (ex. 999) | Libellé par défaut, pas de « undefined » ni d'erreur. | | |
| 25 (L) Unités | Comparer l'affichage avec `current_units` / `daily_units` | Température en °C et vent en km/h, unité affichée à côté de chaque valeur. | | |
| 26 (N) Météo au clic | Rechercher « Lille », cliquer sur « Lille, Hauts-de-France, France » | « Loading... » puis la carte : nom + région + pays, température, description du temps, vent (avec unités). 1 requête `forecast?latitude=…&longitude=…&current=…&daily=…&timezone=auto&forecast_days=5`. | | |
| 27 (N) Prévisions sur 5 jours | Après le cas 26, lire la liste | 5 lignes : « Today » en première, puis le jour de la semaine en anglais (« Wednesday »…), chacune avec description, min et max avec l'unité. Min toujours inférieur ou égal au max. | | |
| 28 (L) Le jour affiché est le bon | Comparer chaque ligne avec un calendrier (la 1re ligne est AUJOURD'HUI). Refaire avec le fuseau du navigateur changé (DevTools > Sensors > Location/Timezone, ex. Los Angeles) | Les noms de jours (hors « Today ») sont identiques et corrects, quel que soit le fuseau du navigateur. | | |
| 29 (L) Description du temps | Lire la description pour plusieurs villes/jours (pluie, ciel dégagé, neige…) | Texte cohérent avec le code (voir `describeWeather`). Un code inconnu affiche « Unknown weather », jamais « undefined ». | | |
| 30 (L) Température à 0 ou négative, vent à 0 | Choisir une ville froide (ex. Oslo en hiver) | Valeurs affichées normalement (« 0 °C », « -4.5 °C », « 0 km/h »), jamais remplacées par un tiret ou un texte d'erreur. | | |
| 31 (E) Météo sans connexion | Rechercher une ville, passer en « Offline », cliquer sur la ville | « Network problem: check your connection and try again. » en rouge à la place de la carte. La liste reste visible. | | |
| 32 (E) Météo en erreur puis réessai | Après le cas 31, repasser « Online » et recliquer sur la ville | La carte s'affiche normalement. | | |
| 33 (E) Coordonnées invalides | Dans `api.js`, mettre temporairement `latitude: 900` dans l'appel (ou bloquer la requête) | Message rouge « Invalid coordinates. Check the latitude and longitude. ». Jamais « undefined » ni le texte brut de l'API. Remettre le code ensuite. | | |
| 34 (E) Serveur qui ne répond jamais | DevTools : bloquer/ralentir la requête sans fin (ou throttling personnalisé), lancer une recherche puis, dans un second essai, un clic sur une ville | Au bout d'environ 10 s : « Network problem: check your connection and try again. » en rouge. « Loading... » disparaît, bouton réactivé, focus dans le champ. | | |
| 35 (L) Envoi invalide après un résultat | Afficher la météo de Lille, puis vider le champ (ou saisir « a ») et envoyer | Le message d'erreur s'affiche, mais la liste des villes, la sélection et la carte météo restent visibles. | | |
| 36 (L) Erreurs annoncées | Lecteur d'écran (ou inspecteur d'accessibilité) sur une erreur | Les erreurs (rouge) ont `role="alert"` ; « Loading... » reste un simple statut. | | |

## 3. Récapitulatif (à remplir à la fin)

- Cas passés OK : __ / 36
- Cas KO à corriger : ______
- Bugs trouvés qui n'étaient pas dans le plan : ______
