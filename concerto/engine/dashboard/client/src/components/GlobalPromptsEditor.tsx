'use client';

import { useState, useEffect, useCallback } from 'react';
import { FileCode, Save, RefreshCw, ChevronRight, Edit3, CheckCircle } from 'lucide-react';
import { apiService } from '@/lib/api';

interface PromptFile {
  id: string;
  name: string;
}

export default function GlobalPromptsEditor({ phase = 'conception' }: { phase?: string }) {
  const [prompts, setPrompts] = useState<PromptFile[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const handleSelectPrompt = useCallback(async (id: string) => {
    setSelectedPrompt(id);
    setLoading(true);
    try {
      const text = await apiService.getGlobalPrompt(phase, id);
      setContent(text);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [phase]);

  useEffect(() => {
    const loadPrompts = async () => {
      setLoading(true);
      try {
        const data = await apiService.getGlobalPrompts(phase);
        setPrompts(data);
        if (data.length > 0 && !selectedPrompt) {
          handleSelectPrompt(data[0].id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadPrompts();
  }, [phase, handleSelectPrompt, selectedPrompt]);

  const handleSave = async () => {
    if (!selectedPrompt) return;
    setSaving(true);
    try {
      await apiService.updateGlobalPrompt(phase, selectedPrompt, content);
      setLastSaved(new Date());
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full card-premium overflow-hidden shadow-2xl backdrop-blur-sm border-white/5">
      <div className="p-4 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
            <Edit3 className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide uppercase">Calibration Center</h3>
            <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Global Phase Prompts</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
           {lastSaved && (
             <div className="flex items-center gap-1.5 text-[9px] font-bold text-emerald-500 uppercase tracking-widest mr-2 animate-in fade-in duration-300">
               <CheckCircle size={10} />
               Saved {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
             </div>
           )}
           <button 
             onClick={handleSave}
             disabled={saving || !selectedPrompt}
             className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all shadow-lg shadow-emerald-600/20"
           >
             {saving ? <RefreshCw size={12} className="animate-spin" /> : <Save size={12} />}
             Save Changes
           </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar: Prompt List */}
        <div className="w-48 border-r border-white/5 bg-black/20 overflow-y-auto p-2 space-y-1">
          <span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest px-2 mb-2 block">Available Prompts</span>
          {prompts.map(p => (
            <button
              key={p.id}
              onClick={() => handleSelectPrompt(p.id)}
              className={`w-full flex items-center gap-2 p-2 rounded-lg text-left transition-all ${
                selectedPrompt === p.id 
                  ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20' 
                  : 'text-gray-500 hover:bg-white/5 hover:text-gray-300 border border-transparent'
              }`}
            >
              <FileCode size={12} className={selectedPrompt === p.id ? 'text-blue-400' : 'text-gray-600'} />
              <span className="text-[10px] font-bold truncate uppercase tracking-tight">{p.name.replace('.md', '')}</span>
            </button>
          ))}
        </div>

        {/* Main: Editor */}
        <div className="flex-1 flex flex-col bg-black/40 relative">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm z-10">
               <RefreshCw className="w-6 h-6 text-emerald-500 animate-spin" />
            </div>
          ) : null}
          
          <div className="p-2 border-b border-white/5 bg-white/[0.01] flex items-center justify-between">
            <div className="flex items-center gap-2 text-[10px] font-mono text-gray-500">
               <ChevronRight size={10} />
               <span>{selectedPrompt || 'No prompt selected'}</span>
            </div>
          </div>

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="flex-1 bg-transparent p-6 text-[12px] font-mono leading-relaxed text-gray-300 focus:outline-none resize-none scrollbar-thin scrollbar-thumb-white/10"
            placeholder="Select a prompt to start calibrating..."
            spellCheck={false}
          />
        </div>
      </div>

      <div className="p-3 bg-black/60 border-t border-white/5 flex items-center justify-between">
         <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
               <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_5px_rgba(59,130,246,0.5)]" />
               <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Global Sync</span>
            </div>
            <div className="h-3 w-[1px] bg-white/5" />
            <span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">Phase: {phase}</span>
         </div>
         <p className="text-[9px] text-gray-700 font-medium">Changes affect all new orchestrations for this phase.</p>
      </div>
    </div>
  );
}
