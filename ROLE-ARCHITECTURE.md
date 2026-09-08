# Medi-Rappel — architecture multi-rôles

## Espaces

- `/` et `/roles` : sélection d'espace.
- `/patient/*` : application patient (rappels, traitements, symptômes, calendrier, historique, rapports).
- `/doctor` : portail médecin (agenda et briques cliniques).
- `/pharmacy` : portail pharmacie / ERP.
- `/dashboard` : administration / pilotage global.

Les anciennes routes patient `/app`, `/add`, `/calendar`, `/history`, `/reports`, `/add-symptom` et `/add-doctor` redirigent vers leur équivalent `/patient/*` afin de préserver les anciens liens.

Les anciennes interfaces HTML Replit sont conservées temporairement sous `/legacy/app`, `/legacy/doctor` et `/legacy/pharmacy` afin qu'elles ne prennent plus la priorité sur le routeur React.

## Rôle côté client

`RoleContext` définit actuellement quatre rôles : `patient`, `doctor`, `pharmacy`, `admin`. Le choix est sauvegardé dans `localStorage` pour préparer l'expérience multi-rôles et pourra ensuite être remplacé par le rôle renvoyé par l'API d'authentification.

IMPORTANT : le rôle stocké côté client est uniquement un mécanisme UX. Il ne constitue pas une autorisation de sécurité. Les API contenant des données sensibles doivent vérifier le rôle côté serveur.

## Étape de production recommandée

Créer une identité unifiée (table `users` ou fournisseur d'identité) avec : `id`, `email`, `passwordHash/providerId`, `role`, `isActive`, puis des profils spécialisés (`patient_profiles`, `doctor_profiles`, `pharmacy_memberships`). Le JWT/session doit porter l'identité et le serveur doit appliquer `requireRole(...)` sur chaque API privée.

Pour le patient multi-compte, ajouter `patientId` aux traitements, historiques, symptômes, médecins liés et autres objets actuellement globaux. Ne pas publier de vraies données de santé multi-utilisateurs avant cette migration et les tests d'isolation correspondants.
