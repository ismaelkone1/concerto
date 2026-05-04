'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import TopBar from './TopBar';
import MaestroRail from './MaestroRail';
import Sidebar from './Sidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  
  const [activePhase, setActivePhase] = useState('conception');
  const [activeMaestro, setActiveMaestro] = useState('be-dev');
  
  const [pipelineStages, setPipelineStages] = useState([
    { name: 'Analyse', status: 'idle' as const },
    { name: 'Génération', status: 'idle' as const },
    { name: 'Validation', status: 'idle' as const },
    { name: 'Déploiement', status: 'idle' as const },
  ]);

  const isExcludedFromTopBar = pathname === '/' || pathname === '/templates' || pathname === '/configuration' || pathname.startsWith('/onboarding') || pathname === '/audit' || pathname.startsWith('/conception');

  useEffect(() => {
    if (pathname.includes('/conception')) setActivePhase('conception');
    else if (pathname.includes('/dev')) setActivePhase('dev');
    else if (pathname.includes('/test')) setActivePhase('test');
    else if (pathname.includes('/deploy')) setActivePhase('deploy');
  }, [pathname]);

  const handlePhaseChange = (phase: string) => {
    setActivePhase(phase);
    if (phase === 'conception') router.push('/conception');
    else if (phase === 'dev') router.push('/dev');
  };

  return (
    <div className="flex h-screen bg-[#0a0a0c] text-white overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {!isExcludedFromTopBar && (
          <TopBar
            activePhase={activePhase}
            onPhaseChange={handlePhaseChange}
          />
        )}
        
        <div className="flex-1 flex overflow-hidden">
          {/* Only show MaestroRail in Dev phase or later, and only on non-excluded pages */}
          {activePhase !== 'conception' && !isExcludedFromTopBar && (
            <MaestroRail
              activeMaestro={activeMaestro}
              onMaestroChange={setActiveMaestro}
              pipelineStages={pipelineStages}
            />
          )}
          
          <main className="flex-1 overflow-y-auto bg-[#0a0a0c]">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}