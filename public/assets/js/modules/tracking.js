/**
 * Module Tracking
 * Gère le suivi des commandes
 */
import api from '../core/api.js';
import toast from '../components/toast.js';
import modal from '../components/modal.js';
import auth from './auth.js';

class Tracking {
  constructor() {
    this.recentOrders = [];
    this.currentOrder = null;
    this.isInitialized = false;
  }

  /**
   * Initialise le module tracking
   */
  async init() {
    try {
      console.log('🔍 Initialisation du module tracking...');
      
      // Charger les commandes récentes
      await this.loadRecentOrders();
      
      // Initialiser les événements
      this.initEvents();
      
      // Initialiser les modales
      this.initModals();
      
      this.isInitialized = true;
      console.log('✅ Module tracking initialisé');
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation du module tracking:', error);
      toast.error('Erreur lors du chargement du suivi');
    }
  }

  /**
   * Charge les commandes récentes
   */
  async loadRecentOrders() {
    try {
      const response = await api.get('/orders/recent?limit=6');
      const orders = response.data || [];
      
      this.recentOrders = orders;
      this.renderRecentOrders();
      this.updateOrdersCount();
      
    } catch (error) {
      console.error('Erreur lors du chargement des commandes récentes:', error);
      // Utiliser des données de démonstration
      this.loadDemoOrders();
    }
  }

  /**
   * Charge des commandes de démonstration
   */
  loadDemoOrders() {
    this.recentOrders = [
      {
        id: 'ORD-001',
        customer_name: 'Jean Dupont',
        service_name: 'Nettoyage à sec',
        status: 'completed',
        created_at: '2024-01-15T10:30:00Z',
        delivery_date: '2024-01-17T16:00:00Z',
        total_amount: 30.00
      },
      {
        id: 'ORD-002',
        customer_name: 'Marie Martin',
        service_name: 'Repassage',
        status: 'in_progress',
        created_at: '2024-01-15T11:15:00Z',
        delivery_date: '2024-01-16T14:00:00Z',
        total_amount: 8.00
      },
      {
        id: 'ORD-003',
        customer_name: 'Pierre Durand',
        service_name: 'Lavage + Repassage',
        status: 'pending',
        created_at: '2024-01-15T12:00:00Z',
        delivery_date: '2024-01-18T12:00:00Z',
        total_amount: 36.00
      },
      {
        id: 'ORD-004',
        customer_name: 'Sophie Bernard',
        service_name: 'Retouche',
        status: 'completed',
        created_at: '2024-01-14T15:45:00Z',
        delivery_date: '2024-01-16T10:00:00Z',
        total_amount: 25.00
      }
    ];
    
    this.renderRecentOrders();
    this.updateOrdersCount();
  }

  /**
   * Affiche les commandes récentes
   */
  renderRecentOrders() {
    const grid = document.getElementById('recentOrdersGrid');
    if (!grid) return;

    if (this.recentOrders.length === 0) {
      grid.innerHTML = `
        <div class="orders-empty">
          <div class="orders-empty-content">
            <i class="fas fa-inbox"></i>
            <p>Aucune commande récente</p>
            <button class="btn btn-primary btn-sm" data-action="new-order">
              Créer une commande
            </button>
          </div>
        </div>
      `;
      return;
    }

    grid.innerHTML = this.recentOrders.map(order => `
      <div class="order-card" data-order-id="${order.id}">
        <div class="order-card-header">
          <div class="order-card-title">
            <h3>${order.id}</h3>
            <span class="status-badge status-badge--${this.getStatusClass(order.status)}">
              ${this.getStatusLabel(order.status)}
            </span>
          </div>
          <div class="order-card-amount">
            ${order.total_amount.toFixed(2)}€
          </div>
        </div>
        <div class="order-card-body">
          <div class="order-info">
            <div class="order-customer">
              <i class="fas fa-user"></i>
              <span>${order.customer_name}</span>
            </div>
            <div class="order-service">
              <i class="fas fa-tshirt"></i>
              <span>${order.service_name}</span>
            </div>
            <div class="order-date">
              <i class="fas fa-calendar"></i>
              <span>${this.formatDate(order.created_at)}</span>
            </div>
          </div>
        </div>
        <div class="order-card-footer">
          <button class="btn btn-sm btn-secondary" data-action="view-order" data-order-id="${order.id}">
            <i class="fas fa-eye"></i>
            <span>Voir</span>
          </button>
          <button class="btn btn-sm btn-primary" data-action="track-order" data-order-id="${order.id}">
            <i class="fas fa-search"></i>
            <span>Suivre</span>
          </button>
        </div>
      </div>
    `).join('');
  }

