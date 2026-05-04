'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { MessageSquare, Edit3, Share2, Box, Database, Layout } from 'lucide-react';
import ConceptionChat from '@/components/ConceptionChat';
import ProjectPromptWorkbench from '@/components/ProjectPromptWorkbench';
import MermaidDiagram from '@/components/MermaidDiagram';

export default function ConceptionPage() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get('projectId');
  const [activeTab, setActiveTab] = useState<'chat' | 'workbench' | 'architecture'>('chat');
  const [focusMode, setFocusMode] = useState<'global' | 'back' | 'front' | 'db'>('global');
  const [lastDiagram, setLastDiagram] = useState<string>('');

  // Color mapping based on focus
  const focusColors = {
    global: 'blue',
    back: 'purple',
    front: 'emerald',
    db: 'amber'
  };

  const activeColor = focusColors[focusMode];

  if (!projectId) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500 font-bold uppercase tracking-widest text-sm">
        No project selected
      </div>
    );
  }

  return (
    <div className={`h-full flex flex-col p-6 animate-in fade-in duration-500 overflow-hidden border-t-2 border-${activeColor}-500/20 shadow-[0_-20px_50px_-20px_rgba(var(--${activeColor}-rgb),0.1)] transition-all duration-1000`}>
      {/* Tab Switcher */}
      <div className="flex items-center gap-2 mb-6 bg-white/5 p-1 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
            activeTab === 'chat'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
              : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
          }`}
        >
          <MessageSquare size={14} />
          Architect Chat
        </button>
        <button
          onClick={() => setActiveTab('workbench')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
            activeTab === 'workbench'
              ? `bg-${activeColor}-600 text-white shadow-lg shadow-${activeColor}-600/20`
              : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
          }`}
        >
          <Edit3 size={14} />
          Spec Workbench
        </button>
        <button
          onClick={() => setActiveTab('architecture')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
            activeTab === 'architecture'
              ? `bg-${activeColor}-600 text-white shadow-lg shadow-${activeColor}-600/20`
              : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
          }`}
        >
          <Share2 size={14} />
          Architecture
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 min-h-0 relative">
        {activeTab === 'chat' && (
          <div className="h-full animate-in fade-in slide-in-from-left-4 duration-500">
            <ConceptionChat 
              projectId={projectId} 
              onFocusChange={setFocusMode}
              onDiagramUpdate={setLastDiagram}
            />
          </div>
        )}
        {activeTab === 'workbench' && (
          <div className="h-full animate-in fade-in slide-in-from-right-4 duration-500">
            <ProjectPromptWorkbench projectId={projectId} phase="conception" />
          </div>
        )}
        {activeTab === 'architecture' && (
          <div className="h-full animate-in fade-in slide-in-from-bottom-4 duration-500 bg-[#151518] rounded-3xl border border-white/5 overflow-hidden flex flex-col">
            {lastDiagram ? (
              <div className="flex-1 min-h-0 relative">
                <div className={`absolute top-6 left-6 z-10 px-4 py-1.5 rounded-full bg-${activeColor}-500/10 border border-${activeColor}-500/20 text-${activeColor}-400 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 backdrop-blur-md`}>
                   <div className={`w-1.5 h-1.5 rounded-full bg-${activeColor}-500 animate-pulse`} />
                   Live Diagram
                </div>
                <MermaidDiagram chart={lastDiagram} />
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-center space-y-4">
                  <div className={`w-20 h-20 bg-${activeColor}-500/10 border border-${activeColor}-500/20 rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-${activeColor}-500/10`}>
                    <Box className={`text-${activeColor}-400 w-10 h-10`} />
                  </div>
                  <h2 className="text-2xl font-bold text-white uppercase tracking-tighter">Architecture Visualizer</h2>
                  <p className="text-gray-500 max-w-md mx-auto">Real-time UML and flow diagrams will be rendered here based on your conversation.</p>
                  <div className="pt-8 opacity-50">
                    <div className="flex justify-center gap-8">
                        <div className="flex flex-col items-center gap-2">
                          <Layout size={24} className="text-emerald-400" />
                          <span className="text-[10px] font-bold uppercase text-gray-500">Frontend</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                          <Share2 size={24} className="text-purple-400" />
                          <span className="text-[10px] font-bold uppercase text-gray-500">Backend</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                          <Database size={24} className="text-amber-400" />
                          <span className="text-[10px] font-bold uppercase text-gray-500">Database</span>
                        </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Legend / Toolbar */}
            <div className="p-4 border-t border-white/5 bg-white/[0.02] flex items-center justify-between">
               <span className="text-[9px] text-gray-600 uppercase font-bold tracking-widest px-4 italic">
                 Generated by Architect Maestro via Mermaid.js
               </span>
               <button 
                onClick={() => setLastDiagram('')}
                className="text-[9px] font-bold text-gray-500 hover:text-white transition-colors uppercase tracking-widest px-4"
               >
                 Reset View
               </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}