# Audit V2 — points de production

## Corrigé dans cette V2

- L'écran principal fictif a été remplacé par les vraies pages React/API.
- Dashboard web responsive ajouté sur `/dashboard`.
- Packaging Android Capacitor préparé.
- Workflow GitHub APK/AAB ajouté.
- URL API externe configurable pour Android (`VITE_API_URL`).
- Notifications Android locales raccordées à la création d'un médicament.
- CORS configuré côté Express.
- Port serveur configurable (`PORT`).
- Seed automatique désactivé par défaut en production.
- Secret JWT obligatoire en production.
- Endpoint `/api/health` ajouté.

## À traiter avant données médicales réelles multi-utilisateurs

Le modèle historique de ce projet stocke les médicaments, symptômes, médecins et historiques sans `patientId` sur les tables principales. Les routes patient historiques sont donc globales. C'est acceptable pour une démo mono-utilisateur, mais pas pour un SaaS médical multi-utilisateurs.

Avant un lancement public, ajouter:
- table `patients/users` et authentification patient;
- `patientId` sur traitements, symptômes, historiques et médecins favoris;
- autorisation serveur sur chaque route;
- chiffrement/gestion des secrets et politique de rétention;
- journal d'audit des accès aux données de santé;
- sauvegardes et migrations versionnées;
- tests automatisés API/mobile.

Cette limitation est explicitement conservée pour ne pas casser les données et les modules ERP existants sans migration contrôlée.
