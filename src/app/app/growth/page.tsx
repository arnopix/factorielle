'use client';

import { useState } from 'react';
import { Target, Search, TrendingUp, Users, Megaphone, CheckCircle, Circle, ChevronDown, ChevronRight, ExternalLink, Zap, Globe, MessageSquare, Handshake } from 'lucide-react';

// ── Types ────────────────────────────────────────────────────

interface Task {
  id: string;
  title: string;
  description: string;
  effort: 'trivial' | 'faible' | 'moyen' | 'élevé';
  impact: 'faible' | 'moyen' | 'fort' | 'critique';
  category: string;
  done: boolean;
}

interface SEOPage {
  path: string;
  title: string;
  keyword: string;
  volume: string;
  difficulty: 'facile' | 'moyen' | 'difficile';
  status: 'à créer' | 'en cours' | 'publié';
  priority: number;
}

interface Channel {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  budget: string;
  cac: string;
  priority: 'P0' | 'P1' | 'P2';
  actions: string[];
}

// ── Data ─────────────────────────────────────────────────────

const gtmTasks: Task[] = [
  // SEO
  { id: 'seo-1', title: 'Créer la page /guide/facture-auto-entrepreneur', description: 'Guide complet sur la facturation pour auto-entrepreneurs. Requête à 12k/mois.', effort: 'moyen', impact: 'critique', category: 'SEO', done: false },
  { id: 'seo-2', title: 'Créer la page /guide/mentions-obligatoires-facture', description: 'Liste exhaustive des mentions légales obligatoires sur une facture.', effort: 'moyen', impact: 'fort', category: 'SEO', done: false },
  { id: 'seo-3', title: 'Créer la page /guide/modele-facture-gratuit', description: 'Modèles téléchargeables + CTA vers l\'app. Requête à 15k/mois.', effort: 'moyen', impact: 'critique', category: 'SEO', done: false },
  { id: 'seo-4', title: 'Créer la page /guide/facturation-electronique-2026', description: 'Guide sur l\'obligation de facturation électronique. 20k recherches/mois.', effort: 'moyen', impact: 'critique', category: 'SEO', done: false },
  { id: 'seo-5', title: 'Créer 10 templates de factures téléchargeables', description: 'Word/Excel/Google Docs avec badge Factorielle. Aimant à trafic passif.', effort: 'élevé', impact: 'fort', category: 'SEO', done: false },
  { id: 'seo-6', title: 'Optimiser les meta tags de toutes les pages', description: 'Title, description, OG tags pour chaque page de l\'app et du site.', effort: 'faible', impact: 'moyen', category: 'SEO', done: false },
  { id: 'seo-7', title: 'Ajouter le sitemap.xml et robots.txt', description: 'Configuration technique SEO de base.', effort: 'trivial', impact: 'moyen', category: 'SEO', done: false },
  { id: 'seo-8', title: 'Créer la page /guide/auto-entrepreneur-tva', description: 'Tout sur la TVA pour les auto-entrepreneurs. 10k/mois.', effort: 'moyen', impact: 'fort', category: 'SEO', done: false },
  { id: 'seo-9', title: 'Créer la page /facture-rapide (one-shot)', description: 'Formulaire pour créer UNE facture sans inscription. Conversion 20-30%.', effort: 'élevé', impact: 'critique', category: 'SEO', done: false },
  { id: 'seo-10', title: 'Inscrire Factorielle sur les annuaires SaaS', description: 'Capterra, G2, AlternativeTo, Product Hunt listing.', effort: 'faible', impact: 'moyen', category: 'SEO', done: false },

  // Viralité produit
  { id: 'viral-1', title: 'Rendre le badge PDF cliquable avec UTM', description: 'Le lien dans le PDF doit pointer vers factorielle.app/?utm_source=pdf', effort: 'trivial', impact: 'critique', category: 'Viralité', done: false },
  { id: 'viral-2', title: 'Créer la landing /depuis-facture', description: 'Page dédiée pour les gens qui cliquent sur le badge PDF.', effort: 'faible', impact: 'fort', category: 'Viralité', done: false },
  { id: 'viral-3', title: 'Ajouter le partage post-création de facture', description: 'Après création : boutons WhatsApp, LinkedIn, Twitter, copier le lien.', effort: 'faible', impact: 'fort', category: 'Viralité', done: false },
  { id: 'viral-4', title: 'Créer le programme de parrainage', description: 'Lien unique /r/pseudo, 1 mois Pro offert par parrainage actif.', effort: 'élevé', impact: 'fort', category: 'Viralité', done: false },
  { id: 'viral-5', title: 'Ajouter le rapport annuel partageable', description: 'En janvier : "Votre année en chiffres" avec visuel partageable.', effort: 'moyen', impact: 'moyen', category: 'Viralité', done: false },

  // Réseaux sociaux
  { id: 'social-1', title: 'Créer les comptes Twitter/X et LinkedIn', description: 'Profils professionnels avec branding Factorielle.', effort: 'trivial', impact: 'moyen', category: 'Social', done: false },
  { id: 'social-2', title: 'Publier 1 post LinkedIn/jour pendant 30 jours', description: 'Mix : éducatif, storytelling, screenshots produit, témoignages.', effort: 'élevé', impact: 'fort', category: 'Social', done: false },
  { id: 'social-3', title: 'Créer 5 threads Twitter éducatifs', description: 'Sur la facturation, les erreurs courantes, les obligations légales.', effort: 'moyen', impact: 'moyen', category: 'Social', done: false },
  { id: 'social-4', title: 'Créer 3 vidéos TikTok/Reels', description: '"Je crée une facture en 30 secondes", "3 erreurs sur vos factures"...', effort: 'moyen', impact: 'moyen', category: 'Social', done: false },

  // Communautés
  { id: 'community-1', title: 'Rejoindre 10 groupes Facebook auto-entrepreneur', description: 'Être actif, répondre aux questions, mentionner Factorielle quand pertinent.', effort: 'faible', impact: 'fort', category: 'Communautés', done: false },
  { id: 'community-2', title: 'Être actif sur r/vosfinances', description: 'Répondre aux questions sur la facturation et la création d\'entreprise.', effort: 'faible', impact: 'moyen', category: 'Communautés', done: false },
  { id: 'community-3', title: 'Rejoindre les Slacks/Discords freelance', description: 'FreelanceRepublik, Malt Community, etc.', effort: 'faible', impact: 'moyen', category: 'Communautés', done: false },

  // Partenariats
  { id: 'partner-1', title: 'Contacter 20 comptables pour partenariat', description: 'Proposer le portail comptable gratuit + commission sur les conversions Pro.', effort: 'élevé', impact: 'critique', category: 'Partenariats', done: false },
  { id: 'partner-2', title: 'Contacter Malt/Crème de la Crème', description: 'Proposer l\'intégration ou le partenariat pour leurs freelances.', effort: 'moyen', impact: 'fort', category: 'Partenariats', done: false },
  { id: 'partner-3', title: 'Distribuer des flyers dans 10 coworkings', description: 'Paris, Lyon, Bordeaux, Nantes. QR code vers l\'app.', effort: 'moyen', impact: 'moyen', category: 'Partenariats', done: false },
  { id: 'partner-4', title: 'Contacter BGE/CCI pour recommandation', description: 'Proposer Factorielle comme outil recommandé dans les formations.', effort: 'moyen', impact: 'fort', category: 'Partenariats', done: false },

  // Paid
  { id: 'paid-1', title: 'Lancer Google Ads sur 5 requêtes principales', description: '"logiciel facturation gratuit", "facture auto entrepreneur", etc.', effort: 'moyen', impact: 'critique', category: 'Paid', done: false },
  { id: 'paid-2', title: 'Créer 3 créatives Meta Ads', description: 'Vidéo démo 15s, carrousel avant/après, témoignage.', effort: 'moyen', impact: 'fort', category: 'Paid', done: false },
  { id: 'paid-3', title: 'Setup le retargeting Meta', description: 'Pixel FB/Meta sur le site, audiences de retargeting.', effort: 'faible', impact: 'fort', category: 'Paid', done: false },

  // Product Hunt
  { id: 'ph-1', title: 'Préparer le launch Product Hunt', description: 'Screenshots, vidéo, tagline, description. Mardi ou mercredi.', effort: 'moyen', impact: 'fort', category: 'Lancement', done: false },
  { id: 'ph-2', title: 'Créer la page /temoignages (Wall of Love)', description: 'Agréger les tweets et posts LinkedIn des utilisateurs.', effort: 'faible', impact: 'moyen', category: 'Lancement', done: false },
];

