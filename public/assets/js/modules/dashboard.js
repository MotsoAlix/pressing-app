// Dashboard Module - ManohPressing Pro
import { Toast } from '../components/toast.js';

class Dashboard {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeAnimations();
        this.loadDashboardData();
        this.setupRealTimeUpdates();
    }

    setupEventListeners() {
        // Quick action buttons
        const quickActionButtons = document.querySelectorAll('.quick-action-card');
        quickActionButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                this.handleQuickAction(e);
            });
        });

        // Hero action buttons
        const heroButtons = document.querySelectorAll('.hero-actions .btn');
        heroButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                this.handleHeroAction(e);
            });
        });

        // Order action buttons
        const orderButtons = document.querySelectorAll('.order-actions .btn');
        orderButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                this.handleOrderAction(e);
            });
        });

        // Activity items
        const activityItems = document.querySelectorAll('.activity-item');
        activityItems.forEach(item => {
            item.addEventListener('click', (e) => {
                this.handleActivityClick(e);
            });
        });
    }

    initializeAnimations() {
        // Initialize scroll reveal animations
        this.setupScrollReveal();
        
        // Initialize text reveal animations
        this.setupTextReveal();
        
        // Initialize floating animations
        this.setupFloatingAnimations();
        
        // Initialize counter animations
        this.setupCounterAnimations();
    }

    setupScrollReveal() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                }
            });
        }, observerOptions);

        // Observe all scroll reveal elements
        const scrollRevealElements = document.querySelectorAll('.scroll-reveal');
        scrollRevealElements.forEach(element => {
            observer.observe(element);
        });
    }

    setupTextReveal() {
        const textRevealElements = document.querySelectorAll('.text-reveal span');
        textRevealElements.forEach((element, index) => {
            element.style.animationDelay = `${(index + 1) * 100}ms`;
        });
    }

    setupFloatingAnimations() {
        const floatingIcons = document.querySelectorAll('.floating-icon');
        floatingIcons.forEach((icon, index) => {
            icon.style.animationDelay = `${index * 1}s`;
        });
    }

    setupCounterAnimations() {
        const counters = document.querySelectorAll('.stat-card-value');
        counters.forEach(counter => {
            this.animateCounter(counter);
        });
    }

    animateCounter(element) {
        const target = parseInt(element.textContent.replace(/[^\d]/g, ''));
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;

        const timer = setInterval(() => {
            current += step;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            
            // Format the number with commas
            const formatted = current.toLocaleString();
            element.textContent = formatted;
        }, 16);
    }

    loadDashboardData() {
        // Simulate loading dashboard data
        this.updateStats();
        this.updateRecentOrders();
        this.updateActivityFeed();
    }

    updateStats() {
        // Simulate real-time stats updates
        const stats = {
            orders: 1234,
            customers: 567,
            revenue: 12345,
            pending: 23
        };

        // Update stats with animation
        Object.keys(stats).forEach(key => {
            const element = document.getElementById(`total-${key}`);
            if (element) {
                this.animateValue(element, stats[key]);
            }
        });
    }

    updateRecentOrders() {
        // Simulate loading recent orders
        console.log('Loading recent orders...');
    }

    updateActivityFeed() {
        // Simulate loading activity feed
        console.log('Loading activity feed...');
    }

    setupRealTimeUpdates() {
        // Simulate real-time updates every 30 seconds
        setInterval(() => {
            this.updateStats();
        }, 30000);
    }

    handleQuickAction(event) {
        const button = event.currentTarget;
        const title = button.querySelector('.quick-action-title').textContent;
        
        // Add click animation
        button.classList.add('btn-animate');
        
        // Show success feedback
        Toast.show({
            type: 'success',
            title: 'Action rapide',
            message: `${title} - Action en cours...`,
            duration: 3000
        });

        // Navigate based on action
        switch(title) {
            case 'Nouvelle Commande':
                this.navigateTo('/orders/new');
                break;
            case 'Ajouter Client':
                this.navigateTo('/customers/new');
                break;
            case 'Rechercher':
                this.showSearchModal();
                break;
            case 'Rapports':
                this.navigateTo('/reports');
                break;
        }
    }

    handleHeroAction(event) {
        const button = event.currentTarget;
        const text = button.querySelector('span').textContent;
        
        // Add ripple effect
        this.createRippleEffect(button, event);
        
        // Show loading state
        button.classList.add('btn-loading');
        
        // Simulate action
        setTimeout(() => {
            button.classList.remove('btn-loading');
            
            Toast.show({
                type: 'success',
                title: 'Action réussie',
                message: `${text} - Redirection en cours...`,
                duration: 2000
            });
            
            // Navigate
            if (text.includes('Commande')) {
                this.navigateTo('/orders/new');
            } else if (text.includes('Client')) {
                this.navigateTo('/customers/new');
            }
        }, 1000);
    }

    handleOrderAction(event) {
        const button = event.currentTarget;
        const action = button.textContent.trim();
        const orderCard = button.closest('.order-card');
        const orderId = orderCard.querySelector('.order-tracking').textContent;
        
        // Add click animation
        button.classList.add('btn-animate');
        
        Toast.show({
            type: 'info',
            title: 'Action commande',
            message: `${action} pour ${orderId}`,
            duration: 3000
        });
        
        // Simulate action
        setTimeout(() => {
            if (action === 'Livrer') {
                orderCard.style.opacity = '0.5';
                Toast.show({
                    type: 'success',
                    title: 'Commande livrée',
                    message: `${orderId} a été livrée avec succès`,
                    duration: 4000
                });
            }
        }, 1000);
    }

    handleActivityClick(event) {
        const activityItem = event.currentTarget;
        const title = activityItem.querySelector('.activity-title').textContent;
        
        // Add click animation
        activityItem.style.transform = 'scale(0.98)';
        setTimeout(() => {
            activityItem.style.transform = '';
        }, 150);
        
        Toast.show({
            type: 'info',
            title: 'Activité',
            message: `Détails de l'activité: ${title}`,
            duration: 3000
        });
    }

    createRippleEffect(button, event) {
        const ripple = document.createElement('span');
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('ripple');
        
        button.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    animateValue(element, target) {
        const current = parseInt(element.textContent.replace(/[^\d]/g, '')) || 0;
        const increment = (target - current) / 30;
        let value = current;
        
        const timer = setInterval(() => {
            value += increment;
            if ((increment > 0 && value >= target) || (increment < 0 && value <= target)) {
                value = target;
                clearInterval(timer);
            }
            
            // Format based on element type
            if (element.id.includes('revenue')) {
                element.textContent = `€${value.toLocaleString()}`;
            } else {
                element.textContent = value.toLocaleString();
            }
        }, 50);
    }

    navigateTo(path) {
        // Simulate navigation
        console.log(`Navigating to: ${path}`);
        
        // In a real app, this would use the router
        setTimeout(() => {
            window.location.href = path;
        }, 500);
    }

    showSearchModal() {
        Toast.show({
            type: 'info',
            title: 'Recherche',
            message: 'Fonctionnalité de recherche en cours de développement',
            duration: 3000
        });
    }

    // Public methods for external use
    refresh() {
        this.loadDashboardData();
        Toast.show({
            type: 'success',
            title: 'Actualisation',
            message: 'Dashboard actualisé avec succès',
            duration: 2000
        });
    }

    exportData() {
        Toast.show({
            type: 'info',
            title: 'Export',
            message: 'Export des données en cours...',
            duration: 3000
        });
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const dashboard = new Dashboard();
    
    // Make dashboard available globally for debugging
    window.dashboard = dashboard;
});

export default Dashboard; 