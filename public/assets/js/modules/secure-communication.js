/**
 * Système de communication sécurisé (Chat + Notifications)
 */

class SecureCommunicationManager {
    constructor() {
        this.currentUser = null;
        this.allowedCommunications = {
            'admin': ['manager', 'client'],
            'manager': ['admin', 'client'],
            'client': ['manager']
        };
        this.init();
    }

    init() {
        this.loadCurrentUser();
        this.setupMessageValidation();
    }

    loadCurrentUser() {
        const userData = localStorage.getItem('user');
        if (userData) {
            this.currentUser = JSON.parse(userData);
        }
    }

    // Validation des communications autorisées
    canCommunicateWith(targetUserId) {
        if (!this.currentUser) return false;

        // Récupérer les informations de l'utilisateur cible
        const users = JSON.parse(localStorage.getItem('manohpressing_users') || '[]');
        const targetUser = users.find(u => u.id === parseInt(targetUserId));
        
        if (!targetUser) return false;

        // Vérifier les règles de communication
        const allowedRoles = this.allowedCommunications[this.currentUser.role] || [];
        
        // Règles spéciales pour les gérants
        if (this.currentUser.role === 'manager' && targetUser.role === 'client') {
            // Gérant peut communiquer avec les clients de son site
            return this.isClientInManagerSite(targetUser.id);
        }

        if (this.currentUser.role === 'client' && targetUser.role === 'manager') {
            // Client peut communiquer avec le gérant de son site préféré ou le gérant de ses commandes
            return this.isManagerForClient(targetUser.id);
        }

        return allowedRoles.includes(targetUser.role);
    }

    isClientInManagerSite(clientId) {
        // Vérifier si le client a des commandes gérées par ce gérant
        const orders = JSON.parse(localStorage.getItem('manohpressing_orders') || '[]');
        return orders.some(order => 
            order.customerId === clientId && order.managerId === this.currentUser.id
        );
    }

    isManagerForClient(managerId) {
        // Vérifier si ce gérant gère des commandes du client actuel
        const orders = JSON.parse(localStorage.getItem('manohpressing_orders') || '[]');
        return orders.some(order => 
            order.customerId === this.currentUser.id && order.managerId === managerId
        );
    }

    // Envoi de messages sécurisé
    async sendMessage(receiverId, message, messageType = 'text') {
        // Validation des permissions
        if (!this.canCommunicateWith(receiverId)) {
            throw new Error('Communication non autorisée avec cet utilisateur');
        }

        // Validation du contenu
        if (!this.validateMessageContent(message, messageType)) {
            throw new Error('Contenu du message invalide');
        }

        // Créer le message
        const newMessage = {
            id: Date.now().toString(),
            senderId: this.currentUser.id,
            senderName: `${this.currentUser.firstName} ${this.currentUser.lastName}`,
            senderRole: this.currentUser.role,
            receiverId: parseInt(receiverId),
            message: this.sanitizeMessage(message),
            messageType: messageType,
            timestamp: new Date().toISOString(),
            isRead: false,
            siteId: this.currentUser.siteId || null
        };

        // Sauvegarder le message
        const messages = JSON.parse(localStorage.getItem('manohpressing_messages') || '[]');
        messages.push(newMessage);
        localStorage.setItem('manohpressing_messages', JSON.stringify(messages));

        // Créer une notification pour le destinataire
        await this.createNotificationForMessage(newMessage);

        return newMessage;
    }

    validateMessageContent(message, messageType) {
        if (!message || typeof message !== 'string') return false;
        
        // Longueur maximale
        if (message.length > 1000) return false;
        
        // Vérifier le contenu selon le type
        switch (messageType) {
            case 'text':
                return this.validateTextMessage(message);
            case 'order_update':
                return this.validateOrderUpdateMessage(message);
            default:
                return false;
        }
    }

    validateTextMessage(message) {
        // Filtrer les contenus inappropriés (liste basique)
        const forbiddenWords = ['spam', 'hack', 'virus'];
        const lowerMessage = message.toLowerCase();
        
        return !forbiddenWords.some(word => lowerMessage.includes(word));
    }

    validateOrderUpdateMessage(message) {
        // Valider que le message contient des informations de commande valides
        return message.includes('CMD-') || message.includes('commande');
    }

