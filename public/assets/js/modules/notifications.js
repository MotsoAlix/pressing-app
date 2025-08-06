/**
 * Module de gestion des notifications
 */
class NotificationManager {
    constructor() {
        this.notifications = [];
        this.unreadCount = 0;
        this.currentUser = null;
        this.init();
    }

    init() {
        // Récupérer l'utilisateur connecté
        const userData = localStorage.getItem('user');
        if (userData) {
            this.currentUser = JSON.parse(userData);
            this.loadNotifications();
            this.updateUnreadCount();
            this.startPolling();
        }
    }

    async loadNotifications() {
        if (!this.currentUser) return;

        try {
            const response = await fetch(`/api/notifications?userId=${this.currentUser.id}`);
            const data = await response.json();

            if (data.success) {
                this.notifications = data.data;
                this.renderNotifications();
            }
        } catch (error) {
            console.error('Erreur lors du chargement des notifications:', error);
        }
    }

    async updateUnreadCount() {
        if (!this.currentUser) return;

        try {
            // Utiliser les données locales au lieu d'une API
            const notifications = JSON.parse(localStorage.getItem('manohpressing_notifications') || '[]');
            const userNotifications = notifications.filter(n => n.userId === this.currentUser.id);
            this.unreadCount = userNotifications.filter(n => !n.isRead).length;
            this.updateBadge();
        } catch (error) {
            console.error('Erreur lors de la mise à jour du compteur:', error);
        }
    }

    getNotifications() {
        const notifications = JSON.parse(localStorage.getItem('manohpressing_notifications') || '[]');
        return notifications.filter(n => n.userId === this.currentUser.id);
    }

    updateBadge() {
        const badges = document.querySelectorAll('.notification-badge');
        badges.forEach(badge => {
            if (this.unreadCount > 0) {
                badge.textContent = this.unreadCount > 99 ? '99+' : this.unreadCount;
                badge.style.display = 'block';
            } else {
                badge.style.display = 'none';
            }
        });
    }

    renderNotifications() {
        const container = document.getElementById('notifications-list');
        if (!container) return;

        if (this.notifications.length === 0) {
            container.innerHTML = `
                <div class="notification-empty">
                    <i class="fas fa-bell-slash"></i>
                    <p>Aucune notification</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.notifications.map(notification => `
            <div class="notification-item ${notification.isRead ? 'read' : 'unread'}" 
                 data-id="${notification.id}">
                <div class="notification-icon" style="color: ${notification.color}">
                    <i class="${notification.icon}"></i>
                </div>
                <div class="notification-content">
                    <div class="notification-title">${notification.title}</div>
                    <div class="notification-message">${notification.message}</div>
                    <div class="notification-time">${notification.timeAgo}</div>
                </div>
                <div class="notification-actions">
                    ${!notification.isRead ? `
                        <button class="btn-mark-read" onclick="notificationManager.markAsRead(${notification.id})">
                            <i class="fas fa-check"></i>
                        </button>
                    ` : ''}
                    <button class="btn-delete" onclick="notificationManager.deleteNotification(${notification.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    async markAsRead(id) {
        try {
            const response = await fetch(`/api/notifications/${id}/read`, {
                method: 'PUT'
            });

            const data = await response.json();
            if (data.success) {
                // Mettre à jour localement
                const notification = this.notifications.find(n => n.id === id);
                if (notification) {
                    notification.isRead = true;
                }
                this.renderNotifications();
                this.updateUnreadCount();
            }
        } catch (error) {
            console.error('Erreur lors du marquage comme lu:', error);
        }
    }

    async markAllAsRead() {
        if (!this.currentUser) return;

        try {
            const response = await fetch('/api/notifications/mark-all-read', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userId: this.currentUser.id })
            });

            const data = await response.json();
            if (data.success) {
                this.notifications.forEach(n => n.isRead = true);
                this.renderNotifications();
                this.updateUnreadCount();
                this.showToast('Toutes les notifications ont été marquées comme lues', 'success');
            }
        } catch (error) {
            console.error('Erreur lors du marquage global:', error);
        }
    }

    async deleteNotification(id) {
        try {
            const response = await fetch(`/api/notifications/${id}`, {
                method: 'DELETE'
            });

            const data = await response.json();
            if (data.success) {
                this.notifications = this.notifications.filter(n => n.id !== id);
                this.renderNotifications();
                this.updateUnreadCount();
                this.showToast('Notification supprimée', 'success');
            }
        } catch (error) {
            console.error('Erreur lors de la suppression:', error);
        }
    }

    async sendNotification(receiverId, type, title, message, data = {}) {
        if (!this.currentUser) return;

        try {
            const response = await fetch('/api/notifications', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    senderId: this.currentUser.id,
                    receiverId,
                    type,
                    title,
                    message,
                    data
                })
            });

            const result = await response.json();
            if (result.success) {
                this.showToast('Notification envoyée avec succès', 'success');
                return true;
            } else {
                this.showToast('Erreur lors de l\'envoi', 'error');
                return false;
            }
        } catch (error) {
            console.error('Erreur lors de l\'envoi:', error);
            this.showToast('Erreur lors de l\'envoi', 'error');
            return false;
        }
    }

    startPolling() {
        // Vérifier les nouvelles notifications toutes les 30 secondes
        setInterval(() => {
            this.updateUnreadCount();
        }, 30000);
    }

    showToast(message, type = 'info') {
        // Utiliser le système de toast existant
        if (window.showToast) {
            window.showToast(message, type);
        } else {
            console.log(`[${type.toUpperCase()}] ${message}`);
        }
    }

    // Méthodes utilitaires pour les différents types de notifications
    async notifyOrderReady(clientId, orderNumber) {
        return await this.sendNotification(
            clientId,
            'order_ready',
            'Commande prête',
            `Votre commande ${orderNumber} est prête à être récupérée`,
            { orderNumber }
        );
    }

    async notifyOrderProgress(clientId, orderNumber, status) {
        return await this.sendNotification(
            clientId,
            'order_progress',
            'Mise à jour commande',
            `Votre commande ${orderNumber} est maintenant ${status}`,
            { orderNumber, status }
        );
    }

    async notifyPaymentReceived(clientId, amount) {
        return await this.sendNotification(
            clientId,
            'payment_received',
            'Paiement reçu',
            `Votre paiement de ${amount}€ a été reçu avec succès`,
            { amount }
        );
    }

    async notifyLoyaltyPoints(clientId, points, total) {
        return await this.sendNotification(
            clientId,
            'loyalty_points',
            'Points fidélité',
            `Vous avez gagné ${points} points ! Total: ${total} points`,
            { points, total }
        );
    }
}

// Initialiser le gestionnaire de notifications
const notificationManager = new NotificationManager();

// Fonctions globales pour l'interface
window.notificationManager = notificationManager;
