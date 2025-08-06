/**
 * Module Reports
 * Gère la génération de rapports et analyses
 */
import api from '../core/api.js';
import toast from '../components/toast.js';
import auth from './auth.js';

class Reports {
  constructor() {
    this.currentPeriod = 'week';
    this.startDate = null;
    this.endDate = null;
    this.charts = {};
    this.isInitialized = false;
  }

  /**
   * Initialise le module reports
   */
  async init() {
    try {
      console.log('📊 Initialisation du module reports...');
      
      // Initialiser les dates par défaut
      this.initDefaultDates();
      
      // Charger les données initiales
      await this.loadMetrics();
      await this.loadCharts();
      await this.loadTopPerformers();
      
      // Initialiser les événements
      this.initEvents();
      
      this.isInitialized = true;
      console.log('✅ Module reports initialisé');
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation du module reports:', error);
      toast.error('Erreur lors du chargement des rapports');
    }
  }

  /**
   * Initialise les dates par défaut
   */
  initDefaultDates() {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    
    this.startDate = startOfWeek.toISOString().split('T')[0];
    this.endDate = today.toISOString().split('T')[0];
    
    // Mettre à jour les inputs de date
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    
    if (startDateInput) startDateInput.value = this.startDate;
    if (endDateInput) endDateInput.value = this.endDate;
  }

  /**
   * Charge les métriques clés
   */
  async loadMetrics() {
    try {
      const params = new URLSearchParams({
        start_date: this.startDate,
        end_date: this.endDate
      });

      const response = await api.get(`/reports/metrics?${params}`);
      const metrics = response.data;
      
      this.updateMetric('revenueMetric', metrics.revenue || 0);
      this.updateMetric('ordersMetric', metrics.orders || 0);
      this.updateMetric('customersMetric', metrics.customers || 0);
      this.updateMetric('averageMetric', metrics.average || 0);
      
    } catch (error) {
      console.error('Erreur lors du chargement des métriques:', error);
      // Utiliser des données de démonstration
      this.loadDemoMetrics();
    }
  }

  /**
   * Charge des métriques de démonstration
   */
  loadDemoMetrics() {
    this.updateMetric('revenueMetric', 1250.50);
    this.updateMetric('ordersMetric', 45);
    this.updateMetric('customersMetric', 28);
    this.updateMetric('averageMetric', 27.78);
  }

