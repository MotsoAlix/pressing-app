# 📚 Documentation Technique - ManohPressing

## 🎯 Vue d'ensemble du Système

ManohPressing est une application web moderne de gestion de pressing qui révolutionne la façon dont les pressings gèrent leurs opérations quotidiennes. Le système intègre des fonctionnalités avancées comme les paiements mobiles, les reçus de dépôt automatiques, et un système de communication en temps réel.

### 🏗️ Architecture Générale

```
┌─────────────────────────────────────────────────────────────┐
│                    MANOHPRESSING SYSTEM                     │
├─────────────────────────────────────────────────────────────┤
│  Frontend (Client-Side)          │  Backend (Simulation)    │
│  ├── HTML5 Semantic              │  ├── LocalStorage DB     │
│  ├── CSS3 + Variables            │  ├── JavaScript Modules  │
│  ├── JavaScript ES6+             │  ├── API Simulation      │
│  ├── Responsive Design           │  └── Real-time Updates   │
│  └── Progressive Web App         │                           │
├─────────────────────────────────────────────────────────────┤
│                    CORE MODULES                             │
│  ├── User Management             │  ├── Payment Processing  │
│  ├── Order Management            │  ├── Notification System │
│  ├── Deposit Coupon System       │  ├── Communication Hub   │
│  └── Stock Management            │  └── Analytics Engine    │
└─────────────────────────────────────────────────────────────┘
```

## 👥 Acteurs du Système

### 🔐 **Administrateur**
**Rôle** : Supervision complète du système
**Responsabilités** :
- Gestion des utilisateurs et des rôles
- Configuration des sites et emplacements
- Supervision des statistiques globales
- Maintenance et configuration système
- Gestion des gérants et attribution des sites

**Interface** : Dashboard administrateur avec accès complet

### 👔 **Gérant**
**Rôle** : Gestion opérationnelle du pressing
**Responsabilités** :
- Création et gestion des commandes
- Gestion des clients et de leur base de données
- Validation et envoi des reçus de dépôt
- Réception et traitement des paiements mobiles
- Gestion du stock et des approvisionnements
- Communication avec les clients via chat

**Interface** : Dashboard gérant avec outils de gestion

### 👤 **Client**
**Rôle** : Utilisateur final du service
**Responsabilités** :
- Consultation de ses commandes en cours
- Paiement des factures via mobile money
- Gestion de ses reçus de dépôt
- Communication avec le gérant
- Consultation de l'historique des services

**Interface** : Dashboard client simplifié et intuitif

### 🤖 **Système**
**Rôle** : Automatisation et traitement en arrière-plan
**Responsabilités** :
- Génération automatique des reçus de dépôt
- Expiration automatique des reçus non utilisés
- Traitement des paiements mobiles
- Envoi de notifications automatiques
- Vérification des statuts et mises à jour

## 📦 Modules Fonctionnels

### 🛍️ **Module de Gestion des Commandes**

#### **Cycle de Vie d'une Commande**
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ EN ATTENTE  │───▶│  EN COURS   │───▶│   PRÊTES    │───▶│   LIVRÉES   │
│  (pending)  │    │(in_progress)│    │   (ready)   │    │ (delivered) │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │                   │
       ▼                   ▼                   ▼                   ▼
   Création par        Début du           Fin du              Récupération
   le gérant          traitement         traitement           par le client
```

#### **Données d'une Commande**
```javascript
{
  id: 12345,
  orderNumber: "CMD-001",
  customerId: 3,
  customerName: "Jean Dupont",
  managerId: 2,
  services: [
    {
      id: 1,
      name: "Nettoyage à sec",
      price: 15.00,
      quantity: 2
    }
  ],
  total: 30.00,
  status: "pending",
  paymentStatus: "unpaid",
  createdAt: "2025-01-15T10:30:00Z",
  deliveredAt: null,
  notes: "Attention aux boutons dorés"
}
```

### 🎫 **Module de Reçus de Dépôt**

#### **Processus de Génération**
```
Commande Livrée ──▶ Génération Auto ──▶ Validation Gérant ──▶ Envoi Client
      │                    │                     │                  │
      ▼                    ▼                     ▼                  ▼
  Status: delivered    Code: DEP123456    Modal validation    Notification
