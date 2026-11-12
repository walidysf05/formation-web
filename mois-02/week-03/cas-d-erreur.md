# Cas d'erreur testés


## Tableau des cas

| # | Action | Résultat attendu | Résultat obtenu | Après refactoring |
|---|--------|------------------|-----------------|-----------------|
| 1 | Chercher `pikachu` (nom valide) | « Loading… » puis la carte | Rien ne s'affiche, erreur en console : `displayMessageMessage is not defined` (faute de frappe dans le nom de la fonction). Corrigé en `displayMessage` | ✅ |
| 2 | Afficher la carte d'un Pokémon | Image, taille et poids affichés | « No picture » à chaque fois et `undefined m · undefined kg` : `displayCard` lisait `image`, `taille`, `poids` au lieu de `picture`, `height`, `weight`. Corrigé en alignant les noms | ✅ |
| 3 | Valider le formulaire avec un champ vide (ou que des espaces) | Message d'erreur rouge, aucune requête envoyée | `Enter a Pokémon name before searching.` en rouge, 0 requête | ✅ |
| 4 | Chercher `xyz` (Pokémon inexistant, réponse 404) | Message « introuvable », bouton Search réactivé | `Pokémon "xyz" not found. Check the spelling.`, bouton réactivé | ✅ |
| 5 | Le serveur répond 500 | Message d'erreur serveur, bouton réactivé | `Server error (500). Please try again later.`, bouton réactivé | ✅ |
| 6 | Le réseau est coupé (`fetch` échoue) | Message de problème réseau, bouton réactivé | `Network problem: check your connection and try again.`, bouton réactivé | ✅ |
| 7 | Chercher `  Pikachu  ` (majuscule + espaces autour) | Requête vers `/pokemon/pikachu`, carte affichée | Requête `/pokemon/pikachu`, carte « pikachu » | ✅ |
| 8 | Parcourir la liste (première page, puis Next jusqu'à la dernière) | « Previous » désactivé page 1, « Next » désactivé sur la dernière page | Previous désactivé sur la page 1 ; sur la dernière page, Next est désactivé et Previous actif | ✅ |
| 9 | Cliquer deux fois sur le même nom | Une seule requête (le cache sert la deuxième fois) | 1 requête pour les 2 clics | ✅ |
| 10 | Local Storage corrompu (texte qui n'est pas du JSON) | L'appli démarre quand même, avec un cache vide | La liste s'affiche normalement (1 requête) | ✅ |


## Bugs trouvés et corrigés

**Bug A :** une faute de frappe dans le nom d’une fonction

La fonction s’appelle `displayMessage`. JavaScript ne trouve pas `displayMessageMessage` et lance une erreur avant d’avoir appelé l’API. Rien ne s’affichait, et seule la console montrait l’erreur `displayMessageMessage` is `not defined`.

**Correction :** `displayMessage("Loading…");`

**Bug B :** les noms de propriétés ne correspondaient pas

`formatPokemon` renvoyait picture, height et weight, mais `displayCard` lisait image, taille et poids.


if (p.image) { ... }        //  n'existe pas 
`${p.taille} m · ${p.poids} kg`  // n'existent pas

JavaScript ne signale pas d’erreur : il renvoie simplement `undefined`. D’après le code, le symptôme est donc : l’image n’apparaît jamais (« `No picture`» à chaque fois) et la carte affiche `undefined m · undefined kg`.

**Correction :** utiliser les mêmes noms partout.


## Rejeu après refactoring

Les 10 cas ont été rejoués sur la version découpée en modules (`app.js`, `api.js`, `cache.js`, `pokemon.js`, `ui.js`) : **10 ✅ sur 10**, comportement identique à celui de la colonne « Résultat obtenu ».


**`tests.html`** : rejoué, « All tests pass ✅ », 0 assertion en échec. 

## Bug causé par le refactoring

**Bug C : `tests.js` ne trouvait plus `formatPokemon`.** Une fois `formatPokemon` sortie de `app.js` pour aller dans `pokemon.js`, elle n'était plus une variable globale. `tests.js`, encore chargé par `index.html` comme script classique, plantait.

**Correction :** `tests.js` importe maintenant `formatPokemon` depuis `pokemon.js`, et il est chargé par une page à part, `tests.html`, avec `type="module"`. Il a été retiré de `index.html`.
