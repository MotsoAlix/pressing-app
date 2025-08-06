/**
 * Fonctionnalités spécifiques au gérant
 */
class ManagerFeatures {
    constructor() {
        this.currentUser = null;
        this.orders = [];
        this.clients = [];
        this.init();
    }

    init() {
        const userData = localStorage.getItem('user');
        if (userData) {
            this.currentUser = JSON.parse(userData);
            if (this.currentUser.role === 'manager') {
                this.loadDashboardData();
                this.setupEventListeners();
            }
        }
    }

    setupEventListeners() {
        // Boutons de changement de statut des commandes
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-update-status')) {
                const orderId = e.target.dataset.orderId;
                const newStatus = e.target.dataset.status;
                this.updateOrderStatus(orderId, newStatus);
            }
        });

        // Formulaire d'envoi de notification
        const notificationForm = document.getElementById('send-notification-form');
        if (notificationForm) {
            notificationForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.sendNotificationToClient();
            });
        }

        // Boutons d'actions rapides
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-notify-ready')) {
                const orderId = e.target.dataset.orderId;
                this.notifyOrderReady(orderId);
            }
        });
    }

    async loadDashboardData() {
        try {
            // Charger les commandes depuis localStorage
            const orders = JSON.parse(localStorage.getItem('manohpressing_orders') || '[]');
            this.orders = orders.filter(order => order.managerId === this.currentUser.id);
            this.renderOrdersByStatus();

            // Charger les clients depuis localStorage
            const users = JSON.parse(localStorage.getItem('manohpressing_users') || '[]');
            this.clients = users.filter(user => user.role === 'client');
            this.renderClientsOverview();

            // Mettre à jour les statistiques
            this.updateStatistics();
        } catch (error) {
            console.error('Erreur lors du chargement des données:', error);
        }
    }

    renderOrdersByStatus() {
        const statuses = {
            'pending': { label: 'En attente', container: 'pending-orders', color: '#f59e0b' },
            'in_progress': { label: 'En cours', container: 'progress-orders', color: '#2563eb' },
            'ready': { label: 'Prêtes', container: 'ready-orders', color: '#10b981' },
            'delivered': { label: 'Livrées', container: 'delivered-orders', color: '#64748b' }
        };

        Object.entries(statuses).forEach(([status, config]) => {
            const container = document.getElementById(config.container);
            if (!container) return;

            const statusOrders = this.orders.filter(order => order.status === status);
            
            container.innerHTML = statusOrders.map(order => `
                <div class="order-card" data-order-id="${order.id}">
                    <div class="order-header">
                        <div class="order-number">#${order.orderNumber}</div>
                        <div class="order-date">${order.createdAt}</div>
                    </div>
                    <div class="order-client">
                        <i class="fas fa-user"></i>
                        ${order.customerName}
                    </div>
                    <div class="order-items">
                        <i class="fas fa-tshirt"></i>
                        ${order.items.length} article(s)
                    </div>
                    <div class="order-total">
                        <strong>${order.total}€</strong>
                    </div>
                    <div class="order-actions">
                        ${this.getOrderActions(order, status)}
                    </div>
                </div>
            `).join('');
        });
    }

    getOrderActions(order, currentStatus) {
        const actions = [];

        switch (currentStatus) {
            case 'pending':
                actions.push(`
                    <button class="btn btn-primary btn-sm btn-update-status" 
                            data-order-id="${order.id}" data-status="in_progress">
                        <i class="fas fa-play"></i> Commencer
                    </button>
                `);
                break;
            
            case 'in_progress':
                actions.push(`
                    <button class="btn btn-success btn-sm btn-update-status" 
                            data-order-id="${order.id}" data-status="ready">
                        <i class="fas fa-check"></i> Terminer
                    </button>
                `);
                break;
            
            case 'ready':
                actions.push(`
                    <button class="btn btn-info btn-sm btn-notify-ready" 
                            data-order-id="${order.id}">
                        <i class="fas fa-bell"></i> Notifier
                    </button>
                    <button class="btn btn-success btn-sm btn-update-status" 
                            data-order-id="${order.id}" data-status="delivered">
                        <i class="fas fa-truck"></i> Livrer
                    </button>
                `);
                break;
        }

        return actions.join('');
    }

    async updateOrderStatus(orderId, newStatus) {
        try {
            // Mettre à jour dans localStorage
            const orders = JSON.parse(localStorage.getItem('manohpressing_orders') || '[]');
            const orderIndex = orders.findIndex(o => o.id === parseInt(orderId));

            if (orderIndex !== -1) {
                orders[orderIndex].status = newStatus;
                orders[orderIndex].updatedAt = new Date().toISOString();
                localStorage.setItem('manohpressing_orders', JSON.stringify(orders));

                // Recharger les données
                this.loadDashboardData();
                this.showToast('Statut mis à jour avec succès', 'success');

                // Notifier automatiquement le client selon le nouveau statut
                this.autoNotifyStatusChange(orderId, newStatus);
            } else {
                this.showToast('Commande non trouvée', 'error');
            }
        } catch (error) {
            console.error('Erreur:', error);
            this.showToast('Erreur lors de la mise à jour', 'error');
        }
    }

    async autoNotifyStatusChange(orderId, newStatus) {
        const order = this.orders.find(o => o.id == orderId);
        if (!order) return;

        const messages = {
            'in_progress': 'Votre commande est maintenant en cours de traitement',
            'ready': 'Votre commande est prête à être récupérée !',
            'delivered': 'Votre commande a été livrée avec succès'
        };

        const types = {
            'in_progress': 'order_progress',
            'ready': 'order_ready',
            'delivered': 'order_delivered'
        };

        if (messages[newStatus] && window.notificationManager) {
            await window.notificationManager.sendNotification(
                order.customerId,
                types[newStatus],
                'Mise à jour commande',
                messages[newStatus],
                { orderId: order.id, orderNumber: order.orderNumber }
            );
        }
    }

    async notifyOrderReady(orderId) {
        const order = this.orders.find(o => o.id == orderId);
        if (!order) return;

        if (window.notificationManager) {
            const success = await window.notificationManager.notifyOrderReady(
                order.customerId,
                order.orderNumber
            );
            
            if (success) {
                this.showToast('Client notifié avec succès', 'success');
            }
        }
    }

    async sendNotificationToClient() {
        const form = document.getElementById('send-notification-form');
        const formData = new FormData(form);
        
        const clientId = formData.get('clientId');
        const type = formData.get('type');
        const title = formData.get('title');
        const message = formData.get('message');

        if (!clientId || !title || !message) {
            this.showToast('Veuillez remplir tous les champs', 'error');
            return;
        }

        if (window.notificationManager) {
            const success = await window.notificationManager.sendNotification(
                parseInt(clientId),
                type,
                title,
                message
            );
            
            if (success) {
                form.reset();
                this.showToast('Notification envoyée avec succès', 'success');
            }
        }
    }

    renderClientsOverview() {
        const container = document.getElementById('clients-overview');
        if (!container) return;

        const recentClients = this.clients.slice(0, 5);
        
        container.innerHTML = recentClients.map(client => `
            <div class="client-card">
                <div class="client-info">
                    <div class="client-name">${client.firstName} ${client.lastName}</div>
                    <div class="client-email">${client.email}</div>
                    <div class="client-phone">${client.phone}</div>
                </div>
                <div class="client-stats">
                    <div class="stat">
                        <span class="stat-value">${client.totalOrders || 0}</span>
                        <span class="stat-label">Commandes</span>
                    </div>
                    <div class="stat">
                        <span class="stat-value">${client.loyaltyPoints || 0}</span>
                        <span class="stat-label">Points</span>
                    </div>
                </div>
                <div class="client-actions">
                    <button class="btn btn-sm btn-primary" onclick="managerFeatures.openChat(${client.id})">
                        <i class="fas fa-comment"></i> Chat
                    </button>
                </div>
            </div>
        `).join('');
    }

    updateStatistics() {
        // Statistiques des commandes
        const stats = {
            total: this.orders.length,
            pending: this.orders.filter(o => o.status === 'pending').length,
            inProgress: this.orders.filter(o => o.status === 'in_progress').length,
            ready: this.orders.filter(o => o.status === 'ready').length,
            delivered: this.orders.filter(o => o.status === 'delivered').length
        };

        // Chiffre d'affaires du jour
        const today = new Date().toISOString().split('T')[0];
        const todayOrders = this.orders.filter(o => o.createdAt.startsWith(today));
        const todayRevenue = todayOrders.reduce((sum, order) => sum + parseFloat(order.total), 0);

        // Mettre à jour les éléments du DOM
        this.updateStatElement('total-orders', stats.total);
        this.updateStatElement('pending-orders-count', stats.pending);
        this.updateStatElement('progress-orders-count', stats.inProgress);
        this.updateStatElement('ready-orders-count', stats.ready);
        this.updateStatElement('today-revenue', `${todayRevenue.toFixed(2)}€`);
        this.updateStatElement('total-clients', this.clients.length);
    }

    updateStatElement(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }

    openChat(clientId) {
        // Ouvrir le chat avec le client
        if (window.chatManager) {
            window.chatManager.openConversation(clientId);
        }
        
        // Afficher le panneau de chat s'il existe
        const chatPanel = document.getElementById('chat-panel');
        if (chatPanel) {
            chatPanel.classList.add('active');
        }
    }

    showToast(message, type = 'info') {
        if (window.showToast) {
            window.showToast(message, type);
        } else {
            console.log(`[${type.toUpperCase()}] ${message}`);
        }
    }

    // Méthodes utilitaires pour les rapports
    generateDailyReport() {
        const today = new Date().toISOString().split('T')[0];
        const todayOrders = this.orders.filter(o => o.createdAt.startsWith(today));
        
        return {
            date: today,
            totalOrders: todayOrders.length,
            revenue: todayOrders.reduce((sum, order) => sum + parseFloat(order.total), 0),
            ordersByStatus: {
                pending: todayOrders.filter(o => o.status === 'pending').length,
                inProgress: todayOrders.filter(o => o.status === 'in_progress').length,
                ready: todayOrders.filter(o => o.status === 'ready').length,
                delivered: todayOrders.filter(o => o.status === 'delivered').length
            }
        };
    }
}

// Initialiser les fonctionnalités gérant
const managerFeatures = new ManagerFeatures();
window.managerFeatures = managerFeatures;
