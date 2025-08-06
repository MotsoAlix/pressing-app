/**
 * Composant Modal
 * Gère l'ouverture et fermeture des modales
 */
class Modal {
  constructor() {
    this.modals = new Map();
    this.activeModal = null;
  }

  /**
   * Initialise une modale
   */
  init(modalElement) {
    if (!modalElement) return;

    const modalId = modalElement.id;
    this.modals.set(modalId, modalElement);

    // Gérer la fermeture par clic sur l'overlay
    const overlay = modalElement.querySelector('.modal-overlay');
    if (overlay) {
      overlay.addEventListener('click', () => this.close(modalId));
    }

    // Gérer la fermeture par clic sur le bouton de fermeture
    const closeButton = modalElement.querySelector('.modal-close');
    if (closeButton) {
      closeButton.addEventListener('click', () => this.close(modalId));
    }

    // Gérer la fermeture par la touche Échap
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.activeModal === modalId) {
        this.close(modalId);
      }
    });

    // Gérer les actions de fermeture
    const closeActions = modalElement.querySelectorAll('[data-action="close-modal"]');
    closeActions.forEach(action => {
      action.addEventListener('click', () => this.close(modalId));
    });

    console.log(`📋 Modal ${modalId} initialisée`);
  }

  /**
   * Ouvre une modale
   */
  open(modalId) {
    const modal = this.modals.get(modalId);
    if (!modal) {
      console.error(`Modal ${modalId} non trouvée`);
      return;
    }

    // Fermer la modale active si elle existe
    if (this.activeModal && this.activeModal !== modalId) {
      this.close(this.activeModal);
    }

    // Ouvrir la nouvelle modale
    modal.classList.add('is-open');
    this.activeModal = modalId;

    // Empêcher le scroll du body
    document.body.style.overflow = 'hidden';

    // Focus sur le premier élément focusable
    this.focusFirstElement(modal);

    console.log(`🔓 Modal ${modalId} ouverte`);
  }

  /**
   * Ferme une modale
   */
  close(modalId) {
    const modal = this.modals.get(modalId);
    if (!modal) {
      console.error(`Modal ${modalId} non trouvée`);
      return;
    }

    modal.classList.remove('is-open');
    
    if (this.activeModal === modalId) {
      this.activeModal = null;
    }

    // Restaurer le scroll du body
    document.body.style.overflow = '';

    console.log(`🔒 Modal ${modalId} fermée`);
  }

  /**
   * Ferme toutes les modales
   */
  closeAll() {
    this.modals.forEach((modal, modalId) => {
      this.close(modalId);
    });
  }

  /**
   * Vérifie si une modale est ouverte
   */
  isOpen(modalId) {
    const modal = this.modals.get(modalId);
    return modal ? modal.classList.contains('is-open') : false;
  }

  /**
   * Focus sur le premier élément focusable
   */
  focusFirstElement(modal) {
    const focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }
  }

  /**
   * Met à jour le contenu d'une modale
   */
  updateContent(modalId, content) {
    const modal = this.modals.get(modalId);
    if (!modal) return;

    const body = modal.querySelector('.modal-body');
    if (body) {
      body.innerHTML = content;
    }
  }

  /**
   * Affiche une modale de confirmation
   */
  confirm(message, onConfirm, onCancel) {
    const modalId = 'confirmModal';
    let modal = this.modals.get(modalId);

    if (!modal) {
      // Créer la modale de confirmation
      modal = this.createConfirmModal(modalId);
      this.init(modal);
    }

    // Mettre à jour le message
    const messageElement = modal.querySelector('.confirm-message');
    if (messageElement) {
      messageElement.textContent = message;
    }

    // Gérer les actions
    const confirmButton = modal.querySelector('[data-action="confirm"]');
    const cancelButton = modal.querySelector('[data-action="cancel"]');

    const handleConfirm = () => {
      this.close(modalId);
      if (onConfirm) onConfirm();
      
      // Nettoyer les événements
      confirmButton.removeEventListener('click', handleConfirm);
      cancelButton.removeEventListener('click', handleCancel);
    };

    const handleCancel = () => {
      this.close(modalId);
      if (onCancel) onCancel();
      
      // Nettoyer les événements
      confirmButton.removeEventListener('click', handleConfirm);
      cancelButton.removeEventListener('click', handleCancel);
    };

    confirmButton.addEventListener('click', handleConfirm);
    cancelButton.addEventListener('click', handleCancel);

    this.open(modalId);
  }

  /**
   * Crée une modale de confirmation
   */
  createConfirmModal(modalId) {
    const modal = document.createElement('div');
    modal.id = modalId;
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-overlay" data-action="close-modal"></div>
      <div class="modal-container modal-container--small">
        <div class="modal-header">
          <h2 class="modal-title">Confirmation</h2>
          <button class="modal-close" data-action="close-modal">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <p class="confirm-message"></p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" data-action="cancel">Annuler</button>
          <button class="btn btn-primary" data-action="confirm">Confirmer</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    return modal;
  }

  /**
   * Affiche une modale d'alerte
   */
  alert(message, onClose) {
    const modalId = 'alertModal';
    let modal = this.modals.get(modalId);

    if (!modal) {
      // Créer la modale d'alerte
      modal = this.createAlertModal(modalId);
      this.init(modal);
    }

    // Mettre à jour le message
    const messageElement = modal.querySelector('.alert-message');
    if (messageElement) {
      messageElement.textContent = message;
    }

    // Gérer l'action de fermeture
    const closeButton = modal.querySelector('[data-action="close"]');
    
    const handleClose = () => {
      this.close(modalId);
      if (onClose) onClose();
      
      // Nettoyer l'événement
      closeButton.removeEventListener('click', handleClose);
    };

    closeButton.addEventListener('click', handleClose);

    this.open(modalId);
  }

  /**
   * Crée une modale d'alerte
   */
  createAlertModal(modalId) {
    const modal = document.createElement('div');
    modal.id = modalId;
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-overlay" data-action="close-modal"></div>
      <div class="modal-container modal-container--small">
        <div class="modal-header">
          <h2 class="modal-title">Information</h2>
          <button class="modal-close" data-action="close-modal">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <p class="alert-message"></p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-primary" data-action="close">OK</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    return modal;
  }

  /**
   * Affiche une modale de prompt
   */
  prompt(message, defaultValue = '', onConfirm, onCancel) {
    const modalId = 'promptModal';
    let modal = this.modals.get(modalId);

    if (!modal) {
      // Créer la modale de prompt
      modal = this.createPromptModal(modalId);
      this.init(modal);
    }

    // Mettre à jour le message
    const messageElement = modal.querySelector('.prompt-message');
    const inputElement = modal.querySelector('.prompt-input');
    
    if (messageElement) {
      messageElement.textContent = message;
    }
    
    if (inputElement) {
      inputElement.value = defaultValue;
    }

    // Gérer les actions
    const confirmButton = modal.querySelector('[data-action="confirm"]');
    const cancelButton = modal.querySelector('[data-action="cancel"]');

    const handleConfirm = () => {
      const value = inputElement.value;
      this.close(modalId);
      if (onConfirm) onConfirm(value);
      
      // Nettoyer les événements
      confirmButton.removeEventListener('click', handleConfirm);
      cancelButton.removeEventListener('click', handleCancel);
    };

    const handleCancel = () => {
      this.close(modalId);
      if (onCancel) onCancel();
      
      // Nettoyer les événements
      confirmButton.removeEventListener('click', handleConfirm);
      cancelButton.removeEventListener('click', handleCancel);
    };

    confirmButton.addEventListener('click', handleConfirm);
    cancelButton.addEventListener('click', handleCancel);

    // Gérer la touche Entrée
    const handleKeyPress = (e) => {
      if (e.key === 'Enter') {
        handleConfirm();
      }
    };

    inputElement.addEventListener('keypress', handleKeyPress);

    this.open(modalId);
    
    // Focus sur l'input
    setTimeout(() => {
      inputElement.focus();
      inputElement.select();
    }, 100);
  }

  /**
   * Crée une modale de prompt
   */
  createPromptModal(modalId) {
    const modal = document.createElement('div');
    modal.id = modalId;
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-overlay" data-action="close-modal"></div>
      <div class="modal-container modal-container--small">
        <div class="modal-header">
          <h2 class="modal-title">Saisie</h2>
          <button class="modal-close" data-action="close-modal">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <p class="prompt-message"></p>
          <input type="text" class="form-input prompt-input" placeholder="Votre réponse...">
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" data-action="cancel">Annuler</button>
          <button class="btn btn-primary" data-action="confirm">Confirmer</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    return modal;
  }
}

// Créer et exporter une instance
const modal = new Modal();

export default modal; 