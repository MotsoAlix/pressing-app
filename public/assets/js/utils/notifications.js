/**
 * Module Notifications
 * Gère les notifications en temps réel
 */

class NotificationManager {
  constructor() {
    this.notifications = [];
    this.isInitialized = false;
    this.websocket = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.listeners = new Map();
  }

  /**
   * Initialise le gestionnaire de notifications
   */
  async init() {
    try {
      console.log('🔔 Initialisation du gestionnaire de notifications...');
      
      // Initialiser les notifications existantes
      await this.loadNotifications();
      
      // Initialiser WebSocket
      this.initWebSocket();
      
      // Initialiser les événements
      this.initEvents();
      
      this.isInitialized = true;
      console.log('✅ Gestionnaire de notifications initialisé');
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation des notifications:', error);
    }
  }

  /**
   * Charge les notifications existantes
   */
  async loadNotifications() {
    try {
      // Simuler le chargement des notifications
      this.notifications = [
        {
          id: 1,
          type: 'order',
          title: 'Nouvelle commande',
          message: 'Commande ORD-005 reçue de Jean Dupont',
          timestamp: new Date().toISOString(),
          read: false,
          priority: 'normal'
        },
        {
          id: 2,
          type: 'payment',
          title: 'Paiement reçu',
          message: 'Paiement de 45.00€ reçu pour ORD-003',
          timestamp: new Date(Date.now() - 300000).toISOString(),
          read: false,
          priority: 'high'
        },
        {
          id: 3,
          type: 'delivery',
          title: 'Livraison prévue',
          message: 'Livraison de ORD-001 prévue pour aujourd\'hui',
          timestamp: new Date(Date.now() - 600000).toISOString(),
          read: true,
          priority: 'normal'
        }
      ];
      
      this.updateNotificationCount();
      this.renderNotifications();
      
    } catch (error) {
      console.error('Erreur lors du chargement des notifications:', error);
    }
  }

  /**
   * Initialise la connexion WebSocket
   */
  initWebSocket() {
    try {
      // Simuler une connexion WebSocket
      this.websocket = {
        readyState: 1, // OPEN
        send: (data) => {
          console.log('WebSocket message sent:', data);
        },
        close: () => {
          console.log('WebSocket connection closed');
        }
      };

      // Simuler la réception de notifications en temps réel
      this.startNotificationSimulation();
      
    } catch (error) {
      console.error('Erreur lors de l\'initialisation WebSocket:', error);
      this.scheduleReconnect();
    }
  }

  /**
   * Simule la réception de notifications en temps réel
   */
  startNotificationSimulation() {
    const notificationTypes = [
      {
        type: 'order',
        title: 'Nouvelle commande',
        messages: [
          'Commande reçue de Marie Martin',
          'Commande reçue de Pierre Durand',
          'Commande reçue de Sophie Bernard'
        ]
      },
      {
        type: 'payment',
        title: 'Paiement reçu',
        messages: [
          'Paiement de 30.00€ reçu',
          'Paiement de 25.00€ reçu',
          'Paiement de 18.00€ reçu'
        ]
      },
      {
        type: 'delivery',
        title: 'Livraison',
        messages: [
          'Livraison prévue pour aujourd\'hui',
          'Livraison effectuée avec succès',
          'Livraison reportée à demain'
        ]
      }
    ];

    setInterval(() => {
      if (Math.random() < 0.3) { // 30% de chance d'avoir une notification
        const notificationType = notificationTypes[Math.floor(Math.random() * notificationTypes.length)];
        const message = notificationType.messages[Math.floor(Math.random() * notificationType.messages.length)];
        
        this.addNotification({
          type: notificationType.type,
          title: notificationType.title,
          message: message,
          priority: Math.random() < 0.2 ? 'high' : 'normal'
        });
      }
    }, 30000); // Toutes les 30 secondes
  }

