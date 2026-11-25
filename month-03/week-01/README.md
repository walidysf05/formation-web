# Mini boutique : Product, Cart et héritage

## Les classes

- `Product` : un produit avec un prix privé (en centimes) et un stock privé.
- `PerishableProduct extends Product` : ajoute une date limite et la méthode `isExpired()`.
  `isAvailable()` appelle `super.isAvailable(...)` et vérifie aussi que le produit n'est pas périmé.
- `DigitalProduct extends Product` : ajoute `sizeMb`. Le stock est illimité, donc
  `isAvailable()` et `removeFromStock()` sont redéfinies.
- `Cart` : ne teste jamais le type d'un produit. Il appelle seulement `product.isAvailable(...)`,
  et chaque classe sait quoi répondre (polymorphisme).

## Pourquoi `PerishableProduct` hérite de `Product` et pas l'inverse ?

Un produit périssable **est un** produit (un cas particulier), mais un produit n'est pas toujours périssable. La classe mère contient ce qui est commun à tous les produits (nom, prix, stock), et la classe fille ajoute seulement ce qui lui est propre (la date limite).
Dans l'autre sens, chaque `Product` aurait une date limite et une méthode `isExpired()`, ce qui n'a aucun sens pour un clavier ou un e-book.