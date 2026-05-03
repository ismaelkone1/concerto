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
import { useState, useEffect, useRef } from 'react';
import GitStatusCard from '@/components/GitStatusCard';

interface Task {
  id: string;
  title: string;
  phase: string;
  status: string;
  progress: number;
}

export default function DevPage() {
  const [isRunning, setIsRunning] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const logEndRef = useRef<HTMLDivElement>(null);
  const [stats, setStats] = useState({ files: 0, tests: 0 });

  const fetchTasks = async () => {
    try {
      const res = await fetch('http://localhost:3500/api/tasks');
      const data = await res.json();
      setTasks(data);
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
    }
  };

  const fetchStats = async () => {
     try {
       const [statsRes, testRes] = await Promise.all([
         fetch('http://localhost:3500/api/stats'),
         fetch('http://localhost:3500/api/tests')
       ]);
       const statsData = await statsRes.json();
       const testData = await testRes.json();
       setStats({ 
         files: statsData.ts + statsData.tsx + statsData.js, 
         tests: testData.unit.files + testData.e2e.files 
       });
     } catch (err) {}
  };

  useEffect(() => {
    fetchTasks();
    fetchStats();
    
    // SSE for Logs
    const eventSource = new EventSource('http://localhost:3500/logs');
    eventSource.onmessage = (event) => {
      try {
        const rawLogs = JSON.parse(event.data);
        const logLines = rawLogs.split('\n').filter(Boolean);
        setLogs(logLines);
      } catch (err) {}
    };

    return () => eventSource.close();
  }, []);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const toggleExecution = async () => {
    const action = isRunning ? 'STOP' : 'START';
    try {
      const projectId = localStorage.getItem('activeProjectId') || 'concerto-core';
      const res = await fetch('http://localhost:3500/api/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, projectId })
      });
      if (res.ok) {
        setIsRunning(!isRunning);
      }
    } catch (err) {
      alert('Error triggering orchestrator');
    }
  };

  const globalProgress = tasks.length > 0 
    ? Math.round(tasks.reduce((acc, t) => acc + (t.progress || 0), 0) / tasks.length)
    : 0;

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
        {/* Left: Git Status & Tasks */}
        <div className="col-span-4 space-y-6 flex flex-col min-h-0">
          <GitStatusCard />

          <div className="bg-[#0d0d0f]/50 border border-white/5 rounded-2xl p-6 space-y-4">
            <div>
              <div className="flex justify-between items-end mb-2">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Global Build Progress</span>
                <span className="text-xl font-black text-white">{globalProgress}%</span>
              </div>
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                <div 
                  className="h-full bg-gradient-to-r from-yellow-500 to-amber-400 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(234,179,8,0.3)]"
                  style={{ width: `${globalProgress}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                  <div className="text-[10px] text-gray-500 font-bold uppercase mb-1">Project Files</div>
                  <div className="text-2xl font-bold text-white">{stats.files}</div>
               </div>
               <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                  <div className="text-[10px] text-gray-500 font-bold uppercase mb-1">Total Tests</div>
                  <div className="text-2xl font-bold text-emerald-400">{stats.tests}</div>
               </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto bg-[#0d0d0f]/50 border border-white/5 rounded-2xl p-6 min-h-0 custom-scrollbar">
            <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">Implementation Queue</h3>
            <div className="space-y-3">
              {tasks.length === 0 ? (
                 <div className="text-center py-8 text-gray-600 text-xs italic">No active specifications</div>
              ) : tasks.map((task, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                  {task.status === 'completed' ? <CheckCircle2 size={16} className="text-emerald-500" /> : 
                   task.status === 'in-progress' ? <Activity size={16} className="text-yellow-400 animate-pulse" /> :
                   <Clock size={16} className="text-gray-600" />}
                  <div className="flex-1">
                    <div className="text-[10px] font-mono text-blue-400 font-bold">{task.id}</div>
                    <div className="text-sm font-medium text-gray-300">{task.title}</div>
                  </div>
                  <div className="text-[10px] font-bold text-gray-600">{task.progress}%</div>
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
            <div className="flex-1 p-4 font-mono text-xs text-gray-400 overflow-y-auto space-y-1 custom-scrollbar">
              {logs.length === 0 ? (
                <p className="text-gray-700 italic">Waiting for orchestrator activity...</p>
              ) : logs.map((log, i) => {
                const color = log.includes('❌') ? 'text-red-400' : 
                             log.includes('✅') || log.includes('🎉') ? 'text-emerald-400' :
                             log.includes('──') ? 'text-blue-400 font-bold mt-2' :
                             log.includes('🎻') || log.includes('🎹') ? 'text-purple-400' : 'text-gray-400';
                return <p key={i} className={color}>{log}</p>;
              })}
              <div ref={logEndRef} />
            </div>
          </div>

          <div className="h-48 bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border border-white/5 rounded-2xl p-6 flex items-center justify-between relative overflow-hidden group">
            <div className="relative z-10 flex items-center gap-6">
               <div className="w-20 h-20 rounded-3xl bg-blue-500/10 border-2 border-blue-500/20 flex items-center justify-center relative shadow-2xl shadow-blue-500/20">
                  <Code size={40} className="text-blue-400" />
                  <div className={`absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-[#0d0d0f] ${isRunning ? 'animate-pulse' : ''}`} />
               </div>
               <div>
                  <h4 className="text-xl font-bold text-white mb-1">Development Maestro</h4>
                  <p className="text-gray-400 text-sm">Expert Orchestration & System Design</p>
                  <div className="mt-3 flex gap-2">
                     <span className="px-2 py-1 bg-white/5 rounded text-[8px] font-bold uppercase text-gray-500">Status</span>
                     <span className={`px-2 py-1 rounded text-[8px] font-bold uppercase ${isRunning ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gray-500/10 text-gray-500'}`}>
                        {isRunning ? 'Active' : 'Idle'}
                     </span>
                  </div>
               </div>
            </div>
            <div className="relative z-10 text-right">
               <div className="text-[10px] text-gray-500 font-bold uppercase mb-2">Neural Load</div>
               <div className="flex flex-col items-end gap-1">
                  <div className="flex gap-0.5">
                     {[...Array(12)].map((_, i) => (
                       <div key={i} className={`h-4 w-1 rounded-full ${isRunning && i < 8 ? 'bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.5)]' : 'bg-white/5'}`} />
                     ))}
                  </div>
                  <span className="text-sm font-bold text-blue-400">{isRunning ? '72% Optimized' : '0%'}</span>
               </div>
            </div>
            <Layers className="absolute -bottom-10 -right-10 w-48 h-48 text-white/[0.02] group-hover:text-blue-500/[0.03] transition-colors" />
            <Cpu className="absolute -top-10 -left-10 w-48 h-48 text-white/[0.02] group-hover:text-blue-500/[0.03] transition-colors" />
          </div>
        </div>
      </div>
    </div>
  );
}

