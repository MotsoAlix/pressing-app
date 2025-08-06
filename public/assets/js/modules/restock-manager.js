/**
 * Gestionnaire de demandes de réapprovisionnement
 * Permet aux gérants de demander du réapprovisionnement à l'admin
 */

class RestockManager {
    constructor() {
        this.requests = [];
        this.currentUser = null;
        this.init();
    }

    init() {
        // Récupérer l'utilisateur actuel
        const userData = localStorage.getItem('user');
        if (userData) {
            this.currentUser = JSON.parse(userData);
        }

        this.loadRequests();
    }

    loadRequests() {
        const saved = localStorage.getItem('manohpressing_restock_requests');
        if (saved) {
            this.requests = JSON.parse(saved);
        }
    }

    saveRequests() {
        localStorage.setItem('manohpressing_restock_requests', JSON.stringify(this.requests));
    }

    createRestockRequest(stockItem, requestedQuantity, urgency = 'normal', notes = '') {
        if (!this.currentUser || this.currentUser.role !== 'manager') {
            console.error('Seuls les gérants peuvent créer des demandes de réapprovisionnement');
            return false;
        }

        const request = {
            id: Date.now().toString(),
            stockItemId: stockItem.id,
            itemName: stockItem.name,
            currentQuantity: stockItem.quantity,
            requestedQuantity: requestedQuantity,
            urgency: urgency, // 'low', 'normal', 'high', 'urgent'
            notes: notes,
            managerId: this.currentUser.id,
            managerName: `${this.currentUser.firstName} ${this.currentUser.lastName}`,
            status: 'pending', // 'pending', 'approved', 'rejected', 'completed'
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        this.requests.push(request);
        this.saveRequests();

        // Déclencher un événement pour notifier l'admin
        this.notifyAdmin(request);

        return request;
    }

    notifyAdmin(request) {
        // Déclencher un événement storage pour notifier l'admin
        window.dispatchEvent(new StorageEvent('storage', {
            key: 'manohpressing_restock_requests',
            newValue: JSON.stringify(this.requests)
        }));

        // Créer aussi une notification directe pour l'admin
        const adminNotifications = JSON.parse(localStorage.getItem('manohpressing_admin_notifications') || '[]');
        
        adminNotifications.unshift({
            id: `restock_${request.id}`,
            type: 'restock_request',
            title: 'Nouvelle demande de réapprovisionnement',
            message: `${request.managerName} demande le réapprovisionnement de "${request.itemName}" (${request.requestedQuantity} unités)`,
            data: request,
            timestamp: new Date().toISOString(),
            isRead: false,
            priority: request.urgency === 'urgent' ? 'high' : 'normal'
        });

        localStorage.setItem('manohpressing_admin_notifications', JSON.stringify(adminNotifications));
    }

    getRequestsByManager(managerId = null) {
        const id = managerId || this.currentUser?.id;
        return this.requests.filter(req => req.managerId === id);
    }

    getAllRequests() {
        return this.requests;
    }

    updateRequestStatus(requestId, status, notes = '') {
        const request = this.requests.find(req => req.id === requestId);
        if (request) {
            request.status = status;
            request.updatedAt = new Date().toISOString();
            if (notes) {
                request.adminNotes = notes;
            }
            this.saveRequests();
            return request;
        }
        return null;
    }

    deleteRequest(requestId) {
        this.requests = this.requests.filter(req => req.id !== requestId);
        this.saveRequests();
    }

    getUrgencyLabel(urgency) {
        const labels = {
            'low': 'Faible',
            'normal': 'Normal',
            'high': 'Élevé',
            'urgent': 'Urgent'
        };
        return labels[urgency] || urgency;
    }

    getUrgencyColor(urgency) {
        const colors = {
            'low': '#10b981',
            'normal': '#2563eb',
            'high': '#f59e0b',
            'urgent': '#ef4444'
        };
        return colors[urgency] || '#64748b';
    }

    getStatusLabel(status) {
        const labels = {
            'pending': 'En attente',
            'approved': 'Approuvé',
            'rejected': 'Rejeté',
            'completed': 'Terminé'
        };
        return labels[status] || status;
    }

    getStatusColor(status) {
        const colors = {
            'pending': '#f59e0b',
            'approved': '#10b981',
            'rejected': '#ef4444',
            'completed': '#64748b'
        };
        return colors[status] || '#64748b';
    }

    renderRequestsTable(containerId, showAllRequests = false) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const requests = showAllRequests ? this.getAllRequests() : this.getRequestsByManager();

        if (requests.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 3rem; color: var(--text-secondary);">
                    <i class="fas fa-clipboard-list" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.3;"></i>
                    <h3>Aucune demande de réapprovisionnement</h3>
                    <p>Les demandes apparaîtront ici</p>
                </div>
            `;
            return;
        }

        const tableHTML = `
            <div class="table-container">
                <table class="restock-table">
                    <thead>
                        <tr>
                            <th>Article</th>
                            <th>Stock actuel</th>
                            <th>Quantité demandée</th>
                            <th>Urgence</th>
                            <th>Statut</th>
                            ${showAllRequests ? '<th>Gérant</th>' : ''}
                            <th>Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${requests.map(request => `
                            <tr class="restock-row ${request.status}">
                                <td>
                                    <strong>${request.itemName}</strong>
                                    ${request.notes ? `<br><small style="color: var(--text-secondary);">${request.notes}</small>` : ''}
                                </td>
                                <td>
                                    <span class="quantity-badge ${request.currentQuantity <= 5 ? 'low' : ''}">${request.currentQuantity}</span>
                                </td>
                                <td>
                                    <span class="quantity-badge requested">${request.requestedQuantity}</span>
                                </td>
                                <td>
                                    <span class="urgency-badge" style="background-color: ${this.getUrgencyColor(request.urgency)};">
                                        ${this.getUrgencyLabel(request.urgency)}
                                    </span>
                                </td>
                                <td>
                                    <span class="status-badge" style="background-color: ${this.getStatusColor(request.status)};">
                                        ${this.getStatusLabel(request.status)}
                                    </span>
                                </td>
                                ${showAllRequests ? `<td>${request.managerName}</td>` : ''}
                                <td>${new Date(request.createdAt).toLocaleDateString('fr-FR')}</td>
                                <td>
                                    <div class="action-buttons">
                                        ${this.getActionButtons(request, showAllRequests)}
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;

        container.innerHTML = tableHTML;
    }

    getActionButtons(request, isAdmin = false) {
        let buttons = '';

        if (isAdmin && request.status === 'pending') {
            buttons += `
                <button class="btn btn-sm btn-success" onclick="restockManager.approveRequest('${request.id}')">
                    <i class="fas fa-check"></i> Approuver
                </button>
                <button class="btn btn-sm btn-danger" onclick="restockManager.rejectRequest('${request.id}')">
                    <i class="fas fa-times"></i> Rejeter
                </button>
            `;
        }

        if (!isAdmin && request.status === 'pending') {
            buttons += `
                <button class="btn btn-sm btn-outline" onclick="restockManager.editRequest('${request.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="restockManager.cancelRequest('${request.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            `;
        }

        buttons += `
            <button class="btn btn-sm btn-outline" onclick="restockManager.viewRequestDetails('${request.id}')">
                <i class="fas fa-eye"></i>
            </button>
        `;

        return buttons;
    }

    approveRequest(requestId) {
        const request = this.updateRequestStatus(requestId, 'approved');
        if (request && window.showToast) {
            showToast(`Demande de ${request.managerName} approuvée`, 'success');
        }
        this.refreshDisplay();
    }

    rejectRequest(requestId) {
        const reason = prompt('Raison du rejet (optionnel):');
        const request = this.updateRequestStatus(requestId, 'rejected', reason);
        if (request && window.showToast) {
            showToast(`Demande de ${request.managerName} rejetée`, 'info');
        }
        this.refreshDisplay();
    }

    cancelRequest(requestId) {
        if (confirm('Êtes-vous sûr de vouloir annuler cette demande ?')) {
            this.deleteRequest(requestId);
            if (window.showToast) {
                showToast('Demande annulée', 'info');
            }
            this.refreshDisplay();
        }
    }

    editRequest(requestId) {
        const request = this.requests.find(req => req.id === requestId);
        if (!request) return;

        // Ouvrir un modal d'édition (à implémenter selon l'interface)
        if (window.showToast) {
            showToast('Fonction d\'édition en développement', 'info');
        }
    }

    viewRequestDetails(requestId) {
        const request = this.requests.find(req => req.id === requestId);
        if (!request) return;

        // Afficher les détails dans un modal (à implémenter selon l'interface)
        alert(`Détails de la demande:
        
Article: ${request.itemName}
Stock actuel: ${request.currentQuantity}
Quantité demandée: ${request.requestedQuantity}
Urgence: ${this.getUrgencyLabel(request.urgency)}
Statut: ${this.getStatusLabel(request.status)}
Gérant: ${request.managerName}
Date: ${new Date(request.createdAt).toLocaleString('fr-FR')}
${request.notes ? `Notes: ${request.notes}` : ''}
${request.adminNotes ? `Notes admin: ${request.adminNotes}` : ''}`);
    }

    refreshDisplay() {
        // Rafraîchir l'affichage des tableaux
        const containers = ['restock-requests-table', 'admin-restock-requests-table'];
        containers.forEach(containerId => {
            const container = document.getElementById(containerId);
            if (container) {
                this.renderRequestsTable(containerId, containerId.includes('admin'));
            }
        });
    }

    // Méthode utilitaire pour créer une demande depuis l'interface
    showCreateRequestModal(stockItem) {
        // Cette méthode sera appelée depuis l'interface utilisateur
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Demande de réapprovisionnement</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="restock-request-form">
                        <div class="form-group">
                            <label>Article:</label>
                            <input type="text" value="${stockItem.name}" readonly>
                        </div>
                        <div class="form-group">
                            <label>Stock actuel:</label>
                            <input type="text" value="${stockItem.quantity} ${stockItem.unit}" readonly>
                        </div>
                        <div class="form-group">
                            <label>Quantité demandée:</label>
                            <input type="number" id="requested-quantity" min="1" required>
                        </div>
                        <div class="form-group">
                            <label>Urgence:</label>
                            <select id="urgency">
                                <option value="low">Faible</option>
                                <option value="normal" selected>Normal</option>
                                <option value="high">Élevé</option>
                                <option value="urgent">Urgent</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Notes (optionnel):</label>
                            <textarea id="notes" rows="3"></textarea>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-outline" onclick="this.closest('.modal').remove()">Annuler</button>
                    <button class="btn btn-primary" onclick="restockManager.submitRequest('${stockItem.id}')">Envoyer la demande</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        modal.style.display = 'flex';
    }

    submitRequest(stockItemId) {
        const form = document.getElementById('restock-request-form');
        const requestedQuantity = parseInt(document.getElementById('requested-quantity').value);
        const urgency = document.getElementById('urgency').value;
        const notes = document.getElementById('notes').value;

        if (!requestedQuantity || requestedQuantity <= 0) {
            alert('Veuillez saisir une quantité valide');
            return;
        }

        // Récupérer l'article de stock
        const stockResult = JSON.parse(localStorage.getItem('manohpressing_stock') || '[]');
        const stockItem = stockResult.find(item => item.id == stockItemId);

        if (!stockItem) {
            alert('Article non trouvé');
            return;
        }

        const request = this.createRestockRequest(stockItem, requestedQuantity, urgency, notes);
        
        if (request) {
            if (window.showToast) {
                showToast('Demande de réapprovisionnement envoyée à l\'administrateur', 'success');
            }
            
            // Fermer le modal
            document.querySelector('.modal').remove();
            
            // Rafraîchir l'affichage
            this.refreshDisplay();
        }
    }
}

// Initialiser le gestionnaire de réapprovisionnement
const restockManager = new RestockManager();
window.restockManager = restockManager;
