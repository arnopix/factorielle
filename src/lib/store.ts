import { Company, Client, Invoice } from './types';

const STORAGE_KEYS = {
  company: 'factorielle_company',
  clients: 'factorielle_clients',
  invoices: 'factorielle_invoices',
  invoiceCounter: 'factorielle_invoice_counter',
  quoteCounter: 'factorielle_quote_counter',
  onboarded: 'factorielle_onboarded',
} as const;

function getItem<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  const raw = localStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function setItem(key: string, value: unknown): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
}

// Company
export function getCompany(): Company {
  return getItem<Company>(STORAGE_KEYS.company, {
    name: '',
    address: '',
    zip: '',
    city: '',
    country: 'France',
    siret: '',
    siren: '',
    tvaNumber: '',
    email: '',
    phone: '',
    website: '',
    legalForm: 'Auto-entrepreneur',
    apeCode: '',
    capitalSocial: '',
    rcsCity: '',
    iban: '',
    bic: '',
    tvaExempt: true,
    defaultPaymentTerms: 30,
    defaultPaymentMethod: 'Virement bancaire',
    defaultNotes: '',
  });
}

export function saveCompany(company: Company): void {
  setItem(STORAGE_KEYS.company, company);
}

// Clients
export function getClients(): Client[] {
  return getItem<Client[]>(STORAGE_KEYS.clients, []);
}

export function saveClients(clients: Client[]): void {
  setItem(STORAGE_KEYS.clients, clients);
}

export function getClient(id: string): Client | undefined {
  return getClients().find(c => c.id === id);
}

export function saveClient(client: Client): void {
  const clients = getClients();
  const idx = clients.findIndex(c => c.id === client.id);
  if (idx >= 0) clients[idx] = client;
  else clients.push(client);
  saveClients(clients);
}

export function deleteClient(id: string): void {
  saveClients(getClients().filter(c => c.id !== id));
}

// Invoices
export function getInvoices(): Invoice[] {
  return getItem<Invoice[]>(STORAGE_KEYS.invoices, []);
}

export function saveInvoices(invoices: Invoice[]): void {
  setItem(STORAGE_KEYS.invoices, invoices);
}

export function getInvoice(id: string): Invoice | undefined {
  return getInvoices().find(i => i.id === id);
}

export function saveInvoice(invoice: Invoice): void {
  const invoices = getInvoices();
  const idx = invoices.findIndex(i => i.id === invoice.id);
  if (idx >= 0) invoices[idx] = { ...invoice, updatedAt: new Date().toISOString() };
  else invoices.push(invoice);
  saveInvoices(invoices);
}

export function deleteInvoice(id: string): void {
  saveInvoices(getInvoices().filter(i => i.id !== id));
}

// Counters
export function getNextInvoiceNumber(): string {
  const year = new Date().getFullYear();
  const counter = getItem<number>(STORAGE_KEYS.invoiceCounter, 0) + 1;
  setItem(STORAGE_KEYS.invoiceCounter, counter);
  return `FA-${year}-${String(counter).padStart(3, '0')}`;
}

export function getNextQuoteNumber(): string {
  const year = new Date().getFullYear();
  const counter = getItem<number>(STORAGE_KEYS.quoteCounter, 0) + 1;
  setItem(STORAGE_KEYS.quoteCounter, counter);
  return `DE-${year}-${String(counter).padStart(3, '0')}`;
}

// Onboarding
export function isOnboarded(): boolean {
  return getItem<boolean>(STORAGE_KEYS.onboarded, false);
}

export function setOnboarded(): void {
  setItem(STORAGE_KEYS.onboarded, true);
}

// Export all data (for backup)
export function exportAllData(): string {
  return JSON.stringify({
    company: getCompany(),
    clients: getClients(),
    invoices: getInvoices(),
    exportedAt: new Date().toISOString(),
  }, null, 2);
}

// Import data
export function importAllData(json: string): void {
  const data = JSON.parse(json);
  if (data.company) saveCompany(data.company);
  if (data.clients) saveClients(data.clients);
  if (data.invoices) saveInvoices(data.invoices);
}
