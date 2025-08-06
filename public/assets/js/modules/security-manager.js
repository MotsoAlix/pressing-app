/**
 * Gestionnaire de sécurité et contrôles d'accès
 */

class SecurityManager {
    constructor() {
        this.currentUser = null;
        this.sessionTimeout = 30 * 60 * 1000; // 30 minutes
        this.lastActivity = Date.now();
        this.init();
    }

    init() {
        this.loadCurrentUser();
        this.setupActivityTracking();
        this.checkSessionValidity();
    }

    loadCurrentUser() {
        const userData = localStorage.getItem('user');
        if (userData) {
            try {
                this.currentUser = JSON.parse(userData);
                this.validateUserSession();
            } catch (error) {
                console.error('Données utilisateur corrompues:', error);
                this.logout();
            }
        }
    }

    validateUserSession() {
        if (!this.currentUser) return false;

        // Vérifier la validité de la session
        const sessionData = localStorage.getItem('user_session');
        if (sessionData) {
            const session = JSON.parse(sessionData);
            if (Date.now() - session.lastActivity > this.sessionTimeout) {
                console.warn('Session expirée');
                this.logout();
                return false;
            }
        }

        return true;
    }

    hasPermission(action, resource = null) {
        if (!this.currentUser) return false;

        const permissions = {
            'admin': {
                'create': ['sites', 'managers', 'users'],
                'read': ['*'],
                'update': ['sites', 'managers', 'users', 'orders', 'stock'],
                'delete': ['sites', 'managers', 'users'],
                'manage': ['restock_requests', 'analytics']
            },
            'manager': {
                'create': ['orders', 'notifications'],
                'read': ['orders', 'customers', 'stock', 'notifications'],
                'update': ['orders', 'stock', 'notifications'],
                'delete': ['notifications'],
                'manage': ['chat', 'restock_requests']
            },
            'client': {
                'create': ['messages'],
                'read': ['orders', 'notifications', 'messages'],
                'update': ['profile'],
                'delete': [],
                'manage': ['chat']
            }
        };

        const userPermissions = permissions[this.currentUser.role];
        if (!userPermissions) return false;

        const actionPermissions = userPermissions[action];
        if (!actionPermissions) return false;

        // Vérifier si l'utilisateur a accès à toutes les ressources
        if (actionPermissions.includes('*')) return true;

        // Vérifier si l'utilisateur a accès à la ressource spécifique
        return resource ? actionPermissions.includes(resource) : true;
    }

    canAccessData(dataType, dataOwnerId = null) {
        if (!this.currentUser) return false;

        switch (this.currentUser.role) {
            case 'admin':
                return true; // Admin accède à tout

            case 'manager':
                // Gérant accède seulement aux données de son site
                if (dataType === 'orders') {
                    return dataOwnerId === this.currentUser.id; // managerId
                }
                if (dataType === 'customers') {
                    return true; // Tous les clients (à filtrer par site)
                }
                return true;

            case 'client':
                // Client accède seulement à ses propres données
                return dataOwnerId === this.currentUser.id;

            default:
                return false;
        }
    }

    setupActivityTracking() {
        // Tracker l'activité utilisateur
        ['click', 'keypress', 'scroll', 'mousemove'].forEach(event => {
            document.addEventListener(event, () => {
                this.updateLastActivity();
            }, { passive: true });
        });

        // Vérifier périodiquement la session
        setInterval(() => {
            this.checkSessionValidity();
        }, 60000); // Chaque minute
    }

    updateLastActivity() {
        this.lastActivity = Date.now();
        const sessionData = {
            userId: this.currentUser?.id,
            lastActivity: this.lastActivity,
            role: this.currentUser?.role
        };
        localStorage.setItem('user_session', JSON.stringify(sessionData));
    }

    checkSessionValidity() {
        if (this.currentUser && Date.now() - this.lastActivity > this.sessionTimeout) {
            console.warn('Session expirée par inactivité');
            this.logout();
        }
    }

    logout() {
        localStorage.removeItem('user');
        localStorage.removeItem('user_session');
        this.currentUser = null;
        window.location.href = '/';
    }

    // Méthode pour valider les actions sensibles
    validateSensitiveAction(action, targetUserId = null) {
        if (!this.currentUser) return false;

        // Vérifier que l'utilisateur peut effectuer cette action
        if (!this.hasPermission(action)) return false;

        // Vérifications spécifiques selon le rôle
        switch (this.currentUser.role) {
            case 'admin':
                return true; // Admin peut tout faire

            case 'manager':
                // Gérant ne peut agir que sur son site
                if (targetUserId && this.currentUser.siteId) {
                    // Vérifier que l'utilisateur cible appartient au même site
                    return this.isUserInSameSite(targetUserId);
                }
                return true;

            case 'client':
                // Client ne peut agir que sur ses propres données
                return targetUserId === this.currentUser.id;

            default:
                return false;
        }
    }

    isUserInSameSite(userId) {
        // Cette méthode devrait vérifier si l'utilisateur appartient au même site
        // Pour l'instant, on retourne true (à implémenter selon la logique métier)
        return true;
    }

    // Méthode pour encoder/décoder les tokens (simulation)
    generateToken(userData) {
        const tokenData = {
            userId: userData.id,
            role: userData.role,
            siteId: userData.siteId,
            timestamp: Date.now()
        };
        return btoa(JSON.stringify(tokenData));
    }

    validateToken(token) {
        try {
            const tokenData = JSON.parse(atob(token));
            return Date.now() - tokenData.timestamp < this.sessionTimeout;
        } catch (error) {
            return false;
        }
    }
}

// Instance globale
window.securityManager = new SecurityManager();
