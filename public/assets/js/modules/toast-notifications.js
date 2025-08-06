/**
 * Système de notifications toast amélioré
 */

class ToastManager {
    constructor() {
        this.notifications = [];
        this.container = null;
        this.maxNotifications = 5;
        this.init();
    }

    init() {
        this.createContainer();
    }

    createContainer() {
        if (document.getElementById('toast-container')) return;
        
        this.container = document.createElement('div');
        this.container.id = 'toast-container';
        this.container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            display: flex;
            flex-direction: column;
            gap: 10px;
            max-width: 400px;
            pointer-events: none;
        `;
        document.body.appendChild(this.container);
    }

    show(message, type = 'info', duration = 4000) {
        // Limiter le nombre de notifications
        if (this.notifications.length >= this.maxNotifications) {
            this.remove(this.notifications[0]);
        }

        const toast = this.createToast(message, type);
        this.container.appendChild(toast);
        this.notifications.push(toast);
        
        // Animation d'entrée
        requestAnimationFrame(() => {
            toast.style.transform = 'translateX(0)';
            toast.style.opacity = '1';
        });
        
        // Auto-suppression
        const timeoutId = setTimeout(() => {
            this.remove(toast);
        }, duration);
        
        toast.timeoutId = timeoutId;
        return toast;
    }

    createToast(message, type) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        const colors = {
            success: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#3b82f6'
        };
        
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };
        
        toast.style.cssText = `
            background: white;
            border-left: 4px solid ${colors[type] || colors.info};
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            padding: 16px;
            transform: translateX(100%);
            opacity: 0;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            display: flex;
            align-items: center;
            gap: 12px;
            min-width: 300px;
            max-width: 400px;
            cursor: pointer;
            pointer-events: auto;
            word-wrap: break-word;
            position: relative;
        `;
        
        toast.innerHTML = `
            <i class="${icons[type] || icons.info}" style="color: ${colors[type] || colors.info}; font-size: 18px; flex-shrink: 0;"></i>
            <span style="flex: 1; color: #374151; font-weight: 500; line-height: 1.4;">${message}</span>
            <i class="fas fa-times toast-close" style="color: #9ca3af; cursor: pointer; font-size: 14px; flex-shrink: 0; padding: 4px;"></i>
        `;
        
        // Gestionnaire de fermeture
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.onclick = (e) => {
            e.stopPropagation();
            this.remove(toast);
        };
        
        // Fermeture au clic sur le toast
        toast.onclick = () => this.remove(toast);
        
        // Pause au survol
        toast.onmouseenter = () => {
            if (toast.timeoutId) {
                clearTimeout(toast.timeoutId);
            }
        };
        
        toast.onmouseleave = () => {
            toast.timeoutId = setTimeout(() => {
                this.remove(toast);
            }, 2000);
        };
        
        return toast;
    }

    remove(toast) {
        if (!toast || !toast.parentNode) return;
        
        // Supprimer de la liste
        const index = this.notifications.indexOf(toast);
        if (index > -1) {
            this.notifications.splice(index, 1);
        }
        
        // Annuler le timeout
        if (toast.timeoutId) {
            clearTimeout(toast.timeoutId);
        }
        
        // Animation de sortie
        toast.style.transform = 'translateX(100%)';
        toast.style.opacity = '0';
        
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }

    clear() {
        const toasts = [...this.notifications];
        toasts.forEach(toast => this.remove(toast));
    }

    // Méthodes de convenance
    success(message, duration = 4000) {
        return this.show(message, 'success', duration);
    }

    error(message, duration = 6000) {
        return this.show(message, 'error', duration);
    }

    warning(message, duration = 5000) {
        return this.show(message, 'warning', duration);
    }

    info(message, duration = 4000) {
        return this.show(message, 'info', duration);
    }
}

// Instance globale
const toastManager = new ToastManager();

// Fonction globale pour compatibilité
function showToast(message, type = 'info', duration = 4000) {
    return toastManager.show(message, type, duration);
}

// Export pour utilisation dans d'autres modules
window.toastManager = toastManager;
window.showToast = showToast;
