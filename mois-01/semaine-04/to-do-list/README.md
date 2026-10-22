

- URL : https://walidysf05.github.io/formation-web/



// Description //

C'est une petite application de liste de tâches, en HTML, Bootstrap et JavaScript, sans framework.
Elle permet de :

- Ajouter une tâche avec un titre et une priorité (basse, normale, haute ou urgente), affichée en badge de couleur.
- Cocher une tâche pour la marquer comme faite (le texte est alors barré), ou la supprimer avec la corbeille.
- Filtrer la liste : toutes, à faire ou faites.
- Voir combien de tâches restent à faire, et supprimer d'un coup toutes les tâches terminées.

Fonctionnement :

- L'état : toutes les tâches sont stockées dans un tableau tasks, et chaque action le modifie.
- L'affichage : après chaque modification, la fonction render() redessine la liste à partir de ce tableau en appliquant le filtre actif.
- La sauvegarde : le tableau est enregistré dans localstorage à chaque changement, donc tes tâches sont conservées au rechargement de la page.
- Les données de départ : au tout premier lancement, 5 tâches d'exemple sont récupérées depuis l'API JSONPlaceholder , puis enregistrées. Les lancements suivants lisent directement la sauvegarde.

Mes fichiers :


- index.html - contient la structure : formulaire, filtres, liste et pied de page avec le compteur.
- app.js - c'est le point d'entrée : il reprend les tâches sauvegardées, sinon il les charge depuis l'API, puis il lance la liste.
- functions/api.js - contient fetchJSON(), qui va chercher des données JSON sur internet.
- functions/dom.js - contient createElement(), qui crée un élément HTML avec ses attributs.
- functions/storage.js - contient saveTodos() et loadTodos(), qui enregistrent et relisent les tâches dans le localStorage.
- components/TodoList.js - contient la description d'une tâche (en JSDoc) et deux classes : TodoListItem, qui construit une ligne de la liste (case à cocher, texte, badge de priorité, corbeille), et TodoList, qui gère toute la liste (ajout, filtres, compteur, suppression).




//  « Ce que l’IA m’a aidé à comprendre » //

- En demandant de « corriger les points » de mon code, j'ai appris que mon HTML contenait une erreur (class="module" au lieu de type="module") et que mon appli devenait plus fiable en stockant les tâches dans un tableau JavaScript (tasks), puis en redessinant la liste avec render() au lieu de modifier le HTML à la main. Quand j'ai demandé des information sur la sauvegarde avec localStorage, j'ai compris que le navigateur peut garder des données d'une visite à l'autre, à condition de les convertir en texte avec JSON.stringify puis de les relire avec JSON.parse. Enfin, en demandant une explication rapide , j'ai pu relier chaque partie du code à ce qu'il m'a expliquer : l'appel à l'API au premier lancement, la sauvegarde, les filtres, le compteur et les badges de priorité.Enfin , je lui ai demandé de me faire un petit quiz avec des questions pour vérifier ce que j'ai compris .



// Ce que j'ai appris ce mois-ci  //

               
- J'ai commencé par le HTML, pour apprendre à structurer une page et à utiliser les bonnes balises. Je suis ensuite passé au CSS : j'ai ajouté du style, appris le positionnement, les flexbox et les grilles, puis les media queries pour rendre mes pages responsive, en m'entraînant sur des maquettes. J'ai ensuite découvert Git et GitHub : j'ai appris à configurer Git, à initialiser un dépôt, à suivre l'état de mes fichiers et à enregistrer mon travail par commits, ce qui m'a permis de sauvegarder et de publier mes projets en ligne. J'ai ensuite abordé le JavaScript en commençant par les bases : les variables, les conditions, les fonctions, les boucles, les classes et la gestion des erreurs. J'ai continué avec l'asynchrone, c'est-à-dire les timers, les promesses et les appels HTTP, que j'ai pratiqués avec des exercices et des TP. J'ai terminé par le JavaScript côté navigateur, avec la manipulation du DOM et les écouteurs d'événements. Je mets maintenant tout cela en pratique dans ma TodoList, qui regroupe les trois langages dans une seule application.        
