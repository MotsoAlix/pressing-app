/**
 * Gestionnaire de paiements mobiles pour ManohPressing
 * Support Orange Money et MTN Money
 */

class MobilePaymentManager {
    constructor() {
        this.payments = [];
        this.paymentMethods = {
            'orange_money': {
                name: 'Orange Money',
                icon: 'fas fa-mobile-alt',
                color: '#FF6600',
                prefix: '+237',
                regex: /^6[5-9]\d{7}$/,
                fees: 0.02 // 2% de frais
            },
            'mtn_money': {
                name: 'MTN Mobile Money',
                icon: 'fas fa-mobile-alt',
                color: '#FFCC00',
                prefix: '+237',
                regex: /^6[7-8]\d{7}$/,
                fees: 0.015 // 1.5% de frais
            }
        };
        this.init();
    }

    init() {
        this.loadPayments();
        this.setupPaymentStatusCheck();
    }

    loadPayments() {
        const paymentsData = localStorage.getItem('manohpressing_payments');
        if (paymentsData) {
            this.payments = JSON.parse(paymentsData);
        }
    }

    savePayments() {
        localStorage.setItem('manohpressing_payments', JSON.stringify(this.payments));
    }

    // Initier un paiement mobile
    async initiatePayment(orderId, customerId, amount, phoneNumber, paymentMethod) {
        try {
            // Validation des paramètres
            if (!orderId || !customerId || !amount || !phoneNumber || !paymentMethod) {
                throw new Error('Paramètres de paiement manquants');
            }

            // Validation du numéro de téléphone
            const method = this.paymentMethods[paymentMethod];
            if (!method) {
                throw new Error('Méthode de paiement non supportée');
            }

            const cleanPhone = phoneNumber.replace(/\s+/g, '');
            if (!method.regex.test(cleanPhone)) {
                throw new Error(`Numéro ${method.name} invalide`);
            }

            // Calculer les frais
            const fees = Math.round(amount * method.fees * 100) / 100;
            const totalAmount = amount + fees;

            // Créer la transaction
            const payment = {
                id: Date.now(),
                transactionId: this.generateTransactionId(),
                orderId: orderId,
                customerId: customerId,
                amount: amount,
                fees: fees,
                totalAmount: totalAmount,
                phoneNumber: method.prefix + cleanPhone,
                paymentMethod: paymentMethod,
                status: 'pending', // pending, processing, completed, failed, cancelled
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                attempts: 0,
                maxAttempts: 3
            };

            this.payments.push(payment);
            this.savePayments();

            // Simuler l'envoi de la demande de paiement
            await this.sendPaymentRequest(payment);

            console.log('💳 Paiement initié:', payment);
            return payment;

        } catch (error) {
            console.error('Erreur initiation paiement:', error);
            throw error;
        }
    }

    // Simuler l'envoi de la demande de paiement
    async sendPaymentRequest(payment) {
        try {
            payment.status = 'processing';
            payment.updatedAt = new Date().toISOString();
            payment.attempts++;
            this.savePayments();

            // Simuler un délai de traitement
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Simuler une réponse (85% de succès)
            const success = Math.random() > 0.15;

            if (success) {
                payment.status = 'completed';
                payment.completedAt = new Date().toISOString();
                payment.confirmationCode = this.generateConfirmationCode();
                
                // Mettre à jour le statut de la commande
                await this.updateOrderPaymentStatus(payment.orderId, 'paid');
                
                // Notifier le gérant
                await this.notifyManagerPayment(payment);
                
            } else {
                payment.status = 'failed';
                payment.failureReason = 'Paiement refusé par l\'opérateur';
            }

            payment.updatedAt = new Date().toISOString();
            this.savePayments();

            return payment;

        } catch (error) {
            payment.status = 'failed';
            payment.failureReason = error.message;
            payment.updatedAt = new Date().toISOString();
            this.savePayments();
            throw error;
        }
    }

    // Mettre à jour le statut de paiement de la commande
    async updateOrderPaymentStatus(orderId, paymentStatus) {
        try {
            const orders = JSON.parse(localStorage.getItem('manohpressing_orders') || '[]');
            const orderIndex = orders.findIndex(o => o.id === orderId);
            
            if (orderIndex !== -1) {
                orders[orderIndex].paymentStatus = paymentStatus;
                orders[orderIndex].paidAt = new Date().toISOString();
                localStorage.setItem('manohpressing_orders', JSON.stringify(orders));
                
                console.log('✅ Statut de paiement mis à jour:', orderId, paymentStatus);
            }
        } catch (error) {
            console.error('Erreur mise à jour statut paiement:', error);
        }
    }