    sanitizeMessage(message) {
        // Nettoyer le message des caractères dangereux
        return message
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/<[^>]*>/g, '')
            .trim();
    }

    // Système de notifications sécurisé
    async sendNotification(userId, type, title, message, data = {}) {
        // Vérifier les permissions d'envoi de notifications
        if (!this.canSendNotificationTo(userId, type)) {
            throw new Error('Permission insuffisante pour envoyer cette notification');
        }

        const notification = {
            id: Date.now().toString(),
            userId: parseInt(userId),
            type: type,
            title: title,
            message: this.sanitizeMessage(message),
            data: data,
            senderId: this.currentUser.id,
            senderRole: this.currentUser.role,
            timestamp: new Date().toISOString(),
            isRead: false,
            priority: this.getNotificationPriority(type)
        };

        // Sauvegarder la notification
        const notifications = JSON.parse(localStorage.getItem('manohpressing_notifications') || '[]');
        notifications.push(notification);
        localStorage.setItem('manohpressing_notifications', JSON.stringify(notifications));

        return notification;
    }

    canSendNotificationTo(userId, notificationType) {
        if (!this.currentUser) return false;

        // Règles par rôle
        switch (this.currentUser.role) {
            case 'admin':
                return true; // Admin peut notifier tout le monde

            case 'manager':
                // Gérant peut notifier ses clients et l'admin
                const users = JSON.parse(localStorage.getItem('manohpressing_users') || '[]');
                const targetUser = users.find(u => u.id === parseInt(userId));
                
                if (!targetUser) return false;
                
                if (targetUser.role === 'admin') return true;
                if (targetUser.role === 'client') {
                    return this.isClientInManagerSite(userId);
                }
                return false;

            case 'client':
                // Client ne peut pas envoyer de notifications directement
                return false;

            default:
                return false;
        }
    }

    getNotificationPriority(type) {
        const priorities = {
            'order_ready': 'high',
            'order_delivered': 'medium',
            'order_started': 'medium',
            'restock_request': 'high',
            'system_alert': 'urgent',
            'chat_message': 'low'
        };
        
        return priorities[type] || 'medium';
    }

    async createNotificationForMessage(message) {
        // Créer une notification pour le nouveau message
        await this.sendNotification(
            message.receiverId,
            'chat_message',
            `Nouveau message de ${message.senderName}`,
            message.message.substring(0, 100) + (message.message.length > 100 ? '...' : ''),
            { messageId: message.id }
        );
    }

    // Récupération sécurisée des messages
    getMessagesForUser(userId = null) {
        if (!this.currentUser) return [];

        const messages = JSON.parse(localStorage.getItem('manohpressing_messages') || '[]');
        const targetUserId = userId || this.currentUser.id;

        // Filtrer les messages selon les permissions
        return messages.filter(message => {
            // L'utilisateur peut voir ses propres messages
            if (message.senderId === targetUserId || message.receiverId === targetUserId) {
                return true;
            }

            // Admin peut voir tous les messages
            if (this.currentUser.role === 'admin') {
                return true;
            }

            return false;
        });
    }

    // Récupération sécurisée des notifications
    getNotificationsForUser(userId = null) {
        if (!this.currentUser) return [];

        const notifications = JSON.parse(localStorage.getItem('manohpressing_notifications') || '[]');
        const targetUserId = userId || this.currentUser.id;

        // Seul l'utilisateur peut voir ses notifications (sauf admin)
        if (this.currentUser.role === 'admin' || this.currentUser.id === targetUserId) {
            return notifications.filter(n => n.userId === targetUserId);
        }

        return [];
    }

    // Marquer les messages comme lus
    markMessagesAsRead(conversationUserId) {
        if (!this.currentUser) return;

        const messages = JSON.parse(localStorage.getItem('manohpressing_messages') || '[]');
        let updated = false;

        messages.forEach(message => {
            if (message.receiverId === this.currentUser.id && 
                message.senderId === conversationUserId && 
                !message.isRead) {
                message.isRead = true;
                updated = true;
            }
        });

        if (updated) {
            localStorage.setItem('manohpressing_messages', JSON.stringify(messages));
        }
    }

    // Obtenir les conversations autorisées
    getAuthorizedConversations() {
        if (!this.currentUser) return [];

        const users = JSON.parse(localStorage.getItem('manohpressing_users') || '[]');
        const allowedRoles = this.allowedCommunications[this.currentUser.role] || [];

        return users.filter(user => {
            if (user.id === this.currentUser.id) return false;
            
            // Vérifier les rôles autorisés
            if (!allowedRoles.includes(user.role)) return false;

            // Vérifications spécifiques selon le rôle
            if (this.currentUser.role === 'manager' && user.role === 'client') {
                return this.isClientInManagerSite(user.id);
            }

            if (this.currentUser.role === 'client' && user.role === 'manager') {
                return this.isManagerForClient(user.id);
            }

            return true;
        });
    }

    // Statistiques de communication
    getCommunicationStats() {
        if (!this.currentUser) return null;

        const messages = this.getMessagesForUser();
        const notifications = this.getNotificationsForUser();

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return {
            totalMessages: messages.length,
            todayMessages: messages.filter(m => new Date(m.timestamp) >= today).length,
            unreadMessages: messages.filter(m => m.receiverId === this.currentUser.id && !m.isRead).length,
            totalNotifications: notifications.length,
            unreadNotifications: notifications.filter(n => !n.isRead).length
        };
    }
}

// Instance globale
window.secureCommunicationManager = new SecureCommunicationManager();
