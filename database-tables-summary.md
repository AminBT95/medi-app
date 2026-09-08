# MediRappel - Résumé des Tables Principales

## 📊 Vue d'ensemble du système

Le système MediRappel contient **21 tables principales** organisées en **6 domaines fonctionnels** :

| Domaine | Tables | Description |
|---------|---------|-------------|
| 🏥 **Médical** | 4 tables | Gestion des médecins, médicaments, historique prises |
| 🏪 **Pharmacies** | 3 tables | Établissements, utilisateurs, rôles |
| 📦 **Produits** | 4 tables | Catalogue, catégories, inventaire, fournisseurs |
| 💰 **Ventes** | 4 tables | Transactions, clients, détails ventes |
| 📜 **Prescriptions** | 2 tables | Ordonnances et leurs détails |
| 🔧 **Opérations** | 4 tables | Commandes, factures, analytics, audit |

---

## 🔑 Tables Centrales (Clés du Système)

### 1. **customers** - Hub Central
```
• Identification unique par CNI (national_id)
• Évite la duplication entre Patient/Pharmacie/Médecin
• Point de convergence des trois interfaces
• Stats de fidélité et historique complet
```

### 2. **products** - Catalogue Unifié
```
• CIP Code (Code Identifiant Présentation) unique
• Prix public/pharmacie différenciés
• Contraindications et effets secondaires
• Base commune pour prescriptions et ventes
```

### 3. **pharmacies** - Multi-établissements
```
• Identification FINESS (numéro d'établissement)
• Gestion indépendante par pharmacie
• Horaires d'ouverture configurables
• Support de chaînes de pharmacies
```

---

## 🔄 Flux de Données Principaux

### Flux Patient → Pharmacie
1. **Patient** prescrit des `medications` par un `doctor`
2. **Historique** des prises dans `medication_history`
3. **Synchronisation** via CNI dans `customers`
4. **Achat** en pharmacie via `sales` et `sale_items`

### Flux Médecin → Patient
1. **Médecin** crée `prescriptions` pour `customers`
2. **Détail** des médicaments dans `prescription_items`
3. **Référence** produits du catalogue `products`
4. **Suivi** des dispensations par les pharmacies

### Flux Pharmacie → Opérations
1. **Inventaire** géré dans `pharmacy_inventory`
2. **Commandes** fournisseurs via `purchase_orders`
3. **Réception** et mise à jour stock automatique
4. **Analytics** quotidien dans `sales_analytics`

---

## 🔐 Sécurité et Conformité

### Authentification par Domaine
| Interface | Table Auth | Champs |
|-----------|------------|---------|
| **Patient** | `medications` | Pas d'auth (CNI lookup) |
| **Médecin** | `doctors` | email + JWT simple |
| **Pharmacie** | `pharmacy_users` | email + password + rôle |

### Audit Complet
- **Toutes actions** loggées dans `audit_logs`
- **Traçabilité** complète des modifications
- **IP et User-Agent** pour compliance
- **Données sensibles** chiffrées (mots de passe bcrypt)

### Rôles Pharmacie
```
• admin     : Gestion complète de la pharmacie
• pharmacist: Dispensation, ventes, prescriptions
• assistant : Ventes, inventaire (lecture seule prescriptions)
```

---

## 📈 Performances et Optimisations

### Index Stratégiques
```sql
-- Recherche clients par CNI
CREATE INDEX national_id_idx ON customers(national_id);

-- Recherche produits par CIP/code-barres
CREATE INDEX cip_code_idx ON products(cip_code);
CREATE INDEX barcode_idx ON products(barcode);

-- Analytics par pharmacie/date
CREATE INDEX pharmacy_date_idx ON sales_analytics(pharmacy_id, date);

-- Audit par utilisateur/action
CREATE INDEX user_action_idx ON audit_logs(user_id, action);
```

### Requêtes Optimisées
- **Jointures** limitées aux relations nécessaires
- **Pagination** sur toutes les listes (ventes, produits, clients)
- **Cache** des statistiques pré-calculées
- **Partitioning** par date pour l'audit (volumes importants)

---

## 🌐 Multi-Interface Architecture

### Interface Patient (`simple.html`)
```
Tables utilisées:
├── medications (traitement en cours)
├── medication_history (historique prises)
├── symptoms (symptômes rapportés)
└── doctors (médecins prescripteurs)
```

### Interface Médecin (`/doctor`)
```
Tables utilisées:
├── doctors (profil médecin)
├── customers (patients par CNI)
├── prescriptions (ordonnances créées)
├── prescription_items (détails prescription)
└── products (médicaments disponibles)
```

### Interface Pharmacie (`pharmacy-erp.html`)
```
Tables utilisées:
├── pharmacies (établissement)
├── pharmacy_users (équipe)
├── products + pharmacy_inventory (stock)
├── customers (base clients)
├── sales + sale_items (ventes)
├── prescriptions (ordonnances à dispenser)
├── purchase_orders (approvisionnement)
├── suppliers (fournisseurs)
├── invoices (facturation)
└── sales_analytics (reporting)
```

---

## 🔄 Synchronisation et Cohérence

### Clé Universelle : CNI (Carte Nationale d'Identité)
- **Unicité garantie** : Un seul enregistrement par personne
- **Cross-platform** : Même client visible sur tous les systèmes
- **RGPD compliant** : Identifiant officiel et sécurisé
- **Évite duplication** : Pas de clients multiples

### Transactions ACID
- **Atomicité** : Vente = mise à jour stock + création facture
- **Cohérence** : Stock ne peut pas être négatif
- **Isolation** : Commandes simultanées gérées correctement
- **Durabilité** : Audit complet de toutes les opérations

### Gestion d'Erreurs
```sql
-- Contraintes métier
CHECK (current_stock >= 0)                    -- Stock positif
CHECK (total_amount >= subtotal)              -- Total cohérent
CHECK (validity_date > prescription_date)     -- Ordonnance valide
CHECK (quantity_dispensed <= quantity_prescribed) -- Dispensation limitée
```

---

## 🎯 Points Clés d'Architecture

### 1. **Séparation des Responsabilités**
- Chaque interface a ses tables spécifiques
- Partage des données via `customers` et `products`
- Isolation des pharmacies via `pharmacy_id`

### 2. **Extensibilité**
- Structure modulaire permettant d'ajouter de nouvelles pharmacies
- Support multi-établissements natif
- API REST séparée par domaine fonctionnel

### 3. **Conformité Métier**
- Respect des réglementations pharmaceutiques
- Traçabilité complète des médicaments
- Gestion des péremptions et lots
- Support des prescriptions chroniques

Cette architecture permet de gérer efficacement les trois aspects du système MediRappel tout en maintenant la cohérence des données et la sécurité requise pour un système de santé.