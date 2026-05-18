import React from 'react';
import { useChain } from '../context/ChainContext';
import { 
  BarChart3, 
  Activity, 
  MapPin, 
  TrendingUp, 
  AlertTriangle, 
  ArrowRight,
  Zap,
  Beaker,
  Info
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Tooltip } from '../components/Tooltip';

import { toast } from 'react-hot-toast';

import { NewsFeed } from '../components/NewsFeed';
import { IntelligenceTicker } from '../components/IntelligenceTicker';

const KPICard = ({ label, value, sub, icon: Icon, color, tooltip }: any) => (
  <div className="glass-card p-6 relative overflow-hidden group">
    <div className={`absolute -top-4 -right-4 p-6 opacity-5 group-hover:opacity-10 transition-all duration-500 group-hover:scale-110 group-hover:-rotate-12 ${color}`}>
      <Icon size={120} />
    </div>
    <div className="relative z-10 flex flex-col h-full">
      <div className="text-muted font-black text-[10px] uppercase tracking-[0.2em] mb-4 flex items-center justify-between group/label">
        <div className="flex items-center gap-2.5">
          <div className={`p-1.5 rounded-lg bg-current/10 ${color}`}>
            <Icon size={14} />
          </div>
          {label}
        </div>
        {tooltip && (
          <Tooltip content={tooltip} position="top">
            <Info size={12} className="opacity-40 hover:opacity-100 cursor-help transition-opacity" />
          </Tooltip>
        )}
      </div>
      <div className="text-4xl font-black text-primary mb-2 tracking-tighter leading-none">{value}</div>
      <div className="text-[11px] text-muted font-bold mt-auto flex items-center gap-1.5">
        <div className={`w-1 h-1 rounded-full ${color} animate-pulse`} />
        {sub}
      </div>
    </div>
  </div>
);

