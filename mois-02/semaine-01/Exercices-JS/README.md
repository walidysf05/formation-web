# Exercices JavaScript

Huit fonctions JavaScript écrites avec des tests `console.assert`. Les exercices 1 à 5 existent dans deux versions pour comparer les méthodes.

## Méthode

Pour chaque exercice :

1. J'écris des tests avant de coder : un cas normal, un cas limite et un cas inattendu.
2. J'écris la fonction.
3. Je vérifie avec `console.assert`.
4. Je casse volontairement la solution pour vérifier que mes tests détectent l'erreur.

Pour comparer deux tableaux ou deux objets, j'utilise `egal(a, b)`, qui compare `JSON.stringify(a)` et `JSON.stringify(b)`. L'opérateur `===` ne convient pas : il compare l'identité des objets et non leur contenu. Pour un nombre, un texte ou un booléen, `===` suffit.

## Lancer les tests

Ouvrir `index.html` dans le navigateur, puis ouvrir la console (F12).

> [!NOTE]
> `console.assert` n'affiche rien quand le test passe. Aucun message d'erreur signifie donc que tous les tests passent.

## Résumé

Les exercices 1 à 5 ont une fonction principale et une seconde version, écrites toutes les deux dans `exercices.js`. Les tests sont répartis entre les deux versions. Les exercices 6 à 8 n'ont qu'une seule version.

| Exercice | Fonction         | Méthode principale                  | Seconde version                 |
| -------- | ---------------- | ----------------------------------- | ------------------------------- |
| 1        | `somme`          | `filter` + `reduce`                 | `sum` : boucle `for...of`       |
| 2        | `fusionner`      | `Set`                               | `merge` : boucle et `includes`  |
| 3        | `presenter`      | déstructuration, `?.` et `??`       | `toPresent` : instructions `if` |
| 4        | `carresDesPairs` | `filter` + `map`                    | `squaresPairs` : boucle         |
| 5        | `totalPanier`    | `reduce`                            | `cartTotal` : boucle            |
| 6        | `compterMots`    | `for...of` + `Object.hasOwn`        | aucune                          |
| 7        | `estAnagramme`   | `split("").sort().join("")`         | aucune                          |
| 8        | `fizzBuzz`       | `if` / `else if` + `push`           | aucune                          |

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

## Ex 7 : `estAnagramme(a, b)`

- **Ce que fait la fonction :** elle renvoie `true` si les deux textes ont les mêmes lettres, en ignorant les majuscules et les espaces.
- **Pourquoi cette méthode :** `conformer` met en minuscules, retire les espaces, puis trie les lettres avec `split("").sort().join("")`. Deux anagrammes donnent alors le même texte, et il suffit de les comparer avec `===`.
- **Difficulté :** sans `toLowerCase()`, `"Chien"` et `"Niche"` échouent, car `"C"` et `"c"` sont deux lettres différentes. Le test `"abc"` contre `"abcc"` vérifie qu'une lettre en trop est bien refusée. `replaceAll(" ", "")` ne retire que les espaces simples.

## Ex 8 : `fizzBuzz(n)`

- **Ce que fait la fonction :** elle renvoie un tableau de `1` à `n`, avec `"Fizz"` pour les multiples de 3, `"Buzz"` pour les multiples de 5 et `"FizzBuzz"` pour les deux.
- **Pourquoi cette méthode :** une boucle `for` avec `if` / `else if` et `push` suit l'énoncé ligne par ligne.
- **Difficulté :** le cas « les deux » doit venir en premier, sinon 15 donne `"Fizz"`.