```

#### **Structure d'un Reçu**
```javascript
{
  id: 67890,
  code: "DEP123456ABCD",
  type: "deposit_receipt",
  customerId: 3,
  orderId: 12345,
  managerId: 2,
  status: "active", // pending_validation, active, collected, expired
  createdAt: "2025-01-15T14:30:00Z",
  validUntil: "2025-04-15T14:30:00Z", // 90 jours
  collectedAt: null,
  customerName: "Jean Dupont",
  orderNumber: "CMD-001",
  itemsCount: 2,
  itemsDescription: "Costume, Chemise",
  depositDate: "2025-01-15T14:30:00Z",
  pickupLocation: "ManohPressing - Site Principal"
}
```

### 💳 **Module de Paiements Mobiles**

#### **Opérateurs Supportés**
| Opérateur | Préfixe | Numéros | Frais | Regex |
|-----------|---------|---------|-------|-------|
| Orange Money | +237 | 65-69 | 2% | `/^6[5-9]\d{7}$/` |
| MTN Mobile Money | +237 | 67-68 | 1.5% | `/^6[7-8]\d{7}$/` |

#### **Processus de Paiement**
```
Client Initie ──▶ Validation ──▶ Simulation ──▶ Notification ──▶ Confirmation
     │               │              │              │               │
     ▼               ▼              ▼              ▼               ▼
Sélection      Format numéro   Opérateur      Gérant notifié   Client confirmé
méthode        + calcul frais   (85% succès)   automatiquement  avec code
```

#### **Structure d'un Paiement**
```javascript
{
  id: 98765,
  transactionId: "TXN1642248600ABC123",
  orderId: 12345,
  customerId: 3,
  amount: 30.00,
  fees: 0.60, // 2% pour Orange Money
  totalAmount: 30.60,
  phoneNumber: "+23765123456",
  paymentMethod: "orange_money",
  status: "completed", // pending, processing, completed, failed, cancelled
  createdAt: "2025-01-15T15:00:00Z",
  completedAt: "2025-01-15T15:00:02Z",
  confirmationCode: "ABC123XYZ",
  attempts: 1,
  maxAttempts: 3
}
```

### 💬 **Module de Communication**

#### **Système de Chat**
- **Temps réel** : Messages instantanés entre client et gérant
- **Historique** : Conservation des conversations
- **Notifications** : Alertes visuelles et sonores
- **Multi-canal** : Chat + notifications système

#### **Types de Notifications**
```javascript
const notificationTypes = {
  'order_status_change': 'Changement de statut de commande',
  'payment_received': 'Paiement reçu',
  'deposit_receipt': 'Reçu de dépôt',
  'coupon_received': 'Coupon reçu',
  'chat_message': 'Nouveau message',
  'system_alert': 'Alerte système'
};
```

## 🗄️ Structure des Données

### **LocalStorage Keys**
```javascript
const STORAGE_KEYS = {
  USERS: 'manohpressing_users',
  ORDERS: 'manohpressing_orders',
  COUPONS: 'manohpressing_coupons',
  PAYMENTS: 'manohpressing_payments',
  STOCK: 'manohpressing_stock',
  NOTIFICATIONS: 'manohpressing_notifications',
  SITES: 'manohpressing_sites',
  CURRENT_USER: 'user'
};
```

### **Modèle de Données Utilisateur**
```javascript
const UserModel = {
  id: Number,
  username: String,
  password: String, // Hashé en production
  role: String, // 'admin', 'manager', 'client'
  firstName: String,
  lastName: String,
  email: String,
  phone: String,
  address: String,
  isActive: Boolean,
  createdAt: String, // ISO Date
  siteId: Number, // Pour les gérants
  loyaltyPoints: Number, // Pour les clients
  totalSpent: Number, // Pour les clients
  lastLogin: String // ISO Date
};
```

## 🔧 Architecture Technique

### **Pattern MVC Implémenté**
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│      MODEL      │    │   CONTROLLER    │    │      VIEW       │
│                 │    │                 │    │                 │
│ ├─ User         │◄──►│ ├─ UserManager  │◄──►│ ├─ Dashboard    │
│ ├─ Order        │    │ ├─ OrderManager │    │ ├─ Modals       │
│ ├─ Payment      │    │ ├─ PaymentMgr   │    │ ├─ Forms        │
│ ├─ Coupon       │    │ ├─ CouponMgr    │    │ ├─ Tables       │
│ └─ Notification │    │ └─ NotifMgr     │    │ └─ Charts       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### **Modules JavaScript**
```
public/assets/js/modules/
├── data-manager.js          # Gestionnaire principal des données
├── data-init.js            # Initialisation des données par défaut
├── coupon-manager.js       # Gestion des reçus de dépôt
├── mobile-payment.js       # Traitement des paiements mobiles
├── notifications.js        # Système de notifications
├── chat-manager.js         # Gestion du chat temps réel
├── stock-manager.js        # Gestion du stock
├── reports-manager.js      # Génération de rapports
└── performance-optimizer.js # Optimisations performance
```

### **Design Patterns Utilisés**

#### **1. Manager Pattern**
```javascript
class MobilePaymentManager {
  constructor() {
    this.payments = [];
    this.paymentMethods = {};
  }
  
