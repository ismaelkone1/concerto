'use client';

import { 
  Map, 
  Zap, 
  FlaskConical, 
  Rocket, 
  Settings, 
  Home,
  ChevronRight,
  ShieldCheck,
  Cpu
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { apiService } from '@/lib/api';

interface TopBarProps {
  activePhase: string;
  onPhaseChange: (phase: string) => void;
  connected?: boolean;
}

const phases = [
  { id: 'conception', label: 'Conception', icon: Map, color: 'text-blue-400' },
  { id: 'dev', label: 'Développement', icon: Zap, color: 'text-yellow-400' },
  { id: 'test', label: 'Validation', icon: FlaskConical, color: 'text-purple-400' },
  { id: 'deploy', label: 'Déploiement', icon: Rocket, color: 'text-emerald-400' },
];

export default function TopBar({ activePhase, onPhaseChange, connected = true }: TopBarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [projectName, setProjectName] = useState('Loading...');

  useEffect(() => {
    const activeId = localStorage.getItem('activeProjectId');
    if (activeId) {
      apiService.getProjects().then(projects => {
        const project = projects.find((p: any) => p.id === activeId);
        if (project) setProjectName(project.name);
      });
    }
  }, []);
  
  // Skip TopBar if on launcher
  if (pathname === '/') return null;

  return (
    <header className="h-16 bg-[#0d0d0f] border-b border-white/5 flex items-center px-6 justify-between sticky top-0 z-50 backdrop-blur-xl bg-[#0d0d0f]/80">
      {/* Project Info & Breadcrumb */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => router.push('/')}
          className="p-2 hover:bg-white/5 rounded-lg transition-colors group"
          title="Back to Launchpad"
        >
          <Home size={18} className="text-gray-500 group-hover:text-white" />
        </button>
        
        <div className="h-4 w-[1px] bg-white/10" />
        
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl gradient-icon flex items-center justify-center">
            <Rocket size={18} className="text-white" />
          </div>
          <div>
            <div className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 leading-none mb-1">Active Pipeline</div>
            <div className="text-sm font-black text-white leading-none uppercase tracking-tight">{projectName}</div>
          </div>
        </div>
      </div>

      {/* Phase Segmented Control */}
      <nav className="flex items-center bg-black/40 p-1.5 rounded-xl border border-white/5">
        {phases.map(({ id, label, icon: Icon, color }) => {
          const isActive = activePhase === id;
          return (
            <button
              key={id}
              onClick={() => onPhaseChange(id)}
              className={`
                relative px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2.5 overflow-hidden group
                ${isActive ? 'text-white' : 'text-gray-500 hover:text-gray-300'}
              `}
            >
              {isActive && (
                <div className="absolute inset-0 bg-white/5 animate-pulse" />
              )}
              {isActive && (
                <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent`} />
              )}
              <Icon size={14} className={isActive ? color : 'text-current'} />
              {label}
            </button>
          );
        })}
      </nav>

      {/* System Status & Config */}
      <div className="flex items-center gap-6">
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse' : 'bg-red-500'}`} />
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              {connected ? 'Orchestrator Online' : 'Offline'}
            </span>
          </div>
          <span className="text-[9px] text-gray-600 mt-1">v1.2.4-stable</span>
        </div>

        <div className="h-8 w-[1px] bg-white/10" />

        <div className="flex items-center gap-2">
          <Link
            href="/configuration"
            className="p-2.5 rounded-xl text-gray-500 hover:text-white hover:bg-white/5 transition-all border border-transparent hover:border-white/10"
            title="Configuration Management"
          >
            <Settings size={20} />
          </Link>
          <button className="p-2.5 rounded-xl text-gray-500 hover:text-emerald-400 hover:bg-emerald-500/5 transition-all border border-transparent hover:border-emerald-500/10">
            <ShieldCheck size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}