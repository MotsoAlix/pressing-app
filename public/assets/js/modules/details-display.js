/**
 * Module d'affichage des détails avec design moderne
 */

class DetailsDisplay {
    constructor() {
        this.modalContainer = null;
        this.init();
    }

    init() {
        this.createModalContainer();
        this.setupEventListeners();
    }

    createModalContainer() {
        if (document.getElementById('details-modal-container')) return;

        this.modalContainer = document.createElement('div');
        this.modalContainer.id = 'details-modal-container';
        this.modalContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(5px);
            z-index: 10000;
            display: none;
            align-items: center;
            justify-content: center;
            padding: 2rem;
            box-sizing: border-box;
        `;
        document.body.appendChild(this.modalContainer);
    }

    setupEventListeners() {
        // Fermer la modal en cliquant à l'extérieur
        this.modalContainer.addEventListener('click', (e) => {
            if (e.target === this.modalContainer) {
                this.closeModal();
            }
        });

        // Fermer avec Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modalContainer.style.display === 'flex') {
                this.closeModal();
            }
        });
    }

    showOrderDetails(order) {
        const customer = this.getCustomerInfo(order.customerId);
        const services = this.getOrderServices(order);
        
        const content = `
            <div class="details-modal">
                <div class="details-header">
                    <div class="details-title">
                        <h2><i class="fas fa-shopping-bag"></i> Détails de la commande</h2>
                        <span class="order-number">#${order.orderNumber}</span>
                    </div>
                    <button class="close-btn" onclick="detailsDisplay.closeModal()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="details-body">
                    <div class="details-grid">
                        <div class="details-section">
                            <h3><i class="fas fa-user"></i> Informations Client</h3>
                            <div class="info-card">
                                <div class="info-row">
                                    <span class="label">Nom complet:</span>
                                    <span class="value">${customer.firstName} ${customer.lastName}</span>
                                </div>
                                <div class="info-row">
                                    <span class="label">Téléphone:</span>
                                    <span class="value">${customer.phone || 'Non renseigné'}</span>
                                </div>
                                <div class="info-row">
                                    <span class="label">Email:</span>
                                    <span class="value">${customer.email || 'Non renseigné'}</span>
                                </div>
                                <div class="info-row">
                                    <span class="label">Adresse:</span>
                                    <span class="value">${customer.address || 'Non renseignée'}</span>
                                </div>
                            </div>
                        </div>

                        <div class="details-section">
                            <h3><i class="fas fa-calendar"></i> Informations Commande</h3>
                            <div class="info-card">
                                <div class="info-row">
                                    <span class="label">Date de création:</span>
                                    <span class="value">${new Date(order.createdAt).toLocaleDateString('fr-FR')}</span>
                                </div>
                                <div class="info-row">
                                    <span class="label">Date de livraison:</span>
                                    <span class="value">${new Date(order.deliveryDate).toLocaleDateString('fr-FR')}</span>
                                </div>
                                <div class="info-row">
                                    <span class="label">Statut:</span>
                                    <span class="value">
                                        <span class="status-badge status-${order.status}">
                                            ${this.getStatusLabel(order.status)}
                                        </span>
                                    </span>
                                </div>
                                <div class="info-row">
                                    <span class="label">Total:</span>
                                    <span class="value total-amount">${order.total} FCFA</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="details-section full-width">
                        <h3><i class="fas fa-list"></i> Services demandés</h3>
                        <div class="services-list">
                            ${services.map(service => `
                                <div class="service-item">
                                    <div class="service-info">
                                        <div class="service-name">${service.name}</div>
                                        <div class="service-details">
                                            Quantité: ${service.quantity} |
                                            Prix unitaire: ${service.price} €
                                        </div>
                                    </div>
                                    <div class="service-total">
                                        ${service.quantity * service.price} €
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    ${order.notes ? `
                        <div class="details-section full-width">
                            <h3><i class="fas fa-sticky-note"></i> Notes</h3>
                            <div class="notes-card">
                                ${order.notes}
                            </div>
                        </div>
                    ` : ''}
                </div>

                <div class="details-footer">
                    <button class="btn btn-outline" onclick="detailsDisplay.closeModal()">
                        Fermer
                    </button>
                    <button class="btn btn-primary" onclick="detailsDisplay.printOrderDetails('${order.id}')">
                        <i class="fas fa-print"></i> Imprimer
                    </button>
                    <button class="btn btn-success" onclick="detailsDisplay.updateOrderStatus('${order.id}')">
                        <i class="fas fa-edit"></i> Modifier statut
                    </button>
                </div>
            </div>
        `;

        this.modalContainer.innerHTML = content;
        this.modalContainer.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    showCustomerDetails(customer) {
        const orders = this.getCustomerOrders(customer.id);
        const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);
        
        const content = `
            <div class="details-modal">
                <div class="details-header">
                    <div class="details-title">
                        <h2><i class="fas fa-user"></i> Profil Client</h2>
                    </div>
                    <button class="close-btn" onclick="detailsDisplay.closeModal()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="details-body">
                    <div class="customer-profile">
                        <div class="profile-avatar">
                            <i class="fas fa-user-circle"></i>
                        </div>
                        <div class="profile-info">
                            <h3>${customer.firstName} ${customer.lastName}</h3>
                            <p class="customer-since">Client depuis ${new Date(customer.createdAt || Date.now()).toLocaleDateString('fr-FR')}</p>
                        </div>
                    </div>

                    <div class="details-grid">
                        <div class="details-section">
                            <h3><i class="fas fa-info-circle"></i> Informations personnelles</h3>
                            <div class="info-card">
                                <div class="info-row">
                                    <span class="label">Email:</span>
                                    <span class="value">${customer.email}</span>
                                </div>
                                <div class="info-row">
                                    <span class="label">Téléphone:</span>
                                    <span class="value">${customer.phone || 'Non renseigné'}</span>
                                </div>
                                <div class="info-row">
                                    <span class="label">Adresse:</span>
                                    <span class="value">${customer.address || 'Non renseignée'}</span>
                                </div>
                                <div class="info-row">
                                    <span class="label">Points de fidélité:</span>
                                    <span class="value loyalty-points">${customer.loyaltyPoints || 0} points</span>
                                </div>
                            </div>
                        </div>

                        <div class="details-section">
                            <h3><i class="fas fa-chart-line"></i> Statistiques</h3>
                            <div class="stats-grid">
                                <div class="stat-card">
                                    <div class="stat-value">${orders.length}</div>
                                    <div class="stat-label">Commandes</div>
                                </div>
                                <div class="stat-card">
                                    <div class="stat-value">${totalSpent} €</div>
                                    <div class="stat-label">Total dépensé</div>
                                </div>
                                <div class="stat-card">
                                    <div class="stat-value">${Math.round(totalSpent / Math.max(orders.length, 1))} €</div>
                                    <div class="stat-label">Panier moyen</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="details-section full-width">
                        <h3><i class="fas fa-history"></i> Historique des commandes</h3>
                        <div class="orders-history">
                            ${orders.length > 0 ? orders.slice(0, 5).map(order => `
                                <div class="history-item">
                                    <div class="history-info">
                                        <div class="history-title">#${order.orderNumber}</div>
                                        <div class="history-date">${new Date(order.createdAt).toLocaleDateString('fr-FR')}</div>
                                    </div>
                                    <div class="history-status">
                                        <span class="status-badge status-${order.status}">
                                            ${this.getStatusLabel(order.status)}
                                        </span>
                                    </div>
                                    <div class="history-amount">${order.total} FCFA</div>
                                </div>
                            `).join('') : '<p class="no-orders">Aucune commande trouvée</p>'}
                        </div>
                    </div>
                </div>

                <div class="details-footer">
                    <button class="btn btn-outline" onclick="detailsDisplay.closeModal()">
                        Fermer
                    </button>
                    <button class="btn btn-primary" onclick="detailsDisplay.contactCustomer('${customer.id}')">
                        <i class="fas fa-envelope"></i> Contacter
                    </button>
                    <button class="btn btn-success" onclick="detailsDisplay.editCustomer('${customer.id}')">
                        <i class="fas fa-edit"></i> Modifier
                    </button>
                </div>
            </div>
        `;

        this.modalContainer.innerHTML = content;
        this.modalContainer.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        this.modalContainer.style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    getCustomerInfo(customerId) {
        const users = JSON.parse(localStorage.getItem('manohpressing_users') || '[]');
        return users.find(user => user.id === customerId) || {
            firstName: 'Client',
            lastName: 'Inconnu',
            email: 'Non renseigné',
            phone: 'Non renseigné',
            address: 'Non renseignée'
        };
    }

    getOrderServices(order) {
        return order.services || [
            { name: 'Service standard', quantity: 1, price: order.total || 0 }
        ];
    }

    getCustomerOrders(customerId) {
        const orders = JSON.parse(localStorage.getItem('manohpressing_orders') || '[]');
        return orders.filter(order => order.customerId === customerId);
    }

    getStatusLabel(status) {
        const labels = {
            'pending': 'En attente',
            'in_progress': 'En cours',
            'ready': 'Prêt',
            'delivered': 'Livré',
            'cancelled': 'Annulé'
        };
        return labels[status] || status;
    }

    printOrderDetails(orderId) {
        if (window.pdfGenerator) {
            const orders = JSON.parse(localStorage.getItem('manohpressing_orders') || '[]');
            const order = orders.find(o => o.id == orderId);
            if (order) {
                window.pdfGenerator.generateReceipt(order);
                if (window.showToast) {
                    showToast('Reçu généré avec succès', 'success');
                }
            }
        } else {
            window.print();
        }
    }

    updateOrderStatus(orderId) {
        const newStatus = prompt('Nouveau statut (pending, in_progress, ready, delivered, cancelled):');
        if (newStatus) {
            const orders = JSON.parse(localStorage.getItem('manohpressing_orders') || '[]');
            const orderIndex = orders.findIndex(o => o.id == orderId);
            if (orderIndex !== -1) {
                orders[orderIndex].status = newStatus;
                localStorage.setItem('manohpressing_orders', JSON.stringify(orders));
                this.closeModal();
                if (window.showToast) {
                    showToast('Statut mis à jour avec succès', 'success');
                }
                // Recharger la section active
                if (typeof loadOrdersSection === 'function') {
                    loadOrdersSection();
                }
            }
        }
    }

    contactCustomer(customerId) {
        if (window.chatManager) {
            window.chatManager.selectConversation(customerId);
            window.chatManager.toggleChat();
            this.closeModal();
        } else {
            if (window.showToast) {
                showToast('Fonction de chat non disponible', 'warning');
            }
        }
    }

    editCustomer(customerId) {
        this.closeModal();
        if (window.showToast) {
            showToast('Fonction d\'édition en cours de développement', 'info');
        }
    }
}

// Styles CSS pour les modals de détails
const detailsStyles = `
<style>
.details-modal {
    background: white;
    border-radius: 12px;
    max-width: 900px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
    from {
        opacity: 0;
        transform: translateY(-50px) scale(0.95);
    }
    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}

.details-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 2rem;
    border-bottom: 1px solid #e5e7eb;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-radius: 12px 12px 0 0;
}

.details-title h2 {
    margin: 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.order-number {
    background: rgba(255, 255, 255, 0.2);
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-size: 0.875rem;
    margin-left: 1rem;
}

.close-btn {
    background: none;
    border: none;
    color: white;
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 50%;
    transition: background-color 0.2s;
}

.close-btn:hover {
    background: rgba(255, 255, 255, 0.2);
}

.details-body {
    padding: 2rem;
}

.details-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
    margin-bottom: 2rem;
}

.details-section h3 {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
    color: #374151;
    font-size: 1.125rem;
}

.full-width {
    grid-column: 1 / -1;
}

.info-card, .notes-card {
    background: #f9fafb;
    border-radius: 8px;
    padding: 1.5rem;
    border: 1px solid #e5e7eb;
}

.info-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 0;
    border-bottom: 1px solid #e5e7eb;
}

.info-row:last-child {
    border-bottom: none;
}

.label {
    font-weight: 500;
    color: #6b7280;
}

.value {
    font-weight: 600;
    color: #111827;
}

.total-amount {
    color: #059669;
    font-size: 1.125rem;
}

.loyalty-points {
    color: #7c3aed;
}

.status-badge {
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
}

.status-pending { background: #fef3c7; color: #92400e; }
.status-in_progress { background: #dbeafe; color: #1e40af; }
.status-ready { background: #d1fae5; color: #065f46; }
.status-delivered { background: #dcfce7; color: #166534; }
.status-cancelled { background: #fee2e2; color: #991b1b; }

.services-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.service-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    background: #f9fafb;
    border-radius: 8px;
    border: 1px solid #e5e7eb;
}

.service-name {
    font-weight: 600;
    color: #111827;
}

.service-details {
    font-size: 0.875rem;
    color: #6b7280;
    margin-top: 0.25rem;
}

.service-total {
    font-weight: 600;
    color: #059669;
    font-size: 1.125rem;
}

.customer-profile {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 2rem;
    padding: 1.5rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-radius: 8px;
}

.profile-avatar i {
    font-size: 4rem;
    opacity: 0.8;
}

.profile-info h3 {
    margin: 0 0 0.5rem 0;
    font-size: 1.5rem;
}

.customer-since {
    margin: 0;
    opacity: 0.8;
}

.stats-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
}

.stat-card {
    text-align: center;
    padding: 1rem;
    background: #f9fafb;
    border-radius: 8px;
    border: 1px solid #e5e7eb;
}

.stat-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: #111827;
    margin-bottom: 0.25rem;
}

.stat-label {
    font-size: 0.875rem;
    color: #6b7280;
}

.orders-history {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.history-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    background: #f9fafb;
    border-radius: 8px;
    border: 1px solid #e5e7eb;
}

.history-title {
    font-weight: 600;
    color: #111827;
}

.history-date {
    font-size: 0.875rem;
    color: #6b7280;
}

.history-amount {
    font-weight: 600;
    color: #059669;
}

.details-footer {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    padding: 2rem;
    border-top: 1px solid #e5e7eb;
    background: #f9fafb;
    border-radius: 0 0 12px 12px;
}

.no-orders {
    text-align: center;
    color: #6b7280;
    font-style: italic;
    padding: 2rem;
}

@media (max-width: 768px) {
    .details-modal {
        margin: 1rem;
        max-height: calc(100vh - 2rem);
    }
    
    .details-grid {
        grid-template-columns: 1fr;
        gap: 1rem;
    }
    
    .stats-grid {
        grid-template-columns: 1fr;
    }
    
    .details-footer {
        flex-direction: column;
    }
}
</style>
`;

// Injecter les styles
document.head.insertAdjacentHTML('beforeend', detailsStyles);

// Instance globale
const detailsDisplay = new DetailsDisplay();
window.detailsDisplay = detailsDisplay;
