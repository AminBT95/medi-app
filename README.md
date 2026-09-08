# Medi‑Rappel V2

Medi‑Rappel V2 regroupe une application patient responsive, une API Express/PostgreSQL, un dashboard web et un packaging Android via Capacitor.

## Modules

- Traitements et rappels multi-heures
- Historique des prises et observance
- Calendrier santé
- Symptômes
- Médecins
- Rapports
- Notifications locales Android
- Dashboard `/dashboard`
- ERP médical `/erp`
- Gestion pharmacie `/pharmacy`
- API REST Express + schéma Drizzle/PostgreSQL

## Lancer en local

```bash
cp .env.example .env
npm install
npm run dev
```

Application patient: `http://localhost:5000/app`  
Dashboard: `http://localhost:5000/dashboard`

## Générer l'APK via GitHub

1. Créer un dépôt GitHub et pousser ce projet sur `main`.
2. Déployer l'API sur un hébergeur Node avec PostgreSQL.
3. Dans GitHub > Settings > Secrets and variables > Actions > Variables, créer `MEDI_API_URL` avec l'URL HTTPS de l'API, par exemple `https://api.medirappel.com`.
4. Ouvrir Actions > **Build Medi-Rappel Android** > Run workflow, ou pousser sur `main`.
5. Télécharger l'artifact `Medi-Rappel-Android`, qui contient l'APK installable et l'AAB de test.

> L'APK généré par ce workflow est signé avec la clé debug Android. Pour une publication Google Play, configurez une clé de signature release privée dans GitHub Secrets et utilisez un build release.

## Build Android local

Prérequis: Node 22, Java 21 et Android SDK.

```bash
npm install
npm run build:web
npx cap add android   # seulement la première fois
npm run mobile:sync
npm run mobile:apk
```

## Variables d'environnement

Voir `.env.example`. `VITE_API_URL` est indispensable pour un APK connecté à un backend distant. `SEED_DATABASE` reste `false` en production afin de ne pas injecter de données de démonstration au redémarrage.

## Sécurité production

- Utiliser HTTPS uniquement.
- Restreindre `CORS_ORIGINS` aux domaines autorisés.
- Garder `DATABASE_URL`, secrets JWT et clés de signature hors du dépôt Git.
- Ajouter une authentification patient complète avant de stocker de vraies données médicales multi-utilisateurs.

## Espaces multi-rôles (V2.1)

L'application est maintenant séparée en quatre expériences : Patient (`/patient/app`), Médecin (`/doctor`), Pharmacie (`/pharmacy`) et Administration (`/dashboard`). L'écran `/roles` permet de changer d'espace et mémorise le choix sur l'appareil. Voir `ROLE-ARCHITECTURE.md` pour la stratégie d'authentification/permissions à mettre en production.