export const Overview = () => {
  const { stats, events, runSimulation, theme, isAiLoading, selectedModel, setSelectedModel, userApiKey, setIsSettingsOpen } = useChain();

  const models = [
    { id: 'gemini-2.0-flash', name: '2.0 Flash', desc: 'SOTA Speed' },
    { id: 'gemini-3-flash-preview', name: '3.0 Flash', desc: 'Standard AI' },
    { id: 'gemini-3.1-pro-preview', name: '3.1 Pro', desc: 'Advanced Reasoning' }
  ];

  const quickScenarios = [
    { label: 'Panama Drought', prompt: 'Simulate 50% reduction in Panama Canal transit capacity.' },
    { label: 'Semiconductor Shock', prompt: 'Taiwan manufacturer shutdown leading to chip shortage.' },
    { label: 'Cyber Strike', prompt: 'Ransomware attack on major port logistics systems.' }
  ];

  return (
    <div className="flex-1 overflow-y-auto h-full p-6 max-w-7xl mx-auto space-y-8 pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-panel p-6 rounded-3xl border border-border shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <span className="px-2 py-1 rounded-md bg-accent/10 text-accent text-[9px] font-black uppercase tracking-widest border border-accent/20">Operational</span>
            <span className="text-muted text-[10px] uppercase tracking-widest font-bold">V4.2.0-Stable</span>
          </div>
          <h1 className="text-4xl font-extrabold text-primary tracking-tight mb-1">Global Intelligence <span className="text-accent underline underline-offset-8">Mirror</span></h1>
          <p className="text-muted font-medium text-base">Predictive supply chain digital twin and logistics analytics.</p>
        </div>
        
        <div className="flex items-center gap-4 relative z-10">
          <div className="flex flex-col items-end">
            <label className="text-[9px] font-black uppercase text-muted tracking-widest mb-1.5 opacity-60">Intelligence Engine</label>
            <div className="flex bg-card border border-border p-1 rounded-xl gap-1">
              {models.map(m => (
                <button
                  key={m.id}
                  onClick={() => setSelectedModel(m.id)}
                  className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all duration-300 ${
                    selectedModel === m.id 
                    ? 'bg-accent text-white shadow-lg shadow-accent/20' 
                    : 'text-muted hover:text-primary hover:bg-white/10'
                  }`}
                >
                  {m.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {!userApiKey && (
        <div className="p-8 rounded-3xl bg-error/5 border border-error/20 flex items-center justify-between gap-6 glass animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-error/10 flex items-center justify-center text-error shrink-0">
              <Zap size={28} />
            </div>
            <div>
              <h3 className="text-lg font-black text-primary tracking-tight">Intelligence Layer Offline</h3>
              <p className="text-muted text-sm font-medium">Please provide a valid Gemini API key in the configuration settings to enable simulation capabilities.</p>
            </div>
          </div>
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="px-6 py-3 bg-error text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-error/90 transition-all shadow-lg shadow-error/20 whitespace-nowrap"
          >
            Configure System
          </button>
        </div>
      )}

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard 
          label="Flow Routes" 
          value={stats.routesCount} 
          sub="Across Global Corridors" 
          icon={TrendingUp} 
          color="text-accent" 
          tooltip="Total number of active, monitored supply chain paths in the current digital twin environment."
        />
        <KPICard 
          label="Resilience Score" 
          value={`${stats.health}%`} 
          sub="Risk Shielding Effective" 
          icon={Activity} 
          color="text-success" 
          tooltip="A composite metric evaluating the network's capacity to absorb disruptions while maintaining service levels."
        />
        <KPICard 
          label="Active Alerts" 
          value={stats.alertNodes} 
          sub="Requires Priority Mitigation" 
          icon={AlertTriangle} 
          color="text-error" 
          tooltip="Count of critical nodes reporting significant operational anomalies or capacity drops."
        />
        <KPICard 
          label="On-Time Rate" 
          value="94.2%" 
          sub="+1.4% from Last Period" 
          icon={BarChart3} 
          color="text-accent" 
          tooltip="The percentage of shipments currently projected to arrive within their original time-window targets."
        />
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-0 overflow-hidden">
        {/* Map Snapshot & Ticker */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-[11px] font-black text-muted uppercase tracking-[0.2em] flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-accent/10">
                  <MapPin size={14} className="text-accent" />
                </div>
                Live Network Infrastructure
              </h3>
              <Link to="/map" className="text-[10px] font-black uppercase tracking-widest text-accent flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-accent/10 transition-all">
                Launch Tactical View <ArrowRight size={14} />
              </Link>
            </div>
            <div className="aspect-[16/9] bg-panel border-2 border-border/60 rounded-[32px] relative overflow-hidden flex flex-col group shadow-2xl">
              <div className="flex-1 relative flex items-center justify-center">
                <div className={`absolute inset-0 opacity-10 bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/ec/World_map_blank_without_borders.svg')] bg-center bg-no-repeat bg-contain p-20 mix-blend-overlay grayscale transition-transform duration-1000 group-hover:scale-105 ${theme === 'dark' ? '' : 'invert'}`} />
                <div className="absolute inset-0 bg-gradient-to-t from-bg via-transparent to-transparent opacity-40" />
                
                <div className="relative z-10 flex flex-col items-center gap-6 text-center p-12 max-w-md">
                  <div className="w-20 h-20 bg-accent/10 border border-accent/20 rounded-[24px] flex items-center justify-center text-accent relative group-hover:bg-accent/20 transition-all duration-500">
                    <div className="absolute inset-0 bg-accent/20 rounded-[24px] animate-ping opacity-20" />
                    <Globe size={40} />
                  </div>
                  <div>
                    <div className="font-black text-2xl text-primary tracking-tighter mb-2 italic">Operations Center Online</div>
                    <div className="text-sm text-muted font-bold leading-relaxed opacity-80 uppercase tracking-widest text-[10px]">Real-time synchronization active<br/>Across 12 Global Logistics Corridors</div>
                  </div>
                </div>

                {/* Tactical indicators */}
                <div className="absolute top-[30%] left-[20%] w-3 h-3 rounded-full bg-error shadow-[0_0_15px_#ef4444] animate-pulse" />
                <div className="absolute top-[45%] left-[65%] w-3 h-3 rounded-full bg-warning shadow-[0_0_15px_#f59e0b] animate-pulse" />
                <div className="absolute top-[25%] left-[80%] w-3 h-3 rounded-full bg-success shadow-[0_0_15px_#10b981] animate-pulse" />
              </div>
              
              <IntelligenceTicker />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Alert Feed */}
            <section>
              <h3 className="text-[11px] font-black text-muted uppercase tracking-[0.2em] mb-6 flex items-center gap-2.5 px-2">
                <div className="p-1.5 rounded-lg bg-warning/10">
                  <Zap size={14} className="text-warning" />
                </div>
                Anomaly Logs
              </h3>
              <div className="space-y-3">
                {events.slice(0, 3).map((ev, i) => (
                  <div key={i} className="bg-panel border border-border p-4 rounded-2xl flex items-start gap-4 transition-all hover:bg-card hover:translate-x-1 group">
                    <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 shadow-sm ${
                      ev.type === 'crit' ? 'bg-error shadow-error/40' : ev.type === 'warn' ? 'bg-warning shadow-warning/40' : 'bg-success shadow-success/40'
                    }`} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <div className="text-[9px] font-black text-muted uppercase tracking-widest font-mono opacity-60">{ev.time}</div>
                        {ev.type === 'crit' && <span className="text-[8px] font-black bg-error/10 text-error px-1.5 py-0.5 rounded uppercase">Critical</span>}
                      </div>
                      <div className="text-xs font-bold text-primary leading-snug group-hover:text-accent transition-colors">
                        {ev.msg.split(' ').length > 10 
                          ? ev.msg.split(' ').slice(0, 10).join(' ') + '...' 
                          : ev.msg
                        }
                        {ev.details && (
                          <Link 
                            to="/log" 
                            className="block mt-2 text-[9px] text-muted hover:text-accent font-black uppercase tracking-[0.15em] transition-colors flex items-center gap-1.5"
                          >
                            <Info size={10} /> View Technical Report
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Tactical Scenarios */}
            <section>
              <h3 className="text-[11px] font-black text-muted uppercase tracking-[0.2em] mb-6 px-2 flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-accent/10">
                  <Beaker size={14} className="text-accent" />
                </div>
                Tactical Scenarios
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {quickScenarios.map(s => (
                  <button 
                  key={s.label}
                  onClick={() => {
                    if (isAiLoading) return;
                    toast.loading(`Deploying Scenario: ${s.label}...`, { duration: 2000 });
                    runSimulation(s.prompt);
                  }}
                  disabled={isAiLoading}
                  className="w-full text-left p-4 rounded-2xl bg-panel border-2 border-border/60 hover:border-accent hover:bg-accent/5 transition-all flex items-center justify-between group disabled:opacity-50"
                  >
                  <span className="text-xs font-black text-muted group-hover:text-primary transition-colors tracking-wide">{s.label}</span>
                  <div className="p-2 rounded-lg bg-card group-hover:bg-accent group-hover:text-white transition-all">
                    <Zap size={14} className={isAiLoading ? 'animate-pulse' : ''} />
                  </div>
                </button>
                ))}
                <Link to="/lab" className="w-full py-4 rounded-2xl border-2 border-dashed border-border flex items-center justify-center gap-3 text-xs font-black uppercase tracking-widest text-muted hover:text-accent hover:border-accent hover:bg-accent/5 transition-all mt-2">
                  Advanced Simulations <ArrowRight size={16} />
                </Link>
              </div>
            </section>
          </div>
        </div>

        {/* Global Intel News Feed */}
        <div className="lg:col-span-4 h-full min-h-[600px] max-h-[850px] sticky top-0">
          <NewsFeed />
        </div>
      </div>
    </div>
  );
};

// Re-using Globe icon logic or similar
const Globe = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20z" />
    <path d="M2 12h20" />
  </svg>
);
