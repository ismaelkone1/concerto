'use client';

import { useState } from 'react';
import { 
  Grid, 
  Layout, 
  Layers, 
  Server, 
  ChevronRight, 
  Search,
  Star,
  Box
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Template {
  id: string;
  name: string;
  category: 'monolith' | 'mvc' | 'hexagonal' | 'microservices';
  stack: string;
  desc: string;
  complexity: 'Low' | 'Medium' | 'High';
  rating: number;
}

const TEMPLATES: Template[] = [
  // MONOLITH
  { id: '1', name: 'Standard Laravel', category: 'monolith', stack: 'PHP / Tailwind / MySQL', desc: 'The classic Artisan way. Robust and batteries-included.', complexity: 'Low', rating: 4.8 },
  { id: '2', name: 'Ruby on Rails', category: 'monolith', stack: 'Ruby / Hotwire / PG', desc: 'Optimized for programmer happiness and fast delivery.', complexity: 'Low', rating: 4.9 },
  // MVC
  { id: '3', name: 'Express Core MVC', category: 'mvc', stack: 'Node / EJS / MongoDB', desc: 'Clean MVC structure for Node.js lovers.', complexity: 'Medium', rating: 4.5 },
  { id: '4', name: 'Symfony Enterprise', category: 'mvc', stack: 'PHP / Twig / Postgres', desc: 'Enterprise-grade MVC pattern with high decoupling.', complexity: 'Medium', rating: 4.7 },
  // HEXAGONAL
  { id: '5', name: 'NestJS Clean Architecture', category: 'hexagonal', stack: 'TS / Nest / Hexagonal', desc: 'Professional hexagonal implementation for massive scalability.', complexity: 'High', rating: 4.9 },
  { id: '6', name: 'Go Domain Driven', category: 'hexagonal', stack: 'Go / Fiber / DDD', desc: 'Lightweight ports & adapters pattern in Go.', complexity: 'High', rating: 4.8 },
  // MICROSERVICES
  { id: '7', name: 'Distributed Node Stack', category: 'microservices', stack: 'Node / RabbitMQ / Docker', desc: 'Event-driven microservices with shared gateway.', complexity: 'High', rating: 4.6 },
  { id: '8', name: 'Python Service Mesh', category: 'microservices', stack: 'FastAPI / gRPC / Redis', desc: 'High-performance Python services with gRPC communication.', complexity: 'High', rating: 4.7 },
];



export default function TemplatesPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Template['category'] | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = TEMPLATES.filter(t => 
    (activeTab === 'all' || t.category === activeTab) &&
    (t.name.toLowerCase().includes(searchQuery.toLowerCase()) || t.stack.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
      <main className="flex-1 flex flex-col bg-[#0a0a0c] relative">
        {/* Header matching Launchpad styling */}
        <header className="h-16 border-b border-white/5 px-8 flex items-center justify-between bg-[#0a0a0c]/80 backdrop-blur-md sticky top-0 z-10">
           <h2 className="text-xl font-semibold">Blueprints & Templates</h2>
           
           <div className="flex items-center gap-4">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                <input 
                  type="text"
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 w-64 transition-all"
                />
              </div>
           </div>
        </header>

        {/* Content */}
        <div className="flex-1 p-10 overflow-y-auto scrollbar-thin">
           <div className="mb-10 flex items-center gap-4">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Filtrer par catégorie :</span>
              <div className="flex gap-2">
                 {['all', 'monolith', 'mvc', 'hexagonal', 'microservices'].map((cat) => (
                   <button 
                      key={cat}
                      onClick={() => setActiveTab(cat as any)}
                      className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${
                        activeTab === cat 
                          ? 'bg-blue-600 border-blue-600 text-white' 
                          : 'bg-transparent border-white/10 text-gray-500 hover:text-white hover:border-white/20'
                      }`}
                   >
                     {cat}
                   </button>
                 ))}
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-700">
              {filtered.map((t) => (
                <div key={t.id} className="group relative card-premium p-6 overflow-hidden">
                   {/* Background Glow */}
                   <div className="absolute -right-10 -top-10 w-32 h-32 bg-blue-600/5 blur-3xl group-hover:bg-blue-600/10 transition-colors" />
                   
                   <div className="flex items-start justify-between mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                         {t.category === 'monolith' && <Layers className="text-blue-400" />}
                         {t.category === 'mvc' && <Layout className="text-purple-400" />}
                         {t.category === 'hexagonal' && <Box className="text-emerald-400" />}
                         {t.category === 'microservices' && <Server className="text-orange-400" />}
                      </div>
                      <div className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-lg">
                        <Star size={12} className="text-yellow-400 fill-yellow-400" />
                        <span className="text-[10px] font-bold text-gray-300">{t.rating}</span>
                      </div>
                   </div>

                   <h3 className="text-xl font-bold mb-2 group-hover:text-blue-400 transition-colors uppercase tracking-tight">{t.name}</h3>
                   <p className="text-xs text-gray-500 leading-relaxed mb-6 h-10 line-clamp-2">{t.desc}</p>
                   
                   <div className="space-y-4 pt-4 border-t border-white/5">
                      <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                         <span className="text-gray-600">Stack</span>
                         <span className="text-gray-300">{t.stack}</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                         <span className="text-gray-600">Complexité</span>
                         <span className={`${
                            t.complexity === 'Low' ? 'text-emerald-400' : 
                            t.complexity === 'Medium' ? 'text-yellow-400' : 'text-red-400'
                         }`}>{t.complexity}</span>
                      </div>
                   </div>

                   <button 
                    onClick={() => router.push(`/onboarding?template=${t.id}`)}
                    className="w-full mt-8 py-4 bg-white/5 hover:bg-blue-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all flex items-center justify-center gap-2 group/btn border border-white/5 hover:border-blue-600 shadow-xl shadow-blue-600/0 hover:shadow-blue-600/20"
                   >
                     Utiliser ce template
                     <ChevronRight className="group-hover/btn:translate-x-1 transition-transform" size={14} />
                   </button>
                </div>
              ))}
           </div>
        </div>
      </main>
  );
}
