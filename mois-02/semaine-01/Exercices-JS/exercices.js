// Comparaison de deux tableaux

const egal = (a, b) => JSON.stringify(a) === JSON.stringify(b);

// Ex 1 : somme(...nombres) reduce
//      : sum(...nombres) for loop

function somme(...nombres) {
  return nombres
    .filter((n) => Number.isFinite(n))
    .reduce((total, n) => total + n, 0);
}

function sum(...nombres) {
  let total = 0;
  for (const n of nombres) {
    if (Number.isFinite(n)) {
      total += n;
    }
  }
  return total;
}

console.assert(somme(1, 2, 3) === 6, "somme : cas normal");
console.assert(sum() === 0, "somme : aucun argument");
console.assert(somme(1, "a", 2) === 3, "somme : valeur non numérique ignorée");
console.assert(sum(-1, 1) === 0, "somme : nombres négatifs");
console.assert(somme(0.5, 0.25) === 0.75, "somme : décimaux");

// Ex 2 : fusionner(a, b) new Set
//      : merge(a, b) for loop , includes

function fusionner(a, b) {
  return [...new Set([...a, ...b])];
}

function merge(a, b) {
  const resultat = [];
  for (const x of [...a, ...b]) {
    if (!resultat.includes(x)) {
      resultat.push(x);
    }
  }
  return resultat;
}

console.assert(
  egal(fusionner([1, 2], [2, 3]), [1, 2, 3]),
  "fusionner : cas normal",
);
console.assert(egal(merge([], []), []), "fusionner : deux tableaux vides");
console.assert(
  egal(fusionner([1, 1], [2, 2]), [1, 2]),
  "fusionner : doublons dans un même tableau",
);
console.assert(egal(merge([], [1, 2]), [1, 2]), "fusionner : un tableau vide");

// Ex 3 : presenter(personne) déstructuration
//      : toPresent(personne) if statement

function presenter(personne) {
  const { prenom, nom, age, adresse } = personne;
  const texteAge = age != null ? `${age} ans` : "âge inconnu";
  const ville = adresse?.ville ?? "ville inconnue";
  return `${prenom} ${nom}, ${texteAge}, habite à ${ville}`;
}

function toPresent(personne) {
  let texteAge = "âge inconnu";
  if (personne.age !== undefined && personne.age !== null) {
    texteAge = `${personne.age} ans`;
  }

  let ville = "ville inconnue";
  if (personne.adresse && personne.adresse.ville) {
    ville = personne.adresse.ville;
  }

  return `${personne.prenom} ${personne.nom}, ${texteAge}, habite à ${ville}`;
}

console.assert(
  presenter({
    prenom: "Marie",
    nom: "Dupont",
    age: 30,
    adresse: { ville: "Lille" },
  }) === "Marie Dupont, 30 ans, habite à Lille",
  "presenter : cas normal",
);
console.assert(
  toPresent({
    prenom: "Marc",
    nom: "Martin",
    age: 0,
    adresse: { ville: "Paris" },
  }) === "Marc Martin, 0 ans, habite à Paris",
  "presenter : âge 0 est valide",
);
console.assert(
  presenter({ prenom: "Marie", nom: "Dupont" }) ===
    "Marie Dupont, âge inconnu, habite à ville inconnue",
  "presenter : âge et adresse absents",
);
console.assert(
  toPresent({ prenom: "Marie", nom: "Dupont", age: 30, adresse: {} }) ===
    "Marie Dupont, 30 ans, habite à ville inconnue",
  "presenter : adresse sans ville",
);

// Ex 4 : carresDesPairs(nombres) map
//      : squaresPairs(nombres) for loop

function carresDesPairs(nombres) {
  return nombres
    .filter((n) => Number.isInteger(n) && n % 2 === 0)
    .map((n) => n * n);
}

function squaresPairs(nombres) {
  const resultat = [];
  for (const n of nombres) {
    if (Number.isInteger(n) && n % 2 === 0) {
      resultat.push(n * n);
    }
  }
  return resultat;
}

console.assert(
  egal(carresDesPairs([1, 2, 3, 4]), [4, 16]),
  "carresDesPairs : cas normal",
);
console.assert(egal(carresDesPairs([]), []), "carresDesPairs : liste vide");
console.assert(
  egal(squaresPairs([-2, 0, "4"]), [4, 0]),
  "carresDesPairs : négatif, zéro et texte",
);

// Ex 5 : totalPanier(articles) reduce
//      : cartTotal(articles) for loop

function totalPanier(articles) {
  return articles.reduce(
    (total, article) => total + article.prix * article.quantite,
    0,
  );
}

function cartTotal(articles) {
  let total = 0;
  for (const article of articles) {
    total += article.prix * article.quantite;
  }
  return total;
}

console.assert(
  totalPanier([
    { nom: "cable", prix: 2, quantite: 3 },
    { nom: "adaptateur", prix: 5, quantite: 1 },
  ]) === 11,
  "totalPanier : cas normal",
);
console.assert(totalPanier([]) === 0, "totalPanier : panier vide");
console.assert(
  cartTotal([
    { nom: "a", prix: 10, quantite: 0 },
    { nom: "b", prix: 2.5, quantite: 2 },
  ]) === 5,
  "totalPanier : quantité 0 et prix décimal",
);

