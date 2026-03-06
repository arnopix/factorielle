'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FileText, Users, TrendingUp, Clock, Plus, AlertTriangle } from 'lucide-react';
import { getInvoices, getClients, isOnboarded } from '@/lib/store';
import { calcTotal, calcTotalHT, formatCurrency, formatDate, getStatusLabel, getStatusColor, isOverdue } from '@/lib/invoice-utils';
import { Invoice, Company } from '@/lib/types';
import { getCompany } from '@/lib/store';

export default function Dashboard() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [company, setCompany] = useState<Company | null>(null);
  const [clientCount, setClientCount] = useState(0);
  const [onboarded, setOnboarded] = useState(true);

  useEffect(() => {
    setInvoices(getInvoices());
    setClientCount(getClients().length);
    setCompany(getCompany());
    setOnboarded(isOnboarded());
  }, []);

  const totalRevenue = invoices
    .filter(i => i.type === 'invoice' && i.status === 'paid')
    .reduce((sum, i) => sum + (company?.tvaExempt ? calcTotalHT(i) : calcTotal(i)), 0);

  const totalPending = invoices
    .filter(i => i.type === 'invoice' && (i.status === 'sent' || i.status === 'draft'))
    .reduce((sum, i) => sum + (company?.tvaExempt ? calcTotalHT(i) : calcTotal(i)), 0);

  const overdueInvoices = invoices.filter(i => i.type === 'invoice' && isOverdue(i));

  const recentInvoices = [...invoices]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  if (!onboarded) {
    return (
      <div className="max-w-lg mx-auto mt-16 text-center">
        <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <FileText className="w-8 h-8 text-indigo-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          Bienvenue sur Factorielle
        </h1>
        <p className="text-gray-500 mb-8">
          Commencez par configurer votre entreprise pour créer des factures conformes.
        </p>
        <Link
          href="/app/settings"
          className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-indigo-700 transition-colors"
        >
          Configurer mon entreprise
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
          <p className="text-gray-500 text-sm mt-1">Bonjour{company?.name ? `, ${company.name}` : ''}</p>
        </div>
        <Link
          href="/app/invoices/new"
          className="inline-flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nouvelle facture
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Chiffre encaissé', value: formatCurrency(totalRevenue), icon: TrendingUp, color: 'text-green-600 bg-green-50' },
          { label: 'En attente', value: formatCurrency(totalPending), icon: Clock, color: 'text-blue-600 bg-blue-50' },
          { label: 'En retard', value: String(overdueInvoices.length), icon: AlertTriangle, color: 'text-red-600 bg-red-50' },
          { label: 'Clients', value: String(clientCount), icon: Users, color: 'text-indigo-600 bg-indigo-50' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500">{stat.label}</span>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Recent invoices */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Documents récents</h2>
          <Link href="/app/invoices" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
            Voir tout
          </Link>
        </div>
        {recentInvoices.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Aucun document pour le moment</p>
            <Link
              href="/app/invoices/new"
              className="inline-flex items-center gap-2 text-indigo-600 font-medium text-sm mt-2 hover:text-indigo-700"
            >
              <Plus className="w-4 h-4" />
              Créer une facture
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {recentInvoices.map((inv) => (
              <Link
                key={inv.id}
                href={`/app/invoices/${inv.id}`}
                className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-gray-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{inv.number}</p>
                    <p className="text-xs text-gray-400">{formatDate(inv.date)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${getStatusColor(inv.status)}`}>
                    {getStatusLabel(inv.status)}
                  </span>
                  <span className="text-sm font-semibold text-gray-900 w-24 text-right">
                    {formatCurrency(company?.tvaExempt ? calcTotalHT(inv) : calcTotal(inv))}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
