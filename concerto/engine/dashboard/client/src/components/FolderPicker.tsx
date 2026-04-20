'use client';

import { useState, useEffect, useCallback } from 'react';
import { Folder, FolderOpen, ChevronRight, HardDrive, Search } from 'lucide-react';
import { apiService } from '@/lib/api';

interface FolderItem {
  name: string;
  isDir: boolean;
}

interface FolderPickerProps {
  onSelect: (path: string) => void;
  initialPath?: string;
}

export default function FolderPicker({ onSelect, initialPath = '/' }: FolderPickerProps) {
  const [currentPath, setCurrentPath] = useState(initialPath);
  const [files, setFiles] = useState<FolderItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const loadPath = useCallback(async (path: string, notifyParent = true) => {
    setLoading(true);
    try {
      const data = await apiService.ls(path);
      setFiles(data.files.sort((a: FolderItem, b: FolderItem) => {
        if (a.isDir && !b.isDir) return -1;
        if (!a.isDir && b.isDir) return 1;
        return a.name.localeCompare(b.name);
      }));
      setCurrentPath(data.path);
      if (notifyParent) {
        onSelect(data.path);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [onSelect]);

  useEffect(() => {
    loadPath(initialPath, false); // Don't notify parent on initial load to avoid loop
  }, [initialPath, loadPath]);

  const handleFolderClick = (name: string) => {
    const sep = currentPath.endsWith('/') ? '' : '/';
    loadPath(`${currentPath}${sep}${name}`);
  };

  const handleGoUp = () => {
    const parts = currentPath.split('/').filter(Boolean);
    parts.pop();
    loadPath('/' + parts.join('/'));
  };

  const filteredFiles = files.filter(f => 
    f.isDir && f.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col bg-gray-900/50 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl">
      {/* Header / Path bar */}
      <div className="p-4 border-b border-white/5 bg-white/[0.02]">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
            <FolderOpen className="w-4 h-4 text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
             <h4 className="text-xs font-bold text-white uppercase tracking-wider">Target Workspace</h4>
             <p className="text-[10px] text-gray-500 font-medium truncate">{currentPath}</p>
          </div>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
          <input 
            type="text"
            placeholder="Search folders..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-xs text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 transition-all"
          />
        </div>
      </div>

      {/* Navigation Breadcrumbs */}
      <div className="flex items-center gap-1 px-4 py-2 bg-black/20 overflow-x-auto no-scrollbar border-b border-white/5">
        <button 
          onClick={() => loadPath('/')}
          className="p-1.5 hover:bg-white/5 rounded-md transition-colors text-gray-500 hover:text-white"
        >
          <HardDrive size={14} />
        </button>
        {currentPath.split('/').filter(Boolean).map((part, i, arr) => (
          <div key={i} className="flex items-center gap-1 flex-shrink-0">
            <ChevronRight size={12} className="text-gray-700" />
            <button 
              onClick={() => loadPath('/' + arr.slice(0, i + 1).join('/'))}
              className="px-2 py-1 hover:bg-white/5 rounded-md text-[10px] font-bold text-gray-400 hover:text-white transition-colors uppercase tracking-tight"
            >
              {part}
            </button>
          </div>
        ))}
      </div>

      {/* Folder List */}
      <div className="flex-1 min-h-[300px] max-h-[400px] overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-white/10">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-1">
            {currentPath !== '/' && (
              <button 
                onClick={handleGoUp}
                className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-xl transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center border border-white/5 group-hover:border-white/20 transition-all">
                  <ChevronRight className="w-4 h-4 text-gray-600 rotate-180" />
                </div>
                <span className="text-xs font-semibold text-gray-500 group-hover:text-gray-300">.. (Parent Directory)</span>
              </button>
            )}
            
            {filteredFiles.map((file) => (
              <button 
                key={file.name}
                onClick={() => handleFolderClick(file.name)}
                className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-xl transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-500/5 flex items-center justify-center border border-blue-500/10 group-hover:bg-blue-500/20 group-hover:border-blue-500/30 transition-all">
                  <Folder className="w-4 h-4 text-blue-400/70 group-hover:text-blue-400" />
                </div>
                <span className="text-xs font-semibold text-gray-400 group-hover:text-white truncate">{file.name}</span>
              </button>
            ))}

            {filteredFiles.length === 0 && !loading && (
              <div className="h-40 flex flex-col items-center justify-center text-center p-6">
                <Folder className="w-8 h-8 text-gray-800 mb-2" />
                <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">No folders found</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-white/5 bg-black/40">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Selection</span>
          <span className="text-[10px] font-mono font-bold text-blue-400 truncate ml-4">{currentPath}</span>
        </div>
      </div>
    </div>
  );
}
