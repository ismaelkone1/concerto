import { Terminal, X } from 'lucide-react';
import { useState, useEffect } from 'react';

interface LogEntry {
  type: 'ok' | 'err' | 'head' | 'dim';
  message: string;
}

interface ConsolePanelProps {
  logs: LogEntry[];
  isMinimized: boolean;
  onToggleMinimize: () => void;
}

export default function ConsolePanel({ logs, isMinimized, onToggleMinimize }: ConsolePanelProps) {
  const [isExpanded, setIsExpanded] = useState(!isMinimized);

  useEffect(() => {
    setIsExpanded(!isMinimized);
  }, [isMinimized]);

  return (
    <div className={`bg-gray-900 border-t border-gray-700 flex flex-col transition-all duration-300 ${
      isExpanded ? 'h-40' : 'h-10'
    }`}>
      {/* Header */}
      <div className="h-8 flex items-center px-4 gap-2 border-b border-gray-700 bg-gray-800">
        <Terminal size={14} className="text-gray-400" />
        <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
          Console
        </span>
        <button
          onClick={onToggleMinimize}
          className="ml-auto text-gray-400 hover:text-white transition-colors"
        >
          {isExpanded ? <X size={14} /> : <Terminal size={14} />}
        </button>
      </div>

      {/* Logs */}
      {isExpanded && (
        <div className="flex-1 overflow-y-auto p-2 font-mono text-xs leading-relaxed">
          {logs.length === 0 ? (
            <div className="text-gray-500 italic">Aucun log disponible</div>
          ) : (
            logs.map((log, index) => (
              <div
                key={index}
                className={`whitespace-pre-wrap ${
                  log.type === 'ok' ? 'text-green-400' :
                  log.type === 'err' ? 'text-red-400' :
                  log.type === 'head' ? 'text-blue-400 font-bold' :
                  'text-gray-500'
                }`}
              >
                {log.message}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}