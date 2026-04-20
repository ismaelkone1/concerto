'use client';

import { 
  Zap, 
  Play, 
  RotateCcw, 
  Terminal, 
  CheckCircle2, 
  Clock, 
  Cpu, 
  Layers,
  Activity,
  Code
} from 'lucide-react';
import { useState } from 'react';

export default function DevPage() {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);

  const toggleExecution = () => {
    setIsRunning(!isRunning);
    if (!isRunning) {
      // Simulation progression
      const interval = setInterval(() => {
        setProgress(p => {
          if (p >= 100) {
            clearInterval(interval);
            setIsRunning(false);
            return 100;
          }
          return p + 5;
        });
      }, 1000);
    }
  };

  return (
    <div className="h-full p-6 space-y-6 flex flex-col animate-in slide-in-from-bottom-2 duration-500">
      {/* Header Summary */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20">
            <Zap className="w-6 h-6 text-yellow-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white uppercase tracking-tight">Phase de Développement</h1>
            <p className="text-gray-500 text-sm">Implémentation autonome des spécifications validées</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={toggleExecution}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold uppercase tracking-widest transition-all ${
              isRunning 
                ? 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20' 
                : 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-500'
            }`}
          >
            {isRunning ? <RotateCcw size={16} /> : <Play size={16} />}
            {isRunning ? 'Stop Orchestrator' : 'Start Development'}
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
        {/* Left: Active Tasks & Progress */}
        <div className="col-span-4 space-y-6 flex flex-col min-h-0">
          <div className="bg-[#0d0d0f]/50 border border-white/5 rounded-2xl p-6 space-y-6">
            <div>
              <div className="flex justify-between items-end mb-2">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Global Build Progress</span>
                <span className="text-xl font-black text-white">{progress}%</span>
              </div>
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                <div 
                  className="h-full bg-gradient-to-r from-yellow-500 to-amber-400 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(234,179,8,0.3)]"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                  <div className="text-[10px] text-gray-500 font-bold uppercase mb-1">Files Created</div>
                  <div className="text-2xl font-bold text-white">42</div>
               </div>
               <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                  <div className="text-[10px] text-gray-500 font-bold uppercase mb-1">Unit Tests</div>
                  <div className="text-2xl font-bold text-emerald-400">18</div>
               </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto bg-[#0d0d0f]/50 border border-white/5 rounded-2xl p-6 min-h-0">
            <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">Implementation Queue</h3>
            <div className="space-y-3">
              {[
                { id: 'SPEC-001', title: 'Auth Service', status: 'done' },
                { id: 'SPEC-002', title: 'Data Pipeline', status: 'inprogress' },
                { id: 'SPEC-003', title: 'API Gateway', status: 'pending' },
                { id: 'SPEC-004', title: 'Dashboard UI', status: 'pending' },
              ].map((task, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                  {task.status === 'done' ? <CheckCircle2 size={16} className="text-emerald-500" /> : 
                   task.status === 'inprogress' ? <Activity size={16} className="text-yellow-400 animate-pulse" /> :
                   <Clock size={16} className="text-gray-600" />}
                  <div className="flex-1">
                    <div className="text-[10px] font-mono text-blue-400 font-bold">{task.id}</div>
                    <div className="text-sm font-medium text-gray-300">{task.title}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Live Console & Maestro Activity */}
        <div className="col-span-8 flex flex-col gap-6 min-h-0">
          <div className="flex-1 bg-black border border-white/5 rounded-2xl flex flex-col overflow-hidden shadow-2xl relative">
            <div className="p-3 bg-white/[0.02] border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal size={14} className="text-gray-500" />
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Orchestrator Logs</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-red-500/50" />
                <div className="w-2 h-2 rounded-full bg-yellow-500/50" />
                <div className="w-2 h-2 rounded-full bg-emerald-500/50" />
              </div>
            </div>
            <div className="flex-1 p-4 font-mono text-xs text-gray-400 overflow-y-auto space-y-2">
              <p className="text-blue-400">[{new Date().toLocaleTimeString()}] conductor: Initializing development maestro...</p>
              <p className="text-dim">[{new Date().toLocaleTimeString()}] git: Checked out branch dev-SPEC-002</p>
              <p className="text-emerald-400">[{new Date().toLocaleTimeString()}] be-dev: Analyzing SPEC-002 constraints</p>
              <p className="text-emerald-400">[{new Date().toLocaleTimeString()}] be-dev: Writing file engine/src/pipeline.ts</p>
              <p className="text-dim">[{new Date().toLocaleTimeString()}] be-dev: Running tsc --noEmit</p>
              {isRunning && (
                <p className="text-emerald-400 animate-pulse">[{new Date().toLocaleTimeString()}] be-dev: Generating logic for data transformation...</p>
              )}
            </div>
          </div>

          <div className="h-48 bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border border-white/5 rounded-2xl p-6 flex items-center justify-between relative overflow-hidden group">
            <div className="relative z-10 flex items-center gap-6">
               <div className="w-20 h-20 rounded-3xl bg-blue-500/10 border-2 border-blue-500/20 flex items-center justify-center relative shadow-2xl shadow-blue-500/20">
                  <Code size={40} className="text-blue-400" />
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-[#0d0d0f] animate-pulse" />
               </div>
               <div>
                  <h4 className="text-xl font-bold text-white mb-1">Backend Maestro</h4>
                  <p className="text-gray-400 text-sm">Expert TypeScript & Node.js Architecture</p>
                  <div className="mt-3 flex gap-2">
                     <span className="px-2 py-1 bg-white/5 rounded text-[8px] font-bold uppercase text-gray-500">Writing file</span>
                     <span className="px-2 py-1 bg-blue-500/10 rounded text-[8px] font-bold uppercase text-blue-400 truncate max-w-[200px]">src/services/auth.ts</span>
                  </div>
               </div>
            </div>
            <div className="relative z-10 text-right">
               <div className="text-[10px] text-gray-500 font-bold uppercase mb-2">Neural Load</div>
               <div className="flex flex-col items-end gap-1">
                  <div className="flex gap-0.5">
                     {[...Array(12)].map((_, i) => (
                       <div key={i} className={`h-4 w-1 rounded-full ${i < 8 ? 'bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.5)]' : 'bg-white/5'}`} />
                     ))}
                  </div>
                  <span className="text-sm font-bold text-blue-400">72% Optimized</span>
               </div>
            </div>
            {/* Background elements */}
            <Layers className="absolute -bottom-10 -right-10 w-48 h-48 text-white/[0.02] group-hover:text-blue-500/[0.03] transition-colors" />
            <Cpu className="absolute -top-10 -left-10 w-48 h-48 text-white/[0.02] group-hover:text-blue-500/[0.03] transition-colors" />
          </div>
        </div>
      </div>
    </div>
  );
}
