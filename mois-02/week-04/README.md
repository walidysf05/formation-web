# Weather

**Démo en ligne :** [https://walidysf05.github.io/formation-web/mois-02/week-04/](https://walidysf05.github.io/formation-web/mois-02/week-04/)

## L'application

Une petite appli météo en HTML, CSS et JavaScript (modules), qui utilise l'API publique [Open-Meteo](https://open-meteo.com/) 

- **Recherche** : on tape une ville (bouton ou touche Entrée), jusqu'à 5 résultats, distingués par région et pays. La saisie est nettoyée avant l'appel à l'API.
- **Météo actuelle** : un clic sur un résultat affiche la température, le vent et une description du temps.
- **Prévisions sur 5 jours** : « Today », puis le jour de la semaine, avec le min et le max. Le jour affiché est celui de la ville, pas celui du navigateur.
- **Erreurs gérées** : champ vide ou d'une seule lettre, ville introuvable, réseau coupé, erreur serveur, serveur qui ne répond pas (timeout de 10 s).
- **Téléphone et clavier** : mise en page lisible dès 320 px, utilisation au clavier (Tab puis Entrée), erreurs annoncées aux lecteurs d'écran (`role="alert"`).

## Structure du projet

```
index.html        page principale
app.js            point d'entrée : état + écouteurs
api.js            appels à l'API (aucun accès à la page)
ui.js             affichage (aucun fetch)
weather.js        fonctions pures (codes météo, jours, mise en forme)
style.css         mise en forme
tests.html        page de tests
tests.js          tests de weather.js avec console.assert
plan-de-tests.md  39 cas testés à la main, avec les résultats
```

Qui utilise qui :

```
app.js
  +-- api.js --> weather.js
  +-- ui.js  --> weather.js
```

`api.js` n'importe jamais `ui.js`, et `ui.js` n'a pas de `fetch`.

## Lancer le projet

Les modules ne fonctionnent pas si on ouvre le fichier directement (`file://`). Il faut un petit serveur local, par exemple l'extension Live Server de VS Code.

Tests :

- `tests.html` : le résultat s'affiche dans la page (« All tests pass »).
- `plan-de-tests.md` : cas normaux, limites et erreurs, plus téléphone, clavier et contraste.

## Bugs trouvés pendant les tests

Bugs trouvés hors plan (téléphone, clavier, contraste), corrigés puis couverts par les cas 37 et 38 du plan de tests :

- [#16](https://github.com/walidysf05/formation-web/issues/16) : les prévisions se coupent sur un écran de téléphone (cas 37)
- [#17](https://github.com/walidysf05/formation-web/issues/17) : la carte météo est presque hors écran sur téléphone (cas 38)

## Bilan du mois 2

- Appris (semaine 1) : écrire les tests avant le code (cas normal, limite, inattendu) et casser la solution pour vérifier que les tests la détectent.
- Appris (semaines 2 et 3) : `fetch` ne rejette pas sur un 404 ou un 500, donc on vérifie `response.ok` ; et séparer le code en modules (`api`, `ui`, fonctions pures) rend chaque partie testable.
- Appris (semaine 4) : rejouer un plan de tests après chaque correctif, avec coupure réseau, téléphone et clavier, révèle des bugs qu'on ne voit pas (2 trouvés).
- Difficulté : les cas limites des données (`results` absent, champs manquants, `0` pris pour « absent ») et les dates avec les fuseaux horaires.
- À améliorer : automatiser aussi les tests de l'interface (clic, clavier, mobile) au lieu de tout rejouer à la main.
