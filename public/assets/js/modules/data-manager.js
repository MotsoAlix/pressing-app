/**
 * Gestionnaire de données avec stockage local et synchronisation backend
 */
class DataManager {
    constructor() {
        this.storagePrefix = 'manohpressing_';
        this.apiBaseUrl = '/api';
        this.init();
    }

    init() {
        // Ne plus initialiser automatiquement les données par défaut
        // Laisser data-init.js s'en charger
    }

    initializeDefaultData() {
        // Données par défaut pour les sites
        if (!this.getLocal('sites')) {
            const defaultSites = [
                {
                    id: 1,
                    name: 'ManohPressing Centre',
                    address: '123 Rue de la Paix, Paris 75001',
                    phone: '01 23 45 67 89',
                    email: 'centre@manohpressing.com',
                    managerId: 2,
                    managerName: 'Jean Dupont',
                    status: 'active',
                    monthlyRevenue: 8450,
                    createdAt: '2025-01-01',
                    openingHours: {
                        monday: '8:00-18:00',
                        tuesday: '8:00-18:00',
                        wednesday: '8:00-18:00',
                        thursday: '8:00-18:00',
                        friday: '8:00-18:00',
                        saturday: '9:00-17:00',
                        sunday: 'Fermé'
                    }
                },
                {
                    id: 2,
                    name: 'ManohPressing Nord',
                    address: '456 Avenue du Nord, Lille 59000',
                    phone: '03 20 12 34 56',
                    email: 'nord@manohpressing.com',
                    managerId: 3,
                    managerName: 'Marie Martin',
                    status: 'active',
                    monthlyRevenue: 6230,
                    createdAt: '2025-02-01',
                    openingHours: {
                        monday: '8:00-18:00',
                        tuesday: '8:00-18:00',
                        wednesday: '8:00-18:00',
                        thursday: '8:00-18:00',
                        friday: '8:00-18:00',
                        saturday: '9:00-17:00',
                        sunday: 'Fermé'
                    }
                },
                {
                    id: 3,
                    name: 'ManohPressing Sud',
                    address: '789 Boulevard du Midi, Marseille 13001',
                    phone: '04 91 23 45 67',
                    email: 'sud@manohpressing.com',
                    managerId: 4,
                    managerName: 'Pierre Durand',
                    status: 'active',
                    monthlyRevenue: 7890,
                    createdAt: '2025-03-01',
                    openingHours: {
                        monday: '8:00-18:00',
                        tuesday: '8:00-18:00',
                        wednesday: '8:00-18:00',
                        thursday: '8:00-18:00',
                        friday: '8:00-18:00',
                        saturday: '9:00-17:00',
                        sunday: 'Fermé'
                    }
                }
            ];
            this.setLocal('sites', defaultSites);
        }

        // Données par défaut pour les utilisateurs
        if (!this.getLocal('users')) {
            const defaultUsers = [
                {
                    id: 1,
                    username: 'admin',
                    email: 'admin@manohpressing.com',
                    firstName: 'Admin',
                    lastName: 'System',
                    role: 'admin',
                    phone: '01 23 45 67 89',
                    createdAt: '2025-01-01',
                    lastLogin: new Date().toISOString(),
                    isActive: true
                },
                {
                    id: 2,
                    username: 'manager1',
                    email: 'jean.dupont@manohpressing.com',
                    firstName: 'Jean',
                    lastName: 'Dupont',
                    role: 'manager',
                    phone: '06 12 34 56 78',
                    siteId: 1,
                    createdAt: '2025-01-15',
                    lastLogin: new Date().toISOString(),
                    isActive: true
                },
                {
                    id: 3,
                    username: 'manager2',
                    email: 'marie.martin@manohpressing.com',
                    firstName: 'Marie',
                    lastName: 'Martin',
                    role: 'manager',
                    phone: '06 23 45 67 89',
                    siteId: 2,
                    createdAt: '2025-02-01',
                    lastLogin: new Date().toISOString(),
                    isActive: true
                },
                {
                    id: 4,
                    username: 'client1',
                    email: 'pierre.martin@email.com',
                    firstName: 'Pierre',
                    lastName: 'Martin',
                    role: 'client',
                    phone: '06 34 56 78 90',
                    address: '12 Rue des Clients, Paris 75002',
                    loyaltyPoints: 125,
                    totalSpent: 425.50,
                    createdAt: '2025-03-01',
                    lastLogin: new Date().toISOString(),
                    isActive: true
                },
                {
                    id: 5,
                    username: 'client2',
                    email: 'sophie.dubois@email.com',
                    firstName: 'Sophie',
                    lastName: 'Dubois',
                    role: 'client',
                    phone: '06 45 67 89 01',
                    address: '34 Avenue des Clients, Paris 75003',
                    loyaltyPoints: 89,
                    totalSpent: 267.30,
                    createdAt: '2025-03-15',
                    lastLogin: new Date().toISOString(),
                    isActive: true
                }
            ];
            this.setLocal('users', defaultUsers);
        }

        // Données par défaut pour les commandes
        if (!this.getLocal('orders')) {
            const defaultOrders = [
                {
                    id: 1,
                    orderNumber: 'CMD-001',
                    customerId: 4,
                    customerName: 'Pierre Martin',
                    siteId: 1,
                    status: 'pending',
                    items: [
                        { name: 'Chemise blanche', service: 'Nettoyage à sec', price: 15.00, quantity: 1 },
                        { name: 'Pantalon costume', service: 'Nettoyage à sec', price: 12.00, quantity: 1 }
                    ],
                    total: 27.00,
                    createdAt: '2025-08-05T10:30:00',
                    expectedDate: '2025-08-07',
                    notes: 'Attention aux boutons de la chemise',
                    trackingCode: 'TR000001'
                },
                {
                    id: 2,
                    orderNumber: 'CMD-002',
                    customerId: 5,
                    customerName: 'Sophie Dubois',
                    siteId: 1,
                    status: 'in_progress',
                    items: [
                        { name: 'Robe de soirée', service: 'Nettoyage à sec délicat', price: 45.00, quantity: 1 }
                    ],
                    total: 45.00,
                    createdAt: '2025-08-04T14:15:00',
                    expectedDate: '2025-08-06',
                    notes: 'Tissu délicat - attention particulière',
                    trackingCode: 'TR000002'
                },
                {
                    id: 3,
                    orderNumber: 'CMD-003',
                    customerId: 4,
                    customerName: 'Pierre Martin',
                    siteId: 1,
                    status: 'ready',
                    items: [
                        { name: 'Veste costume', service: 'Nettoyage à sec', price: 25.00, quantity: 1 },
                        { name: 'Cravate', service: 'Nettoyage', price: 8.00, quantity: 2 }
                    ],
                    total: 41.00,
                    createdAt: '2025-08-03T09:20:00',
                    expectedDate: '2025-08-05',
                    completedAt: '2025-08-05T16:30:00',
                    notes: '',
                    trackingCode: 'TR000003'
                },
                {
                    id: 4,
                    orderNumber: 'CMD-004',
                    customerId: 5,
                    customerName: 'Sophie Dubois',
                    siteId: 1,
                    status: 'delivered',
                    items: [
                        { name: 'Manteau hiver', service: 'Nettoyage à sec', price: 35.00, quantity: 1 }
                    ],
                    total: 35.00,
                    createdAt: '2025-08-01T11:45:00',
                    expectedDate: '2025-08-03',
                    completedAt: '2025-08-03T15:20:00',
                    deliveredAt: '2025-08-03T17:10:00',
                    notes: '',
                    trackingCode: 'TR000004'
                }
            ];
            this.setLocal('orders', defaultOrders);
        }

        // Données par défaut pour les services
        if (!this.getLocal('services')) {
            const defaultServices = [
                {
                    id: 1,
                    name: 'Nettoyage à sec',
                    description: 'Nettoyage professionnel à sec pour tous types de vêtements',
                    basePrice: 15.00,
                    category: 'nettoyage',
                    duration: 24, // heures
                    isActive: true
                },
                {
                    id: 2,
                    name: 'Lavage classique',
                    description: 'Lavage traditionnel à l\'eau pour vêtements résistants',
                    basePrice: 8.00,
                    category: 'lavage',
                    duration: 12,
                    isActive: true
                },
                {
                    id: 3,
                    name: 'Repassage',
                    description: 'Repassage professionnel pour un rendu impeccable',
                    basePrice: 5.00,
                    category: 'finition',
                    duration: 2,
                    isActive: true
                },
                {
                    id: 4,
                    name: 'Détachage',
                    description: 'Traitement spécialisé pour éliminer les taches tenaces',
                    basePrice: 12.00,
                    category: 'traitement',
                    duration: 6,
                    isActive: true
                },
                {
                    id: 5,
                    name: 'Nettoyage délicat',
                    description: 'Traitement spécial pour tissus délicats et précieux',
                    basePrice: 25.00,
                    category: 'nettoyage',
                    duration: 48,
                    isActive: true
                }
            ];
            this.setLocal('services', defaultServices);
        }

        // Données par défaut pour les stocks
        if (!this.getLocal('stock')) {
            const defaultStock = [
                {
                    id: 1,
                    name: 'Détergent Premium',
                    description: 'Détergent haute qualité pour nettoyage à sec',
                    category: 'Produits chimiques',
                    quantity: 25,
                    minQuantity: 10,
                    unitPrice: 15.50,
                    unit: 'litre',
                    supplier: 'ChemClean Pro',
                    expiryDate: '2025-12-31',
                    createdAt: '2025-01-01',
                    lastUpdated: new Date().toISOString()
                },
                {
                    id: 2,
                    name: 'Détachant Universel',
                    description: 'Détachant efficace pour toutes les taches',
                    category: 'Produits chimiques',
                    quantity: 8,
                    minQuantity: 15,
                    unitPrice: 22.00,
                    unit: 'litre',
                    supplier: 'StainAway Ltd',
                    expiryDate: '2025-11-30',
                    createdAt: '2025-01-01',
                    lastUpdated: new Date().toISOString()
                },
                {
                    id: 3,
                    name: 'Cintres Plastique',
                    description: 'Cintres en plastique résistant',
                    category: 'Accessoires',
                    quantity: 150,
                    minQuantity: 50,
                    unitPrice: 0.75,
                    unit: 'pièce',
                    supplier: 'HangerCorp',
                    expiryDate: null,
                    createdAt: '2025-01-01',
                    lastUpdated: new Date().toISOString()
                }
            ];
            this.setLocal('stock', defaultStock);
        }
    }

