'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Sparkles, Command, Paperclip } from 'lucide-react';
import { apiService } from '@/lib/api';
import { useSearchParams } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function ConceptionChat({ 
  projectId: propProjectId,
  onFocusChange,
  onDiagramUpdate
}: { 
  projectId?: string,
  onFocusChange?: (mode: 'global' | 'back' | 'front' | 'db') => void,
  onDiagramUpdate?: (chart: string) => void
}) {
  const searchParams = useSearchParams();
  const projectId = propProjectId || searchParams.get('projectId') || 'unknown';
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "### 🎼 Concerto Architecture Workbench\nI am the **Lead Architect**. My goal is to eliminate every shadow area in your project before orchestration. \n\nUse technical commands to focus our session:\n- `/back` : **Backend & Services** (Purple Mode)\n- `/front` : **UI & State Management** (Emerald Mode)\n- `/db` : **Data persistence** (Amber Mode)\n\nWhere shall we begin our technical deep-dive?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [showCommands, setShowCommands] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [currentFocus, setCurrentFocus] = useState<'global' | 'back' | 'front' | 'db'>('global');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attachedFiles, setAttachedFiles] = useState<{ name: string, content: string }[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const updateFocus = (content: string) => {
    let newFocus: 'global' | 'back' | 'front' | 'db' = 'global';
    if (content.includes('/back')) newFocus = 'back';
    else if (content.includes('/front')) newFocus = 'front';
    else if (content.includes('/db')) newFocus = 'db';
    
    if (newFocus !== currentFocus) {
      setCurrentFocus(newFocus);
      onFocusChange?.(newFocus);
    }
  };

  useEffect(() => {
    if (input.startsWith('/')) {
      updateFocus(input);
    }
  }, [input]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = await Promise.all(Array.from(files).map(async file => {
      try {
        const content = await file.text();
        return { name: file.name, content };
      } catch (err) {
        console.error('Error reading file:', file.name);
        return null;
      }
    }));

    setAttachedFiles(prev => [...prev, ...(newFiles.filter(Boolean) as { name: string, content: string }[])]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const focusColors = {
    global: 'blue',
    back: 'purple',
    front: 'emerald',
    db: 'amber'
  };
  const activeColor = focusColors[currentFocus];

  const handleSend = async (customContent?: string) => {
    const contentToSend = customContent || input;
    if (!contentToSend.trim() && attachedFiles.length === 0) return;

    updateFocus(contentToSend);

    let finalContent = contentToSend;
    if (attachedFiles.length > 0) {
      finalContent += "\n\n### 📁 ATTACHED CONTEXT:\n" + 
        attachedFiles.map(f => `**File: ${f.name}**\n\`\`\`\n${f.content}\n\`\`\``).join('\n\n');
    }

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: finalContent,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    if (!customContent) setInput('');
    setAttachedFiles([]); // Clear files after send
    setIsTyping(true);

    try {
      const chatMessages = messages.map(m => ({ role: m.role, content: m.content }));
      chatMessages.push({ role: 'user', content: finalContent });
      
      const response = await apiService.chat(projectId, chatMessages);
      
      const assistantMsg: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: response.content,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMsg]);

      // Extract Mermaid if present
      const mermaidMatch = response.content.match(/```mermaid\n([\s\S]*?)\n```/);
      if (mermaidMatch && onDiagramUpdate) {
        onDiagramUpdate(mermaidMatch[1]);
      }
    } catch (err) {
      console.error('Chat error:', err);
      const errorMsg: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: "Sorry, I encountered a technical error while processing your request. Please ensure the backend server is active.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleCalibrate = () => {
    handleSend("CALIBRATION_PROTOCOL: Please read the latest global prompts and project specifications, then provide me with a detailed summary of understanding to validate your alignment.");
  };

  return (
    <div className="flex flex-col h-full card-premium overflow-hidden shadow-2xl backdrop-blur-sm">
      {/* Header */}
      <div className="p-4 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
            <Bot className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide uppercase">AI Chat Architect</h3>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Online</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <button 
             onClick={handleCalibrate}
             className="flex items-center gap-2 px-3 py-1.5 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/20 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all"
           >
             <Sparkles size={12} />
             Calibrate
           </button>
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-white/10"
      >
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center border ${
              msg.role === 'assistant' 
                ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' 
                : 'bg-gray-700/50 border-white/10 text-gray-400'
            }`}>
              {msg.role === 'assistant' ? <Bot size={16} /> : <User size={16} />}
            </div>
            
            <div className={`max-w-[85%] space-y-2 ${msg.role === 'user' ? 'text-right' : ''}`}>
              <div className={`p-4 rounded-2xl text-[13px] leading-relaxed prose prose-invert max-w-none ${
                msg.role === 'assistant'
                  ? 'bg-white/5 border border-white/10 text-gray-200'
                  : 'bg-blue-600 text-white shadow-lg shadow-blue-600/10'
              }`}>
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    table: ({node, ...props}) => <div className="overflow-x-auto my-4"><table className="w-full border-collapse border border-white/10 text-xs" {...props} /></div>,
                    th: ({node, ...props}) => <th className="border border-white/10 bg-white/5 p-2 font-black uppercase text-[10px] tracking-widest text-blue-400" {...props} />,
                    td: ({node, ...props}) => <td className="border border-white/10 p-2" {...props} />,
                    p: ({node, ...props}) => <p className="mb-3 last:mb-0" {...props} />,
                    ul: ({node, ...props}) => <ul className="list-disc pl-4 mb-3" {...props} />,
                    li: ({node, ...props}) => <li className="mb-1" {...props} />,
                    code: ({node, ...props}) => <code className="bg-black/40 px-1.5 py-0.5 rounded font-mono text-[11px] text-emerald-400" {...props} />
                  }}
                >
                  {msg.content.replace(/### 📁 ATTACHED CONTEXT:[\s\S]*$/, '').replace(/<function_calls>[\s\S]*?<\/function_calls>/g, '').trim()}
                </ReactMarkdown>
                {msg.content.includes('### 📁 ATTACHED CONTEXT:') && (
                  <div className="mt-4 pt-4 border-t border-white/10 flex flex-wrap gap-2">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-white/40 w-full mb-1">Attached Context:</span>
                    {msg.content.match(/\*\*File: (.*?)\*\*/g)?.map((fileMatch, idx) => (
                      <div key={idx} className="bg-white/5 px-2 py-1 rounded-md text-[10px] text-blue-300 border border-white/5 flex items-center gap-1.5">
                        <Paperclip size={10} />
                        {fileMatch.replace(/\*\*File: (.*?)\*\*/, '$1')}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest opacity-60">
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
              <Bot size={16} />
            </div>
            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex gap-1 items-center">
              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 bg-[#0a0a0c] border-t border-white/5">
        {/* File Preview */}
        {attachedFiles.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2 animate-in slide-in-from-bottom-2 duration-300">
            {attachedFiles.map((file, idx) => (
              <div key={idx} className={`bg-${activeColor}-600/10 border border-${activeColor}-500/20 rounded-lg px-3 py-1.5 flex items-center gap-3 group`}>
                <div className="flex items-center gap-2">
                   <Paperclip size={12} className={`text-${activeColor}-400`} />
                   <span className={`text-[11px] font-medium text-${activeColor}-300`}>{file.name}</span>
                </div>
                <button 
                  onClick={() => setAttachedFiles(prev => prev.filter((_, i) => i !== idx))}
                  className={`w-4 h-4 rounded-full bg-${activeColor}-500/20 flex items-center justify-center text-${activeColor}-400 hover:bg-red-500/20 hover:text-red-400 transition-colors`}
                >
                  <span className="text-xs font-bold leading-none">&times;</span>
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="relative group">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            multiple 
            className="hidden" 
          />
          <textarea
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setShowCommands(e.target.value.startsWith('/'));
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
                setShowCommands(false);
              }
            }}
            placeholder="Type a message or /command..."
            className={`w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-sm focus:outline-none focus:border-${activeColor}-500/50 focus:ring-1 focus:ring-${activeColor}-500/50 transition-all resize-none h-12 scrollbar-none`}
          />
          
          {showCommands && (
            <div className="absolute bottom-full left-0 mb-2 w-64 bg-[#121214] border border-white/10 rounded-xl shadow-2xl p-2 animate-in slide-in-from-bottom-2 duration-200">
               <div className="text-[9px] font-bold text-gray-500 px-3 py-1 uppercase tracking-widest border-b border-white/5 mb-1">Architect Commands</div>
               {[
                 { cmd: '/back', desc: 'Focus on Backend' },
                 { cmd: '/front', desc: 'Focus on Frontend' },
                 { cmd: '/db', desc: 'Focus on Database' },
                 { cmd: '/confirm', desc: 'Finalize & Roadmap' }
               ].map(c => (
                 <button
                   key={c.cmd}
                   onClick={() => {
                     setInput(c.cmd + ' ');
                     setShowCommands(false);
                   }}
                   className="w-full flex items-center justify-between px-3 py-2 hover:bg-white/5 rounded-lg text-left transition-colors group"
                 >
                   <span className="text-[11px] font-mono text-blue-400 font-bold">{c.cmd}</span>
                   <span className="text-[10px] text-gray-500 group-hover:text-gray-300">{c.desc}</span>
                 </button>
               ))}
            </div>
          )}
          <div className="absolute right-2 bottom-2 flex items-center gap-1">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className={`p-1.5 transition-colors ${attachedFiles.length > 0 ? `text-${activeColor}-400 hover:text-${activeColor}-300` : 'text-gray-500 hover:text-white'}`}
            >
              <Paperclip size={16} />
            </button>
            <button 
              onClick={() => handleSend()}
              className={`p-1.5 bg-${activeColor}-600 hover:bg-${activeColor}-500 text-white rounded-lg transition-colors shadow-lg shadow-${activeColor}-600/20`}
            >
              <Send size={16} />
            </button>
          </div>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <div className="flex gap-2">
            <span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest bg-white/5 px-1.5 py-0.5 rounded">Architect Maestro</span>
            <span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest bg-white/5 px-1.5 py-0.5 rounded">GPT-4 Turbo</span>
          </div>
          <p className="text-[10px] text-gray-700">Press Enter to send, Shift + Enter for new line</p>
        </div>
      </div>
    </div>
  );
}
