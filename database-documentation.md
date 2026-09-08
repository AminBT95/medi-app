# MediRappel - Documentation Base de Données

## Vue d'ensemble

MediRappel utilise une base de données PostgreSQL complète pour gérer trois domaines principaux :
1. **Gestion des patients et traitements** - Suivi médical et rappels de médicaments
2. **ERP Pharmacie** - Gestion complète des pharmacies (inventaire, ventes, clients)
3. **Interface médicale** - Prescriptions et suivi des patients

## Architecture des données

### 🏥 Gestion Médicale et Patients

#### **doctors** - Médecins
```sql
CREATE TABLE doctors (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  specialty TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```
- **Rôle** : Médecins prescripteurs
- **Relations** : → medications, prescriptions

#### **medications** - Médicaments du patient
```sql
CREATE TABLE medications (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  instructions TEXT NOT NULL,
  times TEXT[] NOT NULL,
  duration INTEGER,
  duration_type TEXT DEFAULT 'days',
  doctor_id INTEGER → doctors.id,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);
```
- **Rôle** : Traitements prescrits aux patients
- **Relations** : doctors ← → medication_history

#### **medication_history** - Historique des prises
```sql
CREATE TABLE medication_history (
  id SERIAL PRIMARY KEY,
  medication_id INTEGER → medications.id,
  scheduled_time TEXT NOT NULL,
  status TEXT NOT NULL, -- 'taken', 'missed', 'pending'
  actual_time TIMESTAMP,
  date TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```
- **Rôle** : Suivi des prises de médicaments par le patient
- **Relations** : medications ←

#### **symptoms** - Symptômes rapportés
```sql
CREATE TABLE symptoms (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  severity INTEGER NOT NULL,
  notes TEXT,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```
- **Rôle** : Symptômes saisis par les patients

### 🏪 ERP Pharmacie

