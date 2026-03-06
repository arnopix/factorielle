'use client';

import Link from 'next/link';
import { FileText, Zap, Shield, Download, Users, ArrowRight, Check } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">F!</span>
            </div>
            <span className="font-bold text-xl text-gray-900">Factorielle</span>
          </div>
          <Link
            href="/app"
            className="bg-indigo-600 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-indigo-700 transition-colors"
          >
            Commencer gratuitement
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-1.5 rounded-full text-sm font-medium mb-8">
            <Zap className="w-4 h-4" />
            100% gratuit, sans inscription
          </div>
          <h1 className="text-5xl sm:text-7xl font-extrabold text-gray-900 tracking-tight leading-[1.1] mb-6">
            Vos factures pro
            <br />
            <span className="text-indigo-600">en 30 secondes</span>
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            Facturation électronique gratuite pour auto-entrepreneurs, freelances et TPE.
            Conforme, rapide, sans prise de tête.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/app"
              className="inline-flex items-center justify-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-indigo-700 transition-all hover:scale-105"
            >
              Créer ma première facture
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
          <p className="text-sm text-gray-400 mt-4">
            Pas de compte, pas de CB, pas de piège. Vos données restent sur votre appareil.
          </p>
        </div>
      </section>

      {/* Social proof */}
      <section className="py-12 bg-gray-50 border-y border-gray-100">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-2">
            Déjà adopté par
          </p>
          <p className="text-4xl font-bold text-gray-900">
            des milliers d&apos;indépendants
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Tout ce qu&apos;il faut, rien de plus
            </h2>
            <p className="text-lg text-gray-500 max-w-xl mx-auto">
              On a gardé l&apos;essentiel et viré le superflu. Résultat : vous facturez en quelques clics.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: FileText,
                title: 'Factures & Devis',
                desc: 'Créez des documents conformes à la législation française en quelques clics. Numérotation automatique, mentions légales incluses.',
              },
              {
                icon: Download,
                title: 'PDF pro instantané',
                desc: 'Générez des PDF professionnels avec votre identité. Envoyez-les directement à vos clients.',
              },
              {
                icon: Users,
                title: 'Gestion clients',
                desc: 'Gérez votre base clients. Les infos se préremplissent automatiquement sur vos factures.',
              },
              {
                icon: Shield,
                title: 'Conforme & légal',
                desc: 'Toutes les mentions obligatoires sont là : SIRET, TVA, pénalités de retard, conditions de paiement.',
              },
              {
                icon: Zap,
                title: 'Zéro friction',
                desc: 'Pas d\'inscription, pas de compte. Vos données restent sur votre navigateur, en sécurité.',
              },
              {
                icon: ArrowRight,
                title: 'Export & backup',
                desc: 'Exportez toutes vos données en un clic. Importez-les sur un autre appareil facilement.',
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="p-6 rounded-2xl border border-gray-100 hover:border-indigo-200 hover:shadow-lg transition-all group"
              >
                <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-indigo-100 transition-colors">
                  <feature.icon className="w-6 h-6 text-indigo-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Gratuit. Point.
          </h2>
          <p className="text-lg text-gray-500 mb-12 max-w-xl mx-auto">
            Pas de plan caché, pas de limite artificielle. On croit qu&apos;un outil de facturation basique devrait être gratuit.
          </p>
          <div className="max-w-sm mx-auto bg-white rounded-3xl border-2 border-indigo-600 p-8 shadow-xl">
            <div className="text-sm font-semibold text-indigo-600 uppercase tracking-wider mb-2">
              Pour toujours
            </div>
            <div className="text-6xl font-extrabold text-gray-900 mb-6">
              0<span className="text-2xl text-gray-400 font-normal">&euro;/mois</span>
            </div>
            <ul className="text-left space-y-3 mb-8">
              {[
                'Factures illimitées',
                'Devis illimités',
                'Clients illimités',
                'PDF professionnels',
                'Conforme législation française',
                'Données sur votre appareil',
                'Export/import des données',
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-gray-700">
                  <Check className="w-5 h-5 text-indigo-600 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <Link
              href="/app"
              className="block w-full bg-indigo-600 text-white py-3 rounded-full font-semibold hover:bg-indigo-700 transition-colors"
            >
              Commencer maintenant
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Arrêtez de perdre du temps sur vos factures
          </h2>
          <p className="text-lg text-gray-500 mb-8">
            Rejoignez les indépendants qui ont choisi la simplicité.
          </p>
          <Link
            href="/app"
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-indigo-700 transition-all hover:scale-105"
          >
            Créer ma première facture
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-gray-100">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-indigo-600 rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-xs">F!</span>
            </div>
            <span className="font-semibold text-gray-900">Factorielle</span>
          </div>
          <p className="text-sm text-gray-400">
            Facturation gratuite pour indépendants. Fait avec soin en France.
          </p>
        </div>
      </footer>
    </div>
  );
}
