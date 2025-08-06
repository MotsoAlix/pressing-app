/**
 * Module API pour gérer les requêtes HTTP
 */
class Api {
  constructor() {
    this.baseUrl = window.location.origin;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest'
    };
  }

  /**
   * Effectue une requête GET
   */
  async get(url, options = {}) {
    return this.request(url, {
      method: 'GET',
      ...options
    });
  }

  /**
   * Effectue une requête POST
   */
  async post(url, data = null, options = {}) {
    return this.request(url, {
      method: 'POST',
      body: data ? JSON.stringify(data) : null,
      ...options
    });
  }

  /**
   * Effectue une requête PUT
   */
  async put(url, data = null, options = {}) {
    return this.request(url, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : null,
      ...options
    });
  }

  /**
   * Effectue une requête DELETE
   */
  async delete(url, options = {}) {
    return this.request(url, {
      method: 'DELETE',
      ...options
    });
  }

  /**
   * Effectue une requête HTTP générique
   */
  async request(url, options = {}) {
    const config = {
      credentials: 'include',
      headers: {
        ...this.defaultHeaders,
        ...options.headers
      },
      ...options
    };

    // Ajouter le token CSRF si disponible
    const csrfToken = this.getCsrfToken();
    if (csrfToken) {
      config.headers['X-CSRF-Token'] = csrfToken;
    }

    try {
      const response = await fetch(this.baseUrl + url, config);
      
      // Gérer les redirections d'authentification
      if (response.status === 401) {
        window.location.href = '/login';
        return;
      }

      // Gérer les erreurs HTTP
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Parser la réponse JSON
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }

      return await response.text();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  /**
   * Récupère le token CSRF depuis le DOM
   */
  getCsrfToken() {
    const metaTag = document.querySelector('meta[name="csrf-token"]');
    return metaTag ? metaTag.getAttribute('content') : null;
  }

  /**
   * Upload de fichier
   */
  async uploadFile(url, file, options = {}) {
    const formData = new FormData();
    formData.append('file', file);

    return this.request(url, {
      method: 'POST',
      body: formData,
      headers: {
        // Ne pas définir Content-Type pour FormData
        'X-Requested-With': 'XMLHttpRequest'
      },
      ...options
    });
  }

  /**
   * Upload multiple de fichiers
   */
  async uploadFiles(url, files, options = {}) {
    const formData = new FormData();
    
    for (let i = 0; i < files.length; i++) {
      formData.append(`files[${i}]`, files[i]);
    }

    return this.request(url, {
      method: 'POST',
      body: formData,
      headers: {
        'X-Requested-With': 'XMLHttpRequest'
      },
      ...options
    });
  }

  /**
   * Effectue une requête avec gestion des erreurs
   */
  async safeRequest(url, options = {}) {
    try {
      return await this.request(url, options);
    } catch (error) {
      console.error('Safe request failed:', error);
      return null;
    }
  }

  /**
   * Effectue une requête avec retry automatique
   */
  async requestWithRetry(url, options = {}, maxRetries = 3) {
    let lastError;

    for (let i = 0; i < maxRetries; i++) {
      try {
        return await this.request(url, options);
      } catch (error) {
        lastError = error;
        
        // Attendre avant de réessayer (backoff exponentiel)
        if (i < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
        }
      }
    }

    throw lastError;
  }
}

// Créer une instance globale
const api = new Api();

// Exporter pour utilisation dans d'autres modules
export default api; 