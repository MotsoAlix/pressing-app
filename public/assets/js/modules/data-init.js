/**
 * Module d'initialisation des données par défaut
 */

class DataInitializer {
    constructor() {
        this.initialized = false;
    }

    init() {
        if (this.initialized) return;
        
        this.initializeUsers();
        this.initializeOrders();
        this.initializeStock();
        this.initializeSites();
        this.initializeManagers();
        
        this.initialized = true;
        console.log('✅ Données par défaut initialisées');
    }

    initializeUsers() {
        const existingUsers = JSON.parse(localStorage.getItem('manohpressing_users') || '[]');
        
        if (existingUsers.length === 0) {
            const defaultUsers = [
                // Administrateur
                {
                    id: 1,
                    username: 'admin',
                    password: 'admin123',
                    role: 'admin',
                    firstName: 'Administrateur',
                    lastName: 'Système',
                    email: 'admin@manohpressing.com',
                    phone: '+33 1 XX XX XX XX',
                    isActive: true,
                    createdAt: new Date().toISOString()
                },
                // Gérant par défaut
                {
                    id: 2,
                    username: 'manager1',
                    password: 'manager123',
                    role: 'manager',
                    firstName: 'Jean',
                    lastName: 'Dupont',
                    email: 'jean.dupont@manohpressing.com',
                    phone: '06 12 34 56 78',
                    siteId: 1,
                    isActive: true,
                    createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString()
                },
                // Clients par défaut
                {
                    id: 3,
                    username: 'client1',
                    password: 'client123',
                    role: 'client',
                    firstName: 'Marie',
                    lastName: 'Martin',
                    email: 'marie.martin@gmail.com',
                    phone: '06 12 34 56 78',
                    address: '123 Rue de la Paix, Paris',
                    loyaltyPoints: 150,
                    totalSpent: 450,
                    isActive: true,
                    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
                },
                {
                    id: 4,
                    username: 'client2',
                    password: 'client123',
                    role: 'client',
                    firstName: 'Pierre',
                    lastName: 'Durand',
                    email: 'pierre.durand@yahoo.fr',
                    phone: '06 98 76 54 32',
                    address: '456 Avenue des Champs, Lyon',
                    loyaltyPoints: 89,
                    totalSpent: 285,
                    isActive: true,
                    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString()
                }
            ];

            localStorage.setItem('manohpressing_users', JSON.stringify(defaultUsers));
        }
    }

    initializeOrders() {
        const existingOrders = JSON.parse(localStorage.getItem('manohpressing_orders') || '[]');
        
        if (existingOrders.length === 0) {
            const defaultOrders = [
                {
                    id: 1,
                    orderNumber: 'CMD-001',
                    customerId: 3,
                    customerName: 'Marie Martin',
                    managerId: 2,
                    services: [
                        { name: 'Nettoyage à sec costume', quantity: 1, price: 35 },
                        { name: 'Lavage chemise', quantity: 2, price: 15 }
                    ],
                    total: 65,
                    status: 'ready',
                    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                    deliveryDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
                    notes: 'Costume pour entretien'
                },
                {
                    id: 2,
                    orderNumber: 'CMD-002',
                    customerId: 4,
                    customerName: 'Pierre Durand',
                    managerId: 2,
                    services: [
                        { name: 'Nettoyage manteau', quantity: 1, price: 45 },
                        { name: 'Repassage', quantity: 1, price: 20 }
                    ],
                    total: 65,
                    status: 'in_progress',
                    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                    deliveryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
                    notes: 'Manteau d\'hiver'
                },
                {
                    id: 3,
                    orderNumber: 'CMD-003',
                    customerId: 3,
                    customerName: 'Marie Martin',
                    managerId: 2,
                    services: [
                        { name: 'Lavage robe', quantity: 1, price: 25 }
                    ],
                    total: 25,
                    status: 'pending',
                    createdAt: new Date().toISOString(),
                    deliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
                    notes: 'Nouvelle commande'
                }
            ];

            localStorage.setItem('manohpressing_orders', JSON.stringify(defaultOrders));
        }
    }

