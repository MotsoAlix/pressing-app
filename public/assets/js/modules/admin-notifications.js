/**
 * Système de notifications pour l'administrateur
 * Gère les notifications de réapprovisionnement et autres alertes
 */

class AdminNotificationManager {
    constructor() {
        this.notifications = [];
        this.init();
    }

    init() {
        this.loadNotifications();
        this.setupEventListeners();
    }

    loadNotifications() {
        const saved = localStorage.getItem('manohpressing_admin_notifications');
        if (saved) {
            this.notifications = JSON.parse(saved);
        }
        this.updateNotificationBadges();
    }

    saveNotifications() {
        localStorage.setItem('manohpressing_admin_notifications', JSON.stringify(this.notifications));
        this.updateNotificationBadges();
    }

    setupEventListeners() {
        // Écouter les nouvelles notifications de réapprovisionnement
        window.addEventListener('storage', (e) => {
            if (e.key === 'manohpressing_restock_requests') {
                this.checkForNewRestockRequests();
            }
        });

        // Vérifier périodiquement les nouvelles demandes
        setInterval(() => {
            this.checkForNewRestockRequests();
        }, 30000); // Toutes les 30 secondes
    }

    checkForNewRestockRequests() {
        const requests = JSON.parse(localStorage.getItem('manohpressing_restock_requests') || '[]');
        
        requests.forEach(request => {
            if (!this.notifications.find(n => n.id === `restock_${request.id}`)) {
                this.addNotification({
                    id: `restock_${request.id}`,
                    type: 'restock_request',
                    title: 'Demande de réapprovisionnement',
                    message: `Le gérant ${request.managerName} demande le réapprovisionnement de "${request.itemName}"`,
                    data: request,
                    timestamp: new Date().toISOString(),
                    isRead: false,
                    priority: 'high'
                });
            }
        });
    }

    addNotification(notification) {
        this.notifications.unshift(notification);
        this.saveNotifications();
        
        // Afficher une notification toast si disponible
        if (window.showToast) {
            showToast(notification.title, 'info');
        }
        
        // Jouer un son de notification
        this.playNotificationSound();
    }

