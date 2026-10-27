// Comparaison de deux tableaux

const egal = (a, b) => JSON.stringify(a) === JSON.stringify(b);

// Ex 1 : somme(...nombres) reduce
//      : somme(...nombres) for loop

function somme(...nombres) {
  return nombres
    .filter((n) => Number.isFinite(n))
    .reduce((total, n) => total + n, 0);
}
/* 
function somme(...nombres) {
  let total = 0;
  for (const n of nombres) {
    if (Number.isFinite(n)) {
      total += n;
    }
  }
  return total;
}
*/
console.assert(somme(1, 2, 3) === 6, "somme : cas normal");
console.assert(somme() === 0, "somme : aucun argument");
console.assert(somme(1, "a", 2) === 3, "somme : valeur non numérique ignorée");
console.assert(somme(-1, 1) === 0, "somme : nombres négatifs");
console.assert(somme(0.5, 0.25) === 0.75, "somme : décimaux");

// Ex 2 : fusionner(a, b) new Set
//      : fusionner(a, b) for loop , includes

function fusionner(a, b) {
  return [...new Set([...a, ...b])];
}
/*
function fusionner(a, b) {
  const resultat = [];
  for (const x of [...a, ...b]) {
    if (!resultat.includes(x)) {
      resultat.push(x);
    }
  }
  return resultat;
}
*/
console.assert(
  egal(fusionner([1, 2], [2, 3]), [1, 2, 3]),
  "fusionner : cas normal",
);
console.assert(egal(fusionner([], []), []), "fusionner : deux tableaux vides");
console.assert(
  egal(fusionner([1, 1], [2, 2]), [1, 2]),
  "fusionner : doublons dans un même tableau",
);
console.assert(
  egal(fusionner([], [1, 2]), [1, 2]),
  "fusionner : un tableau vide",
);

// Ex 3 : presenter(personne) déstructuration
//      : presenter(personne) if statement

function presenter(personne) {
  const { prenom, nom, age, adresse } = personne;
  const texteAge = age != null ? `${age} ans` : "âge inconnu";
  const ville = adresse?.ville ?? "ville inconnue";
  return `${prenom} ${nom}, ${texteAge}, habite à ${ville}`;
}
/* 
function presenter(personne) {
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
*/
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
  presenter({
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
  presenter({ prenom: "Marie", nom: "Dupont", age: 30, adresse: {} }) ===
    "Marie Dupont, 30 ans, habite à ville inconnue",
  "presenter : adresse sans ville",
);

// Ex 4 : carresDesPairs(nombres) map
//      : carresDesPairs(nombres) for loop

function carresDesPairs(nombres) {
  return nombres
    .filter((n) => Number.isInteger(n) && n % 2 === 0)
    .map((n) => n * n);
}
/*
function carresDesPairs(nombres) {
  const resultat = [];
  for (const n of nombres) {
    if (Number.isInteger(n) && n % 2 === 0) {
      resultat.push(n * n);
    }
  }
  return resultat;
}
*/
console.assert(
  egal(carresDesPairs([1, 2, 3, 4]), [4, 16]),
  "carresDesPairs : cas normal",
);
console.assert(egal(carresDesPairs([]), []), "carresDesPairs : liste vide");
console.assert(
  egal(carresDesPairs([-2, 0, "4"]), [4, 0]),
  "carresDesPairs : négatif, zéro et texte",
);

// Ex 5 : totalPanier(articles) reduce
//      : totalPanier(articles) for loop

function totalPanier(articles) {
  return articles.reduce(
    (total, article) => total + article.prix * article.quantite,
    0,
  );
}
/*
function totalPanier(articles) {
  let total = 0;
  for (const article of articles) {
    total += article.prix * article.quantite;
  }
  return total;
}
*/
console.assert(
  totalPanier([
    { nom: "cable", prix: 2, quantite: 3 },
    { nom: "adaptateur", prix: 5, quantite: 1 },
  ]) === 11,
  "totalPanier : cas normal",
);
console.assert(totalPanier([]) === 0, "totalPanier : panier vide");
console.assert(
  totalPanier([
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
