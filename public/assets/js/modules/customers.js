/**
 * Module Customers
 * Gère la gestion des clients
 */
import api from '../core/api.js';
import toast from '../components/toast.js';
import modal from '../components/modal.js';
import auth from './auth.js';

class Customers {
  constructor() {
    this.customers = [];
    this.currentPage = 1;
    this.itemsPerPage = 10;
    this.totalItems = 0;
    this.filters = {
      status: '',
      city: '',
      date: '',
      sort: 'name_asc',
      search: ''
    };
    this.isInitialized = false;
  }

  /**
   * Initialise le module customers
   */
  async init() {
    try {
      console.log('👥 Initialisation du module customers...');
      
      // Charger les données initiales
      await this.loadCustomers();
      
      // Charger les statistiques
      await this.loadStats();
      
      // Initialiser les événements
      this.initEvents();
      
      // Initialiser les modales
      this.initModals();
      
      this.isInitialized = true;
      console.log('✅ Module customers initialisé');
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation du module customers:', error);
      toast.error('Erreur lors du chargement des clients');
    }
  }

  /**
   * Charge la liste des clients
   */
  async loadCustomers() {
    try {
      const params = new URLSearchParams({
        page: this.currentPage,
        limit: this.itemsPerPage,
        ...this.filters
      });

      const response = await api.get(`/customers?${params}`);
      const data = response.data || { customers: [], total: 0 };
      
      this.customers = data.customers;
      this.totalItems = data.total;
      
      this.renderCustomers();
      this.updatePagination();
      this.updateCustomersCount();
      
    } catch (error) {
      console.error('Erreur lors du chargement des clients:', error);
      // Utiliser des données de démonstration
      this.loadDemoCustomers();
    }
  }

  /**
   * Charge des clients de démonstration
   */
  loadDemoCustomers() {
    this.customers = [
      {
        id: 1,
        first_name: 'Jean',
        last_name: 'Dupont',
        email: 'jean.dupont@email.com',
        phone: '06 12 34 56 78',
        address: '123 Rue de la Paix',
        city: 'Paris',
        postal_code: '75001',
        status: 'active',
        total_orders: 15,
        total_spent: 450.00,
        last_visit: '2024-01-15T10:30:00Z',
        created_at: '2023-06-15T09:00:00Z',
        notes: 'Client fidèle, préfère le nettoyage à sec'
      },
      {
        id: 2,
        first_name: 'Marie',
        last_name: 'Martin',
        email: 'marie.martin@email.com',
        phone: '06 98 76 54 32',
        address: '456 Avenue des Champs',
        city: 'Lyon',
        postal_code: '69001',
        status: 'vip',
        total_orders: 28,
        total_spent: 1200.00,
        last_visit: '2024-01-14T14:15:00Z',
        created_at: '2023-03-20T11:30:00Z',
        notes: 'Client VIP, commandes régulières'
      },
      {
        id: 3,
        first_name: 'Pierre',
        last_name: 'Durand',
        email: 'pierre.durand@email.com',
        phone: '06 55 44 33 22',
        address: '789 Boulevard de la Mer',
        city: 'Marseille',
        postal_code: '13001',
        status: 'active',
        total_orders: 8,
        total_spent: 240.00,
        last_visit: '2024-01-10T16:45:00Z',
        created_at: '2023-09-10T15:20:00Z',
        notes: 'Nouveau client, satisfait du service'
      }
    ];
    
    this.totalItems = this.customers.length;
    this.renderCustomers();
    this.updateCustomersCount();
  }

  /**
   * Charge les statistiques des clients
   */
  async loadStats() {
    try {
      const response = await api.get('/customers/stats');
      const stats = response.data;
      
      this.updateStatCard('totalCustomers', stats.totalCustomers || 0);
      this.updateStatCard('activeCustomers', stats.activeCustomers || 0);
      this.updateStatCard('avgOrdersPerCustomer', (stats.avgOrdersPerCustomer || 0).toFixed(1));
      this.updateStatCard('newCustomersThisMonth', stats.newCustomersThisMonth || 0);
      
      this.updateStatChange('customersChange', stats.customersChange || 0);
      this.updateStatChange('activeChange', stats.activeChange || 0);
      this.updateStatChange('avgChange', stats.avgChange || 0);
      this.updateStatChange('newChange', stats.newChange || 0);
      
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
      // Utiliser des données de démonstration
      this.loadDemoStats();
    }
  }