  /**
   * Ajoute une nouvelle notification
   */
  addNotification(notificationData) {
    const notification = {
      id: Date.now(),
      ...notificationData,
      timestamp: new Date().toISOString(),
      read: false
    };

    this.notifications.unshift(notification);
    
    // Limiter le nombre de notifications
    if (this.notifications.length > 50) {
      this.notifications = this.notifications.slice(0, 50);
    }

    this.updateNotificationCount();
    this.renderNotifications();
    this.showToast(notification);
    this.playNotificationSound(notification.priority);
  }

  /**
   * Affiche une notification toast
   */
  showToast(notification) {
    const toast = document.createElement('div');
    toast.className = `notification-toast notification-toast--${notification.type} notification-toast--${notification.priority}`;
    toast.innerHTML = `
      <div class="notification-toast-header">
        <i class="fas ${this.getNotificationIcon(notification.type)}"></i>
        <span class="notification-toast-title">${notification.title}</span>
        <button class="notification-toast-close" onclick="this.parentElement.parentElement.remove()">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="notification-toast-message">${notification.message}</div>
      <div class="notification-toast-time">${this.formatRelativeTime(notification.timestamp)}</div>
    `;

    // Ajouter au conteneur de notifications
    const container = document.getElementById('notificationContainer') || document.body;
    container.appendChild(toast);

    // Auto-suppression après 5 secondes
    setTimeout(() => {
      if (toast.parentElement) {
        toast.remove();
      }
    }, 5000);
  }

  /**
   * Joue un son de notification
   */
  playNotificationSound(priority) {
    try {
      const audio = new Audio();
      
      if (priority === 'high') {
        audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT';
      } else {
        audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT';
      }
      
      audio.volume = 0.3;
      audio.play().catch(() => {
        // Ignorer les erreurs de lecture audio
      });
    } catch (error) {
      // Ignorer les erreurs audio
    }
  }

  /**
   * Met à jour le compteur de notifications
   */
  updateNotificationCount() {
    const unreadCount = this.notifications.filter(n => !n.read).length;
    
    // Mettre à jour le badge dans la navbar
    const badge = document.querySelector('.notification-badge');
    if (badge) {
      badge.textContent = unreadCount;
      badge.style.display = unreadCount > 0 ? 'block' : 'none';
    }

    // Mettre à jour le titre de la page
    if (unreadCount > 0) {
      document.title = `(${unreadCount}) Pressing Pro`;
    } else {
      document.title = 'Pressing Pro';
    }
  }

  /**
   * Affiche les notifications dans le dropdown
   */
  renderNotifications() {
    const container = document.getElementById('notificationsList');
    if (!container) return;

    if (this.notifications.length === 0) {
      container.innerHTML = `
        <div class="notifications-empty">
          <i class="fas fa-bell-slash"></i>
          <p>Aucune notification</p>
        </div>
      `;
      return;
    }

    container.innerHTML = this.notifications.map(notification => `
      <div class="notification-item ${notification.read ? 'is-read' : ''}" data-notification-id="${notification.id}">
        <div class="notification-icon">
          <i class="fas ${this.getNotificationIcon(notification.type)}"></i>
        </div>
        <div class="notification-content">
          <div class="notification-header">
            <span class="notification-title">${notification.title}</span>
            <span class="notification-time">${this.formatRelativeTime(notification.timestamp)}</span>
          </div>
          <div class="notification-message">${notification.message}</div>
        </div>
        <div class="notification-actions">
          <button class="btn btn-sm btn-secondary" data-action="mark-read" data-notification-id="${notification.id}" title="Marquer comme lu">
            <i class="fas fa-check"></i>
          </button>
          <button class="btn btn-sm btn-danger" data-action="delete-notification" data-notification-id="${notification.id}" title="Supprimer">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    `).join('');
  }

  /**
   * Marque une notification comme lue
   */
  markAsRead(notificationId) {
    const notification = this.notifications.find(n => n.id == notificationId);
    if (notification) {
      notification.read = true;
      this.updateNotificationCount();
      this.renderNotifications();
    }
  }

