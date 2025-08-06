# 🚀 Guide d'Exécution - ManohPressing

## 📋 Prérequis

### **1. PHP**
- **Version requise** : PHP 7.4 ou supérieur
- **Vérification** : `php --version`

### **2. Serveur Web Local**
- **Option 1** : Serveur PHP intégré (recommandé pour le développement)
- **Option 2** : XAMPP, WAMP, ou MAMP
- **Option 3** : Serveur web Apache/Nginx

### **3. Navigateur Web**
- **Chrome/Chromium** 90+
- **Firefox** 88+
- **Safari** 14+
- **Edge** 90+

## 🛠️ Installation et Configuration

### **Étape 1 : Vérifier PHP**
```bash
# Vérifier que PHP est installé
php --version

# Si PHP n'est pas installé, l'installer selon votre OS
# Windows : Télécharger depuis php.net
# macOS : brew install php
# Linux : sudo apt install php
```

### **Étape 2 : Naviguer vers le projet**
```bash
# Se placer dans le répertoire du projet
cd "C:\Users\COMPUTER STORES\Desktop\App-Pressing"

# Vérifier la structure
dir
# ou
ls
```

### **Étape 3 : Démarrer le serveur PHP**
```bash
# Démarrer le serveur PHP sur le port 8000
php -S localhost:8000 -t public

# Alternative avec un port différent
php -S localhost:3000 -t public
```

## 🌐 Accès à l'Application

### **URLs principales :**
- **Dashboard** : http://localhost:8000/dashboard.html
- **Commandes** : http://localhost:8000/orders.html
- **Clients** : http://localhost:8000/customers.html
- **Suivi** : http://localhost:8000/tracking.html
- **Paiements** : http://localhost:8000/payments.html
- **Rapports** : http://localhost:8000/reports.html
- **Administration** : http://localhost:8000/admin.html
- **Design System** : http://localhost:8000/design-system.html

### **Pages de test :**
- **Test Sidebar** : http://localhost:8000/test-sidebar.html
- **Test Cartes** : http://localhost:8000/test-cards.html
- **Test Toutes Pages** : http://localhost:8000/test-all-pages.html

## 🔧 Configuration Avancée

### **1. Variables d'environnement**
Créer un fichier `.env` basé sur `env.example` :
```bash
# Copier le fichier d'exemple
copy env.example .env

# Éditer les variables selon votre configuration
# DATABASE_HOST=localhost
# DATABASE_NAME=manohpressing
# DATABASE_USER=root
# DATABASE_PASS=
```

### **2. Base de données (optionnel)**
```bash
# Si vous avez MySQL/MariaDB installé
mysql -u root -p

# Créer la base de données
CREATE DATABASE manohpressing;
USE manohpressing;

# Exécuter les migrations
php database/migrate.php
```

### **3. Données de test (optionnel)**
```bash
# Insérer des données de démonstration
php database/seed.php
```

## 📱 Test Responsive

### **Outils de développement navigateur :**
1. **Ouvrir** http://localhost:8000/dashboard.html
2. **F12** pour ouvrir les outils de développement
3. **Toggle device toolbar** (Ctrl+Shift+M)
4. **Tester les breakpoints :**
   - **Mobile** : 375px - 768px
   - **Tablette** : 768px - 1024px
   - **Desktop** : 1024px+

### **Breakpoints testés :**
- **XS** : 475px
- **SM** : 640px
- **MD** : 768px
- **LG** : 1024px
- **XL** : 1280px
- **2XL** : 1536px

## 🎨 Fonctionnalités à Tester

### **1. Sidebar Responsive**
- ✅ **Desktop** : Sidebar toujours visible
- ✅ **Tablette** : Sidebar cachée, bouton toggle
- ✅ **Mobile** : Sidebar cachée, overlay au toggle

