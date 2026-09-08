# Correct default mobile home

The previous Android build opened the obsolete green static interface because Vite used `client/index.html` as its production entry point, and that file was itself the old standalone UI.

This version fixes the root cause:

- `client/index.html` is now a normal Vite/React bootstrap file.
- React starts through `client/src/main.tsx`.
- `/` and `/app` resolve to `LegacyPatientHome` in the packaged application.
- `LegacyPatientHome` loads `/patient-app.html`.
- `client/public/patient-app.html` is an exact copy of the original Replit `client/simple.html` interface (the "Gestion des traitements" UI).
- The Express web route `/app` continues to serve `client/simple.html` directly.

Result: web `/app` and the Android APK both use the same desired patient interface.
