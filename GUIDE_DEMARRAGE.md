# 🚀 Guide de Démarrage Rapide

## 📋 Prérequis

- **PHP 8.0+** avec extensions : `pdo`, `pdo_mysql`, `json`, `mbstring`
- **MySQL/MariaDB** ou **PostgreSQL**
- **Composer** (gestionnaire de dépendances PHP)

## ⚡ Installation Express

### 1. Cloner/Extraire le projet
```bash
# Si vous avez déjà le projet, passez à l'étape 2
cd /chemin/vers/votre/projet
```

### 2. Installer les dépendances
```bash
composer install
```

### 3. Configuration de la base de données
```bash
# Créer le fichier .env
cp env.example .env

# Éditer .env avec vos paramètres
# DB_HOST=localhost
# DB_NAME=pressing_db
# DB_USER=root
# DB_PASS=votre_mot_de_passe
```

### 4. Créer la base de données
```bash
# MySQL
mysql -u root -p -e "CREATE DATABASE pressing_db"

# Ou PostgreSQL
createdb pressing_db
```

### 5. Exécuter les migrations
```bash
php database/migrate.php
```

### 6. Charger les données de test
```bash
php database/seed.php
```

### 7. Tester la configuration
```bash
php start.php
```

### 8. Démarrer le serveur
```bash
php -S localhost:8000 -t public
```

### 9. Accéder à l'application
🌐 **http://localhost:8000**

## 🔐 Authentification

### Identifiants par défaut :
- **Email** : `admin@pressing.com`
- **Mot de passe** : `admin123`

## 🔄 Flux d'Authentification

### 1. **Page de Login** (`/login`)
- Formulaire de connexion
- Validation côté client et serveur
- Gestion des erreurs

### 2. **Authentification** (`POST /login`)
- Vérification des identifiants
- Création de session
- Redirection vers le dashboard

### 3. **Protection des Routes**
- Toutes les pages sont protégées sauf `/login`
- Redirection automatique si non authentifié
- Vérification de session sur chaque requête

### 4. **Dashboard** (`/` ou `/dashboard`)
- Page d'accueil après connexion
- Statistiques en temps réel
- Navigation vers tous les modules

## 📊 Modules Disponibles

### ✅ **Dashboard** (`/`)
- Vue d'ensemble du système
- Statistiques en temps réel
- Graphiques de performance

### ✅ **Gestion des Commandes** (`/orders`)
- Liste des commandes
- Création/modification/suppression
- Filtres et recherche
- Pagination

### ✅ **Gestion des Clients** (`/customers`)
- Base de données clients
- Historique des commandes
- Informations de contact

### ✅ **Paiements** (`/payments`)
- Suivi des transactions
- Génération de factures
- Statistiques financières

### ✅ **Suivi des Commandes** (`/tracking`)
- Recherche par numéro de commande
- Timeline de progression
- Mise à jour des statuts

### ✅ **Rapports** (`/reports`)
- Graphiques de performance
- Analyse des revenus
- Top clients
- Export PDF/Excel

### ✅ **Administration** (`/admin`)
- Gestion des utilisateurs
- Configuration des services
- Logs système
- Paramètres généraux

## 🌐 API Endpoints

### Authentification
- `GET /login` - Page de connexion
- `POST /login` - Authentification
- `POST /logout` - Déconnexion
- `GET /auth/check` - Vérification auth

### Commandes
- `GET /api/orders` - Liste
- `POST /api/orders` - Créer
- `PUT /api/orders/{id}` - Modifier
- `DELETE /api/orders/{id}` - Supprimer

### Clients
- `GET /api/customers` - Liste
- `POST /api/customers` - Créer
- `PUT /api/customers/{id}` - Modifier

### Paiements
- `GET /api/payments` - Liste
- `POST /api/payments` - Créer
- `GET /api/payments/{id}/invoice` - Facture

### Rapports
- `GET /api/reports/metrics` - Métriques
- `GET /api/reports/revenue-chart` - Graphique revenus
- `GET /api/reports/orders-chart` - Graphique commandes

### Tracking
- `GET /api/tracking/search` - Recherche commande
- `PUT /api/tracking/orders/{id}/status` - Mise à jour statut

## 🛠️ Développement

### Structure des fichiers
```
App-Pressing/
├── public/           # Point d'entrée web
├── src/             # Code source PHP
│   ├── Core/        # Logique métier
│   ├── Infrastructure/ # Base de données, sécurité
│   └── Modules/     # Contrôleurs et routes
├── config/          # Configuration
├── database/        # Migrations et seeds
└── vendor/          # Dépendances Composer
```

### Commandes utiles
```bash
# Vérifier la configuration
php start.php

# Tester la base de données
php test.php

# Redémarrer le serveur
php -S localhost:8000 -t public

# Voir les logs
tail -f logs/error.log
```

## 🔧 Dépannage

### Problème de connexion à la base de données
```bash
# Vérifier MySQL
sudo systemctl status mysql

# Vérifier la configuration
php -r "print_r(parse_ini_file('.env'));"
```

### Problème d'autoloader
```bash
# Régénérer l'autoloader
composer dump-autoload
```

### Problème de permissions
```bash
# Donner les permissions
chmod -R 755 public/
chmod -R 755 logs/
```

### Problème de session
```bash
# Vérifier la configuration PHP
php -m | grep session
```

## 📈 Fonctionnalités Avancées

### Export de données
- **PDF** : Factures, rapports
- **Excel** : Données tabulaires
- **CSV** : Export en masse

### Notifications temps réel
- WebSocket pour les mises à jour
- Notifications push
- Alertes système

### Calendrier de livraison
- Planification des livraisons
- Gestion des créneaux
- Rappels automatiques

## 🎯 Résultat

Après avoir suivi ce guide, vous aurez :

✅ **Système complet** de gestion de pressing  
✅ **Interface moderne** et responsive  
✅ **API REST** pour les intégrations  
✅ **Base de données** optimisée  
✅ **Sécurité** renforcée  
✅ **Rapports** avancés  

**Votre application est prête à être utilisée !** 🚀 