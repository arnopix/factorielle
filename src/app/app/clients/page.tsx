'use client';

import { useEffect, useState } from 'react';
import { Users, Plus, Search, Trash2, Edit3 } from 'lucide-react';
import { getClients, saveClient, deleteClient } from '@/lib/store';
import { Client } from '@/lib/types';
import { v4 as uuid } from 'uuid';

const emptyClient = (): Client => ({
  id: uuid(),
  name: '',
  email: '',
  phone: '',
  address: '',
  zip: '',
  city: '',
  country: 'France',
  siret: '',
  tvaNumber: '',
  notes: '',
  createdAt: new Date().toISOString(),
});

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Client | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    setClients(getClients());
  }, []);

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  function handleSave() {
    if (!editing || !editing.name.trim()) return;
    saveClient(editing);
    setClients(getClients());
    setEditing(null);
    setShowForm(false);
  }

  function handleDelete(id: string) {
    if (!confirm('Supprimer ce client ?')) return;
    deleteClient(id);
    setClients(getClients());
  }

  function startNew() {
    setEditing(emptyClient());
    setShowForm(true);
  }

  function startEdit(client: Client) {
    setEditing({ ...client });
    setShowForm(true);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
          <p className="text-gray-500 text-sm mt-1">{clients.length} client{clients.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={startNew}
          className="inline-flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nouveau client
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Rechercher un client..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      {/* Modal / Form */}
      {showForm && editing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-gray-900 mb-6">
              {editing.createdAt === editing.id ? 'Nouveau client' : 'Modifier le client'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom / Raison sociale *</label>
                <input
                  type="text"
                  value={editing.name}
                  onChange={e => setEditing({ ...editing, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Acme Corp"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={editing.email}
                    onChange={e => setEditing({ ...editing, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                  <input
                    type="tel"
                    value={editing.phone}
                    onChange={e => setEditing({ ...editing, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                <input
                  type="text"
                  value={editing.address}
                  onChange={e => setEditing({ ...editing, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Code postal</label>
                  <input
                    type="text"
                    value={editing.zip}
                    onChange={e => setEditing({ ...editing, zip: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
                  <input
                    type="text"
                    value={editing.city}
                    onChange={e => setEditing({ ...editing, city: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SIRET</label>
                  <input
                    type="text"
                    value={editing.siret}
                    onChange={e => setEditing({ ...editing, siret: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">N. TVA</label>
                  <input
                    type="text"
                    value={editing.tvaNumber}
                    onChange={e => setEditing({ ...editing, tvaNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={editing.notes}
                  onChange={e => setEditing({ ...editing, notes: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700"
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Client list */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">
            {clients.length === 0 ? 'Aucun client pour le moment' : 'Aucun résultat'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          {filtered.map(client => (
            <div key={client.id} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
              <div>
                <p className="font-medium text-gray-900 text-sm">{client.name}</p>
                <p className="text-xs text-gray-400">
                  {[client.email, client.city].filter(Boolean).join(' - ')}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => startEdit(client)}
                  className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(client.id)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
