/**
 * Gestionnaire d'états des commandes avec validation des transitions
 */

class OrderStateManager {
    constructor() {
        this.states = {
            'pending': {
                label: 'En attente',
                color: '#ffc107',
                icon: 'fas fa-clock',
                allowedTransitions: ['in_progress', 'cancelled'],
                requiredPermissions: ['manager', 'admin'],
                actions: ['start_processing']
            },
            'in_progress': {
                label: 'En cours',
                color: '#007bff',
                icon: 'fas fa-cog',
                allowedTransitions: ['ready', 'pending', 'cancelled'],
                requiredPermissions: ['manager', 'admin'],
                actions: ['complete', 'pause', 'cancel']
            },
            'ready': {
                label: 'Prête',
                color: '#28a745',
                icon: 'fas fa-check-circle',
                allowedTransitions: ['delivered', 'in_progress'],
                requiredPermissions: ['manager', 'admin'],
                actions: ['deliver', 'notify_customer', 'return_to_processing']
            },
            'delivered': {
                label: 'Livrée',
                color: '#6c757d',
                icon: 'fas fa-truck',
                allowedTransitions: [],
                requiredPermissions: ['manager', 'admin'],
                actions: ['archive']
            },
            'cancelled': {
                label: 'Annulée',
                color: '#dc3545',
                icon: 'fas fa-times-circle',
                allowedTransitions: ['pending'],
                requiredPermissions: ['manager', 'admin'],
                actions: ['reactivate']
            }
        };

        this.transitionRules = {
            'pending_to_in_progress': {
                validation: (order) => this.validateOrderCanStart(order),
                onTransition: (order) => this.onOrderStarted(order),
                requiredFields: ['assignedTo']
            },
            'in_progress_to_ready': {
                validation: (order) => this.validateOrderCanComplete(order),
                onTransition: (order) => this.onOrderCompleted(order),
                requiredFields: ['completedAt']
            },
            'ready_to_delivered': {
                validation: (order) => this.validateOrderCanDeliver(order),
                onTransition: (order) => this.onOrderDelivered(order),
                requiredFields: ['deliveredAt', 'deliveredBy']
            }
        };
    }

    isValidTransition(currentState, newState, userRole = null) {
        const stateConfig = this.states[currentState];
        if (!stateConfig) {
            console.error(`État invalide: ${currentState}`);
            return false;
        }

        // Vérifier si la transition est autorisée
        if (!stateConfig.allowedTransitions.includes(newState)) {
            console.warn(`Transition non autorisée: ${currentState} -> ${newState}`);
            return false;
        }

        // Vérifier les permissions utilisateur
        if (userRole && !stateConfig.requiredPermissions.includes(userRole)) {
            console.warn(`Permission insuffisante pour ${userRole} sur l'état ${currentState}`);
            return false;
        }

        return true;
    }

    async validateTransition(order, newState, userRole, additionalData = {}) {
        const currentState = order.status;
        
        // Vérifier la validité de base de la transition
        if (!this.isValidTransition(currentState, newState, userRole)) {
            return {
                success: false,
                error: `Transition ${currentState} -> ${newState} non autorisée`
            };
        }

        // Vérifier les règles spécifiques de transition
        const ruleKey = `${currentState}_to_${newState}`;
        const rule = this.transitionRules[ruleKey];

        if (rule) {
            // Vérifier les champs requis
            if (rule.requiredFields) {
                for (const field of rule.requiredFields) {
                    if (!additionalData[field] && !order[field]) {
                        return {
                            success: false,
                            error: `Champ requis manquant: ${field}`
                        };
                    }
                }
            }

            // Exécuter la validation personnalisée
            if (rule.validation) {
                const validationResult = await rule.validation(order);
                if (!validationResult.success) {
                    return validationResult;
                }
            }
        }

        return { success: true };
    }