  /**
   * Met à jour une métrique
   */
  updateMetric(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
      if (elementId.includes('Metric') && elementId.includes('revenue')) {
        element.textContent = `${value.toFixed(2)}€`;
      } else if (elementId.includes('Metric') && elementId.includes('average')) {
        element.textContent = `${value.toFixed(2)}€`;
      } else {
        element.textContent = value;
      }
    }
  }

  /**
   * Charge les graphiques
   */
  async loadCharts() {
    try {
      const params = new URLSearchParams({
        start_date: this.startDate,
        end_date: this.endDate
      });

      const response = await api.get(`/reports/charts?${params}`);
      const chartData = response.data;
      
      this.initRevenueChart(chartData.revenue || this.getDemoRevenueData());
      this.initOrdersChart(chartData.orders || this.getDemoOrdersData());
      this.initServicesChart(chartData.services || this.getDemoServicesData());
      this.initPerformanceChart(chartData.performance || this.getDemoPerformanceData());
      
    } catch (error) {
      console.error('Erreur lors du chargement des graphiques:', error);
      // Utiliser des données de démonstration
      this.loadDemoCharts();
    }
  }

  /**
   * Charge des graphiques de démonstration
   */
  loadDemoCharts() {
    this.initRevenueChart(this.getDemoRevenueData());
    this.initOrdersChart(this.getDemoOrdersData());
    this.initServicesChart(this.getDemoServicesData());
    this.initPerformanceChart(this.getDemoPerformanceData());
  }

  /**
   * Initialise le graphique des revenus
   */
  initRevenueChart(data) {
    const ctx = document.getElementById('revenueChart');
    if (!ctx) return;

    if (this.charts.revenue) {
      this.charts.revenue.destroy();
    }

    this.charts.revenue = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.labels,
        datasets: [{
          label: 'Revenus (€)',
          data: data.values,
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return value + '€';
              }
            }
          }
        }
      }
    });
  }

  /**
   * Initialise le graphique des commandes
   */
  initOrdersChart(data) {
    const ctx = document.getElementById('ordersChart');
    if (!ctx) return;

    if (this.charts.orders) {
      this.charts.orders.destroy();
    }

    this.charts.orders = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: data.labels,
        datasets: [{
          data: data.values,
          backgroundColor: [
            '#10b981',
            '#f59e0b',
            '#3b82f6',
            '#ef4444',
            '#8b5cf6'
          ],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    });
  }

  /**
   * Initialise le graphique des services
   */
  initServicesChart(data) {
    const ctx = document.getElementById('servicesChart');
    if (!ctx) return;

    if (this.charts.services) {
      this.charts.services.destroy();
    }

    this.charts.services = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.labels,
        datasets: [{
          label: 'Nombre de commandes',
          data: data.values,
          backgroundColor: '#3b82f6',
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

  /**
   * Initialise le graphique de performance
   */
  initPerformanceChart(data) {
    const ctx = document.getElementById('performanceChart');
    if (!ctx) return;

    if (this.charts.performance) {
      this.charts.performance.destroy();
    }

    this.charts.performance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.labels,
        datasets: [{
          label: 'Commandes',
          data: data.orders,
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          yAxisID: 'y'
        }, {
          label: 'Revenus (€)',
          data: data.revenue,
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          yAxisID: 'y1'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        plugins: {
          legend: {
            position: 'top',
          }
        },
        scales: {
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            title: {
              display: true,
              text: 'Commandes'
            }
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            title: {
              display: true,
              text: 'Revenus (€)'
            },
            grid: {
              drawOnChartArea: false,
            },
          }
        }
      }
    });
  }

  /**
   * Génère des données de démonstration pour les revenus
   */
  getDemoRevenueData() {
    return {
      labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
      values: [150, 220, 180, 300, 280, 350, 200]
    };
  }

  /**
   * Génère des données de démonstration pour les commandes
   */
  getDemoOrdersData() {
    return {
      labels: ['Complétées', 'En cours', 'En attente', 'Annulées'],
      values: [35, 8, 2, 1]
    };
  }

  /**
   * Génère des données de démonstration pour les services
   */
  getDemoServicesData() {
    return {
      labels: ['Nettoyage à sec', 'Repassage', 'Lavage', 'Retouche', 'Blanchisserie'],
      values: [15, 12, 8, 6, 4]
    };
  }

  /**
   * Génère des données de démonstration pour la performance
   */
  getDemoPerformanceData() {
    return {
      labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
      orders: [8, 12, 6, 15, 10, 18, 7],
      revenue: [240, 360, 180, 450, 300, 540, 210]
    };
  }

  /**
   * Charge les meilleurs clients
   */
  async loadTopPerformers() {
    try {
      const params = new URLSearchParams({
        start_date: this.startDate,
        end_date: this.endDate,
        limit: 5
      });

      const response = await api.get(`/reports/top-performers?${params}`);
      const performers = response.data || [];
      
      this.renderTopPerformers(performers);
      
    } catch (error) {
      console.error('Erreur lors du chargement des meilleurs clients:', error);
      // Utiliser des données de démonstration
      this.loadDemoTopPerformers();
    }
  }

  /**
   * Charge des meilleurs clients de démonstration
   */
  loadDemoTopPerformers() {
    const performers = [
      {
        id: 1,
        name: 'Marie Martin',
        total_orders: 15,
        total_spent: 450.00,
        last_order: '2024-01-15T10:30:00Z'
      },
      {
        id: 2,
        name: 'Jean Dupont',
        total_orders: 12,
        total_spent: 380.00,
        last_order: '2024-01-14T14:15:00Z'
      },
      {
        id: 3,
        name: 'Sophie Bernard',
        total_orders: 10,
        total_spent: 320.00,
        last_order: '2024-01-13T16:45:00Z'
      },
      {
        id: 4,
        name: 'Pierre Durand',
        total_orders: 8,
        total_spent: 280.00,
        last_order: '2024-01-12T11:20:00Z'
      },
      {
        id: 5,
        name: 'Claire Moreau',
        total_orders: 6,
        total_spent: 220.00,
        last_order: '2024-01-11T09:30:00Z'
      }
    ];
    
    this.renderTopPerformers(performers);
  }

  /**
   * Affiche les meilleurs clients
   */
  renderTopPerformers(performers) {
    const container = document.getElementById('topPerformers');
    if (!container) return;

    if (performers.length === 0) {
      container.innerHTML = `
        <div class="performers-empty">
          <p>Aucun client trouvé pour cette période</p>
        </div>
      `;
      return;
    }

    container.innerHTML = performers.map((performer, index) => `
      <div class="performer-item">
        <div class="performer-rank">
          <span class="rank-number">${index + 1}</span>
        </div>
        <div class="performer-info">
          <div class="performer-name">${performer.name}</div>
          <div class="performer-stats">
            <span class="performer-orders">${performer.total_orders} commandes</span>
            <span class="performer-spent">${performer.total_spent.toFixed(2)}€</span>
          </div>
          <div class="performer-last-order">
            Dernière commande: ${this.formatDate(performer.last_order)}
          </div>
        </div>
        <div class="performer-actions">
          <button class="btn btn-sm btn-secondary" data-action="view-customer" data-customer-id="${performer.id}">
            <i class="fas fa-eye"></i>
          </button>
        </div>
      </div>
    `).join('');
  }

  /**
   * Initialise les événements
   */
  initEvents() {
    // Sélecteur de période
    document.querySelectorAll('.period-btn').forEach(button => {
      button.addEventListener('click', (e) => {
        this.handlePeriodChange(e.target.dataset.period);
      });
    });

    // Période personnalisée
    document.querySelectorAll('[data-action="apply-period"]').forEach(button => {
      button.addEventListener('click', () => this.applyCustomPeriod());
    });

    // Actions sur les rapports
    document.addEventListener('click', (e) => {
      if (e.target.matches('[data-action="refresh-chart"]')) {
        this.refreshCharts();
      } else if (e.target.matches('[data-action="export-report"]')) {
        this.exportReport();
      } else if (e.target.matches('[data-action="generate-report"]')) {
        this.generateCustomReport();
      } else if (e.target.matches('[data-action="view-all-customers"]')) {
        window.location.href = '/customers';
      } else if (e.target.matches('[data-action="view-customer"]')) {
        const customerId = e.target.dataset.customerId;
        window.location.href = `/customers/${customerId}`;
      }
    });
  }

  /**
   * Gère le changement de période
   */
  handlePeriodChange(period) {
    // Mettre à jour les boutons
    document.querySelectorAll('.period-btn').forEach(btn => {
      btn.classList.remove('is-active');
    });
    event.target.classList.add('is-active');

    this.currentPeriod = period;
    this.updateDateRange(period);
    this.refreshData();
  }

  /**
   * Met à jour la plage de dates selon la période
   */
  updateDateRange(period) {
    const today = new Date();
    let startDate = new Date();

    switch (period) {
      case 'week':
        startDate.setDate(today.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(today.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(today.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(today.getFullYear() - 1);
        break;
    }

    this.startDate = startDate.toISOString().split('T')[0];
    this.endDate = today.toISOString().split('T')[0];

    // Mettre à jour les inputs
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    
    if (startDateInput) startDateInput.value = this.startDate;
    if (endDateInput) endDateInput.value = this.endDate;
  }

  /**
   * Applique une période personnalisée
   */
  applyCustomPeriod() {
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    
    if (startDateInput && endDateInput) {
      this.startDate = startDateInput.value;
      this.endDate = endDateInput.value;
      
      // Désactiver tous les boutons de période
      document.querySelectorAll('.period-btn').forEach(btn => {
        btn.classList.remove('is-active');
      });
      
      this.refreshData();
    }
  }

  /**
   * Rafraîchit les données
   */
  async refreshData() {
    await this.loadMetrics();
    await this.loadCharts();
    await this.loadTopPerformers();
    toast.success('Données mises à jour');
  }

  /**
   * Rafraîchit les graphiques
   */
  refreshCharts() {
    this.refreshData();
  }

  /**
   * Exporte un rapport
   */
  exportReport() {
    try {
      // Générer un rapport PDF
      this.generatePDFReport();
      toast.success('Rapport exporté avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      toast.error('Erreur lors de l\'export du rapport');
    }
  }

  /**
   * Génère un rapport PDF
   */
  generatePDFReport() {
    if (typeof window.jsPDF !== 'undefined') {
      const doc = new window.jsPDF();
      
      // En-tête
      doc.setFontSize(20);
      doc.text('RAPPORT D\'ACTIVITÉ', 105, 20, { align: 'center' });
      
      // Période
      doc.setFontSize(12);
      doc.text(`Période: ${this.startDate} à ${this.endDate}`, 20, 40);
      
      // Métriques
      doc.setFontSize(14);
      doc.text('Métriques clés:', 20, 60);
      
      const revenueMetric = document.getElementById('revenueMetric')?.textContent || '0€';
      const ordersMetric = document.getElementById('ordersMetric')?.textContent || '0';
      const customersMetric = document.getElementById('customersMetric')?.textContent || '0';
      const averageMetric = document.getElementById('averageMetric')?.textContent || '0€';
      
      doc.setFontSize(12);
      doc.text(`Revenus totaux: ${revenueMetric}`, 20, 80);
      doc.text(`Nombre de commandes: ${ordersMetric}`, 20, 90);
      doc.text(`Nombre de clients: ${customersMetric}`, 20, 100);
      doc.text(`Moyenne par commande: ${averageMetric}`, 20, 110);
      
      // Sauvegarder le PDF
      doc.save(`rapport-${this.startDate}-${this.endDate}.pdf`);
    } else {
      // Fallback
      const content = `
        RAPPORT D'ACTIVITÉ
        Période: ${this.startDate} à ${this.endDate}
        
        Métriques clés:
        - Revenus totaux: ${document.getElementById('revenueMetric')?.textContent || '0€'}
        - Nombre de commandes: ${document.getElementById('ordersMetric')?.textContent || '0'}
        - Nombre de clients: ${document.getElementById('customersMetric')?.textContent || '0'}
        - Moyenne par commande: ${document.getElementById('averageMetric')?.textContent || '0€'}
      `;
      
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rapport-${this.startDate}-${this.endDate}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    }
  }

  /**
   * Génère un rapport personnalisé
   */
  generateCustomReport() {
    toast.info('Fonctionnalité de rapport personnalisé en cours de développement');
  }

  /**
   * Formate une date
   */
  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }
}

// Créer et exporter une instance
const reports = new Reports();

export default reports; 