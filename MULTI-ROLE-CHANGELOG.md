# Multi-role update

- Ajout d'un RoleProvider avec rôles patient / doctor / pharmacy / admin.
- Nouvel écran premium de sélection d'espace.
- Namespace patient complet sous `/patient/*`.
- Redirections de compatibilité pour les anciennes routes.
- Nouveau portail Médecin React avec agenda du jour et KPIs.
- Nouveau portail Pharmacie React avec KPIs ERP et modules métier.
- Dashboard global conservé comme espace Administration.
- Le bouton paramètres de l'app patient permet de changer d'espace.
- Anciennes pages HTML Replit déplacées sous `/legacy/*` afin d'éviter les collisions avec le SPA.
- Documentation de la future authentification unifiée et de l'isolation patient.
