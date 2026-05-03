'use client';

import { useState, useEffect } from 'react';
import { GitBranch, FileCode, GitCommit, ArrowUp, ArrowDown, Check, Send, AlertCircle } from 'lucide-react';

interface GitChange {
  flag: string;
  file: string;
}

interface GitCommitInfo {
  hash: string;
  msg: string;
}

interface GitStatus {
  branch: string;
  changes: GitChange[];
  commits: GitCommitInfo[];
}

export default function GitStatusCard() {
  const [status, setStatus] = useState<GitStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [commitMsg, setCommitMsg] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchStatus = async () => {
    try {
      const res = await fetch('http://localhost:3500/api/git');
      const data = await res.json();
      setStatus(data);
    } catch (err) {
      console.error('Failed to fetch git status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 10000); // Auto-refresh every 10s
    return () => clearInterval(interval);
  }, []);

  const handleAction = async (action: string, body?: any) => {
    setActionLoading(action);
    try {
      const res = await fetch(`http://localhost:3500/api/git/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined
      });
      const data = await res.json();
      if (data.success) {
        alert(`${action} successful!`);
        if (action === 'commit') setCommitMsg('');
        fetchStatus();
      } else {
        alert(`${action} failed: ${data.err || 'Unknown error'}`);
      }
    } catch (err) {
      alert(`Network error during ${action}`);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading && !status) {
    return (
      <div className="bg-[#0d0d0f]/50 border border-white/5 rounded-2xl p-6 h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  return (
    <div className="bg-[#0d0d0f]/50 border border-white/5 rounded-2xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GitBranch className="text-blue-400" size={18} />
          <span className="text-sm font-bold text-white uppercase tracking-tight">{status?.branch}</span>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => handleAction('pull')}
            disabled={!!actionLoading}
            className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
            title="Git Pull"
          >
            <ArrowDown size={16} className={actionLoading === 'pull' ? 'animate-bounce' : ''} />
          </button>
          <button 
            onClick={() => handleAction('push')}
            disabled={!!actionLoading}
            className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
            title="Git Push"
          >
            <ArrowUp size={16} className={actionLoading === 'push' ? 'animate-bounce' : ''} />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Local Changes ({status?.changes.length})</span>
        </div>
        <div className="max-h-32 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
          {status?.changes.length === 0 ? (
            <p className="text-xs text-gray-600 italic">No modifications detected</p>
          ) : (
            status?.changes.map((change, i) => (
              <div key={i} className="flex items-center gap-3 p-2 bg-white/[0.02] border border-white/5 rounded-lg group">
                <span className={`text-[10px] font-black w-4 text-center ${
                  change.flag === 'M' ? 'text-yellow-500' : 
                  change.flag === 'A' ? 'text-emerald-500' : 'text-red-500'
                }`}>
                  {change.flag}
                </span>
                <span className="text-xs text-gray-300 truncate font-mono">{change.file}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {status?.changes.length! > 0 && (
        <div className="space-y-3 pt-2 border-t border-white/5">
          <input 
            type="text" 
            placeholder="Commit message..."
            value={commitMsg}
            onChange={(e) => setCommitMsg(e.target.value)}
            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-blue-500/50 transition-colors"
          />
          <button 
            onClick={() => handleAction('commit', { message: commitMsg })}
            disabled={!commitMsg || !!actionLoading}
            className="w-full py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 disabled:text-gray-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <Send size={14} />
            Commit Changes
          </button>
        </div>
      )}

      <div className="space-y-3">
        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Recent Activity</span>
        <div className="space-y-2">
          {status?.commits.map((commit, i) => (
            <div key={i} className="flex items-center gap-3 text-xs">
              <GitCommit size={14} className="text-gray-700" />
              <span className="font-mono text-blue-400/70">{commit.hash}</span>
              <span className="text-gray-500 truncate">{commit.msg}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
