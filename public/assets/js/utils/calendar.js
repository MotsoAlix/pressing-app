/**
 * Module Calendar
 * Gère le calendrier de livraison
 */

class DeliveryCalendar {
  constructor() {
    this.calendar = null;
    this.deliveries = [];
    this.isInitialized = false;
  }

  /**
   * Initialise le calendrier
   */
  async init() {
    try {
      console.log('📅 Initialisation du calendrier de livraison...');
      
      // Charger les livraisons
      await this.loadDeliveries();
      
      // Initialiser FullCalendar
      this.initFullCalendar();
      
      // Initialiser les événements
      this.initEvents();
      
      this.isInitialized = true;
      console.log('✅ Calendrier de livraison initialisé');
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation du calendrier:', error);
    }
  }

  /**
   * Charge les livraisons
   */
  async loadDeliveries() {
    try {
      // Simuler le chargement des livraisons
      this.deliveries = [
        {
          id: 1,
          order_id: 'ORD-001',
          customer_name: 'Jean Dupont',
          customer_phone: '01 23 45 67 89',
          customer_address: '123 Rue de la Paix, 75001 Paris',
          delivery_date: '2024-01-17T14:00:00Z',
          status: 'scheduled',
          notes: 'Livraison entre 14h et 16h'
        },
        {
          id: 2,
          order_id: 'ORD-002',
          customer_name: 'Marie Martin',
          customer_phone: '01 98 76 54 32',
          customer_address: '456 Avenue des Champs, 75008 Paris',
          delivery_date: '2024-01-16T10:00:00Z',
          status: 'completed',
          notes: 'Livraison effectuée'
        },
        {
          id: 3,
          order_id: 'ORD-003',
          customer_name: 'Pierre Durand',
          customer_phone: '01 11 22 33 44',
          customer_address: '789 Boulevard Saint-Germain, 75006 Paris',
          delivery_date: '2024-01-18T16:00:00Z',
          status: 'scheduled',
          notes: 'Préfère livraison en fin d\'après-midi'
        },
        {
          id: 4,
          order_id: 'ORD-004',
          customer_name: 'Sophie Bernard',
          customer_phone: '01 55 66 77 88',
          customer_address: '321 Rue du Commerce, 75015 Paris',
          delivery_date: '2024-01-19T09:00:00Z',
          status: 'pending',
          notes: 'Livraison matinale'
        }
      ];
      
    } catch (error) {
      console.error('Erreur lors du chargement des livraisons:', error);
    }
  }

  /**
   * Initialise FullCalendar
   */
  initFullCalendar() {
    const calendarEl = document.getElementById('deliveryCalendar');
    if (!calendarEl) return;

    // Charger FullCalendar si pas déjà chargé
    if (typeof window.FullCalendar === 'undefined') {
      this.loadFullCalendarLibrary();
      return;
    }

    this.calendar = new window.FullCalendar.Calendar(calendarEl, {
      initialView: 'dayGridMonth',
      locale: 'fr',
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
      },
      buttonText: {
        today: 'Aujourd\'hui',
        month: 'Mois',
        week: 'Semaine',
        day: 'Jour',
        list: 'Liste'
      },
      height: 'auto',
      editable: true,
      selectable: true,
      selectMirror: true,
      dayMaxEvents: true,
      weekends: true,
      events: this.formatDeliveriesForCalendar(),
      eventClick: (info) => {
        this.showDeliveryDetails(info.event);
      },
      select: (info) => {
        this.showAddDeliveryModal(info.start);
      },
      eventDrop: (info) => {
        this.updateDeliveryDate(info.event);
      },
      eventResize: (info) => {
        this.updateDeliveryDate(info.event);
      },
      eventDidMount: (info) => {
        this.addEventTooltip(info.event, info.el);
      }
    });

