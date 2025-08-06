/**
 * Gestionnaire de coupons de dépôt pour ManohPressing
 * Système de certification et vérification de dépôt d'habits
 */

class DepositCouponManager {
    constructor() {
        this.coupons = [];
        this.couponTypes = {
            'deposit_receipt': {
                name: 'Reçu de dépôt',
                description: 'Coupon de certification de dépôt d\'habits',
                type: 'deposit_verification',
                validityDays: 90, // 3 mois pour récupérer les vêtements
                requiresPickup: true
            },
            'pickup_verification': {
                name: 'Vérification de retrait',
                description: 'Coupon pour vérifier le retrait des vêtements',
                type: 'pickup_verification',
                validityDays: 7, // 7 jours après livraison pour confirmer
                requiresPickup: false
            }
        };
        this.init();
    }

    init() {
        this.loadCoupons();
        this.setupExpirationCheck();
    }

    loadCoupons() {
        const couponsData = localStorage.getItem('manohpressing_coupons');
        if (couponsData) {
            this.coupons = JSON.parse(couponsData);
        }
    }

    saveCoupons() {
        localStorage.setItem('manohpressing_coupons', JSON.stringify(this.coupons));
    }

    // Générer un coupon de dépôt après livraison d'une commande
    async generateDepositCoupon(orderId, customerId, managerId) {
        try {
            const order = this.getOrderById(orderId);
            const customer = this.getCustomerById(customerId);

            if (!order || !customer) {
                throw new Error('Commande ou client non trouvé');
            }

            const couponType = this.couponTypes.deposit_receipt;
            const couponCode = this.generateDepositCode();

            const coupon = {
                id: Date.now(),
                code: couponCode,
                type: 'deposit_receipt',
                customerId: customerId,
                orderId: orderId,
                managerId: managerId,
                status: 'pending_validation', // pending_validation, active, collected, expired
                createdAt: new Date().toISOString(),
                validFrom: new Date().toISOString(),
                validUntil: this.calculateExpirationDate(couponType.validityDays),
                collectedAt: null,
                customerName: `${customer.firstName} ${customer.lastName}`,
                orderNumber: order.orderNumber,
                orderTotal: order.total,
                itemsCount: order.services ? order.services.length : 0,
                itemsDescription: order.services ? order.services.map(s => s.name).join(', ') : 'Articles divers',
                depositDate: new Date().toISOString(),
                pickupLocation: 'ManohPressing - Site Principal'
            };

            this.coupons.push(coupon);
            this.saveCoupons();

            console.log('🎫 Coupon de dépôt généré:', coupon);
            return coupon;

        } catch (error) {
            console.error('Erreur génération coupon de dépôt:', error);
            throw error;
        }
    }

    // Valider et envoyer le coupon de dépôt (action du gérant)
    async validateAndSendDepositCoupon(couponId, managerId) {
        try {
            const coupon = this.coupons.find(c => c.id === couponId);
            if (!coupon) {
                throw new Error('Coupon de dépôt non trouvé');
            }

            if (coupon.status !== 'pending_validation') {
                throw new Error('Coupon déjà traité');
            }

            // Marquer le coupon comme actif
            coupon.status = 'active';
            coupon.validatedAt = new Date().toISOString();
            coupon.validatedBy = managerId;

            this.saveCoupons();

            // Envoyer notification au client
            await this.sendDepositCouponNotification(coupon);

            console.log('✅ Coupon de dépôt validé et envoyé:', coupon.code);
            return coupon;

        } catch (error) {
            console.error('Erreur validation coupon de dépôt:', error);
            throw error;
        }
    }

    // Envoyer notification du coupon de dépôt au client
    async sendDepositCouponNotification(coupon) {
        if (window.secureCommunicationManager) {
            const message = `🎫 Reçu de dépôt de vêtements

Code de dépôt: ${coupon.code}
Commande: ${coupon.orderNumber}
Articles: ${coupon.itemsDescription}
Date de dépôt: ${this.formatDate(coupon.depositDate)}

⚠️ IMPORTANT: Conservez ce code pour récupérer vos vêtements
Valable jusqu'au: ${this.formatDate(coupon.validUntil)}
Lieu de retrait: ${coupon.pickupLocation}

Présentez ce code lors du retrait de vos vêtements.`;

            await window.secureCommunicationManager.sendNotification(
                coupon.customerId,
                'deposit_receipt',
                'Reçu de dépôt de vêtements',
                message,
                {
                    couponId: coupon.id,
                    couponCode: coupon.code,
                    orderNumber: coupon.orderNumber,
                    itemsCount: coupon.itemsCount
                }
            );
        }
    }

