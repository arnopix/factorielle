import { Invoice, InvoiceLine } from './types';

export function calcLineTotal(line: InvoiceLine): number {
  return line.quantity * line.unitPrice;
}

export function calcLineTVA(line: InvoiceLine): number {
  return calcLineTotal(line) * (line.tvaRate / 100);
}

export function calcLineTTC(line: InvoiceLine): number {
  return calcLineTotal(line) + calcLineTVA(line);
}

export function calcSubtotal(lines: InvoiceLine[]): number {
  return lines.reduce((sum, l) => sum + calcLineTotal(l), 0);
}

export function calcTotalTVA(lines: InvoiceLine[]): number {
  return lines.reduce((sum, l) => sum + calcLineTVA(l), 0);
}

export function calcDiscount(lines: InvoiceLine[], discountPercent: number): number {
  return calcSubtotal(lines) * (discountPercent / 100);
}

export function calcTotal(invoice: Invoice): number {
  const subtotal = calcSubtotal(invoice.lines);
  const discount = calcDiscount(invoice.lines, invoice.discount);
  const tva = calcTotalTVA(invoice.lines);
  return subtotal - discount + tva;
}

export function calcTotalHT(invoice: Invoice): number {
  return calcSubtotal(invoice.lines) - calcDiscount(invoice.lines, invoice.discount);
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(dateStr));
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    draft: 'Brouillon',
    sent: 'Envoyée',
    paid: 'Payée',
    overdue: 'En retard',
    cancelled: 'Annulée',
  };
  return labels[status] || status;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-700',
    sent: 'bg-blue-100 text-blue-700',
    paid: 'bg-green-100 text-green-700',
    overdue: 'bg-red-100 text-red-700',
    cancelled: 'bg-orange-100 text-orange-700',
  };
  return colors[status] || 'bg-gray-100 text-gray-700';
}

export function isOverdue(invoice: Invoice): boolean {
  if (invoice.status === 'paid' || invoice.status === 'cancelled') return false;
  return new Date(invoice.dueDate) < new Date();
}
