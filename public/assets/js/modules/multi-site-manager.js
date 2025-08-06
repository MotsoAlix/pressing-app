/**
 * Gestionnaire multi-sites pour l'évolutivité
 */

class MultiSiteManager {
    constructor() {
        this.sites = [];
        this.currentSite = null;
        this.currentUser = null;
        this.init();
    }

    init() {
        this.loadCurrentUser();
        this.loadSites();
        this.setCurrentSite();
    }

    loadCurrentUser() {
        const userData = localStorage.getItem('user');
        if (userData) {
            this.currentUser = JSON.parse(userData);
        }
    }

    loadSites() {
        const sitesData = localStorage.getItem('manohpressing_sites');
        if (sitesData) {
            this.sites = JSON.parse(sitesData);
        }
    }

    setCurrentSite() {
        if (!this.currentUser) return;

        switch (this.currentUser.role) {
            case 'admin':
                // Admin peut voir tous les sites
                this.currentSite = null; // null = tous les sites
                break;
            
            case 'manager':
                // Gérant est lié à un site spécifique
                this.currentSite = this.sites.find(site => site.id === this.currentUser.siteId);
                if (!this.currentSite) {
                    console.error('Site non trouvé pour le gérant:', this.currentUser.siteId);
                }
                break;
            
            case 'client':
                // Client peut être lié à un site (optionnel)
                if (this.currentUser.preferredSiteId) {
                    this.currentSite = this.sites.find(site => site.id === this.currentUser.preferredSiteId);
                }
                break;
        }
    }

    // Filtrage des données par site
    filterDataBySite(data, dataType) {
        if (!this.currentUser) return [];

        switch (this.currentUser.role) {
            case 'admin':
                return data; // Admin voit tout

            case 'manager':
                return this.filterManagerData(data, dataType);

            case 'client':
                return this.filterClientData(data, dataType);

            default:
                return [];
        }
    }

    filterManagerData(data, dataType) {
        const siteId = this.currentUser.siteId;
        if (!siteId) return [];

        switch (dataType) {
            case 'orders':
                // Commandes du site du gérant
                return data.filter(order => order.managerId === this.currentUser.id);

            case 'customers':
                // Clients qui ont des commandes dans ce site
                const siteOrders = data.filter(order => order.managerId === this.currentUser.id);
                const customerIds = [...new Set(siteOrders.map(order => order.customerId))];
                return data.filter(customer => customerIds.includes(customer.id));

            case 'stock':
                // Stock du site
                return data.filter(item => item.siteId === siteId);

            case 'managers':
                // Seulement le gérant actuel
                return data.filter(manager => manager.id === this.currentUser.id);

            default:
                return data;
        }
    }

    filterClientData(data, dataType) {
        const clientId = this.currentUser.id;

        switch (dataType) {
            case 'orders':
                // Seulement les commandes du client
                return data.filter(order => order.customerId === clientId);

            case 'notifications':
                // Seulement les notifications du client
                return data.filter(notification => notification.userId === clientId);

            case 'messages':
                // Messages où le client est impliqué
                return data.filter(message => 
                    message.senderId === clientId || message.receiverId === clientId
                );

            default:
                return [];
        }
    }

    // Gestion des sites
    async createSite(siteData) {
        if (!this.hasPermission('create', 'sites')) {
            throw new Error('Permission insuffisante pour créer un site');
        }

        const newSite = {
            id: Date.now(),
            ...siteData,
            createdAt: new Date().toISOString(),
            createdBy: this.currentUser.id,
            status: 'active',
            orders: 0,
            monthlyRevenue: 0
        };

        this.sites.push(newSite);
        this.saveSites();

        return newSite;
    }

    async updateSite(siteId, updateData) {
        if (!this.hasPermission('update', 'sites')) {
            throw new Error('Permission insuffisante pour modifier un site');
        }

        const siteIndex = this.sites.findIndex(site => site.id === siteId);
        if (siteIndex === -1) {
            throw new Error('Site non trouvé');
        }

        this.sites[siteIndex] = {
            ...this.sites[siteIndex],
            ...updateData,
            updatedAt: new Date().toISOString(),
            updatedBy: this.currentUser.id
        };

        this.saveSites();
        return this.sites[siteIndex];
    }

