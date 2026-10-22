


Test 1 : Premier chargement depuis l'API

- Ce que je fais : je vide localStorage  {localStorage.removeItem("todolist.tasks")}, je recharge la page.
- Ce qui s'est passé : 5 tâches apparaissent, chacune avec un badge « Normale ». Le pied de page indique le nombre de tâches restantes.
_____________________________________________________________

Test 2 : Ajouter une tâche avec une priorité urgente

- Ce que je fais :je tape « Ajoutez une tâche », je choisis « Priorité urgente », je clique sur « Ajouter ».
- Ce qui s'est passé : la tâche apparaît en bas de la liste avec un badge jaune « Urgente ». Le champ de texte est vidé, le menu revient sur « Priorité normale », et le compteur augmente de 1.

____________________________________________________________

Test 3 : Ajouter une tâche vide ou composée d'espaces

- Ce que je fais : je clique sur « Ajouter » avec le champ vide, puis je tape seulement des espaces et je clique à nouveau.
- Ce qui s'est passé : champ vide => le navigateur affiche un message « Veuillez renseigner ce champ ». Espaces seulement => rien n'est ajouté à la liste.

____________________________________________________________

Test 4 : Cocher et décocher une tâche

- Ce que je fais : je coche une tâche à faire, puis je la décoche.
- Ce qui s'est passé : cochée, le texte est barré et le compteur diminue de 1. Décochée, le texte n'est plus barré et le compteur remonte de 1.

_____________________________________________________________

Test 5 : Filtres « À faire » et « Faites »

- Ce que je fais : je coche deux tâches, puis je clique successivement sur « À faire », « Faites » et « Toutes ».
- Ce qui s'est passé : « À faire » n'affiche que les tâches non cochées. « Faites » n'affiche que les tâches cochées. « Toutes » les affiche toutes. Le bouton du filtre actif est mis en évidence.

_____________________________________________________________

Test 6 : Supprimer une tâche

- Ce que je fais : je clique sur la corbeille d'une tâche.
- Ce qui s'est passé : la tâche disparaît immédiatement, le compteur est mis à jour, et elle ne revient pas après un rechargement de la page.

_____________________________________________________________

Test 7 : Supprimer les tâches terminées

- Ce que je fais : je décoche toutes les tâches et je regarde le bouton « Supprimer les tâches terminées ». Puis je coche deux tâches et je clique sur ce bouton.
- Ce qui s'est passé : sans tâche cochée, le bouton est grisé et ne réagit pas. Avec deux tâches cochées, elles disparaissent d'un coup et les autres restent.

_____________________________________________________________

Test 8 : La sauvegarde survit au rechargement

- Ce que je fais : j'ajoute une tâche « Test sauvegarde » en priorité basse, j'en coche une autre, puis je recharge la page.
- Ce qui s'est passé : la tâche ajoutée est toujours là avec son badge gris « Basse », l'autre tâche est toujours cochée. 