    this.calendar.render();
  }

  /**
   * Charge la bibliothèque FullCalendar
   */
  loadFullCalendarLibrary() {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/fullcalendar@6.1.10/index.global.min.js';
    script.onload = () => {
      this.initFullCalendar();
    };
    document.head.appendChild(script);
  }

  /**
   * Formate les livraisons pour FullCalendar
   */
  formatDeliveriesForCalendar() {
    return this.deliveries.map(delivery => ({
      id: delivery.id,
      title: `${delivery.order_id} - ${delivery.customer_name}`,
      start: delivery.delivery_date,
      end: new Date(new Date(delivery.delivery_date).getTime() + 60 * 60 * 1000), // +1 heure
      backgroundColor: this.getDeliveryColor(delivery.status),
      borderColor: this.getDeliveryColor(delivery.status),
      textColor: '#ffffff',
      extendedProps: {
        order_id: delivery.order_id,
        customer_name: delivery.customer_name,
        customer_phone: delivery.customer_phone,
        customer_address: delivery.customer_address,
        status: delivery.status,
        notes: delivery.notes
      }
    }));
  }

  /**
   * Retourne la couleur pour un statut de livraison
   */
  getDeliveryColor(status) {
    const colors = {
      'scheduled': '#3b82f6', // Bleu
      'completed': '#10b981', // Vert
      'pending': '#f59e0b',   // Orange
      'cancelled': '#ef4444'  // Rouge
    };
    return colors[status] || '#6b7280';
  }

  /**
   * Affiche les détails d'une livraison
   */
  showDeliveryDetails(event) {
    const delivery = event.extendedProps;
    
    const modal = document.getElementById('deliveryDetailsModal');
    if (!modal) return;

    const content = `
      <div class="delivery-details">
        <div class="delivery-details-header">
          <h3>Livraison ${delivery.order_id}</h3>
          <span class="status-badge status-badge--${this.getStatusClass(delivery.status)}">
            ${this.getStatusLabel(delivery.status)}
          </span>
        </div>
        <div class="delivery-details-content">
          <div class="delivery-section">
            <h4>Informations client</h4>
            <div class="delivery-info-grid">
              <div class="delivery-info-item">
                <span class="delivery-info-label">Client :</span>
                <span class="delivery-info-value">${delivery.customer_name}</span>
              </div>
              <div class="delivery-info-item">
                <span class="delivery-info-label">Téléphone :</span>
                <span class="delivery-info-value">${delivery.customer_phone}</span>
              </div>
              <div class="delivery-info-item">
                <span class="delivery-info-label">Adresse :</span>
                <span class="delivery-info-value">${delivery.customer_address}</span>
              </div>
            </div>
          </div>
          <div class="delivery-section">
            <h4>Détails de livraison</h4>
            <div class="delivery-info-grid">
              <div class="delivery-info-item">
                <span class="delivery-info-label">Date :</span>
                <span class="delivery-info-value">${this.formatDate(event.start)}</span>
              </div>
              <div class="delivery-info-item">
                <span class="delivery-info-label">Heure :</span>
                <span class="delivery-info-value">${this.formatTime(event.start)}</span>
              </div>
            </div>
          </div>
          ${delivery.notes ? `
            <div class="delivery-section">
              <h4>Notes</h4>
              <div class="delivery-notes">
                ${delivery.notes}
              </div>
            </div>
          ` : ''}
        </div>
        <div class="delivery-details-actions">
          <button class="btn btn-primary" data-action="edit-delivery" data-delivery-id="${event.id}">
            <i class="fas fa-edit"></i>
            Modifier
          </button>
          <button class="btn btn-success" data-action="mark-completed" data-delivery-id="${event.id}">
            <i class="fas fa-check"></i>
            Marquer comme livré
          </button>
          <button class="btn btn-danger" data-action="cancel-delivery" data-delivery-id="${event.id}">
            <i class="fas fa-times"></i>
            Annuler
          </button>
        </div>
      </div>
    `;

    const modalContent = modal.querySelector('.modal-content');
    if (modalContent) {
      modalContent.innerHTML = content;
    }

    modal.classList.add('is-open');
  }

  /**
   * Affiche la modale d'ajout de livraison
   */
  showAddDeliveryModal(date) {
    const modal = document.getElementById('addDeliveryModal');
    if (!modal) return;

    const dateInput = modal.querySelector('#deliveryDate');
    if (dateInput) {
      dateInput.value = this.formatDateForInput(date);
    }

    modal.classList.add('is-open');
  }

  /**
   * Met à jour la date de livraison
   */
  updateDeliveryDate(event) {
    const deliveryId = event.id;
    const newDate = event.start;
    
    // Trouver la livraison correspondante
    const delivery = this.deliveries.find(d => d.id == deliveryId);
    if (delivery) {
      delivery.delivery_date = newDate.toISOString();
      
      // Simuler une mise à jour via API
      console.log(`Mise à jour de la livraison ${deliveryId} pour le ${newDate.toISOString()}`);
      
      // Afficher une notification
      if (window.notificationManager) {
        window.notificationManager.sendCustomNotification(
          'delivery',
          'Livraison mise à jour',
          `La livraison ${delivery.order_id} a été reprogrammée`
        );
      }
    }
  }

  /**
   * Ajoute un tooltip à un événement
   */
  addEventTooltip(event, element) {
    const delivery = event.extendedProps;
    
    element.setAttribute('title', `
      ${delivery.order_id} - ${delivery.customer_name}
      ${this.formatDate(event.start)} à ${this.formatTime(event.start)}
      ${delivery.notes ? `\nNotes: ${delivery.notes}` : ''}
    `);
  }

  /**
   * Initialise les événements
   */
  initEvents() {
    // Actions sur les livraisons
    document.addEventListener('click', (e) => {
      if (e.target.matches('[data-action="edit-delivery"]')) {
        const deliveryId = e.target.dataset.deliveryId;
        this.editDelivery(deliveryId);
      } else if (e.target.matches('[data-action="mark-completed"]')) {
        const deliveryId = e.target.dataset.deliveryId;
        this.markDeliveryCompleted(deliveryId);
      } else if (e.target.matches('[data-action="cancel-delivery"]')) {
        const deliveryId = e.target.dataset.deliveryId;
        this.cancelDelivery(deliveryId);
      } else if (e.target.matches('[data-action="add-delivery"]')) {
        this.showAddDeliveryModal(new Date());
      } else if (e.target.matches('[data-action="refresh-calendar"]')) {
        this.refreshCalendar();
      }
    });

    // Formulaire d'ajout de livraison
    document.addEventListener('submit', (e) => {
      if (e.target.matches('#addDeliveryForm')) {
        e.preventDefault();
        this.addDelivery(e.target);
      }
    });
  }

  /**
   * Modifie une livraison
   */
  editDelivery(deliveryId) {
    console.log(`Modification de la livraison ${deliveryId}`);
    // Implémenter la logique de modification
  }

  /**
   * Marque une livraison comme terminée
   */
  markDeliveryCompleted(deliveryId) {
    const delivery = this.deliveries.find(d => d.id == deliveryId);
    if (delivery) {
      delivery.status = 'completed';
      this.refreshCalendar();
      
      // Fermer la modale
      const modal = document.getElementById('deliveryDetailsModal');
      if (modal) {
        modal.classList.remove('is-open');
      }
      
      // Notification
      if (window.notificationManager) {
        window.notificationManager.sendCustomNotification(
          'delivery',
          'Livraison terminée',
          `La livraison ${delivery.order_id} a été effectuée avec succès`
        );
      }
    }
  }

  /**
   * Annule une livraison
   */
  cancelDelivery(deliveryId) {
    if (confirm('Êtes-vous sûr de vouloir annuler cette livraison ?')) {
      const delivery = this.deliveries.find(d => d.id == deliveryId);
      if (delivery) {
        delivery.status = 'cancelled';
        this.refreshCalendar();
        
        // Fermer la modale
        const modal = document.getElementById('deliveryDetailsModal');
        if (modal) {
          modal.classList.remove('is-open');
        }
        
        // Notification
        if (window.notificationManager) {
          window.notificationManager.sendCustomNotification(
            'delivery',
            'Livraison annulée',
            `La livraison ${delivery.order_id} a été annulée`
          );
        }
      }
    }
  }

  /**
   * Ajoute une nouvelle livraison
   */
  addDelivery(form) {
    const formData = new FormData(form);
    const deliveryData = Object.fromEntries(formData.entries());
    
    // Validation
    if (!deliveryData.order_id || !deliveryData.customer_name || !deliveryData.delivery_date) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }
    
    const newDelivery = {
      id: Date.now(),
      order_id: deliveryData.order_id,
      customer_name: deliveryData.customer_name,
      customer_phone: deliveryData.customer_phone || '',
      customer_address: deliveryData.customer_address || '',
      delivery_date: new Date(deliveryData.delivery_date).toISOString(),
      status: 'scheduled',
      notes: deliveryData.notes || ''
    };
    
    this.deliveries.push(newDelivery);
    this.refreshCalendar();
    
    // Fermer la modale
    const modal = document.getElementById('addDeliveryModal');
    if (modal) {
      modal.classList.remove('is-open');
    }
    
    // Réinitialiser le formulaire
    form.reset();
    
    // Notification
    if (window.notificationManager) {
      window.notificationManager.sendCustomNotification(
        'delivery',
        'Nouvelle livraison',
        `Livraison programmée pour ${newDelivery.customer_name}`
      );
    }
  }

  /**
   * Rafraîchit le calendrier
   */
  refreshCalendar() {
    if (this.calendar) {
      this.calendar.removeAllEvents();
      this.calendar.addEventSource(this.formatDeliveriesForCalendar());
    }
  }

  /**
   * Retourne la classe CSS du statut
   */
  getStatusClass(status) {
    const statusClasses = {
      'scheduled': 'info',
      'completed': 'success',
      'pending': 'warning',
      'cancelled': 'danger'
    };
    return statusClasses[status] || 'default';
  }

  /**
   * Retourne le libellé du statut
   */
  getStatusLabel(status) {
    const statusLabels = {
      'scheduled': 'Programmée',
      'completed': 'Terminée',
      'pending': 'En attente',
      'cancelled': 'Annulée'
    };
    return statusLabels[status] || status;
  }

  /**
   * Formate une date
   */
  formatDate(date) {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  /**
   * Formate une heure
   */
  formatTime(date) {
    return new Date(date).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Formate une date pour l'input
   */
  formatDateForInput(date) {
    return date.toISOString().slice(0, 16);
  }
}

// Créer et exporter une instance
const deliveryCalendar = new DeliveryCalendar();

export default deliveryCalendar; 