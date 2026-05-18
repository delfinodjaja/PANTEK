import React, { useMemo, useState } from 'react';
import { useChain } from '../context/ChainContext';
import { Activity, Clock, ShieldCheck, Zap, ChevronLeft, ChevronRight, Info, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const AssessmentHeader = () => {
  const { 
    aiAnalysis, 
    suppliers, 
    warehouses, 
    showHeatmap,
    setShowHeatmap,
    showConfidenceRings, 
    setShowConfidenceRings,
    selectedModel,
    setSelectedModel
  } = useChain();

  const models = [
    { id: 'gemini-2.0-flash', name: '2.0F' },
    { id: 'gemini-3-flash-preview', name: '3.0F' },
    { id: 'gemini-3.1-pro-preview', name: '3.1P' }
  ];

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  const freshnessScore = useMemo(() => {
    const allNodes = [...suppliers, ...warehouses];
    if (allNodes.length === 0) return { total: 100, ai: 100, ingestion: 100 };

    const scores = allNodes.map(node => {
      const hoursSinceUpdate = (Date.now() - new Date(node.lastUpdated).getTime()) / 3600000;
      if (hoursSinceUpdate < 24) return 1.0;
      if (hoursSinceUpdate < 48) return 0.5;
      return 0.0;
    });

    const avgFreshness = (scores.reduce((a, b) => a + b, 0) / scores.length) * 100;
    const aiConfidence = aiAnalysis ? aiAnalysis.confidenceScore * 100 : 100;

    // Weight: AI 60%, Ingestion 40%
    const combined = (aiConfidence * 0.6) + (avgFreshness * 0.4);
    
    return {
      total: Math.round(combined),
      ai: Math.round(aiConfidence),
      ingestion: Math.round(avgFreshness)
    };
  }, [aiAnalysis, suppliers, warehouses]);

  const getColorClass = (score: number) => {
    if (score >= 80) return 'text-success border-success/20 bg-success/5';
    if (score >= 50) return 'text-warning border-warning/20 bg-warning/5';
    return 'text-error border-error/20 bg-error/5';
  };

  const getDotClass = (score: number) => {
    if (score >= 80) return 'bg-success';
    if (score >= 50) return 'bg-warning';
    return 'bg-error';
  };

  return (
    <motion.div 
      layout
      className="flex items-center gap-2 bg-panel border border-border rounded-2xl shadow-xl w-fit overflow-hidden p-1 px-4 py-2"
    >
      <div className="flex items-center gap-6 px-3 py-2">
        <AnimatePresence mode="wait">
          {!isCollapsed && (
            <motion.div 
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 'auto', opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="flex items-center gap-6"
            >
              <button 
                onClick={() => setShowHeatmap(!showHeatmap)}
                className={`flex flex-col items-start hover:opacity-80 transition-all ${showHeatmap ? 'text-accent' : 'text-muted'}`}
              >
                <div className="text-[8px] font-black uppercase tracking-widest mb-0.5">Asset Intelligence</div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className={showHeatmap ? "text-accent" : "text-muted"} size={16} />
                  <span className="text-sm font-black text-primary tracking-tighter uppercase italic whitespace-nowrap leading-none mt-0.5">Asset Assessment</span>
                </div>
              </button>

              <div className="w-px h-8 bg-border shrink-0" />
            </motion.div>
          )}
        </AnimatePresence>

        {!isCollapsed && (
          <div className="flex flex-col items-start mr-2">
            <span className="text-[7px] font-black uppercase tracking-tighter text-muted">Model</span>
          <div className="flex bg-card border border-border p-0.5 rounded-lg gap-0.5 mt-0.5">
            {models.map(m => (
              <button
                key={m.id}
                onClick={() => setSelectedModel(m.id)}
                className={`px-1.5 py-1 rounded-[4px] text-[8px] font-black uppercase transition-all duration-300 ${
                  selectedModel === m.id 
                  ? 'bg-accent text-white shadow-lg shadow-accent/20' 
                  : 'text-muted hover:text-primary hover:bg-white/5'
                }`}
              >
                {m.name}
              </button>
            ))}
          </div>
          </div>
        )}

        <div className="relative flex items-center gap-2">
          <button 
            onClick={() => setShowConfidenceRings(!showConfidenceRings)}
            className={`flex items-center gap-3 px-3 py-1.5 rounded-xl border transition-all duration-300 hover:scale-105 active:scale-95 ${getColorClass(freshnessScore.total)} ${showConfidenceRings ? 'ring-2 ring-accent/20 shadow-lg' : 'opacity-80'}`}
          >
            <div className="flex flex-col items-start">
              <span className="text-[7px] font-black uppercase tracking-tighter opacity-70">Global Fidelity</span>
              <span className="text-[10px] font-black leading-none">{freshnessScore.total}%</span>
            </div>
            <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${getDotClass(freshnessScore.total)}`} />
          </button>

          <button 
            onMouseEnter={() => setShowExplanation(true)}
            onMouseLeave={() => setShowExplanation(false)}
            onClick={() => setShowExplanation(!showExplanation)}
            className={`p-1.5 rounded-lg border border-border hover:bg-white/5 transition-all outline-none ${showExplanation ? 'text-accent border-accent/20 bg-accent/5' : 'text-muted'}`}
          >
            <Info size={14} />
          </button>

          {/* Breakdown Tooltip / Explanation */}
          <AnimatePresence>
            {showExplanation && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute top-full mt-3 left-0 w-64 p-5 bg-panel/95 backdrop-blur-2xl border border-border rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[1001]"
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-3 border-b border-border">
                    <ShieldCheck className="text-accent" size={16} />
                    <h5 className="text-[10px] font-black text-primary uppercase tracking-widest">Assessment Logic</h5>
                  </div>

                  <div className="space-y-3">
                    <div className="group">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5">
                          <Zap size={10} className="text-accent" />
                          <span className="text-[9px] font-black text-muted uppercase">Neural Convergence</span>
                        </div>
                        <span className="text-[10px] font-black text-primary">{freshnessScore.ai}%</span>
                      </div>
                      <p className="text-[8px] text-muted leading-relaxed font-medium">
                        Measures the stability and alignment of AI simulation paths. Higher scores indicate lower model variance.
                      </p>
                    </div>

                    <div className="group">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5">
                          <Clock size={10} className="text-warning" />
                          <span className="text-[9px] font-black text-muted uppercase">Node Telemetry Age</span>
                        </div>
                        <span className="text-[10px] font-black text-primary">{freshnessScore.ingestion}%</span>
                      </div>
                      <p className="text-[8px] text-muted leading-relaxed font-medium">
                        Based on the average time since last status update across all supply chain nodes.
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-border mt-1">
                    <div className="flex items-start gap-2">
                      <AlertTriangle size={12} className="text-accent mt-0.5" />
                      <p className="text-[8px] text-muted font-bold italic leading-tight">
                        Weighted: 60% Neural Convergence / 40% Node Telemetry Age
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {!isCollapsed && (
            <motion.div 
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 'auto', opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="flex items-center"
            >
              <div className="hidden lg:flex items-center gap-6">
                <div className="flex flex-col">
                   <span className="text-[7px] font-black text-muted uppercase tracking-tighter">Network Stability</span>
                   <div className="flex items-center gap-1">
                     <Activity size={12} className="text-success" />
                     <span className="text-[10px] font-bold text-primary italic">STABLE</span>
                   </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="p-2 mr-1 rounded-lg hover:bg-white/5 text-muted hover:text-primary transition-colors border border-transparent hover:border-border"
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>
    </motion.div>
  );
};

