'use client';

import { useState } from 'react';
import { 
  Shield, 
  Activity, 
  AlertTriangle, 
  FileText, 
  CheckCircle2, 
  Clock, 
  Search,
  Filter,
  ArrowUpRight,
  ShieldCheck,
  Zap
} from 'lucide-react';


export default function AuditPage() {
  const [loading, setLoading] = useState(false);

  const stats = [
    { label: 'Health Score', value: '98%', icon: ShieldCheck, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Uptime', value: '99.9%', icon: Activity, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Active Alerts', value: '2', icon: AlertTriangle, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
    { label: 'Logs Scanned', value: '1.2k', icon: FileText, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  ];

  const recentLogs = [
    { id: 1, type: 'Security', message: 'Unauthorized access attempt blocked', time: '2m ago', status: 'blocked' },
    { id: 2, type: 'System', message: 'Automated backup completed successfully', time: '15m ago', status: 'success' },
    { id: 3, type: 'Performance', message: 'High CPU usage detected in worker-7', time: '1h ago', status: 'warning' },
    { id: 4, type: 'Security', message: 'SSL certificate renewed', time: '2h ago', status: 'success' },
    { id: 5, type: 'API', message: 'Rate limit hit for user admin_test', time: '3h ago', status: 'warning' },
  ];

  return (
      <main className="flex-1 flex flex-col bg-[#0a0a0c] relative overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-white/5 px-8 flex items-center justify-between bg-[#0a0a0c]/80 backdrop-blur-md sticky top-0 z-10">
           <h2 className="text-xl font-semibold">System Audit</h2>
           <div className="flex items-center gap-3">
              <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm font-medium hover:bg-white/10 transition-all flex items-center gap-2">
                <Clock size={16} />
                History
              </button>
              <button 
                onClick={() => setLoading(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-bold uppercase tracking-widest transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2"
              >
                <Zap size={16} className={loading ? 'animate-pulse' : ''} />
                Run Audit
              </button>
           </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {/* Hero Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {stats.map((stat, idx) => (
              <div key={idx} className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl hover:border-white/10 transition-all group">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl ${stat.bg}`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors" />
                </div>
                <div className="text-2xl font-bold mb-1 tracking-tight">{stat.value}</div>
                <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Logs Area */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <FileText className="text-blue-400" size={20} />
                  Audit Logs
                </h3>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
                    <input 
                      type="text" 
                      placeholder="Search logs..." 
                      className="pl-9 pr-4 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500/50 w-48"
                    />
                  </div>
                  <button className="p-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all">
                    <Filter size={14} className="text-gray-400" />
                  </button>
                </div>
              </div>

              <div className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-white/5 bg-white/5">
                        <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Type</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Event</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Time</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {recentLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-white/5 transition-all">
                          <td className="px-6 py-4">
                            <span className="text-xs font-bold text-blue-400 uppercase tracking-tighter">{log.type}</span>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm text-gray-300 font-medium">{log.message}</p>
                          </td>
                          <td className="px-6 py-4 text-xs text-gray-500">{log.time}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              {log.status === 'success' && <CheckCircle2 size={14} className="text-emerald-400" />}
                              {log.status === 'warning' && <AlertTriangle size={14} className="text-yellow-400" />}
                              {log.status === 'blocked' && <Shield size={14} className="text-red-400" />}
                              <span className={`text-[10px] font-bold uppercase tracking-widest ${
                                log.status === 'success' ? 'text-emerald-400' :
                                log.status === 'warning' ? 'text-yellow-400' : 'text-red-400'
                              }`}>
                                {log.status}
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="p-4 border-t border-white/5 text-center">
                  <button className="text-xs font-bold text-gray-500 hover:text-white transition-all uppercase tracking-widest">
                    Load More Events
                  </button>
                </div>
              </div>
            </div>

            {/* Sidebar Stats */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Shield className="text-purple-400" size={20} />
                Security Profile
              </h3>
              
              <div className="p-6 bg-gradient-to-br from-blue-600/10 to-purple-600/10 border border-blue-500/20 rounded-2xl">
                 <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-full bg-blue-500/20 border-4 border-blue-500/10 flex items-center justify-center relative">
                       <ShieldCheck className="w-7 h-7 text-blue-400" />
                       <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-[#0a0a0c]" />
                    </div>
                    <div>
                       <div className="font-bold text-white uppercase tracking-tight">Active Shield</div>
                       <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">v2.4.0 Running</div>
                    </div>
                 </div>
                 
                 <div className="space-y-4">
                    <div className="space-y-2">
                       <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-gray-500">
                          <span>Database Encryption</span>
                          <span className="text-emerald-400">Enabled</span>
                       </div>
                       <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 w-full" />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-gray-500">
                          <span>API Rate Limiting</span>
                          <span className="text-emerald-400">92%</span>
                       </div>
                       <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 w-[92%]" />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-gray-500">
                          <span>WAF Filtering</span>
                          <span className="text-yellow-400">Warning</span>
                       </div>
                       <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-yellow-500 w-[65%]" />
                       </div>
                    </div>
                 </div>
                 
                 <button className="w-full mt-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all">
                    Configure Shield
                 </button>
              </div>

              <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl">
                 <h4 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-4">Quick Actions</h4>
                 <div className="space-y-3">
                    <button className="w-full text-left px-4 py-3 bg-white/5 rounded-xl text-xs font-medium hover:bg-white/10 transition-all flex items-center justify-between group">
                       <span>Export Audit Report</span>
                       <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-all" />
                    </button>
                    <button className="w-full text-left px-4 py-3 bg-white/5 rounded-xl text-xs font-medium hover:bg-white/10 transition-all flex items-center justify-between group">
                       <span>Manage Access Control</span>
                       <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-all" />
                    </button>
                    <button className="w-full text-left px-4 py-3 bg-white/5 rounded-xl text-xs font-medium hover:bg-white/10 transition-all flex items-center justify-between group">
                       <span>Network Topology</span>
                       <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-all" />
                    </button>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </main>
  );
}