const seoPages: SEOPage[] = [
  { path: '/guide/facturation-electronique-2026', title: 'Facturation électronique obligatoire 2026', keyword: 'facturation électronique obligatoire', volume: '20 000/mois', difficulty: 'moyen', status: 'à créer', priority: 1 },
  { path: '/guide/modele-facture-gratuit', title: 'Modèle de facture gratuit', keyword: 'modèle facture gratuit', volume: '15 000/mois', difficulty: 'difficile', status: 'à créer', priority: 2 },
  { path: '/guide/facture-auto-entrepreneur', title: 'Comment faire une facture auto-entrepreneur', keyword: 'facture auto entrepreneur', volume: '12 000/mois', difficulty: 'moyen', status: 'à créer', priority: 3 },
  { path: '/guide/auto-entrepreneur-tva', title: 'TVA auto-entrepreneur : le guide complet', keyword: 'auto entrepreneur TVA', volume: '10 000/mois', difficulty: 'moyen', status: 'à créer', priority: 4 },
  { path: '/guide/mentions-obligatoires-facture', title: 'Mentions obligatoires sur une facture', keyword: 'mentions obligatoires facture', volume: '8 000/mois', difficulty: 'facile', status: 'à créer', priority: 5 },
  { path: '/modele/facture-freelance', title: 'Modèle facture freelance', keyword: 'modèle facture freelance', volume: '7 000/mois', difficulty: 'facile', status: 'à créer', priority: 6 },
  { path: '/guide/numero-tva-intracommunautaire', title: 'Numéro TVA intracommunautaire', keyword: 'numéro TVA intracommunautaire', volume: '6 000/mois', difficulty: 'facile', status: 'à créer', priority: 7 },
  { path: '/guide/devis-obligatoire', title: 'Le devis est-il obligatoire ?', keyword: 'devis obligatoire', volume: '5 000/mois', difficulty: 'facile', status: 'à créer', priority: 8 },
  { path: '/modele/devis-prestation-service', title: 'Modèle devis prestation de service', keyword: 'modèle devis prestation de service', volume: '4 000/mois', difficulty: 'facile', status: 'à créer', priority: 9 },
  { path: '/guide/penalites-retard-facture', title: 'Pénalités de retard sur facture', keyword: 'pénalités retard facture', volume: '3 000/mois', difficulty: 'facile', status: 'à créer', priority: 10 },
  { path: '/facture-rapide', title: 'Créer une facture en ligne gratuitement', keyword: 'créer facture en ligne gratuit', volume: '8 000/mois', difficulty: 'difficile', status: 'à créer', priority: 0 },
];