  /**
   * Charge des statistiques de démonstration
   */
  loadDemoStats() {
    this.updateStatCard('totalCustomers', 156);
    this.updateStatCard('activeCustomers', 142);
    this.updateStatCard('avgOrdersPerCustomer', '8.5');
    this.updateStatCard('newCustomersThisMonth', 12);
    
    this.updateStatChange('customersChange', 8);
    this.updateStatChange('activeChange', 12);
    this.updateStatChange('avgChange', 5);
    this.updateStatChange('newChange', 25);
  }

  /**
   * Met à jour une carte de statistique
   */
  updateStatCard(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
      element.textContent = value;
    }
  }

  /**
   * Met à jour le pourcentage de changement
   */
  updateStatChange(elementId, change) {
    const element = document.getElementById(elementId);
    if (element) {
      element.textContent = `${change}%`;
      
      const changeElement = element.closest('.stat-card-change');
      if (changeElement) {
        changeElement.classList.remove('stat-card-change--positive', 'stat-card-change--negative');
        if (change > 0) {
          changeElement.classList.add('stat-card-change--positive');
        } else if (change < 0) {
          changeElement.classList.add('stat-card-change--negative');
        }
      }
    }
  }

  /**
   * Affiche les clients dans le tableau
   */
  renderCustomers() {
    const tbody = document.getElementById('customersTableBody');
    if (!tbody) return;

    if (this.customers.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" class="table-empty">
            <div class="table-empty-content">
              <i class="fas fa-users"></i>
              <p>Aucun client trouvé</p>
              <button class="btn btn-primary btn-sm" data-action="new-customer">
                Ajouter un client
              </button>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = this.customers.map(customer => `
      <tr data-customer-id="${customer.id}">
        <td>
          <label class="table-checkbox">
            <input type="checkbox" class="customer-checkbox" value="${customer.id}">
            <span class="table-checkbox-mark"></span>
          </label>
        </td>
        <td>
          <div class="table-cell-primary">
            <div class="customer-info">
              <div class="customer-name">${customer.first_name} ${customer.last_name}</div>
              <div class="customer-id">#${customer.id}</div>
            </div>
          </div>
        </td>
        <td>
          <div class="table-cell-primary">
            <div class="contact-info">
              <div class="contact-email">${customer.email}</div>
              <div class="contact-phone">${customer.phone}</div>
            </div>
          </div>
        </td>
        <td>
          <div class="table-cell-secondary">
            <div class="address-info">
              <div class="address-street">${customer.address}</div>
              <div class="address-city">${customer.city} ${customer.postal_code}</div>
            </div>
          </div>
        </td>
        <td>
          <span class="status-badge status-badge--${this.getStatusClass(customer.status)}">
            ${this.getStatusLabel(customer.status)}
          </span>
        </td>
        <td>
          <div class="table-cell-primary">
            <div class="orders-info">
              <div class="orders-count">${customer.total_orders} commandes</div>
              <div class="orders-total">${customer.total_spent.toFixed(2)}€</div>
            </div>
          </div>
        </td>
        <td>
          <div class="table-cell-secondary">
            ${this.formatDate(customer.last_visit)}
          </div>
        </td>
        <td>
          <div class="table-actions">
            <button class="btn btn-sm btn-secondary" data-action="view-customer" data-customer-id="${customer.id}" title="Voir les détails">
              <i class="fas fa-eye"></i>
            </button>
            <button class="btn btn-sm btn-primary" data-action="edit-customer" data-customer-id="${customer.id}" title="Modifier">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-sm btn-info" data-action="new-order-for-customer" data-customer-id="${customer.id}" title="Nouvelle commande">
              <i class="fas fa-plus"></i>
            </button>
            <button class="btn btn-sm btn-danger" data-action="delete-customer" data-customer-id="${customer.id}" title="Supprimer">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  /**
   * Met à jour le compteur de clients
   */
  updateCustomersCount() {
    const countElement = document.getElementById('customersCount');
    if (countElement) {
      countElement.textContent = `${this.totalItems} client(s)`;
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

    if (paginationInfo) {
      paginationInfo.textContent = `Affichage de ${startItem} à ${endItem} sur ${this.totalItems} résultats`;
    }

    if (prevButton) {
      prevButton.disabled = this.currentPage === 1;
    }
    if (nextButton) {
      nextButton.disabled = this.currentPage === totalPages;
    }

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

    if (currentPage > 3) {
      pages.push('<button class="pagination-page" data-page="1">1</button>');
      if (currentPage > 4) {
        pages.push('<span class="pagination-ellipsis">...</span>');
      }
    }

    for (let i = Math.max(1, currentPage - 2); i <= Math.min(totalPages, currentPage + 2); i++) {
      const isActive = i === currentPage;
      pages.push(`<button class="pagination-page ${isActive ? 'is-active' : ''}" data-page="${i}">${i}</button>`);
    }

    if (currentPage < totalPages - 2) {
      if (currentPage < totalPages - 3) {
        pages.push('<span class="pagination-ellipsis">...</span>');
      }
      pages.push(`<button class="pagination-page" data-page="${totalPages}">${totalPages}</button>`);
    }

    container.innerHTML = pages.join('');
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

    // Actions sur les clients
    document.addEventListener('click', (e) => {
      if (e.target.matches('[data-action="new-customer"]')) {
        this.showNewCustomerModal();
      } else if (e.target.matches('[data-action="view-customer"]')) {
        const customerId = e.target.dataset.customerId;
        this.viewCustomer(customerId);
      } else if (e.target.matches('[data-action="edit-customer"]')) {
        const customerId = e.target.dataset.customerId;
        this.editCustomer(customerId);
      } else if (e.target.matches('[data-action="delete-customer"]')) {
        const customerId = e.target.dataset.customerId;
        this.deleteCustomer(customerId);
      } else if (e.target.matches('[data-action="new-order-for-customer"]')) {
        const customerId = e.target.dataset.customerId;
        this.newOrderForCustomer(customerId);
      } else if (e.target.matches('[data-action="refresh-customers"]')) {
        this.refreshCustomers();
      } else if (e.target.matches('[data-action="export-customers"]')) {
        this.exportCustomers();
      }
    });

    // Sélection multiple
    const selectAllCheckbox = document.getElementById('selectAll');
    if (selectAllCheckbox) {
      selectAllCheckbox.addEventListener('change', (e) => {
        const checkboxes = document.querySelectorAll('.customer-checkbox');
        checkboxes.forEach(checkbox => {
          checkbox.checked = e.target.checked;
        });
      });
    }
  }

  /**
   * Initialise les modales
   */
  initModals() {
    const newCustomerModal = document.getElementById('newCustomerModal');
    const customerDetailsModal = document.getElementById('customerDetailsModal');
    
    if (newCustomerModal) {
      modal.init(newCustomerModal);
    }
    if (customerDetailsModal) {
      modal.init(customerDetailsModal);
    }
  }

  /**
   * Applique les filtres
   */
  applyFilters() {
    this.filters.status = document.getElementById('statusFilter').value;
    this.filters.city = document.getElementById('cityFilter').value;
    this.filters.date = document.getElementById('dateFilter').value;
    this.filters.sort = document.getElementById('sortFilter').value;
    
    this.currentPage = 1;
    this.loadCustomers();
  }

  /**
   * Efface les filtres
   */
  clearFilters() {
    document.getElementById('statusFilter').value = '';
    document.getElementById('cityFilter').value = '';
    document.getElementById('dateFilter').value = '';
    document.getElementById('sortFilter').value = 'name_asc';
    
    this.filters = {
      status: '',
      city: '',
      date: '',
      sort: 'name_asc',
      search: ''
    };
    
    this.currentPage = 1;
    this.loadCustomers();
  }

  /**
   * Gère la recherche
   */
  handleSearch() {
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
      this.filters.search = searchInput.value.trim();
      this.currentPage = 1;
      this.loadCustomers();
    }
  }

  /**
   * Va à une page spécifique
   */
  goToPage(page) {
    this.currentPage = page;
    this.loadCustomers();
  }

  /**
   * Affiche la modale de nouveau client
   */
  showNewCustomerModal() {
    const modal = document.getElementById('newCustomerModal');
    if (modal) {
      modal.classList.add('is-open');
      document.getElementById('newCustomerForm').reset();
    }
  }

  /**
   * Sauvegarde un nouveau client
   */
  async saveCustomer() {
    try {
      const form = document.getElementById('newCustomerForm');
      const formData = new FormData(form);
      const customerData = Object.fromEntries(formData.entries());

      // Validation
      if (!customerData.first_name || !customerData.last_name || !customerData.email || !customerData.phone) {
        toast.error('Veuillez remplir tous les champs obligatoires');
        return;
      }

      const response = await api.post('/customers', customerData);
      
      toast.success('Client créé avec succès');
      modal.close('newCustomerModal');
      this.loadCustomers();
      this.loadStats();
      
    } catch (error) {
      console.error('Erreur lors de la création du client:', error);
      toast.error('Erreur lors de la création du client');
    }
  }

  /**
   * Affiche les détails d'un client
   */
  async viewCustomer(customerId) {
    try {
      const response = await api.get(`/customers/${customerId}`);
      const customer = response.data;
      
      this.renderCustomerDetails(customer);
      modal.open('customerDetailsModal');
      
    } catch (error) {
      console.error('Erreur lors du chargement des détails:', error);
      toast.error('Erreur lors du chargement des détails');
    }
  }

  /**
   * Affiche les détails d'un client
   */
  renderCustomerDetails(customer) {
    const content = document.getElementById('customerDetailsContent');
    if (!content) return;

    content.innerHTML = `
      <div class="customer-details">
        <div class="customer-details-header">
          <div class="customer-details-title">
            <h3>${customer.first_name} ${customer.last_name}</h3>
            <span class="status-badge status-badge--${this.getStatusClass(customer.status)}">
              ${this.getStatusLabel(customer.status)}
            </span>
          </div>
          <div class="customer-details-meta">
            <div class="customer-meta-item">
              <span class="customer-meta-label">Client depuis :</span>
              <span class="customer-meta-value">${this.formatDate(customer.created_at)}</span>
            </div>
            <div class="customer-meta-item">
              <span class="customer-meta-label">Dernière visite :</span>
              <span class="customer-meta-value">${this.formatDate(customer.last_visit)}</span>
            </div>
          </div>
        </div>

        <div class="customer-details-content">
          <div class="customer-section">
            <h4>Informations de contact</h4>
            <div class="customer-info-grid">
              <div class="customer-info-item">
                <span class="customer-info-label">Email :</span>
                <span class="customer-info-value">${customer.email}</span>
              </div>
              <div class="customer-info-item">
                <span class="customer-info-label">Téléphone :</span>
                <span class="customer-info-value">${customer.phone}</span>
              </div>
              <div class="customer-info-item">
                <span class="customer-info-label">Adresse :</span>
                <span class="customer-info-value">${customer.address}</span>
              </div>
              <div class="customer-info-item">
                <span class="customer-info-label">Ville :</span>
                <span class="customer-info-value">${customer.city} ${customer.postal_code}</span>
              </div>
            </div>
          </div>

          <div class="customer-section">
            <h4>Statistiques</h4>
            <div class="customer-info-grid">
              <div class="customer-info-item">
                <span class="customer-info-label">Total commandes :</span>
                <span class="customer-info-value">${customer.total_orders}</span>
              </div>
              <div class="customer-info-item">
                <span class="customer-info-label">Montant total :</span>
                <span class="customer-info-value customer-info-value--total">${customer.total_spent.toFixed(2)}€</span>
              </div>
              <div class="customer-info-item">
                <span class="customer-info-label">Moyenne par commande :</span>
                <span class="customer-info-value">${(customer.total_spent / customer.total_orders).toFixed(2)}€</span>
              </div>
            </div>
          </div>

          ${customer.notes ? `
            <div class="customer-section">
              <h4>Notes</h4>
              <div class="customer-notes">
                ${customer.notes}
              </div>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  /**
   * Modifie un client
   */
  editCustomer(customerId) {
    // Rediriger vers la page d'édition
    window.location.href = `/customers/${customerId}/edit`;
  }

  /**
   * Crée une nouvelle commande pour un client
   */
  newOrderForCustomer(customerId) {
    // Rediriger vers la page de nouvelle commande avec le client pré-sélectionné
    window.location.href = `/orders/new?customer_id=${customerId}`;
  }

  /**
   * Supprime un client
   */
  async deleteCustomer(customerId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce client ? Cette action est irréversible.')) {
      return;
    }

    try {
      await api.delete(`/customers/${customerId}`);
      toast.success('Client supprimé avec succès');
      this.loadCustomers();
      this.loadStats();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression du client');
    }
  }

  /**
   * Rafraîchit la liste des clients
   */
  async refreshCustomers() {
    await this.loadCustomers();
    await this.loadStats();
    toast.success('Liste mise à jour');
  }

  /**
   * Exporte les clients
   */
  exportCustomers() {
    // Implémenter l'export
    toast.info('Fonctionnalité d\'export en cours de développement');
  }

  /**
   * Retourne la classe CSS du statut
   */
  getStatusClass(status) {
    const statusClasses = {
      'active': 'success',
      'inactive': 'default',
      'vip': 'warning'
    };
    return statusClasses[status] || 'default';
  }

  /**
   * Retourne le libellé du statut
   */
  getStatusLabel(status) {
    const statusLabels = {
      'active': 'Actif',
      'inactive': 'Inactif',
      'vip': 'VIP'
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
const customers = new Customers();

export default customers; 