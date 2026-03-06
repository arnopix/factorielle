'use client';

import { useEffect, useState } from 'react';
import { Save, Download, Upload } from 'lucide-react';
import { getCompany, saveCompany, setOnboarded, exportAllData, importAllData } from '@/lib/store';
import { Company } from '@/lib/types';

export default function SettingsPage() {
  const [company, setCompanyState] = useState<Company | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setCompanyState(getCompany());
  }, []);

  function handleSave() {
    if (!company) return;
    saveCompany(company);
    setOnboarded();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleExport() {
    const data = exportAllData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `factorielle-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImport() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          importAllData(reader.result as string);
          setCompanyState(getCompany());
          alert('Données importées avec succès !');
        } catch {
          alert('Erreur lors de l\'import. Vérifiez le fichier.');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }

  if (!company) return null;

  const Field = ({ label, value, onChange, placeholder, type = 'text', span = 1 }: {
    label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; span?: number;
  }) => (
    <div className={span === 2 ? 'col-span-2' : ''}>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
          <p className="text-gray-500 text-sm mt-1">Configurez votre entreprise</p>
        </div>
        <button
          onClick={handleSave}
          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
            saved
              ? 'bg-green-600 text-white'
              : 'bg-indigo-600 text-white hover:bg-indigo-700'
          }`}
        >
          <Save className="w-4 h-4" />
          {saved ? 'Enregistré !' : 'Enregistrer'}
        </button>
      </div>

      <div className="space-y-8">
        {/* Identity */}
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Identité</h2>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Nom / Raison sociale" value={company.name} onChange={v => setCompanyState({ ...company, name: v })} placeholder="Mon Entreprise" span={2} />
            <Field label="Forme juridique" value={company.legalForm} onChange={v => setCompanyState({ ...company, legalForm: v })} placeholder="Auto-entrepreneur" />
            <Field label="Email" value={company.email} onChange={v => setCompanyState({ ...company, email: v })} type="email" />
            <Field label="Téléphone" value={company.phone} onChange={v => setCompanyState({ ...company, phone: v })} type="tel" />
            <Field label="Site web" value={company.website} onChange={v => setCompanyState({ ...company, website: v })} />
          </div>
        </section>

        {/* Address */}
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Adresse</h2>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Adresse" value={company.address} onChange={v => setCompanyState({ ...company, address: v })} span={2} />
            <Field label="Code postal" value={company.zip} onChange={v => setCompanyState({ ...company, zip: v })} />
            <Field label="Ville" value={company.city} onChange={v => setCompanyState({ ...company, city: v })} />
            <Field label="Pays" value={company.country} onChange={v => setCompanyState({ ...company, country: v })} />
          </div>
        </section>

        {/* Legal */}
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Informations légales</h2>
          <div className="grid grid-cols-2 gap-4">
            <Field label="SIRET" value={company.siret} onChange={v => setCompanyState({ ...company, siret: v })} placeholder="123 456 789 00012" />
            <Field label="SIREN" value={company.siren} onChange={v => setCompanyState({ ...company, siren: v })} placeholder="123 456 789" />
            <Field label="N. TVA intracommunautaire" value={company.tvaNumber} onChange={v => setCompanyState({ ...company, tvaNumber: v })} placeholder="FR12345678901" />
            <Field label="Code APE/NAF" value={company.apeCode} onChange={v => setCompanyState({ ...company, apeCode: v })} placeholder="6201Z" />
            <Field label="Ville RCS" value={company.rcsCity} onChange={v => setCompanyState({ ...company, rcsCity: v })} placeholder="Paris" />
            <Field label="Capital social (EUR)" value={company.capitalSocial} onChange={v => setCompanyState({ ...company, capitalSocial: v })} placeholder="1000" />
          </div>
          <div className="mt-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={company.tvaExempt}
                onChange={e => setCompanyState({ ...company, tvaExempt: e.target.checked })}
                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-700">
                TVA non applicable (art. 293 B du CGI) - Auto-entrepreneurs en franchise de base
              </span>
            </label>
          </div>
        </section>

        {/* Payment */}
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Paiement</h2>
          <div className="grid grid-cols-2 gap-4">
            <Field label="IBAN" value={company.iban} onChange={v => setCompanyState({ ...company, iban: v })} placeholder="FR76 1234 5678 9012 3456 7890 123" span={2} />
            <Field label="BIC/SWIFT" value={company.bic} onChange={v => setCompanyState({ ...company, bic: v })} placeholder="BNPAFRPP" />
            <Field label="Mode de paiement par défaut" value={company.defaultPaymentMethod} onChange={v => setCompanyState({ ...company, defaultPaymentMethod: v })} />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Délai de paiement (jours)</label>
              <input
                type="number"
                value={company.defaultPaymentTerms}
                onChange={e => setCompanyState({ ...company, defaultPaymentTerms: parseInt(e.target.value) || 30 })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </section>

        {/* Default notes */}
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Notes par défaut</h2>
          <textarea
            value={company.defaultNotes}
            onChange={e => setCompanyState({ ...company, defaultNotes: e.target.value })}
            rows={3}
            placeholder="Notes affichées en bas de chaque facture…"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </section>

        {/* Data management */}
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Données</h2>
          <p className="text-sm text-gray-500 mb-4">
            Vos données sont stockées localement dans votre navigateur. Exportez-les régulièrement pour les sauvegarder.
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleExport}
              className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Download className="w-4 h-4" />
              Exporter mes données
            </button>
            <button
              onClick={handleImport}
              className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Upload className="w-4 h-4" />
              Importer des données
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
