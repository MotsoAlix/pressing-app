/**
 * Module d'optimisation des performances
 * Gère le cache, le lazy loading et l'optimisation des données
 */

class PerformanceOptimizer {
    constructor() {
        this.cache = new Map();
        this.cacheExpiry = new Map();
        this.defaultCacheDuration = 5 * 60 * 1000; // 5 minutes
        this.observers = new Map();
        this.loadingStates = new Map();
        
        this.initLazyLoading();
        this.initImageOptimization();
    }

    /**
     * Cache des données avec expiration
     */
    setCache(key, data, duration = this.defaultCacheDuration) {
        this.cache.set(key, data);
        this.cacheExpiry.set(key, Date.now() + duration);
    }

    getCache(key) {
        if (!this.cache.has(key)) return null;
        
        const expiry = this.cacheExpiry.get(key);
        if (Date.now() > expiry) {
            this.cache.delete(key);
            this.cacheExpiry.delete(key);
            return null;
        }
        
        return this.cache.get(key);
    }

    clearCache(pattern = null) {
        if (pattern) {
            for (const key of this.cache.keys()) {
                if (key.includes(pattern)) {
                    this.cache.delete(key);
                    this.cacheExpiry.delete(key);
                }
            }
        } else {
            this.cache.clear();
            this.cacheExpiry.clear();
        }
    }

    /**
     * Chargement optimisé des données
     */
    async loadData(key, loader, useCache = true) {
        // Vérifier le cache d'abord
        if (useCache) {
            const cached = this.getCache(key);
            if (cached) {
                return cached;
            }
        }

        // Éviter les chargements multiples simultanés
        if (this.loadingStates.has(key)) {
            return this.loadingStates.get(key);
        }

        // Charger les données
        const loadingPromise = this.executeLoader(loader);
        this.loadingStates.set(key, loadingPromise);

        try {
            const data = await loadingPromise;
            
            // Mettre en cache
            if (useCache && data) {
                this.setCache(key, data);
            }
            
            return data;
        } finally {
            this.loadingStates.delete(key);
        }
    }

    async executeLoader(loader) {
        if (typeof loader === 'function') {
            return await loader();
        } else if (typeof loader === 'string') {
            // Charger depuis localStorage
            return JSON.parse(localStorage.getItem(loader) || '[]');
        }
        return loader;
    }

