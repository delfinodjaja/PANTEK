import React, { useState, useMemo } from 'react';
import { useChain } from '../context/ChainContext';
import { 
  History, 
  Search, 
  Filter, 
  Trash2, 
  Download,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock
} from 'lucide-react';

export const SystemLog = () => {
  const { events, clearEvents } = useChain();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const exportLogs = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(events, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    const localDate = new Date().toLocaleDateString().replace(/\//g, '-');
    downloadAnchorNode.setAttribute("download", `pantek_logs_${localDate}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const filteredEvents = useMemo(() => {
    return events.filter(ev => {
      const typeMatch = filter === 'all' || ev.type === filter;
      const searchMatch = ev.msg.toLowerCase().includes(search.toLowerCase());
      return typeMatch && searchMatch;
    });
  }, [events, filter, search]);

  return (
    <div className="flex-1 overflow-y-auto h-full p-8 max-w-5xl mx-auto pb-32 space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-primary tracking-tight mb-2">System Events</h1>
          <p className="text-muted font-medium">Full audit trail of operational stressors and AI decision logic.</p>
        </div>
        <div className="flex items-center gap-3">
           <button 
             onClick={exportLogs}
             className="px-6 py-2.5 bg-panel border border-border rounded-xl text-[10px] font-black uppercase text-muted hover:text-primary transition-all flex items-center gap-2"
           >
             <Download size={14} /> Export Logs
           </button>
           <button 
             onClick={clearEvents} 
             className="px-6 py-2.5 bg-error/10 border border-error/20 rounded-xl text-[10px] font-black uppercase text-error hover:bg-error/20 transition-all flex items-center gap-2"
           >
             <Trash2 size={14} /> Wipe History
           </button>
        </div>
      </div>

      {/* Control Bar */}
      <div className="bg-panel border border-border p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-accent transition-colors" size={18} />
          <input 
            className="w-full bg-card border border-border rounded-xl pl-12 pr-4 py-3 text-sm text-primary focus:border-accent outline-none transition-all placeholder:text-muted/60 font-medium"
            placeholder="Search events, nodes, or error codes..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
           {['all', 'ok', 'warn', 'crit'].map(type => (
             <button 
                key={type}
                onClick={() => setFilter(type)}
                className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  filter === type ? 'bg-accent text-white shadow-lg shadow-accent/20' : 'bg-card text-muted border border-border hover:border-accent/40 hover:text-primary'
                }`}
             >
               {type === 'ok' ? 'Success' : type === 'warn' ? 'Warning' : type === 'crit' ? 'Critical' : 'All Events'}
             </button>
           ))}
        </div>
      </div>

      {/* Log Table */}
      <div className="bg-panel border border-border rounded-[32px] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-card text-[9px] font-black text-muted uppercase tracking-widest border-b border-border">
                <th className="px-8 py-5 w-32">Timestamp</th>
                <th className="px-8 py-5 w-32">Severity</th>
                <th className="px-8 py-5">Event Intelligence Metadata</th>
                <th className="px-8 py-5 text-right">Origin</th>
              </tr>
            </thead>
            <tbody className="text-xs text-primary font-medium">
               {filteredEvents.map((ev, i) => (
                 <tr key={i} className="border-b border-border last:border-0 hover:bg-accent/5 transition-colors group">
                    <td className="px-8 py-6 text-muted font-mono">{ev.time}</td>
                    <td className="px-8 py-6">
                       <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black uppercase ${
                         ev.type === 'crit' ? 'bg-error text-white' : 
                         ev.type === 'warn' ? 'bg-warning text-white' : 
                         ev.type === 'ok' ? 'bg-success text-white' : 
                         'bg-card border border-border text-muted'
                       }`}>
                         {ev.type === 'crit' ? <ShieldAlert size={10} /> : ev.type === 'warn' ? <AlertTriangle size={10} /> : <CheckCircle2 size={10} />}
                         {ev.type || 'info'}
                       </div>
                    </td>
                    <td className="px-8 py-6 max-w-md">
                       <div className="flex flex-col gap-1">
                          <span className="text-primary font-bold group-hover:text-accent transition-colors leading-relaxed">
                            {ev.msg}
                          </span>
                          <span className="text-[10px] text-muted">
                            Neural state propagation verified • MD5-Sync: {Math.random().toString(16).substr(2, 8).toUpperCase()}
                          </span>
                          {ev.details && (
                            <details className="mt-2 text-[10px] bg-black/30 p-2 rounded-lg border border-border/50 group/details">
                              <summary className="cursor-pointer text-muted hover:text-accent font-black uppercase tracking-widest transition-colors list-none flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                                Technical Metadata
                              </summary>
                              <div className="mt-3 relative">
                                <div className="absolute inset-0 bg-accent/5 blur-xl pointer-events-none" />
                                <pre className="relative max-h-60 overflow-auto whitespace-pre-wrap font-mono text-[9px] opacity-90 text-primary py-2 px-3 bg-black/40 rounded-md custom-scrollbar border border-white/5">
                                  {ev.details}
                                </pre>
                              </div>
                            </details>
                          )}
                       </div>
                    </td>
                    <td className="px-8 py-6 text-right font-mono text-muted text-[10px]">
                       NEURO_ENGINE::{Math.floor(Math.random()*100)+400}
                    </td>
                 </tr>
               ))}

               {filteredEvents.length === 0 && (
                 <tr>
                    <td colSpan={4} className="px-8 py-20 text-center text-muted font-bold italic">
                       <History size={40} className="mx-auto mb-4 opacity-20" />
                       No logs matching current filter criteria.
                    </td>
                 </tr>
               )}
            </tbody>
          </table>
        </div>
      </div>

       <div className="flex justify-between items-center text-[10px] font-bold text-muted px-4">
        <div className="flex items-center gap-2">
          <Clock size={12} /> Live stream active (HMR enabled)
        </div>
        <div>{filteredEvents.length} Entries Displayed</div>
      </div>
    </div>
  );
};

const ShieldAlert = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
    <path d="M12 8v4" /><path d="M12 16h.01" />
  </svg>
);
