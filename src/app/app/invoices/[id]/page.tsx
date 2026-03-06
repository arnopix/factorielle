'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Download, Trash2, CheckCircle, Send, XCircle, Copy } from 'lucide-react';
import { getInvoice, getCompany, getClient, saveInvoice, deleteInvoice, getNextInvoiceNumber } from '@/lib/store';
import { calcLineTotal, calcSubtotal, calcTotalTVA, calcDiscount, calcTotal, calcTotalHT, formatCurrency, formatDate, getStatusLabel, getStatusColor } from '@/lib/invoice-utils';
import { generateInvoicePDF } from '@/lib/pdf';
import { Invoice, Company, Client } from '@/lib/types';
import { v4 as uuid } from 'uuid';

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [client, setClient] = useState<Client | null>(null);

  useEffect(() => {
    const inv = getInvoice(params.id as string);
    if (!inv) { router.push('/app/invoices'); return; }
    setInvoice(inv);
    setCompany(getCompany());
    const c = getClient(inv.clientId);
    if (c) setClient(c);
  }, [params.id, router]);

  if (!invoice || !company) return null;

  const total = company.tvaExempt ? calcTotalHT(invoice) : calcTotal(invoice);

  function downloadPDF() {
    if (!invoice || !company || !client) return;
    const doc = generateInvoicePDF(invoice, company, client);
    doc.save(`${invoice.number}.pdf`);
  }

  function updateStatus(status: Invoice['status']) {
    if (!invoice) return;
    const updated = { ...invoice, status, updatedAt: new Date().toISOString() };
    if (status === 'paid') updated.paidAt = new Date().toISOString();
    if (status === 'sent') updated.sentAt = new Date().toISOString();
    saveInvoice(updated);
    setInvoice(updated);
  }

  function handleDelete() {
    if (!confirm('Supprimer ce document ? Cette action est irréversible.')) return;
    deleteInvoice(invoice!.id);
    router.push('/app/invoices');
  }

  function convertToInvoice() {
    if (!invoice) return;
    const newInv: Invoice = {
      ...invoice,
      id: uuid(),
      type: 'invoice',
      number: getNextInvoiceNumber(),
      status: 'draft',
      date: new Date().toISOString().slice(0, 10),
      dueDate: new Date(Date.now() + invoice.paymentTerms * 86400000).toISOString().slice(0, 10),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveInvoice(newInv);
    router.push(`/app/invoices/${newInv.id}`);
  }

  function duplicateDocument() {
    if (!invoice) return;
    const newInv: Invoice = {
      ...invoice,
      id: uuid(),
      status: 'draft',
      date: new Date().toISOString().slice(0, 10),
      dueDate: new Date(Date.now() + invoice.paymentTerms * 86400000).toISOString().slice(0, 10),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveInvoice(newInv);
    router.push(`/app/invoices/${newInv.id}`);
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/app/invoices" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{invoice.number}</h1>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${getStatusColor(invoice.status)}`}>
                {getStatusLabel(invoice.status)}
              </span>
            </div>
            <p className="text-gray-500 text-sm mt-1">
              {invoice.type === 'quote' ? 'Devis' : 'Facture'} du {formatDate(invoice.date)}
              {client && ` - ${client.name}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={downloadPDF} className="inline-flex items-center gap-2 border border-gray-200 text-gray-700 px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4" />
            PDF
          </button>
          <button onClick={duplicateDocument} className="inline-flex items-center gap-2 border border-gray-200 text-gray-700 px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-50 transition-colors">
            <Copy className="w-4 h-4" />
            Dupliquer
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Document preview */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            {/* Header */}
            <div className="flex justify-between mb-8">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{company.name}</h2>
                <p className="text-sm text-gray-500 mt-1">{company.address}</p>
                <p className="text-sm text-gray-500">{company.zip} {company.city}</p>
                {company.siret && <p className="text-sm text-gray-500">SIRET: {company.siret}</p>}
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Date: {formatDate(invoice.date)}</p>
                <p className="text-sm text-gray-500">
                  {invoice.type === 'quote' ? 'Validité' : 'Échéance'}: {formatDate(invoice.dueDate)}
                </p>
              </div>
            </div>

            {/* Client */}
            {client && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Destinataire</p>
                <p className="font-medium text-gray-900">{client.name}</p>
                {client.address && <p className="text-sm text-gray-500">{client.address}</p>}
                {(client.zip || client.city) && <p className="text-sm text-gray-500">{client.zip} {client.city}</p>}
              </div>
            )}

            {/* Lines */}
            <table className="w-full mb-6">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left text-xs font-medium text-gray-500 uppercase pb-2">Description</th>
                  <th className="text-right text-xs font-medium text-gray-500 uppercase pb-2">Qte</th>
                  <th className="text-right text-xs font-medium text-gray-500 uppercase pb-2">Prix unit.</th>
                  {!company.tvaExempt && <th className="text-right text-xs font-medium text-gray-500 uppercase pb-2">TVA</th>}
                  <th className="text-right text-xs font-medium text-gray-500 uppercase pb-2">Total HT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {invoice.lines.map(line => (
                  <tr key={line.id}>
                    <td className="py-3 text-sm text-gray-900">{line.description}</td>
                    <td className="py-3 text-sm text-gray-600 text-right">{line.quantity} {line.unit}</td>
                    <td className="py-3 text-sm text-gray-600 text-right">{formatCurrency(line.unitPrice)}</td>
                    {!company.tvaExempt && <td className="py-3 text-sm text-gray-600 text-right">{line.tvaRate}%</td>}
                    <td className="py-3 text-sm font-medium text-gray-900 text-right">{formatCurrency(calcLineTotal(line))}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div className="border-t border-gray-200 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Sous-total HT</span>
                <span className="text-gray-900">{formatCurrency(calcSubtotal(invoice.lines))}</span>
              </div>
              {invoice.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Remise ({invoice.discount}%)</span>
                  <span className="text-red-600">-{formatCurrency(calcDiscount(invoice.lines, invoice.discount))}</span>
                </div>
              )}
              {!company.tvaExempt && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">TVA</span>
                  <span className="text-gray-900">{formatCurrency(calcTotalTVA(invoice.lines))}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-3">
                <span className="text-gray-900">{company.tvaExempt ? 'Total' : 'Total TTC'}</span>
                <span className="text-indigo-600">{formatCurrency(total)}</span>
              </div>
              {company.tvaExempt && (
                <p className="text-xs text-amber-600">TVA non applicable, art. 293 B du CGI</p>
              )}
            </div>

            {invoice.notes && (
              <div className="mt-6 pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-500">{invoice.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar actions */}
        <div className="space-y-4">
          {/* Status actions */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Actions</h3>
            <div className="space-y-2">
              {invoice.status === 'draft' && (
                <button
                  onClick={() => updateStatus('sent')}
                  className="w-full flex items-center gap-3 px-4 py-2.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
                >
                  <Send className="w-4 h-4" />
                  Marquer comme envoyée
                </button>
              )}
              {(invoice.status === 'sent' || invoice.status === 'overdue') && (
                <button
                  onClick={() => updateStatus('paid')}
                  className="w-full flex items-center gap-3 px-4 py-2.5 bg-green-50 text-green-700 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  Marquer comme payée
                </button>
              )}
              {invoice.type === 'quote' && invoice.status !== 'cancelled' && (
                <button
                  onClick={convertToInvoice}
                  className="w-full flex items-center gap-3 px-4 py-2.5 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                  Convertir en facture
                </button>
              )}
              {invoice.status !== 'cancelled' && invoice.status !== 'paid' && (
                <button
                  onClick={() => updateStatus('cancelled')}
                  className="w-full flex items-center gap-3 px-4 py-2.5 bg-orange-50 text-orange-700 rounded-lg text-sm font-medium hover:bg-orange-100 transition-colors"
                >
                  <XCircle className="w-4 h-4" />
                  Annuler
                </button>
              )}
              <button
                onClick={handleDelete}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Supprimer
              </button>
            </div>
          </div>

          {/* Info */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Informations</h3>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">Type</dt>
                <dd className="text-gray-900 font-medium">{invoice.type === 'quote' ? 'Devis' : 'Facture'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Mode de paiement</dt>
                <dd className="text-gray-900">{invoice.paymentMethod}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Délai</dt>
                <dd className="text-gray-900">{invoice.paymentTerms} jours</dd>
              </div>
              {invoice.sentAt && (
                <div className="flex justify-between">
                  <dt className="text-gray-500">Envoyée le</dt>
                  <dd className="text-gray-900">{formatDate(invoice.sentAt)}</dd>
                </div>
              )}
              {invoice.paidAt && (
                <div className="flex justify-between">
                  <dt className="text-gray-500">Payée le</dt>
                  <dd className="text-gray-900">{formatDate(invoice.paidAt)}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* Viral share */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-100 p-5 text-center">
            <p className="text-sm font-medium text-indigo-900 mb-1">Vous aimez Factorielle ?</p>
            <p className="text-xs text-indigo-600 mb-3">Partagez avec d&apos;autres indépendants</p>
            <button
              onClick={() => {
                navigator.clipboard.writeText('Facturation gratuite pour indépendants - factorielle.app');
                alert('Lien copié !');
              }}
              className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-full text-xs font-semibold hover:bg-indigo-700 transition-colors"
            >
              <Copy className="w-3 h-3" />
              Copier le lien
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