    // Méthodes de stockage local
    setLocal(key, data) {
        try {
            localStorage.setItem(this.storagePrefix + key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Erreur lors de la sauvegarde locale:', error);
            return false;
        }
    }

    getLocal(key) {
        try {
            const data = localStorage.getItem(this.storagePrefix + key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Erreur lors de la lecture locale:', error);
            return null;
        }
    }

    removeLocal(key) {
        try {
            localStorage.removeItem(this.storagePrefix + key);
            return true;
        } catch (error) {
            console.error('Erreur lors de la suppression locale:', error);
            return false;
        }
    }

    // Méthodes CRUD génériques
    async create(entity, data) {
        try {
            const items = this.getLocal(entity) || [];
            const newId = Math.max(...items.map(item => item.id || 0), 0) + 1;
            
            const newItem = {
                ...data,
                id: newId,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            items.push(newItem);
            this.setLocal(entity, items);

            return { success: true, data: newItem };
        } catch (error) {
            console.error(`Erreur lors de la création de ${entity}:`, error);
            return { success: false, error: error.message };
        }
    }

    async read(entity, id = null) {
        try {
            const items = this.getLocal(entity) || [];
            
            if (id) {
                const item = items.find(item => item.id === parseInt(id));
                return { success: true, data: item || null };
            }

            return { success: true, data: items };
        } catch (error) {
            console.error(`Erreur lors de la lecture de ${entity}:`, error);
            return { success: false, error: error.message };
        }
    }

    async update(entity, id, data) {
        try {
            const items = this.getLocal(entity) || [];
            const index = items.findIndex(item => item.id === parseInt(id));
            
            if (index === -1) {
                return { success: false, error: 'Élément non trouvé' };
            }

            items[index] = {
                ...items[index],
                ...data,
                updatedAt: new Date().toISOString()
            };

            this.setLocal(entity, items);
            return { success: true, data: items[index] };
        } catch (error) {
            console.error(`Erreur lors de la mise à jour de ${entity}:`, error);
            return { success: false, error: error.message };
        }
    }

    async delete(entity, id) {
        try {
            const items = this.getLocal(entity) || [];
            const filteredItems = items.filter(item => item.id !== parseInt(id));
            
            if (filteredItems.length === items.length) {
                return { success: false, error: 'Élément non trouvé' };
            }

            this.setLocal(entity, filteredItems);
            return { success: true };
        } catch (error) {
            console.error(`Erreur lors de la suppression de ${entity}:`, error);
            return { success: false, error: error.message };
        }
    }

    // Méthodes spécialisées
    async getOrdersByStatus(status) {
        const result = await this.read('orders');
        if (result.success) {
            const filteredOrders = result.data.filter(order => order.status === status);
            return { success: true, data: filteredOrders };
        }
        return result;
    }

    async getOrdersByCustomer(customerId) {
        const result = await this.read('orders');
        if (result.success) {
            const filteredOrders = result.data.filter(order => order.customerId === parseInt(customerId));
            return { success: true, data: filteredOrders };
        }
        return result;
    }

    async getUserByRole(role) {
        const result = await this.read('users');
        if (result.success) {
            const filteredUsers = result.data.filter(user => user.role === role);
            return { success: true, data: filteredUsers };
        }
        return result;
    }

    async getLowStockItems() {
        const result = await this.read('stock');
        if (result.success) {
            const lowStockItems = result.data.filter(item => item.quantity <= item.minQuantity);
            return { success: true, data: lowStockItems };
        }
        return result;
    }

    async updateOrderStatus(orderId, newStatus) {
        const updateData = { status: newStatus };
        
        if (newStatus === 'ready') {
            updateData.completedAt = new Date().toISOString();
        } else if (newStatus === 'delivered') {
            updateData.deliveredAt = new Date().toISOString();
        }

        return await this.update('orders', orderId, updateData);
    }

    // Méthodes de recherche
    async search(entity, query, fields = []) {
        try {
            const result = await this.read(entity);
            if (!result.success) return result;

            const items = result.data;
            const searchQuery = query.toLowerCase();

            const filteredItems = items.filter(item => {
                if (fields.length === 0) {
                    // Recherche dans tous les champs string
                    return Object.values(item).some(value => 
                        typeof value === 'string' && value.toLowerCase().includes(searchQuery)
                    );
                } else {
                    // Recherche dans les champs spécifiés
                    return fields.some(field => {
                        const value = item[field];
                        return typeof value === 'string' && value.toLowerCase().includes(searchQuery);
                    });
                }
            });

            return { success: true, data: filteredItems };
        } catch (error) {
            console.error(`Erreur lors de la recherche dans ${entity}:`, error);
            return { success: false, error: error.message };
        }
    }

    // Méthodes de statistiques
    async getStatistics() {
        try {
            const [ordersResult, usersResult, sitesResult] = await Promise.all([
                this.read('orders'),
                this.read('users'),
                this.read('sites')
            ]);

            if (!ordersResult.success || !usersResult.success || !sitesResult.success) {
                throw new Error('Erreur lors de la récupération des données');
            }

            const orders = ordersResult.data;
            const users = usersResult.data;
            const sites = sitesResult.data;

            const today = new Date().toISOString().split('T')[0];
            const thisMonth = new Date().toISOString().substring(0, 7);

            const stats = {
                orders: {
                    total: orders.length,
                    pending: orders.filter(o => o.status === 'pending').length,
                    inProgress: orders.filter(o => o.status === 'in_progress').length,
                    ready: orders.filter(o => o.status === 'ready').length,
                    delivered: orders.filter(o => o.status === 'delivered').length,
                    today: orders.filter(o => o.createdAt.startsWith(today)).length,
                    thisMonth: orders.filter(o => o.createdAt.startsWith(thisMonth)).length
                },
                revenue: {
                    total: orders.reduce((sum, order) => sum + order.total, 0),
                    today: orders.filter(o => o.createdAt.startsWith(today)).reduce((sum, order) => sum + order.total, 0),
                    thisMonth: orders.filter(o => o.createdAt.startsWith(thisMonth)).reduce((sum, order) => sum + order.total, 0)
                },
                users: {
                    total: users.length,
                    admins: users.filter(u => u.role === 'admin').length,
                    managers: users.filter(u => u.role === 'manager').length,
                    clients: users.filter(u => u.role === 'client').length,
                    active: users.filter(u => u.isActive).length
                },
                sites: {
                    total: sites.length,
                    active: sites.filter(s => s.status === 'active').length,
                    totalRevenue: sites.reduce((sum, site) => sum + site.monthlyRevenue, 0)
                }
            };

            return { success: true, data: stats };
        } catch (error) {
            console.error('Erreur lors du calcul des statistiques:', error);
            return { success: false, error: error.message };
        }
    }

    // Méthode de synchronisation avec le backend (simulée)
    async syncWithBackend() {
        try {
            console.log('Synchronisation avec le backend...');
            // Ici on pourrait implémenter la vraie synchronisation
            return { success: true, message: 'Synchronisation réussie' };
        } catch (error) {
            console.error('Erreur lors de la synchronisation:', error);
            return { success: false, error: error.message };
        }
    }

    // Méthode d'export des données
    exportData(entity = null) {
        try {
            const data = {};
            
            if (entity) {
                data[entity] = this.getLocal(entity);
            } else {
                const entities = ['sites', 'users', 'orders', 'services', 'stock'];
                entities.forEach(ent => {
                    data[ent] = this.getLocal(ent);
                });
            }

            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `manohpressing_data_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            return { success: true, message: 'Export réussi' };
        } catch (error) {
            console.error('Erreur lors de l\'export:', error);
            return { success: false, error: error.message };
        }
    }

    // Méthode de réinitialisation des données
    resetData() {
        try {
            const entities = ['sites', 'users', 'orders', 'services', 'stock'];
            entities.forEach(entity => {
                this.removeLocal(entity);
            });
            
            this.initializeDefaultData();
            return { success: true, message: 'Données réinitialisées' };
        } catch (error) {
            console.error('Erreur lors de la réinitialisation:', error);
            return { success: false, error: error.message };
        }
    }
}

// Initialiser le gestionnaire de données global
const dataManager = new DataManager();
window.dataManager = dataManager;
