# Correction finale du bouton Rôles / Pro

Le 404 venait de deux environnements différents :

1. Sur le serveur web, `/pro` est une route Express qui sert `client/pro.html`.
2. Dans l'APK Capacitor, il n'existe pas de serveur Express local : une navigation directe vers `/pro` devait donc être gérée par React et non par Express.

Correction :
- `client/pro.html` est copié dans `client/public/pro-app.html` pour être embarqué dans le build Vite/Capacitor.
- React expose maintenant une vraie route `/pro` qui charge ce dashboard dans `LegacyProDashboard`.
- `/roles` fait une redirection SPA vers `/pro`.
- Le bouton Rôles de l'interface patient continue à envoyer `medi:navigate('/pro')` au parent React.
- Les changements de mode dans le dashboard Pro passent également par `postMessage` quand il est embarqué dans l'APK.

Résultat : `/pro` fonctionne aussi bien sur Replit/web que dans l'APK statique.
