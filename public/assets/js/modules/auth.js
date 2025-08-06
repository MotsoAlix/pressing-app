/**
 * Module d'authentification
 */
import api from '../core/api.js';
import toast from '../components/toast.js';

class Auth {
  constructor() {
    this.form = null;
    this.submitButton = null;
    this.isAuthenticated = false;
    this.user = null;
    this.init();
  }

  /**
   * Initialise le module d'authentification
   */
  init() {
    this.form = document.getElementById('loginForm');
    this.submitButton = document.getElementById('loginSubmit');
    
    if (this.form) {
      this.bindEvents();
      this.checkAuthStatus();
    }
  }

  /**
   * Lie les événements du formulaire
   */
  bindEvents() {
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    
    // Validation en temps réel
    const inputs = this.form.querySelectorAll('input[required]');
    inputs.forEach(input => {
      input.addEventListener('blur', () => this.validateField(input));
      input.addEventListener('input', () => this.clearFieldError(input));
    });
  }

  /**
   * Gère la soumission du formulaire
   */
  async handleSubmit(e) {
    e.preventDefault();
    
    if (!this.validateForm()) {
      return;
    }

    this.setLoading(true);
    
    try {
      const formData = new FormData(this.form);
      const data = {
        username: formData.get('username'),
        password: formData.get('password'),
        remember: formData.get('remember') === 'on'
      };

      const response = await api.post('/auth/login', data);
      
      if (response.success) {
        this.handleLoginSuccess(response);
      } else {
        this.handleLoginError(response.message || 'Erreur de connexion');
      }
    } catch (error) {
      console.error('Login error:', error);
      this.handleLoginError('Erreur de connexion au serveur');
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Gère le succès de la connexion
   */
  handleLoginSuccess(response) {
    this.isAuthenticated = true;
    this.user = response.user;
    
    // Sauvegarder les informations utilisateur
    if (response.user) {
      localStorage.setItem('user', JSON.stringify(response.user));
    }
    
    // Afficher un toast de succès
    toast.success('Connexion réussie ! Redirection...', {
      duration: 2000
    });
    
    // Rediriger vers le dashboard
    setTimeout(() => {
      window.location.href = '/dashboard';
    }, 1000);
  }

  /**
   * Gère l'erreur de connexion
   */
  handleLoginError(message) {
    toast.error(message);
    
    // Mettre en évidence les champs d'erreur
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    
    if (message.includes('utilisateur') || message.includes('identifiants')) {
      this.showFieldError(usernameInput, 'Nom d\'utilisateur ou mot de passe incorrect');
      this.showFieldError(passwordInput, 'Nom d\'utilisateur ou mot de passe incorrect');
    }
  }

  /**
   * Valide le formulaire complet
   */
  validateForm() {
    const inputs = this.form.querySelectorAll('input[required]');
    let isValid = true;
    
    inputs.forEach(input => {
      if (!this.validateField(input)) {
        isValid = false;
      }
    });
    
    return isValid;
  }

  /**
   * Valide un champ individuel
   */
  validateField(input) {
    const value = input.value.trim();
    const fieldName = input.name;
    
    // Supprimer les erreurs précédentes
    this.clearFieldError(input);
    
    // Validation selon le type de champ
    switch (fieldName) {
      case 'username':
        if (!value) {
          this.showFieldError(input, 'Le nom d\'utilisateur est requis');
          return false;
        }
        if (value.length < 3) {
          this.showFieldError(input, 'Le nom d\'utilisateur doit contenir au moins 3 caractères');
          return false;
        }
        break;
        
      case 'password':
        if (!value) {
          this.showFieldError(input, 'Le mot de passe est requis');
          return false;
        }
        if (value.length < 6) {
          this.showFieldError(input, 'Le mot de passe doit contenir au moins 6 caractères');
          return false;
        }
        break;
    }
    
    // Marquer le champ comme valide
    this.showFieldSuccess(input);
    return true;
  }

  /**
   * Affiche une erreur pour un champ
   */
  showFieldError(input, message) {
    input.classList.add('is-invalid');
    input.classList.remove('is-valid');
    
    const errorElement = document.getElementById(input.name + 'Error');
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.style.display = 'block';
    }
  }

  /**
   * Affiche un succès pour un champ
   */
  showFieldSuccess(input) {
    input.classList.add('is-valid');
    input.classList.remove('is-invalid');
  }

  /**
   * Efface l'erreur d'un champ
   */
  clearFieldError(input) {
    input.classList.remove('is-invalid', 'is-valid');
    
    const errorElement = document.getElementById(input.name + 'Error');
    if (errorElement) {
      errorElement.style.display = 'none';
    }
  }

  /**
   * Définit l'état de chargement
   */
  setLoading(loading) {
    if (loading) {
      this.submitButton.classList.add('loading');
      this.submitButton.disabled = true;
    } else {
      this.submitButton.classList.remove('loading');
      this.submitButton.disabled = false;
    }
  }

  /**
   * Vérifie le statut d'authentification
   */
  async checkAuthStatus() {
    try {
      const response = await api.get('/auth/check');
      if (response.authenticated) {
        this.isAuthenticated = true;
        this.user = response.user;
        
        // Si déjà connecté, rediriger vers le dashboard
        if (window.location.pathname === '/login') {
          window.location.href = '/dashboard';
        }
      }
    } catch (error) {
      console.log('Not authenticated');
    }
  }

  /**
   * Déconnecte l'utilisateur
   */
  async logout() {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.isAuthenticated = false;
      this.user = null;
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
  }

  /**
   * Récupère l'utilisateur connecté
   */
  getUser() {
    if (!this.user) {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          this.user = JSON.parse(userStr);
        } catch (error) {
          console.error('Error parsing user from localStorage:', error);
          localStorage.removeItem('user');
        }
      }
    }
    return this.user;
  }

  /**
   * Vérifie si l'utilisateur est connecté
   */
  isLoggedIn() {
    return this.isAuthenticated || !!this.getUser();
  }

  /**
   * Vérifie si l'utilisateur a un rôle spécifique
   */
  hasRole(role) {
    const user = this.getUser();
    return user && user.role === role;
  }

  /**
   * Vérifie si l'utilisateur est admin
   */
  isAdmin() {
    return this.hasRole('admin');
  }

  /**
   * Vérifie si l'utilisateur est employé
   */
  isEmployee() {
    return this.hasRole('employee');
  }
}

// Créer une instance globale
const auth = new Auth();

// Exporter pour utilisation dans d'autres modules
export default auth; 