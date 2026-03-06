export interface Company {
  name: string;
  address: string;
  zip: string;
  city: string;
  country: string;
  siret: string;
  siren: string;
  tvaNumber: string; // Numéro TVA intracommunautaire
  email: string;
  phone: string;
  website: string;
  logo?: string; // base64
  legalForm: string; // Auto-entrepreneur, EURL, SASU, etc.
  apeCode: string;
  capitalSocial: string;
  rcsCity: string;
  iban: string;
  bic: string;
  tvaExempt: boolean; // Auto-entrepreneur = TVA non applicable, art. 293 B du CGI
  defaultPaymentTerms: number; // jours
  defaultPaymentMethod: string;
  defaultNotes: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  zip: string;
  city: string;
  country: string;
  siret: string;
  tvaNumber: string;
  notes: string;
  createdAt: string;
}

export interface InvoiceLine {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  tvaRate: number; // 0, 5.5, 10, 20
  unit: string; // heures, jours, unités, forfait
}

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
export type DocumentType = 'invoice' | 'quote';

export interface Invoice {
  id: string;
  type: DocumentType;
  number: string; // ex: FA-2026-001
  date: string;
  dueDate: string;
  status: InvoiceStatus;
  clientId: string;
  lines: InvoiceLine[];
  notes: string;
  paymentTerms: number;
  paymentMethod: string;
  discount: number; // pourcentage
  createdAt: string;
  updatedAt: string;
  paidAt?: string;
  sentAt?: string;
}

export interface DashboardStats {
  totalRevenue: number;
  totalPending: number;
  totalOverdue: number;
  invoiceCount: number;
  paidCount: number;
  clientCount: number;
}
