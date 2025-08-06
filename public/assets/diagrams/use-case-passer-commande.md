# 📋 Cas d'utilisation : Passer une commande

**Système :** ManohPressing  
**Date :** 15 janvier 2025  
**Version :** 1.0  

---

## 📊 Tableau de spécification

| **Élément** | **Description** |
|-------------|-----------------|
| **📋 Cas d'utilisation** | **Passer une commande** |
| **👤 Acteur principal** | **Gérant** (Manager du pressing) |
| **👥 Acteurs secondaires** | • **Client** (propriétaire des vêtements)<br>• **Système** (génération automatique des données) |
| **🎯 Objectif** | Le gérant souhaite créer une nouvelle commande pour un client avec les services de pressing demandés |
| **💡 Intérêts** | • **Gérant :** Enregistrer efficacement les demandes clients et organiser le travail<br>• **Client :** Obtenir un service de pressing professionnel avec suivi<br>• **Pressing :** Structurer et tracer toutes les commandes |
| **✅ Pré-conditions** | • Le gérant doit être authentifié dans le système<br>• Le client doit être présent physiquement au pressing<br>• Les vêtements à traiter doivent être disponibles<br>• Le système doit être opérationnel |
| **🎉 Post-conditions** | • La commande est créée et enregistrée dans le système<br>• Un numéro de commande unique est généré<br>• Le statut initial "En attente" est assigné<br>• Le client reçoit les informations de sa commande<br>• Le gérant peut commencer le traitement |

---

## 📝 Scénario nominal

| **Étape** | **Action** |
|-----------|------------|
| **1.** | Le gérant accède à la fonction "Nouvelle commande" dans son dashboard |
| **2.** | Le système affiche le formulaire de création de commande |
| **3.** | Le gérant sélectionne ou crée le profil client :<br>• Si client existant : recherche par nom/téléphone<br>• Si nouveau client : saisie des informations (nom, téléphone, adresse) |
| **4.** | Le gérant ajoute les services demandés :<br>• Sélection du type de service (nettoyage à sec, repassage, teinture, etc.)<br>• Indication de la quantité pour chaque service<br>• Ajout de notes spéciales si nécessaire |
| **5.** | Le système calcule automatiquement le total de la commande |
| **6.** | Le gérant vérifie les informations et confirme la création |
| **7.** | Le système génère un numéro de commande unique (ex: CMD-001) |
| **8.** | Le système enregistre la commande avec le statut "En attente" |
| **9.** | Le gérant communique le numéro de commande au client |
| **10.** | Le client repart avec ses informations de commande |

---

## 🔄 Extensions

### **3a. Client existant non trouvé**
- **3a.1.** Le système propose de créer un nouveau profil client
- **3a.2.** Retour à l'étape 3

### **4a. Service non disponible**
- **4a.1.** Le système affiche un message d'indisponibilité
- **4a.2.** Le gérant propose une alternative au client
- **4a.3.** Retour à l'étape 4

### **6a. Informations incomplètes**
- **6a.1.** Le système signale les champs manquants
- **6a.2.** Retour à l'étape concernée

---

## ⚠️ Scénarios d'exception

### **E1. Panne système pendant la création**
- **E1.1.** Le système affiche un message d'erreur
- **E1.2.** Les données saisies sont perdues
- **E1.3.** Le gérant doit recommencer la saisie

### **E2. Client change d'avis pendant la saisie**
- **E2.1.** Le gérant annule la création de commande
- **E2.2.** Retour au dashboard principal

### **E3. Capacité de traitement dépassée**
- **E3.1.** Le système alerte sur la surcharge
- **E3.2.** Le gérant propose un délai de livraison plus long
- **E3.3.** Si accepté, continue le processus normal

---

## 📊 Informations complémentaires

| **Aspect** | **Détail** |
|------------|------------|
| **⏱️ Fréquence d'utilisation** | **Très élevée** - Plusieurs fois par jour (10-50 commandes/jour selon la taille du pressing) |
| **📊 Priorité** | **Critique** - Fonctionnalité centrale du système |
| **🔗 Relations** | • **Include :** "Gérer les clients" (création/sélection client)<br>• **Include :** "Calculer le total" (calcul automatique)<br>• **Extend :** "Ajouter des notes spéciales"<br>• **Précède :** "Suivre une commande"<br>• **Précède :** "Traiter une commande" |
| **📋 Données manipulées** | • **Entrées :** Informations client, services demandés, quantités, notes<br>• **Sorties :** Numéro de commande, total calculé, récapitulatif<br>• **Stockage :** Commande complète dans la base de données |
| **⚡ Exigences non-fonctionnelles** | • **Performance :** Création de commande en moins de 30 secondes<br>• **Fiabilité :** Aucune perte de données lors de la création<br>• **Utilisabilité :** Interface intuitive pour les gérants<br>• **Sécurité :** Authentification requise, traçabilité des actions |

---

## 🎯 Diagramme de flux

```
[Gérant] → [Accès fonction] → [Formulaire affiché]
    ↓
[Sélection/Création client] → [Ajout services] → [Calcul total]
    ↓
[Vérification] → [Confirmation] → [Génération numéro]
    ↓
[Enregistrement] → [Communication client] → [Fin]
```

---

## 📝 Notes d'implémentation

### **Interface utilisateur**
- Formulaire en une seule page avec sections repliables
- Auto-complétion pour la recherche de clients
- Calcul en temps réel du total
- Validation côté client et serveur

### **Logique métier**
- Génération automatique du numéro de commande (format : CMD-XXX)
- Vérification de la disponibilité des services
- Sauvegarde automatique en brouillon toutes les 30 secondes
- Historique des modifications

### **Base de données**
- Table `orders` avec clé étrangère vers `customers`
- Table `order_services` pour les services de chaque commande
- Logs d'audit pour traçabilité
- Index sur les champs de recherche fréquents

---

**Document généré le 15 janvier 2025**  
**ManohPressing v1.0 - Spécification des cas d'utilisation**