    // Vérifier un coupon de dépôt pour le retrait
    verifyDepositCoupon(couponCode, customerId) {
        const coupon = this.coupons.find(c =>
            c.code === couponCode &&
            c.customerId === customerId &&
            c.status === 'active' &&
            c.type === 'deposit_receipt'
        );

        if (!coupon) {
            return { success: false, error: 'Coupon de dépôt invalide ou non trouvé' };
        }

        if (new Date() > new Date(coupon.validUntil)) {
            coupon.status = 'expired';
            this.saveCoupons();
            return { success: false, error: 'Coupon de dépôt expiré' };
        }

        if (coupon.status === 'collected') {
            return { success: false, error: 'Vêtements déjà récupérés' };
        }

        return {
            success: true,
            coupon: coupon,
            orderNumber: coupon.orderNumber,
            itemsDescription: coupon.itemsDescription,
            depositDate: coupon.depositDate,
            customerName: coupon.customerName
        };
    }

    // Marquer un coupon de dépôt comme récupéré
    markAsCollected(couponCode, customerId, managerId) {
        const coupon = this.coupons.find(c =>
            c.code === couponCode &&
            c.customerId === customerId &&
            c.status === 'active' &&
            c.type === 'deposit_receipt'
        );

        if (coupon) {
            coupon.status = 'collected';
            coupon.collectedAt = new Date().toISOString();
            coupon.collectedBy = managerId;
            this.saveCoupons();

            console.log('✅ Vêtements récupérés:', coupon.code);
            return true;
        }
        return false;
    }

    // Vérifier et expirer les coupons de dépôt automatiquement
    checkAndExpireCoupons() {
        const now = new Date();
        let expiredCount = 0;

        this.coupons.forEach(coupon => {
            if (coupon.status === 'active' && new Date(coupon.validUntil) < now) {
                coupon.status = 'expired';
                coupon.expiredAt = now.toISOString();
                expiredCount++;

                // Alerte pour les coupons de dépôt expirés (vêtements non récupérés)
                if (coupon.type === 'deposit_receipt') {
                    console.warn(`⚠️ Vêtements non récupérés - Coupon expiré: ${coupon.code} (${coupon.customerName})`);
                }
            }
        });

        if (expiredCount > 0) {
            this.saveCoupons();
            console.log(`🕒 ${expiredCount} coupon(s) de dépôt expiré(s)`);
        }

        return expiredCount;
    }

    // Configuration de la vérification automatique d'expiration
    setupExpirationCheck() {
        // Vérifier toutes les heures
        setInterval(() => {
            this.checkAndExpireCoupons();
        }, 60 * 60 * 1000);

        // Vérification initiale
        this.checkAndExpireCoupons();
    }

    // Obtenir les coupons d'un client
    getCustomerCoupons(customerId, status = null) {
        let customerCoupons = this.coupons.filter(c => c.customerId === customerId);
        
        if (status) {
            customerCoupons = customerCoupons.filter(c => c.status === status);
        }

        return customerCoupons.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    // Obtenir les coupons en attente de validation pour un gérant
    getPendingCouponsForManager(managerId) {
        return this.coupons.filter(c => 
            c.managerId === managerId && 
            c.status === 'pending_validation'
        ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    // Fonctions utilitaires
    generateDepositCode() {
        const prefix = 'DEP';
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.random().toString(36).substring(2, 6).toUpperCase();
        return `${prefix}${timestamp}${random}`;
    }

    calculateExpirationDate(validityDays) {
        const date = new Date();
        date.setDate(date.getDate() + validityDays);
        return date.toISOString();
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    getOrderById(orderId) {
        const orders = JSON.parse(localStorage.getItem('manohpressing_orders') || '[]');
        return orders.find(o => o.id === orderId);
    }

    getCustomerById(customerId) {
        const users = JSON.parse(localStorage.getItem('manohpressing_users') || '[]');
        return users.find(u => u.id === customerId && u.role === 'client');
    }

    // Statistiques des coupons de dépôt
    getDepositStats(managerId = null) {
        let coupons = this.coupons;
        if (managerId) {
            coupons = coupons.filter(c => c.managerId === managerId);
        }

        return {
            total: coupons.length,
            pending: coupons.filter(c => c.status === 'pending_validation').length,
            active: coupons.filter(c => c.status === 'active').length,
            collected: coupons.filter(c => c.status === 'collected').length,
            expired: coupons.filter(c => c.status === 'expired').length,
            uncollectedItems: coupons.filter(c => c.status === 'expired' && c.type === 'deposit_receipt').length,
            totalItemsDeposited: coupons.reduce((sum, c) => sum + (c.itemsCount || 0), 0)
        };
    }
}

// Instance globale
window.depositCouponManager = new DepositCouponManager();
// Alias pour compatibilité
window.couponManager = window.depositCouponManager;
