# 🚀 Démarrage Rapide - ManohPressing

## ✅ Vérification Prérequis

Votre système est prêt ! ✅
- **PHP** : 8.4.2 (✓ Compatible)
- **OS** : Windows 10/11 (✓ Compatible)
- **Navigateur** : Chrome, Firefox, Safari, Edge (✓ Compatible)

## 🎯 Démarrage en 3 Étapes

### **Étape 1 : Ouvrir le Terminal**
```bash
# Ouvrir PowerShell ou Command Prompt
# Naviguer vers le projet
cd "C:\Users\COMPUTER STORES\Desktop\App-Pressing"
```

### **Étape 2 : Démarrer le Serveur**
```bash
# Option A : Script automatique (Recommandé)
start-server.bat

# Option B : Commande manuelle
php -S localhost:8000 -t public
```

### **Étape 3 : Ouvrir l'Application**
```
🌐 Ouvrir votre navigateur et aller sur :
http://localhost:8000/dashboard.html
```

## 🎨 Pages Principales

| Page | URL | Description |
|------|-----|-------------|
| 🏠 **Dashboard** | http://localhost:8000/dashboard.html | Page d'accueil avec statistiques |
| 🎨 **Design System** | http://localhost:8000/design-system.html | Démonstration du design |
| 📋 **Commandes** | http://localhost:8000/orders.html | Gestion des commandes |
| 👥 **Clients** | http://localhost:8000/customers.html | Base de données clients |
| 🔍 **Suivi** | http://localhost:8000/tracking.html | Suivi des commandes |
| 💰 **Paiements** | http://localhost:8000/payments.html | Gestion financière |
| 📊 **Rapports** | http://localhost:8000/reports.html | Analytics et exports |
| ⚙️ **Administration** | http://localhost:8000/admin.html | Configuration |

## 🧪 Pages de Test

| Test | URL | Objectif |
|------|-----|----------|
| 🔧 **Test Sidebar** | http://localhost:8000/test-sidebar.html | Tester la navigation responsive |
| 🃏 **Test Cartes** | http://localhost:8000/test-cards.html | Vérifier les cartes et couleurs |
| 📱 **Test Toutes Pages** | http://localhost:8000/test-all-pages.html | Tester toutes les pages |

## 🎯 Fonctionnalités à Tester

### **1. Sidebar Responsive** 📱
- **Desktop** : Sidebar toujours visible
- **Tablette** : Sidebar cachée, bouton hamburger
- **Mobile** : Sidebar avec overlay

### **2. Navigation** 🧭
- Menu principal : Dashboard, Commandes, Clients, Suivi
- Menu gestion : Paiements, Rapports, Administration
- Menu utilisateur : Profil, Paramètres, Déconnexion

### **3. Design System** 🎨
- **Couleurs** : Palette moderne (bleu, vert, orange)
- **Typographie** : Inter + JetBrains Mono
- **Boutons** : Gradients et animations
- **Cartes** : Ombres et effets hover

### **4. Responsive Design** 📱
- **Mobile** : 375px - 768px
- **Tablette** : 768px - 1024px
- **Desktop** : 1024px+

## 🛠️ Commandes Utiles

### **Démarrer le serveur**
```bash
php -S localhost:8000 -t public
```

### **Arrêter le serveur**
```bash
# Dans le terminal : Ctrl+C
```

### **Changer le port**
```bash
php -S localhost:3000 -t public
```

### **Vérifier les fichiers**
```bash
dir public
dir public\assets\css
dir public\assets\js
```

## 🐛 Dépannage Rapide

### **Problème : "php n'est pas reconnu"**
```bash
# Installer PHP depuis php.net
# Ou utiliser XAMPP/WAMP
```

### **Problème : "Port déjà utilisé"**
```bash
# Utiliser un autre port
php -S localhost:3000 -t public
```

### **Problème : "Page ne se charge pas"**
```bash
# Vérifier que le serveur tourne
# Vérifier l'URL : http://localhost:8000/dashboard.html
# Vérifier la console du navigateur (F12)
```

### **Problème : "CSS/JS non chargés"**
```bash
# Vérifier les chemins dans les fichiers HTML
# S'assurer que les fichiers existent dans public/assets/
```

## 📱 Test Responsive

### **Outils de développement :**
1. **F12** → Outils de développement
2. **Ctrl+Shift+M** → Mode responsive
3. **Tester les breakpoints :**
   - 📱 **Mobile** : 375px, 480px
   - 📱 **Tablette** : 768px, 1024px
   - 💻 **Desktop** : 1280px, 1920px

## 🎉 Félicitations !

Votre application **ManohPressing** est maintenant opérationnelle !

### **Prochaines étapes :**
1. **Explorer** toutes les pages
2. **Tester** le responsive design
3. **Personnaliser** selon vos besoins
4. **Configurer** la base de données (optionnel)

### **Support :**
- 📖 **Guide complet** : `GUIDE_EXECUTION.md`
- 🎨 **Design System** : http://localhost:8000/design-system.html
- 📚 **Documentation** : `README.md`

---

**ManohPressing** - Interface moderne et professionnelle pour votre pressing ! 🚀 