  async initiatePayment(orderId, customerId, amount, phone, method) {
    // Logique centralisée de paiement
  }
}
```

#### **2. Observer Pattern**
```javascript
class NotificationManager {
  constructor() {
    this.observers = [];
  }
  
  subscribe(observer) {
    this.observers.push(observer);
  }
  
  notify(event, data) {
    this.observers.forEach(observer => observer.update(event, data));
  }
}
```

#### **3. State Pattern**
```javascript
const OrderStates = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  READY: 'ready',
  DELIVERED: 'delivered'
};

class OrderStateMachine {
  constructor(order) {
    this.order = order;
    this.currentState = order.status;
  }
  
  transition(newState) {
    if (this.isValidTransition(this.currentState, newState)) {
      this.currentState = newState;
      this.order.status = newState;
      this.onStateChange();
    }
  }
}
```

## 🎨 Interface Utilisateur

### **Design System**
```css
:root {
  /* Couleurs principales */
  --primary-color: #3b82f6;
  --primary-light: #dbeafe;
  --primary-dark: #1e40af;
  
  /* Couleurs sémantiques */
  --success-color: #10b981;
  --warning-color: #f59e0b;
  --error-color: #ef4444;
  --info-color: #06b6d4;
  
  /* Couleurs neutres */
  --text-primary: #1f2937;
  --text-secondary: #6b7280;
  --background-color: #f9fafb;
  --surface-color: #ffffff;
  --border-color: #e5e7eb;
  
  /* Espacements */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  
  /* Rayons de bordure */
  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
  --radius-full: 9999px;
}
```

### **Composants Réutilisables**

#### **Cartes (Cards)**
```css
.card {
  background: var(--surface-color);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--border-color);
}

.stat-card {
  @extend .card;
  text-align: center;
  transition: transform 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
}
```

#### **Boutons (Buttons)**
```css
.btn {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s ease;
  cursor: pointer;
  border: none;
}

.btn-primary {
  background: var(--primary-color);
  color: white;
}

.btn-primary:hover {
  background: var(--primary-dark);
}
```

### **Responsive Design**
```css
/* Mobile First Approach */
.container {
  width: 100%;
  padding: 0 1rem;
}