    async deleteSite(siteId) {
        if (!this.hasPermission('delete', 'sites')) {
            throw new Error('Permission insuffisante pour supprimer un site');
        }

        // Vérifier qu'il n'y a pas de gérants ou commandes actives
        const managers = JSON.parse(localStorage.getItem('manohpressing_managers') || '[]');
        const activeManagers = managers.filter(manager => manager.siteId === siteId && manager.isActive);
        
        if (activeManagers.length > 0) {
            throw new Error('Impossible de supprimer un site avec des gérants actifs');
        }

        const orders = JSON.parse(localStorage.getItem('manohpressing_orders') || '[]');
        const activeOrders = orders.filter(order => {
            const manager = managers.find(m => m.id === order.managerId);
            return manager && manager.siteId === siteId && order.status !== 'delivered';
        });

        if (activeOrders.length > 0) {
            throw new Error('Impossible de supprimer un site avec des commandes en cours');
        }

        this.sites = this.sites.filter(site => site.id !== siteId);
        this.saveSites();
    }

    // Assignation de gérants aux sites
    async assignManagerToSite(managerId, siteId) {
        if (!this.hasPermission('manage', 'sites')) {
            throw new Error('Permission insuffisante');
        }

        const managers = JSON.parse(localStorage.getItem('manohpressing_managers') || '[]');
        const users = JSON.parse(localStorage.getItem('manohpressing_users') || '[]');

        // Mettre à jour le gérant
        const managerIndex = managers.findIndex(m => m.id === managerId);
        if (managerIndex !== -1) {
            managers[managerIndex].siteId = siteId;
            localStorage.setItem('manohpressing_managers', JSON.stringify(managers));
        }

        // Mettre à jour l'utilisateur
        const userIndex = users.findIndex(u => u.id === managerId);
        if (userIndex !== -1) {
            users[userIndex].siteId = siteId;
            localStorage.setItem('manohpressing_users', JSON.stringify(users));
        }

        // Mettre à jour le site
        const site = this.sites.find(s => s.id === siteId);
        if (site) {
            const manager = managers[managerIndex];
            site.manager = `${manager.firstName} ${manager.lastName}`;
            site.managerId = managerId;
            this.saveSites();
        }
    }

    // Statistiques par site
    getSiteStatistics(siteId = null) {
        const targetSites = siteId ? [this.sites.find(s => s.id === siteId)] : this.sites;
        const orders = JSON.parse(localStorage.getItem('manohpressing_orders') || '[]');
        const managers = JSON.parse(localStorage.getItem('manohpressing_managers') || '[]');

        return targetSites.map(site => {
            const siteManagers = managers.filter(m => m.siteId === site.id);
            const siteOrders = orders.filter(order => {
                const manager = managers.find(m => m.id === order.managerId);
                return manager && manager.siteId === site.id;
            });

            const thisMonth = new Date();
            thisMonth.setDate(1);
            const monthlyOrders = siteOrders.filter(order => 
                new Date(order.createdAt) >= thisMonth
            );

            return {
                siteId: site.id,
                siteName: site.name,
                totalOrders: siteOrders.length,
                monthlyOrders: monthlyOrders.length,
                monthlyRevenue: monthlyOrders.reduce((sum, order) => sum + order.total, 0),
                activeManagers: siteManagers.filter(m => m.isActive).length,
                pendingOrders: siteOrders.filter(o => o.status === 'pending').length,
                completedOrders: siteOrders.filter(o => o.status === 'delivered').length
            };
        });
    }

    // Utilitaires
    hasPermission(action, resource) {
        if (window.securityManager) {
            return window.securityManager.hasPermission(action, resource);
        }
        
        // Fallback simple
        return this.currentUser && this.currentUser.role === 'admin';
    }

    saveSites() {
        localStorage.setItem('manohpressing_sites', JSON.stringify(this.sites));
    }

    getCurrentSite() {
        return this.currentSite;
    }

    getAllSites() {
        return this.currentUser && this.currentUser.role === 'admin' ? this.sites : [this.currentSite].filter(Boolean);
    }

    getSiteById(siteId) {
        return this.sites.find(site => site.id === siteId);
    }

    // Validation de cohérence des données
    validateDataConsistency() {
        const issues = [];
        const managers = JSON.parse(localStorage.getItem('manohpressing_managers') || '[]');
        const orders = JSON.parse(localStorage.getItem('manohpressing_orders') || '[]');

        // Vérifier que tous les gérants ont un site valide
        managers.forEach(manager => {
            if (manager.siteId && !this.sites.find(s => s.id === manager.siteId)) {
                issues.push(`Gérant ${manager.firstName} ${manager.lastName} assigné à un site inexistant (${manager.siteId})`);
            }
        });

        // Vérifier que toutes les commandes ont un gérant valide
        orders.forEach(order => {
            const manager = managers.find(m => m.id === order.managerId);
            if (!manager) {
                issues.push(`Commande ${order.orderNumber} assignée à un gérant inexistant (${order.managerId})`);
            }
        });

        return issues;
    }
}

// Instance globale
window.multiSiteManager = new MultiSiteManager();
