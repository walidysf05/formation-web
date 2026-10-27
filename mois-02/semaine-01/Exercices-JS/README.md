
- Pour chaque exercice, j'ai écrit 3 tests avant de coder (cas normal, cas limite, cas inattendu), puis la fonction, puis j'ai vérifié avec console.assert. J'ai ensuite cassé volontairement chaque solution pour vérifier que mes tests détectent bien l'erreur.

- Dans exercices.js, la méthode principale est active et une seconde méthode est gardée en commentaire pour comparer.

Pour lancer les tests : ouvrez index.html, puis la console. Aucun message d'erreur donc tous les tests passent.

- Ex 1 : somme(...nombres)

Renvoie la somme de tous les nombres reçus, et 0 si on n'en donne aucun. J'ai choisi filter + reduce (la boucle for est en commentaire) : filter ignore ce qui n'est pas un nombre et reduce additionne. Difficulté : sans la valeur de départ 0, somme() renvoie undefined et somme(-1, 1) donne NaN, et un texte dans les arguments donnait "1a2" au lieu de 3.

- Ex 2 : fusionner(a, b)

Fusionne deux tableaux sans doublons. J'ai choisi [...new Set([...a, ...b])] (la version avec for et includes est en commentaire) parce qu'un Set garde chaque valeur une seule fois, dans l'ordre d'arrivée. Difficulté : [1, 2] === [1, 2] est toujours false en JavaScript, donc j'ai dû comparer mes résultats avec JSON.stringify.

- Ex 3 : presenter(personne)

Renvoie une phrase de présentation, avec « âge inconnu » ou « ville inconnue » si une information manque. J'ai choisi la déstructuration avec age != null et adresse?.ville ?? "ville inconnue" (la version avec des if est en commentaire), car elles ne confondent pas 0 avec une valeur absente. Difficulté : avec if (age), un âge de 0 était pris pour un âge absent, et adresse.ville plantait avec une TypeError quand adresse n'existait pas.

- Ex 4 : carresDesPairs(nombres)

Renvoie les carrés des nombres pairs d'un tableau. J'ai choisi filter puis map (la boucle for est en commentaire) : on garde d'abord les entiers pairs, puis on élève au carré, ce qui se lit comme l'énoncé. Difficulté : le texte "4" passait pour un nombre pair ("4" % 2 vaut 0), il a fallu ajouter Number.isInteger.

- Ex 5 : totalPanier(articles)

Calcule le total d'un panier d'objets { nom, prix, quantite }, et 0 pour un panier vide. J'ai choisi reduce avec 0 comme valeur de départ (la boucle for est en commentaire), car c'est le même principe que somme. Difficulté : remplacer * par + donnait le bon résultat sur le cas normal par hasard, seul le test avec une quantité de 0 détectait l'erreur.

- Ex 6 : compterMots(mots)

Renvoie le nombre d'occurrences de chaque mot sous forme d'objet. J'ai choisi une boucle for...of avec Object.hasOwn, qui est la version la plus facile à suivre . Difficulté : un mot comme "constructor" existe déjà dans un objet vide à cause de l'héritage.on cas de compte[mot] ?? 0 on attrape une "assertion failed" du mot réservé . 