/* Tablet */
@media (min-width: 768px) {
  .container {
    max-width: 768px;
    margin: 0 auto;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .container {
    max-width: 1024px;
  }
  
  .dashboard-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* Large Desktop */
@media (min-width: 1280px) {
  .container {
    max-width: 1280px;
  }
}
```

## 🔒 Sécurité et Validation

### **Authentification**
```javascript
class AuthManager {
  static validateCredentials(username, password) {
    const users = JSON.parse(localStorage.getItem('manohpressing_users') || '[]');
    const user = users.find(u => u.username === username && u.isActive);
    
    if (!user) return null;
    
    // En production : utiliser bcrypt ou similar
    if (user.password === password) {
      return {
        id: user.id,
        username: user.username,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName
      };
    }
    
    return null;
  }
  
  static createSession(user) {
    const sessionData = {
      ...user,
      loginTime: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24h
    };
    
    localStorage.setItem('user', JSON.stringify(sessionData));
    return sessionData;
  }
}
```

### **Validation des Données**
```javascript
class ValidationManager {
  static validatePhoneNumber(phone, operator) {
    const patterns = {
      'orange_money': /^6[5-9]\d{7}$/,
      'mtn_money': /^6[7-8]\d{7}$/
    };
    
    const cleanPhone = phone.replace(/\s+/g, '');
    return patterns[operator] ? patterns[operator].test(cleanPhone) : false;
  }
  
  static validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  static sanitizeInput(input) {
    return input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                .replace(/[<>]/g, '');
  }
}
```

## 📊 Performance et Optimisation

### **Stratégies d'Optimisation**
```javascript
class PerformanceOptimizer {
  // Debouncing pour les recherches
  static debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
  
  // Lazy loading des images
  static initLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.classList.remove('lazy');
          observer.unobserve(img);
        }
      });
    });
    
    images.forEach(img => imageObserver.observe(img));
  }
  
  // Cache des données fréquemment utilisées
  static cache = new Map();
  
  static getCachedData(key, fetchFunction, ttl = 300000) { // 5 minutes
    const cached = this.cache.get(key);
    const now = Date.now();
    
    if (cached && (now - cached.timestamp) < ttl) {
      return cached.data;
    }
    
    const data = fetchFunction();
    this.cache.set(key, { data, timestamp: now });
    return data;
  }
}
```

### **Métriques de Performance**
- **Temps de chargement initial** : < 2 secondes
- **Temps de réponse interactions** : < 100ms
- **Animations** : 60 FPS
- **Taille bundle JavaScript** : < 500KB
- **Taille CSS** : < 100KB

## 🧪 Tests et Qualité

### **Tests Unitaires**
```javascript
// Exemple de test pour le gestionnaire de paiements
describe('MobilePaymentManager', () => {
  let paymentManager;
  
  beforeEach(() => {
    paymentManager = new MobilePaymentManager();
  });
  
  test('should validate Orange Money number correctly', () => {
    expect(paymentManager.validatePhoneNumber('65123456', 'orange_money')).toBe(true);
    expect(paymentManager.validatePhoneNumber('64123456', 'orange_money')).toBe(false);
  });
  
  test('should calculate fees correctly', () => {
    const fees = paymentManager.calculateFees(100, 'orange_money');
    expect(fees).toBe(2); // 2% de 100
  });
  
  test('should generate unique transaction ID', () => {
    const id1 = paymentManager.generateTransactionId();
    const id2 = paymentManager.generateTransactionId();
    expect(id1).not.toBe(id2);
    expect(id1).toMatch(/^TXN\d+[A-Z0-9]+$/);
  });
});
```

### **Tests d'Intégration**
```javascript
describe('Order Workflow Integration', () => {
  test('complete order lifecycle', async () => {
    // 1. Créer une commande
    const order = await orderManager.createOrder({
      customerId: 1,
      services: [{ id: 1, quantity: 2 }]
    });
    expect(order.status).toBe('pending');
    
    // 2. Progresser vers "en cours"
    await orderManager.updateStatus(order.id, 'in_progress');
    expect(order.status).toBe('in_progress');
    
    // 3. Marquer comme prête
    await orderManager.updateStatus(order.id, 'ready');
    expect(order.status).toBe('ready');
    
    // 4. Livrer et générer reçu
    await orderManager.updateStatus(order.id, 'delivered');
    expect(order.status).toBe('delivered');
    
    // 5. Vérifier génération du reçu
    const coupons = couponManager.getCustomerCoupons(order.customerId);
    expect(coupons.length).toBeGreaterThan(0);
    expect(coupons[0].orderId).toBe(order.id);
  });
});
```

## 🚀 Déploiement et Production

### **Checklist de Déploiement**
- [ ] **Base de données** : Migration vers MySQL/PostgreSQL
- [ ] **Sécurité** : Implémentation HTTPS
- [ ] **Authentification** : Hash des mots de passe (bcrypt)
- [ ] **API** : Endpoints REST sécurisés
- [ ] **Cache** : Redis pour les sessions
- [ ] **CDN** : Assets statiques optimisés
- [ ] **Monitoring** : Logs et métriques
- [ ] **Backup** : Sauvegarde automatique des données

### **Configuration Production**
```javascript
const productionConfig = {
  database: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    name: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: true
  },
  security: {
    jwtSecret: process.env.JWT_SECRET,
    bcryptRounds: 12,
    sessionTimeout: 24 * 60 * 60 * 1000, // 24h
    maxLoginAttempts: 5
  },
  payment: {
    orangeMoneyApiKey: process.env.ORANGE_API_KEY,
    mtnMoneyApiKey: process.env.MTN_API_KEY,
    webhookSecret: process.env.WEBHOOK_SECRET
  }
};
```

## 📱 Guide d'Utilisation par Rôle

### 👔 **Guide Gérant**

#### **Connexion et Dashboard**
1. **Accès** : `http://localhost:8000/manager-dashboard.html`
2. **Identifiants** : `manager1` / `manager123`
3. **Dashboard** : Vue d'ensemble des commandes et statistiques