  /**
   * Met à jour le compteur de commandes
   */
  updateOrdersCount() {
    const countElement = document.getElementById('recentOrdersCount');
    if (countElement) {
      countElement.textContent = `${this.recentOrders.length} commande(s)`;
    }
  }

  /**
   * Recherche une commande
   */
  async searchOrder() {
    const searchInput = document.getElementById('trackingSearch');
    const searchByPhone = document.getElementById('searchByPhone').checked;
    const searchByEmail = document.getElementById('searchByEmail').checked;
    
    if (!searchInput || !searchInput.value.trim()) {
      toast.error('Veuillez entrer un terme de recherche');
      return;
    }

    const query = searchInput.value.trim();
    
    try {
      const params = new URLSearchParams({
        q: query,
        by_phone: searchByPhone,
        by_email: searchByEmail
      });

      const response = await api.get(`/orders/search?${params}`);
      const orders = response.data || [];
      
      if (orders.length === 0) {
        toast.info('Aucune commande trouvée');
        return;
      }
      
      if (orders.length === 1) {
        // Afficher directement le suivi de la commande
        await this.showOrderTracking(orders[0].id);
      } else {
        // Afficher les résultats dans une modale
        this.showSearchResults(orders);
      }
      
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      toast.error('Erreur lors de la recherche');
    }
  }

  /**
   * Affiche les résultats de recherche
   */
  showSearchResults(orders) {
    const content = `
      <div class="search-results">
        <h3>Résultats de recherche (${orders.length})</h3>
        <div class="search-results-list">
          ${orders.map(order => `
            <div class="search-result-item" data-order-id="${order.id}">
              <div class="search-result-info">
                <div class="search-result-title">
                  <strong>${order.id}</strong>
                  <span class="status-badge status-badge--${this.getStatusClass(order.status)}">
                    ${this.getStatusLabel(order.status)}
                  </span>
                </div>
                <div class="search-result-details">
                  <span>${order.customer_name}</span>
                  <span>${order.service_name}</span>
                  <span>${order.total_amount.toFixed(2)}€</span>
                </div>
              </div>
              <button class="btn btn-sm btn-primary" data-action="track-order" data-order-id="${order.id}">
                Suivre
              </button>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    modal.updateContent('orderDetailsModal', content);
    modal.open('orderDetailsModal');
  }

  /**
   * Affiche le suivi d'une commande
   */
  async showOrderTracking(orderId) {
    try {
      const response = await api.get(`/orders/${orderId}/tracking`);
      const order = response.data;
      
      this.currentOrder = order;
      this.renderOrderSummary(order);
      this.renderTrackingTimeline(order);
      
      // Afficher la section de suivi
      document.getElementById('trackingTimeline').style.display = 'block';
      
      // Scroll vers la section de suivi
      document.getElementById('trackingTimeline').scrollIntoView({ 
        behavior: 'smooth' 
      });
      
    } catch (error) {
      console.error('Erreur lors du chargement du suivi:', error);
      toast.error('Erreur lors du chargement du suivi');
    }
  }

