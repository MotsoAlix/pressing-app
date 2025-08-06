/**
 * Module Payments
 * Gère la gestion des paiements et transactions
 */
import api from '../core/api.js';
import toast from '../components/toast.js';
import modal from '../components/modal.js';
import auth from './auth.js';

class Payments {
  constructor() {
    this.payments = [];
    this.currentPage = 1;
    this.itemsPerPage = 10;
    this.totalItems = 0;
    this.filters = {
      status: '',
      method: '',
      period: '',
      sort: 'date_desc',
      search: ''
    };
    this.isInitialized = false;
  }

  /**
   * Initialise le module payments
   */
  async init() {
    try {
      console.log('💳 Initialisation du module payments...');
      
      // Charger les données initiales
      await this.loadPayments();
      
      // Charger les statistiques
      await this.loadStats();
      
      // Initialiser les événements
      this.initEvents();
      
      // Initialiser les modales
      this.initModals();
      
      this.isInitialized = true;
      console.log('✅ Module payments initialisé');
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation du module payments:', error);
      toast.error('Erreur lors du chargement des paiements');
    }
  }

  /**
   * Charge la liste des paiements
   */
  async loadPayments() {
    try {
      const params = new URLSearchParams({
        page: this.currentPage,
        limit: this.itemsPerPage,
        ...this.filters
      });

      const response = await api.get(`/payments?${params}`);
      const data = response.data || { payments: [], total: 0 };
      
      this.payments = data.payments;
      this.totalItems = data.total;
      
      this.renderPayments();
      this.updatePagination();
      this.updatePaymentsCount();
      
    } catch (error) {
      console.error('Erreur lors du chargement des paiements:', error);
      // Utiliser des données de démonstration
      this.loadDemoPayments();
    }
  }

  /**
   * Charge des paiements de démonstration
   */
  loadDemoPayments() {
    this.payments = [
      {
        id: 'PAY-001',
        reference: 'REF-2024-001',
        customer_name: 'Jean Dupont',
        order_id: 'ORD-001',
        amount: 30.00,
        method: 'card',
        status: 'completed',
        created_at: '2024-01-15T10:30:00Z',
        processed_at: '2024-01-15T10:32:00Z',
        notes: 'Paiement par carte bancaire'
      },
      {
        id: 'PAY-002',
        reference: 'REF-2024-002',
        customer_name: 'Marie Martin',
        order_id: 'ORD-002',
        amount: 8.00,
        method: 'cash',
        status: 'completed',
        created_at: '2024-01-15T11:15:00Z',
        processed_at: '2024-01-15T11:16:00Z',
        notes: 'Paiement en espèces'
      },
      {
        id: 'PAY-003',
        reference: 'REF-2024-003',
        customer_name: 'Pierre Durand',
        order_id: 'ORD-003',
        amount: 36.00,
        method: 'transfer',
        status: 'pending',
        created_at: '2024-01-15T12:00:00Z',
        processed_at: null,
        notes: 'Virement en attente'
      },
      {
        id: 'PAY-004',
        reference: 'REF-2024-004',
        customer_name: 'Sophie Bernard',
        order_id: 'ORD-004',
        amount: 25.00,
        method: 'check',
        status: 'completed',
        created_at: '2024-01-14T15:45:00Z',
        processed_at: '2024-01-16T09:00:00Z',
        notes: 'Chèque encaissé'
      }
    ];
    
    this.totalItems = this.payments.length;
    this.renderPayments();
    this.updatePaymentsCount();
  }

