/**
 * Module Admin
 * Gère l'administration du système
 */
import api from '../core/api.js';
import toast from '../components/toast.js';
import modal from '../components/modal.js';
import auth from './auth.js';

class Admin {
  constructor() {
    this.users = [];
    this.services = [];
    this.logs = [];
    this.currentTab = 'users';
    this.isInitialized = false;
  }

  /**
   * Initialise le module admin
   */
  async init() {
    try {
      console.log('⚙️ Initialisation du module admin...');
      
      // Charger les données initiales
      await this.loadUsers();
      await this.loadServices();
      await this.loadLogs();
      
      // Initialiser les événements
      this.initEvents();
      
      // Initialiser les modales
      this.initModals();
      
      this.isInitialized = true;
      console.log('✅ Module admin initialisé');
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation du module admin:', error);
      toast.error('Erreur lors du chargement de l\'administration');
    }
  }

  /**
   * Charge la liste des utilisateurs
   */
  async loadUsers() {
    try {
      const response = await api.get('/admin/users');
      const users = response.data || [];
      
      this.users = users;
      this.renderUsers();
      this.updateUsersCount();
      
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
      // Utiliser des données de démonstration
      this.loadDemoUsers();
    }
  }

  /**
   * Charge des utilisateurs de démonstration
   */
  loadDemoUsers() {
    this.users = [
      {
        id: 1,
        first_name: 'Admin',
        last_name: 'System',
        email: 'admin@pressingpro.fr',
        role: 'admin',
        status: 'active',
        last_login: '2024-01-15T10:30:00Z',
        created_at: '2024-01-01T00:00:00Z'
      },
      {
        id: 2,
        first_name: 'Marie',
        last_name: 'Manager',
        email: 'marie@pressingpro.fr',
        role: 'manager',
        status: 'active',
        last_login: '2024-01-15T09:15:00Z',
        created_at: '2024-01-05T10:00:00Z'
      },
      {
        id: 3,
        first_name: 'Jean',
        last_name: 'Employee',
        email: 'jean@pressingpro.fr',
        role: 'employee',
        status: 'active',
        last_login: '2024-01-14T16:45:00Z',
        created_at: '2024-01-10T14:30:00Z'
      }
    ];
    
    this.renderUsers();
    this.updateUsersCount();
  }

