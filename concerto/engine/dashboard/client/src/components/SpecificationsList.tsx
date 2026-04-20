'use client';

import { useState, useEffect } from 'react';
import { 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Plus,
  ArrowUpRight
} from 'lucide-react';
import { apiService } from '@/lib/api';

interface Spec {
  id: string;
  title: string;
  status: string;
  phase: string;
  priority: string;
}

export default function SpecificationsList() {
  const [specs, setSpecs] = useState<Spec[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSpecs = async () => {
      try {
        // En attendant une API robuste pour lister tous les types de config, 
        // on essaie de charger les specs existantes
        const data = await apiService.getRoadmap('concerto-core');
        // Transformation simple pour l'exemple
        const transformed: Spec[] = data.flatMap((s: { tasks: any[] }) => 
          s.tasks.map((t: { id: string, title: string, status?: string }) => ({
            id: t.id,
            title: t.title,
            status: t.status || 'draft',
            phase: 'dev',
            priority: 'medium'
          }))
        );
        setSpecs(transformed);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadSpecs();
  }, []);

  const getStatusIcon = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('done') || s.includes('finished')) return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />;
    if (s.includes('progress') || s.includes('active')) return <Clock className="w-3.5 h-3.5 text-blue-400" />;
    return <AlertCircle className="w-3.5 h-3.5 text-gray-400" />;
  };

  return (
    <div className="flex flex-col h-full card-premium overflow-hidden shadow-2xl backdrop-blur-sm">
      <div className="p-4 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
            <FileText className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide uppercase">System Specifications</h3>
            <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Project Roadmap & Technical Docs</p>
          </div>
        </div>
        <button className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all">
          <Plus size={12} />
          New Spec
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-white/10">
        <div className="flex items-center justify-between px-2 mb-4">
           <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Active Roadmap</span>
           <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest cursor-pointer hover:underline">Timeline View</span>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-600 animate-pulse">
            Loading specifications...
          </div>
        ) : specs.length === 0 ? (
          <div className="text-center py-20 text-gray-600 italic">
            No specifications found. Talk to the architect to start.
          </div>
        ) : (
          specs.map((spec) => (
            <div 
              key={spec.id}
              className="group bg-white/[0.03] border border-white/5 rounded-xl p-3 hover:bg-white/[0.06] hover:border-white/10 transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-1.5 rounded-lg bg-gray-800 border border-white/10 group-hover:bg-blue-500/10 group-hover:border-blue-500/20 transition-all">
                    {getStatusIcon(spec.status)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[10px] font-mono font-bold text-blue-400 uppercase">{spec.id}</span>
                      <span className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase bg-white/5 text-gray-500 border border-white/5">{spec.priority}</span>
                      <span className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase bg-white/5 text-gray-500 border border-white/5">{spec.phase}</span>
                    </div>
                    <h4 className="text-sm font-semibold text-gray-300 group-hover:text-white transition-colors truncate">
                      {spec.title}
                    </h4>
                  </div>
                </div>
                <button className="p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowUpRight size={14} className="text-gray-500 hover:text-white" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-4 border-t border-white/5 bg-white/[0.01]">
         <div className="flex items-center justify-between text-[10px] font-bold text-gray-500 uppercase">
            <span>Overall Design Progress</span>
            <span className="text-blue-400">45%</span>
         </div>
         <div className="mt-2 h-1 w-full bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 w-[45%] rounded-full shadow-[0_0_8px_rgba(59,130,246,0.3)]" />
         </div>
      </div>
    </div>
  );
}
