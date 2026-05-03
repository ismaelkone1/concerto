'use client';

import { useState, useEffect } from 'react';
import TopBar from './TopBar';
import MaestroRail from './MaestroRail';
import { usePathname, useRouter } from 'next/navigation';



interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  
  // Extraire la phase de l'URL si possible, sinon gérer par état
  const [activePhase, setActivePhase] = useState('conception');
  const [activeMaestro, setActiveMaestro] = useState('be-dev');
  
  const [pipelineStages, setPipelineStages] = useState([
    { name: 'Analyse', status: 'idle' as const },
    { name: 'Génération', status: 'idle' as const },
    { name: 'Validation', status: 'idle' as const },
    { name: 'Déploiement', status: 'idle' as const },
  ]);

  // Si on est sur le launcher, on n'affiche pas le layout de dashboard
  const isLauncherOrTemplates = pathname === '/' || pathname === '/templates';

  // Synchroniser l'état de la phase avec l'URL
  useEffect(() => {
    if (pathname.includes('/conception')) setActivePhase('conception');
    else if (pathname.includes('/dev')) setActivePhase('dev');
    else if (pathname.includes('/test')) setActivePhase('test');
    else if (pathname.includes('/deploy')) setActivePhase('deploy');
  }, [pathname]);

  const handlePhaseChange = (phase: string) => {
    setActivePhase(phase);
    // Redirection vers la page correspondante
    if (phase === 'conception') router.push('/conception');
    else if (phase === 'dev') router.push('/dev');
    // On ajoutera les autres routes plus tard
  };



  if (isLauncherOrTemplates) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col h-screen bg-[#0a0a0c]">
      <TopBar
        activePhase={activePhase}
        onPhaseChange={handlePhaseChange}
      />
      <div className="flex flex-1 overflow-hidden">
        {/* Only show MaestroRail in Dev phase or later */}
        {activePhase !== 'conception' && (
          <MaestroRail
            activeMaestro={activeMaestro}
            onMaestroChange={setActiveMaestro}
            pipelineStages={pipelineStages}
          />
        )}
        
        <div className="flex-1 flex flex-col overflow-hidden relative">
          <main className="flex-1 overflow-y-auto bg-[#0a0a0c]">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}