    // Notifier le gérant du paiement
    async notifyManagerPayment(payment) {
        try {
            const order = this.getOrderById(payment.orderId);
            const customer = this.getCustomerById(payment.customerId);
            
            if (!order || !customer) return;

            const method = this.paymentMethods[payment.paymentMethod];
            const message = `💳 Paiement reçu !

Commande: ${order.orderNumber}
Client: ${customer.firstName} ${customer.lastName}
Montant: ${payment.amount}€
Frais: ${payment.fees}€
Total payé: ${payment.totalAmount}€
Méthode: ${method.name}
Téléphone: ${payment.phoneNumber}
Code de confirmation: ${payment.confirmationCode}

Le paiement a été traité avec succès.`;

            if (window.secureCommunicationManager) {
                // Notifier tous les gérants
                const users = JSON.parse(localStorage.getItem('manohpressing_users') || '[]');
                const managers = users.filter(u => u.role === 'manager');
                
                for (const manager of managers) {
                    await window.secureCommunicationManager.sendNotification(
                        manager.id,
                        'payment_received',
                        'Paiement mobile reçu',
                        message,
                        {
                            paymentId: payment.id,
                            orderId: payment.orderId,
                            amount: payment.totalAmount,
                            method: payment.paymentMethod
                        }
                    );
                }
            }
        } catch (error) {
            console.error('Erreur notification gérant:', error);
        }
    }

    // Vérifier le statut d'un paiement
    async checkPaymentStatus(paymentId) {
        const payment = this.payments.find(p => p.id === paymentId);
        if (!payment) {
            throw new Error('Paiement non trouvé');
        }

        // Si le paiement est en cours et pas encore expiré (5 minutes)
        if (payment.status === 'processing') {
            const now = new Date();
            const created = new Date(payment.createdAt);
            const diffMinutes = (now - created) / (1000 * 60);

            if (diffMinutes > 5) {
                payment.status = 'failed';
                payment.failureReason = 'Timeout - Paiement expiré';
                payment.updatedAt = new Date().toISOString();
                this.savePayments();
            }
        }

        return payment;
    }

    // Annuler un paiement
    async cancelPayment(paymentId, reason = 'Annulé par l\'utilisateur') {
        const payment = this.payments.find(p => p.id === paymentId);
        if (!payment) {
            throw new Error('Paiement non trouvé');
        }

        if (payment.status === 'completed') {
            throw new Error('Impossible d\'annuler un paiement terminé');
        }

        payment.status = 'cancelled';
        payment.cancelledAt = new Date().toISOString();
        payment.cancellationReason = reason;
        payment.updatedAt = new Date().toISOString();
        
        this.savePayments();
        return payment;
    }

    // Obtenir les paiements d'un client
    getCustomerPayments(customerId, status = null) {
        let payments = this.payments.filter(p => p.customerId === customerId);
        
        if (status) {
            payments = payments.filter(p => p.status === status);
        }

        return payments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    // Obtenir les paiements pour un gérant
    getManagerPayments(managerId = null, status = null) {
        let payments = this.payments;

        if (managerId) {
            // Filtrer par les commandes du gérant
            const orders = JSON.parse(localStorage.getItem('manohpressing_orders') || '[]');
            const managerOrderIds = orders
                .filter(o => o.managerId === managerId)
                .map(o => o.id);
            payments = payments.filter(p => managerOrderIds.includes(p.orderId));
        }

        if (status) {
            payments = payments.filter(p => p.status === status);
        }

        return payments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    // Vérification automatique des paiements en cours
    setupPaymentStatusCheck() {
        setInterval(() => {
            this.checkPendingPayments();
        }, 30000); // Vérifier toutes les 30 secondes
    }

    async checkPendingPayments() {
        const pendingPayments = this.payments.filter(p => p.status === 'processing');
        
        for (const payment of pendingPayments) {
            try {
                await this.checkPaymentStatus(payment.id);
            } catch (error) {
                console.error('Erreur vérification paiement:', error);
            }
        }
    }

    // Fonctions utilitaires
    generateTransactionId() {
        const timestamp = Date.now().toString();
        const random = Math.random().toString(36).substring(2, 8).toUpperCase();
        return `TXN${timestamp}${random}`;
    }

    generateConfirmationCode() {
        return Math.random().toString(36).substring(2, 10).toUpperCase();
    }

    getOrderById(orderId) {
        const orders = JSON.parse(localStorage.getItem('manohpressing_orders') || '[]');
        return orders.find(o => o.id === orderId);
    }

    getCustomerById(customerId) {
        const users = JSON.parse(localStorage.getItem('manohpressing_users') || '[]');
        return users.find(u => u.id === customerId && u.role === 'client');
    }

    // Statistiques des paiements
    getPaymentStats(managerId = null) {
        const payments = this.getManagerPayments(managerId);
        
        return {
            total: payments.length,
            completed: payments.filter(p => p.status === 'completed').length,
            pending: payments.filter(p => p.status === 'processing').length,
            failed: payments.filter(p => p.status === 'failed').length,
            totalAmount: payments
                .filter(p => p.status === 'completed')
                .reduce((sum, p) => sum + p.amount, 0),
            totalFees: payments
                .filter(p => p.status === 'completed')
                .reduce((sum, p) => sum + p.fees, 0),
            orangeMoney: payments.filter(p => p.paymentMethod === 'orange_money').length,
            mtnMoney: payments.filter(p => p.paymentMethod === 'mtn_money').length
        };
    }
}

// Instance globale
window.mobilePaymentManager = new MobilePaymentManager();
