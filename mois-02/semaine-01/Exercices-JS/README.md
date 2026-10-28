# Exercices JavaScript

Six fonctions JavaScript écrites avec des tests `console.assert`, chacune dans deux versions pour comparer les méthodes.

## Méthode

Pour chaque exercice :

1. J'écris 3 tests avant de coder : un cas normal, un cas limite et un cas inattendu.
2. J'écris la fonction.
3. Je vérifie avec `console.assert`.
4. Je casse volontairement la solution pour vérifier que mes tests détectent l'erreur.

Pour comparer deux tableaux ou deux objets, j'utilise `JSON.stringify(a) === JSON.stringify(b)`.

## Lancer les tests

Ouvrir `index.html` dans le navigateur, puis ouvrir la console (F12).

> [!NOTE]
> `console.assert` n'affiche rien quand le test passe. Aucun message d'erreur signifie donc que tous les tests passent.

## Résumé

Chaque exercice a une fonction principale et une seconde version, toutes les deux écrites dans `exercices.js`. Les tests sont répartis entre les deux versions.

| Exercice | Fonction         | Méthode principale           | Seconde version                 |
| -------- | ---------------- | ---------------------------- | ------------------------------- |
| 1        | `somme`          | `filter` + `reduce`          | `sum` : boucle `for...of`       |
| 2        | `fusionner`      | `Set`                        | `merge` : boucle et `includes`  |
| 3        | `presenter`      | déstructuration, `?.`et `??` | `toPresent` : instructions `if` |
| 4        | `carresDesPairs` | `filter` + `map`             | `squaresPairs` : boucle         |
| 5        | `totalPanier`    | `reduce`                     | `cartTotal` : boucle            |
| 6        | `compterMots`    | `for...of` + `Object.hasOwn` | aucune                          |

## Ex 1 : `somme(...nombres)`

- **Ce que fait la fonction :** elle renvoie la somme de tous les nombres reçus, et `0` si on n'en donne aucun.
- **Pourquoi cette méthode :** `filter` ignore ce qui n'est pas un nombre et `reduce` additionne, avec `0` comme valeur de départ.
- **Difficulté :** sans le `0` de départ, `somme()` renvoie `undefined` et `somme(-1, 1)` donne `NaN`. Sans le filtre, `somme(1, "a", 2)` donnait `"1a2"` au lieu de `3`.

## Ex 2 : `fusionner(a, b)`

- **Ce que fait la fonction :** elle fusionne deux tableaux sans doublons.
- **Pourquoi cette méthode :** `[...new Set([...a, ...b])]` est la plus courte, car un `Set` garde chaque valeur une seule fois, dans l'ordre d'arrivée.
- **Difficulté :** `[1, 2] === [1, 2]` est toujours `false`, donc j'ai dû comparer mes résultats avec `JSON.stringify`.

## Ex 3 : `presenter(personne)`

- **Ce que fait la fonction :** elle renvoie une phrase de présentation, avec « âge inconnu » ou « ville inconnue » si une information manque.
- **Pourquoi cette méthode :** `age != null` et `adresse?.ville ?? "ville inconnue"` ne confondent pas `0` avec une valeur absente.
- **Difficulté :** avec `if (age)`, un âge de `0` était pris pour un âge absent, et `adresse.ville` plantait avec une `TypeError` quand `adresse` n'existait pas.

## Ex 4 : `carresDesPairs(nombres)`

- **Ce que fait la fonction :** elle renvoie les carrés des nombres pairs d'un tableau.
- **Pourquoi cette méthode :** `filter` puis `map` se lit comme l'énoncé : on garde les entiers pairs, puis on élève au carré.
- **Difficulté :** le texte `"4"` passait pour un nombre pair (`"4" % 2` vaut `0`), il a fallu ajouter `Number.isInteger`.

## Ex 5 : `totalPanier(articles)`

- **Ce que fait la fonction :** elle calcule le total d'un panier d'objets `{ nom, prix, quantite }`, et `0` pour un panier vide.
- **Pourquoi cette méthode :** `reduce` avec `0` comme valeur de départ suit le même principe que `somme`.
- **Difficulté :** remplacer `*` par `+` donnait le bon résultat sur le cas normal par hasard. Seul le test avec une quantité de `0` détectait l'erreur.

## Ex 6 : `compterMots(mots)`

- **Ce que fait la fonction :** elle renvoie le nombre d'occurrences de chaque mot sous forme d'objet.
- **Pourquoi cette méthode :** la boucle `for...of` avec `Object.hasOwn` est la version la plus facile à suivre pas à pas.
- **Difficulté :** un mot comme `"constructor"` existe déjà dans un objet vide à cause de l'héritage. Avec la ligne suivante, le test « mot réservé » affiche `Assertion failed` :

```js
compte[mot] = (compte[mot] ?? 0) + 1;
```

> [!NOTE]
> Pour un objet qui contient une propriété `constructor`, l'aperçu de DevTools affiche `{}` alors que l'objet est bien `{ constructor: 2 }`. Pour voir le contenu réel, utiliser `JSON.stringify(...)`.

