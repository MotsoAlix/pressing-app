/**
 * Module de génération de rapports fonctionnel
 */

class ReportsManager {
    constructor() {
        this.reports = [];
        this.init();
    }

    init() {
        this.loadReports();
    }

    loadReports() {
        const saved = localStorage.getItem('manohpressing_reports');
        if (saved) {
            this.reports = JSON.parse(saved);
        }
    }

    saveReports() {
        localStorage.setItem('manohpressing_reports', JSON.stringify(this.reports));
    }

    async generateReport(type, dateRange = null) {
        try {
            // Afficher une notification de génération
            if (window.showToast) {
                showToast('Génération du rapport en cours...', 'info');
            }

            // Récupérer les données réelles
            const reportData = await this.generateReportData(type, dateRange);
            
            const report = {
                id: Date.now().toString(),
                type: type,
                name: this.getReportName(type),
                dateRange: dateRange,
                generatedAt: new Date().toISOString(),
                data: reportData
            };

            this.reports.unshift(report);
            this.saveReports();

            // Générer le PDF si le module est disponible
            if (window.pdfGenerator) {
                const doc = await window.pdfGenerator.generateReport(reportData, type);
                window.pdfGenerator.downloadPDF(doc, `rapport_${type}_${new Date().toISOString().split('T')[0]}.pdf`);
                
                if (window.showToast) {
                    showToast('Rapport généré et téléchargé avec succès !', 'success');
                }
            } else {
                if (window.showToast) {
                    showToast('Rapport généré avec succès !', 'success');
                }
            }

            return report;
        } catch (error) {
            console.error('Erreur lors de la génération du rapport:', error);
            if (window.showToast) {
                showToast('Erreur lors de la génération du rapport', 'error');
            }
            throw error;
        }
    }

    getReportName(type) {
        const names = {
            'daily': 'Rapport Journalier',
            'weekly': 'Rapport Hebdomadaire',
            'monthly': 'Rapport Mensuel',
            'customers': 'Rapport Clients',
            'revenue': 'Rapport Chiffre d\'Affaires',
            'orders': 'Rapport Commandes',
            'stock': 'Rapport Stock',
            'financial': 'Rapport Financier'
        };
        return names[type] || 'Rapport';
    }

