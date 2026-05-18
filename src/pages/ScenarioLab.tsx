import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useChain } from '../context/ChainContext';
import { Link } from 'react-router-dom';
import { 
  Beaker, 
  Zap, 
  Send, 
  AlertTriangle, 
  ShieldAlert,
  Activity, 
  ArrowRight,
  Shield,
  Search,
  Globe,
  CheckCircle2,
  Clock,
  TrendingUp,
  Play,
  Pause,
  Square,
  SkipForward,
  LayoutGrid,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DigitalTwinMap } from '../components/DigitalTwinMap';
import { Tooltip } from '../components/Tooltip';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from 'recharts';
import { calculateBetweennessCentrality } from '../services/centralityService';

import { toast } from 'react-hot-toast';

const ShockCard = ({ label, prompt, description, onTrigger, isLoading }: any) => (
  <button 
    onClick={() => {
      toast.loading(`Deploying Shock: ${label}...`, { duration: 2000 });
      onTrigger(prompt);
    }}
    disabled={isLoading}
    className="glass-card p-8 text-left group flex flex-col gap-4 relative overflow-hidden"
  >
    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-all duration-500 group-hover:scale-110 group-hover:-rotate-12">
      <Zap size={100} className="text-accent" />
    </div>
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-accent/10 text-accent mb-2 group-hover:scale-110 transition-transform duration-500 shadow-inner border border-accent/20`}>
      <Zap size={28} fill="currentColor" className="drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
    </div>
    <div>
      <h3 className="text-xl font-black text-primary tracking-tight mb-2 uppercase italic group-hover:text-accent transition-colors">{label}</h3>
      <p className="text-xs text-muted leading-relaxed font-bold opacity-80">{description}</p>
    </div>
    <div className="mt-auto flex items-center gap-3 text-[10px] font-black uppercase text-accent tracking-[0.2em] opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500">
      Initialize Propagation <ArrowRight size={14} />
    </div>
  </button>
);

export const ScenarioLab = () => {
  const { 
    suppliers,
    warehouses,
    routes,
    theme,
    runSimulation, 
    isAiLoading, 
    aiAnalysis, 
    currentIteration,
    clearSimulation, 
    undo, 
    redo, 
    canUndo, 
    canRedo, 
    runCascadeSimulation, 
    autoHeal: originalAutoHeal,
    simulationHistory,
    showHeatmap,
    setShowHeatmap,
    showConfidenceRings,
    setShowConfidenceRings,
    lastAddedNews
  } = useChain();
  const [customPrompt, setCustomPrompt] = useState('');
  const [scrubDay, setScrubDay] = useState(1);
  const [hoveredNodeIds, setHoveredNodeIds] = useState<string[]>([]);
  const [hoveredRouteIds, setHoveredRouteIds] = useState<string[]>([]);
  const [selectedMapNode, setSelectedMapNode] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedStrategyIndices, setSelectedStrategyIndices] = useState<number[]>([]);
  const [viewMode, setViewMode] = useState<'baseline' | 'mitigated'>('baseline');
  const [autoHealReport, setAutoHealReport] = useState<string | null>(null);
  
  useEffect(() => {
    const injected = localStorage.getItem('injected_scenario');
    if (injected) {
      try {
        const { title, body } = JSON.parse(injected);
        setCustomPrompt(`${title}\n\n${body}`);
        localStorage.removeItem('injected_scenario');
        toast.success('Simulation buffer pre-filled from Intelligence Feed');
      } catch (e) {
        console.error('Failed to parse injected scenario', e);
      }
    }
  }, []);

  const playIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Centrality Scores
  const centralityScores = useMemo(() => {
    return calculateBetweennessCentrality([...suppliers, ...warehouses], routes);
  }, [suppliers, warehouses, routes]);

  // Portfolio Conflict Detection (Layer 6)
  const conflicts = useMemo(() => {
    if (selectedStrategyIndices.length < 2 || !aiAnalysis) return [];
    const chosen = selectedStrategyIndices.map(i => aiAnalysis.strategies[i].action.toLowerCase());
    const results = [];
    if (chosen.some(a => a.includes('reroute')) && chosen.some(a => a.includes('hold'))) {
      results.push('Route contradiction detected: Attempting to reroute while holding inventory at origin.');
    }
    if (chosen.some(a => a.includes('air')) && chosen.some(a => a.includes('sea'))) {
      results.push('Modal conflict: Simulating simultaneous Air and Sea transitions for same cluster.');
    }
    return results;
  }, [selectedStrategyIndices, aiAnalysis]);

  const toggleStrategy = (index: number) => {
    setSelectedStrategyIndices(prev => 
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
    setViewMode('mitigated');
  };

  const autoHeal = async () => {
    if (!aiAnalysis) return;
    
    // Feature 5: Intelligent Solver
    const bottlenecks = aiAnalysis.bottlenecks || [];
    
    // Find strategies that address bottlenecks and have high risk reduction
    const sortedStrats = [...aiAnalysis.strategies]
      .map((s, i) => ({ ...s, index: i }))
      .sort((a, b) => (b.riskReductionValue || 0) - (a.riskReductionValue || 0));
    
    const selected: number[] = [];
    const selectedActions: string[] = [];
    
    sortedStrats.forEach(s => {
      const actionLower = s.action.toLowerCase();
      // Check for conflicts
      let hasConflict = false;
      if (actionLower.includes('reroute') && selectedActions.some(a => a.includes('hold'))) hasConflict = true;
      if (actionLower.includes('hold') && selectedActions.some(a => a.includes('reroute'))) hasConflict = true;
      
      if (!hasConflict && selected.length < 2) {
        selected.push(s.index);
        selectedActions.push(actionLower);
      }
    });

    setSelectedStrategyIndices(selected);
    setViewMode('mitigated');
    setAutoHealReport(`Optimization Solver applied: ${selected.map(i => aiAnalysis.strategies[i].label).join(' + ')}. Targeted bottleneck relief at ${bottlenecks.slice(0, 2).join(', ') || 'Global Network'}.`);
    
    setTimeout(() => setAutoHealReport(null), 8000);
  };

  // Auto-playback logic
  useEffect(() => {
    if (isPlaying) {
      playIntervalRef.current = setInterval(() => {
        setScrubDay(prev => {
          if (prev >= 30) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 500); // 500ms per simulated day
    } else {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    }
    return () => {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    };
  }, [isPlaying]);

  const togglePlay = () => setIsPlaying(!isPlaying);
  const stopPlay = () => {
    setIsPlaying(false);
    setScrubDay(1);
  };

  const parseOnset = (onset: string): number => {
    const match = onset.match(/\d+/);
    return match ? parseInt(match[0]) : 1;
  };

  const getInterpolatedImpact = (day: number): number => {
    if (!aiAnalysis || !aiAnalysis.timelineProjection || aiAnalysis.timelineProjection.length === 0) {
      return aiAnalysis?.totalImpact || 0;
    }
    const sorted = [...aiAnalysis.timelineProjection].sort((a, b) => a.day - b.day);
    
    if (day <= sorted[0].day) return sorted[0].impactLevel;
    if (day >= sorted[sorted.length - 1].day) return sorted[sorted.length - 1].impactLevel;
    
    const nextIdx = sorted.findIndex(p => p.day > day);
    const prev = sorted[nextIdx - 1];
    const next = sorted[nextIdx];
    
    if (!prev || !next) return aiAnalysis.totalImpact || 0;
    
    const range = next.day - prev.day;
    const weight = (day - prev.day) / (range || 1);
    
    return prev.impactLevel + (next.impactLevel - prev.impactLevel) * weight;
  };

  const getTimelinePointDescription = (day: number): string => {
    if (!aiAnalysis) return "";
    const sorted = [...aiAnalysis.timelineProjection].sort((a, b) => b.day - a.day);
    const point = sorted.find(p => p.day <= day) || sorted[sorted.length - 1];
    return point?.description || "";
  };

  const mitigationMultiplier = useMemo(() => {
    if (viewMode === 'baseline' || selectedStrategyIndices.length === 0 || !aiAnalysis) return 1.0;
    
    const reductions = selectedStrategyIndices.map(i => (aiAnalysis.strategies[i].confidenceScore || 50) / 100);
    const combinedReduction = Math.min(0.85, (reductions.reduce((a, b) => a + b, 0) / (reductions.length || 1)) * 0.9);
    return 1.0 - combinedReduction;
  }, [viewMode, selectedStrategyIndices, aiAnalysis]);

  const maxImpactRaw = aiAnalysis ? Math.max(...aiAnalysis.timelineProjection.map(p => p.impactLevel), 80) : 100;
  const currentTimelineImpact = getInterpolatedImpact(scrubDay) * mitigationMultiplier;
  // Intensity normalized to the maximum projected impact to show relative strain profile
  const globalIntensity = Math.min(1.0, currentTimelineImpact / (maxImpactRaw * 1.1)); 

  // Compute disruptions that are active on this specific day
  const dynamicDisruptions = useMemo(() => {
    if (!aiAnalysis) return [];
    
    const combinedMap: Record<string, any> = {};

    // 1. Start with initial primary disruptions
    aiAnalysis.simDisruptions.forEach(d => {
      // Primary shock grows from 30% to 120% of its base severity over the timeline
      const factor = 0.3 + (globalIntensity * 0.9);
      combinedMap[d.targetId] = {
        ...d,
        severity: Math.min(100, (d.severity || 0.5) * 100 * factor)
      };
    });

    // 2. Add secondary/cascade nodes only if scrubDay >= onset
    aiAnalysis.secondaryEvents.forEach(event => {
      const onsetDay = parseOnset(event.onset);
      if (scrubDay >= onsetDay) {
        // As time passes after onset, the secondary impact grows significantly
        const daysSinceOnset = scrubDay - onsetDay;
        // Starts at 20% power on onset day, reaches 100% in 7 days
        const maturityFactor = Math.min(1.0, 0.2 + (daysSinceOnset / 7)); 
        
        event.threatenedNodes.forEach(nodeId => {
          const sev = (event.probability || 50) * globalIntensity * maturityFactor;
          if (combinedMap[nodeId]) {
            combinedMap[nodeId].severity = Math.min(100, combinedMap[nodeId].severity + sev);
            if (!combinedMap[nodeId].description.includes(event.title)) {
              combinedMap[nodeId].description += ` | Cascade: ${event.title}`;
            }
          } else {
            combinedMap[nodeId] = {
              id: `cascade-${event.title}-${nodeId}`,
              targetType: 'node',
              targetId: nodeId,
              severity: sev,
              description: `Secondary impact: ${event.title}${viewMode === 'mitigated' ? ' (Mitigated)' : ''}`
            };
          }
        });
      }
    });

    return Object.values(combinedMap);
  }, [aiAnalysis, scrubDay, globalIntensity, viewMode]);

  const activeAffectedNodeIds = useMemo(() => {
    return dynamicDisruptions
      .filter(d => d.targetType === 'node' && d.severity > 5)
      .map(d => d.targetId);
  }, [dynamicDisruptions]);

  const presets = [
    { 
      label: 'Panama Drought', 
      prompt: 'Simulate 50% reduction in Panama Canal transit capacity due to drought, affecting US East Coast and EU sea routes.',
      description: 'Severe water level drop in Lake Gatún restricts transit slots, causing major sea route detours.'
    },
    { 
      label: 'Silicon Shock', 
      prompt: 'Tier 2 supplier insolvency in Taiwan leading to 30% reduction in chip availability for Shenzhen factory.',
      description: 'Upstream supply chain failure impacts downstream manufacturing output and lead times.'
    },
    { 
      label: 'Cyber Lockdown', 
      prompt: 'State-sponsored cyber attack on Rotterdam port infrastructure, causing 14-day total operations blackout.',
      description: 'Complete digital infrastructure paralysis at Europe’s largest port, freezing all ingress/egress.'
    }
  ];

  const handleRun = (p?: string) => {
    if (isAiLoading) return;
    const text = p || customPrompt;
    if (!text || !text.trim()) return;
    runSimulation(text);
    setCustomPrompt('');
  };

  const auditTrail = aiAnalysis?.auditTrail || [];

  return (
    <div className="flex-1 overflow-y-auto h-full p-6 max-w-[1600px] mx-auto pb-32 space-y-10">
      {/* Convergence Progress Indicator (Layer 4) */}
      <AnimatePresence>
        {isAiLoading && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed top-8 left-1/2 -translate-x-1/2 z-[2000] bg-panel/90 backdrop-blur-xl border border-accent/30 p-4 rounded-2xl shadow-2xl flex items-center gap-6 min-w-[320px]"
          >
             <div className="relative w-10 h-10">
                <div className="absolute inset-0 border-4 border-accent/20 rounded-full"></div>
                <motion.div 
                  className="absolute inset-0 border-4 border-accent border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />
             </div>
             <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                   <span className="text-[10px] font-black text-accent uppercase tracking-widest italic">Neural Loop Processing</span>
                   <span className="text-[10px] font-bold text-muted italic">Iteration {currentIteration || 0}/3</span>
                </div>
                <div className="w-full h-1 bg-border rounded-full overflow-hidden">
                   <motion.div 
                     className="h-full bg-accent"
                     animate={{ width: `${((currentIteration || 0) / 3) * 100}%` }}
                   />
                </div>
                <p className="text-[9px] text-primary/70 font-black uppercase tracking-tighter mt-1">LLM 1 Modeling world &rarr; LLM 2 Critiquing Logic...</p>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 bg-panel p-8 rounded-[2.5rem] border border-border shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 rounded-full -mr-48 -mt-48 blur-3xl" />
        <div className="space-y-3 max-w-2xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-[9px] font-black uppercase tracking-widest">
            <Beaker size={12} /> Digital Twin Testbed
          </div>
          <h1 className="text-5xl font-extrabold text-primary tracking-tight">Scenario <span className="text-accent">Laboratory</span></h1>
          <p className="text-muted font-bold leading-relaxed opacity-60 uppercase tracking-wide text-[10px]">
            Stress-test logistics resilience by propagating operational shocks through the digital twin.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 bg-card border border-border p-2 rounded-2xl shrink-0 relative z-10">
           <button 
             onClick={undo} 
             disabled={!canUndo}
             className="px-4 py-2 text-[10px] font-black uppercase text-primary hover:bg-panel rounded-xl disabled:opacity-30 transition-all border border-border shadow-sm"
           >
             Undo
           </button>
           <button 
             onClick={redo} 
             disabled={!canRedo}
             className="px-4 py-2 text-[10px] font-black uppercase text-primary hover:bg-panel rounded-xl disabled:opacity-30 transition-all border border-border shadow-sm"
           >
             Redo
           </button>
           <div className="w-px h-6 bg-border mx-1" />
           <button 
             onClick={clearSimulation}
             className="px-4 py-2 text-[10px] font-black uppercase text-error hover:bg-error/10 rounded-xl transition-all border border-error/20"
           >
             Hard Reset
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {presets.map(p => (
          <ShockCard key={p.label} {...p} onTrigger={handleRun} isLoading={isAiLoading} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-panel border-2 border-border p-8 rounded-[2.5rem] shadow-2xl space-y-6 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-3 h-full bg-accent transition-all duration-500 group-hover:w-4" />
            
            <div className="space-y-6 relative z-10">
              <div className="flex flex-col gap-1">
                <h3 className="text-2xl font-extrabold text-primary tracking-tight uppercase">Shock <span className="text-accent underline underline-offset-8">Propagator</span></h3>
                <p className="text-[10px] text-muted font-bold tracking-tight opacity-60 uppercase">Intervention Injection System</p>
              </div>

              <div className="flex flex-col gap-6">
                <div className="relative group/textarea">
                  <div className="absolute -inset-2 bg-accent/5 rounded-[2.5rem] blur opacity-0 group-focus-within/textarea:opacity-100 transition-all duration-700" />
                  <textarea 
                    className="relative w-full bg-card/40 backdrop-blur-xl border-2 border-border rounded-[2rem] p-8 text-sm text-primary focus:border-accent focus:bg-card/60 outline-none transition-all placeholder:text-muted/40 font-bold min-h-[200px] resize-none leading-relaxed shadow-inner"
                    placeholder="Describe a complex supply chain disruption scenario... (e.g. 'Simulate a 48-hour rail strike in Germany combined with a 15% increase in heavy-freight fuel costs...')"
                    value={customPrompt}
                    onChange={e => setCustomPrompt(e.target.value)}
                    disabled={isAiLoading}
                  />
                  <div className="absolute top-8 right-8 flex items-center gap-3 pointer-events-none opacity-20 group-focus-within/textarea:opacity-0 transition-opacity">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Ready for Injection</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-6 px-4">
                  <div className="flex flex-wrap items-center gap-6 text-[9px] font-black uppercase text-muted tracking-widest opacity-60">
                      <div className="flex items-center gap-2">
                        <div className="p-1 rounded bg-accent/10">
                          <Activity size={12} className="text-accent" />
                        </div>
                        Ripple Analysis
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="p-1 rounded bg-accent/10">
                          <Shield size={12} className="text-accent" />
                        </div>
                        Probabilistic Shielding
                      </div>
                  </div>

                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    {customPrompt && (
                      <button 
                        onClick={() => setCustomPrompt('')}
                        className="text-[10px] font-black uppercase text-muted hover:text-error transition-colors px-4 py-3 tracking-widest"
                      >
                        Reset Buffer
                      </button>
                    )}
                    <button 
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          toast.loading('Initializing neural propagation simulation...', { duration: 3000 });
                          handleRun();
                        }}
                        disabled={isAiLoading || !customPrompt.trim()}
                        className="flex-1 sm:flex-none bg-accent text-white px-12 py-5 rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] flex items-center justify-center gap-4 hover:bg-accent/90 disabled:opacity-50 transition-all shadow-2xl shadow-accent/40 active:scale-95 group"
                    >
                      {isAiLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          Pulse Simulation
                          <Send size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <div className="bg-panel border-2 border-border p-8 rounded-[2rem] space-y-8 shadow-sm">
            <h3 className="text-[11px] font-black text-muted uppercase tracking-[0.2em] mb-2 px-2">Operational Controls</h3>
                  <div className="grid gap-4">
                     <button 
                       onClick={runCascadeSimulation}
                       disabled={isAiLoading}
                       className="flex items-center justify-between p-5 bg-card hover:bg-accent/10 border-2 border-border/60 hover:border-accent rounded-2xl transition-all group overflow-hidden relative"
                     >
                       <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 rounded-full -mr-12 -mt-12 transition-transform duration-500 group-hover:scale-150" />
                       <div className="flex items-center gap-4 relative z-10">
                          <div className="p-2 rounded-xl bg-accent text-white shadow-lg shadow-accent/20">
                            <Activity size={18} />
                          </div>
                          <span className="text-[11px] font-black uppercase tracking-widest text-primary">Cascade Engine</span>
                       </div>
                       <ArrowRight size={16} className="text-muted group-hover:text-accent transition-all group-hover:translate-x-2 relative z-10" />
                     </button>
                     
                     <div className="space-y-3">
                        <button 
                          onClick={autoHeal}
                          disabled={!aiAnalysis || isAiLoading}
                          className="w-full flex items-center justify-between p-5 bg-card hover:bg-success/10 border-2 border-border/60 hover:border-success rounded-2xl transition-all group disabled:opacity-50 relative overflow-hidden"
                        >
                          <div className="absolute top-0 right-0 w-24 h-24 bg-success/5 rounded-full -mr-12 -mt-12 transition-transform duration-500 group-hover:scale-150" />
                          <div className="flex items-center gap-4 relative z-10">
                             <div className="p-2 rounded-xl bg-success text-white shadow-lg shadow-success/20">
                              <Zap size={18} />
                             </div>
                             <span className="text-[11px] font-black uppercase tracking-widest text-primary">Autonomic Solver</span>
                          </div>
                          <ArrowRight size={16} className="text-muted group-hover:text-success transition-all group-hover:translate-x-2 relative z-10" />
                        </button>
                        
                        <AnimatePresence>
                          {autoHealReport && (
                            <motion.div 
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              className="p-4 bg-success/5 border-2 border-success/20 rounded-2xl flex items-start gap-4"
                            >
                              <div className="p-1.5 rounded-lg bg-success/10 text-success">
                                <Shield size={14} />
                              </div>
                              <div>
                                <div className="text-[9px] font-black text-success uppercase tracking-[0.2em] mb-1">Solver Insights</div>
                                <p className="text-[10px] text-muted font-bold italic leading-relaxed">{autoHealReport}</p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                     </div>
                  </div>
          </div>

          <div className="bg-panel border-2 border-border p-8 rounded-[2rem] space-y-8 flex flex-col shadow-sm">
            <h3 className="text-[11px] font-black text-muted uppercase tracking-[0.2em] px-2 flex items-center justify-between">
              Propagation History
              <span className="text-[9px] bg-card px-2 py-0.5 rounded-full opacity-60 font-mono tracking-normal">{simulationHistory.length}</span>
            </h3>
            <div className="flex-1 overflow-y-auto space-y-4 pr-3 custom-scrollbar max-h-[400px]">
              {simulationHistory.length === 0 ? (
                <div className="text-center py-16 text-muted italic text-[11px] border-2 border-dashed border-border rounded-3xl opacity-50 font-black uppercase tracking-widest">Buffer Empty</div>
              ) : (
                simulationHistory.map((sim, i) => (
                  <div key={i} className="p-5 bg-card rounded-2xl border border-border border-l-4 border-l-accent hover:border-accent group transition-all cursor-default">
                    <div className="flex items-center justify-between mb-2">
                       <span className="text-[10px] font-black text-accent uppercase tracking-widest">Vector {simulationHistory.length - i}</span>
                       <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                         sim.riskLevel === 'CRITICAL' ? 'bg-error/10 text-error' : 'bg-accent/10 text-accent'
                       }`}>{sim.riskLevel}</span>
                    </div>
                    <p className="text-[11px] font-bold text-primary line-clamp-3 leading-snug group-hover:text-accent transition-colors">"{sim.summary}"</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isAiLoading && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="py-20 flex flex-col items-center gap-6"
          >
            <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin" />
            <div className="text-center space-y-2">
              <div className="text-lg font-black text-primary uppercase tracking-widest animate-pulse">Running Multi-Layered Simulation</div>
              <p className="text-sm text-muted font-medium">Calculating second-order impacts and probabilistic node failures...</p>
            </div>
          </motion.div>
        )}

        {aiAnalysis && !isAiLoading && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-8"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-primary tracking-tight flex items-center gap-3 uppercase">
                <Activity size={24} className="text-accent" /> Intelligence Assessment
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <section className="lg:col-span-8 bg-panel border border-border p-8 rounded-[2rem] space-y-6">
                <div className="flex items-center justify-between">
                  <div className={`px-4 py-1.5 rounded-full text-xs font-black uppercase border ${
                    aiAnalysis.riskLevel === 'CRITICAL' ? 'bg-error/10 text-error border-error/20 underline shadow-[0_0_12px_rgba(239,68,68,0.2)]' :
                    aiAnalysis.riskLevel === 'HIGH' ? 'bg-warning/10 text-warning border-warning/20' :
                    aiAnalysis.riskLevel === 'MEDIUM' ? 'bg-accent/10 text-accent border-accent/20' :
                    'bg-success/10 text-success border-success/20'
                  }`}>
                    {aiAnalysis.riskLevel} Global Risk Level
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-[10px] font-black text-muted uppercase tracking-widest flex items-center gap-2">
                      <Activity size={14} className="text-secondary" /> 
                      Freshness: {Math.round(aiAnalysis.confidenceScore * 100)}%
                    </div>
                    <div className="text-[10px] font-black text-muted uppercase tracking-widest flex items-center gap-2">
                      <Shield size={14} /> Neural-Stochastic
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                   <div className="text-2xl font-black text-primary leading-tight tracking-tight italic">
                     "{aiAnalysis.summary}"
                   </div>
                   <div className="p-4 bg-secondary/5 border border-secondary/10 rounded-2xl">
                      <div className="text-[9px] font-black text-secondary uppercase tracking-widest mb-1 flex items-center gap-2">
                        <CheckCircle2 size={12} /> Explainability: The "Why"
                      </div>
                      <p className="text-[11px] text-muted font-bold leading-relaxed italic">
                        The neural loop identified ${aiAnalysis.convergenceStatus === 'converged' ? 'converged' : 'stabilized'} state. This recommendation is based on ${aiAnalysis.iterationCount} iterations of stress propagation, correcting for over-weighted bottlenecks in the ${aiAnalysis.riskLevel.toLowerCase()} zone.
                      </p>
                   </div>
                </div>

                {aiAnalysis.outcomeReasoning && (
                  <div className="p-4 bg-card rounded-2xl border border-border border-l-4 border-l-accent">
                    <div className="text-[10px] font-black text-muted uppercase tracking-widest mb-1">Stochastic Analysis Reasoning</div>
                    <p className="text-[11px] font-bold text-primary italic leading-relaxed">
                      {aiAnalysis.outcomeReasoning}
                    </p>
                  </div>
                )}

                {/* Timeline reasoning milestones */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-accent" />
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest">Critical Timeline Milestones</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {aiAnalysis.timelineProjection.filter((_, i) => i === 0 || i === 7 || i === 14 || i === 29).map((point, i) => (
                      <button 
                        key={i} 
                        onClick={() => setScrubDay(point.day)}
                        className={`p-3 rounded-xl border flex items-start gap-3 transition-all text-left ${scrubDay === point.day ? 'bg-accent/10 border-accent' : 'bg-card border-border hover:border-accent/40'}`}
                      >
                        <div className="text-[10px] font-black text-accent shrink-0 mt-0.5">T+{point.day}</div>
                        <div className="space-y-1">
                          <div className="text-[10px] font-black text-primary uppercase">{point.impactLevel}% Severity</div>
                          <p className="text-[10px] text-muted font-medium leading-tight">{point.description}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Cascade Deep Analysis Summary */}
                {aiAnalysis.secondaryEvents?.length > 0 && (
                  <div className="space-y-4 pt-4 border-t border-border">
                    <div className="flex items-center gap-2">
                      <ShieldAlert size={16} className="text-warning" />
                      <span className="text-[10px] font-black text-primary uppercase tracking-widest">Cascade Intelligence Summary</span>
                    </div>
                    <div className="flex flex-col gap-2">
                       {aiAnalysis.secondaryEvents.slice(0, 3).map((event, i) => (
                         <div 
                           key={i} 
                           onMouseEnter={() => setHoveredNodeIds(event.threatenedNodes)}
                           onMouseLeave={() => setHoveredNodeIds([])}
                           className="flex items-center justify-between p-3 bg-card rounded-xl border border-border group hover:border-accent transition-all cursor-crosshair"
                         >
                           <div className="flex items-center gap-3">
                              <div className="w-1.5 h-1.5 rounded-full bg-accent group-hover:scale-150 transition-transform" />
                              <span className="text-[11px] font-bold text-primary">{event.title}</span>
                              <span className="text-[8px] font-black text-muted uppercase">({event.category})</span>
                           </div>
                           <span className="text-[10px] font-black text-accent">{event.probability}% Prob</span>
                         </div>
                       ))}
                    </div>
                  </div>
                )}

                {/* Audit Trail (Layer 7) */}
                <div className="space-y-4 pt-6 border-t border-border">
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-muted" />
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest">Neural Convergence Audit Trail</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    {auditTrail.map((log, i) => (
                      <div key={i} className="flex gap-4 p-3 bg-card rounded-xl border border-border">
                        <div className="text-[10px] font-black text-accent mt-0.5">#{log.iteration}</div>
                        <div className="flex-1 space-y-1">
                          <div className="text-[10px] font-black text-primary uppercase tracking-tight">{log.modification}</div>
                          <p className="text-[9px] text-muted font-medium italic">{log.reason}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Simulation Visualization Map */}
                <div className="space-y-6 pt-6 border-t border-border">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <Globe className="text-accent" size={16} />
                        <span className="text-[10px] font-black text-primary uppercase tracking-widest">Digital Twin Propagation Map</span>
                      </div>
                      {getTimelinePointDescription(scrubDay) && (
                        <div className="text-[10px] font-bold text-muted mt-1 uppercase tracking-tight flex items-center gap-2">
                          <span>Day {scrubDay}: {getTimelinePointDescription(scrubDay)}</span>
                          {viewMode === 'mitigated' && selectedStrategyIndices.length > 0 && (
                        <div className="flex items-center gap-2 mt-1">
                          {selectedStrategyIndices.map(idx => (
                            <div key={idx} className="flex items-center gap-1.5 px-2 py-0.5 bg-secondary/10 border border-secondary/20 rounded-full text-secondary animate-pulse">
                              <Shield size={10} />
                              <span>{aiAnalysis.strategies[idx].label} ACTIVE</span>
                            </div>
                          ))}
                        </div>
                      )}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 bg-panel p-1 rounded-2xl border border-border shadow-inner">
                      <button 
                        onClick={() => setViewMode('baseline')}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${viewMode === 'baseline' ? 'bg-error text-white shadow-[0_0_12px_rgba(239,68,68,0.3)]' : 'text-muted hover:text-primary'}`}
                      >
                        Baseline
                      </button>
                      <button 
                        onClick={() => setViewMode('mitigated')}
                        disabled={selectedStrategyIndices.length === 0}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-2 ${viewMode === 'mitigated' ? 'bg-secondary text-white shadow-[0_0_12px_rgba(16,185,129,0.3)]' : 'text-muted hover:text-primary disabled:opacity-30'}`}
                      >
                        <Shield size={12} />
                        Mitigated
                      </button>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="flex flex-col items-end">
                        <div className="flex items-center gap-2">
                           <span className={`text-[10px] font-black ${viewMode === 'mitigated' ? 'text-secondary line-through opacity-50' : 'text-primary'}`}>{Math.round(getInterpolatedImpact(scrubDay))}%</span>
                           {viewMode === 'mitigated' && (
                             <span className="text-[10px] font-black text-secondary">
                               {Math.round(currentTimelineImpact)}%
                             </span>
                           )}
                        </div>
                        <span className="text-[8px] font-bold text-muted uppercase">Global Stress</span>
                      </div>
                      <div className="flex flex-col items-end border-l border-border pl-6">
                        <span className="text-[10px] font-black text-primary">T+{scrubDay} DAYS</span>
                        <span className="text-[8px] font-bold text-muted uppercase">Sim Clock</span>
                      </div>
                    </div>
                  </div>

                  <div className="h-[650px] rounded-[2.5rem] overflow-hidden border border-border shadow-inner relative group bg-card">
                    <DigitalTwinMap 
                      suppliers={suppliers}
                      warehouses={warehouses}
                      routes={routes}
                      disruptions={dynamicDisruptions}
                      scrubDay={scrubDay}
                      globalIntensity={globalIntensity}
                      showHeatmap={showHeatmap}
                      centralityScores={centralityScores}
                      showConfidenceRings={showConfidenceRings}
                      clusters={aiAnalysis?.simResults?.clusters || []}
                      highlightNodeIds={[...activeAffectedNodeIds, ...hoveredNodeIds, ...(lastAddedNews?.affectedNodes || [])]}
                      onNodeClick={setSelectedMapNode}
                      theme={theme}
                      height="650px"
                    />

                    {/* Feature 1: Map Controls Overlay */}
                    <div className="absolute top-6 right-6 z-[1000] flex flex-col gap-2">
                       <button 
                         onClick={() => setShowHeatmap(!showHeatmap)}
                         className={`p-3 rounded-xl border backdrop-blur-md transition-all flex items-center gap-2 group shadow-lg ${showHeatmap ? 'bg-accent text-white border-accent' : 'bg-panel/80 text-muted border-border hover:text-primary'}`}
                       >
                         <Activity size={16} />
                         <span className="text-[10px] font-black uppercase tracking-tight">Heatmap</span>
                       </button>
                       <button 
                         onClick={() => setShowConfidenceRings(!showConfidenceRings)}
                         className={`p-3 rounded-xl border backdrop-blur-md transition-all flex items-center gap-2 group shadow-lg ${showConfidenceRings ? 'bg-warning text-white border-warning' : 'bg-panel/80 text-muted border-border hover:text-primary'}`}
                       >
                         <Clock size={16} />
                         <span className="text-[10px] font-black uppercase tracking-tight">Confidence</span>
                       </button>
                    </div>

                    {/* Timeline Interaction Scrubber */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-2xl z-[1000] p-4 bg-panel/90 backdrop-blur-xl rounded-2xl border border-border shadow-2xl flex items-center gap-6">
                       <div className="flex items-center gap-2 border-r border-border pr-6">
                         <button 
                           onClick={togglePlay}
                           className="w-10 h-10 flex items-center justify-center bg-accent text-white rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all"
                         >
                           {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
                         </button>
                         <button 
                           onClick={stopPlay}
                           className="w-10 h-10 flex items-center justify-center bg-card text-muted hover:text-primary rounded-xl border border-border transition-all"
                         >
                           <Square size={16} fill="currentColor" />
                         </button>
                         <button 
                           onClick={() => setScrubDay(prev => Math.min(30, prev + 1))}
                           className="w-10 h-10 flex items-center justify-center bg-card text-muted hover:text-primary rounded-xl border border-border transition-all"
                         >
                           <SkipForward size={16} fill="currentColor" />
                         </button>
                       </div>

                       <div className="flex-1 space-y-2">
                          <input 
                            type="range" 
                            min="1" 
                            max="30" 
                            value={scrubDay} 
                            onChange={(e) => setScrubDay(parseInt(e.target.value))}
                            className="w-full h-1.5 bg-border rounded-lg appearance-none cursor-pointer accent-accent"
                          />
                          <div className="flex justify-between px-1">
                            {[1, 7, 14, 21, 30].map(d => (
                              <button 
                                key={d} 
                                onClick={() => setScrubDay(d)}
                                className={`text-[8px] font-black uppercase tracking-tighter transition-colors ${scrubDay === d ? 'text-accent' : 'text-muted'}`}
                              >
                                Day {d}
                              </button>
                            ))}
                          </div>
                       </div>
                       <div className="w-12 text-center">
                         <span className="text-[11px] font-black text-primary">Day {scrubDay}</span>
                       </div>
                    </div>

                    {/* Node Detal Overlay */}
                    <AnimatePresence>
                      {selectedMapNode && (
                        <motion.div 
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          className="absolute top-6 right-6 w-72 z-[1001] p-6 bg-panel/95 backdrop-blur-2xl rounded-3xl border border-border shadow-2xl space-y-4"
                        >
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-black text-primary uppercase tracking-widest italic">Node Intelligence</h4>
                            <button onClick={() => setSelectedMapNode(null)} className="text-muted hover:text-primary transition-colors text-lg">&times;</button>
                          </div>
                          <div className="p-4 bg-card rounded-2xl border border-border">
                            <div className="text-[10px] font-black text-accent uppercase mb-1">Entity ID: {selectedMapNode}</div>
                            <div className="text-sm font-black text-primary truncate">
                              {[...suppliers, ...warehouses].find(n => n.id === selectedMapNode)?.name || 'Unknown Node'}
                            </div>
                          </div>
                          <div className="space-y-2">
                             <div className="text-[9px] font-black text-muted uppercase tracking-widest">Simulated Vulnerability</div>
                             <div className="flex items-center gap-2">
                                <div className="flex-1 h-2 bg-border rounded-full overflow-hidden">
                                   <div 
                                     className="h-full bg-accent transition-all duration-300" 
                                     style={{ 
                                       width: `${dynamicDisruptions.find(d => d.targetId === selectedMapNode)?.severity || 0}%`,
                                       backgroundColor: dynamicDisruptions.find(d => d.targetId === selectedMapNode)?.severity ? (dynamicDisruptions.find(d => d.targetId === selectedMapNode)!.severity > 70 ? '#ef4444' : '#f59e0b') : '#10b981'
                                     }} 
                                   />
                                </div>
                                <span className="text-[10px] font-bold text-primary">
                                  {dynamicDisruptions.find(d => d.targetId === selectedMapNode) ? (dynamicDisruptions.find(d => d.targetId === selectedMapNode)!.severity > 70 ? 'CRITICAL' : 'STRESSED') : 'OPTIMAL'}
                                </span>
                             </div>
                          </div>
                          <div className="pt-2 border-t border-border">
                             <p className="text-[10px] text-muted font-medium italic">
                               {dynamicDisruptions.find(d => d.targetId === selectedMapNode)?.description || "Node maintains structural integrity despite network stress."}
                             </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="absolute top-6 left-6 z-[1000] space-y-2">
                      {/* Network Strain Overlay */}
                      <div className="p-4 bg-panel/90 backdrop-blur-2xl rounded-2xl border border-border shadow-2xl min-w-[180px] space-y-2">
                        <div className="flex items-center justify-between text-[8px] font-black text-muted uppercase tracking-widest group/strain">
                          <div className="flex items-center gap-1">
                            <span>Network Strain</span>
                            <Tooltip content="Composite load index across the entire logistics network. 100% represents theoretical max capacity." position="top">
                              <Info size={10} className="text-muted/40 hover:text-muted transition-colors cursor-help" />
                            </Tooltip>
                          </div>
                          <span className={globalIntensity > 0.8 ? 'text-error' : 'text-accent'}>{Math.round(globalIntensity * 100)}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-card rounded-full overflow-hidden">
                          <motion.div 
                            className={`h-full ${globalIntensity > 0.8 ? 'bg-error' : 'bg-accent'}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, globalIntensity * 100)}%` }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                          />
                        </div>
                        <div className={`text-[8px] font-black uppercase tracking-tighter ${globalIntensity > 0.8 ? 'text-error animate-pulse' : 'text-muted'}`}>
                          {globalIntensity > 0.8 ? 'CRITICAL LOADS DETECTED' : 'SYSTEM UNDER ADAPTIVE STRESS'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4 pt-6 border-t border-border">
                  <div className="flex flex-col gap-2 p-5 bg-card rounded-2xl border border-border hover:border-success/30 transition-all">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black text-success uppercase tracking-widest">Best Case Path</span>
                      <span className="text-[9px] font-black text-muted bg-white/5 px-2 py-1 rounded">Confidence: {(aiAnalysis.scenarioBreakdown?.best?.confidence ?? 0) > 1 ? aiAnalysis.scenarioBreakdown.best.confidence : Math.round((aiAnalysis.scenarioBreakdown?.best?.confidence ?? 0) * 100)}%</span>
                    </div>
                    <p className="text-sm text-primary font-medium leading-relaxed">{aiAnalysis.scenarioBreakdown.best.desc}</p>
                  </div>
                  <div className="flex flex-col gap-2 p-5 bg-card/60 rounded-2xl border border-accent/20 hover:scale-[1.02] transition-all cursor-default shadow-lg shadow-accent/5">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black text-accent uppercase tracking-widest">Expected Recovery (P50)</span>
                      <span className="text-[9px] font-black text-muted bg-white/5 px-2 py-1 rounded">Confidence: {(aiAnalysis.scenarioBreakdown?.expected?.confidence ?? 0) > 1 ? aiAnalysis.scenarioBreakdown.expected.confidence : Math.round((aiAnalysis.scenarioBreakdown?.expected?.confidence ?? 0) * 100)}%</span>
                    </div>
                    <p className="text-sm text-primary font-medium leading-relaxed">{aiAnalysis.scenarioBreakdown.expected.desc}</p>
                  </div>
                  <div className="flex flex-col gap-2 p-5 bg-card rounded-2xl border border-border hover:border-error/30 transition-all">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black text-error uppercase tracking-widest">Worst Case Path</span>
                      <span className="text-[9px] font-black text-muted bg-white/5 px-2 py-1 rounded">Confidence: {(aiAnalysis.scenarioBreakdown?.worst?.confidence ?? 0) > 1 ? aiAnalysis.scenarioBreakdown.worst.confidence : Math.round((aiAnalysis.scenarioBreakdown?.worst?.confidence ?? 0) * 100)}%</span>
                    </div>
                    <p className="text-sm text-primary font-medium leading-relaxed">{aiAnalysis.scenarioBreakdown.worst.desc}</p>
                  </div>
                </div>
              </section>

              <section className="lg:col-span-4 space-y-6">
                <div className="bg-panel border border-border p-8 rounded-[2rem] shadow-xl">
                    <div className="flex items-center justify-between mb-6">
                     <h3 className="text-sm font-black text-primary uppercase tracking-widest flex items-center gap-2">
                       <CheckCircle2 size={16} className="text-accent" /> Pareto Frontier (Optimization)
                     </h3>
                     <Tooltip content="Analysis of intervention efficiency. Points closer to the top-left corner represent higher risk reduction for lower cost." position="left">
                        <Info size={14} className="text-muted/30 hover:text-accent transition-colors cursor-help" />
                     </Tooltip>
                    </div>

                   {/* Feature 4: Pareto Scatter Plot */}
                   <div className="h-48 mb-8 bg-card rounded-2xl border border-border p-4 relative overflow-hidden">
                      <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px]" />
                      <ResponsiveContainer width="100%" height="100%">
                        <ScatterChart margin={{ top: 10, right: 10, bottom: 20, left: -20 }}>
                          <XAxis 
                            type="number" 
                            dataKey="cost" 
                            name="Cost" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 8, fill: 'var(--color-muted)', fontWeight: 'bold' }}
                            label={{ value: 'IMPLEMENTATION COST', position: 'bottom', fontSize: 7, fill: 'var(--color-muted)', fontWeight: 'black', offset: 10 }}
                          />
                          <YAxis 
                            type="number" 
                            dataKey="riskReductionValue" 
                            name="Efficiency" 
                            axisLine={false} 
                            tickLine={false}
                            tick={{ fontSize: 8, fill: 'var(--color-muted)', fontWeight: 'bold' }}
                            label={{ value: 'RISK REDUCTION', angle: -90, position: 'left', fontSize: 7, fill: 'var(--color-muted)', fontWeight: 'black', offset: 0 }}
                          />
                          <RechartsTooltip 
                            cursor={{ strokeDasharray: '3 3' }}
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                return (
                                  <div className="bg-panel border border-accent p-3 rounded-xl shadow-2xl">
                                    <div className="text-[10px] font-black text-accent uppercase mb-1">{data.label}</div>
                                    <div className="text-[9px] font-bold text-primary">Cost: ${data.cost}k</div>
                                    <div className="text-[9px] font-bold text-primary">Reduction: {data.riskReductionValue}%</div>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Scatter name="Strategies" data={aiAnalysis.strategies} onClick={(data) => toggleStrategy(aiAnalysis.strategies.findIndex(s => s.label === data.label))}>
                            {aiAnalysis.strategies.map((entry, index) => {
                              const isEfficient = entry.riskReductionValue > 70 && entry.cost < 60;
                              const isSelected = selectedStrategyIndices.includes(index);
                              return (
                                <Cell 
                                  key={`cell-${index}`} 
                                  fill={isSelected ? '#10b981' : isEfficient ? '#3b82f6' : '#64748b'} 
                                  size={isSelected ? 100 : 60}
                                  className="cursor-pointer transition-all hover:opacity-80"
                                />
                              );
                            })}
                          </Scatter>
                        </ScatterChart>
                      </ResponsiveContainer>
                   </div>

                   {conflicts.length > 0 && (
                     <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-2xl flex flex-col gap-2">
                        {conflicts.map((c, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <AlertTriangle size={14} className="text-error mt-0.5 shrink-0" />
                            <span className="text-[10px] font-bold text-error leading-tight">{c}</span>
                          </div>
                        ))}
                     </div>
                   )}

                   <div className="space-y-4">
                    {aiAnalysis.strategies.map((s, i) => (
                      <button 
                         key={i} 
                         onClick={() => toggleStrategy(i)}
                         className={`w-full text-left flex gap-4 p-5 rounded-2xl border transition-all relative overflow-hidden group ${
                           selectedStrategyIndices.includes(i) 
                             ? 'bg-secondary/10 border-secondary ring-1 ring-secondary/50' 
                             : 'bg-card border-border hover:border-secondary/30'
                         }`}
                      >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black transition-transform shrink-0 ${
                          selectedStrategyIndices.includes(i) ? 'bg-secondary text-white' : 'bg-accent/10 text-accent group-hover:scale-110'
                        }`}>
                          {i+1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <div className="font-black text-primary uppercase text-xs tracking-tight truncate pr-2">{s.label}: {s.action}</div>
                            <span className={`text-[9px] font-black px-2 py-0.5 rounded-full shrink-0 ${
                              selectedStrategyIndices.includes(i) ? 'bg-secondary text-white' : 'bg-accent/5 text-accent'
                            }`}>
                              {s.confidenceScore > 1 ? s.confidenceScore : Math.round(s.confidenceScore * 100)}% Conf
                            </span>
                          </div>
                          <div className="text-[10px] text-muted font-medium mb-2 line-clamp-2">{s.tradeoff}</div>
                          <div className="flex items-center justify-between border-t border-border/50 pt-2">
                            <div className={`text-[9px] font-bold uppercase tracking-widest flex items-center gap-1 ${
                              selectedStrategyIndices.includes(i) ? 'text-secondary' : 'text-success'
                            }`}>
                              <TrendingUp size={10} /> {s.impact}
                            </div>
                            {selectedStrategyIndices.includes(i) && (
                              <div className="text-[8px] font-black text-secondary animate-pulse uppercase">Portfolio Active</div>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                   </div>
                </div>

                <div className="bg-accent border border-accent p-8 rounded-[2rem] flex items-center justify-between text-white shadow-2xl shadow-accent/20">
                   <div className="flex items-center gap-4">
                     <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
                        <Search size={28} />
                     </div>
                     <div>
                       <div className="font-black uppercase text-sm tracking-widest">Deep Cascade Map Ready</div>
                       <div className="text-[10px] font-medium text-white/80">View second-order propagation and timeline projections.</div>
                     </div>
                   </div>
                   <Link to="/analysis" className="px-8 py-3 bg-white text-accent rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all">
                     View Deep Analysis
                   </Link>
                </div>
              </section>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
