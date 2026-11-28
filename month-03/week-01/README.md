# Mini boutique : Product, Cart et héritage

**Démo en ligne :** https://walidysf05.github.io/formation-web/month-03/week-01/demo.html

Une petite boutique en JavaScript (sans framework) : des produits, un panier,
des codes promo et un achat « tout ou rien ». Les prix sont stockés en
**centimes** (entiers) pour éviter les erreurs des nombres décimaux
(`0.1 + 0.2 !== 0.3`).


## Lancer le projet

Les modules JavaScript (`import` / `export`) ne marchent pas en ouvrant le
fichier directement (`file://`). Il faut un petit serveur local, par exemple
l'extension **Live Server** de VS Code.

## Les fichiers

| Fichier | Rôle |
|---|---|
| `product.js` | `Product` : nom, prix (centimes) et stock privés |
| `perishable-product.js` | `PerishableProduct` : produit avec une date limite |
| `digital-product.js` | `DigitalProduct` : produit numérique, stock illimité |
| `cart.js` | `Cart` : panier, code promo et achat (`checkout`) |
| `promo.js` | `PromoCode` : code promo (code + pourcentage) |
| `validation.js` | vérification partagée : entier strictement positif |
| `money.js` | `formatEuro` : affichage d'un prix en euros |
| `demo.html` + `demo.js` | page de démonstration |
| `test.html` + `all.test.js` | page qui lance tous les tests dans le navigateur |
| `tests.js` | mon petit outil de test : `test`, `assertEqual`, `assertThrows` |
| `all.test.js` | un fichier de tests par classe |

## Schéma des classes

```
                   +-----------------------+
                   | Product               |
                   | #name                 |
                   | #price                |
                   | #stock                |
                   | isAvailable()         |
                   | removeFromStock()     |
                   | toString()            |
                   | fromObject() (static) |
                   +-----------------------+
                               ^ herite de
            +------------------+----------------+
            |                                   |
+--------------------+              +------------------------+
| PerishableProduct  |              | DigitalProduct         |
| #expirationDate    |              | #sizeMb                |
| isExpired()        |              | stock = Infinity       |
| isAvailable() (ov) |              | isAvailable() (ov)     |
+--------------------+              | removeFromStock() (ov) |
                                    +------------------------+

+--------------------------+
| Cart                     |    contient      +---------+
| #lines                   |  ------------->  | Product |
| #promoCode               |                  +---------+
| add(), remove(), clear() |
| applyCode(), checkout()  |    utilise       +---------------------+
| itemCount, total,        |  ------------->  | PromoCode           |
| totalToPay, lines        |                  | #code               |
+--------------------------+                  | #percent            |
                                              | apply()             |
                                              | fromText() (static) |
                                              +---------------------+
```

- **Hérite de qui ?** `PerishableProduct` et `DigitalProduct` héritent de `Product`.
- **Qui utilise qui ?** `Cart` contient des `Product` (ses lignes) et au plus
  un `PromoCode`. `Cart` n'a pas besoin de connaître le type exact d'un produit.
- **(ov)** : méthode redéfinie (override) par la classe fille.
- **(static)** : méthode qui s'appelle sur la classe.

## Les classes

- `Product` : un produit avec un prix privé (en centimes) et un stock privé.
  `Product.fromObject({ name, price, stock })` crée un produit à partir d'un objet simple.
- `PerishableProduct extends Product` : ajoute une date limite et la méthode `isExpired()`.
  `isAvailable()` appelle `super.isAvailable(...)` et vérifie aussi que le produit n'est pas périmé.
- `DigitalProduct extends Product` : ajoute `sizeMb`. Le stock est illimité, donc
  `isAvailable()` et `removeFromStock()` sont redéfinies.
- `PromoCode` : un code promo (code + pourcentage entier de 1 à 100). `apply(total)` renvoie
  le total remisé, arrondi avec `Math.round`. `PromoCode.fromText("soldes20")` cherche le code
  dans une liste de codes valides, sans tenir compte des majuscules ni des espaces.
- `Cart` : ne teste jamais le type d'un produit. Il appelle seulement `product.isAvailable(...)`,
  et chaque classe sait quoi répondre (polymorphisme).
  - `applyCode(promoCode)` : un seul code à la fois, le second remplace le premier.
  - `totalToPay` : le total après remise (`total` reste le prix avant remise).
  - `checkout()` : vérifie d'abord que tous les produits sont disponibles, puis retire les
    stocks, vide le panier et renvoie le total payé. En cas d'erreur, rien ne change (tout ou rien).

## Les règles de conception

- **Encapsulation** : les données sont privées (`#champ`) et lues par des getters.
- **Validation à l'entrée** : une valeur invalide lance une erreur (`throw`).
- **Un refus ne change rien** : on vérifie tout avant de modifier quoi que ce soit.
- **Copies défensives** : `lines` et `expirationDate` renvoient des copies.

## Trois choix de conception
 
### Pourquoi des centimes ?
 
