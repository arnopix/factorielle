import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Invoice, Company, Client } from './types';
import { calcLineTotal, calcSubtotal, calcTotalTVA, calcDiscount, calcTotal, calcTotalHT, formatCurrency, formatDate } from './invoice-utils';

export function generateInvoicePDF(invoice: Invoice, company: Company, client: Client): jsPDF {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const isQuote = invoice.type === 'quote';
  const docTitle = isQuote ? 'DEVIS' : 'FACTURE';

  // Colors
  const primary = [17, 24, 39] as const; // gray-900
  const accent = [79, 70, 229] as const; // indigo-600

  // Header bar
  doc.setFillColor(...accent);
  doc.rect(0, 0, pageWidth, 4, 'F');

  // Company name / logo
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(...primary);
  doc.text(company.name || 'Mon Entreprise', 20, 25);

  // Document type + number
  doc.setFontSize(12);
  doc.setTextColor(...accent);
  doc.text(`${docTitle} ${invoice.number}`, pageWidth - 20, 25, { align: 'right' });

  // Company info
  doc.setFontSize(9);
  doc.setTextColor(107, 114, 128); // gray-500
  doc.setFont('helvetica', 'normal');
  let y = 33;
  if (company.address) { doc.text(company.address, 20, y); y += 4; }
  if (company.zip || company.city) { doc.text(`${company.zip} ${company.city}`, 20, y); y += 4; }
  if (company.phone) { doc.text(company.phone, 20, y); y += 4; }
  if (company.email) { doc.text(company.email, 20, y); y += 4; }
  if (company.siret) { doc.text(`SIRET: ${company.siret}`, 20, y); y += 4; }
  if (company.tvaNumber && !company.tvaExempt) { doc.text(`TVA: ${company.tvaNumber}`, 20, y); y += 4; }

  // Dates
  const dateY = 33;
  doc.setFontSize(9);
  doc.setTextColor(107, 114, 128);
  doc.text(`Date : ${formatDate(invoice.date)}`, pageWidth - 20, dateY, { align: 'right' });
  if (!isQuote) {
    doc.text(`Échéance : ${formatDate(invoice.dueDate)}`, pageWidth - 20, dateY + 5, { align: 'right' });
  }

  // Client block
  const clientY = 62;
  doc.setFillColor(249, 250, 251); // gray-50
  doc.roundedRect(pageWidth - 90, clientY - 5, 75, 35, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...primary);
  doc.text('DESTINATAIRE', pageWidth - 85, clientY);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  let cy = clientY + 6;
  doc.text(client.name, pageWidth - 85, cy); cy += 4;
  if (client.address) { doc.text(client.address, pageWidth - 85, cy); cy += 4; }
  if (client.zip || client.city) { doc.text(`${client.zip} ${client.city}`, pageWidth - 85, cy); cy += 4; }
  if (client.siret) { doc.text(`SIRET: ${client.siret}`, pageWidth - 85, cy); cy += 4; }

  // Table
  const tableY = 105;
  const tableData = invoice.lines.map(line => [
    line.description,
    `${line.quantity} ${line.unit}`,
    formatCurrency(line.unitPrice),
    company.tvaExempt ? '-' : `${line.tvaRate}%`,
    formatCurrency(calcLineTotal(line)),
  ]);

  autoTable(doc, {
    startY: tableY,
    head: [['Description', 'Quantité', 'Prix unitaire HT', 'TVA', 'Total HT']],
    body: tableData,
    styles: {
      fontSize: 9,
      cellPadding: 4,
      textColor: [17, 24, 39],
    },
    headStyles: {
      fillColor: [79, 70, 229],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251],
    },
    margin: { left: 20, right: 20 },
    theme: 'plain',
  });

  // Totals
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const finalY = (doc as any).lastAutoTable?.finalY || tableY + 30;
  let totY = finalY + 10;

  const totX = pageWidth - 80;
  doc.setFontSize(9);
  doc.setTextColor(107, 114, 128);

  // Sous-total HT
  doc.text('Sous-total HT', totX, totY);
  doc.setTextColor(...primary);
  doc.text(formatCurrency(calcSubtotal(invoice.lines)), pageWidth - 20, totY, { align: 'right' });
  totY += 6;

  // Remise
  if (invoice.discount > 0) {
    doc.setTextColor(107, 114, 128);
    doc.text(`Remise (${invoice.discount}%)`, totX, totY);
    doc.setTextColor(...primary);
    doc.text(`-${formatCurrency(calcDiscount(invoice.lines, invoice.discount))}`, pageWidth - 20, totY, { align: 'right' });
    totY += 6;
  }

  // TVA
  if (!company.tvaExempt) {
    doc.setTextColor(107, 114, 128);
    doc.text('TVA', totX, totY);
    doc.setTextColor(...primary);
    doc.text(formatCurrency(calcTotalTVA(invoice.lines)), pageWidth - 20, totY, { align: 'right' });
    totY += 6;
  }

  // Total TTC
  totY += 2;
  doc.setFillColor(...accent);
  doc.roundedRect(totX - 5, totY - 5, pageWidth - totX + 5, 12, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  const totalLabel = company.tvaExempt ? 'Total' : 'Total TTC';
  const totalAmount = company.tvaExempt ? calcTotalHT(invoice) : calcTotal(invoice);
  doc.text(totalLabel, totX, totY + 2);
  doc.text(formatCurrency(totalAmount), pageWidth - 20, totY + 2, { align: 'right' });

  // Notes & mentions
  let notesY = totY + 25;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(107, 114, 128);

  if (invoice.notes) {
    doc.text(invoice.notes, 20, notesY, { maxWidth: pageWidth - 40 });
    notesY += 10;
  }

  // Payment info
  if (!isQuote && company.iban) {
    doc.setFont('helvetica', 'bold');
    doc.text('Coordonnées bancaires :', 20, notesY);
    doc.setFont('helvetica', 'normal');
    notesY += 4;
    doc.text(`IBAN : ${company.iban}`, 20, notesY);
    notesY += 4;
    if (company.bic) doc.text(`BIC : ${company.bic}`, 20, notesY);
    notesY += 6;
  }

  // Payment terms
  doc.setFontSize(8);
  doc.text(`Mode de paiement : ${invoice.paymentMethod}`, 20, notesY);
  notesY += 4;
  if (!isQuote) {
    doc.text(`Conditions : paiement à ${invoice.paymentTerms} jours`, 20, notesY);
    notesY += 4;
    doc.text('En cas de retard de paiement, une pénalité de 3 fois le taux d\'intérêt légal sera appliquée,', 20, notesY);
    notesY += 4;
    doc.text('ainsi qu\'une indemnité forfaitaire de 40 EUR pour frais de recouvrement (art. L.441-10 du Code de commerce).', 20, notesY);
    notesY += 6;
  }

  // TVA exemption mention (mandatory for auto-entrepreneurs)
  if (company.tvaExempt) {
    doc.setFont('helvetica', 'bold');
    doc.text('TVA non applicable, art. 293 B du CGI', 20, notesY);
    notesY += 6;
  }

  // Legal footer
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(156, 163, 175);
  const legalLines = [];
  if (company.legalForm) legalLines.push(company.legalForm);
  if (company.siret) legalLines.push(`SIRET ${company.siret}`);
  if (company.apeCode) legalLines.push(`APE ${company.apeCode}`);
  if (company.rcsCity) legalLines.push(`RCS ${company.rcsCity}`);
  if (company.capitalSocial) legalLines.push(`Capital ${company.capitalSocial} EUR`);
  const legalText = legalLines.join(' - ');
  doc.text(legalText, pageWidth / 2, 285, { align: 'center' });

  // Viral badge
  doc.setFontSize(7);
  doc.setTextColor(79, 70, 229);
  doc.text('Créé avec Factorielle.app - Facturation gratuite', pageWidth / 2, 290, { align: 'center' });

  return doc;
}