    /**
     * Lazy loading pour les sections
     */
    initLazyLoading() {
        if ('IntersectionObserver' in window) {
            this.intersectionObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.loadLazySection(entry.target);
                    }
                });
            }, {
                rootMargin: '50px'
            });
        }
    }

    observeLazySection(element, loader) {
        if (this.intersectionObserver) {
            element.dataset.lazyLoader = loader;
            this.intersectionObserver.observe(element);
        } else {
            // Fallback pour les navigateurs sans IntersectionObserver
            this.loadLazySection(element);
        }
    }

    async loadLazySection(element) {
        if (element.dataset.loaded === 'true') return;
        
        const loader = element.dataset.lazyLoader;
        if (!loader) return;

        try {
            element.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> Chargement...</div>';
            
            // Simuler un délai pour éviter les flashs
            await new Promise(resolve => setTimeout(resolve, 100));
            
            const data = await this.loadData(loader, () => this.executeCustomLoader(loader));
            this.renderLazyContent(element, data, loader);
            
            element.dataset.loaded = 'true';
            
            if (this.intersectionObserver) {
                this.intersectionObserver.unobserve(element);
            }
        } catch (error) {
            console.error('Erreur lors du chargement lazy:', error);
            element.innerHTML = '<div class="error-message">Erreur de chargement</div>';
        }
    }

    async executeCustomLoader(loader) {
        // Loaders personnalisés pour différents types de données
        switch (loader) {
            case 'recent-orders':
                return this.loadRecentOrders();
            case 'statistics':
                return this.loadStatistics();
            case 'notifications':
                return this.loadNotifications();
            default:
                return JSON.parse(localStorage.getItem(loader) || '[]');
        }
    }

    async loadRecentOrders() {
        const orders = JSON.parse(localStorage.getItem('manohpressing_orders') || '[]');
        return orders
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 10);
    }

    async loadStatistics() {
        const orders = JSON.parse(localStorage.getItem('manohpressing_orders') || '[]');
        const users = JSON.parse(localStorage.getItem('manohpressing_users') || '[]');
        
        return {
            totalOrders: orders.length,
            totalClients: users.filter(u => u.role === 'client').length,
            totalRevenue: orders.reduce((sum, order) => sum + (order.total || 0), 0),
            pendingOrders: orders.filter(o => o.status === 'pending').length
        };
    }

    async loadNotifications() {
        const notifications = JSON.parse(localStorage.getItem('manohpressing_notifications') || '[]');
        return notifications
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5);
    }

    renderLazyContent(element, data, loader) {
        switch (loader) {
            case 'recent-orders':
                this.renderRecentOrders(element, data);
                break;
            case 'statistics':
                this.renderStatistics(element, data);
                break;
            case 'notifications':
                this.renderNotifications(element, data);
                break;
            default:
                element.innerHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
        }
    }

    renderRecentOrders(element, orders) {
        if (orders.length === 0) {
            element.innerHTML = '<p class="empty-state">Aucune commande récente</p>';
            return;
        }

        element.innerHTML = orders.map(order => `
            <div class="order-item">
                <div class="order-info">
                    <strong>${order.orderNumber}</strong>
                    <span class="order-customer">${order.customerName}</span>
                </div>
                <div class="order-status">
                    <span class="status-badge ${order.status}">${this.getStatusText(order.status)}</span>
                </div>
            </div>
        `).join('');
    }

    renderStatistics(element, stats) {
        element.innerHTML = `
            <div class="stats-grid">
                <div class="stat-item">
                    <div class="stat-value">${stats.totalOrders}</div>
                    <div class="stat-label">Commandes</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${stats.totalClients}</div>
                    <div class="stat-label">Clients</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${stats.totalRevenue.toLocaleString()} FCFA</div>
                    <div class="stat-label">Chiffre d'affaires</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${stats.pendingOrders}</div>
                    <div class="stat-label">En attente</div>
                </div>
            </div>
        `;
    }

    renderNotifications(element, notifications) {
        if (notifications.length === 0) {
            element.innerHTML = '<p class="empty-state">Aucune notification</p>';
            return;
        }

        element.innerHTML = notifications.map(notif => `
            <div class="notification-item ${notif.isRead ? 'read' : 'unread'}">
                <div class="notification-content">
                    <strong>${notif.title}</strong>
                    <p>${notif.message}</p>
                </div>
                <div class="notification-time">
                    ${this.formatTime(notif.createdAt)}
                </div>
            </div>
        `).join('');
    }

    /**
     * Optimisation des images
     */
    initImageOptimization() {
        // Observer pour les images lazy
        if ('IntersectionObserver' in window) {
            this.imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.loadLazyImage(entry.target);
                    }
                });
            });
        }
    }

    observeLazyImage(img) {
        if (this.imageObserver) {
            this.imageObserver.observe(img);
        } else {
            this.loadLazyImage(img);
        }
    }

    loadLazyImage(img) {
        if (img.dataset.src) {
            img.src = img.dataset.src;
            img.classList.remove('lazy');
            img.classList.add('loaded');
            
            if (this.imageObserver) {
                this.imageObserver.unobserve(img);
            }
        }
    }

    /**
     * Debouncing pour les recherches
     */
    debounce(func, wait) {
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

    /**
     * Throttling pour les événements fréquents
     */
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    /**
     * Utilitaires
     */
    getStatusText(status) {
        const statusMap = {
            'pending': 'En attente',
            'processing': 'En cours',
            'ready': 'Prêt',
            'completed': 'Terminé',
            'cancelled': 'Annulé'
        };
        return statusMap[status] || status;
    }

    formatTime(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = (now - date) / (1000 * 60 * 60);

        if (diffInHours < 1) {
            const minutes = Math.floor((now - date) / (1000 * 60));
            return minutes === 0 ? 'À l\'instant' : `Il y a ${minutes} min`;
        } else if (diffInHours < 24) {
            return `Il y a ${Math.floor(diffInHours)}h`;
        } else {
            return date.toLocaleDateString('fr-FR');
        }
    }

    /**
     * Préchargement des données critiques
     */
    async preloadCriticalData() {
        const criticalKeys = [
            'manohpressing_orders',
            'manohpressing_users',
            'manohpressing_sites'
        ];

        const promises = criticalKeys.map(key => 
            this.loadData(key, key, true)
        );

        try {
            await Promise.all(promises);
            console.log('✅ Données critiques préchargées');
        } catch (error) {
            console.error('❌ Erreur lors du préchargement:', error);
        }
    }
}

// Instance globale
window.performanceOptimizer = new PerformanceOptimizer();

// Précharger les données critiques au démarrage
document.addEventListener('DOMContentLoaded', () => {
    window.performanceOptimizer.preloadCriticalData();
});