#### **pharmacies** - Pharmacies
```sql
CREATE TABLE pharmacies (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  finess_number TEXT UNIQUE NOT NULL,
  address TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  opening_hours JSON NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);
```
- **Rôle** : Établissements pharmaceutiques
- **Index** : finess_number (numéro d'identification unique)

#### **pharmacy_users** - Utilisateurs pharmacie
```sql
CREATE TABLE pharmacy_users (
  id SERIAL PRIMARY KEY,
  pharmacy_id INTEGER → pharmacies.id,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  role TEXT NOT NULL, -- 'pharmacist', 'assistant', 'admin'
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```
- **Rôles** : pharmacist, assistant, admin
- **Relations** : pharmacies ←

#### **product_categories** - Catégories de produits
```sql
CREATE TABLE product_categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  parent_category_id INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);
```
- **Structure** : Hiérarchique (catégories/sous-catégories)

#### **products** - Catalogue produits
```sql
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  generic_name TEXT,
  barcode TEXT UNIQUE,
  cip_code TEXT UNIQUE,
  description TEXT,
  category_id INTEGER → product_categories.id,
  manufacturer TEXT,
  dosage TEXT,
  form TEXT,
  prescription_required BOOLEAN DEFAULT false,
  reimbursement_rate DECIMAL(5,2),
  public_price DECIMAL(10,2) NOT NULL,
  pharmacy_price DECIMAL(10,2) NOT NULL,
  contraindications TEXT[],
  side_effects TEXT[],
  precautions TEXT[],
  active_ingredients JSON,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```
- **Index** : barcode, cip_code, name
- **Spécificités** : Prix public/pharmacie, contraindications, principes actifs

### 📦 Gestion Inventaire

#### **pharmacy_inventory** - Stock par pharmacie
```sql
CREATE TABLE pharmacy_inventory (
  id SERIAL PRIMARY KEY,
  pharmacy_id INTEGER → pharmacies.id,
  product_id INTEGER → products.id,
  current_stock INTEGER DEFAULT 0,
  minimum_stock INTEGER DEFAULT 0,
  maximum_stock INTEGER DEFAULT 1000,
  location TEXT,
  expiry_date TIMESTAMP,
  batch_number TEXT,
  supplier_price DECIMAL(10,2),
  last_restock_date TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```
- **Index composé** : (pharmacy_id, product_id)
- **Gestion** : Stock min/max, péremption, emplacement

#### **suppliers** - Fournisseurs
```sql
CREATE TABLE suppliers (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  contact_person TEXT,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  payment_terms TEXT,
  delivery_days INTEGER DEFAULT 7,
  min_order_amount DECIMAL(10,2),
  is_active BOOLEAN DEFAULT true,
  rating DECIMAL(3,2),
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### **supplier_products** - Catalogue fournisseur
```sql
CREATE TABLE supplier_products (
  id SERIAL PRIMARY KEY,
  supplier_id INTEGER → suppliers.id,
  product_id INTEGER → products.id,
  supplier_product_code TEXT,
  supplier_price DECIMAL(10,2) NOT NULL,
  minimum_order_qty INTEGER DEFAULT 1,
  pack_size INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 📋 Gestion Commandes

#### **purchase_orders** - Commandes d'achat
```sql
CREATE TABLE purchase_orders (
  id SERIAL PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  pharmacy_id INTEGER → pharmacies.id,
  supplier_id INTEGER → suppliers.id,
  status TEXT NOT NULL, -- 'draft', 'sent', 'confirmed', 'delivered', 'cancelled'
  order_date TIMESTAMP DEFAULT NOW(),
  expected_delivery_date TIMESTAMP,
  actual_delivery_date TIMESTAMP,
  total_amount DECIMAL(10,2) NOT NULL,
  notes TEXT,
  created_by INTEGER → pharmacy_users.id,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```
- **Index** : order_number, status

#### **purchase_order_items** - Détails commandes
```sql
CREATE TABLE purchase_order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER → purchase_orders.id,
  product_id INTEGER → products.id,
  quantity_ordered INTEGER NOT NULL,
  quantity_received INTEGER DEFAULT 0,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  batch_number TEXT,
  expiry_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 👥 Gestion Clients

#### **customers** - Clients pharmacie
```sql
CREATE TABLE customers (
  id SERIAL PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth TIMESTAMP,
  national_id TEXT UNIQUE, -- CNI (Carte Nationale d'Identité)
  phone TEXT,
  email TEXT,
  address TEXT,
  social_security_number TEXT,
  loyalty_level TEXT DEFAULT 'regular',
  total_purchases DECIMAL(10,2) DEFAULT 0,
  visit_count INTEGER DEFAULT 0,
  last_visit TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```
- **Clé unique** : national_id (CNI) pour éviter la duplication
- **Fidélité** : loyalty_level, total_purchases, visit_count

### 💰 Gestion Ventes

#### **sales** - Ventes
```sql
CREATE TABLE sales (
  id SERIAL PRIMARY KEY,
  sale_number TEXT UNIQUE NOT NULL,
  pharmacy_id INTEGER → pharmacies.id,
  customer_id INTEGER → customers.id,
  cashier_id INTEGER → pharmacy_users.id,
  sale_date TIMESTAMP DEFAULT NOW(),
  payment_method TEXT NOT NULL, -- 'cash', 'card', 'check', 'insurance'
  subtotal DECIMAL(10,2) NOT NULL,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  amount_received DECIMAL(10,2),
  change_amount DECIMAL(10,2),
  prescription_id INTEGER,
  notes TEXT,
  is_refunded BOOLEAN DEFAULT false,
  refund_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```
- **Index** : sale_number, sale_date, customer_id

#### **sale_items** - Détails ventes
```sql
CREATE TABLE sale_items (
  id SERIAL PRIMARY KEY,
  sale_id INTEGER → sales.id,
  product_id INTEGER → products.id,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  reimbursement_amount DECIMAL(10,2) DEFAULT 0,
  batch_number TEXT,
  expiry_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 📜 Gestion Prescriptions

#### **prescriptions** - Ordonnances
```sql
CREATE TABLE prescriptions (
  id SERIAL PRIMARY KEY,
  prescription_number TEXT UNIQUE NOT NULL,
  customer_id INTEGER → customers.id,
  doctor_id INTEGER → doctors.id,
  prescription_date TIMESTAMP NOT NULL,
  validity_date TIMESTAMP NOT NULL,
  status TEXT NOT NULL, -- 'active', 'dispensed', 'expired', 'cancelled'
  is_chronic_treatment BOOLEAN DEFAULT false,
  renewal_number INTEGER DEFAULT 0,
  max_renewals INTEGER DEFAULT 0,
  notes TEXT,
  digital_signature TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```
- **Index composé** : (customer_id, doctor_id)

#### **prescription_items** - Détails ordonnances
```sql
CREATE TABLE prescription_items (
  id SERIAL PRIMARY KEY,
  prescription_id INTEGER → prescriptions.id,
  product_id INTEGER → products.id,
  quantity_prescribed INTEGER NOT NULL,
  quantity_dispensed INTEGER DEFAULT 0,
  dosage_instructions TEXT NOT NULL,
  duration TEXT,
  substitute_allowed BOOLEAN DEFAULT true,
  dispensed_product_id INTEGER → products.id,
  is_dispensed BOOLEAN DEFAULT false,
  dispensed_date TIMESTAMP,
  dispensed_by INTEGER → pharmacy_users.id,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 💼 Gestion Financière

#### **invoices** - Factures
```sql
CREATE TABLE invoices (
  id SERIAL PRIMARY KEY,
  invoice_number TEXT UNIQUE NOT NULL,
  pharmacy_id INTEGER → pharmacies.id,
  recipient_type TEXT NOT NULL, -- 'customer', 'insurance', 'supplier'
  recipient_name TEXT NOT NULL,
  recipient_address TEXT,
  issue_date TIMESTAMP DEFAULT NOW(),
  due_date TIMESTAMP NOT NULL,
  paid_date TIMESTAMP,
  status TEXT NOT NULL, -- 'draft', 'sent', 'paid', 'overdue', 'cancelled'
  subtotal DECIMAL(10,2) NOT NULL,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  payment_method TEXT,
  notes TEXT,
  created_by INTEGER → pharmacy_users.id,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 📊 Analytics & Audit

#### **sales_analytics** - Analyses des ventes
```sql
CREATE TABLE sales_analytics (
  id SERIAL PRIMARY KEY,
  pharmacy_id INTEGER → pharmacies.id,
  date TIMESTAMP NOT NULL,
  daily_sales DECIMAL(10,2) DEFAULT 0,
  transaction_count INTEGER DEFAULT 0,
  average_basket DECIMAL(10,2) DEFAULT 0,
  top_selling_product_id INTEGER → products.id,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### **audit_logs** - Journal d'audit
```sql
CREATE TABLE audit_logs (
  id SERIAL PRIMARY KEY,
  pharmacy_id INTEGER → pharmacies.id,
  user_id INTEGER → pharmacy_users.id,
  action TEXT NOT NULL, -- 'CREATE', 'UPDATE', 'DELETE', 'LOGIN'
  table_name TEXT NOT NULL,
  record_id INTEGER,
  old_values JSON,
  new_values JSON,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Relations Clés

### 🔗 Relations Principales

1. **Médical**
   - `doctors` ←→ `medications` ←→ `medication_history`
   - `doctors` ←→ `prescriptions` ←→ `prescription_items`

2. **Pharmacie**
   - `pharmacies` ←→ `pharmacy_users`
   - `pharmacies` ←→ `pharmacy_inventory` ←→ `products`
   - `pharmacies` ←→ `sales` ←→ `sale_items`

3. **Produits**
   - `product_categories` ←→ `products`
   - `suppliers` ←→ `supplier_products` ←→ `products`

4. **Client Centralisé**
   - `customers` (CNI unique) ←→ `sales`, `prescriptions`
   - Évite la duplication entre interfaces patient/pharmacie/médecin

### 🔐 Sécurité et Conformité

- **Audit complet** : Toutes les actions sensibles loggées
- **Authentification** : JWT + bcrypt pour les mots de passe
- **Isolation des données** : Par pharmacie via `pharmacy_id`
- **Traçabilité** : Historique des modifications avec timestamps

### 📈 Performance

- **Index optimisés** : Sur les clés de recherche fréquentes
- **Dénormalisation calculée** : Analytics et stats clients
- **Partitioning** : Par date pour les logs d'audit

## Types d'utilisation

1. **Interface Patient** : medications, medication_history, symptoms
2. **ERP Pharmacie** : Toutes les tables sauf les spécifiques patient
3. **Interface Médecin** : doctors, prescriptions, customers (via CNI)
4. **Synchronisation** : Via `national_id` (CNI) unique entre systèmes

Cette architecture permet une gestion complète et sécurisée des données médicales avec une séparation claire des responsabilités entre les différents acteurs du système de santé.