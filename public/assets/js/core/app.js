/**
 * Application principale
 */
import api from './api.js';
import router from './router.js';
import toast from '../components/toast.js';
import auth from '../modules/auth.js';
import Sidebar from './sidebar.js';

class App {
  constructor() {
    this.isInitialized = false;
    this.modules = new Map();
    this.sidebar = null;
    this.init();
  }

  /**
   * Initialise l'application
   */
  async init() {
    try {
      console.log('🚀 Initialisation de l\'application...');
      
      // Vérifier l'authentification
      await this.checkAuthentication();
      
      // Initialiser la sidebar
      this.initSidebar();
      
      // Initialiser les modules
      await this.initModules();
      
      // Démarrer le routeur
      this.startRouter();
      
      // Initialiser les événements globaux
      this.initGlobalEvents();
      
      this.isInitialized = true;
      console.log('✅ Application initialisée avec succès');
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation:', error);
      toast.error('Erreur lors du chargement de l\'application');
    }
  }

  /**
   * Vérifie l'authentification
   */
  async checkAuthentication() {
    const currentPath = window.location.pathname;
    const isLoginPage = currentPath === '/login';
    
    // Si on est sur la page de login, ne pas vérifier l'auth
    if (isLoginPage) {
      return;
    }
    
    // Vérifier si l'utilisateur est connecté
    if (!auth.isLoggedIn()) {
      window.location.href = '/login';
      return;
    }
    
    // Vérifier le statut côté serveur
    try {
      const response = await api.get('/auth/check');
      if (!response.authenticated) {
        auth.logout();
        return;
      }
    } catch (error) {
      console.error('Erreur lors de la vérification d\'authentification:', error);
      // En cas d'erreur, rediriger vers login
      window.location.href = '/login';
    }
  }

  /**
   * Initialise la sidebar
   */
  initSidebar() {
    try {
      this.sidebar = new Sidebar();
      console.log('✅ Sidebar initialisée');
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation de la sidebar:', error);
    }
  }

  /**
   * Initialise les modules de l'application
   */
  async initModules() {
    // Charger les modules dynamiquement selon la page
    const currentPath = window.location.pathname;
    
    if (currentPath === '/dashboard' || currentPath === '/') {
      await this.loadModule('dashboard');
    } else if (currentPath.startsWith('/orders')) {
      await this.loadModule('orders');
    } else if (currentPath.startsWith('/customers')) {
      await this.loadModule('customers');
    } else if (currentPath.startsWith('/tracking')) {
      await this.loadModule('tracking');
    } else if (currentPath.startsWith('/payments')) {
      await this.loadModule('payments');
    } else if (currentPath.startsWith('/admin')) {
      await this.loadModule('admin');
    }
  }

  /**
   * Charge un module dynamiquement
   */
  async loadModule(moduleName) {
    try {
      if (this.modules.has(moduleName)) {
        return this.modules.get(moduleName);
      }
      
      const module = await import(`../modules/${moduleName}.js`);
      this.modules.set(moduleName, module.default);
      
      // Initialiser le module s'il a une méthode init
      if (module.default && typeof module.default.init === 'function') {
        await module.default.init();
      }
      
      console.log(`📦 Module ${moduleName} chargé`);
      return module.default;
      
    } catch (error) {
      console.error(`❌ Erreur lors du chargement du module ${moduleName}:`, error);
    }
  }

  /**
   * Démarre le routeur
   */
  startRouter() {
    // Enregistrer les routes
    this.registerRoutes();
    
    // Démarrer le routeur
    router.start();
  }

