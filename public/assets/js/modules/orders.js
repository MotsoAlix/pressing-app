/**
 * Module Orders
 * Gère la gestion des commandes
 */
import api from '../core/api.js';
import toast from '../components/toast.js';
import modal from '../components/modal.js';
import auth from './auth.js';

class Orders {
  constructor() {
    this.orders = [];
    this.currentPage = 1;
    this.itemsPerPage = 10;
    this.totalItems = 0;
    this.filters = {
      status: '',
      service: '',
      date: '',
      sort: 'created_at_desc',
      search: ''
    };
    this.isInitialized = false;
  }

  /**
   * Initialise le module orders
   */
  async init() {
    try {
      console.log('📦 Initialisation du module orders...');
      
      // Charger les données initiales
      await this.loadOrders();
      
      // Charger les données pour les formulaires
      await this.loadFormData();
      
      // Initialiser les événements
      this.initEvents();
      
      // Initialiser les modales
      this.initModals();
      
      this.isInitialized = true;
      console.log('✅ Module orders initialisé');
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation du module orders:', error);
      toast.error('Erreur lors du chargement des commandes');
    }
  }

  /**
   * Charge la liste des commandes
   */
  async loadOrders() {
    try {
      const params = new URLSearchParams({
        page: this.currentPage,
        limit: this.itemsPerPage,
        ...this.filters
      });

      const response = await api.get(`/orders?${params}`);
      const data = response.data || { orders: [], total: 0 };
      
      this.orders = data.orders;
      this.totalItems = data.total;
      
      this.renderOrders();
      this.updatePagination();
      this.updateOrdersCount();
      
    } catch (error) {
      console.error('Erreur lors du chargement des commandes:', error);
      // Utiliser des données de démonstration
      this.loadDemoOrders();
    }
  }

  /**
   * Charge des commandes de démonstration
   */
  loadDemoOrders() {
    this.orders = [
      {
        id: 'ORD-001',
        customer_name: 'Jean Dupont',
        customer_phone: '06 12 34 56 78',
        customer_email: 'jean.dupont@email.com',
        service_name: 'Nettoyage à sec',
        service_price: 15.00,
        quantity: 2,
        total_amount: 30.00,
        status: 'completed',
        created_at: '2024-01-15T10:30:00Z',
        delivery_date: '2024-01-17T16:00:00Z',
        notes: 'Chemise blanche et pantalon noir'
      },
      {
        id: 'ORD-002',
        customer_name: 'Marie Martin',
        customer_phone: '06 98 76 54 32',
        customer_email: 'marie.martin@email.com',
        service_name: 'Repassage',
        service_price: 8.00,
        quantity: 1,
        total_amount: 8.00,
        status: 'in_progress',
        created_at: '2024-01-15T11:15:00Z',
        delivery_date: '2024-01-16T14:00:00Z',
        notes: 'Robe de soirée - fragile'
      },
      {
        id: 'ORD-003',
        customer_name: 'Pierre Durand',
        customer_phone: '06 55 44 33 22',
        customer_email: 'pierre.durand@email.com',
        service_name: 'Lavage + Repassage',
        service_price: 12.00,
        quantity: 3,
        total_amount: 36.00,
        status: 'pending',
        created_at: '2024-01-15T12:00:00Z',
        delivery_date: '2024-01-18T12:00:00Z',
        notes: 'Vêtements de travail'
      }
    ];
    
    this.totalItems = this.orders.length;
    this.renderOrders();
    this.updateOrdersCount();
  }

