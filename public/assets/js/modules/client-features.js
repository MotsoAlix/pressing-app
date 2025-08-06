/**
 * Fonctionnalités spécifiques au client
 */
class ClientFeatures {
    constructor() {
        this.currentUser = null;
        this.orders = [];
        this.notifications = [];
        this.loyaltyPoints = 0;
        this.init();
    }

    init() {
        const userData = localStorage.getItem('user');
        if (userData) {
            this.currentUser = JSON.parse(userData);
            if (this.currentUser.role === 'client') {
                this.loadDashboardData();
                this.setupEventListeners();
                this.startPolling();
            }
        }
    }

    setupEventListeners() {
        // Formulaire de recherche de commande
        const trackingForm = document.getElementById('tracking-form');
        if (trackingForm) {
            trackingForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.trackOrder();
            });
        }

        // Boutons d'actions
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-track-order')) {
                const orderNumber = e.target.dataset.orderNumber;
                this.showOrderDetails(orderNumber);
            }
            
            if (e.target.classList.contains('btn-contact-manager')) {
                this.openChatWithManager();
            }
        });
    }

    async loadDashboardData() {
        try {
            // Charger les commandes du client
            const ordersResponse = await fetch(`/api/orders?customerId=${this.currentUser.id}`);
            const ordersData = await ordersResponse.json();
            if (ordersData.success) {
                this.orders = ordersData.data;
                this.renderActiveOrders();
                this.renderOrderHistory();
            }

            // Charger les notifications
            if (window.notificationManager) {
                await window.notificationManager.loadNotifications();
            }

            // Mettre à jour les statistiques
            this.updateClientStatistics();
            
            // Simuler les points de fidélité
            this.loyaltyPoints = this.calculateLoyaltyPoints();
            this.updateLoyaltyDisplay();
        } catch (error) {
            console.error('Erreur lors du chargement des données:', error);
        }
    }

    renderActiveOrders() {
        const container = document.getElementById('active-orders');
        if (!container) return;

        const activeOrders = this.orders.filter(order => 
            ['pending', 'in_progress', 'ready'].includes(order.status)
        );

        if (activeOrders.length === 0) {
            container.innerHTML = `
                <div class="no-orders">
                    <i class="fas fa-inbox"></i>
                    <p>Aucune commande en cours</p>
                    <button class="btn btn-primary" onclick="clientFeatures.contactManager()">
                        <i class="fas fa-plus"></i> Nouvelle commande
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = activeOrders.map(order => `
            <div class="order-card active-order" data-order-id="${order.id}">
                <div class="order-header">
                    <div class="order-number">#${order.orderNumber}</div>
                    <div class="order-status ${order.status}">
                        ${this.getStatusLabel(order.status)}
                    </div>
                </div>
                <div class="order-progress">
                    ${this.renderOrderProgress(order.status)}
                </div>
                <div class="order-details">
                    <div class="order-items">
                        <i class="fas fa-tshirt"></i>
                        ${order.items.length} article(s)
                    </div>
                    <div class="order-date">
                        <i class="fas fa-calendar"></i>
                        ${this.formatDate(order.createdAt)}
                    </div>
                    <div class="order-total">
                        <strong>${order.total}€</strong>
                    </div>
                </div>
                <div class="order-actions">
                    <button class="btn btn-sm btn-outline btn-track-order" 
                            data-order-number="${order.orderNumber}">
                        <i class="fas fa-search"></i> Détails
                    </button>
                    ${order.status === 'ready' ? `
                        <button class="btn btn-sm btn-success">
                            <i class="fas fa-check"></i> Prêt !
                        </button>
                    ` : ''}
                </div>
            </div>
        `).join('');
    }

    renderOrderProgress(status) {
        const steps = [
            { key: 'pending', label: 'Reçue', icon: 'fas fa-inbox' },
            { key: 'in_progress', label: 'En cours', icon: 'fas fa-cog' },
            { key: 'ready', label: 'Prête', icon: 'fas fa-check-circle' },
            { key: 'delivered', label: 'Livrée', icon: 'fas fa-truck' }
        ];

        const currentIndex = steps.findIndex(step => step.key === status);
        
        return `
            <div class="progress-steps">
                ${steps.map((step, index) => `
                    <div class="progress-step ${index <= currentIndex ? 'completed' : ''}">
                        <div class="step-icon">
                            <i class="${step.icon}"></i>
                        </div>
                        <div class="step-label">${step.label}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderOrderHistory() {
        const container = document.getElementById('order-history');
        if (!container) return;

        const completedOrders = this.orders.filter(order => 
            order.status === 'delivered'
        ).slice(0, 10); // Dernières 10 commandes

        if (completedOrders.length === 0) {
            container.innerHTML = `
                <div class="no-history">
                    <i class="fas fa-history"></i>
                    <p>Aucun historique de commande</p>
                </div>
            `;
            return;
        }

        container.innerHTML = completedOrders.map(order => `
            <div class="history-item">
                <div class="history-date">${this.formatDate(order.deliveredAt || order.createdAt)}</div>
                <div class="history-details">
                    <div class="history-number">#${order.orderNumber}</div>
                    <div class="history-items">${order.items.length} article(s)</div>
                    <div class="history-total">${order.total}€</div>
                </div>
                <div class="history-actions">
                    <button class="btn btn-sm btn-outline btn-track-order" 
                            data-order-number="${order.orderNumber}">
                        <i class="fas fa-eye"></i> Voir
                    </button>
                </div>
            </div>
        `).join('');
    }

    async trackOrder() {
        const form = document.getElementById('tracking-form');
        const trackingCode = form.querySelector('input[name="trackingCode"]').value.trim();
        
        if (!trackingCode) {
            this.showToast('Veuillez saisir un code de suivi', 'error');
            return;
        }

        try {
            const response = await fetch(`/api/tracking/search?code=${encodeURIComponent(trackingCode)}`);
            const data = await response.json();
            
            if (data.success && data.data) {
                this.showOrderDetails(data.data.orderNumber);
            } else {
                this.showToast('Commande non trouvée', 'error');
            }
        } catch (error) {
            console.error('Erreur lors de la recherche:', error);
            this.showToast('Erreur lors de la recherche', 'error');
        }
    }

    showOrderDetails(orderNumber) {
        const order = this.orders.find(o => o.orderNumber === orderNumber);
        if (!order) {
            this.showToast('Commande non trouvée', 'error');
            return;
        }

        // Créer une modal avec les détails
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Détails de la commande #${order.orderNumber}</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="order-status-display">
                        <div class="status-badge ${order.status}">
                            ${this.getStatusLabel(order.status)}
                        </div>
                    </div>
                    
                    ${this.renderOrderProgress(order.status)}
                    
                    <div class="order-info-grid">
                        <div class="info-item">
                            <label>Date de dépôt</label>
                            <value>${this.formatDate(order.createdAt)}</value>
                        </div>
                        <div class="info-item">
                            <label>Date prévue</label>
                            <value>${this.formatDate(order.expectedDate)}</value>
                        </div>
                        <div class="info-item">
                            <label>Total</label>
                            <value><strong>${order.total}€</strong></value>
                        </div>
                    </div>
                    
                    <div class="order-items-detail">
                        <h4>Articles</h4>
                        ${order.items.map(item => `
                            <div class="item-detail">
                                <span class="item-name">${item.name}</span>
                                <span class="item-service">${item.service}</span>
                                <span class="item-price">${item.price}€</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary btn-contact-manager">
                        <i class="fas fa-comment"></i> Contacter le gérant
                    </button>
                    <button class="btn btn-outline" onclick="this.closest('.modal').remove()">
                        Fermer
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    updateClientStatistics() {
        const stats = {
            totalOrders: this.orders.length,
            activeOrders: this.orders.filter(o => ['pending', 'in_progress', 'ready'].includes(o.status)).length,
            completedOrders: this.orders.filter(o => o.status === 'delivered').length,
            totalSpent: this.orders.reduce((sum, order) => sum + parseFloat(order.total), 0)
        };

        this.updateStatElement('total-orders-count', stats.totalOrders);
        this.updateStatElement('active-orders-count', stats.activeOrders);
        this.updateStatElement('completed-orders-count', stats.completedOrders);
        this.updateStatElement('total-spent', `${stats.totalSpent.toFixed(2)}€`);
    }

    calculateLoyaltyPoints() {
        // 1 point par euro dépensé
        const totalSpent = this.orders.reduce((sum, order) => sum + parseFloat(order.total), 0);
        return Math.floor(totalSpent);
    }

    updateLoyaltyDisplay() {
        this.updateStatElement('loyalty-points', this.loyaltyPoints);
        
        // Calculer le niveau de fidélité
        const level = Math.floor(this.loyaltyPoints / 100) + 1;
        const nextLevelPoints = level * 100;
        const progressPercent = ((this.loyaltyPoints % 100) / 100) * 100;
        
        this.updateStatElement('loyalty-level', level);
        this.updateStatElement('next-level-points', nextLevelPoints - this.loyaltyPoints);
        
        const progressBar = document.getElementById('loyalty-progress');
        if (progressBar) {
            progressBar.style.width = `${progressPercent}%`;
        }
    }

    updateStatElement(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }

    getStatusLabel(status) {
        const labels = {
            'pending': 'En attente',
            'in_progress': 'En cours',
            'ready': 'Prête',
            'delivered': 'Livrée'
        };
        return labels[status] || status;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }

    contactManager() {
        this.openChatWithManager();
    }

    openChatWithManager() {
        // Trouver le gérant (ID 2 dans nos données de test)
        const managerId = 2;
        
        if (window.chatManager) {
            window.chatManager.openConversation(managerId);
        }
        
        // Afficher le panneau de chat
        const chatPanel = document.getElementById('chat-panel');
        if (chatPanel) {
            chatPanel.classList.add('active');
        }
    }

    startPolling() {
        // Vérifier les mises à jour toutes les 30 secondes
        setInterval(() => {
            this.loadDashboardData();
        }, 30000);
    }

    showToast(message, type = 'info') {
        if (window.showToast) {
            window.showToast(message, type);
        } else {
            console.log(`[${type.toUpperCase()}] ${message}`);
        }
    }

    // Méthodes utilitaires
    getOrdersByStatus(status) {
        return this.orders.filter(order => order.status === status);
    }

    getMonthlySpending() {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        return this.orders
            .filter(order => {
                const orderDate = new Date(order.createdAt);
                return orderDate.getMonth() === currentMonth && 
                       orderDate.getFullYear() === currentYear;
            })
            .reduce((sum, order) => sum + parseFloat(order.total), 0);
    }

    getAverageOrderValue() {
        if (this.orders.length === 0) return 0;
        const total = this.orders.reduce((sum, order) => sum + parseFloat(order.total), 0);
        return total / this.orders.length;
    }
}

// Initialiser les fonctionnalités client
const clientFeatures = new ClientFeatures();
window.clientFeatures = clientFeatures;
