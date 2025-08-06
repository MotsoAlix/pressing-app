/**
 * Module Export
 * Utilitaires pour l'export PDF et Excel
 */

class ExportUtils {
  constructor() {
    this.isInitialized = false;
  }

  /**
   * Initialise le module d'export
   */
  async init() {
    try {
      console.log('📄 Initialisation du module export...');
      
      // Charger les bibliothèques externes
      await this.loadLibraries();
      
      this.isInitialized = true;
      console.log('✅ Module export initialisé');
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation du module export:', error);
    }
  }

  /**
   * Charge les bibliothèques externes
   */
  async loadLibraries() {
    // Charger jsPDF si pas déjà chargé
    if (typeof window.jsPDF === 'undefined') {
      await this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
    }

    // Charger SheetJS si pas déjà chargé
    if (typeof window.XLSX === 'undefined') {
      await this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js');
    }

    // Charger Chart.js si pas déjà chargé
    if (typeof window.Chart === 'undefined') {
      await this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.0/chart.umd.min.js');
    }
  }

  /**
   * Charge un script externe
   */
  loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  /**
   * Génère un PDF de facture
   */
  generateInvoicePDF(invoiceData) {
    if (typeof window.jsPDF === 'undefined') {
      throw new Error('jsPDF n\'est pas disponible');
    }

    const doc = new window.jsPDF();
    
    // En-tête
    doc.setFontSize(24);
    doc.setTextColor(59, 130, 246); // Primary color
    doc.text('FACTURE', 105, 30, { align: 'center' });
    
    // Informations de l'entreprise
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('Pressing Pro', 20, 50);
    doc.text('123 Rue de la Paix', 20, 60);
    doc.text('75001 Paris, France', 20, 70);
    doc.text('Tél: +33 1 23 45 67 89', 20, 80);
    doc.text('Email: contact@pressingpro.fr', 20, 90);
    
    // Informations du client
    doc.setFontSize(14);
    doc.text('FACTURÉ À:', 20, 110);
    doc.setFontSize(12);
    doc.text(invoiceData.customer_name, 20, 125);
    doc.text(invoiceData.customer_address || 'Adresse non spécifiée', 20, 135);
    doc.text(invoiceData.customer_phone || 'Téléphone non spécifié', 20, 145);
    
    // Détails de la facture
    doc.setFontSize(14);
    doc.text('DÉTAILS DE LA FACTURE:', 20, 165);
    doc.setFontSize(12);
    
    const startY = 180;
    let currentY = startY;
    
    // Tableau des services
    doc.setFillColor(248, 250, 252);
    doc.rect(20, currentY - 5, 170, 15, 'F');
    
    doc.setFontSize(10);
    doc.text('Service', 25, currentY);
    doc.text('Prix', 120, currentY);
    doc.text('Total', 160, currentY);
    
    currentY += 20;
    
    // Services
    if (invoiceData.services && invoiceData.services.length > 0) {
      invoiceData.services.forEach(service => {
        doc.text(service.name, 25, currentY);
        doc.text(`${service.price.toFixed(2)}€`, 120, currentY);
        doc.text(`${service.total.toFixed(2)}€`, 160, currentY);
        currentY += 10;
      });
    } else {
      doc.text(invoiceData.service_name || 'Service', 25, currentY);
      doc.text(`${invoiceData.amount.toFixed(2)}€`, 160, currentY);
      currentY += 10;
    }
    
    // Ligne de séparation
    doc.setDrawColor(200, 200, 200);
    doc.line(20, currentY, 190, currentY);
    currentY += 10;
    
    // Total
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('TOTAL:', 120, currentY);
    doc.text(`${invoiceData.amount.toFixed(2)}€`, 160, currentY);
    
    // Informations de paiement
    currentY += 20;
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.text('Informations de paiement:', 20, currentY);
    currentY += 10;
    doc.text(`Référence: ${invoiceData.reference}`, 20, currentY);
    currentY += 10;
    doc.text(`Date: ${this.formatDate(invoiceData.created_at)}`, 20, currentY);
    currentY += 10;
    doc.text(`Méthode: ${this.getPaymentMethodLabel(invoiceData.payment_method)}`, 20, currentY);
    
    // Pied de page
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Merci pour votre confiance !', 105, 270, { align: 'center' });
    
    return doc;
  }