  /**
   * Affiche les utilisateurs
   */
  renderUsers() {
    const tbody = document.getElementById('usersTableBody');
    if (!tbody) return;

    if (this.users.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" class="table-empty">
            <div class="table-empty-content">
              <i class="fas fa-users"></i>
              <p>Aucun utilisateur trouvé</p>
              <button class="btn btn-primary btn-sm" data-action="new-user">
                Ajouter un utilisateur
              </button>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = this.users.map(user => `
      <tr data-user-id="${user.id}">
        <td>
          <div class="table-cell-primary">
            <div class="user-info">
              <div class="user-name">${user.first_name} ${user.last_name}</div>
              <div class="user-email">${user.email}</div>
            </div>
          </div>
        </td>
        <td>
          <div class="table-cell-secondary">
            ${user.email}
          </div>
        </td>
        <td>
          <span class="role-badge role-badge--${this.getRoleClass(user.role)}">
            ${this.getRoleLabel(user.role)}
          </span>
        </td>
        <td>
          <span class="status-badge status-badge--${this.getStatusClass(user.status)}">
            ${this.getStatusLabel(user.status)}
          </span>
        </td>
        <td>
          <div class="table-cell-secondary">
            ${this.formatDate(user.last_login)}
          </div>
        </td>
        <td>
          <div class="table-actions">
            <button class="btn btn-sm btn-secondary" data-action="view-user" data-user-id="${user.id}" title="Voir les détails">
              <i class="fas fa-eye"></i>
            </button>
            <button class="btn btn-sm btn-primary" data-action="edit-user" data-user-id="${user.id}" title="Modifier">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-sm btn-warning" data-action="reset-password" data-user-id="${user.id}" title="Réinitialiser mot de passe">
              <i class="fas fa-key"></i>
            </button>
            <button class="btn btn-sm btn-danger" data-action="delete-user" data-user-id="${user.id}" title="Supprimer">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  /**
   * Met à jour le compteur d'utilisateurs
   */
  updateUsersCount() {
    const countElement = document.getElementById('usersCount');
    if (countElement) {
      countElement.textContent = `${this.users.length} utilisateur(s)`;
    }
  }

  /**
   * Charge la liste des services
   */
  async loadServices() {
    try {
      const response = await api.get('/admin/services');
      const services = response.data || [];
      
      this.services = services;
      this.renderServices();
      this.updateServicesCount();
      
    } catch (error) {
      console.error('Erreur lors du chargement des services:', error);
      // Utiliser des données de démonstration
      this.loadDemoServices();
    }
  }

  /**
   * Charge des services de démonstration
   */
  loadDemoServices() {
    this.services = [
      {
        id: 1,
        name: 'Nettoyage à sec',
        description: 'Nettoyage professionnel à sec',
        price: 15.00,
        duration: 24,
        status: 'active'
      },
      {
        id: 2,
        name: 'Repassage',
        description: 'Repassage soigneux',
        price: 8.00,
        duration: 12,
        status: 'active'
      },
      {
        id: 3,
        name: 'Lavage + Repassage',
        description: 'Lavage et repassage complet',
        price: 12.00,
        duration: 24,
        status: 'active'
      },
      {
        id: 4,
        name: 'Retouche',
        description: 'Retouche et ajustements',
        price: 10.00,
        duration: 48,
        status: 'active'
      }
    ];
    
    this.renderServices();
    this.updateServicesCount();
  }

  /**
   * Affiche les services
   */
  renderServices() {
    const grid = document.getElementById('servicesGrid');
    if (!grid) return;

    if (this.services.length === 0) {
      grid.innerHTML = `
        <div class="services-empty">
          <div class="services-empty-content">
            <i class="fas fa-tshirt"></i>
            <p>Aucun service trouvé</p>
            <button class="btn btn-primary btn-sm" data-action="new-service">
              Ajouter un service
            </button>
          </div>
        </div>
      `;
      return;
    }

    grid.innerHTML = this.services.map(service => `
      <div class="service-card" data-service-id="${service.id}">
        <div class="service-card-header">
          <h3 class="service-name">${service.name}</h3>
          <span class="service-price">${service.price.toFixed(2)}€</span>
        </div>
        <div class="service-card-body">
          <p class="service-description">${service.description}</p>
          <div class="service-details">
            <span class="service-duration">
              <i class="fas fa-clock"></i>
              ${service.duration}h
            </span>
            <span class="service-status status-badge status-badge--${this.getStatusClass(service.status)}">
              ${this.getStatusLabel(service.status)}
            </span>
          </div>
        </div>
        <div class="service-card-footer">
          <button class="btn btn-sm btn-secondary" data-action="edit-service" data-service-id="${service.id}">
            <i class="fas fa-edit"></i>
            <span>Modifier</span>
          </button>
          <button class="btn btn-sm btn-danger" data-action="delete-service" data-service-id="${service.id}">
            <i class="fas fa-trash"></i>
            <span>Supprimer</span>
          </button>
        </div>
      </div>
    `).join('');
  }

  /**
   * Met à jour le compteur de services
   */
  updateServicesCount() {
    const countElement = document.getElementById('servicesCount');
    if (countElement) {
      countElement.textContent = `${this.services.length} service(s)`;
    }
  }

  /**
   * Charge les logs système
   */
  async loadLogs() {
    try {
      const response = await api.get('/admin/logs');
      const logs = response.data || [];
      
      this.logs = logs;
      this.renderLogs();
      
    } catch (error) {
      console.error('Erreur lors du chargement des logs:', error);
      // Utiliser des données de démonstration
      this.loadDemoLogs();
    }
  }

  /**
   * Charge des logs de démonstration
   */
  loadDemoLogs() {
    this.logs = [
      {
        id: 1,
        level: 'info',
        message: 'Nouvelle commande créée: ORD-001',
        user: 'admin@pressingpro.fr',
        timestamp: '2024-01-15T10:30:00Z'
      },
      {
        id: 2,
        level: 'warning',
        message: 'Tentative de connexion échouée',
        user: 'unknown',
        timestamp: '2024-01-15T10:25:00Z'
      },
      {
        id: 3,
        level: 'info',
        message: 'Paiement traité: PAY-001',
        user: 'marie@pressingpro.fr',
        timestamp: '2024-01-15T10:20:00Z'
      },
      {
        id: 4,
        level: 'error',
        message: 'Erreur lors de la génération du rapport',
        user: 'admin@pressingpro.fr',
        timestamp: '2024-01-15T10:15:00Z'
      }
    ];
    
    this.renderLogs();
  }

  /**
   * Affiche les logs
   */
  renderLogs() {
    const container = document.getElementById('logsContainer');
    if (!container) return;

    if (this.logs.length === 0) {
      container.innerHTML = `
        <div class="logs-empty">
          <p>Aucun log trouvé</p>
        </div>
      `;
      return;
    }

    container.innerHTML = this.logs.map(log => `
      <div class="log-item log-item--${log.level}">
        <div class="log-header">
          <span class="log-level log-level--${log.level}">${log.level.toUpperCase()}</span>
          <span class="log-timestamp">${this.formatDate(log.timestamp)}</span>
        </div>
        <div class="log-message">${log.message}</div>
        <div class="log-user">${log.user}</div>
      </div>
    `).join('');
  }

  /**
   * Initialise les événements
   */
  initEvents() {
    // Navigation par onglets
    document.querySelectorAll('.admin-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        this.switchTab(e.target.dataset.tab);
      });
    });

    // Actions sur les utilisateurs
    document.addEventListener('click', (e) => {
      if (e.target.matches('[data-action="new-user"]')) {
        this.showNewUserModal();
      } else if (e.target.matches('[data-action="view-user"]')) {
        const userId = e.target.dataset.userId;
        this.viewUser(userId);
      } else if (e.target.matches('[data-action="edit-user"]')) {
        const userId = e.target.dataset.userId;
        this.editUser(userId);
      } else if (e.target.matches('[data-action="delete-user"]')) {
        const userId = e.target.dataset.userId;
        this.deleteUser(userId);
      } else if (e.target.matches('[data-action="reset-password"]')) {
        const userId = e.target.dataset.userId;
        this.resetPassword(userId);
      } else if (e.target.matches('[data-action="refresh-users"]')) {
        this.refreshUsers();
      }
    });

    // Actions sur les services
    document.addEventListener('click', (e) => {
      if (e.target.matches('[data-action="new-service"]')) {
        this.showNewServiceModal();
      } else if (e.target.matches('[data-action="edit-service"]')) {
        const serviceId = e.target.dataset.serviceId;
        this.editService(serviceId);
      } else if (e.target.matches('[data-action="delete-service"]')) {
        const serviceId = e.target.dataset.serviceId;
        this.deleteService(serviceId);
      }
    });

    // Actions sur les logs
    document.addEventListener('click', (e) => {
      if (e.target.matches('[data-action="clear-logs"]')) {
        this.clearLogs();
      }
    });

    // Actions générales
    document.addEventListener('click', (e) => {
      if (e.target.matches('[data-action="backup-system"]')) {
        this.backupSystem();
      }
    });

    // Formulaires
    document.addEventListener('submit', (e) => {
      if (e.target.matches('#generalSettingsForm')) {
        e.preventDefault();
        this.saveGeneralSettings(e.target);
      } else if (e.target.matches('#systemSettingsForm')) {
        e.preventDefault();
        this.saveSystemSettings(e.target);
      }
    });
  }

  /**
   * Initialise les modales
   */
  initModals() {
    const newUserModal = document.getElementById('newUserModal');
    if (newUserModal) {
      modal.init(newUserModal);
    }
  }

  /**
   * Change d'onglet
   */
  switchTab(tabName) {
    // Mettre à jour les onglets
    document.querySelectorAll('.admin-tab').forEach(tab => {
      tab.classList.remove('is-active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('is-active');

    // Mettre à jour le contenu
    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.remove('is-active');
    });
    document.getElementById(`${tabName}-tab`).classList.add('is-active');

    this.currentTab = tabName;
  }

  /**
   * Affiche la modale de nouvel utilisateur
   */
  showNewUserModal() {
    const modal = document.getElementById('newUserModal');
    if (modal) {
      modal.classList.add('is-open');
      document.getElementById('newUserForm').reset();
    }
  }

  /**
   * Sauvegarde un nouvel utilisateur
   */
  async saveUser() {
    try {
      const form = document.getElementById('newUserForm');
      const formData = new FormData(form);
      const userData = Object.fromEntries(formData.entries());

      // Validation
      if (!userData.first_name || !userData.last_name || !userData.email || !userData.password || !userData.role) {
        toast.error('Veuillez remplir tous les champs obligatoires');
        return;
      }

      if (userData.password !== userData.confirm_password) {
        toast.error('Les mots de passe ne correspondent pas');
        return;
      }

      const response = await api.post('/admin/users', userData);
      
      toast.success('Utilisateur créé avec succès');
      modal.close('newUserModal');
      this.loadUsers();
      
    } catch (error) {
      console.error('Erreur lors de la création de l\'utilisateur:', error);
      toast.error('Erreur lors de la création de l\'utilisateur');
    }
  }

  /**
   * Affiche les détails d'un utilisateur
   */
  async viewUser(userId) {
    try {
      const response = await api.get(`/admin/users/${userId}`);
      const user = response.data;
      
      this.renderUserDetails(user);
      modal.open('userDetailsModal');
      
    } catch (error) {
      console.error('Erreur lors du chargement des détails:', error);
      toast.error('Erreur lors du chargement des détails');
    }
  }

  /**
   * Affiche les détails d'un utilisateur
   */
  renderUserDetails(user) {
    const content = document.getElementById('userDetailsContent');
    if (!content) return;

    content.innerHTML = `
      <div class="user-details">
        <div class="user-details-header">
          <div class="user-details-title">
            <h3>${user.first_name} ${user.last_name}</h3>
            <span class="role-badge role-badge--${this.getRoleClass(user.role)}">
              ${this.getRoleLabel(user.role)}
            </span>
          </div>
        </div>
        <div class="user-details-content">
          <div class="user-section">
            <h4>Informations</h4>
            <div class="user-info-grid">
              <div class="user-info-item">
                <span class="user-info-label">Email :</span>
                <span class="user-info-value">${user.email}</span>
              </div>
              <div class="user-info-item">
                <span class="user-info-label">Statut :</span>
                <span class="user-info-value">${this.getStatusLabel(user.status)}</span>
              </div>
              <div class="user-info-item">
                <span class="user-info-label">Créé le :</span>
                <span class="user-info-value">${this.formatDate(user.created_at)}</span>
              </div>
              <div class="user-info-item">
                <span class="user-info-label">Dernière connexion :</span>
                <span class="user-info-value">${this.formatDate(user.last_login)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Modifie un utilisateur
   */
  editUser(userId) {
    // Rediriger vers la page d'édition
    window.location.href = `/admin/users/${userId}/edit`;
  }

  /**
   * Supprime un utilisateur
   */
  async deleteUser(userId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.')) {
      return;
    }

    try {
      await api.delete(`/admin/users/${userId}`);
      toast.success('Utilisateur supprimé avec succès');
      this.loadUsers();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression de l\'utilisateur');
    }
  }

  /**
   * Réinitialise le mot de passe d'un utilisateur
   */
  async resetPassword(userId) {
    if (!confirm('Êtes-vous sûr de vouloir réinitialiser le mot de passe de cet utilisateur ?')) {
      return;
    }

    try {
      await api.post(`/admin/users/${userId}/reset-password`);
      toast.success('Mot de passe réinitialisé avec succès');
    } catch (error) {
      console.error('Erreur lors de la réinitialisation:', error);
      toast.error('Erreur lors de la réinitialisation du mot de passe');
    }
  }

  /**
   * Affiche la modale de nouveau service
   */
  showNewServiceModal() {
    toast.info('Fonctionnalité de création de service en cours de développement');
  }

  /**
   * Modifie un service
   */
  editService(serviceId) {
    toast.info('Fonctionnalité de modification de service en cours de développement');
  }

  /**
   * Supprime un service
   */
  async deleteService(serviceId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce service ?')) {
      return;
    }

    try {
      await api.delete(`/admin/services/${serviceId}`);
      toast.success('Service supprimé avec succès');
      this.loadServices();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression du service');
    }
  }

  /**
   * Rafraîchit les utilisateurs
   */
  async refreshUsers() {
    await this.loadUsers();
    toast.success('Liste mise à jour');
  }

  /**
   * Vide les logs
   */
  async clearLogs() {
    if (!confirm('Êtes-vous sûr de vouloir vider tous les logs ?')) {
      return;
    }

    try {
      await api.delete('/admin/logs');
      toast.success('Logs vidés avec succès');
      this.loadLogs();
    } catch (error) {
      console.error('Erreur lors du vidage des logs:', error);
      toast.error('Erreur lors du vidage des logs');
    }
  }

  /**
   * Sauvegarde le système
   */
  backupSystem() {
    try {
      // Générer une sauvegarde
      const backupData = {
        timestamp: new Date().toISOString(),
        users: this.users.length,
        services: this.services.length,
        logs: this.logs.length
      };

      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast.success('Sauvegarde générée avec succès');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error('Erreur lors de la sauvegarde');
    }
  }

  /**
   * Sauvegarde les paramètres généraux
   */
  async saveGeneralSettings(form) {
    try {
      const formData = new FormData(form);
      const settings = Object.fromEntries(formData.entries());

      await api.post('/admin/settings/general', settings);
      toast.success('Paramètres sauvegardés avec succès');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error('Erreur lors de la sauvegarde des paramètres');
    }
  }

  /**
   * Sauvegarde les paramètres système
   */
  async saveSystemSettings(form) {
    try {
      const formData = new FormData(form);
      const settings = Object.fromEntries(formData.entries());

      await api.post('/admin/settings/system', settings);
      toast.success('Paramètres système sauvegardés avec succès');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error('Erreur lors de la sauvegarde des paramètres système');
    }
  }

  /**
   * Retourne la classe CSS du rôle
   */
  getRoleClass(role) {
    const roleClasses = {
      'admin': 'danger',
      'manager': 'warning',
      'employee': 'info'
    };
    return roleClasses[role] || 'default';
  }

  /**
   * Retourne le libellé du rôle
   */
  getRoleLabel(role) {
    const roleLabels = {
      'admin': 'Administrateur',
      'manager': 'Gestionnaire',
      'employee': 'Employé'
    };
    return roleLabels[role] || role;
  }

  /**
   * Retourne la classe CSS du statut
   */
  getStatusClass(status) {
    const statusClasses = {
      'active': 'success',
      'inactive': 'default',
      'suspended': 'warning'
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
      'suspended': 'Suspendu'
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
const admin = new Admin();

export default admin; 