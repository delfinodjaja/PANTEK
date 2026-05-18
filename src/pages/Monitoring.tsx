import React from 'react';
import { useChain } from '../context/ChainContext';
import { 
  Activity, 
  AlertTriangle, 
  Globe, 
  TrendingUp, 
  Zap,
  MapPin,
  Clock,
  ExternalLink,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Tooltip } from '../components/Tooltip';

import { toast } from 'react-hot-toast';

export const Monitoring = () => {
  const { liveNews, stats, activeDisruptions, processNewsItem, isAiLoading } = useChain();

  const newsTypes: Record<string, { icon: React.ReactNode, bg: string }> = {
    weather: { icon: <Globe size={18} className="text-blue-500" />, bg: 'bg-blue-500/10' },
    disaster: { icon: <AlertTriangle size={18} className="text-error" />, bg: 'bg-error/10' },
    geopolitical: { icon: <Zap size={18} className="text-warning" />, bg: 'bg-warning/10' },
    port: { icon: <Activity size={18} className="text-accent" />, bg: 'bg-accent/10' },
    logistics: { icon: <Activity size={18} className="text-accent" />, bg: 'bg-accent/10' },
    demand: { icon: <TrendingUp size={18} className="text-success" />, bg: 'bg-success/10' },
    supplier: { icon: <Activity size={18} className="text-accent" />, bg: 'bg-accent/10' },
  };

  const getSeverityColor = (sev: string) => {
    switch(sev.toLowerCase()) {
      case 'critical': return 'text-error';
      case 'high': return 'text-warning';
      case 'medium': return 'text-accent';
      default: return 'text-success';
    }
  };

  return (
    <div className="flex-1 overflow-y-auto h-full p-6 max-w-[1600px] mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-primary tracking-tighter uppercase italic">
            Monitoring <span className="text-accent underline decoration-4 underline-offset-8">Station</span>
          </h1>
          <p className="text-muted font-medium mt-1 text-sm">Real-time global intelligence and digital twin health telemetry.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="px-6 py-3 bg-panel border border-border rounded-2xl flex items-center gap-4">
             <div className="flex flex-col items-center">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted">Network Health</span>
                  <Tooltip content="Real-time telemetry measuring the overall operational efficiency and connectivity of the supply chain network." position="bottom">
                    <Info size={10} className="text-muted/40 hover:text-muted transition-colors cursor-help" />
                  </Tooltip>
                </div>
                <span className="text-2xl font-black text-primary">{stats.networkHealthScore}%</span>
             </div>
             <div className="w-px h-8 bg-border" />
             <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-success animate-pulse shadow-[0_0_12px_#10b981]" />
                <span className="text-xs font-black uppercase tracking-widest text-primary">Live</span>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Live News Feed */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
               <Activity className="text-accent" />
               <h2 className="text-xl font-bold text-primary tracking-tight">Intelligence Ingestion</h2>
            </div>
            <span className="text-[10px] font-black uppercase text-muted tracking-widest">Global Signal Monitoring</span>
          </div>

          <div className="grid gap-4">
            {liveNews.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="group p-6 bg-panel border border-border rounded-[2rem] hover:border-accent/40 transition-all hover:shadow-2xl hover:shadow-accent/5"
              >
                <div className="flex flex-col md:flex-row gap-6">
                  <div className={`shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center ${newsTypes[item.category]?.bg || 'bg-muted/10'}`}>
                    {newsTypes[item.category]?.icon || <Info size={18} />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black uppercase tracking-widest text-accent">{item.category}</span>
                        <div className="w-1 h-1 rounded-full bg-border" />
                        <span className={`text-[10px] font-black uppercase tracking-widest ${getSeverityColor(item.severity)}`}>
                          {item.severity} SEVERITY
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-muted flex items-center gap-1">
                        <Clock size={10} /> {new Date(item.timestampMillis).toLocaleTimeString()}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-primary group-hover:text-accent transition-colors leading-tight mb-3">
                      {item.headline}
                    </h3>
                    <p className="text-sm text-muted leading-relaxed mb-4">
                      {item.body}
                    </p>
                    
                    <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-t border-border">
                       <div className="flex items-center gap-6">
                          <div className="flex flex-col">
                             <div className="flex items-center gap-1.5 mb-0.5">
                                <span className="text-[9px] font-black uppercase text-muted tracking-widest">Region</span>
                                <Tooltip content="Geographic region of origin for this signal." position="top">
                                   <Info size={10} className="text-muted/40 hover:text-muted transition-colors cursor-help" />
                                </Tooltip>
                             </div>
                             <span className="text-sm font-black text-primary">{item.region}</span>
                          </div>
                          <div className="flex flex-col">
                             <span className="text-[9px] font-black uppercase text-muted tracking-widest">Target Nodes</span>
                             <span className="text-sm font-black text-primary">{item.affectedNodes.length || 'Global'}</span>
                          </div>
                       </div>
                       <div className="flex items-center gap-3">
                        <button 
                          onClick={() => toast.success('Redirecting to intelligence source...')}
                          className="text-[10px] font-black uppercase tracking-widest text-muted hover:text-accent transition-colors flex items-center gap-1 px-3 py-2"
                        >
                          <ExternalLink size={10} /> Source
                        </button>
                        <button 
                          onClick={() => processNewsItem(item)}
                          disabled={isAiLoading}
                          className="px-6 py-2 bg-accent text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                        >
                          {isAiLoading ? 'Propagating...' : 'Analyze Impact'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right Column: Health & Active Disruptions */}
        <div className="lg:col-span-4 space-y-8">
          {/* Health Stats */}
          <div className="p-6 bg-accent rounded-[2rem] text-white shadow-2xl shadow-accent/20 relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform">
               <Activity size={120} />
             </div>
             <h3 className="text-sm font-black uppercase tracking-[0.2em] mb-6">Network Health</h3>
             <div className="text-6xl font-black mb-2">{stats.health}%</div>
             <p className="text-white/80 text-sm font-medium">Aggregate reliability across all lanes.</p>
             <div className="mt-8 grid grid-cols-2 gap-4">
               <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl">
                 <div className="text-[10px] font-black uppercase text-white/60 mb-1">Alerts</div>
                 <div className="text-xl font-black">{stats.alertNodes}</div>
               </div>
               <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl">
                 <div className="text-[10px] font-black uppercase text-white/60 mb-1">Total Nodes</div>
                 <div className="text-xl font-black">{stats.totalNodes}</div>
               </div>
             </div>
          </div>

          {/* Active Disruptions */}
          <div className="space-y-4">
            <h3 className="text-sm font-black uppercase tracking-widest text-muted px-2">Active Disruptions</h3>
            <div className="space-y-3">
              {activeDisruptions.length === 0 ? (
                <div className="p-8 text-center bg-panel border-2 border-dashed border-border rounded-3xl">
                  <div className="w-12 h-12 bg-card rounded-full flex items-center justify-center mx-auto mb-3 text-muted">
                    <Zap size={20} />
                  </div>
                  <p className="text-xs font-bold text-muted uppercase tracking-widest">No active simulations</p>
                </div>
              ) : (
                activeDisruptions.map(d => (
                  <div key={d.id} className={`p-4 bg-panel border-l-4 rounded-2xl shadow-sm ${d.severity > 0.7 ? 'border-error' : 'border-warning'}`}>
                    <div className="flex items-center justify-between mb-2">
                       <span className={`text-[10px] font-black uppercase tracking-widest ${d.severity > 0.7 ? 'text-error' : 'text-warning'}`}>
                         {d.type}
                       </span>
                       <span className="text-[10px] font-bold text-muted uppercase">{Math.round(d.severity * 100)}% Sev</span>
                    </div>
                    <p className="text-xs font-bold text-primary mb-2 line-clamp-1">{d.description}</p>
                    <div className="flex items-center gap-2 text-[10px] text-muted">
                      <MapPin size={10} />
                      <span className="uppercase font-medium">{d.targetId}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