#### **Gestion des Commandes**
```
Nouvelle Commande → Sélectionner Client → Ajouter Services → Calculer Total → Sauvegarder
                                    ↓
Progression des Statuts : En Attente → En Cours → Prêtes → Livrées
                                    ↓
Génération Automatique du Reçu de Dépôt → Validation → Envoi au Client
```

#### **Workflow Quotidien**
1. **Matin** : Consulter les nouvelles commandes
2. **Traitement** : Faire progresser les statuts selon l'avancement
3. **Livraison** : Marquer comme "Livrées" et valider les reçus
4. **Paiements** : Recevoir et traiter les notifications de paiement
5. **Communication** : Répondre aux messages clients via chat

### 👤 **Guide Client**

#### **Connexion et Dashboard**
1. **Accès** : `http://localhost:8000/client-dashboard.html`
2. **Identifiants** : `client1` / `client123`
3. **Dashboard** : Mes commandes et reçus de dépôt

#### **Utilisation des Fonctionnalités**
```
Consulter Commandes → Suivre Progression → Recevoir Notifications
                                ↓
Commande Livrée → Recevoir Reçu de Dépôt → Conserver le Code
                                ↓
Paiement Facture → Choisir Orange/MTN → Confirmer → Suivi Temps Réel
```

#### **Paiement Mobile - Étapes**
1. **Sélection** : Cliquer "Payer" sur une commande livrée
2. **Méthode** : Choisir Orange Money ou MTN Money
3. **Numéro** : Saisir le numéro de téléphone (format : 6XXXXXXX)
4. **Validation** : Vérifier le montant + frais
5. **Confirmation** : Confirmer le paiement sur le téléphone
6. **Suivi** : Attendre la confirmation (max 1 minute)

### 👨‍💼 **Guide Administrateur**

#### **Supervision Système**
1. **Utilisateurs** : Créer/modifier/désactiver les comptes
2. **Sites** : Gérer les emplacements et affecter les gérants
3. **Statistiques** : Consulter les métriques globales
4. **Configuration** : Paramètres système et sécurité

## 🔧 Guide de Maintenance