    async generateReportData(type, dateRange) {
        // Récupérer les données réelles depuis localStorage
        const orders = JSON.parse(localStorage.getItem('manohpressing_orders') || '[]');
        const users = JSON.parse(localStorage.getItem('manohpressing_users') || '[]');
        const stock = JSON.parse(localStorage.getItem('manohpressing_stock') || '[]');
        
        const now = new Date();
        let filteredOrders = orders;
        
        // Filtrer par période si spécifiée
        if (dateRange) {
            const startDate = new Date(dateRange.start);
            const endDate = new Date(dateRange.end);
            filteredOrders = orders.filter(order => {
                const orderDate = new Date(order.createdAt);
                return orderDate >= startDate && orderDate <= endDate;
            });
        } else {
            // Filtrer par type de rapport
            switch (type) {
                case 'daily':
                    filteredOrders = orders.filter(order => {
                        const orderDate = new Date(order.createdAt);
                        return orderDate.toDateString() === now.toDateString();
                    });
                    break;
                case 'weekly':
                    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    filteredOrders = orders.filter(order => {
                        const orderDate = new Date(order.createdAt);
                        return orderDate >= weekAgo;
                    });
                    break;
                case 'monthly':
                    filteredOrders = orders.filter(order => {
                        const orderDate = new Date(order.createdAt);
                        return orderDate.getMonth() === now.getMonth() && 
                               orderDate.getFullYear() === now.getFullYear();
                    });
                    break;
            }
        }

        // Calculer les statistiques
        const totalRevenue = filteredOrders.reduce((sum, order) => sum + (order.total || 0), 0);
        const averageOrderValue = filteredOrders.length > 0 ? totalRevenue / filteredOrders.length : 0;
        const customers = users.filter(user => user.role === 'client');
        
        // Données spécifiques par type de rapport
        let specificData = {};
        
        switch (type) {
            case 'customers':
                specificData = {
                    customers: customers.map(customer => ({
                        id: customer.id,
                        name: `${customer.firstName} ${customer.lastName}`,
                        email: customer.email,
                        totalOrders: orders.filter(o => o.customerId === customer.id).length,
                        totalSpent: orders.filter(o => o.customerId === customer.id)
                                         .reduce((sum, o) => sum + (o.total || 0), 0),
                        loyaltyPoints: customer.loyaltyPoints || 0
                    }))
                };
                break;
                
            case 'stock':
                specificData = {
                    stockItems: stock.map(item => ({
                        name: item.name,
                        quantity: item.quantity,
                        minQuantity: item.minQuantity,
                        unitPrice: item.unitPrice,
                        totalValue: item.quantity * item.unitPrice,
                        status: item.quantity <= item.minQuantity ? 'low' : 'normal'
                    }))
                };
                break;
                
            case 'financial':
                const monthlyRevenue = [];
                for (let i = 11; i >= 0; i--) {
                    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
                    const monthOrders = orders.filter(order => {
                        const orderDate = new Date(order.createdAt);
                        return orderDate.getMonth() === date.getMonth() && 
                               orderDate.getFullYear() === date.getFullYear();
                    });
                    monthlyRevenue.push({
                        month: date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }),
                        revenue: monthOrders.reduce((sum, order) => sum + (order.total || 0), 0),
                        orders: monthOrders.length
                    });
                }
                specificData = {
                    monthlyRevenue,
                    totalRevenue,
                    transactionCount: filteredOrders.length,
                    averageTicket: averageOrderValue,
                    growth: monthlyRevenue.length > 1 ? 
                        ((monthlyRevenue[monthlyRevenue.length - 1].revenue - monthlyRevenue[monthlyRevenue.length - 2].revenue) / 
                         monthlyRevenue[monthlyRevenue.length - 2].revenue * 100) : 0
                };
                break;
        }

        return {
            summary: {
                totalOrders: filteredOrders.length,
                totalRevenue: totalRevenue,
                averageOrderValue: averageOrderValue,
                customerCount: customers.length,
                period: this.getPeriodLabel(type, dateRange)
            },
            orders: filteredOrders,
            ...specificData
        };
    }

    getPeriodLabel(type, dateRange) {
        if (dateRange) {
            return `Du ${new Date(dateRange.start).toLocaleDateString('fr-FR')} au ${new Date(dateRange.end).toLocaleDateString('fr-FR')}`;
        }
        
        const labels = {
            'daily': `Aujourd'hui (${new Date().toLocaleDateString('fr-FR')})`,
            'weekly': 'Les 7 derniers jours',
            'monthly': `${new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}`,
            'customers': 'Tous les clients',
            'stock': 'État actuel du stock',
            'financial': 'Analyse financière (12 derniers mois)'
        };
        
        return labels[type] || 'Période non spécifiée';
    }

    getReports() {
        return this.reports;
    }

    deleteReport(reportId) {
        this.reports = this.reports.filter(r => r.id !== reportId);
        this.saveReports();
        
        if (window.showToast) {
            showToast('Rapport supprimé', 'info');
        }
    }

    exportReport(reportId, format = 'pdf') {
        const report = this.reports.find(r => r.id === reportId);
        if (!report) {
            if (window.showToast) {
                showToast('Rapport non trouvé', 'error');
            }
            return;
        }

        if (format === 'pdf' && window.pdfGenerator) {
            window.pdfGenerator.generateReport(report.data, report.type)
                .then(doc => {
                    window.pdfGenerator.downloadPDF(doc, `${report.name}_${new Date().toISOString().split('T')[0]}.pdf`);
                    if (window.showToast) {
                        showToast('Rapport exporté en PDF', 'success');
                    }
                })
                .catch(error => {
                    console.error('Erreur lors de l\'export PDF:', error);
                    if (window.showToast) {
                        showToast('Erreur lors de l\'export PDF', 'error');
                    }
                });
        } else {
            // Export JSON par défaut
            const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `${report.name}_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            if (window.showToast) {
                showToast('Rapport exporté en JSON', 'success');
            }
        }
    }

    renderReportsList(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (this.reports.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 3rem; color: var(--text-secondary);">
                    <i class="fas fa-chart-bar" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.3;"></i>
                    <h3>Aucun rapport généré</h3>
                    <p>Les rapports générés apparaîtront ici</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.reports.map(report => `
            <div class="report-item" style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; border: 1px solid var(--border-color); border-radius: var(--radius-md); margin-bottom: 1rem;">
                <div class="report-info">
                    <h4 style="margin-bottom: 0.5rem;">${report.name}</h4>
                    <p style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 0.25rem;">Généré le ${new Date(report.generatedAt).toLocaleDateString('fr-FR')} à ${new Date(report.generatedAt).toLocaleTimeString('fr-FR')}</p>
                    <p style="font-size: 0.875rem; color: var(--text-secondary);">Période: ${report.data.summary.period}</p>
                </div>
                <div class="report-stats" style="display: flex; gap: 2rem;">
                    <div class="stat" style="text-align: center;">
                        <div style="font-size: 1.5rem; font-weight: 600; color: var(--primary-color);">${report.data.summary.totalOrders}</div>
                        <div style="font-size: 0.75rem; color: var(--text-secondary);">Commandes</div>
                    </div>
                    <div class="stat" style="text-align: center;">
                        <div style="font-size: 1.5rem; font-weight: 600; color: var(--success-color);">€${report.data.summary.totalRevenue.toFixed(2)}</div>
                        <div style="font-size: 0.75rem; color: var(--text-secondary);">Chiffre d'affaires</div>
                    </div>
                </div>
                <div class="report-actions" style="display: flex; gap: 0.5rem;">
                    <button class="btn btn-sm btn-primary" onclick="reportsManager.exportReport('${report.id}', 'pdf')">
                        <i class="fas fa-file-pdf"></i> PDF
                    </button>
                    <button class="btn btn-sm btn-outline" onclick="reportsManager.exportReport('${report.id}', 'json')">
                        <i class="fas fa-download"></i> JSON
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="reportsManager.deleteReport('${report.id}'); reportsManager.renderReportsList('${containerId}');">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }
}

// Instance globale
const reportsManager = new ReportsManager();
window.reportsManager = reportsManager;
