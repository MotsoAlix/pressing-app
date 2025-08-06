/**
 * Générateur de PDF pour ManohPressing
 * Utilise jsPDF pour la génération de documents PDF
 */

// Charger jsPDF depuis CDN
if (!window.jsPDF) {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    document.head.appendChild(script);
}

class PDFGenerator {
    constructor() {
        this.companyInfo = {
            name: 'ManohPressing',
            address: '123 Rue de la Paix, Paris 75001',
            phone: '01 23 45 67 89',
            email: 'contact@manohpressing.com',
            website: 'www.manohpressing.com'
        };
    }

    // Générer un reçu de commande
    generateReceipt(order, customer) {
        return new Promise((resolve, reject) => {
            try {
                // Attendre que jsPDF soit chargé
                this.waitForJsPDF().then(() => {
                    const { jsPDF } = window.jspdf;
                    const doc = new jsPDF();

                    // Configuration
                    const pageWidth = doc.internal.pageSize.width;
                    const margin = 20;
                    let yPosition = 30;

                    // En-tête de l'entreprise
                    doc.setFontSize(24);
                    doc.setFont(undefined, 'bold');
                    doc.text(this.companyInfo.name, pageWidth / 2, yPosition, { align: 'center' });
                    
                    yPosition += 10;
                    doc.setFontSize(12);
                    doc.setFont(undefined, 'normal');
                    doc.text(this.companyInfo.address, pageWidth / 2, yPosition, { align: 'center' });
                    
                    yPosition += 6;
                    doc.text(`Tél: ${this.companyInfo.phone} | Email: ${this.companyInfo.email}`, pageWidth / 2, yPosition, { align: 'center' });

                    // Ligne de séparation
                    yPosition += 15;
                    doc.line(margin, yPosition, pageWidth - margin, yPosition);

                    // Titre du reçu
                    yPosition += 15;
                    doc.setFontSize(18);
                    doc.setFont(undefined, 'bold');
                    doc.text('REÇU DE COMMANDE', pageWidth / 2, yPosition, { align: 'center' });

                    // Informations de la commande
                    yPosition += 20;
                    doc.setFontSize(12);
                    doc.setFont(undefined, 'normal');
                    
                    const orderInfo = [
                        [`Numéro de commande:`, order.orderNumber],
                        [`Date:`, this.formatDate(order.createdAt)],
                        [`Client:`, `${customer.firstName} ${customer.lastName}`],
                        [`Téléphone:`, customer.phone || 'Non renseigné'],
                        [`Email:`, customer.email],
                        [`Statut:`, this.getStatusLabel(order.status)]
                    ];

                    orderInfo.forEach(([label, value]) => {
                        doc.setFont(undefined, 'bold');
                        doc.text(label, margin, yPosition);
                        doc.setFont(undefined, 'normal');
                        doc.text(value, margin + 50, yPosition);
                        yPosition += 8;
                    });

                    // Tableau des articles
                    yPosition += 10;
                    doc.setFont(undefined, 'bold');
                    doc.text('DÉTAIL DES ARTICLES', margin, yPosition);
                    yPosition += 10;

                    // En-têtes du tableau
                    const tableHeaders = ['Article', 'Service', 'Qté', 'Prix Unit.', 'Total'];
                    const colWidths = [60, 50, 20, 25, 25];
                    let xPosition = margin;

                    doc.setFontSize(10);
                    doc.setFont(undefined, 'bold');
                    tableHeaders.forEach((header, index) => {
                        doc.text(header, xPosition, yPosition);
                        xPosition += colWidths[index];
                    });

                    // Ligne sous les en-têtes
                    yPosition += 5;
                    doc.line(margin, yPosition, pageWidth - margin, yPosition);
                    yPosition += 8;

                    // Lignes du tableau
                    doc.setFont(undefined, 'normal');
                    order.items.forEach(item => {
                        xPosition = margin;
                        const rowData = [
                            item.name,
                            item.service,
                            item.quantity?.toString() || '1',
                            `€${item.price.toFixed(2)}`,
                            `€${(item.price * (item.quantity || 1)).toFixed(2)}`
                        ];

                        rowData.forEach((data, index) => {
                            doc.text(data, xPosition, yPosition);
                            xPosition += colWidths[index];
                        });
                        yPosition += 8;
                    });

                    // Ligne de séparation avant le total
                    yPosition += 5;
                    doc.line(margin, yPosition, pageWidth - margin, yPosition);

                    // Total
                    yPosition += 15;
                    doc.setFontSize(14);
                    doc.setFont(undefined, 'bold');
                    doc.text(`TOTAL: €${order.total.toFixed(2)}`, pageWidth - margin - 40, yPosition);

                    // Notes si présentes
                    if (order.notes) {
                        yPosition += 20;
                        doc.setFontSize(12);
                        doc.setFont(undefined, 'bold');
                        doc.text('NOTES:', margin, yPosition);
                        yPosition += 8;
                        doc.setFont(undefined, 'normal');
                        const splitNotes = doc.splitTextToSize(order.notes, pageWidth - 2 * margin);
                        doc.text(splitNotes, margin, yPosition);
                        yPosition += splitNotes.length * 6;
                    }

                    // Pied de page
                    yPosition = doc.internal.pageSize.height - 40;
                    doc.setFontSize(10);
                    doc.setFont(undefined, 'italic');
                    doc.text('Merci de votre confiance !', pageWidth / 2, yPosition, { align: 'center' });
                    yPosition += 6;
                    doc.text(`Document généré le ${this.formatDate(new Date())}`, pageWidth / 2, yPosition, { align: 'center' });

                    // Code de suivi si disponible
                    if (order.trackingCode) {
                        yPosition += 8;
                        doc.setFont(undefined, 'bold');
                        doc.text(`Code de suivi: ${order.trackingCode}`, pageWidth / 2, yPosition, { align: 'center' });
                    }

                    resolve(doc);
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    // Générer un rapport PDF
    generateReport(reportData, reportType) {
        return new Promise((resolve, reject) => {
            try {
                this.waitForJsPDF().then(() => {
                    const { jsPDF } = window.jspdf;
                    const doc = new jsPDF();

                    const pageWidth = doc.internal.pageSize.width;
                    const margin = 20;
                    let yPosition = 30;

                    // En-tête
                    doc.setFontSize(20);
                    doc.setFont(undefined, 'bold');
                    doc.text(this.companyInfo.name, pageWidth / 2, yPosition, { align: 'center' });
                    
                    yPosition += 15;
                    doc.setFontSize(16);
                    doc.text(this.getReportTitle(reportType), pageWidth / 2, yPosition, { align: 'center' });

                    yPosition += 10;
                    doc.setFontSize(12);
                    doc.setFont(undefined, 'normal');
                    doc.text(`Généré le ${this.formatDate(new Date())}`, pageWidth / 2, yPosition, { align: 'center' });

                    // Ligne de séparation
                    yPosition += 15;
                    doc.line(margin, yPosition, pageWidth - margin, yPosition);

                    // Contenu du rapport selon le type
                    yPosition += 15;
                    switch (reportType) {
                        case 'daily':
                        case 'weekly':
                        case 'monthly':
                            this.addPeriodReport(doc, reportData, yPosition, margin, pageWidth);
                            break;
                        case 'customers':
                            this.addCustomersReport(doc, reportData, yPosition, margin, pageWidth);
                            break;
                        case 'stock':
                            this.addStockReport(doc, reportData, yPosition, margin, pageWidth);
                            break;
                        case 'financial':
                            this.addFinancialReport(doc, reportData, yPosition, margin, pageWidth);
                            break;
                        default:
                            this.addGenericReport(doc, reportData, yPosition, margin, pageWidth);
                    }

                    resolve(doc);
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    // Générer un export de données
    generateDataExport(data, title) {
        return new Promise((resolve, reject) => {
            try {
                this.waitForJsPDF().then(() => {
                    const { jsPDF } = window.jspdf;
                    const doc = new jsPDF();

                    const pageWidth = doc.internal.pageSize.width;
                    const margin = 20;
                    let yPosition = 30;

                    // En-tête
                    doc.setFontSize(18);
                    doc.setFont(undefined, 'bold');
                    doc.text(title, pageWidth / 2, yPosition, { align: 'center' });
                    
                    yPosition += 10;
                    doc.setFontSize(12);
                    doc.setFont(undefined, 'normal');
                    doc.text(`Export généré le ${this.formatDate(new Date())}`, pageWidth / 2, yPosition, { align: 'center' });

                    yPosition += 20;

                    // Données
                    if (Array.isArray(data)) {
                        data.forEach((item, index) => {
                            if (yPosition > doc.internal.pageSize.height - 40) {
                                doc.addPage();
                                yPosition = 30;
                            }

                            doc.setFont(undefined, 'bold');
                            doc.text(`${index + 1}. ${item.name || item.title || `Élément ${index + 1}`}`, margin, yPosition);
                            yPosition += 8;

                            doc.setFont(undefined, 'normal');
                            Object.entries(item).forEach(([key, value]) => {
                                if (key !== 'name' && key !== 'title' && value !== null && value !== undefined) {
                                    doc.text(`${key}: ${value}`, margin + 10, yPosition);
                                    yPosition += 6;
                                }
                            });
                            yPosition += 5;
                        });
                    }

                    resolve(doc);
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    // Attendre que jsPDF soit chargé
    waitForJsPDF() {
        return new Promise((resolve) => {
            const checkJsPDF = () => {
                if (window.jspdf) {
                    resolve();
                } else {
                    setTimeout(checkJsPDF, 100);
                }
            };
            checkJsPDF();
        });
    }

    // Méthodes utilitaires
    formatDate(date) {
        if (typeof date === 'string') {
            date = new Date(date);
        }
        return date.toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    getStatusLabel(status) {
        const labels = {
            'pending': 'En attente',
            'in_progress': 'En cours',
            'ready': 'Prête',
            'delivered': 'Livrée'
        };
        return labels[status] || status;
    }

    getReportTitle(reportType) {
        const titles = {
            'daily': 'Rapport Journalier',
            'weekly': 'Rapport Hebdomadaire',
            'monthly': 'Rapport Mensuel',
            'customers': 'Rapport Clients',
            'stock': 'Rapport Stock',
            'financial': 'Rapport Financier'
        };
        return titles[reportType] || 'Rapport';
    }

    // Ajouter contenu de rapport périodique
    addPeriodReport(doc, data, yPosition, margin, pageWidth) {
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text('RÉSUMÉ DE LA PÉRIODE', margin, yPosition);
        yPosition += 15;

        doc.setFontSize(12);
        doc.setFont(undefined, 'normal');
        
        const stats = [
            ['Nombre de commandes:', data.ordersCount || '0'],
            ['Chiffre d\'affaires:', `€${data.revenue || '0.00'}`],
            ['Clients servis:', data.customersCount || '0'],
            ['Panier moyen:', `€${data.averageOrder || '0.00'}`]
        ];

        stats.forEach(([label, value]) => {
            doc.setFont(undefined, 'bold');
            doc.text(label, margin, yPosition);
            doc.setFont(undefined, 'normal');
            doc.text(value, margin + 80, yPosition);
            yPosition += 8;
        });
    }

    // Ajouter contenu de rapport clients
    addCustomersReport(doc, data, yPosition, margin, pageWidth) {
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text('RAPPORT CLIENTS', margin, yPosition);
        yPosition += 15;

        if (data.customers && data.customers.length > 0) {
            data.customers.forEach(customer => {
                doc.setFont(undefined, 'bold');
                doc.text(`${customer.firstName} ${customer.lastName}`, margin, yPosition);
                yPosition += 6;
                
                doc.setFont(undefined, 'normal');
                doc.text(`Email: ${customer.email}`, margin + 10, yPosition);
                yPosition += 6;
                doc.text(`Points fidélité: ${customer.loyaltyPoints || 0}`, margin + 10, yPosition);
                yPosition += 6;
                doc.text(`Total dépensé: €${customer.totalSpent || 0}`, margin + 10, yPosition);
                yPosition += 10;
            });
        }
    }

    // Ajouter contenu de rapport stock
    addStockReport(doc, data, yPosition, margin, pageWidth) {
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text('RAPPORT STOCK', margin, yPosition);
        yPosition += 15;

        if (data.stockItems && data.stockItems.length > 0) {
            data.stockItems.forEach(item => {
                doc.setFont(undefined, 'bold');
                doc.text(item.name, margin, yPosition);
                yPosition += 6;
                
                doc.setFont(undefined, 'normal');
                doc.text(`Quantité: ${item.quantity} ${item.unit}`, margin + 10, yPosition);
                yPosition += 6;
                doc.text(`Stock minimum: ${item.minQuantity}`, margin + 10, yPosition);
                yPosition += 6;
                doc.text(`Prix unitaire: €${item.unitPrice}`, margin + 10, yPosition);
                yPosition += 10;
            });
        }
    }

    // Ajouter contenu de rapport financier
    addFinancialReport(doc, data, yPosition, margin, pageWidth) {
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text('RAPPORT FINANCIER', margin, yPosition);
        yPosition += 15;

        const financialData = [
            ['Chiffre d\'affaires total:', `€${data.totalRevenue || '0.00'}`],
            ['Nombre de transactions:', data.transactionCount || '0'],
            ['Ticket moyen:', `€${data.averageTicket || '0.00'}`],
            ['Croissance:', `${data.growth || '0'}%`]
        ];

        doc.setFontSize(12);
        financialData.forEach(([label, value]) => {
            doc.setFont(undefined, 'bold');
            doc.text(label, margin, yPosition);
            doc.setFont(undefined, 'normal');
            doc.text(value, margin + 80, yPosition);
            yPosition += 8;
        });
    }

    // Ajouter contenu générique
    addGenericReport(doc, data, yPosition, margin, pageWidth) {
        doc.setFontSize(12);
        doc.setFont(undefined, 'normal');
        doc.text('Données du rapport:', margin, yPosition);
        yPosition += 10;

        const dataText = JSON.stringify(data, null, 2);
        const splitText = doc.splitTextToSize(dataText, pageWidth - 2 * margin);
        doc.text(splitText, margin, yPosition);
    }

    // Télécharger le PDF
    downloadPDF(doc, filename) {
        doc.save(filename);
    }

    // Imprimer le PDF
    printPDF(doc) {
        doc.autoPrint();
        window.open(doc.output('bloburl'), '_blank');
    }
}

// Initialiser le générateur PDF global
const pdfGenerator = new PDFGenerator();
window.pdfGenerator = pdfGenerator;
