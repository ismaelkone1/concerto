'use client';

import { useState, useEffect, useMemo } from 'react';
import { Plus, Trash2, Edit2, FileText, MessageSquare, Users, GitBranch, X, Search, Filter, ChevronRight, Save } from 'lucide-react';



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
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = useMemo(() => {
    if (!searchQuery) return items;
    const q = searchQuery.toLowerCase();
    return items.filter(item => 
      item.id.toLowerCase().includes(q) || 
      (item.title || '').toLowerCase().includes(q) ||
      (item.name || '').toLowerCase().includes(q) ||
      (item.filename || '').toLowerCase().includes(q)
    );
  }, [items, searchQuery]);

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
    <>
      <main className="flex-1 flex flex-col bg-[#0a0a0c] relative overflow-hidden">
        {/* Header matching Launchpad styling */}
        <header className="h-16 border-b border-white/5 px-8 flex items-center justify-between bg-[#0a0a0c]/80 backdrop-blur-md sticky top-0 z-10">
           <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                <Settings className="w-4 h-4 text-blue-400" />
             </div>
             <h2 className="text-xl font-semibold tracking-tight">Global Settings</h2>
           </div>

           <div className="flex items-center gap-4">
              <div className="relative group">
                <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-blue-400 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Rechercher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-blue-500/50 w-64 transition-all"
                />
              </div>
              <button 
                onClick={() => {
                  setFormData({});
                  setEditingId(null);
                  setShowForm(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-full text-xs font-bold transition-all shadow-lg shadow-blue-600/20"
              >
                <Plus className="w-4 h-4" />
                <span>Nouveau</span>
              </button>
           </div>
        </header>

        {/* Tabs moved into the main content or as a second header */}
        <div className="bg-[#0a0a0c]/50 border-b border-white/5 px-8 flex items-center justify-between">
          <div className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-4 font-bold text-[10px] uppercase tracking-widest transition-all border-b-2 flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-400 bg-blue-500/5'
                    : 'border-transparent text-gray-500 hover:text-gray-300 hover:bg-white/5'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
          <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
            {filteredItems.length} élément{filteredItems.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {loading && !showForm ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-gray-400">Chargement...</div>
                    ) : filteredItems.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500">Aucun résultat pour "{searchQuery}"</p>
            </div>
          ) : (
            <>
              {/* Table View */}
              <div className="mb-8">
                {/* Table */}
                <div className="overflow-x-auto rounded-xl border border-white/5 bg-white/[0.02] backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-white/5 border-b border-white/5">
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                          ID / Nom
                        </th>
                        {activeTab === 'specs' && (
                          <>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Phase</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Statut</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Propriétaire</th>
                          </>
                        )}
                        {activeTab === 'prompts' && (
                          <>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Rôle</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Phase</th>
                          </>
                        )}
                        {activeTab === 'maestros' && (
                          <>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Phase</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Catégorie</th>
                          </>
                        )}
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Modifié</th>
                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredItems.map((item, idx) => (
                        <tr
                          key={item.id}
                          className="hover:bg-white/5 transition-colors duration-150 group cursor-pointer"
                          onClick={() => handleEdit(item)}
                        >
                          <td className="px-6 py-5 text-sm font-medium">
                            <div className="flex items-center gap-3">
                               <div className="p-2 rounded-lg bg-white/5 group-hover:bg-blue-500/10 transition-colors">
                                  {activeTab === 'specs' && <FileText className="w-4 h-4 text-blue-400" />}
                                  {activeTab === 'prompts' && <MessageSquare className="w-4 h-4 text-blue-400" />}
                                  {activeTab === 'maestros' && <Users className="w-4 h-4 text-blue-400" />}
                                  {activeTab === 'workflows' && <GitBranch className="w-4 h-4 text-blue-400" />}
                               </div>
                               <div>
                                 <div className="font-mono text-white group-hover:text-blue-400 transition-colors">{item.id}</div>
                                 <div className="text-gray-500 text-xs mt-0.5">{getDisplayName(item)}</div>
                               </div>
                            </div>
                          </td>
                          {activeTab === 'specs' && (
                            <>
                              <td className="px-6 py-5 text-sm">
                                <span
                                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest text-white/90 ${getPhaseColor(
                                    (item as SpecItem).phase
                                  )}`}
                                >
                                  {(item as SpecItem).phase}
                                </span>
                              </td>
                              <td className="px-6 py-5 text-sm">
                                <span
                                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest text-white/90 ${getStatusColor(
                                    (item as SpecItem).status
                                  )}`}
                                >
                                  {(item as SpecItem).status || 'N/A'}
                                </span>
                              </td>
                              <td className="px-6 py-5 text-sm text-gray-400">
                                {(item as SpecItem).owner || '-'}
                              </td>
                            </>
                          )}
                          {activeTab === 'prompts' && (
                            <>
                              <td className="px-6 py-5 text-sm text-gray-400">
                                {(item as any).role || '-'}
                              </td>
                              <td className="px-6 py-5 text-sm">
                                <span
                                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest text-white/90 ${getPhaseColor(
                                    (item as any).phase
                                  )}`}
                                >
                                  {(item as any).phase}
                                </span>
                              </td>
                            </>
                          )}
                          {activeTab === 'maestros' && (
                            <>
                              <td className="px-6 py-5 text-sm">
                                <span
                                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest text-white/90 ${getPhaseColor(
                                    (item as any).phase
                                  )}`}
                                >
                                  {(item as any).phase}
                                </span>
                              </td>
                              <td className="px-6 py-5 text-sm">
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest bg-white/5 text-gray-500">
                                  {(item as any).category || '-'}
                                </span>
                              </td>
                            </>
                          )}
                          <td className="px-6 py-5 text-sm text-gray-600 text-[10px] font-bold uppercase tracking-tighter">
                            {item.modified
                              ? new Date(item.modified).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
                              : '-'}
                          </td>
                          <td className="px-6 py-5 text-sm text-right">
                             <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleEdit(item); }}
                                  className="p-1.5 text-gray-500 hover:text-white hover:bg-white/10 rounded-md transition-all"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                                  className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-all"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                             </div>
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
      </main>

      {/* Sliding Form Panel */}
      {showForm && (
        <>
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-in fade-in duration-300"
            onClick={() => setShowForm(false)}
          />
          <div className="fixed top-0 right-0 h-full w-full max-w-lg bg-[#0d0d0f] border-l border-white/10 z-50 shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
              <div>
                <h3 className="font-bold text-lg text-white">
                  {editingId ? 'Détails' : 'Nouveau'} {activeTab === 'specs' ? 'Spécification' : activeTab === 'prompts' ? 'Prompt' : activeTab === 'maestros' ? 'Maestro' : 'Workflow'}
                </h3>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mt-0.5">
                  {editingId ? `ID: ${editingId}` : 'Création d\'un nouvel élément'}
                </p>
              </div>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-500 hover:text-white hover:bg-white/5 p-2 rounded-xl transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8">
              {getFormFields().map((field) => (
                <div key={field.key} className="space-y-3">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                    {field.label}
                    {(field as any).required && <span className="text-red-500">*</span>}
                  </label>
                  {field.type === 'select' ? (
                    <select
                      value={formData[field.key] || (field as any).defaultValue || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, [field.key]: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-white focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 focus:outline-none transition-all text-sm appearance-none"
                    >
                      <option value="" className="bg-[#0d0d0f]">Sélectionner...</option>
                      {(field as any).options?.map((opt: string) => (
                        <option key={opt} value={opt} className="bg-[#0d0d0f]">
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
                      className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-white focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 focus:outline-none transition-all text-sm resize-none"
                      rows={6}
                      placeholder={`Saisir ${field.label.toLowerCase()}...`}
                    />
                  ) : (
                    <input
                      type={field.type}
                      value={formData[field.key] || (field as any).defaultValue || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, [field.key]: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-white focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 focus:outline-none transition-all text-sm"
                      placeholder={`Saisir ${field.label.toLowerCase()}...`}
                    />
                  )}
                </div>
              ))}
            </form>

            <div className="p-6 border-t border-white/5 bg-white/[0.01] flex gap-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border border-white/5"
              >
                Annuler
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-[2] px-4 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
              >
                {loading ? (
                  'Sauvegarde...'
                ) : (
                  <>
                    <Save className="w-3 h-3" />
                    <span>Enregistrer les modifications</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </>
      )}
v>
        </div>
      )}
    </>
  );
}