### **2. Navigation**
- ✅ **Menu principal** : Dashboard, Commandes, Clients, Suivi
- ✅ **Menu gestion** : Paiements, Rapports, Administration
- ✅ **Menu utilisateur** : Profil, Paramètres, Déconnexion

### **3. Cartes et Composants**
- ✅ **Cartes de statistiques** : Animations et couleurs
- ✅ **Cartes de commandes** : Statuts colorés
- ✅ **Cartes de clients** : Avatars et informations
- ✅ **Cartes de services** : Icônes et prix

### **4. Boutons et Interactions**
- ✅ **Boutons primaires** : Gradients et hover effects
- ✅ **Boutons secondaires** : Variantes et états
- ✅ **Boutons d'action** : Icônes et animations
- ✅ **Boutons flottants** : Position fixed

### **5. Design System**
- ✅ **Palette de couleurs** : Toutes les variantes
- ✅ **Typographie** : Hiérarchie et styles
- ✅ **Espacement** : Système cohérent
- ✅ **Ombres** : Profondeur visuelle

## 🐛 Dépannage

### **Problème : Serveur ne démarre pas**
```bash
# Vérifier que le port n'est pas utilisé
netstat -an | findstr :8000

# Utiliser un autre port
php -S localhost:3000 -t public
```

### **Problème : Pages ne se chargent pas**
```bash
# Vérifier la structure des fichiers
dir public
dir public\assets\css
dir public\assets\js

# Vérifier les permissions (Linux/macOS)
chmod -R 755 public/
```

### **Problème : CSS/JS non chargés**
```bash
# Vérifier les chemins dans les fichiers HTML
# Les chemins doivent être relatifs à /public/

# Exemple correct :
<link rel="stylesheet" href="assets/css/base/variables.css">

# Exemple incorrect :
<link rel="stylesheet" href="/assets/css/base/variables.css">
```

### **Problème : Sidebar ne fonctionne pas**
```bash
# Vérifier que tous les fichiers JS sont chargés
# Vérifier la console du navigateur (F12)
# S'assurer que app.js et sidebar.js sont présents
```

## 🔄 Mise à Jour

### **Pour mettre à jour le projet :**
```bash
# Sauvegarder les modifications
git add .
git commit -m "Mise à jour ManohPressing"

# Redémarrer le serveur si nécessaire
# Ctrl+C pour arrêter
php -S localhost:8000 -t public
```

## 📊 Monitoring

### **Logs du serveur PHP :**
- Les erreurs s'affichent dans la console
- Vérifier la console du navigateur (F12)
- Logs d'erreur PHP dans le terminal

### **Performance :**
- **PageSpeed Insights** : https://pagespeed.web.dev/
- **Lighthouse** : Outil intégré dans Chrome DevTools
- **GTmetrix** : https://gtmetrix.com/

## 🚀 Déploiement

### **Environnement de production :**
1. **Serveur web** : Apache/Nginx
2. **PHP** : Version stable (8.1+ recommandé)
3. **SSL** : Certificat HTTPS
4. **Base de données** : MySQL/MariaDB
5. **Backup** : Sauvegarde régulière

### **Configuration serveur :**
```apache
# .htaccess pour Apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ index.php [QSA,L]
```

## 📞 Support

### **En cas de problème :**
1. **Vérifier** les prérequis
2. **Consulter** ce guide
3. **Tester** sur différents navigateurs
4. **Vérifier** la console du navigateur
5. **Redémarrer** le serveur PHP

### **Informations système :**
- **OS** : Windows 10/11, macOS, Linux
- **PHP** : 7.4+
- **Navigateur** : Chrome, Firefox, Safari, Edge
- **Résolution** : 1920x1080 minimum recommandé

---

## 🎉 Félicitations !

Votre application **ManohPressing** est maintenant prête à être utilisée !

**URL principale** : http://localhost:8000/dashboard.html

**Design System** : http://localhost:8000/design-system.html

L'application dispose d'une interface moderne, responsive et professionnelle parfaitement adaptée au secteur du pressing. 🚀 