'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Rocket, 
  Plus, 
  Settings, 
  FileSearch, 
  Clock, 
  Layout, 
  Grid, 
  ChevronRight,
  Search,
  MoreVertical,
  Trash2
} from 'lucide-react';
import { apiService } from '@/lib/api';

interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'building' | 'awaiting_data';
  progress: number;
  lastModified: string;
  stack: {
    backend: string;
    frontend: string;
  };
}

export default function Launchpad() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await apiService.getProjects();
        setProjects(data);
      } catch (err) {
        console.error('Failed to fetch projects:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const handleDelete = async (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation();
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer le projet "${name}" ?`)) {
      try {
        await apiService.deleteProject(id);
        setProjects(prev => prev.filter(p => p.id !== id));
      } catch (err) {
        alert('Erreur lors de la suppression du projet');
      }
    }
  };

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0a0c]">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
          <Rocket className="absolute inset-0 m-auto w-6 h-6 text-blue-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#0a0a0c] text-white overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 bg-[#0d0d0f] flex flex-col">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Rocket className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight">CONCERTO</span>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium bg-white/5 text-white rounded-lg transition-colors">
            <Layout className="w-4 h-4 text-blue-400" />
            Home
          </button>
          <button 
            onClick={() => router.push('/templates')}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
          >
            <Grid className="w-4 h-4" />
            Templates
          </button>
          <button 
            onClick={() => router.push('/configuration')}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
          >
            <Settings className="w-4 h-4" />
            Global Settings
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
            <FileSearch className="w-4 h-4" />
            Audit
          </button>
        </nav>

        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 border border-white/10 flex items-center justify-center text-xs font-bold text-white shadow-inner">
              IS
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">Isko Admin</p>
              <p className="text-[10px] text-gray-500 truncate">Pro Plan</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col bg-[#0a0a0c] relative">
        {/* Header */}
        <header className="h-16 border-b border-white/5 px-8 flex items-center justify-between bg-[#0a0a0c]/80 backdrop-blur-md sticky top-0 z-10">
          <h2 className="text-xl font-semibold">Launcher</h2>
          
          <div className="flex items-center gap-4">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
              <input 
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 w-64 transition-all"
              />
            </div>
            <button 
              onClick={() => router.push('/onboarding')}
              className="flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-sm font-semibold rounded-lg transition-all shadow-lg shadow-blue-500/20"
            >
              <Plus className="w-4 h-4" />
              New Project
            </button>
          </div>
        </header>

        {/* Project Grid */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Recent Projects</h3>
            <span className="text-xs text-blue-400 hover:underline cursor-pointer">View all projects</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <div 
                key={project.id}
                onClick={() => {
                   localStorage.setItem('activeProjectId', project.id);
                   router.push(`/conception?projectId=${project.id}`);
                }}
                className="group cursor-pointer p-5 bg-[#0d0d0f] border border-white/5 rounded-2xl hover:border-blue-500/40 transition-all hover:bg-white/[0.02] flex flex-col justify-between shadow-sm hover:shadow-blue-500/5"
              >
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 group-hover:scale-110 transition-transform duration-300">
                      <Layout className="w-5 h-5 text-blue-400" />
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={(e) => handleDelete(e, project.id, project.name)}
                        className="p-1.5 hover:bg-red-500/10 text-gray-500 hover:text-red-400 rounded-lg transition-colors"
                        title="Delete project"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 hover:bg-white/10 rounded-lg text-gray-500 hover:text-white transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <h4 className="font-semibold text-lg mb-1 group-hover:text-blue-400 transition-colors uppercase truncate">
                    {project.name}
                  </h4>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-4 h-10 leading-relaxed">
                    {project.description || 'No description provided.'}
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                      project.status === 'active' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 
                      project.status === 'building' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 
                      'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}>
                      {project.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-[11px] font-medium">
                      <span className="text-gray-500">Progress</span>
                      <span className="text-white">{project.progress || 0}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                        style={{ width: `${project.progress || 0}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-gray-600" />
                      <span className="text-[11px] text-gray-600">Updated 2d ago</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-700 group-hover:text-blue-400 transition-colors" />
                  </div>
                </div>
              </div>
            ))}

            {/* Empty State / Create New Card */}
            <div 
              onClick={() => router.push('/onboarding')}
              className="border-2 border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center p-8 hover:border-blue-500/20 hover:bg-white/[0.01] transition-all cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform group-hover:bg-blue-500/10">
                <Plus className="w-6 h-6 text-gray-400 group-hover:text-blue-400" />
              </div>
              <p className="text-sm font-semibold text-gray-400 group-hover:text-white">Create New Project</p>
              <p className="text-center text-xs text-gray-600 mt-2">Start a new autonomous AI development pipeline</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