    initializeStock() {
        const existingStock = JSON.parse(localStorage.getItem('manohpressing_stock') || '[]');
        
        if (existingStock.length === 0) {
            const defaultStock = [
                {
                    id: 1,
                    name: 'Détergent Premium',
                    quantity: 25,
                    unit: 'kg',
                    minQuantity: 10,
                    unitPrice: 25,
                    supplier: 'Procter & Gamble France',
                    createdAt: new Date().toISOString()
                },
                {
                    id: 2,
                    name: 'Eau de Javel',
                    quantity: 15,
                    unit: 'L',
                    minQuantity: 8,
                    unitPrice: 8,
                    supplier: 'Lacroix France',
                    createdAt: new Date().toISOString()
                },
                {
                    id: 3,
                    name: 'Amidon',
                    quantity: 8,
                    unit: 'kg',
                    minQuantity: 5,
                    unitPrice: 12,
                    supplier: 'Unilever France',
                    createdAt: new Date().toISOString()
                },
                {
                    id: 4,
                    name: 'Solvant nettoyage à sec',
                    quantity: 45,
                    unit: 'L',
                    minQuantity: 20,
                    unitPrice: 35,
                    supplier: 'ChemFrance Sarl',
                    createdAt: new Date().toISOString()
                },
                {
                    id: 5,
                    name: 'Cintres plastique',
                    quantity: 150,
                    unit: 'pièces',
                    minQuantity: 50,
                    unitPrice: 1.5,
                    supplier: 'PlasticFrance Industries',
                    createdAt: new Date().toISOString()
                }
            ];

            localStorage.setItem('manohpressing_stock', JSON.stringify(defaultStock));
        }
    }

    initializeSites() {
        const existingSites = JSON.parse(localStorage.getItem('manohpressing_sites') || '[]');
        
        if (existingSites.length === 0) {
            const defaultSites = [
                {
                    id: 1,
                    name: 'ManohPressing Centre Paris',
                    address: '123 Avenue des Champs-Élysées, Paris',
                    manager: 'Jean Dupont',
                    managerId: 2,
                    status: 'active',
                    orders: 45,
                    monthlyRevenue: 12500,
                    phone: '01 42 25 67 89',
                    email: 'centre.paris@manohpressing.com'
                },
                {
                    id: 2,
                    name: 'ManohPressing République',
                    address: '456 Boulevard de la République, Paris',
                    manager: 'Non assigné',
                    managerId: null,
                    status: 'inactive',
                    orders: 0,
                    monthlyRevenue: 0,
                    phone: '01 48 87 65 43',
                    email: 'republique@manohpressing.com'
                },
                {
                    id: 3,
                    name: 'ManohPressing Lyon',
                    address: '789 Rue de la Paix, Lyon',
                    manager: 'Non assigné',
                    managerId: null,
                    status: 'inactive',
                    orders: 0,
                    monthlyRevenue: 0,
                    phone: '04 78 34 56 78',
                    email: 'lyon@manohpressing.com'
                }
            ];

            localStorage.setItem('manohpressing_sites', JSON.stringify(defaultSites));
        }
    }

    initializeManagers() {
        const existingManagers = JSON.parse(localStorage.getItem('manohpressing_managers') || '[]');
        
        if (existingManagers.length === 0) {
            const defaultManagers = [
                {
                    id: 2,
                    firstName: 'Jean',
                    lastName: 'Dupont',
                    email: 'jean.dupont@manohpressing.com',
                    phone: '06 12 34 56 78',
                    address: '123 Rue de la République, Paris',
                    siteId: 1,
                    hireDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
                    status: 'Actif',
                    isActive: true,
                    role: 'manager'
                }
            ];

            localStorage.setItem('manohpressing_managers', JSON.stringify(defaultManagers));
        }
    }

    // Méthode pour réinitialiser les données
    resetData() {
        localStorage.removeItem('manohpressing_users');
        localStorage.removeItem('manohpressing_orders');
        localStorage.removeItem('manohpressing_stock');
        localStorage.removeItem('manohpressing_sites');
        localStorage.removeItem('manohpressing_managers');
        localStorage.removeItem('manohpressing_notifications');
        
        this.initialized = false;
        this.init();
        
        if (window.showToast) {
            showToast('Données réinitialisées avec succès', 'success');
        }
    }
}

// Instance globale
const dataInit = new DataInitializer();

// Auto-initialisation au chargement
document.addEventListener('DOMContentLoaded', () => {
    dataInit.init();
});

window.dataInit = dataInit;
