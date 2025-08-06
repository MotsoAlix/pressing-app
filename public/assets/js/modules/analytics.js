/**
 * Module d'analytics et rapports
 */
class AnalyticsManager {
    constructor() {
        this.currentUser = null;
        this.data = {
            orders: [],
            customers: [],
            payments: [],
            notifications: []
        };
        this.charts = {};
        this.init();
    }

    init() {
        const userData = localStorage.getItem('user');
        if (userData) {
            this.currentUser = JSON.parse(userData);
            this.loadAnalyticsData();
            this.setupEventListeners();
        }
    }

    setupEventListeners() {
        // Sélecteur de période
        const periodSelector = document.getElementById('analytics-period');
        if (periodSelector) {
            periodSelector.addEventListener('change', () => {
                this.updateAnalytics();
            });
        }

        // Boutons d'export
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-export-pdf')) {
                this.exportToPDF();
            }
            if (e.target.classList.contains('btn-export-excel')) {
                this.exportToExcel();
            }
        });
    }

    async loadAnalyticsData() {
        try {
            // Charger toutes les données nécessaires
            const [ordersRes, customersRes, paymentsRes] = await Promise.all([
                fetch('/api/orders'),
                fetch('/api/customers'),
                fetch('/api/payments')
            ]);

            const [ordersData, customersData, paymentsData] = await Promise.all([
                ordersRes.json(),
                customersRes.json(),
                paymentsRes.json()
            ]);

            if (ordersData.success) this.data.orders = ordersData.data;
            if (customersData.success) this.data.customers = customersData.data;
            if (paymentsData.success) this.data.payments = paymentsData.data;

            this.updateAnalytics();
        } catch (error) {
            console.error('Erreur lors du chargement des données analytics:', error);
        }
    }

    updateAnalytics() {
        const period = this.getSelectedPeriod();
        const filteredData = this.filterDataByPeriod(period);

        this.updateKPIs(filteredData);
        this.updateCharts(filteredData);
        this.updateTables(filteredData);
    }

    getSelectedPeriod() {
        const selector = document.getElementById('analytics-period');
        return selector ? selector.value : 'month';
    }

    filterDataByPeriod(period) {
        const now = new Date();
        let startDate;

        switch (period) {
            case 'day':
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                break;
            case 'week':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case 'month':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
            case 'year':
                startDate = new Date(now.getFullYear(), 0, 1);
                break;
            default:
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        }

        return {
            orders: this.data.orders.filter(order => new Date(order.createdAt) >= startDate),
            customers: this.data.customers.filter(customer => new Date(customer.createdAt) >= startDate),
            payments: this.data.payments.filter(payment => new Date(payment.createdAt) >= startDate)
        };
    }

    updateKPIs(data) {
        // Calcul des KPIs
        const kpis = {
            totalRevenue: data.orders.reduce((sum, order) => sum + parseFloat(order.total), 0),
            totalOrders: data.orders.length,
            newCustomers: data.customers.length,
            averageOrderValue: data.orders.length > 0 ? 
                data.orders.reduce((sum, order) => sum + parseFloat(order.total), 0) / data.orders.length : 0,
            completionRate: data.orders.length > 0 ? 
                (data.orders.filter(o => o.status === 'delivered').length / data.orders.length) * 100 : 0,
            pendingOrders: data.orders.filter(o => o.status === 'pending').length
        };

        // Mettre à jour les éléments du DOM
        this.updateKPIElement('total-revenue', `${kpis.totalRevenue.toFixed(2)}€`);
        this.updateKPIElement('total-orders', kpis.totalOrders);
        this.updateKPIElement('new-customers', kpis.newCustomers);
        this.updateKPIElement('average-order-value', `${kpis.averageOrderValue.toFixed(2)}€`);
        this.updateKPIElement('completion-rate', `${kpis.completionRate.toFixed(1)}%`);
        this.updateKPIElement('pending-orders', kpis.pendingOrders);
    }

    updateKPIElement(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }

    updateCharts(data) {
        this.createRevenueChart(data.orders);
        this.createOrderStatusChart(data.orders);
        this.createCustomerGrowthChart(data.customers);
        this.createServicePopularityChart(data.orders);
    }

    createRevenueChart(orders) {
        const canvas = document.getElementById('revenue-chart');
        if (!canvas) return;

        // Grouper les commandes par jour
        const dailyRevenue = this.groupOrdersByDay(orders);
        
        // Simuler un graphique simple avec du texte (en l'absence de Chart.js)
        const container = canvas.parentElement;
        container.innerHTML = `
            <div class="chart-placeholder">
                <h4>Évolution du chiffre d'affaires</h4>
                <div class="chart-bars">
                    ${Object.entries(dailyRevenue).map(([date, revenue]) => `
                        <div class="chart-bar">
                            <div class="bar" style="height: ${Math.min(revenue / 10, 100)}px"></div>
                            <div class="bar-label">${date}</div>
                            <div class="bar-value">${revenue.toFixed(0)}€</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    createOrderStatusChart(orders) {
        const canvas = document.getElementById('order-status-chart');
        if (!canvas) return;

        const statusCounts = {
            pending: orders.filter(o => o.status === 'pending').length,
            in_progress: orders.filter(o => o.status === 'in_progress').length,
            ready: orders.filter(o => o.status === 'ready').length,
            delivered: orders.filter(o => o.status === 'delivered').length
        };

        const container = canvas.parentElement;
        container.innerHTML = `
            <div class="chart-placeholder">
                <h4>Répartition des commandes par statut</h4>
                <div class="status-chart">
                    ${Object.entries(statusCounts).map(([status, count]) => `
                        <div class="status-item">
                            <div class="status-color ${status}"></div>
                            <span class="status-label">${this.getStatusLabel(status)}</span>
                            <span class="status-count">${count}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    createCustomerGrowthChart(customers) {
        const canvas = document.getElementById('customer-growth-chart');
        if (!canvas) return;

        const monthlyGrowth = this.groupCustomersByMonth(customers);
        
        const container = canvas.parentElement;
        container.innerHTML = `
            <div class="chart-placeholder">
                <h4>Croissance de la clientèle</h4>
                <div class="growth-stats">
                    <div class="growth-item">
                        <span class="growth-label">Nouveaux clients ce mois</span>
                        <span class="growth-value">${customers.length}</span>
                    </div>
                    <div class="growth-item">
                        <span class="growth-label">Total clients</span>
                        <span class="growth-value">${this.data.customers.length}</span>
                    </div>
                </div>
            </div>
        `;
    }

    createServicePopularityChart(orders) {
        const canvas = document.getElementById('service-popularity-chart');
        if (!canvas) return;

        // Compter les services les plus populaires
        const serviceCounts = {};
        orders.forEach(order => {
            order.items.forEach(item => {
                serviceCounts[item.service] = (serviceCounts[item.service] || 0) + 1;
            });
        });

        const sortedServices = Object.entries(serviceCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5);

        const container = canvas.parentElement;
        container.innerHTML = `
            <div class="chart-placeholder">
                <h4>Services les plus demandés</h4>
                <div class="service-ranking">
                    ${sortedServices.map(([service, count], index) => `
                        <div class="service-item">
                            <span class="service-rank">${index + 1}</span>
                            <span class="service-name">${service}</span>
                            <span class="service-count">${count}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    updateTables(data) {
        this.updateTopCustomersTable(data.customers);
        this.updateRecentOrdersTable(data.orders);
    }

    updateTopCustomersTable(customers) {
        const table = document.getElementById('top-customers-table');
        if (!table) return;

        // Calculer les totaux par client
        const customerTotals = customers.map(customer => {
            const customerOrders = this.data.orders.filter(o => o.customerId === customer.id);
            const total = customerOrders.reduce((sum, order) => sum + parseFloat(order.total), 0);
            return { ...customer, total, orderCount: customerOrders.length };
        }).sort((a, b) => b.total - a.total).slice(0, 10);

        const tbody = table.querySelector('tbody');
        if (tbody) {
            tbody.innerHTML = customerTotals.map(customer => `
                <tr>
                    <td>${customer.firstName} ${customer.lastName}</td>
                    <td>${customer.email}</td>
                    <td>${customer.orderCount}</td>
                    <td>${customer.total.toFixed(2)}€</td>
                </tr>
            `).join('');
        }
    }

    updateRecentOrdersTable(orders) {
        const table = document.getElementById('recent-orders-table');
        if (!table) return;

        const recentOrders = orders
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 10);

        const tbody = table.querySelector('tbody');
        if (tbody) {
            tbody.innerHTML = recentOrders.map(order => `
                <tr>
                    <td>#${order.orderNumber}</td>
                    <td>${order.customerName}</td>
                    <td><span class="status-badge ${order.status}">${this.getStatusLabel(order.status)}</span></td>
                    <td>${order.total}€</td>
                    <td>${this.formatDate(order.createdAt)}</td>
                </tr>
            `).join('');
        }
    }

    // Méthodes utilitaires
    groupOrdersByDay(orders) {
        const grouped = {};
        orders.forEach(order => {
            const date = new Date(order.createdAt).toLocaleDateString('fr-FR');
            grouped[date] = (grouped[date] || 0) + parseFloat(order.total);
        });
        return grouped;
    }

    groupCustomersByMonth(customers) {
        const grouped = {};
        customers.forEach(customer => {
            const month = new Date(customer.createdAt).toLocaleDateString('fr-FR', { 
                year: 'numeric', 
                month: 'short' 
            });
            grouped[month] = (grouped[month] || 0) + 1;
        });
        return grouped;
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
        return new Date(dateString).toLocaleDateString('fr-FR');
    }

    // Export des données
    exportToPDF() {
        // Simuler l'export PDF
        this.showToast('Export PDF en cours...', 'info');
        setTimeout(() => {
            this.showToast('Rapport PDF généré avec succès', 'success');
        }, 2000);
    }

    exportToExcel() {
        // Simuler l'export Excel
        this.showToast('Export Excel en cours...', 'info');
        setTimeout(() => {
            this.showToast('Fichier Excel généré avec succès', 'success');
        }, 2000);
    }

    showToast(message, type = 'info') {
        if (window.showToast) {
            window.showToast(message, type);
        } else {
            console.log(`[${type.toUpperCase()}] ${message}`);
        }
    }

    // Méthodes pour générer des rapports spécifiques
    generateDailyReport() {
        const today = new Date().toISOString().split('T')[0];
        const todayData = this.filterDataByPeriod('day');
        
        return {
            date: today,
            revenue: todayData.orders.reduce((sum, order) => sum + parseFloat(order.total), 0),
            orders: todayData.orders.length,
            newCustomers: todayData.customers.length,
            completedOrders: todayData.orders.filter(o => o.status === 'delivered').length
        };
    }

    generateMonthlyReport() {
        const monthData = this.filterDataByPeriod('month');
        
        return {
            month: new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' }),
            revenue: monthData.orders.reduce((sum, order) => sum + parseFloat(order.total), 0),
            orders: monthData.orders.length,
            newCustomers: monthData.customers.length,
            averageOrderValue: monthData.orders.length > 0 ? 
                monthData.orders.reduce((sum, order) => sum + parseFloat(order.total), 0) / monthData.orders.length : 0
        };
    }
}

// Initialiser le gestionnaire d'analytics
const analyticsManager = new AnalyticsManager();
window.analyticsManager = analyticsManager;