  /**
   * Génère un PDF de rapport
   */
  generateReportPDF(reportData) {
    if (typeof window.jsPDF === 'undefined') {
      throw new Error('jsPDF n\'est pas disponible');
    }

    const doc = new window.jsPDF();
    
    // En-tête
    doc.setFontSize(20);
    doc.setTextColor(59, 130, 246);
    doc.text('RAPPORT D\'ACTIVITÉ', 105, 20, { align: 'center' });
    
    // Période
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Période: ${reportData.period}`, 20, 40);
    doc.text(`Généré le: ${this.formatDate(new Date())}`, 20, 50);
    
    // Métriques
    doc.setFontSize(14);
    doc.text('MÉTRIQUES CLÉS:', 20, 70);
    doc.setFontSize(12);
    
    let currentY = 85;
    const metrics = [
      { label: 'Revenus totaux', value: `${reportData.revenue.toFixed(2)}€` },
      { label: 'Nombre de commandes', value: reportData.orders },
      { label: 'Nombre de clients', value: reportData.customers },
      { label: 'Moyenne par commande', value: `${reportData.average.toFixed(2)}€` }
    ];
    
    metrics.forEach(metric => {
      doc.text(`${metric.label}:`, 20, currentY);
      doc.text(metric.value, 120, currentY);
      currentY += 10;
    });
    
    // Graphiques (si disponibles)
    if (reportData.charts && reportData.charts.length > 0) {
      currentY += 10;
      doc.setFontSize(14);
      doc.text('GRAPHIQUES:', 20, currentY);
      currentY += 15;
      
      reportData.charts.forEach((chart, index) => {
        doc.setFontSize(12);
        doc.text(`${chart.title}:`, 20, currentY);
        currentY += 10;
        
        // Description du graphique
        doc.setFontSize(10);
        doc.text(chart.description || 'Graphique généré automatiquement', 25, currentY);
        currentY += 15;
      });
    }
    
    // Pied de page
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Rapport généré automatiquement par Pressing Pro', 105, 280, { align: 'center' });
    
    return doc;
  }

  /**
   * Exporte des données en Excel
   */
  exportToExcel(data, filename = 'export.xlsx') {
    if (typeof window.XLSX === 'undefined') {
      throw new Error('SheetJS n\'est pas disponible');
    }

    try {
      // Créer un nouveau classeur
      const wb = window.XLSX.utils.book_new();
      
      // Convertir les données en feuille de calcul
      const ws = window.XLSX.utils.json_to_sheet(data);
      
      // Ajouter la feuille au classeur
      window.XLSX.utils.book_append_sheet(wb, ws, 'Données');
      
      // Générer et télécharger le fichier
      window.XLSX.writeFile(wb, filename);
      
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'export Excel:', error);
      throw error;
    }
  }

  /**
   * Exporte un tableau en CSV
   */
  exportToCSV(data, filename = 'export.csv') {
    if (!data || data.length === 0) {
      throw new Error('Aucune donnée à exporter');
    }

    // Obtenir les en-têtes
    const headers = Object.keys(data[0]);
    
    // Créer le contenu CSV
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          // Échapper les virgules et guillemets
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      )
    ].join('\n');

    // Créer et télécharger le fichier
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  }

  /**
   * Exporte un graphique Chart.js en image
   */
  exportChartAsImage(chart, filename = 'chart.png') {
    if (!chart || typeof chart.toBase64Image !== 'function') {
      throw new Error('Graphique invalide');
    }

    try {
      const imageData = chart.toBase64Image();
      const link = document.createElement('a');
      link.download = filename;
      link.href = imageData;
      link.click();
      
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'export du graphique:', error);
      throw error;
    }
  }

  /**
   * Génère un rapport complet (PDF + Excel)
   */
  async generateCompleteReport(reportData) {
    try {
      // Générer le PDF
      const pdfDoc = this.generateReportPDF(reportData);
      pdfDoc.save(`rapport-${this.formatDateForFilename(new Date())}.pdf`);
      
      // Générer l'Excel si des données tabulaires sont disponibles
      if (reportData.tableData && reportData.tableData.length > 0) {
        this.exportToExcel(
          reportData.tableData, 
          `donnees-${this.formatDateForFilename(new Date())}.xlsx`
        );
      }
      
      return true;
    } catch (error) {
      console.error('Erreur lors de la génération du rapport complet:', error);
      throw error;
    }
  }

  /**
   * Formate une date pour l'affichage
   */
  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Formate une date pour les noms de fichiers
   */
  formatDateForFilename(date) {
    return date.toISOString().split('T')[0];
  }

  /**
   * Retourne le libellé de la méthode de paiement
   */
  getPaymentMethodLabel(method) {
    const labels = {
      'cash': 'Espèces',
      'card': 'Carte bancaire',
      'transfer': 'Virement',
      'check': 'Chèque'
    };
    return labels[method] || method;
  }

  /**
   * Valide les données avant export
   */
  validateExportData(data) {
    if (!data || !Array.isArray(data)) {
      throw new Error('Les données doivent être un tableau');
    }
    
    if (data.length === 0) {
      throw new Error('Aucune donnée à exporter');
    }
    
    // Vérifier que tous les objets ont les mêmes clés
    const firstKeys = Object.keys(data[0]);
    const allSameKeys = data.every(item => {
      const itemKeys = Object.keys(item);
      return itemKeys.length === firstKeys.length && 
             itemKeys.every(key => firstKeys.includes(key));
    });
    
    if (!allSameKeys) {
      throw new Error('Toutes les lignes doivent avoir les mêmes colonnes');
    }
    
    return true;
  }
}

// Créer et exporter une instance
const exportUtils = new ExportUtils();

export default exportUtils; 