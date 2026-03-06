'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Plus, Trash2, Save } from 'lucide-react';
import { v4 as uuid } from 'uuid';
import { getCompany, getClients, getNextInvoiceNumber, getNextQuoteNumber, saveInvoice } from '@/lib/store';
import { calcLineTotal, calcSubtotal, calcTotalTVA, calcDiscount, calcTotal, calcTotalHT, formatCurrency } from '@/lib/invoice-utils';
import { Invoice, InvoiceLine, Client, Company, DocumentType } from '@/lib/types';

export default function NewInvoicePageWrapper() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-400">Chargement...</div>}>
      <NewInvoicePage />
    </Suspense>
  );
}

function newLine(): InvoiceLine {
  return {
    id: uuid(),
    description: '',
    quantity: 1,
    unitPrice: 0,
    tvaRate: 20,
    unit: 'heures',
  };
}

function NewInvoicePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isQuote = searchParams.get('type') === 'quote';

  const [company, setCompany] = useState<Company | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [invoice, setInvoice] = useState<Invoice | null>(null);

  useEffect(() => {
    const comp = getCompany();
    setCompany(comp);
    setClients(getClients());

    const type: DocumentType = isQuote ? 'quote' : 'invoice';
    const number = isQuote ? getNextQuoteNumber() : getNextInvoiceNumber();
    const now = new Date();
    const dueDate = new Date(now);
    dueDate.setDate(dueDate.getDate() + comp.defaultPaymentTerms);

    setInvoice({
      id: uuid(),
      type,
      number,
      date: now.toISOString().slice(0, 10),
      dueDate: dueDate.toISOString().slice(0, 10),
      status: 'draft',
      clientId: '',
      lines: [newLine()],
      notes: comp.defaultNotes,
      paymentTerms: comp.defaultPaymentTerms,
      paymentMethod: comp.defaultPaymentMethod,
      discount: 0,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    });
  }, [isQuote]);

  if (!invoice || !company) return null;

  function updateLine(lineId: string, updates: Partial<InvoiceLine>) {
    setInvoice(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        lines: prev.lines.map(l => l.id === lineId ? { ...l, ...updates } : l),
      };
    });
  }

  function addLine() {
    setInvoice(prev => {
      if (!prev) return prev;
      return { ...prev, lines: [...prev.lines, newLine()] };
    });
  }

  function removeLine(lineId: string) {
    setInvoice(prev => {
      if (!prev || prev.lines.length <= 1) return prev;
      return { ...prev, lines: prev.lines.filter(l => l.id !== lineId) };
    });
  }

  function handleSave(status: 'draft' | 'sent' = 'draft') {
    if (!invoice) return;
    if (!invoice.clientId) {
      alert('Veuillez sélectionner un client');
      return;
    }
    if (invoice.lines.some(l => !l.description.trim())) {
      alert('Veuillez remplir la description de chaque ligne');
      return;
    }
    const toSave = { ...invoice, status, updatedAt: new Date().toISOString() };
    if (status === 'sent') toSave.sentAt = new Date().toISOString();
    saveInvoice(toSave);
    router.push(`/app/invoices/${invoice.id}`);
  }

  const subtotal = calcSubtotal(invoice.lines);
  const discount = calcDiscount(invoice.lines, invoice.discount);
  const tva = calcTotalTVA(invoice.lines);
  const total = company.tvaExempt ? calcTotalHT(invoice) : calcTotal(invoice);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isQuote ? 'Nouveau devis' : 'Nouvelle facture'}
          </h1>
          <p className="text-gray-500 text-sm mt-1">{invoice.number}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => handleSave('draft')}
            className="inline-flex items-center gap-2 border border-gray-200 text-gray-700 px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-gray-50 transition-colors"
          >
            <Save className="w-4 h-4" />
            Brouillon
          </button>
          <button
            onClick={() => handleSave('sent')}
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-indigo-700 transition-colors"
          >
            Enregistrer
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Header info */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Client *</label>
              <select
                value={invoice.clientId}
                onChange={e => setInvoice({ ...invoice, clientId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Sélectionner un client</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              {clients.length === 0 && (
                <p className="text-xs text-gray-400 mt-1">
                  <a href="/app/clients" className="text-indigo-600 hover:underline">Créez d&apos;abord un client</a>
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                value={invoice.date}
                onChange={e => setInvoice({ ...invoice, date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {isQuote ? 'Validité' : 'Échéance'}
              </label>
              <input
                type="date"
                value={invoice.dueDate}
                onChange={e => setInvoice({ ...invoice, dueDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Lines */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Lignes</h2>

          <div className="space-y-4">
            {invoice.lines.map((line, idx) => (
              <div key={line.id} className="grid grid-cols-12 gap-3 items-start">
                <div className="col-span-12 sm:col-span-4">
                  {idx === 0 && <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>}
                  <input
                    type="text"
                    value={line.description}
                    onChange={e => updateLine(line.id, { description: e.target.value })}
                    placeholder="Prestation de service…"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="col-span-4 sm:col-span-2">
                  {idx === 0 && <label className="block text-xs font-medium text-gray-500 mb-1">Quantité</label>}
                  <input
                    type="number"
                    value={line.quantity}
                    onChange={e => updateLine(line.id, { quantity: parseFloat(e.target.value) || 0 })}
                    min="0"
                    step="0.5"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="col-span-4 sm:col-span-1">
                  {idx === 0 && <label className="block text-xs font-medium text-gray-500 mb-1">Unité</label>}
                  <select
                    value={line.unit}
                    onChange={e => updateLine(line.id, { unit: e.target.value })}
                    className="w-full px-2 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="heures">h</option>
                    <option value="jours">j</option>
                    <option value="unités">u</option>
                    <option value="forfait">fft</option>
                  </select>
                </div>
                <div className="col-span-4 sm:col-span-2">
                  {idx === 0 && <label className="block text-xs font-medium text-gray-500 mb-1">Prix unit. HT</label>}
                  <input
                    type="number"
                    value={line.unitPrice}
                    onChange={e => updateLine(line.id, { unitPrice: parseFloat(e.target.value) || 0 })}
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                {!company.tvaExempt && (
                  <div className="col-span-3 sm:col-span-1">
                    {idx === 0 && <label className="block text-xs font-medium text-gray-500 mb-1">TVA</label>}
                    <select
                      value={line.tvaRate}
                      onChange={e => updateLine(line.id, { tvaRate: parseFloat(e.target.value) })}
                      className="w-full px-2 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value={0}>0%</option>
                      <option value={5.5}>5.5%</option>
                      <option value={10}>10%</option>
                      <option value={20}>20%</option>
                    </select>
                  </div>
                )}
                <div className={`${company.tvaExempt ? 'col-span-9 sm:col-span-2' : 'col-span-6 sm:col-span-1'} flex items-end`}>
                  {idx === 0 && <label className="block text-xs font-medium text-gray-500 mb-1">Total</label>}
                  <div className="flex items-center gap-2 w-full">
                    <span className="text-sm font-medium text-gray-900 py-2">{formatCurrency(calcLineTotal(line))}</span>
                    {invoice.lines.length > 1 && (
                      <button
                        onClick={() => removeLine(line.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={addLine}
            className="mt-4 inline-flex items-center gap-2 text-sm text-indigo-600 font-medium hover:text-indigo-700"
          >
            <Plus className="w-4 h-4" />
            Ajouter une ligne
          </button>
        </div>

        {/* Totals + notes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Notes & conditions</h2>
            <textarea
              value={invoice.notes}
              onChange={e => setInvoice({ ...invoice, notes: e.target.value })}
              rows={4}
              placeholder="Notes visibles sur le document..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4"
            />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mode de paiement</label>
                <input
                  type="text"
                  value={invoice.paymentMethod}
                  onChange={e => setInvoice({ ...invoice, paymentMethod: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Remise (%)</label>
                <input
                  type="number"
                  value={invoice.discount}
                  onChange={e => setInvoice({ ...invoice, discount: parseFloat(e.target.value) || 0 })}
                  min="0"
                  max="100"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Résumé</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Sous-total HT</span>
                <span className="font-medium text-gray-900">{formatCurrency(subtotal)}</span>
              </div>
              {invoice.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Remise ({invoice.discount}%)</span>
                  <span className="font-medium text-red-600">-{formatCurrency(discount)}</span>
                </div>
              )}
              {!company.tvaExempt && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">TVA</span>
                  <span className="font-medium text-gray-900">{formatCurrency(tva)}</span>
                </div>
              )}
              {company.tvaExempt && (
                <p className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
                  TVA non applicable, art. 293 B du CGI
                </p>
              )}
              <div className="border-t border-gray-200 pt-3 flex justify-between">
                <span className="font-semibold text-gray-900">
                  {company.tvaExempt ? 'Total' : 'Total TTC'}
                </span>
                <span className="text-xl font-bold text-indigo-600">{formatCurrency(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