    async executeTransition(order, newState, userRole, additionalData = {}) {
        // Valider la transition
        const validation = await this.validateTransition(order, newState, userRole, additionalData);
        if (!validation.success) {
            return validation;
        }

        const currentState = order.status;
        const ruleKey = `${currentState}_to_${newState}`;
        const rule = this.transitionRules[ruleKey];

        try {
            // Mettre à jour l'ordre avec les nouvelles données
            const updatedOrder = {
                ...order,
                ...additionalData,
                status: newState,
                lastStatusChange: new Date().toISOString(),
                statusHistory: [
                    ...(order.statusHistory || []),
                    {
                        from: currentState,
                        to: newState,
                        timestamp: new Date().toISOString(),
                        userId: window.securityManager?.currentUser?.id,
                        userRole: userRole
                    }
                ]
            };

            // Exécuter les actions de transition
            if (rule && rule.onTransition) {
                await rule.onTransition(updatedOrder);
            }

            return {
                success: true,
                data: updatedOrder
            };

        } catch (error) {
            console.error('Erreur lors de la transition:', error);
            return {
                success: false,
                error: `Erreur lors de la transition: ${error.message}`
            };
        }
    }

    getAvailableActions(currentState, userRole) {
        const stateConfig = this.states[currentState];
        if (!stateConfig) return [];

        // Vérifier les permissions
        if (!stateConfig.requiredPermissions.includes(userRole)) {
            return [];
        }

        return stateConfig.allowedTransitions.map(nextState => ({
            state: nextState,
            label: this.states[nextState].label,
            action: this.getActionForTransition(currentState, nextState)
        }));
    }

    getActionForTransition(fromState, toState) {
        const actionMap = {
            'pending_to_in_progress': 'Commencer',
            'in_progress_to_ready': 'Terminer',
            'ready_to_delivered': 'Livrer',
            'in_progress_to_pending': 'Remettre en attente',
            'ready_to_in_progress': 'Reprendre le traitement'
        };

        return actionMap[`${fromState}_to_${toState}`] || `Passer à ${this.states[toState].label}`;
    }

    // Validations spécifiques
    validateOrderCanStart(order) {
        // Vérifier que la commande a tous les éléments nécessaires
        if (!order.services || order.services.length === 0) {
            return {
                success: false,
                error: 'La commande doit contenir au moins un service'
            };
        }

        return { success: true };
    }

    validateOrderCanComplete(order) {
        // Vérifier que tous les services sont traités
        if (order.services && order.services.some(service => !service.completed)) {
            return {
                success: false,
                error: 'Tous les services doivent être terminés'
            };
        }

        return { success: true };
    }

    validateOrderCanDeliver(order) {
        // Vérifier que le client a été notifié
        if (!order.customerNotified) {
            return {
                success: false,
                error: 'Le client doit être notifié avant la livraison'
            };
        }

        return { success: true };
    }

    // Actions de transition
    async onOrderStarted(order) {
        console.log(`Commande ${order.orderNumber} démarrée`);
        // Notifier le client que sa commande est en cours
        if (window.notificationManager) {
            await window.notificationManager.sendNotification(
                order.customerId,
                'order_started',
                'Commande en cours',
                'Votre commande est maintenant en cours de traitement'
            );
        }
    }

    async onOrderCompleted(order) {
        console.log(`Commande ${order.orderNumber} terminée`);
        order.completedAt = new Date().toISOString();
        
        // Notifier le client que sa commande est prête
        if (window.notificationManager) {
            await window.notificationManager.sendNotification(
                order.customerId,
                'order_ready',
                'Commande prête',
                'Votre commande est prête à être récupérée !'
            );
        }
    }

    async onOrderDelivered(order) {
        console.log(`Commande ${order.orderNumber} livrée`);
        order.deliveredAt = new Date().toISOString();
        
        // Notifier le client de la livraison
        if (window.notificationManager) {
            await window.notificationManager.sendNotification(
                order.customerId,
                'order_delivered',
                'Commande livrée',
                'Votre commande a été livrée avec succès'
            );
        }
    }

    getStateInfo(state) {
        return this.states[state] || null;
    }

    getAllStates() {
        return Object.keys(this.states).map(key => ({
            key,
            ...this.states[key]
        }));
    }
}

// Instance globale
window.orderStateManager = new OrderStateManager();
