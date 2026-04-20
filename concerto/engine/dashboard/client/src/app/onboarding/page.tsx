'use client';

import { useState, useCallback } from 'react';
import { 
  Rocket, 
  Zap, 
  ChevronRight, 
  Check,
  Layers,
  Container,
  Layout,
  Server,
  Monitor,
  ShieldCheck,
  HardDrive
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { apiService } from '@/lib/api';
import FolderPicker from '@/components/FolderPicker';

interface ProjectFormData {
  name: string;
  description: string;
  architecture: string;
  stackType: 'decoupled' | 'fullstack-monolith';
  frontend: string;
  backend: string;
  fullstackFramework: string;
  database: string;
  dockerized: boolean;
  targetPath: string;
}

const ARCHITECTURES = [
  { id: 'monolith', name: 'Monolith', desc: 'Single application unit, simple to deploy', icon: <Layers className="text-blue-400" /> },
  { id: 'mvc', name: 'MVC', desc: 'Classic Model-View-Controller pattern', icon: <Layout className="text-purple-400" /> },
  { id: 'hexagonal', name: 'Hexagonal', desc: 'Clean architecture, domain-centric', icon: <ShieldCheck className="text-emerald-400" /> },
  { id: 'microservices', name: 'Microservices', desc: 'Distributed services architecture', icon: <Server className="text-orange-400" /> },
];

const BACKEND_STACKS = [
  { id: 'nodejs-express', name: 'Node.js (Express)', lang: 'JS/TS', icon: '🟢' },
  { id: 'nodejs-nest', name: 'NestJS', lang: 'TS', icon: '🔴' },
  { id: 'python-fastapi', name: 'FastAPI', lang: 'Python', icon: '🐍' },
  { id: 'python-django', name: 'Django', lang: 'Python', icon: '🐍' },
  { id: 'go-fiber', name: 'Fiber', lang: 'Go', icon: '🐹' },
  { id: 'rust-axum', name: 'Axum', lang: 'Rust', icon: '🦀' },
  { id: 'java-spring', name: 'Spring Boot', lang: 'Java', icon: '☕' },
  { id: 'php-symfony', name: 'Symfony', lang: 'PHP', icon: '🐘' },
];

const FRONTEND_STACKS = [
  { id: 'react-next', name: 'Next.js', lang: 'React', icon: '⚛️' },
  { id: 'react-vite', name: 'React (Vite)', lang: 'React', icon: '⚛️' },
  { id: 'vue-nuxt', name: 'Nuxt.js', lang: 'Vue', icon: '🟢' },
  { id: 'vue-vite', name: 'Vue (Vite)', lang: 'Vue', icon: '🟢' },
  { id: 'svelte-kit', name: 'SvelteKit', lang: 'Svelte', icon: '🟠' },
  { id: 'angular', name: 'Angular', lang: 'TS', icon: '🔴' },
];

const FULLSTACK_MONOLITHS = [
  { id: 'laravel', name: 'Laravel', lang: 'PHP', icon: '🐘' },
  { id: 'rails', name: 'Ruby on Rails', lang: 'Ruby', icon: '💎' },
  { id: 'django-full', name: 'Django (Templates)', lang: 'Python', icon: '🐍' },
  { id: 'nextjs-full', name: 'Next.js (Server actions)', lang: 'TS/React', icon: '⚛️' },
  { id: 'remix', name: 'Remix', lang: 'TS/React', icon: '💿' },
  { id: 'adonis', name: 'AdonisJS', lang: 'TS', icon: '🔋' },
];

const DATABASES = [
  { id: 'postgresql', name: 'PostgreSQL', icon: '🐘' },
  { id: 'mongodb', name: 'MongoDB', icon: '🍃' },
  { id: 'mysql', name: 'MySQL', icon: '🐬' },
  { id: 'redis', name: 'Redis (Cache)', icon: '⚡' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showFolderPicker, setShowFolderPicker] = useState(false);
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    description: '',
    architecture: 'mvc',
    stackType: 'decoupled',
    frontend: 'react-next',
    backend: 'nodejs-express',
    fullstackFramework: 'laravel',
    database: 'postgresql',
    dockerized: true,
    targetPath: '', 
  });

  const handlePathSelect = useCallback((path: string) => {
    setFormData(prev => {
      if (prev.targetPath === path) return prev;
      return { ...prev, targetPath: path };
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        architecture: formData.architecture,
        stack: formData.stackType === 'fullstack-monolith' 
                ? { type: 'monolith', framework: formData.fullstackFramework }
                : { type: 'decoupled', frontend: formData.frontend, backend: formData.backend },
        database: formData.database,
        dockerized: formData.dockerized,
        targetPath: formData.targetPath
      };

      const data = await apiService.createProject(payload);
      router.push(`/conception?projectId=${data.projectId || data.id}`);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white flex items-center justify-center p-6 bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.08),transparent_50%)]">
      <div className="max-w-2xl w-full py-12">
        <div className="flex justify-between items-center mb-12 relative px-4">
           {[1, 2, 3, 4, 5].map(i => (
             <div key={i} className="relative z-10 flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-300 font-bold ${
                  step >= i ? 'bg-blue-600 border-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.4)]' : 'bg-[#151518] border-white/5 text-gray-600'
                }`}>
                  {step > i ? <Check size={18} /> : i}
                </div>
                <div className="text-[10px] uppercase font-bold tracking-tighter mt-2 text-gray-500">
                  {i === 1 ? 'Details' : i === 2 ? 'Arch' : i === 3 ? 'Strategy' : i === 4 ? 'Stack' : 'Infra'}
                </div>
             </div>
           ))}
           <div className="absolute top-5 left-0 w-full h-[2px] bg-white/5 -z-0" />
           <div className="absolute top-5 left-0 h-[2px] bg-blue-600 transition-all duration-500 -z-0" style={{ width: `${((step-1)/4) * 100}%` }} />
        </div>

        {step === 1 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-blue-500/10">
                <Rocket className="text-blue-400 w-8 h-8" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2 uppercase tracking-tight">New Project</h1>
              <p className="text-gray-500">Give an identity to your next autonomous project</p>
            </div>

            <div className="space-y-4">
               <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 block">Project Name</label>
                  <input 
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g. concerto-platform"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all font-medium"
                   />
                </div>
                <div>
                   <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 block">Description</label>
                   <textarea 
                     value={formData.description}
                     onChange={(e) => setFormData({...formData, description: e.target.value})}
                     placeholder="What are we building today?"
                     className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all font-medium h-32 resize-none"
                   />
                </div>
                <div>
                   <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Target Path</label>
                   <div className="space-y-4">
                      <div className="flex gap-2">
                        <input 
                          type="text"
                          value={formData.targetPath}
                          onChange={(e) => setFormData({...formData, targetPath: e.target.value})}
                          placeholder="Enter or select an absolute path..."
                          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-5 py-4 focus:outline-none focus:border-blue-500/50 transition-all font-medium text-xs font-mono"
                        />
                        <button 
                          type="button"
                          onClick={async () => {
                            const res = await apiService.openSystemDialog();
                            if (!res.cancelled && res.path) {
                              setFormData({...formData, targetPath: res.path});
                            }
                          }}
                          className="px-4 rounded-xl bg-blue-600/10 border border-blue-500/20 hover:bg-blue-600/20 transition-all text-[10px] font-bold uppercase tracking-widest text-blue-400 flex items-center gap-2"
                        >
                          <HardDrive size={14} />
                          System
                        </button>
                        <button 
                          type="button"
                          onClick={() => setShowFolderPicker(!showFolderPicker)}
                          className="px-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-[10px] font-bold uppercase tracking-widest"
                        >
                          {showFolderPicker ? 'Close' : 'Web'}
                        </button>
                      </div>
                      
                      {showFolderPicker && (
                        <div className="animate-in fade-in zoom-in-95 duration-200">
                          <FolderPicker 
                            onSelect={handlePathSelect}
                            initialPath={formData.targetPath || '/'}
                          />
                        </div>
                      )}
                   </div>
                   <p className="text-[9px] text-gray-600 mt-2 text-left">Absolute path on your machine. Default: workspace/projects/{formData.name || 'project-name'}</p>
                </div>
            </div>

            <button 
              onClick={() => setStep(2)}
              disabled={!formData.name}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2 group uppercase tracking-widest text-sm"
            >
              Next
              <ChevronRight className="group-hover:translate-x-1 transition-transform" size={18} />
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-2 uppercase tracking-tight">Architectural Pattern</h2>
              <p className="text-gray-500">Choose the structural foundation of your application</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {ARCHITECTURES.map((arch) => (
                 <button
                    key={arch.id}
                    onClick={() => setFormData({...formData, architecture: arch.id})}
                    className={`p-6 rounded-2xl border-2 transition-all flex items-start gap-4 text-left ${
                      formData.architecture === arch.id 
                        ? 'border-blue-500 bg-blue-500/10' 
                        : 'border-white/5 bg-white/5 hover:border-white/10'
                    }`}
                 >
                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
                      {arch.icon}
                    </div>
                    <div>
                       <div className="font-bold text-white">{arch.name}</div>
                       <div className="text-xs text-gray-500 line-clamp-2">{arch.desc}</div>
                    </div>
                 </button>
               ))}
            </div>

            <div className="flex gap-4">
              <button onClick={() => setStep(1)} className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-4 rounded-xl transition-all uppercase tracking-widest text-sm">Back</button>
              <button onClick={() => setStep(3)} className="flex-[2] bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-600/20 transition-all uppercase tracking-widest text-sm">Next</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-2 uppercase tracking-tight">Stack Strategy</h2>
              <p className="text-gray-500">Unified application or decoupled hybrid?</p>
            </div>

            <div className="space-y-4">
               <button
                  onClick={() => setFormData({...formData, stackType: 'fullstack-monolith'})}
                  className={`w-full p-8 rounded-2xl border-2 transition-all flex items-center gap-6 ${
                    formData.stackType === 'fullstack-monolith' 
                      ? 'border-blue-500 bg-blue-500/10' 
                      : 'border-white/5 bg-white/5 hover:border-white/10'
                  }`}
               >
                  <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center">
                    <Monitor className="text-blue-400 w-8 h-8" />
                  </div>
                  <div className="text-left">
                     <div className="font-bold text-xl text-white uppercase tracking-tight">100% Fullstack Framework</div>
                     <div className="text-sm text-gray-500">Laravel, Ruby on Rails, Django, Remix... All-in-one.</div>
                  </div>
               </button>

               <button
                  onClick={() => setFormData({...formData, stackType: 'decoupled'})}
                  className={`w-full p-8 rounded-2xl border-2 transition-all flex items-center gap-6 ${
                    formData.stackType === 'decoupled' 
                      ? 'border-blue-500 bg-blue-500/10' 
                      : 'border-white/5 bg-white/5 hover:border-white/10'
                  }`}
               >
                  <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center">
                    <div className="flex gap-1">
                      <Server size={20} className="text-purple-400" />
                      <Monitor size={20} className="text-emerald-400" />
                    </div>
                  </div>
                  <div className="text-left">
                     <div className="font-bold text-xl text-white uppercase tracking-tight">Decoupled Backend & Frontend</div>
                     <div className="text-sm text-gray-500">API Gateway + Modern Client (React, Vue, Svelte...)</div>
                  </div>
               </button>
            </div>

            <div className="flex gap-4">
              <button onClick={() => setStep(2)} className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-4 rounded-xl transition-all uppercase tracking-widest text-sm">Back</button>
              <button onClick={() => setStep(4)} className="flex-[2] bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-600/20 transition-all uppercase tracking-widest text-sm">Next</button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-2 uppercase tracking-tight">Technologies</h2>
              <p className="text-gray-500">Choose your preferred instruments</p>
            </div>

            {formData.stackType === 'fullstack-monolith' ? (
              <div className="grid grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin">
                {FULLSTACK_MONOLITHS.map(stack => (
                  <button
                    key={stack.id}
                    onClick={() => setFormData({...formData, fullstackFramework: stack.id})}
                    className={`p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${
                      formData.fullstackFramework === stack.id 
                        ? 'border-blue-500 bg-blue-500/10' 
                        : 'border-white/5 bg-white/5 hover:border-white/10'
                    }`}
                  >
                    <span className="text-2xl">{stack.icon}</span>
                    <div className="text-left">
                      <div className="font-bold text-sm text-white">{stack.name}</div>
                      <div className="text-[10px] text-gray-500 uppercase font-bold">{stack.lang}</div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                   <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 block">Backend</label>
                   <div className="grid grid-cols-2 gap-3">
                      {BACKEND_STACKS.map(stack => (
                        <button
                          key={stack.id}
                          onClick={() => setFormData({...formData, backend: stack.id})}
                          className={`p-3 rounded-xl border-2 transition-all flex items-center gap-3 ${
                            formData.backend === stack.id 
                              ? 'border-purple-500 bg-purple-500/10' 
                              : 'border-white/5 bg-white/5 hover:border-white/10'
                          }`}
                        >
                          <span className="text-xl">{stack.icon}</span>
                          <span className="font-bold text-xs">{stack.name}</span>
                        </button>
                      ))}
                   </div>
                </div>
                <div>
                   <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 block">Frontend</label>
                   <div className="grid grid-cols-2 gap-3">
                      {FRONTEND_STACKS.map(stack => (
                        <button
                          key={stack.id}
                          onClick={() => setFormData({...formData, frontend: stack.id})}
                          className={`p-3 rounded-xl border-2 transition-all flex items-center gap-3 ${
                            formData.frontend === stack.id 
                              ? 'border-emerald-500 bg-emerald-500/10' 
                              : 'border-white/5 bg-white/5 hover:border-white/10'
                          }`}
                        >
                          <span className="text-xl">{stack.icon}</span>
                          <span className="font-bold text-xs">{stack.name}</span>
                        </button>
                      ))}
                   </div>
                </div>
              </div>
            )}

            <div className="flex gap-4">
              <button onClick={() => setStep(3)} className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-4 rounded-xl transition-all uppercase tracking-widest text-sm">Back</button>
              <button onClick={() => setStep(5)} className="flex-[2] bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-600/20 transition-all uppercase tracking-widest text-sm">Next</button>
            </div>
          </div>
        )}

        {step === 5 && (
          <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-2 uppercase tracking-tight">Infrastructure</h2>
              <p className="text-gray-500">Finalize the orchestration</p>
            </div>

            <div className="space-y-6">
               <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 block">Database</label>
                  <div className="grid grid-cols-2 gap-3">
                    {DATABASES.map((db) => (
                      <button
                        key={db.id}
                        type="button"
                        onClick={() => setFormData({...formData, database: db.id})}
                        className={`p-4 rounded-xl border-2 transition-all flex items-center justify-between px-6 ${
                          formData.database === db.id 
                            ? 'border-blue-500 bg-blue-500/10 text-white' 
                            : 'border-white/5 bg-white/5 hover:border-white/10 text-gray-400'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                           <span className="text-xl">{db.icon}</span>
                           <span className="font-bold uppercase tracking-widest text-[10px]">{db.name}</span>
                        </div>
                      </button>
                    ))}
                  </div>
               </div>

               <button
                  type="button"
                  onClick={() => setFormData({...formData, dockerized: !formData.dockerized})}
                  className={`w-full p-6 rounded-2xl border-2 transition-all flex items-center justify-between ${
                    formData.dockerized 
                      ? 'border-emerald-500 bg-emerald-500/10' 
                      : 'border-white/5 bg-white/5 hover:border-white/10'
                  }`}
               >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
                      <Container className={formData.dockerized ? 'text-emerald-400' : 'text-gray-600'} />
                    </div>
                    <div className="text-left">
                       <div className="font-bold text-white">Dockerization</div>
                       <div className="text-xs text-gray-500">Automatically generate Dockerfiles and compose</div>
                    </div>
                  </div>
                  <div className={`w-12 h-6 rounded-full transition-all relative ${formData.dockerized ? 'bg-emerald-500' : 'bg-white/10'}`}>
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${formData.dockerized ? 'left-7' : 'left-1'}`} />
                  </div>
               </button>
            </div>

            <div className="flex gap-4">
              <button 
                type="button"
                onClick={() => setStep(4)}
                className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-4 rounded-xl transition-all uppercase tracking-widest text-sm"
              >
                Back
              </button>
              <button 
                type="submit"
                disabled={loading}
                className="flex-[2] bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-sm"
              >
                {loading ? (
                   <Zap className="animate-pulse text-yellow-400" />
                ) : (
                  "Launch Project"
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