// Ex 6 : compterMots(mots) Object.hasOwn

function compterMots(mots) {
  const compte = {};
  for (const mot of mots) {
    compte[mot] = (Object.hasOwn(compte, mot) ? compte[mot] : 0) + 1;
  }
  return compte;
}

console.assert(
  egal(compterMots(["a", "b", "a"]), { a: 2, b: 1 }),
  "compterMots : cas normal",
);
console.assert(egal(compterMots([]), {}), "compterMots : liste vide");
console.assert(
  egal(compterMots(["constructor", "constructor"]), { constructor: 2 }),
  "compterMots : mot réservé",
);

// Ex 7 : estAnagramme(a, b) split("").sort().join("")

function conformer(texte) {
  return texte.toLowerCase().replaceAll(" ", "").split("").sort().join("");
}

function estAnagramme(a, b) {
  return conformer(a) === conformer(b);
}

console.assert(
  estAnagramme("Chien", "Niche") === true,
  "estAnagramme : cas normal",
);
console.assert(
  estAnagramme("", "") === true,
  "estAnagramme : deux textes vides",
);
console.assert(
  estAnagramme("Chien", " n i C h e") === true,
  "estAnagramme : majuscules et espaces",
);
console.assert(
  estAnagramme("abc", "abcc") === false,
  "estAnagramme : longueurs différentes",
);
console.assert(
  estAnagramme("chat", "chien") === false,
  "estAnagramme : lettres différentes",
);

// Ex 8 : fizzBuzz(n) if .. else .push()

function fizzBuzz(n) {
  const resultat = [];
  for (let i = 1; i <= n; i++) {
    if (i % 3 === 0 && i % 5 === 0) {
      resultat.push("FizzBuzz");
    } else if (i % 3 === 0) {
      resultat.push("Fizz");
    } else if (i % 5 === 0) {
      resultat.push("Buzz");
    } else {
      resultat.push(i);
    }
  }
  return resultat;
}

console.assert(
  egal(fizzBuzz(5), [1, 2, "Fizz", 4, "Buzz"]),
  "fizzBuzz : cas normal",
);
console.assert(egal(fizzBuzz(0), []), "fizzBuzz : n vaut 0");
console.assert(egal(fizzBuzz(1), [1]), "fizzBuzz : n vaut 1");
console.assert(egal(fizzBuzz(-3), []), "fizzBuzz : n négatif");
console.assert(
  fizzBuzz(15).at(-1) === "FizzBuzz",
  "fizzBuzz : 15 donne FizzBuzz",
);

// Ex 9 :  minMax(nombres) for .. if

function minMax(nombres) {
  if (nombres.length === 0) {
    throw new Error("Le tableau est vide");
  }
  let min = nombres[0];
  let max = nombres[0];
  for (const n of nombres) {
    if (n < min) min = n;
    if (n > max) max = n;
  }
  return { min, max };
}

console.assert(
  egal(minMax([3, 1, 2]), { min: 1, max: 3 }),
  "minMax : cas normal",
);
console.assert(
  egal(minMax([5]), { min: 5, max: 5 }),
  "minMax : un seul nombre",
);
console.assert(
  egal(minMax([-5, -1, -3]), { min: -5, max: -1 }),
  "minMax : nombres négatifs",
);

let erreur;
try {
  minMax([]);
} catch (e) {
  erreur = e;
}
console.assert(
  erreur instanceof Error,
  "minMax : tableau vide lance une erreur",
);
console.assert(
  erreur?.message === "Le tableau est vide",
  "minMax : message de l'erreur",
);

// Ex 10 : trierParAge(personnes) .sort()

function trierParAge(personnes) {
  return [...personnes].sort((a, b) => a.age - b.age);
}

const ana = { nom: "Ana", age: 30 };
const bob = { nom: "Bob", age: 20 };
const cleo = { nom: "Cléo", age: 25 };

console.assert(
  egal(trierParAge([ana, bob, cleo]), [bob, cleo, ana]),
  "trierParAge : cas normal",
);
console.assert(egal(trierParAge([]), []), "trierParAge : liste vide");
console.assert(
  egal(trierParAge([ana]), [ana]),
  "trierParAge : une seule personne",
);
console.assert(
  egal(
    trierParAge([
      { nom: "Zoe", age: 20 },
      { nom: "Léo", age: 0 },
      { nom: "Max", age: 20 },
    ]),
    [
      { nom: "Léo", age: 0 },
      { nom: "Zoe", age: 20 },
      { nom: "Max", age: 20 },
    ],
  ),
  "trierParAge : âge 0 et âges égaux",
);

const original = [ana, bob, cleo];

trierParAge(original);
console.assert(
  egal(original, [ana, bob, cleo]),
  "trierParAge : la liste d'origine n'a pas changé",
);
