'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FileText, Plus, Search, Filter } from 'lucide-react';
import { getInvoices, getClient, getCompany } from '@/lib/store';
import { calcTotal, calcTotalHT, formatCurrency, formatDate, getStatusLabel, getStatusColor } from '@/lib/invoice-utils';
import { Invoice, InvoiceStatus, DocumentType } from '@/lib/types';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<DocumentType | 'all'>('all');

  useEffect(() => {
    setInvoices(getInvoices().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  }, []);

  const company = typeof window !== 'undefined' ? getCompany() : null;

  const filtered = invoices.filter(inv => {
    if (statusFilter !== 'all' && inv.status !== statusFilter) return false;
    if (typeFilter !== 'all' && inv.type !== typeFilter) return false;
    if (search) {
      const client = getClient(inv.clientId);
      const q = search.toLowerCase();
      return inv.number.toLowerCase().includes(q) || (client?.name.toLowerCase().includes(q) ?? false);
    }
    return true;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Factures & Devis</h1>
          <p className="text-gray-500 text-sm mt-1">{invoices.length} document{invoices.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/app/invoices/new?type=quote"
            className="inline-flex items-center gap-2 border border-gray-200 text-gray-700 px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-gray-50 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Devis
          </Link>
          <Link
            href="/app/invoices/new"
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Facture
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par numéro ou client..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value as DocumentType | 'all')}
              className="pl-9 pr-8 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
            >
              <option value="all">Tous types</option>
              <option value="invoice">Factures</option>
              <option value="quote">Devis</option>
            </select>
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as InvoiceStatus | 'all')}
            className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
          >
            <option value="all">Tous statuts</option>
            <option value="draft">Brouillon</option>
            <option value="sent">Envoyée</option>
            <option value="paid">Payée</option>
            <option value="overdue">En retard</option>
            <option value="cancelled">Annulée</option>
          </select>
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">
            {invoices.length === 0 ? 'Aucun document pour le moment' : 'Aucun résultat'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          {filtered.map(inv => {
            const client = getClient(inv.clientId);
            return (
              <Link
                key={inv.id}
                href={`/app/invoices/${inv.id}`}
                className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center">
                    <FileText className={`w-5 h-5 ${inv.type === 'quote' ? 'text-orange-400' : 'text-indigo-400'}`} />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">
                      {inv.number}
                      <span className="text-gray-400 font-normal ml-2">
                        {inv.type === 'quote' ? 'Devis' : 'Facture'}
                      </span>
                    </p>
                    <p className="text-xs text-gray-400">
                      {client?.name || 'Client inconnu'} - {formatDate(inv.date)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${getStatusColor(inv.status)}`}>
                    {getStatusLabel(inv.status)}
                  </span>
                  <span className="text-sm font-semibold text-gray-900 w-28 text-right">
                    {formatCurrency(company?.tvaExempt ? calcTotalHT(inv) : calcTotal(inv))}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