const channels: Channel[] = [
  {
    name: 'SEO / Content',
    icon: Search,
    budget: '0 - 500€/mois',
    cac: '< 1€',
    priority: 'P0',
    actions: [
      '10 guides SEO long-tail (80k+ recherches/mois captables)',
      '10 templates téléchargeables avec badge Factorielle',
      'Page /facture-rapide (conversion 20-30%)',
      'Blog : 2 articles/semaine',
    ],
  },
  {
    name: 'Viralité produit',
    icon: Zap,
    budget: '0€',
    cac: '0€',
    priority: 'P0',
    actions: [
      'Badge PDF cliquable avec UTM tracking',
      'Landing /depuis-facture dédiée',
      'Partage post-création (WhatsApp, LinkedIn, Twitter)',
      'Programme de parrainage (1 mois Pro/filleul)',
    ],
  },
  {
    name: 'Google Ads',
    icon: Target,
    budget: '1 500€/mois',
    cac: '2 - 5€',
    priority: 'P1',
    actions: [
      '"logiciel facturation gratuit" (CPC ~1-2€)',
      '"facture auto entrepreneur" (CPC ~0.5-1€)',
      '"modèle facture gratuit" (CPC ~0.3€)',
      '"alternative [concurrent]" (CPC ~2-3€)',
    ],
  },
  {
    name: 'Réseaux sociaux',
    icon: MessageSquare,
    budget: '0 - 500€/mois',
    cac: '3 - 7€',
    priority: 'P1',
    actions: [
      'LinkedIn : 1 post/jour (storytelling fondateur)',
      'Twitter/X : threads éducatifs + screenshots produit',
      'TikTok/Reels : démos courtes "facture en 30s"',
      'Meta Ads : vidéo 15s + carrousel + retargeting',
    ],
  },
  {
    name: 'Communautés',
    icon: Users,
    budget: '0€',
    cac: '0€',
    priority: 'P1',
    actions: [
      'Groupes Facebook auto-entrepreneur (100k+ membres)',
      'r/vosfinances (300k+ membres)',
      'Slacks/Discords freelance',
      'Forums auto-entrepreneur.fr',
    ],
  },
  {
    name: 'Partenariats',
    icon: Handshake,
    budget: '0 - 2 000€',
    cac: '0 - 5€',
    priority: 'P0',
    actions: [
      'Comptables : portail gratuit + commission 15-20%',
      'Plateformes freelance (Malt, Crème de la Crème)',
      'Coworkings : flyers + QR code',
      'BGE / CCI / formations création d\'entreprise',
    ],
  },
];

