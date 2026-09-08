# Medi-Rappel V2 — /app UI/UX upgrade

## Corrigé
- `/app` est maintenant l'accueil patient officiel.
- `/` redirige vers `/app`.
- Le retour après ajout d'un médicament mène à `/app`.
- La navigation basse utilise `/app` pour Accueil.

## Nouveau design /app
- Header mobile plus propre et compatible safe-area Android.
- Hero santé avec progression d'observance quotidienne.
- Statistiques Prises / À venir / Manquées.
- Mise en avant automatique de la prochaine prise.
- Actions rapides : traitement, symptôme, médecin, rapports.
- Liste des rappels du jour conservant les vraies actions Pris / Manqué.
- Navigation bottom bar premium avec bouton Ajouter central.
- États vides plus utiles avec CTA.
- Responsive max-width mobile et meilleure lisibilité.

## Fonctionnel
Toutes les données restent branchées sur les endpoints existants :
- `/api/reminders/today`
- `/api/stats/today`
- `/api/history`
- formulaires médicament / symptôme / médecin existants.
