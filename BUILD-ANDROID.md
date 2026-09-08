# Génération Android — Medi‑Rappel

## Méthode recommandée: GitHub Actions

Le dépôt contient `.github/workflows/android-build.yml`.

1. Poussez le code sur GitHub.
2. Déployez le backend Express + PostgreSQL en HTTPS.
3. Ajoutez la variable Actions `MEDI_API_URL` avec l'URL du backend.
4. Lancez **Build Medi-Rappel Android** depuis l'onglet Actions.
5. Téléchargez l'artifact **Medi-Rappel-Android**.

Il contient:
- `Medi-Rappel-debug.apk` : APK installable pour test.
- `Medi-Rappel-debug.aab` : bundle Android de test.

## Publication Play Store

La version Play Store doit être signée avec une clé release privée. Ne commitez jamais le keystore ni ses mots de passe. Stockez-les dans GitHub Secrets et ajoutez une étape de signature release.

## Backend

Une app Android packagée n'héberge pas Express/PostgreSQL dans l'APK. Elle consomme le backend via `VITE_API_URL`. L'URL doit être HTTPS et accessible depuis le téléphone.
