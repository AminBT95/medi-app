# Patient app home restored

The patient home is now the original Replit `/app` UI from `client/simple.html`.

## Routing
- `/` -> original patient UI in Capacitor/SPA shell
- `/app` -> original Replit patient UI
- `/patient/app` -> same patient UI, preserving the multi-role architecture
- `/roles` -> role selector
- `/doctor` -> doctor space
- `/pharmacy` -> pharmacy space
- `/dashboard` -> admin dashboard

## Android / Capacitor
`patient-app.html` is copied through Vite's `client/public` directory and embedded full-screen by `LegacyPatientHome.tsx`. This keeps the exact original interface available in the APK.

The parent passes `VITE_API_URL` to the legacy patient page so medication autocomplete/info API calls can work from a native WebView.