Les nombres décimaux ne sont pas exacts en JavaScript : `0.1 + 0.2` ne donne pas `0.3`.
Pour de l'argent, une petite erreur de ce genre est inacceptable. Je stocke donc tous les prix
en **centimes**, avec des nombres entiers (`2990` pour 29,90 €), et je ne divise par 100
qu'au moment de l'affichage, dans `formatEuro`. Pour les remises, je multiplie avant de
diviser, puis j'arrondis au centime avec `Math.round`.
 
### Pourquoi des champs privés ?
 
Le prix et le stock sont privés (`#price`, `#stock`) et se lisent avec des getters, sans
setter : écrire `product.price = -5` ou `product.stock = 99` lance une erreur. Le stock ne
change que par `removeFromStock()`, qui vérifie la quantité avant de modifier. De la même
façon, `cart.lines` renvoie une copie : on ne peut pas contourner les vérifications de
`add()`. Toutes les règles sont ainsi au même endroit, et aucun objet ne peut devenir invalide.
 
### Pourquoi pas de `instanceof` dans le panier ?
 
`Cart` ne teste jamais le type d'un produit : il appelle seulement `product.isAvailable(...)`.
Chaque classe sait quoi répondre : un `DigitalProduct` dit toujours oui, un
`PerishableProduct` périmé dit non, un `Product` compare avec son stock. Grâce à cela (le
polymorphisme), on peut ajouter un nouveau type de produit sans changer une ligne de `Cart`.
Le panier vérifie seulement qu'un code promo est bien un `PromoCode`, ce qui n'est pas un produit.
 
## Un bug que mes tests m'ont fait trouver
 
`isAvailable()` acceptait n'importe quelle quantité : `isAvailable(-1)` renvoyait `true`, et
`isAvailable("2")` marchait par conversion automatique. En écrivant un test pour les quantités
invalides, j'ai vu qu'il ne lançait aucune erreur : le test a échoué avec
« expected an error, but none was thrown ».
 
J'ai corrigé en appelant `assertPositiveInteger` au début de `isAvailable()` dans `Product`, et
aussi dans `DigitalProduct` qui la redéfinit. Dans `PerishableProduct`, j'ai mis
`super.isAvailable(quantity)` **avant** le test de péremption : sinon un produit périmé aurait
renvoyé `false` au lieu de lancer l'erreur. Trois tests échouaient avant la correction, et tous
passent maintenant.

## Les tests

Pour les lancer : ouvrir `test.html` avec Live Server. Chaque test s'affiche dans la page
(✔ en vert, ✘ en rouge avec le message d'erreur). avec
(`assertEqual` / `assertThrows`), répartis en un fichier par classe :

| Fichier | Tests |
|---|---|
| `product.test.js` | 30 |
| `cart.test.js` | 44 |
| `perishable-product.test.js` | 11 |
| `digital-product.test.js` | 7 |
| `promo.test.js` | 20 |
| `polymorphism.test.js` (le panier avec les trois types de produit) | 5 |

### Pourquoi mon propre outil et pas `console.assert` ?

J'ai gardé mon outil (`tests.js`) pour ces raisons :

- **`assertThrows(fn)` est l'équivalent de `doitLancerUneErreur`** : un `try / catch` qui
  réussit seulement si la fonction lance une erreur.
- **Chaque test a un nom descriptif** (« a refused checkout() changes nothing... ») affiché
  dans la page, et un échec donne un message lisible (`expected 5, got 3`).
- **Chaque classe a son fichier de tests**, lancés tous ensemble par `all.test.js`.
- La suite est bien plus large.

### Ce qui est couvert

| Demandé | Exemple de test |
|---|---|
| cas normaux | « total is in cents: 2 x 2990 + 1 x 1550 = 7530 », « applyCode() lowers totalToPay » |
| quantité 1 | « add() puts a product in the cart (quantity 1 by default) » |
| stock exactement égal | « add() accepts exactly the available stock » |
| remise de 100 % | « 100 % makes the cart free » |
| panier vide | « a new cart is empty », « checkout() of an empty cart does nothing and returns 0 » |
| prix négatif | « rejects a negative price » |
| quantité 0, 1.5 ou texte | « add() rejects 0, negative, decimal or non-number quantities » |
| stock insuffisant | « add() refuses when the stock is too low » |
| produit périmé | « the Cart refuses an expired PerishableProduct » |
| code inconnu | « fromText() throws for an unknown code » |

### Casser le code volontairement

Pour vérifier qu'un test échoue vraiment, j'ai fusionné les deux boucles de `checkout()`
en une seule. Le test
« a refused checkout() changes nothing: cart, promo code and stocks » a échoué avec
`expected 5, got 3`. J'ai ensuite remis le code d'origine.

## Pourquoi `PerishableProduct` hérite de `Product` et pas l'inverse ?

Un produit périssable **est un** produit (un cas particulier), mais un produit n'est pas toujours périssable. La classe mère contient ce qui est commun à tous les produits (nom, prix, stock), et la classe fille ajoute seulement ce qui lui est propre (la date limite).
Dans l'autre sens, chaque `Product` aurait une date limite et une méthode `isExpired()`, ce qui n'a aucun sens pour un clavier ou un e-book.