### **Sauvegarde des Données**
```javascript
// Script de sauvegarde complète
function backupAllData() {
  const backup = {
    timestamp: new Date().toISOString(),
    users: JSON.parse(localStorage.getItem('manohpressing_users') || '[]'),
    orders: JSON.parse(localStorage.getItem('manohpressing_orders') || '[]'),
    coupons: JSON.parse(localStorage.getItem('manohpressing_coupons') || '[]'),
    payments: JSON.parse(localStorage.getItem('manohpressing_payments') || '[]'),
    stock: JSON.parse(localStorage.getItem('manohpressing_stock') || '[]'),
    notifications: JSON.parse(localStorage.getItem('manohpressing_notifications') || '[]')
  };

  // Télécharger le fichier de sauvegarde
  const dataStr = JSON.stringify(backup, null, 2);
  const dataBlob = new Blob([dataStr], {type: 'application/json'});
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `manohpressing_backup_${new Date().toISOString().split('T')[0]}.json`;
  link.click();
}
```

### **Restauration des Données**
```javascript
function restoreData(backupFile) {
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const backup = JSON.parse(e.target.result);

      // Restaurer chaque collection
      Object.keys(backup).forEach(key => {
        if (key !== 'timestamp') {
          localStorage.setItem(`manohpressing_${key}`, JSON.stringify(backup[key]));
        }
      });

      alert('Données restaurées avec succès !');
      window.location.reload();
    } catch (error) {
      alert('Erreur lors de la restauration : ' + error.message);
    }
  };
  reader.readAsText(backupFile);
}
```

### **Nettoyage et Optimisation**
```javascript
// Nettoyage des données expirées
function cleanupExpiredData() {
  // Nettoyer les reçus expirés depuis plus de 30 jours
  const coupons = JSON.parse(localStorage.getItem('manohpressing_coupons') || '[]');
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const activeCoupons = coupons.filter(coupon => {
    if (coupon.status === 'expired') {
      return new Date(coupon.expiredAt) > thirtyDaysAgo;
    }
    return true;
  });

  localStorage.setItem('manohpressing_coupons', JSON.stringify(activeCoupons));

  // Nettoyer les notifications anciennes
  const notifications = JSON.parse(localStorage.getItem('manohpressing_notifications') || '[]');
  const recentNotifications = notifications.filter(notif => {
    return new Date(notif.createdAt) > thirtyDaysAgo;
  });

  localStorage.setItem('manohpressing_notifications', JSON.stringify(recentNotifications));

  console.log('Nettoyage terminé');
}
```

## 🐛 Dépannage et FAQ

### **Problèmes Courants**

#### **1. Problème de Connexion**
**Symptôme** : Impossible de se connecter
**Solutions** :
- Vérifier les identifiants (sensible à la casse)
- Vider le cache du navigateur (Ctrl+Shift+Del)
- Vérifier que JavaScript est activé
- Essayer en navigation privée

#### **2. Paiement Mobile Échoué**
**Symptôme** : Paiement reste en "En cours" ou échoue
**Solutions** :
- Vérifier le format du numéro (6XXXXXXX)
- S'assurer que le compte mobile money a des fonds
- Réessayer après 1 minute
- Contacter le gérant si le problème persiste

#### **3. Reçu de Dépôt Non Reçu**
**Symptôme** : Pas de notification de reçu après livraison
**Solutions** :
- Vérifier la section "Mes Reçus de Dépôt"
- Le gérant doit valider le reçu manuellement
- Actualiser la page (F5)
- Contacter le gérant

#### **4. Performance Lente**
**Symptôme** : Application lente ou qui rame
**Solutions** :
- Fermer les autres onglets du navigateur
- Vider le cache et les données du site
- Redémarrer le navigateur
- Vérifier la connexion internet

### **Codes d'Erreur**

| Code | Description | Solution |
|------|-------------|----------|
| AUTH_001 | Identifiants invalides | Vérifier username/password |
| PAY_001 | Numéro de téléphone invalide | Format : 6XXXXXXX |
| PAY_002 | Paiement timeout | Réessayer la transaction |
| COUP_001 | Reçu de dépôt expiré | Contacter le gérant |
| CONN_001 | Erreur de connexion | Vérifier la connexion internet |

### **Limites Actuelles**

#### **Limitations Techniques**
- **Stockage** : LocalStorage limité à ~10MB par domaine
- **Concurrence** : Pas de gestion multi-utilisateur simultané
- **Offline** : Pas de fonctionnement hors ligne
- **Synchronisation** : Pas de sync entre appareils

