'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  FileCode, 
  Save, 
  RefreshCw, 
  Edit3, 
  CheckCircle,
  Shield,
  Zap,
  Layout,
  Terminal,
  FileText
} from 'lucide-react';
import { apiService } from '@/lib/api';

interface PromptFile {
  id: string;
  name: string;
}

interface WorkbenchProps {
  projectId: string;
  phase?: string;
}

export default function ProjectPromptWorkbench({ projectId, phase = 'conception' }: WorkbenchProps) {
  const [prompts, setPrompts] = useState<PromptFile[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const loadPromptContent = useCallback(async (filename: string) => {
    setLoading(true);
    try {
      const text = await apiService.getProjectPrompt(projectId, phase, filename);
      setContent(text);
      setSelectedPrompt(filename);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [projectId, phase]);

  const loadPromptsList = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiService.getProjectPrompts(projectId, phase);
      setPrompts(data);
      if (data.length > 0 && !selectedPrompt) {
        loadPromptContent(data[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [projectId, phase, selectedPrompt, loadPromptContent]);

  useEffect(() => {
    loadPromptsList();
  }, [projectId, phase, loadPromptsList]);

  const handleSave = async () => {
    if (!selectedPrompt) return;
    setSaving(true);
    try {
      await apiService.updateProjectPrompt(projectId, phase, selectedPrompt, content);
      setLastSaved(new Date());
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const getIconForFile = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('architect') || n.includes('master')) return <Shield className="w-4 h-4 text-purple-400" />;
    if (n.includes('rule')) return <Terminal className="w-4 h-4 text-emerald-400" />;
    if (n.includes('db') || n.includes('database')) return <Layout className="w-4 h-4 text-blue-400" />;
    if (n.includes('api')) return <Zap className="w-4 h-4 text-orange-400" />;
    return <FileText className="w-4 h-4 text-gray-400" />;
  };

  return (
    <div className="flex flex-col h-full card-premium overflow-hidden shadow-2xl backdrop-blur-sm border-white/5 relative">
      {/* Header */}
      <div className="p-4 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
            <Edit3 className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide uppercase">Prompt Workbench</h3>
            <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Project Artifacts & Rules</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
           {lastSaved && (
             <div className="flex items-center gap-1.5 text-[9px] font-bold text-emerald-500 uppercase tracking-widest mr-2">
               <CheckCircle size={10} />
               Synchronized
             </div>
           )}
           <button 
             onClick={handleSave}
             disabled={saving || !selectedPrompt}
             className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all shadow-lg shadow-blue-600/20"
           >
             {saving ? <RefreshCw size={12} className="animate-spin" /> : <Save size={12} />}
             Save Artifact
           </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* File Explorer Sidebar */}
        <div className="w-56 border-r border-white/5 bg-black/20 overflow-y-auto p-3 space-y-1">
          <div className="flex items-center justify-between mb-4 px-1">
            <span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">Project Files</span>
            <span className="text-[9px] font-mono text-gray-700">.concerto/</span>
          </div>
          
          {prompts.map(p => (
            <button
              key={p.id}
              onClick={() => loadPromptContent(p.id)}
              className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all group ${
                selectedPrompt === p.id 
                  ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20' 
                  : 'text-gray-500 hover:bg-white/5 hover:text-gray-300 border border-transparent'
              }`}
            >
              <div className={`p-1.5 rounded-lg transition-colors ${
                selectedPrompt === p.id ? 'bg-blue-500/10' : 'bg-gray-800/50 group-hover:bg-gray-800'
              }`}>
                {getIconForFile(p.name)}
              </div>
              <span className="text-[11px] font-bold truncate tracking-tight">
                {p.name.replace('.md', '').split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
              </span>
            </button>
          ))}

          {prompts.length === 0 && !loading && (
            <div className="py-10 text-center opacity-30">
               <FileCode className="w-8 h-8 mx-auto mb-2 text-gray-600" />
               <p className="text-[10px] font-bold uppercase">No prompts found</p>
            </div>
          )}
        </div>

        {/* Editor Area */}
        <div className="flex-1 flex flex-col bg-black/40 relative">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-md z-20 transition-all">
               <div className="flex flex-col items-center gap-3">
                 <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
                 <span className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.2em]">Loading Artifact...</span>
               </div>
            </div>
          )}
          
          {/* Breadcrumb / Toolbar */}
          <div className="p-3 border-b border-white/5 bg-white/[0.01] flex items-center justify-between">
            <div className="flex items-center gap-2 text-[10px] font-mono text-gray-500">
               <span className="text-gray-700">prompt/</span>
               <span className="text-gray-300 font-bold">{selectedPrompt || 'None'}</span>
            </div>
            <div className="flex items-center gap-4 text-[9px] font-bold text-gray-600 uppercase tracking-widest">
               <span>Markdown</span>
               <div className="w-1 h-1 rounded-full bg-gray-800" />
               <span>UTF-8</span>
            </div>
          </div>

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="flex-1 bg-transparent p-8 text-[13px] font-mono leading-relaxed text-gray-300 focus:outline-none resize-none scrollbar-thin scrollbar-thumb-white/10"
            placeholder="Select a project artifact to edit..."
            spellCheck={false}
          />
        </div>
      </div>

      {/* Footer Info */}
      <div className="px-4 py-2 bg-black/60 border-t border-white/5 flex items-center justify-between">
         <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
               <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
               <span className="text-[9px] font-bold text-blue-500/80 uppercase tracking-widest">Instance Sync Active</span>
            </div>
            <div className="h-3 w-[1px] bg-white/10" />
            <span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">Phase: {phase}</span>
         </div>
         <p className="text-[9px] text-gray-600 font-bold uppercase tracking-tight italic">
            Changes are local to this project and define the orchestrator behavior.
         </p>
      </div>
    </div>
  );
}
