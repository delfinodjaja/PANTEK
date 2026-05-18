import React from 'react';
import { useChain } from '../context/ChainContext';
import { Link } from 'react-router-dom';
import { 
  CheckCircle2, 
  Brain, 
  Target, 
  ShieldAlert, 
  BarChart3, 
  TrendingUp, 
  ShieldCheck,
  Activity,
  ArrowRight,
  Clock,
  Zap,
  Network,
  Info
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Tooltip } from '../components/Tooltip';

import { toast } from 'react-hot-toast';

export const AnalysisEngine = () => {
  const { aiAnalysis, isAiLoading, addEvent } = useChain();

  if (!aiAnalysis) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-6">
        <div className="w-24 h-24 bg-card border border-dashed border-border rounded-full flex items-center justify-center text-muted/30">
          <Brain size={48} />
        </div>
        <div className="max-w-md space-y-2">
          <h2 className="text-2xl font-black text-primary tracking-tight uppercase">Analysis Engine Idle</h2>
          <p className="text-muted font-medium">Run a scenario simulation in the <strong>Scenario Lab</strong> to generate intelligent recovery recommendations and risk assessments.</p>
        </div>
        <Link to="/lab" className="px-8 py-3 bg-accent text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg shadow-accent/20 hover:scale-105 transition-all">
          Go To Scenario Lab
        </Link>
      </div>
    );
  }

  // Find the confidence for the recommended strategy
  const recommendedStrategy = aiAnalysis.strategies.find(s => aiAnalysis.recommendation.choice.includes(s.label));
  const rawConfidence = recommendedStrategy?.confidenceScore || 85;
  const recommendedConfidence = rawConfidence > 1 ? rawConfidence : Math.round(rawConfidence * 100);

  return (
    <div className="flex-1 overflow-y-auto h-full p-6 max-w-[1600px] mx-auto pb-32 space-y-8 custom-scrollbar">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 bg-panel p-8 rounded-[2.5rem] border border-border shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 rounded-full -mr-48 -mt-48 blur-3xl opacity-50" />
        <div className="space-y-4 relative z-10">
          <div className="flex items-center gap-3 mb-1">
            <div className="p-1.5 rounded-lg bg-accent/10 border border-accent/20">
              <Brain size={16} className="text-accent" />
            </div>
            <span className="text-[10px] font-black uppercase text-muted tracking-[0.2em] opacity-60">Neural Advisory System v5.0</span>
          </div>
          <h1 className="text-4xl font-extrabold text-primary tracking-tight">Intelligence <span className="text-accent underline underline-offset-8">Report</span></h1>
          <p className="text-muted font-bold text-[10px] uppercase tracking-widest opacity-60">Synthesized mitigation strategies and ripple-effect forecasting.</p>
        </div>

        <div className="flex items-center gap-6 bg-card px-5 py-3 rounded-xl border border-border shadow-inner relative z-10">
          <div className="text-right">
            <div className="flex items-center justify-end gap-2 mb-1">
              <Tooltip content="Disruption severity index ranging from MINIMAL to CRITICAL." position="left">
                <Info size={10} className="text-muted/40 hover:text-accent transition-colors cursor-help" />
              </Tooltip>
              <div className="text-[9px] font-black text-muted uppercase tracking-[0.2em]">Global Severity</div>
            </div>
            <div className={`text-2xl font-black tracking-tight ${
              aiAnalysis.riskLevel === 'CRITICAL' ? 'text-error' :
              aiAnalysis.riskLevel === 'HIGH' ? 'text-warning' :
              'text-accent'
            }`}>{aiAnalysis.riskLevel}</div>
          </div>
          <div className="w-px h-8 bg-border/60" />
          <div className="text-right">
            <div className="flex items-center justify-end gap-2 mb-1">
              <Tooltip content="Statistical confidence level in the mitigation strategy's success." position="left">
                <Info size={10} className="text-muted/40 hover:text-accent transition-colors cursor-help" />
              </Tooltip>
              <div className="text-[9px] font-black text-muted uppercase tracking-[0.2em]">Confidence</div>
            </div>
            <div className="text-2xl font-black text-success tracking-tight">{recommendedConfidence}%</div>
          </div>
        </div>
      </div>

      {/* Top Recommendation Card */}
      <section className="bg-accent text-white p-8 rounded-3xl shadow-xl shadow-accent/20 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-all duration-700 group-hover:scale-110 translate-x-12 -translate-y-12">
          <ShieldCheck size={240} fill="white" className="text-accent" />
        </div>
        <div className="relative z-10 max-w-4xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-[9px] font-black uppercase tracking-[0.2em]">
            <ShieldCheck size={12} /> Recommended Path
          </div>
          <h2 className="text-4xl font-extrabold tracking-tight leading-none">
             Execute Strategy: <span className="underline decoration-white/30 underline-offset-8">{aiAnalysis.recommendation.choice}</span>
          </h2>
          <div className="border-l-2 border-white/20 pl-6">
             <p className="text-lg font-medium opacity-90 leading-relaxed italic">
              "{aiAnalysis.recommendation.justification}"
            </p>
          </div>
          <div className="flex items-center gap-4 pt-2">
            <button 
              onClick={() => {
                toast.success(`Mitigation strategy initiated.`);
                addEvent(`Mitigation strategy initiated: ${aiAnalysis.recommendation.choice}`, 'ok');
              }}
              className="px-6 py-3 bg-white text-accent rounded-xl font-bold uppercase text-[9px] tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all outline-none"
            >
              Initiate Mitigation
            </button>
            <button 
              onClick={() => {
                toast.loading('Synthesizing operational dossier...', { duration: 2000 });
                setTimeout(() => toast.success('Intelligence dossier exported.'), 2000);
              }}
              className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-xl font-black uppercase text-[10px] tracking-[0.2em] transition-all border border-white/20 outline-none backdrop-blur-sm"
            >
              Export Dossier
            </button>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Cascade & Timeline Column */}
        <div className="lg:col-span-8 space-y-8">
          {/* Timeline Projection */}
          <div className="bg-panel border-2 border-border p-10 rounded-[3rem] space-y-8 shadow-sm group">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-primary uppercase tracking-[0.2em] flex items-center gap-3">
                  <Clock size={18} className="text-accent" /> 30-Day Impact Projection
                </h3>
                <p className="text-[11px] text-muted font-bold mt-1 opacity-70 uppercase tracking-wider italic leading-none">Expected daily disruption severity based on propagation modeling.</p>
              </div>
              <div className="flex items-center gap-6 text-[10px] font-black uppercase text-muted opacity-60">
                <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.5)]" /> Intensity (0-100)</div>
              </div>
            </div>
            
            <div className="h-[280px] w-full" style={{ minWidth: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={aiAnalysis.timelineProjection}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" opacity={0.2} />
                  <XAxis dataKey="day" hide />
                  <YAxis hide domain={[0, 100]} />
                  <RechartsTooltip 
                    contentStyle={{ 
                      backgroundColor: 'var(--color-panel)', 
                      border: '2px solid var(--color-border)',
                      borderRadius: '24px',
                      fontSize: '11px',
                      padding: '16px',
                      boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
                    }}
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const p = payload[0].payload;
                        return (
                          <div className="space-y-3 max-w-[280px]">
                            <div className="flex items-center justify-between border-b border-border/60 pb-2">
                              <div className="flex flex-col">
                                <span className="font-black text-[9px] text-muted uppercase tracking-widest leading-none mb-1">Temporal Node</span>
                                <span className="font-black text-primary uppercase text-sm leading-none italic">Day {label}</span>
                              </div>
                              <span className={`font-black text-lg ${p.impactLevel > 70 ? 'text-error' : p.impactLevel > 40 ? 'text-warning' : 'text-success'}`}>{p.impactLevel}%</span>
                            </div>
                            <p className="text-[11px] font-bold text-muted leading-relaxed italic opacity-80">
                              "{p.description}"
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <defs>
                    <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="var(--color-accent)" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="var(--color-accent)" stopOpacity={1} />
                    </linearGradient>
                  </defs>
                  <Line 
                    type="monotone" 
                    dataKey="impactLevel" 
                    stroke="url(#lineGradient)" 
                    strokeWidth={6} 
                    dot={{ r: 0 }}
                    activeDot={{ r: 10, fill: 'var(--color-accent)', stroke: 'white', strokeWidth: 4 }}
                    animationDuration={2000}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-6 pt-6 border-t border-border">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black text-muted uppercase tracking-[0.2em] opacity-60">Evolutionary Reasoning</span>
                <div className="flex items-center gap-2">
                   <div className="flex bg-card p-1 rounded-lg border border-border">
                      <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                   </div>
                   <span className="text-[9px] font-black text-accent uppercase italic tracking-widest">T+30 Simulation Span</span>
                </div>
              </div>
              <div className="flex gap-6 overflow-x-auto pb-4 custom-scrollbar snap-x no-scrollbar">
                {aiAnalysis.timelineProjection.map((point, i) => (
                  <div key={i} className="min-w-[280px] p-6 bg-card/60 backdrop-blur-xl rounded-[2rem] border-2 border-border/60 space-y-3 snap-start hover:border-accent hover:bg-card transition-all group/point cursor-default">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-primary uppercase italic group-hover/point:text-accent transition-colors">Phase {i + 1}</span>
                        <span className="text-[8px] font-black text-muted uppercase tracking-widest opacity-60">Day {point.day}</span>
                      </div>
                      <div className={`text-sm font-black px-3 py-1 rounded-xl shadow-inner ${
                        point.impactLevel > 70 ? 'bg-error/10 text-error border border-error/20' :
                        point.impactLevel > 40 ? 'bg-warning/10 text-warning border border-warning/20' :
                        'bg-success/10 text-success border border-success/20'
                      }`}>
                        {point.impactLevel}%
                      </div>
                    </div>
                    <p className="text-[11px] text-muted font-bold leading-relaxed italic opacity-80 group-hover/point:opacity-100 transition-opacity">
                      "{point.description}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Cascade Intelligence Depth */}
          <div className="bg-panel border-2 border-border p-10 rounded-[3rem] space-y-8 shadow-sm">
            <div className="space-y-2">
              <h3 className="text-sm font-black text-primary uppercase tracking-[0.2em] flex items-center gap-3">
                <ShieldAlert size={18} className="text-error" /> Cascade Intelligence Report
              </h3>
              <p className="text-[11px] text-muted font-bold opacity-60 uppercase italic tracking-widest">Deep analysis of multi-order event propagation.</p>
            </div>

            <div className="space-y-10">
              {/* Secondary Events */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 text-[11px] font-black text-primary uppercase tracking-[0.2em] border-b-2 border-border pb-3">
                  <TrendingUp size={16} className="text-accent" /> Secondary Propagations (T+21)
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {aiAnalysis.secondaryEvents?.map((event, i) => (
                    <div key={i} className="p-8 bg-card rounded-[2rem] border-2 border-border space-y-5 relative overflow-hidden group hover:border-accent/40 shadow-sm transition-all duration-500">
                      <div className="absolute top-0 right-0 px-4 py-1.5 bg-muted/10 text-[9px] font-black uppercase tracking-widest rounded-bl-2xl opacity-60">
                        {event.type}
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-black text-accent uppercase tracking-[0.2em]">{event.category}</span>
                        <div className="text-xl font-black text-primary tracking-tighter leading-tight italic group-hover:text-accent transition-colors">
                          {event.title}
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-[10px] font-black text-muted opacity-60 uppercase tracking-widest border-y border-border/40 py-2">
                        <span>Onset: {event.onset}</span>
                        <span>Confidence: {event.probability}%</span>
                      </div>
                      <p className="text-[13px] text-muted leading-relaxed font-bold italic opacity-80 group-hover:opacity-100 transition-opacity">
                        "{event.description}"
                      </p>
                      {event.threatenedNodes && event.threatenedNodes.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-2">
                          {event.threatenedNodes.map((node, j) => (
                            <span key={j} className="text-[9px] font-black bg-error/10 text-error px-3 py-1 rounded-full uppercase border border-error/20">Threat: {node}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Tertiary Speculative */}
              {aiAnalysis.tertiaryEvents?.length > 0 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 text-[11px] font-black text-primary uppercase tracking-[0.2em] border-b-2 border-border pb-3">
                    <Zap size={16} className="text-warning" /> Tertiary Consequences (Speculative)
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {aiAnalysis.tertiaryEvents.map((event, i) => (
                      <div key={i} className="p-6 bg-card/60 backdrop-blur-sm rounded-2xl border-2 border-dashed border-border group hover:border-warning/40 transition-all hover:bg-card">
                        <div className="text-[11px] font-black text-primary mb-2 uppercase tracking-widest italic group-hover:text-warning transition-colors">{event.title}</div>
                        <p className="text-[11px] text-muted font-bold italic leading-relaxed opacity-70">"{event.description}"</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Watch Triggers */}
              {aiAnalysis.watchTriggers?.length > 0 && (
                <div className="p-8 bg-error/5 border-2 border-error/10 rounded-[2.5rem] space-y-6">
                   <div className="flex items-center gap-3 text-[11px] font-black text-error uppercase tracking-[0.3em]">
                     <Activity size={20} /> Neural Signal Watch Triggers
                   </div>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-3">
                     {aiAnalysis.watchTriggers.map((signal, i) => (
                       <div key={i} className="flex items-start gap-3 text-[12px] font-bold text-primary/80 group">
                         <div className="mt-1.5 w-2 h-2 rounded-full bg-error shadow-[0_0_8px_rgba(239,68,68,0.4)] group-hover:scale-150 transition-transform shrink-0" />
                         <span className="italic leading-snug">{signal}</span>
                       </div>
                     ))}
                   </div>
                </div>
              )}
            </div>
          </div>

          {/* Cascade Effects Map */}
        </div>

        {/* Strategies & Health Column */}
        <div className="lg:col-span-4 space-y-8">
           {/* Scenario Distribution */}
           <div className="bg-panel border border-border p-8 rounded-[2.5rem] space-y-6 shadow-sm overflow-hidden relative">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-primary uppercase tracking-widest flex items-center gap-2">
                  <Zap size={16} className="text-accent" /> Outcome Probability
                </h3>
                <Tooltip content="Probabilistic distribution of network health outcomes over the 30-day projection. Peak represents the most likely operational state." position="left">
                  <Info size={14} className="text-muted/30 hover:text-accent transition-colors cursor-help" />
                </Tooltip>
              </div>
              <div className="h-[200px] w-full" style={{ minWidth: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={aiAnalysis.distributionData}>
                    <defs>
                      <linearGradient id="distGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-accent)" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="var(--color-accent)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="value" stroke="var(--color-accent)" strokeWidth={3} fill="url(#distGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {aiAnalysis.outcomeReasoning && (
                <div className="mt-4 p-4 bg-card rounded-2xl border border-border">
                  <div className="text-[9px] font-black text-muted uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Brain size={12} className="text-accent" /> Stochastic Reasoning
                  </div>
                  <p className="text-[11px] font-bold text-primary leading-relaxed italic">"{aiAnalysis.outcomeReasoning}"</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                 <div className="flex flex-col">
                    <span className="text-[9px] font-black text-muted uppercase">Expected Value</span>
                    <span className="text-lg font-black text-primary">P50 Stable</span>
                 </div>
                 <div className="flex flex-col items-end">
                    <span className="text-[9px] font-black text-muted uppercase">Confidence</span>
                    <span className="text-lg font-black text-success">HIGH</span>
                 </div>
              </div>
           </div>

           {/* Strategies */}
           <div className="space-y-4">
             <h3 className="text-[10px] font-black text-muted uppercase tracking-widest px-2">Alternative Branching</h3>
             {aiAnalysis.strategies.map((s, i) => (
                <div key={i} className="bg-panel border border-border p-6 rounded-3xl hover:border-accent transition-all group relative overflow-hidden shadow-sm">
                   {s.label === aiAnalysis.recommendation.choice && (
                     <div className="absolute top-0 right-0 px-3 py-1 bg-success text-white text-[8px] font-black uppercase rounded-bl-xl">Optimal</div>
                   )}
                   <div className="flex justify-between items-start mb-3">
                     <span className="text-[10px] font-black text-accent uppercase tracking-widest">{s.label}</span>
                     <span className="text-[10px] font-black text-muted uppercase">
                        {s.confidenceScore > 1 ? s.confidenceScore : Math.round(s.confidenceScore * 100)}% Conf
                     </span>
                   </div>
                   <div className="text-lg font-black text-primary tracking-tight leading-tight group-hover:text-accent transition-colors">
                     {s.action}
                   </div>
                </div>
             ))}
           </div>
        </div>
      </div>
    </div>
  );
};