// ── Persistence (localStorage) ───────────────────────────────

const STORAGE_KEY = 'factorielle_gtm_tasks';

function loadTaskState(): Record<string, boolean> {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch { return {}; }
}

function saveTaskState(state: Record<string, boolean>) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// ── Components ───────────────────────────────────────────────

function EffortBadge({ effort }: { effort: string }) {
  const colors: Record<string, string> = {
    trivial: 'bg-green-100 text-green-700',
    faible: 'bg-blue-100 text-blue-700',
    moyen: 'bg-yellow-100 text-yellow-700',
    'élevé': 'bg-red-100 text-red-700',
  };
  return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colors[effort] || ''}`}>{effort}</span>;
}

function ImpactBadge({ impact }: { impact: string }) {
  const colors: Record<string, string> = {
    faible: 'bg-gray-100 text-gray-600',
    moyen: 'bg-blue-100 text-blue-700',
    fort: 'bg-indigo-100 text-indigo-700',
    critique: 'bg-purple-100 text-purple-700',
  };
  return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colors[impact] || ''}`}>{impact}</span>;
}

// ── Main page ────────────────────────────────────────────────

type Tab = 'roadmap' | 'seo' | 'channels';

export default function GrowthPage() {
  const [tab, setTab] = useState<Tab>('roadmap');
  const [taskState, setTaskState] = useState<Record<string, boolean>>(() => loadTaskState());
  const [expandedCat, setExpandedCat] = useState<string | null>('SEO');
  const [filterCat, setFilterCat] = useState<string>('all');

  function toggleTask(id: string) {
    const next = { ...taskState, [id]: !taskState[id] };
    setTaskState(next);
    saveTaskState(next);
  }

  const categories = [...new Set(gtmTasks.map(t => t.category))];
  const filteredTasks = filterCat === 'all' ? gtmTasks : gtmTasks.filter(t => t.category === filterCat);
  const doneCount = gtmTasks.filter(t => taskState[t.id]).length;
  const totalCount = gtmTasks.length;
  const progressPct = Math.round((doneCount / totalCount) * 100);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Go-to-Market</h1>
          <p className="text-gray-500 text-sm mt-1">Plan d&apos;acquisition et croissance</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">{doneCount}/{totalCount} actions</p>
          <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden mt-1">
            <div className="h-full bg-indigo-600 rounded-full transition-all" style={{ width: `${progressPct}%` }} />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white border border-gray-200 rounded-lg p-1 mb-8 w-fit">
        {([
          ['roadmap', 'Roadmap actions'],
          ['seo', 'Plan SEO'],
          ['channels', 'Canaux'],
        ] as const).map(([val, label]) => (
          <button
            key={val}
            onClick={() => setTab(val)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              tab === val ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── TAB: Roadmap ─────────────────────────── */}
      {tab === 'roadmap' && (
        <div>
          {/* Category filter */}
          <div className="flex gap-2 mb-6 flex-wrap">
            <button
              onClick={() => setFilterCat('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
                filterCat === 'all' ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              Tout ({totalCount})
            </button>
            {categories.map(cat => {
              const count = gtmTasks.filter(t => t.category === cat).length;
              const catDone = gtmTasks.filter(t => t.category === cat && taskState[t.id]).length;
              return (
                <button
                  key={cat}
                  onClick={() => setFilterCat(cat)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
                    filterCat === cat ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {cat} ({catDone}/{count})
                </button>
              );
            })}
          </div>

          {/* Task list grouped by category */}
          <div className="space-y-3">
            {(filterCat === 'all' ? categories : [filterCat]).map(cat => {
              const catTasks = filteredTasks.filter(t => t.category === cat);
              const isExpanded = expandedCat === cat || filterCat !== 'all';
              const catDone = catTasks.filter(t => taskState[t.id]).length;

              return (
                <div key={cat} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <button
                    onClick={() => filterCat === 'all' && setExpandedCat(isExpanded ? null : cat)}
                    className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {isExpanded ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                      <span className="font-semibold text-gray-900">{cat}</span>
                      <span className="text-xs text-gray-400">{catDone}/{catTasks.length}</span>
                    </div>
                    <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${catTasks.length > 0 ? (catDone / catTasks.length) * 100 : 0}%` }} />
                    </div>
                  </button>
                  {isExpanded && (
                    <div className="border-t border-gray-100 divide-y divide-gray-50">
                      {catTasks.map(task => (
                        <div key={task.id} className="flex items-start gap-3 p-4 hover:bg-gray-50 transition-colors">
                          <button
                            onClick={() => toggleTask(task.id)}
                            className="mt-0.5 shrink-0"
                          >
                            {taskState[task.id] ? (
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            ) : (
                              <Circle className="w-5 h-5 text-gray-300 hover:text-indigo-400" />
                            )}
                          </button>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium ${taskState[task.id] ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                              {task.title}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">{task.description}</p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <EffortBadge effort={task.effort} />
                            <ImpactBadge impact={task.impact} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── TAB: SEO Plan ────────────────────────── */}
      {tab === 'seo' && (
        <div>
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100 p-6 mb-6">
            <h2 className="font-semibold text-indigo-900 mb-2">Potentiel SEO total</h2>
            <p className="text-3xl font-bold text-indigo-600 mb-1">90 000+ recherches/mois</p>
            <p className="text-sm text-indigo-700">sur les 11 pages à créer. Captable progressivement sur 3-6 mois.</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">#</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Page</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Mot-clé cible</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Volume</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Difficulté</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {seoPages.sort((a, b) => a.priority - b.priority).map((page, i) => (
                  <tr key={page.path} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-400">{i + 1}</td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-900">{page.title}</p>
                      <p className="text-xs text-indigo-500 font-mono">{page.path}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{page.keyword}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{page.volume}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        page.difficulty === 'facile' ? 'bg-green-100 text-green-700' :
                        page.difficulty === 'moyen' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>{page.difficulty}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        page.status === 'publié' ? 'bg-green-100 text-green-700' :
                        page.status === 'en cours' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>{page.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Structure recommandée pour chaque guide</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-sm">
              <div>
                <p className="font-medium text-gray-900 mb-2">Contenu</p>
                <ul className="space-y-1.5 text-gray-600">
                  <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />Titre H1 avec le mot-clé principal</li>
                  <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />Introduction de 2-3 lignes (TL;DR)</li>
                  <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />Sommaire cliquable (table of contents)</li>
                  <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />2000-3000 mots de contenu utile</li>
                  <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />FAQ en bas (schema markup)</li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-gray-900 mb-2">Conversion</p>
                <ul className="space-y-1.5 text-gray-600">
                  <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />CTA sticky en bas : &quot;Créez votre facture conforme&quot;</li>
                  <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />Template téléchargeable (avec badge)</li>
                  <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />Encart &quot;Factorielle&quot; dans le corps du texte</li>
                  <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />Liens internes vers les autres guides</li>
                  <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />Meta description avec CTA</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB: Channels ────────────────────────── */}
      {tab === 'channels' && (
        <div>
          {/* Budget summary */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-xl border border-gray-200 p-5 text-center">
              <p className="text-sm text-gray-500 mb-1">Budget mensuel recommandé</p>
              <p className="text-2xl font-bold text-gray-900">2 000 - 4 500€</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5 text-center">
              <p className="text-sm text-gray-500 mb-1">CAC moyen cible</p>
              <p className="text-2xl font-bold text-indigo-600">&lt; 5€</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5 text-center">
              <p className="text-sm text-gray-500 mb-1">Objectif M+6</p>
              <p className="text-2xl font-bold text-green-600">10 000 users</p>
            </div>
          </div>

          {/* Channel cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {channels.map((ch) => (
              <div key={ch.name} className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
                      <ch.icon className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{ch.name}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                          ch.priority === 'P0' ? 'bg-red-100 text-red-700' :
                          ch.priority === 'P1' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>{ch.priority}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-400">Budget</p>
                    <p className="text-sm font-medium text-gray-900">{ch.budget}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">CAC estimé</p>
                    <p className="text-sm font-medium text-gray-900">{ch.cac}</p>
                  </div>
                </div>
                <ul className="space-y-2">
                  {ch.actions.map((action, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                      <ChevronRight className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
                      {action}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Timeline */}
          <div className="mt-8 bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-6">Timeline recommandée</h3>
            <div className="space-y-6">
              {[
                { week: 'Semaine 1-2', label: 'Fondations', tasks: 'Badge PDF cliquable, 5 premiers guides SEO, sitemap/robots.txt, comptes sociaux', budget: '0€' },
                { week: 'Semaine 3-4', label: 'Contenu', tasks: 'Page /facture-rapide, 5 templates, premiers posts LinkedIn/Twitter, 10 groupes Facebook', budget: '0€' },
                { week: 'Semaine 5-6', label: 'Acquisition payante', tasks: 'Google Ads (5 requêtes), Meta retargeting, contacter 20 comptables', budget: '2 000€' },
                { week: 'Semaine 7-8', label: 'Scale', tasks: 'Product Hunt launch, programme parrainage, Meta Ads créatives, partenariats plateformes', budget: '2 000€' },
              ].map((phase, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs font-bold">{i + 1}</div>
                    {i < 3 && <div className="w-0.5 h-full bg-indigo-200 mt-1" />}
                  </div>
                  <div className="pb-2">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-sm font-semibold text-gray-900">{phase.week}</span>
                      <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-medium">{phase.label}</span>
                      <span className="text-xs text-gray-400">{phase.budget}</span>
                    </div>
                    <p className="text-sm text-gray-600">{phase.tasks}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
