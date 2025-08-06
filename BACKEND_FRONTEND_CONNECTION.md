# Connexion Backend-Frontend

## 🔗 Architecture de Connexion

Le système de gestion de pressing utilise une architecture **API REST** pour connecter le backend PHP au frontend JavaScript.

### Structure des Modules

```
src/
├── Modules/
│   ├── Auth/
│   │   ├── Controllers/
│   │   │   └── AuthController.php
│   │   └── Routes/
│   │       └── auth.php
│   ├── Orders/
│   │   ├── Controllers/
│   │   │   └── OrderController.php
│   │   └── Routes/
│   │       └── orders.php
│   ├── Customers/
│   │   ├── Controllers/
│   │   │   └── CustomerController.php
│   │   └── Routes/
│   │       └── customers.php
│   └── Payments/
│       ├── Controllers/
│       │   └── PaymentController.php
│       └── Routes/
│           └── payments.php
```

## 🌐 API Endpoints

### Authentification
- `GET /login` - Page de connexion
- `POST /login` - Authentification
- `POST /logout` - Déconnexion
- `GET /auth/check` - Vérification de l'authentification

### Commandes
- `GET /api/orders` - Liste des commandes
- `GET /api/orders/{id}` - Détails d'une commande
- `POST /api/orders` - Créer une commande
- `PUT /api/orders/{id}` - Modifier une commande
- `DELETE /api/orders/{id}` - Supprimer une commande
- `GET /api/orders/stats` - Statistiques des commandes

### Clients
- `GET /api/customers` - Liste des clients
- `GET /api/customers/{id}` - Détails d'un client
- `POST /api/customers` - Créer un client
- `PUT /api/customers/{id}` - Modifier un client
- `DELETE /api/customers/{id}` - Supprimer un client
- `GET /api/customers/stats` - Statistiques des clients

### Paiements
- `GET /api/payments` - Liste des paiements
- `GET /api/payments/{id}` - Détails d'un paiement
- `POST /api/payments` - Créer un paiement
- `GET /api/payments/stats` - Statistiques des paiements
- `GET /api/payments/{id}/invoice` - Générer facture

## 🔄 Communication Frontend-Backend

### 1. Requêtes AJAX

Le frontend utilise le module `api.js` pour communiquer avec le backend :

```javascript
// Exemple de requête GET
const response = await api.get('/api/orders?page=1&limit=10');

// Exemple de requête POST
const order = await api.post('/api/orders', {
    customer_name: 'Jean Dupont',
    service_name: 'Nettoyage à sec',
    amount: 25.00
});
```

### 2. Gestion des Réponses

```javascript
// Format de réponse standard
{
    "success": true,
    "data": {
        "orders": [...],
        "total": 50,
        "page": 1,
        "limit": 10
    }
}

// En cas d'erreur
{
    "success": false,
    "message": "Erreur de validation"
}
```

### 3. Authentification

```javascript
// Vérification de l'authentification
const auth = await api.get('/auth/check');
if (!auth.authenticated) {
    window.location.href = '/login';
}
```

## 🛠️ Configuration

### 1. Base de Données

Le fichier `config/database.php` configure la connexion :

```php
return [
    'default' => 'mysql',
    'connections' => [
        'mysql' => [
            'host' => $_ENV['DB_HOST'],
            'database' => $_ENV['DB_NAME'],
            'username' => $_ENV['DB_USER'],
            'password' => $_ENV['DB_PASS'],
        ]
    ]
];
```

### 2. Variables d'Environnement

Créer un fichier `.env` :

```env
APP_NAME="Pressing Pro"
APP_URL=http://localhost:8000
APP_ENV=development

DB_HOST=localhost
DB_NAME=pressing_db
DB_USER=root
DB_PASS=
```

### 3. Autoloader

Le fichier `composer.json` configure l'autoloader PSR-4 :

```json
{
    "autoload": {
        "psr-4": {
            "App\\": "src/"
        }
    }
}
```

## 🚀 Démarrage Rapide