#### **Limitations Fonctionnelles**
- **Paiements** : Simulation uniquement (pas de vraie API)
- **SMS** : Pas d'envoi de SMS réels
- **Email** : Pas d'envoi d'emails
- **Impression** : Pas de génération PDF native

## 🔮 Roadmap et Évolutions

### **Version 2.0 - Prochaines Fonctionnalités**
- [ ] **Base de données réelle** (MySQL/PostgreSQL)
- [ ] **API REST** complète avec authentification JWT
- [ ] **Paiements réels** avec APIs Orange Money et MTN Money
- [ ] **Notifications SMS** et email
- [ ] **Application mobile** (React Native/Flutter)
- [ ] **Mode offline** avec synchronisation
- [ ] **Multi-tenant** pour plusieurs pressings

### **Version 2.1 - Améliorations**
- [ ] **Intelligence artificielle** pour prédiction des demandes
- [ ] **Géolocalisation** pour livraison à domicile
- [ ] **Programme de fidélité** avancé
- [ ] **Intégration comptable** (export vers logiciels comptables)
- [ ] **Tableau de bord analytique** avancé
- [ ] **API publique** pour intégrations tierces

### **Version 3.0 - Innovation**
- [ ] **IoT Integration** : Capteurs sur les machines
- [ ] **Blockchain** : Traçabilité des vêtements
- [ ] **Réalité augmentée** : Visualisation des taches
- [ ] **Chatbot IA** : Support client automatisé
- [ ] **Prédiction maintenance** : Maintenance préventive
- [ ] **Écologie** : Suivi impact environnemental

## 📞 Support et Contact

### **Support Technique**
- **Documentation** : `/public/assets/diagrams/documentation.md`
- **Tests** : `/TESTS.md`
- **Issues** : GitHub Issues (si applicable)
- **Email Support** : support@manohpressing.com

### **Formation et Accompagnement**
- **Guide utilisateur** : Documentation intégrée
- **Vidéos tutoriels** : À venir
- **Formation sur site** : Disponible sur demande
- **Support téléphonique** : Heures ouvrables

### **Communauté**
- **Forum utilisateurs** : À créer
- **Groupe WhatsApp** : Support rapide
- **Newsletter** : Nouvelles fonctionnalités
- **Webinaires** : Formations mensuelles

---

## 📋 Annexes

### **Annexe A : Glossaire**
- **Reçu de dépôt** : Document certifiant le dépôt de vêtements
- **Mobile Money** : Service de paiement mobile (Orange Money, MTN Money)
- **Workflow** : Processus de traitement d'une commande
- **Dashboard** : Tableau de bord principal
- **LocalStorage** : Stockage local du navigateur
- **API** : Interface de programmation d'application

### **Annexe B : Formats de Données**
```javascript
// Format de date ISO 8601
"2025-01-15T14:30:00.000Z"

// Format de numéro de téléphone
"+237XXXXXXXX" // International
"6XXXXXXXX"    // Local (Cameroun)

// Format de code de reçu
"DEP" + timestamp(6) + random(4) // Ex: DEP123456ABCD

// Format d'ID de transaction
"TXN" + timestamp + random(6)    // Ex: TXN1642248600ABC123
```

### **Annexe C : Configuration Serveur**
```nginx
# Configuration Nginx pour production
server {
    listen 80;
    server_name manohpressing.com;
    root /var/www/manohpressing/public;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/css application/javascript application/json;

    # Cache statique
    location ~* \.(css|js|png|jpg|jpeg|gif|svg|ico)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Sécurité
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";
    add_header X-XSS-Protection "1; mode=block";
}
```

---

**📚 Cette documentation complète couvre tous les aspects techniques, fonctionnels et opérationnels du système ManohPressing. Elle constitue la référence officielle pour l'utilisation, la maintenance et l'évolution de l'application.**

*Dernière mise à jour : 15 janvier 2025*
*Version de la documentation : 1.0*
