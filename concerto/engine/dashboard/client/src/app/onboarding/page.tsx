'use client';

import { useState, useCallback } from 'react';
import { 
  Music, 
  Zap, 
  ChevronRight, 
  Check,
  Layers,
  Container,
  Layout,
  Server,
  Monitor,
  ShieldCheck,
  HardDrive,
  MessageSquare,
  Wand2,
  Settings2,
  Bot,
  ArrowLeft
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { apiService } from '@/lib/api';



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
  creationMode: 'predefined' | 'custom' | 'chat';
  customBackend?: string;
  customFrontend?: string;
  customFullstack?: string;
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
    creationMode: 'predefined'
  });
  const [creationMode, setCreationMode] = useState<'predefined' | 'custom' | 'chat' | null>(null);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const finalPath = formData.targetPath.endsWith('/') 
        ? `${formData.targetPath}${formData.name}`
        : `${formData.targetPath}/${formData.name}`;

      const payload = {
        name: formData.name,
        description: formData.description,
        architecture: formData.architecture,
        stack: formData.stackType === 'fullstack-monolith' 
                ? { 
                    type: 'monolith', 
                    framework: formData.creationMode === 'custom' ? formData.customFullstack : formData.fullstackFramework 
                  }
                : { 
                    type: 'decoupled', 
                    frontend: formData.creationMode === 'custom' ? formData.customFrontend : formData.frontend, 
                    backend: formData.creationMode === 'custom' ? formData.customBackend : formData.backend 
                  },
        database: formData.database,
        dockerized: formData.dockerized,
        targetPath: finalPath
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
      <main className="flex-1 flex flex-col bg-[#0a0a0c] relative overflow-hidden">
        {/* Header matching Launchpad styling */}
        <header className="h-16 border-b border-white/5 px-8 flex items-center justify-between bg-[#0a0a0c]/80 backdrop-blur-md sticky top-0 z-10">
           <h2 className="text-xl font-semibold">Project Creation</h2>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 flex flex-col items-center">
          <div className="max-w-2xl w-full py-4">
            {creationMode && (
              <button 
                onClick={() => {
                  setCreationMode(null);
                  setStep(1);
                }}
                className="mb-8 flex items-center gap-2 text-gray-500 hover:text-blue-400 transition-all text-[10px] font-bold uppercase tracking-[0.2em] group"
              >
                <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-blue-600/20 group-hover:text-blue-400 transition-all">
                  <ArrowLeft size={12} />
                </div>
                Back to Path Selection
              </button>
            )}
        <div className="flex justify-between items-center mb-12 relative px-4">
           {[1, 2, 3, 4, 5].map(i => (
             <button 
               key={i} 
               disabled={i > step}
               onClick={() => setStep(i)}
               className={`relative z-10 flex flex-col items-center group transition-all ${i <= step ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}
             >
                <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-500 font-bold ${
                  step >= i 
                    ? 'bg-blue-600 border-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.4)] scale-110' 
                    : 'bg-[#151518] border-white/5 text-gray-600 group-hover:border-white/20'
                }`}>
                  {step > i ? <Check size={18} /> : i}
                </div>
                <div className={`text-[10px] uppercase font-bold tracking-tighter mt-2 transition-colors ${step >= i ? 'text-blue-400' : 'text-gray-500'}`}>
                  {i === 1 ? 'Details' : i === 2 ? 'Arch' : i === 3 ? 'Strategy' : i === 4 ? 'Stack' : 'Infra'}
                </div>
             </button>
           ))}
           <div className="absolute top-5 left-0 w-full h-[2px] bg-white/5 -z-0" />
           <div className="absolute top-5 left-0 h-[2px] bg-blue-600 transition-all duration-700 -z-0 shadow-[0_0_10px_rgba(37,99,235,0.5)]" style={{ width: `${((step-1)/4) * 100}%` }} />
        </div>

        {!creationMode && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl w-full">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-white mb-4 uppercase tracking-tighter">Choose your path</h1>
              <p className="text-gray-500 max-w-lg mx-auto">How would you like to architect your next masterpiece?</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <button 
                onClick={() => {
                  setCreationMode('predefined');
                  setFormData(prev => ({...prev, creationMode: 'predefined'}));
                }}
                className="group p-8 rounded-3xl bg-[#151518] border border-white/5 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all text-left space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100 fill-mode-both"
              >
                <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Zap className="text-blue-400 w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-tight">Maestro Mode</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">Fast-track with our optimized, predefined stacks. Best for standard web apps.</p>
                </div>
                <div className="text-[10px] font-bold text-blue-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                  Select <ChevronRight size={12} />
                </div>
              </button>

              <button 
                onClick={() => {
                  setCreationMode('custom');
                  setFormData(prev => ({...prev, creationMode: 'custom'}));
                }}
                className="group p-8 rounded-3xl bg-[#151518] border border-white/5 hover:border-purple-500/50 hover:bg-purple-500/5 transition-all text-left space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200 fill-mode-both"
              >
                <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Settings2 className="text-purple-400 w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-tight">Custom Mode</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">Full control. Choose any language, framework, or library. No constraints.</p>
                </div>
                <div className="text-[10px] font-bold text-purple-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                  Select <ChevronRight size={12} />
                </div>
              </button>

              <button 
                onClick={() => {
                  setCreationMode('chat');
                  setFormData(prev => ({...prev, creationMode: 'chat'}));
                }}
                className="group p-8 rounded-3xl bg-[#151518] border border-white/5 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all text-left space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300 fill-mode-both"
              >
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <MessageSquare className="text-emerald-400 w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-tight">Discovery Chat</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">Not sure about your stack? Design it conversationally with our Architect.</p>
                </div>
                <div className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                  Select <ChevronRight size={12} />
                </div>
              </button>
            </div>
          </div>
        )}

        {creationMode && step === 1 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-blue-500/10">
                <Music className="text-blue-400 w-8 h-8" />
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
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Target Directory</label>
                    <div className="relative group">
                      <input 
                        type="text"
                        readOnly
                        value={formData.targetPath}
                        onClick={async () => {
                          const res = await apiService.openSystemDialog();
                          if (!res.cancelled && res.path) {
                            setFormData({...formData, targetPath: res.path});
                          }
                        }}
                        placeholder="Click to select target directory..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 focus:outline-none focus:border-blue-500/50 transition-all font-medium text-xs font-mono cursor-pointer hover:bg-white/[0.07]"
                      />
                      <button 
                        type="button"
                        onClick={async () => {
                          const res = await apiService.openSystemDialog();
                          if (!res.cancelled && res.path) {
                            setFormData({...formData, targetPath: res.path});
                          }
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-blue-600/10 border border-blue-500/20 hover:bg-blue-600/20 transition-all text-blue-400"
                      >
                        <HardDrive size={18} />
                      </button>
                    </div>
                    <p className="text-[9px] text-gray-600 mt-2 text-left italic">
                      The project folder <strong>/{formData.name || 'project-name'}</strong> will be created inside this directory.
                    </p>
                </div>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={() => setStep(2)}
                disabled={!formData.name}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold py-5 rounded-2xl shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-3 group uppercase tracking-[0.2em] text-sm"
              >
                <span>Continue Architecture</span>
                <ChevronRight className="group-hover:translate-x-1 transition-transform" size={18} />
              </button>
            </div>
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

        {creationMode === 'predefined' && step === 4 && (
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

        {creationMode === 'custom' && step === 4 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-2 uppercase tracking-tight">Custom Stack</h2>
              <p className="text-gray-500">Define your own architectural tools</p>
            </div>

            <div className="space-y-6">
              {formData.stackType === 'fullstack-monolith' ? (
                <div>
                   <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 block">Fullstack Framework</label>
                   <input 
                     type="text"
                     value={formData.customFullstack || ''}
                     onChange={(e) => setFormData({...formData, customFullstack: e.target.value})}
                     placeholder="e.g. Phoenix, ASP.NET Core, Go-Gin-Hybrid..."
                     className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 focus:outline-none focus:border-blue-500/50 transition-all font-medium"
                   />
                </div>
              ) : (
                <>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 block">Backend Language / Framework</label>
                    <input 
                      type="text"
                      value={formData.customBackend || ''}
                      onChange={(e) => setFormData({...formData, customBackend: e.target.value})}
                      placeholder="e.g. Rust (Axum), Bun (Elysia), C# (.NET)..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 focus:outline-none focus:border-purple-500/50 transition-all font-medium"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 block">Frontend Library / Framework</label>
                    <input 
                      type="text"
                      value={formData.customFrontend || ''}
                      onChange={(e) => setFormData({...formData, customFrontend: e.target.value})}
                      placeholder="e.g. SolidJS, Qwik, Flutter Web, HTMX..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 focus:outline-none focus:border-emerald-500/50 transition-all font-medium"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="flex gap-4">
              <button onClick={() => setStep(3)} className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-4 rounded-xl transition-all uppercase tracking-widest text-sm">Back</button>
              <button onClick={() => setStep(5)} className="flex-[2] bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-600/20 transition-all uppercase tracking-widest text-sm">Next</button>
            </div>
          </div>
        )}

        {creationMode === 'chat' && (
          <div className="flex-1 w-full max-w-4xl bg-[#151518] rounded-3xl border border-white/5 overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-500 min-h-[600px] mb-8">
            <div className="p-6 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                    <Bot className="text-emerald-400 w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="font-bold text-white uppercase tracking-tight">Discovery Architect</h2>
                    <div className="flex items-center gap-2">
                       <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                       <span className="text-[10px] text-emerald-500/70 font-bold uppercase tracking-widest">Designing stack...</span>
                    </div>
                  </div>
               </div>
               <button 
                onClick={() => setCreationMode(null)}
                className="text-xs text-gray-500 hover:text-white transition-colors"
               >
                 Cancel & Choose Mode
               </button>
            </div>

            <div className="flex-1 p-8 space-y-6 overflow-y-auto bg-[#0d0d10]">
               <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                    <Bot size={16} className="text-emerald-400" />
                  </div>
                  <div className="bg-white/5 rounded-2xl rounded-tl-none p-5 text-sm text-gray-300 leading-relaxed max-w-[80%] border border-white/5">
                    Hello! I am your **Discovery Architect**. 
                    I'm here to help you choose the best technologies for your project based on your requirements.
                    <br /><br />
                    Tell me: **What kind of application are you building?** (e.g. "A real-time dashboard", "A complex SaaS", "A simple API")
                  </div>
               </div>
            </div>

            <div className="p-6 bg-white/[0.02] border-t border-white/5">
               <div className="relative">
                 <input 
                   type="text"
                   placeholder="Describe your vision..."
                   className="w-full bg-[#1a1a1e] border border-white/10 rounded-2xl px-6 py-5 pr-16 focus:outline-none focus:border-emerald-500/30 transition-all text-sm"
                 />
                 <button className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center transition-all shadow-lg shadow-emerald-600/20">
                    <ChevronRight size={20} />
                 </button>
               </div>
            </div>
            
            <div className="p-4 bg-emerald-500/5 border-t border-emerald-500/10 flex items-center justify-between">
               <p className="text-[10px] text-emerald-500/70 font-medium px-4 italic">
                 The Architect will pre-fill your configuration below.
               </p>
               <button 
                onClick={() => {
                  setFormData(prev => ({
                    ...prev,
                    name: formData.name || 'discovered-project',
                    stackType: 'decoupled',
                    backend: 'nodejs-express',
                    frontend: 'react-next',
                    database: 'postgresql'
                  }));
                  setStep(5);
                  setCreationMode('predefined');
                }}
                className="bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white px-6 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border border-emerald-500/30"
               >
                 Apply Suggested Stack
               </button>
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
      </main>
  );
}