  /**
   * Charge les statistiques des paiements
   */
  async loadStats() {
    try {
      const response = await api.get('/payments/stats');
      const stats = response.data;
      
      this.updateStatCard('totalRevenue', stats.totalRevenue || 0);
      this.updateStatCard('totalPayments', stats.totalPayments || 0);
      this.updateStatCard('pendingPayments', stats.pendingPayments || 0);
      this.updateStatCard('avgPayment', stats.avgPayment || 0);
      
      this.updateStatChange('revenueChange', stats.revenueChange || 0);
      this.updateStatChange('paymentsChange', stats.paymentsChange || 0);
      this.updateStatChange('pendingChange', stats.pendingChange || 0);
      this.updateStatChange('avgChange', stats.avgChange || 0);
      
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
    this.updateStatCard('totalRevenue', 99.00);
    this.updateStatCard('totalPayments', 4);
    this.updateStatCard('pendingPayments', 1);
    this.updateStatCard('avgPayment', 24.75);
    
    this.updateStatChange('revenueChange', 12.5);
    this.updateStatChange('paymentsChange', 8.3);
    this.updateStatChange('pendingChange', -15.2);
    this.updateStatChange('avgChange', 5.1);
  }

  /**
   * Met à jour une carte de statistique
   */
  updateStatCard(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
      if (elementId.includes('Revenue') || elementId.includes('avgPayment')) {
        element.textContent = `${value.toFixed(2)}€`;
      } else {
        element.textContent = value;
      }
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
   * Affiche les paiements dans le tableau
   */
  renderPayments() {
    const tbody = document.getElementById('paymentsTableBody');
    if (!tbody) return;

    if (this.payments.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="9" class="table-empty">
            <div class="table-empty-content">
              <i class="fas fa-credit-card"></i>
              <p>Aucun paiement trouvé</p>
              <button class="btn btn-primary btn-sm" data-action="new-payment">
                Créer un paiement
              </button>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = this.payments.map(payment => `
      <tr data-payment-id="${payment.id}">
        <td>
          <label class="table-checkbox">
            <input type="checkbox" class="payment-checkbox" value="${payment.id}">
            <span class="table-checkbox-mark"></span>
          </label>
        </td>
        <td>
          <div class="table-cell-primary">
            <div class="payment-reference">
              <div class="reference-id">${payment.reference}</div>
              <div class="payment-id">#${payment.id}</div>
            </div>
          </div>
        </td>
        <td>
          <div class="table-cell-primary">
            <div class="customer-info">
              <div class="customer-name">${payment.customer_name}</div>
            </div>
          </div>
        </td>
        <td>
          <div class="table-cell-secondary">
            <a href="/orders/${payment.order_id}" class="order-link">${payment.order_id}</a>
          </div>
        </td>
        <td>
          <div class="table-cell-primary payment-amount">
            ${payment.amount.toFixed(2)}€
          </div>
        </td>
        <td>
          <span class="method-badge method-badge--${this.getMethodClass(payment.method)}">
            ${this.getMethodLabel(payment.method)}
          </span>
        </td>
        <td>
          <span class="status-badge status-badge--${this.getStatusClass(payment.status)}">
            ${this.getStatusLabel(payment.status)}
          </span>
        </td>
        <td>
          <div class="table-cell-secondary">
            ${this.formatDate(payment.created_at)}
          </div>
        </td>
        <td>
          <div class="table-actions">
            <button class="btn btn-sm btn-secondary" data-action="view-payment" data-payment-id="${payment.id}" title="Voir les détails">
              <i class="fas fa-eye"></i>
            </button>
            <button class="btn btn-sm btn-primary" data-action="edit-payment" data-payment-id="${payment.id}" title="Modifier">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-sm btn-info" data-action="generate-invoice" data-payment-id="${payment.id}" title="Générer facture">
              <i class="fas fa-file-invoice"></i>
            </button>
            <button class="btn btn-sm btn-danger" data-action="delete-payment" data-payment-id="${payment.id}" title="Supprimer">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  /**
   * Met à jour le compteur de paiements
   */
  updatePaymentsCount() {
    const countElement = document.getElementById('paymentsCount');
    if (countElement) {
      countElement.textContent = `${this.totalItems} paiement(s)`;
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

    // Actions sur les paiements
    document.addEventListener('click', (e) => {
      if (e.target.matches('[data-action="new-payment"]')) {
        this.showNewPaymentModal();
      } else if (e.target.matches('[data-action="view-payment"]')) {
        const paymentId = e.target.dataset.paymentId;
        this.viewPayment(paymentId);
      } else if (e.target.matches('[data-action="edit-payment"]')) {
        const paymentId = e.target.dataset.paymentId;
        this.editPayment(paymentId);
      } else if (e.target.matches('[data-action="delete-payment"]')) {
        const paymentId = e.target.dataset.paymentId;
        this.deletePayment(paymentId);
      } else if (e.target.matches('[data-action="generate-invoice"]')) {
        const paymentId = e.target.dataset.paymentId;
        this.generateInvoice(paymentId);
      } else if (e.target.matches('[data-action="refresh-payments"]')) {
        this.refreshPayments();
      } else if (e.target.matches('[data-action="export-payments"]')) {
        this.exportPayments();
      }
    });

    // Sélection multiple
    const selectAllCheckbox = document.getElementById('selectAll');
    if (selectAllCheckbox) {
      selectAllCheckbox.addEventListener('change', (e) => {
        const checkboxes = document.querySelectorAll('.payment-checkbox');
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
    const newPaymentModal = document.getElementById('newPaymentModal');
    if (newPaymentModal) {
      modal.init(newPaymentModal);
    }
  }

  /**
   * Applique les filtres
   */
  applyFilters() {
    this.filters.status = document.getElementById('statusFilter').value;
    this.filters.method = document.getElementById('methodFilter').value;
    this.filters.period = document.getElementById('periodFilter').value;
    this.filters.sort = document.getElementById('sortFilter').value;
    
    this.currentPage = 1;
    this.loadPayments();
  }

  /**
   * Efface les filtres
   */
  clearFilters() {
    document.getElementById('statusFilter').value = '';
    document.getElementById('methodFilter').value = '';
    document.getElementById('periodFilter').value = '';
    document.getElementById('sortFilter').value = 'date_desc';
    
    this.filters = {
      status: '',
      method: '',
      period: '',
      sort: 'date_desc',
      search: ''
    };
    
    this.currentPage = 1;
    this.loadPayments();
  }

  /**
   * Gère la recherche
   */
  handleSearch() {
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
      this.filters.search = searchInput.value.trim();
      this.currentPage = 1;
      this.loadPayments();
    }
  }

  /**
   * Va à une page spécifique
   */
  goToPage(page) {
    this.currentPage = page;
    this.loadPayments();
  }

  /**
   * Affiche la modale de nouveau paiement
   */
  showNewPaymentModal() {
    const modal = document.getElementById('newPaymentModal');
    if (modal) {
      modal.classList.add('is-open');
      document.getElementById('newPaymentForm').reset();
      this.loadOrdersForPayment();
    }
  }

  /**
   * Charge les commandes pour le formulaire de paiement
   */
  async loadOrdersForPayment() {
    try {
      const response = await api.get('/orders/unpaid');
      const orders = response.data || [];
      
      const orderSelect = document.getElementById('orderId');
      if (orderSelect) {
        orderSelect.innerHTML = '<option value="">Sélectionner une commande</option>';
        orders.forEach(order => {
          orderSelect.innerHTML += `
            <option value="${order.id}" data-amount="${order.total_amount}">
              ${order.id} - ${order.customer_name} (${order.total_amount.toFixed(2)}€)
            </option>
          `;
        });
      }
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
    const orderSelect = document.getElementById('orderId');
    if (orderSelect) {
      orderSelect.innerHTML = `
        <option value="">Sélectionner une commande</option>
        <option value="ORD-001" data-amount="30.00">ORD-001 - Jean Dupont (30.00€)</option>
        <option value="ORD-002" data-amount="8.00">ORD-002 - Marie Martin (8.00€)</option>
        <option value="ORD-003" data-amount="36.00">ORD-003 - Pierre Durand (36.00€)</option>
      `;
    }
  }

  /**
   * Sauvegarde un nouveau paiement
   */
  async savePayment() {
    try {
      const form = document.getElementById('newPaymentForm');
      const formData = new FormData(form);
      const paymentData = Object.fromEntries(formData.entries());

      // Validation
      if (!paymentData.order_id || !paymentData.amount || !paymentData.payment_method) {
        toast.error('Veuillez remplir tous les champs obligatoires');
        return;
      }

      const response = await api.post('/payments', paymentData);
      
      toast.success('Paiement créé avec succès');
      modal.close('newPaymentModal');
      this.loadPayments();
      this.loadStats();
      
    } catch (error) {
      console.error('Erreur lors de la création du paiement:', error);
      toast.error('Erreur lors de la création du paiement');
    }
  }

  /**
   * Affiche les détails d'un paiement
   */
  async viewPayment(paymentId) {
    try {
      const response = await api.get(`/payments/${paymentId}`);
      const payment = response.data;
      
      this.renderPaymentDetails(payment);
      modal.open('paymentDetailsModal');
      
    } catch (error) {
      console.error('Erreur lors du chargement des détails:', error);
      toast.error('Erreur lors du chargement des détails');
    }
  }

  /**
   * Affiche les détails d'un paiement
   */
  renderPaymentDetails(payment) {
    const content = document.getElementById('paymentDetailsContent');
    if (!content) return;

    content.innerHTML = `
      <div class="payment-details">
        <div class="payment-details-header">
          <div class="payment-details-title">
            <h3>Paiement ${payment.reference}</h3>
            <span class="status-badge status-badge--${this.getStatusClass(payment.status)}">
              ${this.getStatusLabel(payment.status)}
            </span>
          </div>
        </div>
        <div class="payment-details-content">
          <div class="payment-section">
            <h4>Informations de paiement</h4>
            <div class="payment-info-grid">
              <div class="payment-info-item">
                <span class="payment-info-label">Référence :</span>
                <span class="payment-info-value">${payment.reference}</span>
              </div>
              <div class="payment-info-item">
                <span class="payment-info-label">Montant :</span>
                <span class="payment-info-value">${payment.amount.toFixed(2)}€</span>
              </div>
              <div class="payment-info-item">
                <span class="payment-info-label">Méthode :</span>
                <span class="payment-info-value">${this.getMethodLabel(payment.method)}</span>
              </div>
              <div class="payment-info-item">
                <span class="payment-info-label">Date :</span>
                <span class="payment-info-value">${this.formatDate(payment.created_at)}</span>
              </div>
            </div>
          </div>
          <div class="payment-section">
            <h4>Informations client</h4>
            <div class="payment-info-grid">
              <div class="payment-info-item">
                <span class="payment-info-label">Client :</span>
                <span class="payment-info-value">${payment.customer_name}</span>
              </div>
              <div class="payment-info-item">
                <span class="payment-info-label">Commande :</span>
                <span class="payment-info-value">${payment.order_id}</span>
              </div>
            </div>
          </div>
          ${payment.notes ? `
            <div class="payment-section">
              <h4>Notes</h4>
              <div class="payment-notes">
                ${payment.notes}
              </div>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  /**
   * Modifie un paiement
   */
  editPayment(paymentId) {
    // Rediriger vers la page d'édition
    window.location.href = `/payments/${paymentId}/edit`;
  }

  /**
   * Supprime un paiement
   */
  async deletePayment(paymentId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce paiement ? Cette action est irréversible.')) {
      return;
    }

    try {
      await api.delete(`/payments/${paymentId}`);
      toast.success('Paiement supprimé avec succès');
      this.loadPayments();
      this.loadStats();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression du paiement');
    }
  }

  /**
   * Génère une facture
   */
  async generateInvoice(paymentId) {
    try {
      const response = await api.get(`/payments/${paymentId}/invoice`);
      const invoice = response.data;
      
      // Utiliser jsPDF pour générer la facture
      this.generatePDFInvoice(invoice);
      
      toast.success('Facture générée avec succès');
    } catch (error) {
      console.error('Erreur lors de la génération de la facture:', error);
      toast.error('Erreur lors de la génération de la facture');
    }
  }

  /**
   * Génère une facture PDF
   */
  generatePDFInvoice(invoice) {
    // Implémentation avec jsPDF
    if (typeof window.jsPDF !== 'undefined') {
      const doc = new window.jsPDF();
      
      // En-tête
      doc.setFontSize(20);
      doc.text('FACTURE', 105, 20, { align: 'center' });
      
      // Informations de l'entreprise
      doc.setFontSize(12);
      doc.text('Pressing Pro', 20, 40);
      doc.text('123 Rue de la Paix', 20, 50);
      doc.text('75001 Paris', 20, 60);
      
      // Informations du client
      doc.text('Client:', 20, 80);
      doc.text(invoice.customer_name, 20, 90);
      
      // Détails de la facture
      doc.text('Référence:', 20, 110);
      doc.text(invoice.reference, 60, 110);
      
      doc.text('Date:', 20, 120);
      doc.text(this.formatDate(invoice.created_at), 60, 120);
      
      doc.text('Montant:', 20, 130);
      doc.text(`${invoice.amount.toFixed(2)}€`, 60, 130);
      
      // Sauvegarder le PDF
      doc.save(`facture-${invoice.reference}.pdf`);
    } else {
      // Fallback si jsPDF n'est pas disponible
      const blob = new Blob(['Facture générée'], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `facture-${invoice.reference}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    }
  }

  /**
   * Rafraîchit les paiements
   */
  async refreshPayments() {
    await this.loadPayments();
    await this.loadStats();
    toast.success('Liste mise à jour');
  }

  /**
   * Exporte les paiements
   */
  exportPayments() {
    try {
      // Utiliser SheetJS pour l'export Excel
      if (typeof window.XLSX !== 'undefined') {
        const data = this.payments.map(payment => ({
          'Référence': payment.reference,
          'Client': payment.customer_name,
          'Commande': payment.order_id,
          'Montant': payment.amount,
          'Méthode': this.getMethodLabel(payment.method),
          'Statut': this.getStatusLabel(payment.status),
          'Date': this.formatDate(payment.created_at)
        }));

        const ws = window.XLSX.utils.json_to_sheet(data);
        const wb = window.XLSX.utils.book_new();
        window.XLSX.utils.book_append_sheet(wb, ws, 'Paiements');
        window.XLSX.writeFile(wb, 'paiements.xlsx');
        
        toast.success('Export Excel généré avec succès');
      } else {
        // Fallback CSV
        const csv = this.generateCSV();
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'paiements.csv';
        a.click();
        URL.revokeObjectURL(url);
        
        toast.success('Export CSV généré avec succès');
      }
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      toast.error('Erreur lors de l\'export');
    }
  }

  /**
   * Génère un CSV
   */
  generateCSV() {
    const headers = ['Référence', 'Client', 'Commande', 'Montant', 'Méthode', 'Statut', 'Date'];
    const rows = this.payments.map(payment => [
      payment.reference,
      payment.customer_name,
      payment.order_id,
      payment.amount,
      this.getMethodLabel(payment.method),
      this.getStatusLabel(payment.status),
      this.formatDate(payment.created_at)
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  /**
   * Retourne la classe CSS de la méthode
   */
  getMethodClass(method) {
    const methodClasses = {
      'cash': 'success',
      'card': 'primary',
      'transfer': 'info',
      'check': 'warning'
    };
    return methodClasses[method] || 'default';
  }

  /**
   * Retourne le libellé de la méthode
   */
  getMethodLabel(method) {
    const methodLabels = {
      'cash': 'Espèces',
      'card': 'Carte bancaire',
      'transfer': 'Virement',
      'check': 'Chèque'
    };
    return methodLabels[method] || method;
  }

  /**
   * Retourne la classe CSS du statut
   */
  getStatusClass(status) {
    const statusClasses = {
      'completed': 'success',
      'pending': 'warning',
      'failed': 'danger',
      'refunded': 'info'
    };
    return statusClasses[status] || 'default';
  }

  /**
   * Retourne le libellé du statut
   */
  getStatusLabel(status) {
    const statusLabels = {
      'completed': 'Complété',
      'pending': 'En attente',
      'failed': 'Échoué',
      'refunded': 'Remboursé'
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
const payments = new Payments();

export default payments; 