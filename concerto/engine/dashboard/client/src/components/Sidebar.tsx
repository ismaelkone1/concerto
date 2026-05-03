'use client';

import { useRouter, usePathname } from 'next/navigation';
import { 
  Rocket, 
  Layout, 
  Grid, 
  Settings, 
  FileSearch
} from 'lucide-react';

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
    { id: 'home', label: 'Home', icon: Layout, path: '/' },
    { id: 'templates', label: 'Templates', icon: Grid, path: '/templates' },
    { id: 'settings', label: 'Global Settings', icon: Settings, path: '/configuration' },
    { id: 'audit', label: 'Audit', icon: FileSearch, path: '/audit' },
  ];

  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <aside className="w-64 border-r border-white/5 bg-[#0d0d0f] flex flex-col h-full shrink-0">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
          <Rocket className="w-5 h-5 text-white" />
        </div>
        <span className="font-bold text-lg tracking-tight text-white uppercase">CONCERTO</span>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => router.push(item.path)}
            className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all ${
              isActive(item.path)
                ? 'bg-blue-600/10 text-blue-400 border border-blue-500/10'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <item.icon className={`w-4 h-4 ${isActive(item.path) ? 'text-blue-400' : ''}`} />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-white/5">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 border border-white/10 flex items-center justify-center text-xs font-bold text-white shadow-inner">
            IS
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate text-white">Isko Admin</p>
            <p className="text-[10px] text-gray-500 truncate uppercase tracking-widest font-bold">Pro Plan</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