  /**
   * Affiche les commandes dans le tableau
   */
  renderOrders() {
    const tbody = document.getElementById('ordersTableBody');
    if (!tbody) return;

    if (this.orders.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="9" class="table-empty">
            <div class="table-empty-content">
              <i class="fas fa-inbox"></i>
              <p>Aucune commande trouvée</p>
              <button class="btn btn-primary btn-sm" data-action="new-order">
                Créer une commande
              </button>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = this.orders.map(order => `
      <tr data-order-id="${order.id}">
        <td>
          <label class="table-checkbox">
            <input type="checkbox" class="order-checkbox" value="${order.id}">
            <span class="table-checkbox-mark"></span>
          </label>
        </td>
        <td>
          <div class="table-cell-primary">
            <strong>#${order.id}</strong>
          </div>
        </td>
        <td>
          <div class="table-cell-primary">
            <div class="customer-info">
              <div class="customer-name">${order.customer_name}</div>
              <div class="customer-phone">${order.customer_phone}</div>
            </div>
          </div>
        </td>
        <td>
          <span class="service-badge">${order.service_name}</span>
        </td>
        <td>
          <span class="status-badge status-badge--${this.getStatusClass(order.status)}">
            ${this.getStatusLabel(order.status)}
          </span>
        </td>
        <td>
          <div class="table-cell-secondary">
            ${this.formatDate(order.created_at)}
          </div>
        </td>
        <td>
          <div class="table-cell-secondary">
            ${order.delivery_date ? this.formatDate(order.delivery_date) : '-'}
          </div>
        </td>
        <td>
          <div class="table-cell-primary">
            <strong>${order.total_amount.toFixed(2)}€</strong>
          </div>
        </td>
        <td>
          <div class="table-actions">
            <button class="btn btn-sm btn-secondary" data-action="view-order" data-order-id="${order.id}" title="Voir les détails">
              <i class="fas fa-eye"></i>
            </button>
            <button class="btn btn-sm btn-primary" data-action="edit-order" data-order-id="${order.id}" title="Modifier">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-sm btn-danger" data-action="delete-order" data-order-id="${order.id}" title="Supprimer">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  /**
   * Met à jour le compteur de commandes
   */
  updateOrdersCount() {
    const countElement = document.getElementById('ordersCount');
    if (countElement) {
      countElement.textContent = `${this.totalItems} commande(s)`;
    }
  }

  /**
   * Met à jour la pagination
   */
  updatePagination() {
    const pagination = document.getElementById('pagination');
    const paginationInfo = document.getElementById('paginationInfo');
    const paginationPages = document.getElementById('paginationPages');
    const prevButton = document.querySelector('[data-action="prev-page"]');
    const nextButton = document.querySelector('[data-action="next-page"]');

    if (!pagination || this.totalItems <= this.itemsPerPage) {
      if (pagination) pagination.style.display = 'none';
      return;
    }

    pagination.style.display = 'flex';

    const totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
    const startItem = (this.currentPage - 1) * this.itemsPerPage + 1;
    const endItem = Math.min(this.currentPage * this.itemsPerPage, this.totalItems);

    // Mettre à jour les informations
    if (paginationInfo) {
      paginationInfo.textContent = `Affichage de ${startItem} à ${endItem} sur ${this.totalItems} résultats`;
    }

    // Mettre à jour les boutons de navigation
    if (prevButton) {
      prevButton.disabled = this.currentPage === 1;
    }
    if (nextButton) {
      nextButton.disabled = this.currentPage === totalPages;
    }

    // Générer les pages
    if (paginationPages) {
      this.renderPaginationPages(paginationPages, totalPages);
    }
  }

  /**
   * Affiche les pages de pagination
   */
  renderPaginationPages(container, totalPages) {
    const pages = [];
    const currentPage = this.currentPage;

    // Ajouter la première page
    if (currentPage > 3) {
      pages.push('<button class="pagination-page" data-page="1">1</button>');
      if (currentPage > 4) {
        pages.push('<span class="pagination-ellipsis">...</span>');
      }
    }

    // Ajouter les pages autour de la page courante
    for (let i = Math.max(1, currentPage - 2); i <= Math.min(totalPages, currentPage + 2); i++) {
      const isActive = i === currentPage;
      pages.push(`<button class="pagination-page ${isActive ? 'is-active' : ''}" data-page="${i}">${i}</button>`);
    }

    // Ajouter la dernière page
    if (currentPage < totalPages - 2) {
      if (currentPage < totalPages - 3) {
        pages.push('<span class="pagination-ellipsis">...</span>');
      }
      pages.push(`<button class="pagination-page" data-page="${totalPages}">${totalPages}</button>`);
    }

    container.innerHTML = pages.join('');
  }

  /**
   * Charge les données pour les formulaires
   */
  async loadFormData() {
    try {
      // Charger les clients
      const customersResponse = await api.get('/customers');
      const customers = customersResponse.data || [];
      this.populateCustomerSelect(customers);

      // Charger les services
      const servicesResponse = await api.get('/services');
      const services = servicesResponse.data || [];
      this.populateServiceSelect(services);

    } catch (error) {
      console.error('Erreur lors du chargement des données de formulaire:', error);
      // Utiliser des données de démonstration
      this.loadDemoFormData();
    }
  }

  /**
   * Remplit le select des clients
   */
  populateCustomerSelect(customers) {
    const select = document.getElementById('customerSelect');
    if (!select) return;

    const options = customers.map(customer => 
      `<option value="${customer.id}">${customer.name} - ${customer.phone}</option>`
    ).join('');

    select.innerHTML = '<option value="">Sélectionner un client</option>' + options;
  }

  /**
   * Remplit le select des services
   */
  populateServiceSelect(services) {
    const select = document.getElementById('serviceSelect');
    if (!select) return;

    const options = services.map(service => 
      `<option value="${service.id}" data-price="${service.price}">${service.name} - ${service.price}€</option>`
    ).join('');

    select.innerHTML = '<option value="">Sélectionner un service</option>' + options;
  }

  /**
   * Charge des données de démonstration pour les formulaires
   */
  loadDemoFormData() {
    const demoCustomers = [
      { id: 1, name: 'Jean Dupont', phone: '06 12 34 56 78' },
      { id: 2, name: 'Marie Martin', phone: '06 98 76 54 32' },
      { id: 3, name: 'Pierre Durand', phone: '06 55 44 33 22' }
    ];

    const demoServices = [
      { id: 1, name: 'Nettoyage à sec', price: 15.00 },
      { id: 2, name: 'Repassage', price: 8.00 },
      { id: 3, name: 'Lavage + Repassage', price: 12.00 },
      { id: 4, name: 'Retouche', price: 20.00 }
    ];

    this.populateCustomerSelect(demoCustomers);
    this.populateServiceSelect(demoServices);
  }

  /**
   * Initialise les événements
   */
  initEvents() {
    // Filtres
    document.querySelectorAll('[data-action="apply-filters"]').forEach(button => {
      button.addEventListener('click', () => this.applyFilters());
    });

    document.querySelectorAll('[data-action="clear-filters"]').forEach(button => {
      button.addEventListener('click', () => this.clearFilters());
    });

    // Recherche
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
      searchInput.addEventListener('input', this.debounce(() => this.handleSearch(), 300));
    }

    // Pagination
    document.addEventListener('click', (e) => {
      if (e.target.matches('[data-action="prev-page"]')) {
        this.goToPage(this.currentPage - 1);
      } else if (e.target.matches('[data-action="next-page"]')) {
        this.goToPage(this.currentPage + 1);
      } else if (e.target.matches('.pagination-page')) {
        const page = parseInt(e.target.dataset.page);
        this.goToPage(page);
      }
    });

    // Actions sur les commandes
    document.addEventListener('click', (e) => {
      if (e.target.matches('[data-action="new-order"]')) {
        this.showNewOrderModal();
      } else if (e.target.matches('[data-action="view-order"]')) {
        const orderId = e.target.dataset.orderId;
        this.viewOrder(orderId);
      } else if (e.target.matches('[data-action="edit-order"]')) {
        const orderId = e.target.dataset.orderId;
        this.editOrder(orderId);
      } else if (e.target.matches('[data-action="delete-order"]')) {
        const orderId = e.target.dataset.orderId;
        this.deleteOrder(orderId);
      } else if (e.target.matches('[data-action="refresh-orders"]')) {
        this.refreshOrders();
      } else if (e.target.matches('[data-action="export-orders"]')) {
        this.exportOrders();
      }
    });

    // Sélection multiple
    const selectAllCheckbox = document.getElementById('selectAll');
    if (selectAllCheckbox) {
      selectAllCheckbox.addEventListener('change', (e) => {
        const checkboxes = document.querySelectorAll('.order-checkbox');
        checkboxes.forEach(checkbox => {
          checkbox.checked = e.target.checked;
        });
      });
    }

    // Calcul automatique du montant
    const serviceSelect = document.getElementById('serviceSelect');
    const quantityInput = document.getElementById('quantity');
    const totalAmountInput = document.getElementById('totalAmount');

    if (serviceSelect && quantityInput && totalAmountInput) {
      const calculateTotal = () => {
        const selectedOption = serviceSelect.selectedOptions[0];
        const quantity = parseInt(quantityInput.value) || 0;
        
        if (selectedOption && selectedOption.dataset.price) {
          const price = parseFloat(selectedOption.dataset.price);
          const total = price * quantity;
          totalAmountInput.value = total.toFixed(2);
        } else {
          totalAmountInput.value = '0.00';
        }
      };

      serviceSelect.addEventListener('change', calculateTotal);
      quantityInput.addEventListener('input', calculateTotal);
    }
  }

  /**
   * Initialise les modales
   */
  initModals() {
    // Modal nouvelle commande
    const newOrderModal = document.getElementById('newOrderModal');
    if (newOrderModal) {
      modal.init(newOrderModal);
    }

    // Modal détails commande
    const orderDetailsModal = document.getElementById('orderDetailsModal');
    if (orderDetailsModal) {
      modal.init(orderDetailsModal);
    }
  }

  /**
   * Applique les filtres
   */
  applyFilters() {
    this.filters.status = document.getElementById('statusFilter').value;
    this.filters.service = document.getElementById('serviceFilter').value;
    this.filters.date = document.getElementById('dateFilter').value;
    this.filters.sort = document.getElementById('sortFilter').value;
    
    this.currentPage = 1;
    this.loadOrders();
  }

  /**
   * Efface les filtres
   */
  clearFilters() {
    document.getElementById('statusFilter').value = '';
    document.getElementById('serviceFilter').value = '';
    document.getElementById('dateFilter').value = '';
    document.getElementById('sortFilter').value = 'created_at_desc';
    
    this.filters = {
      status: '',
      service: '',
      date: '',
      sort: 'created_at_desc',
      search: ''
    };
    
    this.currentPage = 1;
    this.loadOrders();
  }

  /**
   * Gère la recherche
   */
  handleSearch() {
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
      this.filters.search = searchInput.value.trim();
      this.currentPage = 1;
      this.loadOrders();
    }
  }

  /**
   * Va à une page spécifique
   */
  goToPage(page) {
    this.currentPage = page;
    this.loadOrders();
  }

  /**
   * Affiche la modale de nouvelle commande
   */
  showNewOrderModal() {
    const modal = document.getElementById('newOrderModal');
    if (modal) {
      modal.classList.add('is-open');
      document.getElementById('newOrderForm').reset();
      document.getElementById('totalAmount').value = '0.00';
    }
  }

  /**
   * Sauvegarde une nouvelle commande
   */
  async saveOrder() {
    try {
      const form = document.getElementById('newOrderForm');
      const formData = new FormData(form);
      const orderData = Object.fromEntries(formData.entries());

      // Validation
      if (!orderData.customer_id || !orderData.service_id) {
        toast.error('Veuillez remplir tous les champs obligatoires');
        return;
      }

      const response = await api.post('/orders', orderData);
      
      toast.success('Commande créée avec succès');
      modal.close('newOrderModal');
      this.loadOrders();
      
    } catch (error) {
      console.error('Erreur lors de la création de la commande:', error);
      toast.error('Erreur lors de la création de la commande');
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
            <h3>Commande #${order.id}</h3>
            <span class="status-badge status-badge--${this.getStatusClass(order.status)}">
              ${this.getStatusLabel(order.status)}
            </span>
          </div>
          <div class="order-details-meta">
            <div class="order-meta-item">
              <span class="order-meta-label">Créée le :</span>
              <span class="order-meta-value">${this.formatDate(order.created_at)}</span>
            </div>
            <div class="order-meta-item">
              <span class="order-meta-label">Livraison prévue :</span>
              <span class="order-meta-value">${order.delivery_date ? this.formatDate(order.delivery_date) : 'Non définie'}</span>
            </div>
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
              <div class="order-info-item">
                <span class="order-info-label">Email :</span>
                <span class="order-info-value">${order.customer_email || '-'}</span>
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
                <span class="order-info-label">Quantité :</span>
                <span class="order-info-value">${order.quantity}</span>
              </div>
              <div class="order-info-item">
                <span class="order-info-label">Prix unitaire :</span>
                <span class="order-info-value">${order.service_price}€</span>
              </div>
              <div class="order-info-item">
                <span class="order-info-label">Montant total :</span>
                <span class="order-info-value order-info-value--total">${order.total_amount}€</span>
              </div>
            </div>
          </div>

          ${order.notes ? `
            <div class="order-section">
              <h4>Notes</h4>
              <div class="order-notes">
                ${order.notes}
              </div>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  /**
   * Modifie une commande
   */
  editOrder(orderId) {
    // Rediriger vers la page d'édition
    window.location.href = `/orders/${orderId}/edit`;
  }

  /**
   * Supprime une commande
   */
  async deleteOrder(orderId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette commande ?')) {
      return;
    }

    try {
      await api.delete(`/orders/${orderId}`);
      toast.success('Commande supprimée avec succès');
      this.loadOrders();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression de la commande');
    }
  }

  /**
   * Rafraîchit la liste des commandes
   */
  async refreshOrders() {
    await this.loadOrders();
    toast.success('Liste mise à jour');
  }

  /**
   * Exporte les commandes
   */
  exportOrders() {
    // Implémenter l'export
    toast.info('Fonctionnalité d\'export en cours de développement');
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

  /**
   * Fonction utilitaire pour debounce
   */
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
}

// Créer et exporter une instance
const orders = new Orders();

export default orders; 