  /**
   * Supprime une notification
   */
  deleteNotification(notificationId) {
    this.notifications = this.notifications.filter(n => n.id != notificationId);
    this.updateNotificationCount();
    this.renderNotifications();
  }

  /**
   * Marque toutes les notifications comme lues
   */
  markAllAsRead() {
    this.notifications.forEach(notification => {
      notification.read = true;
    });
    this.updateNotificationCount();
    this.renderNotifications();
  }

  /**
   * Supprime toutes les notifications
   */
  clearAllNotifications() {
    this.notifications = [];
    this.updateNotificationCount();
    this.renderNotifications();
  }

  /**
   * Initialise les événements
   */
  initEvents() {
    // Toggle du dropdown des notifications
    document.addEventListener('click', (e) => {
      if (e.target.matches('[data-action="toggle-notifications"]')) {
        this.toggleNotificationsDropdown();
      }
    });

    // Actions sur les notifications
    document.addEventListener('click', (e) => {
      if (e.target.matches('[data-action="mark-read"]')) {
        const notificationId = e.target.dataset.notificationId;
        this.markAsRead(notificationId);
      } else if (e.target.matches('[data-action="delete-notification"]')) {
        const notificationId = e.target.dataset.notificationId;
        this.deleteNotification(notificationId);
      } else if (e.target.matches('[data-action="mark-all-read"]')) {
        this.markAllAsRead();
      } else if (e.target.matches('[data-action="clear-all-notifications"]')) {
        this.clearAllNotifications();
      }
    });

    // Fermer le dropdown en cliquant à l'extérieur
    document.addEventListener('click', (e) => {
      const dropdown = document.querySelector('.notifications-dropdown');
      const toggle = document.querySelector('[data-action="toggle-notifications"]');
      
      if (dropdown && !dropdown.contains(e.target) && !toggle.contains(e.target)) {
        dropdown.classList.remove('is-open');
      }
    });
  }

  /**
   * Toggle le dropdown des notifications
   */
  toggleNotificationsDropdown() {
    const dropdown = document.querySelector('.notifications-dropdown');
    if (dropdown) {
      dropdown.classList.toggle('is-open');
    }
  }

  /**
   * Retourne l'icône pour un type de notification
   */
  getNotificationIcon(type) {
    const icons = {
      'order': 'fa-shopping-bag',
      'payment': 'fa-credit-card',
      'delivery': 'fa-truck',
      'system': 'fa-cog',
      'warning': 'fa-exclamation-triangle',
      'error': 'fa-times-circle'
    };
    return icons[type] || 'fa-bell';
  }

  /**
   * Formate le temps relatif
   */
  formatRelativeTime(timestamp) {
    const now = new Date();
    const time = new Date(timestamp);
    const diff = now - time;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `Il y a ${minutes} min`;
    if (hours < 24) return `Il y a ${hours}h`;
    if (days < 7) return `Il y a ${days}j`;
    
    return time.toLocaleDateString('fr-FR');
  }

  /**
   * Planifie une reconnexion WebSocket
   */
  scheduleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        console.log(`Tentative de reconnexion WebSocket ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
        this.initWebSocket();
      }, this.reconnectDelay * this.reconnectAttempts);
    }
  }

  /**
   * Envoie une notification personnalisée
   */
  sendCustomNotification(type, title, message, priority = 'normal') {
    this.addNotification({
      type,
      title,
      message,
      priority
    });
  }

  /**
   * S'abonne à un type de notification
   */
  subscribe(type, callback) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, []);
    }
    this.listeners.get(type).push(callback);
  }

  /**
   * Se désabonne d'un type de notification
   */
  unsubscribe(type, callback) {
    if (this.listeners.has(type)) {
      const callbacks = this.listeners.get(type);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }
}

// Créer et exporter une instance
const notificationManager = new NotificationManager();

export default notificationManager; 