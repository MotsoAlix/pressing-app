/**
 * Routeur client-side simple pour SPA
 */
class Router {
  constructor() {
    this.routes = new Map();
    this.middlewares = [];
    this.currentRoute = null;
    this.root = '/';
    
    // Écouter les changements d'URL
    window.addEventListener('popstate', () => this.handleRoute());
    
    // Intercepter les clics sur les liens
    document.addEventListener('click', (e) => this.handleClick(e));
  }

  /**
   * Définit la racine de l'application
   */
  setRoot(root) {
    this.root = root;
  }

  /**
   * Ajoute un middleware
   */
  use(middleware) {
    this.middlewares.push(middleware);
  }

  /**
   * Enregistre une route
   */
  register(path, handler, options = {}) {
    this.routes.set(path, {
      handler,
      options
    });
  }

  /**
   * Enregistre plusieurs routes
   */
  registerRoutes(routes) {
    routes.forEach(({ path, handler, options }) => {
      this.register(path, handler, options);
    });
  }

  /**
   * Navigue vers une URL
   */
  navigate(path, options = {}) {
    const url = this.root + path.replace(/^\/+/, '');
    
    if (options.replace) {
      window.history.replaceState(null, '', url);
    } else {
      window.history.pushState(null, '', url);
    }
    
    this.handleRoute();
  }

  /**
   * Gère la route actuelle
   */
  async handleRoute() {
    const path = this.getCurrentPath();
    const route = this.findRoute(path);
    
    if (!route) {
      this.handleNotFound();
      return;
    }

    // Exécuter les middlewares
    for (const middleware of this.middlewares) {
      const result = await middleware(path, route);
      if (result === false) {
        return; // Middleware a bloqué la navigation
      }
    }

    // Exécuter le handler de la route
    try {
      this.currentRoute = route;
      await route.handler(path, route.options);
    } catch (error) {
      console.error('Route handler error:', error);
      this.handleError(error);
    }
  }

  /**
   * Trouve la route correspondant au chemin
   */
  findRoute(path) {
    // Recherche exacte
    if (this.routes.has(path)) {
      return this.routes.get(path);
    }

    // Recherche avec paramètres
    for (const [routePath, route] of this.routes) {
      const params = this.matchRoute(routePath, path);
      if (params !== null) {
        return {
          ...route,
          params
        };
      }
    }

    return null;
  }

  /**
   * Vérifie si un chemin correspond à un pattern de route
   */
  matchRoute(pattern, path) {
    const patternParts = pattern.split('/').filter(Boolean);
    const pathParts = path.split('/').filter(Boolean);

    if (patternParts.length !== pathParts.length) {
      return null;
    }

    const params = {};

    for (let i = 0; i < patternParts.length; i++) {
      const patternPart = patternParts[i];
      const pathPart = pathParts[i];

      if (patternPart.startsWith(':')) {
        // Paramètre dynamique
        const paramName = patternPart.slice(1);
        params[paramName] = pathPart;
      } else if (patternPart !== pathPart) {
        // Partie statique ne correspond pas
        return null;
      }
    }

    return params;
  }

  /**
   * Gère les clics sur les liens
   */
  handleClick(e) {
    const link = e.target.closest('a');
    
    if (!link) return;
    
    const href = link.getAttribute('href');
    
    // Ignorer les liens externes, les ancres, etc.
    if (!href || 
        href.startsWith('http') || 
        href.startsWith('mailto:') || 
        href.startsWith('tel:') || 
        href.startsWith('#') ||
        link.target === '_blank') {
      return;
    }

    // Vérifier si c'est une route interne
    const route = this.findRoute(href);
    if (route) {
      e.preventDefault();
      this.navigate(href);
    }
  }

  /**
   * Récupère le chemin actuel
   */
  getCurrentPath() {
    const path = window.location.pathname;
    return path.startsWith(this.root) ? path.slice(this.root.length) : path;
  }

  /**
   * Récupère les paramètres de l'URL
   */
  getQueryParams() {
    const params = new URLSearchParams(window.location.search);
    const result = {};
    
    for (const [key, value] of params) {
      result[key] = value;
    }
    
    return result;
  }

  /**
   * Construit une URL avec des paramètres
   */
  buildUrl(path, params = {}) {
    const url = new URL(path, window.location.origin);
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, value);
      }
    });
    
    return url.pathname + url.search;
  }

  /**
   * Gère les routes non trouvées
   */
  handleNotFound() {
    console.warn('Route not found:', this.getCurrentPath());
    
    // Rediriger vers la page 404 ou afficher un message
    const notFoundRoute = this.routes.get('/404');
    if (notFoundRoute) {
      notFoundRoute.handler();
    } else {
      document.body.innerHTML = '<h1>Page non trouvée</h1>';
    }
  }

  /**
   * Gère les erreurs de route
   */
  handleError(error) {
    console.error('Router error:', error);
    
    // Rediriger vers la page d'erreur ou afficher un message
    const errorRoute = this.routes.get('/error');
    if (errorRoute) {
      errorRoute.handler(error);
    } else {
      document.body.innerHTML = '<h1>Une erreur est survenue</h1>';
    }
  }

  /**
   * Démarre le routeur
   */
  start() {
    this.handleRoute();
  }

  /**
   * Arrête le routeur
   */
  stop() {
    // Nettoyer les événements si nécessaire
    this.routes.clear();
    this.middlewares = [];
  }
}

// Créer une instance globale
const router = new Router();

// Exporter pour utilisation dans d'autres modules
export default router; 