  /**
   * Affiche le résumé de la commande
   */
  renderOrderSummary(order) {
    const summary = document.getElementById('orderSummary');
    if (!summary) return;

    summary.innerHTML = `
      <div class="order-summary-content">
        <div class="order-summary-header">
          <h3>Commande ${order.id}</h3>
          <span class="status-badge status-badge--${this.getStatusClass(order.status)}">
            ${this.getStatusLabel(order.status)}
          </span>
        </div>
        <div class="order-summary-details">
          <div class="order-summary-item">
            <span class="order-summary-label">Client :</span>
            <span class="order-summary-value">${order.customer_name}</span>
          </div>
          <div class="order-summary-item">
            <span class="order-summary-label">Service :</span>
            <span class="order-summary-value">${order.service_name}</span>
          </div>
          <div class="order-summary-item">
            <span class="order-summary-label">Montant :</span>
            <span class="order-summary-value">${order.total_amount.toFixed(2)}€</span>
          </div>
          <div class="order-summary-item">
            <span class="order-summary-label">Livraison prévue :</span>
            <span class="order-summary-value">${this.formatDate(order.delivery_date)}</span>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Affiche la timeline de suivi
   */
  renderTrackingTimeline(order) {
    const timeline = document.getElementById('trackingTimelineContent');
    if (!timeline) return;

    const events = order.tracking_events || this.getDemoTrackingEvents(order.status);

    timeline.innerHTML = `
      <div class="timeline-container">
        ${events.map((event, index) => `
          <div class="timeline-item ${event.completed ? 'is-completed' : ''}">
            <div class="timeline-marker">
              <i class="fas ${this.getTimelineIcon(event.type)}"></i>
            </div>
            <div class="timeline-content">
              <div class="timeline-header">
                <h4>${event.title}</h4>
                <span class="timeline-time">${this.formatDate(event.timestamp)}</span>
              </div>
              <p class="timeline-description">${event.description}</p>
              ${event.notes ? `<div class="timeline-notes">${event.notes}</div>` : ''}
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  /**
   * Génère des événements de suivi de démonstration
   */
  getDemoTrackingEvents(status) {
    const baseEvents = [
      {
        type: 'reception',
        title: 'Commande reçue',
        description: 'La commande a été enregistrée dans le système',
        timestamp: '2024-01-15T10:30:00Z',
        completed: true,
        notes: 'Commande créée par l\'employé'
      },
      {
        type: 'processing',
        title: 'En cours de traitement',
        description: 'Les vêtements sont en cours de traitement',
        timestamp: '2024-01-15T11:00:00Z',
        completed: status !== 'pending',
        notes: 'Début du traitement'
      },
      {
        type: 'washing',
        title: 'Lavage/Nettoyage',
        description: 'Les vêtements sont en cours de lavage ou nettoyage',
        timestamp: '2024-01-15T14:00:00Z',
        completed: status === 'completed' || status === 'in_progress',
        notes: 'Utilisation de produits professionnels'
      },
      {
        type: 'ironing',
        title: 'Repassage',
        description: 'Les vêtements sont en cours de repassage',
        timestamp: '2024-01-16T09:00:00Z',
        completed: status === 'completed',
        notes: 'Repassage soigneux effectué'
      },
      {
        type: 'quality',
        title: 'Contrôle qualité',
        description: 'Contrôle final de la qualité',
        timestamp: '2024-01-16T15:00:00Z',
        completed: status === 'completed',
        notes: 'Vérification terminée'
      },
      {
        type: 'ready',
        title: 'Prêt pour livraison',
        description: 'La commande est prête pour la livraison',
        timestamp: '2024-01-17T10:00:00Z',
        completed: status === 'completed',
        notes: 'Emballage effectué'
      }
    ];

    return baseEvents;
  }

  /**
   * Retourne l'icône pour un type d'événement
   */
  getTimelineIcon(type) {
    const icons = {
      'reception': 'fa-clipboard-check',
      'processing': 'fa-cogs',
      'washing': 'fa-tshirt',
      'ironing': 'fa-fire',
      'quality': 'fa-search',
      'ready': 'fa-check-circle',
      'delivery': 'fa-truck'
    };
    return icons[type] || 'fa-circle';
  }

  /**
   * Initialise les événements
   */
  initEvents() {
    // Recherche
    document.querySelectorAll('[data-action="search-order"]').forEach(button => {
      button.addEventListener('click', () => this.searchOrder());
    });

    // Recherche par Entrée
    const searchInput = document.getElementById('trackingSearch');
    if (searchInput) {
      searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.searchOrder();
        }
      });
    }

    // Actions sur les commandes
    document.addEventListener('click', (e) => {
      if (e.target.matches('[data-action="track-order"]')) {
        const orderId = e.target.dataset.orderId;
        this.showOrderTracking(orderId);
      } else if (e.target.matches('[data-action="view-order"]')) {
        const orderId = e.target.dataset.orderId;
        this.viewOrder(orderId);
      } else if (e.target.matches('[data-action="refresh-orders"]')) {
        this.refreshOrders();
      } else if (e.target.matches('[data-action="close-tracking"]')) {
        this.closeTracking();
      } else if (e.target.matches('[data-action="new-order"]')) {
        window.location.href = '/orders/new';
      } else if (e.target.matches('[data-action="bulk-update"]')) {
        this.bulkUpdate();
      }
    });
  }

  /**
   * Initialise les modales
   */
  initModals() {
    const orderDetailsModal = document.getElementById('orderDetailsModal');
    if (orderDetailsModal) {
      modal.init(orderDetailsModal);
    }
  }

  /**
   * Affiche les détails d'une commande
   */
  async viewOrder(orderId) {
    try {
      const response = await api.get(`/orders/${orderId}`);
      const order = response.data;
      
      this.renderOrderDetails(order);
      modal.open('orderDetailsModal');
      
    } catch (error) {
      console.error('Erreur lors du chargement des détails:', error);
      toast.error('Erreur lors du chargement des détails');
    }
  }

  /**
   * Affiche les détails d'une commande
   */
  renderOrderDetails(order) {
    const content = document.getElementById('orderDetailsContent');
    if (!content) return;

    content.innerHTML = `
      <div class="order-details">
        <div class="order-details-header">
          <div class="order-details-title">
            <h3>Commande ${order.id}</h3>
            <span class="status-badge status-badge--${this.getStatusClass(order.status)}">
              ${this.getStatusLabel(order.status)}
            </span>
          </div>
        </div>
        <div class="order-details-content">
          <div class="order-section">
            <h4>Informations client</h4>
            <div class="order-info-grid">
              <div class="order-info-item">
                <span class="order-info-label">Nom :</span>
                <span class="order-info-value">${order.customer_name}</span>
              </div>
              <div class="order-info-item">
                <span class="order-info-label">Téléphone :</span>
                <span class="order-info-value">${order.customer_phone}</span>
              </div>
            </div>
          </div>
          <div class="order-section">
            <h4>Détails de la commande</h4>
            <div class="order-info-grid">
              <div class="order-info-item">
                <span class="order-info-label">Service :</span>
                <span class="order-info-value">${order.service_name}</span>
              </div>
              <div class="order-info-item">
                <span class="order-info-label">Montant :</span>
                <span class="order-info-value">${order.total_amount.toFixed(2)}€</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Rafraîchit les commandes
   */
  async refreshOrders() {
    await this.loadRecentOrders();
    toast.success('Liste mise à jour');
  }

  /**
   * Ferme la section de suivi
   */
  closeTracking() {
    document.getElementById('trackingTimeline').style.display = 'none';
    this.currentOrder = null;
  }

  /**
   * Mise à jour en lot
   */
  bulkUpdate() {
    toast.info('Fonctionnalité de mise à jour en lot en cours de développement');
  }

  /**
   * Retourne la classe CSS du statut
   */
  getStatusClass(status) {
    const statusClasses = {
      'pending': 'warning',
      'in_progress': 'info',
      'completed': 'success',
      'cancelled': 'danger'
    };
    return statusClasses[status] || 'default';
  }

  /**
   * Retourne le libellé du statut
   */
  getStatusLabel(status) {
    const statusLabels = {
      'pending': 'En attente',
      'in_progress': 'En cours',
      'completed': 'Terminé',
      'cancelled': 'Annulé'
    };
    return statusLabels[status] || status;
  }

  /**
   * Formate une date
   */
  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}

// Créer et exporter une instance
const tracking = new Tracking();

export default tracking; 