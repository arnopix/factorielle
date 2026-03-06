'use client';

import { useEffect, useState, useMemo } from 'react';
import { TrendingUp, TrendingDown, Receipt, Clock, Users, Calendar, Download, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { getInvoices, getClients, getCompany } from '@/lib/store';
import { calcTotal, calcTotalHT, formatCurrency, formatDate, isOverdue } from '@/lib/invoice-utils';
import { Invoice, Client, Company } from '@/lib/types';

// ── Helpers ──────────────────────────────────────────────────

function getMonthKey(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function getMonthLabel(key: string): string {
  const [year, month] = key.split('-');
  const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
  return `${months[parseInt(month) - 1]} ${year}`;
}

function getQuarterKey(dateStr: string): string {
  const d = new Date(dateStr);
  const q = Math.ceil((d.getMonth() + 1) / 3);
  return `T${q} ${d.getFullYear()}`;
}

function invoiceAmount(inv: Invoice, company: Company): number {
  return company.tvaExempt ? calcTotalHT(inv) : calcTotal(inv);
}

function avgPaymentDays(invoices: Invoice[]): number | null {
  const paid = invoices.filter(i => i.type === 'invoice' && i.status === 'paid' && i.paidAt && i.sentAt);
  if (paid.length === 0) return null;
  const totalDays = paid.reduce((sum, i) => {
    const sent = new Date(i.sentAt!).getTime();
    const paidAt = new Date(i.paidAt!).getTime();
    return sum + (paidAt - sent) / 86400000;
  }, 0);
  return Math.round(totalDays / paid.length);
}

// ── Bar chart (pure CSS) ─────────────────────────────────────

function BarChart({ data, color = 'bg-indigo-500' }: { data: { label: string; value: number }[]; color?: string }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="flex items-end gap-1.5 h-40">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div className="w-full relative group">
            <div
              className={`w-full ${color} rounded-t-sm transition-all hover:opacity-80 min-h-[2px]`}
              style={{ height: `${Math.max((d.value / max) * 140, 2)}px` }}
            />
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              {formatCurrency(d.value)}
            </div>
          </div>
          <span className="text-[10px] text-gray-400 truncate w-full text-center">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

// ── Donut chart (SVG) ────────────────────────────────────────

function DonutChart({ segments }: { segments: { label: string; value: number; color: string }[] }) {
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  if (total === 0) return <div className="w-32 h-32 rounded-full bg-gray-100 mx-auto" />;

  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="relative w-36 h-36 mx-auto">
      <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
        {segments.map((seg, i) => {
          const pct = seg.value / total;
          const dash = pct * circumference;
          const currentOffset = offset;
          offset += dash;
          return (
            <circle
              key={i}
              cx="60" cy="60" r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth="16"
              strokeDasharray={`${dash} ${circumference - dash}`}
              strokeDashoffset={-currentOffset}
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-bold text-gray-900">{total}</span>
      </div>
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────

type Period = '3m' | '6m' | '12m' | 'all';

export default function ReportsPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [company, setCompany] = useState<Company | null>(null);
  const [period, setPeriod] = useState<Period>('12m');

  useEffect(() => {
    setInvoices(getInvoices());
    setClients(getClients());
    setCompany(getCompany());
  }, []);

  // Period filter
  const filteredInvoices = useMemo(() => {
    if (period === 'all') return invoices;
    const months = period === '3m' ? 3 : period === '6m' ? 6 : 12;
    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - months);
    return invoices.filter(i => new Date(i.date) >= cutoff);
  }, [invoices, period]);

  const onlyInvoices = filteredInvoices.filter(i => i.type === 'invoice');
  const onlyQuotes = filteredInvoices.filter(i => i.type === 'quote');

  if (!company) return null;

  const amt = (inv: Invoice) => invoiceAmount(inv, company);

  // ── KPIs ───────────────────────────────────────

  const totalRevenue = onlyInvoices.filter(i => i.status === 'paid').reduce((s, i) => s + amt(i), 0);
  const totalPending = onlyInvoices.filter(i => i.status === 'sent' || i.status === 'draft').reduce((s, i) => s + amt(i), 0);
  const totalOverdue = onlyInvoices.filter(i => isOverdue(i)).reduce((s, i) => s + amt(i), 0);
  const totalQuoted = onlyQuotes.reduce((s, i) => s + amt(i), 0);
  const avgDays = avgPaymentDays(onlyInvoices);
  const avgInvoice = onlyInvoices.length > 0 ? totalRevenue / Math.max(onlyInvoices.filter(i => i.status === 'paid').length, 1) : 0;

  // Conversion rate devis → facture
  const convertedQuotes = onlyQuotes.filter(q => {
    // A quote is "converted" if there exists an invoice with the same clientId created after the quote
    return onlyInvoices.some(inv => inv.clientId === q.clientId && new Date(inv.createdAt) > new Date(q.createdAt));
  });
  const conversionRate = onlyQuotes.length > 0 ? Math.round((convertedQuotes.length / onlyQuotes.length) * 100) : 0;

  // ── Revenue by month ──────────────────────────

  const revenueByMonth = useMemo(() => {
    const map = new Map<string, number>();
    onlyInvoices.filter(i => i.status === 'paid').forEach(inv => {
      const key = getMonthKey(inv.paidAt || inv.date);
      map.set(key, (map.get(key) || 0) + amt(inv));
    });
    const entries = [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
    return entries.map(([key, value]) => ({ label: getMonthLabel(key), value }));
  }, [onlyInvoices, company]);

  // ── Revenue by quarter ─────────────────────────

  const revenueByQuarter = useMemo(() => {
    const map = new Map<string, number>();
    onlyInvoices.filter(i => i.status === 'paid').forEach(inv => {
      const key = getQuarterKey(inv.paidAt || inv.date);
      map.set(key, (map.get(key) || 0) + amt(inv));
    });
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([key, value]) => ({ label: key, value }));
  }, [onlyInvoices, company]);

  // ── Invoices by month ──────────────────────────

  const invoicesByMonth = useMemo(() => {
    const map = new Map<string, number>();
    onlyInvoices.forEach(inv => {
      const key = getMonthKey(inv.date);
      map.set(key, (map.get(key) || 0) + 1);
    });
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([key, value]) => ({ label: getMonthLabel(key), value }));
  }, [onlyInvoices]);

  // ── Top clients ────────────────────────────────

  const topClients = useMemo(() => {
    const map = new Map<string, number>();
    onlyInvoices.filter(i => i.status === 'paid').forEach(inv => {
      map.set(inv.clientId, (map.get(inv.clientId) || 0) + amt(inv));
    });
    return [...map.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([clientId, revenue]) => {
        const client = clients.find(c => c.id === clientId);
        const count = onlyInvoices.filter(i => i.clientId === clientId && i.status === 'paid').length;
        return { name: client?.name || 'Client inconnu', revenue, count };
      });
  }, [onlyInvoices, clients, company]);

  // ── Status breakdown ───────────────────────────

  const statusCounts = useMemo(() => {
    const counts = { draft: 0, sent: 0, paid: 0, overdue: 0, cancelled: 0 };
    onlyInvoices.forEach(inv => {
      if (isOverdue(inv)) counts.overdue++;
      else if (inv.status in counts) counts[inv.status as keyof typeof counts]++;
    });
    return counts;
  }, [onlyInvoices]);

  const donutSegments = [
    { label: 'Payées', value: statusCounts.paid, color: '#22c55e' },
    { label: 'Envoyées', value: statusCounts.sent, color: '#3b82f6' },
    { label: 'Brouillons', value: statusCounts.draft, color: '#d1d5db' },
    { label: 'En retard', value: statusCounts.overdue, color: '#ef4444' },
    { label: 'Annulées', value: statusCounts.cancelled, color: '#f97316' },
  ];

  // ── Monthly comparison ─────────────────────────

  const currentMonth = getMonthKey(new Date().toISOString());
  const lastMonthDate = new Date();
  lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
  const lastMonth = getMonthKey(lastMonthDate.toISOString());

  const currentMonthRevenue = onlyInvoices.filter(i => i.status === 'paid' && getMonthKey(i.paidAt || i.date) === currentMonth).reduce((s, i) => s + amt(i), 0);
  const lastMonthRevenue = onlyInvoices.filter(i => i.status === 'paid' && getMonthKey(i.paidAt || i.date) === lastMonth).reduce((s, i) => s + amt(i), 0);
  const monthChange = lastMonthRevenue > 0 ? Math.round(((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100) : 0;

  // ── Unpaid aging ───────────────────────────────

  const unpaidAging = useMemo(() => {
    const buckets = { current: 0, late30: 0, late60: 0, late90: 0 };
    const now = Date.now();
    onlyInvoices.filter(i => i.status === 'sent' || isOverdue(i)).forEach(inv => {
      const due = new Date(inv.dueDate).getTime();
      const daysLate = Math.max(0, (now - due) / 86400000);
      const amount = amt(inv);
      if (daysLate <= 0) buckets.current += amount;
      else if (daysLate <= 30) buckets.late30 += amount;
      else if (daysLate <= 60) buckets.late60 += amount;
      else buckets.late90 += amount;
    });
    return buckets;
  }, [onlyInvoices, company]);

  // ── Export CSV ─────────────────────────────────

  function exportCSV() {
    const headers = ['Numéro', 'Type', 'Date', 'Client', 'Statut', 'Montant HT', 'Montant TTC'];
    const rows = filteredInvoices.map(inv => {
      const client = clients.find(c => c.id === inv.clientId);
      return [
        inv.number,
        inv.type === 'quote' ? 'Devis' : 'Facture',
        inv.date,
        client?.name || '',
        inv.status,
        calcTotalHT(inv).toFixed(2),
        calcTotal(inv).toFixed(2),
      ];
    });
    const csv = [headers, ...rows].map(r => r.join(';')).join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `factorielle-rapport-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // ── Render ─────────────────────────────────────

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rapports</h1>
          <p className="text-gray-500 text-sm mt-1">Analyse détaillée de votre activité</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Period selector */}
          <div className="flex bg-white border border-gray-200 rounded-lg p-0.5">
            {([['3m', '3 mois'], ['6m', '6 mois'], ['12m', '12 mois'], ['all', 'Tout']] as const).map(([val, label]) => (
              <button
                key={val}
                onClick={() => setPeriod(val)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  period === val ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <button
            onClick={exportCSV}
            className="inline-flex items-center gap-2 border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KpiCard
          label="CA encaissé"
          value={formatCurrency(totalRevenue)}
          sub={monthChange !== 0 ? `${monthChange > 0 ? '+' : ''}${monthChange}% vs mois dernier` : undefined}
          trend={monthChange > 0 ? 'up' : monthChange < 0 ? 'down' : 'flat'}
          icon={TrendingUp}
          color="text-green-600 bg-green-50"
        />
        <KpiCard
          label="En attente"
          value={formatCurrency(totalPending)}
          sub={`${onlyInvoices.filter(i => i.status === 'sent').length} facture(s)`}
          icon={Clock}
          color="text-blue-600 bg-blue-50"
        />
        <KpiCard
          label="Impayés"
          value={formatCurrency(totalOverdue)}
          sub={`${onlyInvoices.filter(i => isOverdue(i)).length} facture(s) en retard`}
          icon={Receipt}
          color="text-red-600 bg-red-50"
        />
        <KpiCard
          label="Facture moyenne"
          value={formatCurrency(avgInvoice)}
          sub={avgDays !== null ? `Délai moyen : ${avgDays}j` : undefined}
          icon={Calendar}
          color="text-indigo-600 bg-indigo-50"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Revenue chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-1">Chiffre d&apos;affaires encaissé</h2>
          <p className="text-sm text-gray-400 mb-6">Évolution mensuelle</p>
          {revenueByMonth.length === 0 ? (
            <div className="h-40 flex items-center justify-center text-gray-400 text-sm">Aucune donnée</div>
          ) : (
            <BarChart data={revenueByMonth} color="bg-indigo-500" />
          )}
        </div>

        {/* Status donut */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-1">Statut des factures</h2>
          <p className="text-sm text-gray-400 mb-6">Répartition</p>
          <DonutChart segments={donutSegments} />
          <div className="mt-4 space-y-2">
            {donutSegments.filter(s => s.value > 0).map(s => (
              <div key={s.label} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
                  <span className="text-gray-600">{s.label}</span>
                </div>
                <span className="font-medium text-gray-900">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Second row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Top clients */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-1">Top clients</h2>
          <p className="text-sm text-gray-400 mb-4">Par chiffre d&apos;affaires encaissé</p>
          {topClients.length === 0 ? (
            <div className="py-8 text-center text-gray-400 text-sm">Aucune donnée</div>
          ) : (
            <div className="space-y-3">
              {topClients.map((c, i) => {
                const pct = topClients[0].revenue > 0 ? (c.revenue / topClients[0].revenue) * 100 : 0;
                return (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400 w-5">{i + 1}.</span>
                        <span className="text-sm font-medium text-gray-900">{c.name}</span>
                        <span className="text-xs text-gray-400">{c.count} facture{c.count > 1 ? 's' : ''}</span>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">{formatCurrency(c.revenue)}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden ml-7">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Aging analysis */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-1">Ancienneté des impayés</h2>
          <p className="text-sm text-gray-400 mb-4">Répartition par échéance</p>
          <div className="space-y-4">
            {[
              { label: 'Non échues', value: unpaidAging.current, color: 'bg-green-500' },
              { label: '1-30 jours de retard', value: unpaidAging.late30, color: 'bg-yellow-500' },
              { label: '31-60 jours de retard', value: unpaidAging.late60, color: 'bg-orange-500' },
              { label: '+ de 60 jours de retard', value: unpaidAging.late90, color: 'bg-red-500' },
            ].map((bucket) => {
              const totalUnpaid = unpaidAging.current + unpaidAging.late30 + unpaidAging.late60 + unpaidAging.late90;
              const pct = totalUnpaid > 0 ? (bucket.value / totalUnpaid) * 100 : 0;
              return (
                <div key={bucket.label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600">{bucket.label}</span>
                    <span className="text-sm font-semibold text-gray-900">{formatCurrency(bucket.value)}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full ${bucket.color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
          {unpaidAging.current + unpaidAging.late30 + unpaidAging.late60 + unpaidAging.late90 === 0 && (
            <div className="py-8 text-center text-gray-400 text-sm">Aucun impayé</div>
          )}
        </div>
      </div>

      {/* Third row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Volume chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-1">Volume de factures</h2>
          <p className="text-sm text-gray-400 mb-6">Nombre de factures par mois</p>
          {invoicesByMonth.length === 0 ? (
            <div className="h-40 flex items-center justify-center text-gray-400 text-sm">Aucune donnée</div>
          ) : (
            <BarChart data={invoicesByMonth} color="bg-emerald-500" />
          )}
        </div>

        {/* Quick stats */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Indicateurs clés</h2>
          <div className="space-y-4">
            <StatRow label="Total factures" value={String(onlyInvoices.length)} />
            <StatRow label="Total devis" value={String(onlyQuotes.length)} />
            <StatRow label="Devis convertis" value={`${conversionRate}%`} />
            <StatRow label="Clients actifs" value={String(new Set(onlyInvoices.map(i => i.clientId)).size)} />
            <StatRow label="Total devisé" value={formatCurrency(totalQuoted)} />
            <StatRow label="Délai paiement moy." value={avgDays !== null ? `${avgDays} jours` : '—'} />
          </div>
        </div>
      </div>

      {/* Quarterly revenue */}
      {revenueByQuarter.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-1">CA par trimestre</h2>
          <p className="text-sm text-gray-400 mb-6">Pour vos déclarations</p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {revenueByQuarter.map((q) => (
              <div key={q.label} className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-500 mb-1">{q.label}</p>
                <p className="text-xl font-bold text-gray-900">{formatCurrency(q.value)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Sub-components ───────────────────────────────────────────

function KpiCard({ label, value, sub, trend, icon: Icon, color }: {
  label: string;
  value: string;
  sub?: string;
  trend?: 'up' | 'down' | 'flat';
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-gray-500">{label}</span>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {sub && (
        <p className={`text-xs mt-1 flex items-center gap-1 ${
          trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-400'
        }`}>
          {trend === 'up' && <ArrowUpRight className="w-3 h-3" />}
          {trend === 'down' && <ArrowDownRight className="w-3 h-3" />}
          {trend === 'flat' && <Minus className="w-3 h-3" />}
          {sub}
        </p>
      )}
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-semibold text-gray-900">{value}</span>
    </div>
  );
}
