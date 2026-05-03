'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, ArrowLeft, FileText, MessageSquare, Users, GitBranch, X } from 'lucide-react';
import Link from 'next/link';

interface ConfigItem {
  id: string;
  title?: string;
  name?: string;
  filename?: string;
  phase?: string;
  status?: string;
  role?: string;
  category?: string;
  modified?: string;
}

type ItemType = 'specs' | 'prompts' | 'maestros' | 'workflows';

interface SpecItem extends ConfigItem {
  owner?: string;
  priority?: string;
  version?: string;
}

export default function ConfigurationPage() {
  const [activeTab, setActiveTab] = useState<ItemType>('specs');
  const [items, setItems] = useState<ConfigItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});

  const tabs: { id: ItemType; label: string; icon: React.ReactNode }[] = [
    { id: 'specs', label: 'Spécifications', icon: <FileText className="w-4 h-4" /> },
    { id: 'prompts', label: 'Prompts', icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'maestros', label: 'Maestros', icon: <Users className="w-4 h-4" /> },
    { id: 'workflows', label: 'Workflows', icon: <GitBranch className="w-4 h-4" /> },
  ];

  useEffect(() => {
    loadItems(activeTab);
  }, [activeTab]);

  const loadItems = async (type: ItemType) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/config/${type}`);
      if (!response.ok) {
        console.warn(`Could not load ${type}: ${response.statusText}`);
        setItems([]);
        return;
      }
      const data = await response.json();
      setItems(data || []);
    } catch (err) {
      console.error(`Error loading ${type}:`, err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(`Supprimer cet élément?`)) return;

    try {
      const response = await fetch(`/api/config/${activeTab}/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete');
      setItems(items.filter((item) => item.id !== id));
    } catch (err) {
      console.error('Error deleting:', err);
    }
  };

  const handleEdit = (item: ConfigItem) => {
    setFormData(item);
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = `/api/config/${activeTab}${editingId ? `/${editingId}` : ''}`;
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to save');
      
      const savedItem = await response.json();
      if (editingId) {
        setItems(items.map((item) => (item.id === editingId ? savedItem : item)));
      } else {
        setItems([...items, savedItem]);
      }
      
      setShowForm(false);
      setFormData({});
      setEditingId(null);
    } catch (err) {
      console.error('Error saving:', err);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  const getDisplayName = (item: ConfigItem): string => {
    return item.title || item.name || item.filename || item.id;
  };

  const getPhaseColor = (phase?: string) => {
    if (!phase) return 'bg-gray-600';
    switch (phase) {
      case 'dev':
        return 'bg-blue-600';
      case 'test':
        return 'bg-purple-600';
      case 'deploy':
        return 'bg-green-600';
      default:
        return 'bg-gray-600';
    }
  };

  const getStatusColor = (status?: string) => {
    if (!status) return 'bg-gray-500';
    switch (status) {
      case 'draft':
        return 'bg-yellow-500';
      case 'approved':
        return 'bg-green-500';
      case 'in-progress':
        return 'bg-blue-500';
      case 'completed':
        return 'bg-teal-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getFormFields = () => {
    switch (activeTab) {
      case 'specs':
        return [
          { key: 'title', label: 'Titre', type: 'text', required: true },
          { key: 'phase', label: 'Phase', type: 'select', options: ['dev', 'test', 'deploy'], required: true },
          { key: 'status', label: 'Statut', type: 'select', options: ['draft', 'approved', 'in-progress', 'completed'], defaultValue: 'draft' },
          { key: 'owner', label: 'Propriétaire', type: 'text', required: true },
          { key: 'priority', label: 'Priorité', type: 'select', options: ['high', 'medium', 'low'] },
        ];
      case 'prompts':
        return [
          { key: 'role', label: 'Rôle', type: 'text', required: true },
          { key: 'phase', label: 'Phase', type: 'select', options: ['dev', 'test', 'deploy'], required: true },
          { key: 'action', label: 'Action', type: 'text', required: true },
          { key: 'version', label: 'Version', type: 'text', defaultValue: '1.0' },
        ];
      case 'maestros':
        return [
          { key: 'name', label: 'Nom', type: 'text', required: true },
          { key: 'phase', label: 'Phase', type: 'select', options: ['dev', 'test', 'deploy'], required: true },
          { key: 'category', label: 'Catégorie', type: 'select', options: ['core', 'dev', 'qa'], required: true },
          { key: 'expertise', label: 'Expertise (séparées par virgules)', type: 'textarea' },
        ];
      case 'workflows':
        return [
          { key: 'filename', label: 'Nom de fichier', type: 'text', required: true },
          { key: 'title', label: 'Titre', type: 'text', required: true },
          { key: 'version', label: 'Version', type: 'text', defaultValue: '1.0' },
        ];
      default:
        return [];
    }
  };

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="p-2 hover:bg-gray-800 rounded-lg transition"
              title="Retour"
            >
              <ArrowLeft className="w-5 h-5 text-gray-400" />
            </Link>
            <h1 className="text-2xl font-bold text-white">Configuration</h1>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-6 flex border-t border-gray-800/50">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 font-medium transition-all duration-200 border-b-2 flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-400 bg-blue-500/5'
                  : 'border-transparent text-gray-500 hover:text-gray-300 hover:bg-gray-800/30'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {loading && !showForm ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-400">Chargement...</div>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16">
            <div className="flex justify-center mb-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20">
                {activeTab === 'specs' && <FileText className="w-8 h-8 text-blue-400" />}
                {activeTab === 'prompts' && <MessageSquare className="w-8 h-8 text-blue-400" />}
                {activeTab === 'maestros' && <Users className="w-8 h-8 text-blue-400" />}
                {activeTab === 'workflows' && <GitBranch className="w-8 h-8 text-blue-400" />}
              </div>
            </div>
            <p className="text-gray-500 mb-8">Aucun élément trouvé</p>
            <button
              onClick={() => {
                setFormData({});
                setEditingId(null);
                setShowForm(true);
              }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white rounded-lg transition-all duration-200 shadow-lg hover:shadow-blue-500/25 font-medium"
            >
              <Plus className="w-5 h-5" />
              Créer un nouvel élément
            </button>
          </div>
        ) : (
          <>
            {/* Table View */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">
                    {activeTab === 'specs' && 'Spécifications'}
                    {activeTab === 'prompts' && 'Prompts'}
                    {activeTab === 'maestros' && 'Maestros'}
                    {activeTab === 'workflows' && 'Workflows'}
                  </h2>
                  <p className="text-sm text-gray-500">{items.length} élément{items.length !== 1 ? 's' : ''}</p>
                </div>
                <button
                  onClick={() => {
                    setFormData({});
                    setEditingId(null);
                    setShowForm(true);
                  }}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white rounded-lg transition-all duration-200 shadow-lg hover:shadow-blue-500/25 font-medium"
                >
                  <Plus className="w-5 h-5" />
                  Ajouter
                </button>
              </div>

              {/* Table */}
              <div className="overflow-x-auto rounded-xl border border-gray-800/50 bg-gray-900/30 backdrop-blur-sm">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-900/50 to-gray-800/30 border-b border-gray-800/50">
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        ID / Nom
                      </th>
                      {activeTab === 'specs' && (
                        <>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Phase</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Statut</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Propriétaire</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Priorité</th>
                        </>
                      )}
                      {activeTab === 'prompts' && (
                        <>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Rôle</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Phase</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Action</th>
                        </>
                      )}
                      {activeTab === 'maestros' && (
                        <>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Phase</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Catégorie</th>
                        </>
                      )}
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Modifié</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/30">
                    {items.map((item, idx) => (
                      <tr
                        key={item.id}
                        className="hover:bg-gray-800/30 transition-colors duration-150"
                      >
                        <td className="px-6 py-4 text-sm font-medium">
                          <div className="font-mono text-blue-400 font-semibold">{item.id}</div>
                          <div className="text-gray-400 text-xs mt-1">{getDisplayName(item)}</div>
                        </td>
                        {activeTab === 'specs' && (
                          <>
                            <td className="px-6 py-4 text-sm">
                              <span
                                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold text-white ${getPhaseColor(
                                  (item as SpecItem).phase
                                )}`}
                              >
                                {(item as SpecItem).phase}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm">
                              <span
                                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold text-white ${getStatusColor(
                                  (item as SpecItem).status
                                )}`}
                              >
                                {(item as SpecItem).status || 'N/A'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-300">
                              {(item as SpecItem).owner || '-'}
                            </td>
                            <td className="px-6 py-4 text-sm">
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-800/50 text-gray-300">
                                {(item as SpecItem).priority || '-'}
                              </span>
                            </td>
                          </>
                        )}
                        {activeTab === 'prompts' && (
                          <>
                            <td className="px-6 py-4 text-sm text-gray-300">
                              {(item as any).role || '-'}
                            </td>
                            <td className="px-6 py-4 text-sm">
                              <span
                                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold text-white ${getPhaseColor(
                                  (item as any).phase
                                )}`}
                              >
                                {(item as any).phase}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-300">
                              {(item as any).action || '-'}
                            </td>
                          </>
                        )}
                        {activeTab === 'maestros' && (
                          <>
                            <td className="px-6 py-4 text-sm">
                              <span
                                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold text-white ${getPhaseColor(
                                  (item as any).phase
                                )}`}
                              >
                                {(item as any).phase}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm">
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-800/50 text-gray-300">
                                {(item as any).category || '-'}
                              </span>
                            </td>
                          </>
                        )}
                        <td className="px-6 py-4 text-sm text-gray-500 text-xs">
                          {item.modified
                            ? new Date(item.modified).toLocaleDateString('fr-FR')
                            : '-'}
                        </td>
                        <td className="px-6 py-4 text-sm flex gap-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="inline-flex items-center justify-center p-2.5 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all duration-150"
                            title="Modifier"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="inline-flex items-center justify-center p-2.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-150"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-gradient-to-b from-gray-900 to-gray-950 rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-gray-800/50">
            <div className="sticky top-0 bg-gradient-to-r from-gray-900/95 to-gray-800/95 border-b border-gray-800/50 p-6 flex justify-between items-center">
              <h3 className="font-bold text-lg text-white">
                {editingId ? 'Modifier' : 'Nouveau'} {activeTab === 'specs' ? 'Spécification' : activeTab === 'prompts' ? 'Prompt' : activeTab === 'maestros' ? 'Maestro' : 'Workflow'}
              </h3>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-gray-200 hover:bg-gray-800/50 p-1.5 rounded-lg transition-all duration-150"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {getFormFields().map((field) => (
                <div key={field.key}>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    {field.label}
                    {(field as any).required && <span className="text-red-400 ml-1">*</span>}
                  </label>
                  {field.type === 'select' ? (
                    <select
                      value={formData[field.key] || (field as any).defaultValue || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, [field.key]: e.target.value })
                      }
                      className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700/50 rounded-lg text-gray-200 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/30 text-sm transition-all duration-150 hover:border-gray-600/50"
                    >
                      <option value="">Sélectionner...</option>
                      {(field as any).options?.map((opt: string) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) : field.type === 'textarea' ? (
                    <textarea
                      value={formData[field.key] || (field as any).defaultValue || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          [field.key]: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700/50 rounded-lg text-gray-200 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/30 text-sm resize-none transition-all duration-150 hover:border-gray-600/50"
                      rows={4}
                      placeholder={field.label}
                    />
                  ) : (
                    <input
                      type={field.type}
                      value={formData[field.key] || (field as any).defaultValue || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, [field.key]: e.target.value })
                      }
                      className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700/50 rounded-lg text-gray-200 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/30 text-sm transition-all duration-150 hover:border-gray-600/50"
                      placeholder={field.label}
                    />
                  )}
                </div>
              ))}

              <div className="pt-4 flex gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded transition"
                >
                  {loading ? 'Sauvegarde...' : 'Enregistrer'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 text-sm font-medium rounded transition"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
