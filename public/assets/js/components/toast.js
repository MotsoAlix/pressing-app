// Toast Component - ManohPressing Pro

export class Toast {
    static container = null;
    static toasts = [];

    static init() {
        if (!this.container) {
            this.container = document.getElementById('toast-container');
            if (!this.container) {
                this.container = document.createElement('div');
                this.container.id = 'toast-container';
                this.container.className = 'toast-container';
                document.body.appendChild(this.container);
            }
        }
    }

    static show(options) {
        this.init();

        const toast = this.createToast(options);
        this.container.appendChild(toast);
        this.toasts.push(toast);

        // Animate in
        requestAnimationFrame(() => {
            toast.classList.add('toast-enter');
        });

        // Auto remove
        if (options.duration !== 0) {
            setTimeout(() => {
                this.hide(toast);
            }, options.duration || 5000);
        }

        return toast;
    }

    static hide(toast) {
        if (!toast) return;

        toast.classList.add('toast-exit');
        
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
            
            const index = this.toasts.indexOf(toast);
            if (index > -1) {
                this.toasts.splice(index, 1);
            }
        }, 300);
    }

    static hideAll() {
        this.toasts.forEach(toast => this.hide(toast));
    }

    static createToast(options) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${options.type || 'info'}`;
        
        const icon = this.getIcon(options.type);
        const title = options.title || '';
        const message = options.message || '';

        toast.innerHTML = `
            <div class="toast-icon">
                <i class="${icon}"></i>
            </div>
            <div class="toast-content">
                ${title ? `<div class="toast-title">${title}</div>` : ''}
                ${message ? `<div class="toast-message">${message}</div>` : ''}
            </div>
            <button class="toast-close" onclick="Toast.hide(this.parentElement)">
                <i class="fas fa-times"></i>
            </button>
        `;

        // Add click to dismiss
        toast.addEventListener('click', (e) => {
            if (!e.target.closest('.toast-close')) {
                this.hide(toast);
            }
        });

        return toast;
    }

    static getIcon(type) {
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle',
            loading: 'fas fa-spinner fa-spin'
        };
        return icons[type] || icons.info;
    }

    // Convenience methods
    static success(title, message, duration = 5000) {
        return this.show({ type: 'success', title, message, duration });
    }

    static error(title, message, duration = 5000) {
        return this.show({ type: 'error', title, message, duration });
    }

    static warning(title, message, duration = 5000) {
        return this.show({ type: 'warning', title, message, duration });
    }

    static info(title, message, duration = 5000) {
        return this.show({ type: 'info', title, message, duration });
    }

    static loading(title, message) {
        return this.show({ type: 'loading', title, message, duration: 0 });
    }
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    Toast.init();
}); 