  /**
   * Enregistre les routes de l'application
   */
  registerRoutes() {
    // Route du dashboard
    router.register('/', async () => {
      await this.loadModule('dashboard');
      this.updateActiveNav('/');
    });
    
    router.register('/dashboard', async () => {
      await this.loadModule('dashboard');
      this.updateActiveNav('/dashboard');
    });
    
    // Routes des commandes
    router.register('/orders', async () => {
      await this.loadModule('orders');
      this.updateActiveNav('/orders');
    });
    
    router.register('/orders/new', async () => {
      await this.loadModule('orders');
      this.updateActiveNav('/orders');
    });
    
    router.register('/orders/:id', async (path, options) => {
      await this.loadModule('orders');
      this.updateActiveNav('/orders');
    });
    
    // Routes des clients
    router.register('/customers', async () => {
      await this.loadModule('customers');
      this.updateActiveNav('/customers');
    });
    
    router.register('/customers/new', async () => {
      await this.loadModule('customers');
      this.updateActiveNav('/customers');
    });
    
    router.register('/customers/:id', async (path, options) => {
      await this.loadModule('customers');
      this.updateActiveNav('/customers');
    });
    
    // Route de suivi
    router.register('/tracking', async () => {
      await this.loadModule('tracking');
      this.updateActiveNav('/tracking');
    });
    
    // Routes de paiement
    router.register('/payments', async () => {
      await this.loadModule('payments');
      this.updateActiveNav('/payments');
    });
    
    // Routes d'administration
    router.register('/admin', async () => {
      if (!auth.isAdmin()) {
        toast.error('Accès non autorisé');
        router.navigate('/dashboard');
        return;
      }
      await this.loadModule('admin');
      this.updateActiveNav('/admin');
    });
    
    // Route de déconnexion
    router.register('/logout', async () => {
      await auth.logout();
    });
    
    // Route 404
    router.register('/404', () => {
      this.showNotFound();
    });
  }

  /**
   * Met à jour la navigation active
   */
  updateActiveNav(path) {
    // Supprimer la classe active de tous les liens
    const navLinks = document.querySelectorAll('.sidebar-nav-link');
    navLinks.forEach(link => {
      link.classList.remove('is-active');
    });
    
    // Ajouter la classe active au lien correspondant
    const activeLink = document.querySelector(`[href="${path}"]`);
    if (activeLink) {
      activeLink.classList.add('is-active');
    }
  }

  /**
   * Initialise les événements globaux
   */
  initGlobalEvents() {
    // Gérer la déconnexion
    const logoutBtn = document.querySelector('[data-action="logout"]');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        await auth.logout();
      });
    }
    
    // Gérer le menu mobile
    const menuToggle = document.querySelector('[data-action="toggle-menu"]');
    const sidebar = document.querySelector('.sidebar');
    const sidebarOverlay = document.querySelector('.sidebar-overlay');
    
    if (menuToggle && sidebar) {
      menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('is-open');
        if (sidebarOverlay) {
          sidebarOverlay.classList.toggle('is-open');
        }
      });
    }
    
    if (sidebarOverlay) {
      sidebarOverlay.addEventListener('click', () => {
        sidebar.classList.remove('is-open');
        sidebarOverlay.classList.remove('is-open');
      });
    }
    
    // Gérer la fermeture de la sidebar
    const sidebarClose = document.querySelector('.sidebar-close');
    if (sidebarClose && sidebar) {
      sidebarClose.addEventListener('click', () => {
        sidebar.classList.remove('is-open');
        if (sidebarOverlay) {
          sidebarOverlay.classList.remove('is-open');
        }
      });
    }
    
    // Gérer les raccourcis clavier
    document.addEventListener('keydown', (e) => {
      // Ctrl/Cmd + K pour la recherche
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        this.focusSearch();
      }
      
      // Échap pour fermer les modales
      if (e.key === 'Escape') {
        this.closeModals();
      }
    });
  }

  /**
   * Focus sur la barre de recherche
   */
  focusSearch() {
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
      searchInput.focus();
    }
  }

  /**
   * Ferme toutes les modales ouvertes
   */
  closeModals() {
    const modals = document.querySelectorAll('.modal.is-open');
    modals.forEach(modal => {
      modal.classList.remove('is-open');
    });
  }

  /**
   * Affiche la page 404
   */
  showNotFound() {
    const main = document.querySelector('main');
    if (main) {
      main.innerHTML = `
        <div class="not-found">
          <h1>Page non trouvée</h1>
          <p>La page que vous recherchez n'existe pas.</p>
          <a href="/dashboard" class="btn btn-primary">Retour au dashboard</a>
        </div>
      `;
    }
  }

  /**
   * Récupère une instance de module
   */
  getModule(moduleName) {
    return this.modules.get(moduleName);
  }

  /**
   * Démarre l'application
   */
  start() {
    if (!this.isInitialized) {
      console.warn('Application non initialisée');
      return;
    }
    
    console.log('🎯 Application démarrée');
  }
}

// Créer une instance globale
const app = new App();

// Exporter pour utilisation dans d'autres modules
export default app;

// Démarrer l'application quand le DOM est prêt
document.addEventListener('DOMContentLoaded', () => {
  app.start();
}); 