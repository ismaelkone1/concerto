import { User, Bot, CheckCircle, Play, Settings } from 'lucide-react';

interface MaestroRailProps {
  activeMaestro: string;
  onMaestroChange: (maestro: string) => void;
  pipelineStages: Array<{ name: string; status: 'idle' | 'running' | 'completed' }>;
}

const maestros = [
  { id: 'be-dev', label: 'BE Dev', icon: Bot },
  { id: 'be-qa', label: 'BE QA', icon: CheckCircle },
  { id: 'fe-dev', label: 'FE Dev', icon: User },
  { id: 'fe-verif', label: 'FE Verif', icon: CheckCircle },
];

export default function MaestroRail({ activeMaestro, onMaestroChange, pipelineStages }: MaestroRailProps) {
  return (
    <div className="w-64 bg-[#0d0d0f] border-r border-white/5 flex flex-col overflow-hidden">
      {/* Maestros Section */}
      <div className="p-6">
        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-4">
          Maestros de Phase
        </div>
        <div className="space-y-1.5">
          {maestros.map(({ id, label, icon: Icon }) => {
            const isActive = activeMaestro === id;
            return (
              <button
                key={id}
                onClick={() => onMaestroChange(id)}
                className={`w-full sidebar-link ${
                  isActive
                    ? 'bg-white/5 text-white shadow-lg'
                    : 'text-gray-500 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                  isActive ? 'gradient-icon text-white' : 'bg-white/5 text-gray-500'
                }`}>
                  <Icon size={16} />
                </div>
                <span className="font-bold uppercase tracking-widest text-[10px]">{label}</span>
                {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-gray-700 mx-4" />

      {/* Pipeline Stages */}
      <div className="p-4 flex-1">
        <div className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
          Pipeline
        </div>
        <div className="space-y-1">
          {pipelineStages.map((stage, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg border transition-all ${
                stage.status === 'running'
                  ? 'bg-blue-500/10 border-blue-500/30 shadow-lg shadow-blue-500/10'
                  : stage.status === 'completed'
                  ? 'bg-green-500/10 border-green-500/30'
                  : 'bg-gray-800/50 border-gray-600 opacity-40'
              }`}
            >
              <div className="text-xs font-bold uppercase tracking-wide text-gray-300">
                {stage.name}
              </div>
              <div className="flex gap-1 mt-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full ${
                      stage.status === 'running' ? 'bg-blue-400' : 'bg-gray-600'
                    }`}
                    style={{ width: stage.status === 'running' ? `${(i + 1) * 25}%` : '100%' }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}