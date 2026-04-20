'use client';

import { useSearchParams } from 'next/navigation';
import ConceptionChat from '@/components/ConceptionChat';
import ProjectPromptWorkbench from '@/components/ProjectPromptWorkbench';

export default function ConceptionPage() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get('projectId');

  if (!projectId) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500 font-bold uppercase tracking-widest text-sm">
        No project selected
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-6 animate-in fade-in duration-500">
      <div className="flex-1 flex gap-6 min-h-0">
        {/* Left Side: Chat (Architect) */}
        <div className="flex-[3] min-w-[500px]">
          <ConceptionChat projectId={projectId} />
        </div>

        {/* Right Side: Workbench (Prompts & Specs) */}
        <div className="flex-[2] min-w-[400px] flex-shrink-0">
          <ProjectPromptWorkbench projectId={projectId} phase="conception" />
        </div>
      </div>
    </div>
  );
}