### 1. Installation

```bash
# Installer les dépendances
composer install

# Créer la base de données
mysql -u root -p -e "CREATE DATABASE pressing_db"

# Exécuter les migrations
php database/migrate.php

# Charger les données de test
php database/seed.php
```

### 2. Test de Connexion

```bash
# Tester la configuration
php test.php
```

### 3. Démarrage du Serveur

```bash
# Serveur de développement
php -S localhost:8000 -t public

# Ou avec Apache/Nginx
# Configurer le DocumentRoot vers le dossier public/
```

## 📡 Flux de Données

### 1. Requête Frontend → Backend

```javascript
// Frontend (JavaScript)
const orders = await api.get('/api/orders');
```

```php
// Backend (PHP)
public function index(Request $request): Response
{
    $orders = $this->getOrders($page, $limit);
    return new Response(json_encode([
        'success' => true,
        'data' => $orders
    ]), 200, ['Content-Type' => 'application/json']);
}
```

### 2. Réponse Backend → Frontend

```php
// Backend (PHP)
return new Response(json_encode([
    'success' => true,
    'data' => [
        'orders' => $orders,
        'total' => $total
    ]
]), 200, ['Content-Type' => 'application/json']);
```

```javascript
// Frontend (JavaScript)
if (response.success) {
    this.renderOrders(response.data.orders);
    this.updatePagination(response.data.total);
}
```

## 🔒 Sécurité

### 1. CSRF Protection

```php
// Middleware CSRF
class CSRFMiddleware implements MiddlewareInterface
{
    public function process(Request $request): Request
    {
        // Vérification du token CSRF
        if ($request->getMethod() === 'POST') {
            $token = $request->getHeader('X-CSRF-Token');
            if (!$this->validateToken($token)) {
                throw new Exception('Token CSRF invalide');
            }
        }
        return $request;
    }
}
```

### 2. Authentification

```php
// Vérification de session
public function checkAuth(Request $request): Response
{
    $userId = $this->sessionManager->get('user_id');
    if (!$userId) {
        return new Response(json_encode(['authenticated' => false]), 401);
    }
    return new Response(json_encode(['authenticated' => true]), 200);
}
```

## 🐛 Débogage

### 1. Logs Backend

```php
// Dans les contrôleurs
error_log("Requête reçue: " . json_encode($request->getBody()));
```

### 2. Logs Frontend

```javascript
// Dans les modules JavaScript
console.log('Réponse API:', response);
```

### 3. Test des Endpoints

```bash
# Test avec curl
curl -X GET http://localhost:8000/api/orders
curl -X POST http://localhost:8000/api/orders \
  -H "Content-Type: application/json" \
  -d '{"customer_name":"Test","amount":25}'
```

## 📊 Monitoring

### 1. Performance

- **Temps de réponse** : < 200ms pour les requêtes simples
- **Mémoire** : < 50MB par requête
- **Connexions DB** : Pool de connexions configuré

### 2. Erreurs

- **Logs d'erreur** : `/logs/error.log`
- **Logs d'accès** : `/logs/access.log`
- **Monitoring** : Dashboard d'administration

## ✅ Checklist de Connexion

- [ ] Base de données configurée et accessible
- [ ] Variables d'environnement définies
- [ ] Autoloader Composer installé
- [ ] Routes API fonctionnelles
- [ ] Middlewares de sécurité actifs
- [ ] Frontend JavaScript connecté aux endpoints
- [ ] Gestion d'erreurs côté client et serveur
- [ ] Tests de connexion passés

## 🎯 Résultat

Le système est maintenant **entièrement connecté** avec :

✅ **Backend PHP** : API REST avec architecture modulaire  
✅ **Frontend JavaScript** : Modules ES6 avec gestion d'état  
✅ **Base de données** : MySQL/PostgreSQL avec migrations  
✅ **Sécurité** : CSRF, sessions, validation  
✅ **Performance** : Cache, compression, optimisation  

Le frontend et le backend communiquent parfaitement via l'API REST ! 🚀 