    markAsRead(notificationId) {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification) {
            notification.isRead = true;
            this.saveNotifications();
        }
    }

    markAllAsRead() {
        this.notifications.forEach(n => n.isRead = true);
        this.saveNotifications();
    }

    deleteNotification(notificationId) {
        this.notifications = this.notifications.filter(n => n.id !== notificationId);
        this.saveNotifications();
    }

    getUnreadCount() {
        return this.notifications.filter(n => !n.isRead).length;
    }

    updateNotificationBadges() {
        const unreadCount = this.getUnreadCount();
        const badges = document.querySelectorAll('.admin-notification-badge');
        
        badges.forEach(badge => {
            badge.textContent = unreadCount;
            badge.style.display = unreadCount > 0 ? 'inline' : 'none';
        });
    }

    renderNotifications(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (this.notifications.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 3rem; color: var(--text-secondary);">
                    <i class="fas fa-bell-slash" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.3;"></i>
                    <h3>Aucune notification</h3>
                    <p>Les notifications apparaîtront ici</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.notifications.map(notification => `
            <div class="admin-notification-item ${notification.isRead ? 'read' : 'unread'} ${notification.priority || 'normal'}">
                <div class="notification-header">
                    <div class="notification-type-icon">
                        ${this.getNotificationIcon(notification.type)}
                    </div>
                    <div class="notification-content">
                        <h4 class="notification-title">${notification.title}</h4>
                        <p class="notification-message">${notification.message}</p>
                        <div class="notification-time">${this.formatTime(notification.timestamp)}</div>
                    </div>
                    <div class="notification-actions">
                        ${this.getNotificationActions(notification)}
                    </div>
                </div>
            </div>
        `).join('');
    }

    getNotificationIcon(type) {
        const icons = {
            'restock_request': '<i class="fas fa-boxes" style="color: var(--warning-color);"></i>',
            'low_stock': '<i class="fas fa-exclamation-triangle" style="color: var(--error-color);"></i>',
            'system': '<i class="fas fa-cog" style="color: var(--primary-color);"></i>',
            'manager_message': '<i class="fas fa-user-tie" style="color: var(--info-color);"></i>'
        };
        return icons[type] || '<i class="fas fa-bell"></i>';
    }

    getNotificationActions(notification) {
        let actions = `
            <button class="btn btn-sm btn-outline" onclick="adminNotificationManager.markAsRead('${notification.id}')">
                <i class="fas fa-check"></i>
            </button>
            <button class="btn btn-sm btn-outline" onclick="adminNotificationManager.deleteNotification('${notification.id}')">
                <i class="fas fa-trash"></i>
            </button>
        `;

        if (notification.type === 'restock_request') {
            actions += `
                <button class="btn btn-sm btn-success" onclick="adminNotificationManager.approveRestockRequest('${notification.id}')">
                    <i class="fas fa-check-circle"></i> Approuver
                </button>
            `;
        }

        return actions;
    }

    approveRestockRequest(notificationId) {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (!notification || notification.type !== 'restock_request') return;

        // Marquer la demande comme approuvée
        const requests = JSON.parse(localStorage.getItem('manohpressing_restock_requests') || '[]');
        const request = requests.find(r => `restock_${r.id}` === notificationId);
        
        if (request) {
            request.status = 'approved';
            request.approvedAt = new Date().toISOString();
            request.approvedBy = 'Admin';
            
            localStorage.setItem('manohpressing_restock_requests', JSON.stringify(requests));
            
            // Créer une notification de confirmation pour le gérant
            this.createManagerNotification({
                type: 'restock_approved',
                title: 'Demande de réapprovisionnement approuvée',
                message: `Votre demande de réapprovisionnement pour "${request.itemName}" a été approuvée.`,
                managerId: request.managerId
            });
        }

        // Marquer la notification comme lue et la supprimer
        this.deleteNotification(notificationId);
        
        if (window.showToast) {
            showToast('Demande de réapprovisionnement approuvée', 'success');
        }
    }

    createManagerNotification(notificationData) {
        const managerNotifications = JSON.parse(localStorage.getItem('manohpressing_manager_notifications') || '[]');
        
        managerNotifications.unshift({
            id: Date.now().toString(),
            ...notificationData,
            timestamp: new Date().toISOString(),
            isRead: false
        });
        
        localStorage.setItem('manohpressing_manager_notifications', JSON.stringify(managerNotifications));
    }

    formatTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diffInHours = (now - date) / (1000 * 60 * 60);

        if (diffInHours < 1) {
            const minutes = Math.floor((now - date) / (1000 * 60));
            return minutes === 0 ? 'À l\'instant' : `Il y a ${minutes} min`;
        } else if (diffInHours < 24) {
            return `Il y a ${Math.floor(diffInHours)}h`;
        } else {
            return date.toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
    }

    playNotificationSound() {
        // Créer un son de notification simple
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
        } catch (error) {
            console.log('Notification sound not available');
        }
    }

    // Méthodes pour créer différents types de notifications
    createLowStockAlert(stockItem) {
        this.addNotification({
            id: `low_stock_${stockItem.id}_${Date.now()}`,
            type: 'low_stock',
            title: 'Stock faible',
            message: `L'article "${stockItem.name}" est en rupture de stock (${stockItem.quantity} ${stockItem.unit} restant)`,
            data: stockItem,
            timestamp: new Date().toISOString(),
            isRead: false,
            priority: 'high'
        });
    }

    createSystemNotification(title, message) {
        this.addNotification({
            id: `system_${Date.now()}`,
            type: 'system',
            title: title,
            message: message,
            timestamp: new Date().toISOString(),
            isRead: false,
            priority: 'normal'
        });
    }

    createManagerMessage(managerId, managerName, message) {
        this.addNotification({
            id: `manager_msg_${Date.now()}`,
            type: 'manager_message',
            title: `Message de ${managerName}`,
            message: message,
            data: { managerId, managerName },
            timestamp: new Date().toISOString(),
            isRead: false,
            priority: 'normal'
        });
    }
}

// Initialiser le gestionnaire de notifications admin
const adminNotificationManager = new AdminNotificationManager();
window.adminNotificationManager = adminNotificationManager;
