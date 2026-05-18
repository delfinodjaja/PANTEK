import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';

import { API_ROUTES } from '../constants';

// --- Types ---
export type Status = 'normal' | 'warning' | 'critical';
export type TransportMode = 'sea' | 'air' | 'land';
export type Severity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface Node {
  id: string;
  name: string;
  region: string;
  status: Status;
  lat: number;
  lng: number;
  type: 'supplier' | 'warehouse';
  criticality: number; // 0-100
  geopoliticalRiskScore: number; // 0-100
  lastUpdated: string; // ISO string
}

export interface Supplier extends Node {
  type: 'supplier';
  lead: number;
  reliability: number;
  capacity: number;
}

export interface Warehouse extends Node {
  type: 'warehouse';
  stock: number;
  capacity: number;
  demandForecast: number[]; // next 30 days
}

export interface Route {
  id: string;
  from: string;
  to: string;
  mode: TransportMode;
  cost: number;
  time: number;
  capacity: number;
  reliability: number;
  alternativeRoutes: string[]; // List of alternative route IDs or descriptions
  carbonFootprint: number;
  insuranceCoverage: boolean;
}

export interface EventLog {
  time: string;
  msg: string;
  type: 'ok' | 'warn' | 'crit' | '';
  details?: string;
}

export interface StrategyOption {
  label: string;
  action: string;
  tradeoff: string;
  impact: string;
  riskReduction: string;
  confidenceScore: number; // 0-100
  cost: number; // Added for Pareto chart
  riskReductionValue: number; // Added for Pareto chart (0-100)
}

export interface AIAnalysis {
  summary: string;
  riskLevel: Severity;
  iterationCount: number;
  convergenceStatus: 'converged' | 'diverged' | 'max_reached';
  confidenceScore: number;
  scenarioBreakdown: {
    best: { desc: string; confidence: number };
    expected: { desc: string; confidence: number };
    worst: { desc: string; confidence: number };
  };
  bottlenecks: string[];
  cascadeEffects: { source: string; target: string; probability: number; impact: string }[];
  timelineProjection: { day: number; impactLevel: number; description: string }[];
  secondaryEvents: { 
    title: string; 
    category: string; 
    type: 'endogenous' | 'exogenous'; 
    probability: number; 
    onset: string; 
    threatenedNodes: string[]; 
    confidence: number;
    description: string;
  }[];
  tertiaryEvents: { title: string; description: string }[];
  watchTriggers: string[];
  outcomeReasoning: string;
  strategies: StrategyOption[];
  recommendation: {
    choice: string;
    justification: string;
  };
  distributionData: { label: string; value: number }[];
  affectedNodeIds: string[];
  affectedRouteIds: string[];
  simDisruptions: Disruption[];
  auditTrail: { iteration: number; modification: string; reason: string }[];
}

import { getFriendlyErrorMessage } from '../lib/errorUtils';
import { calculateBetweennessCentrality } from '../services/centralityService';

export interface Disruption {
  id: string;
  type: 'delay' | 'shortage' | 'cost' | 'shutdown';
  targetType: 'node' | 'route';
  targetId: string;
  severity: number; // 0 to 1
  description: string;
}

import { PRESET_NEWS, NewsItem as PresetNewsItem } from '../constants/newsData';

export interface NewsItem extends PresetNewsItem {
  id: string; // Ensure compatibility
  timestampMillis: number;
}

interface HistoryItem {
  suppliers: Supplier[];
  warehouses: Warehouse[];
  routes: Route[];
  disruptions: Disruption[];
}

interface ChainContextType {
  theme: 'light' | 'dark';
  setTheme: (t: 'light' | 'dark') => void;
  suppliers: Supplier[];
  setSuppliers: React.Dispatch<React.SetStateAction<Supplier[]>>;
  warehouses: Warehouse[];
  setWarehouses: React.Dispatch<React.SetStateAction<Warehouse[]>>;
  routes: Route[];
  setRoutes: React.Dispatch<React.SetStateAction<Route[]>>;
  events: EventLog[];
  addEvent: (msg: string, type?: 'ok' | 'warn' | 'crit' | '') => void;
  aiAnalysis: AIAnalysis | null;
  isAiLoading: boolean;
  showHeatmap: boolean;
  setShowHeatmap: (val: boolean) => void;
  showConfidenceRings: boolean;
  setShowConfidenceRings: (val: boolean) => void;
  currentIteration: number;
  runSimulation: (prompt: string) => Promise<void>;
  runCascadeSimulation: () => Promise<void>;
  runWhatIfScenario: (strategyA: string, strategyB: string) => Promise<void>;
  autoHeal: () => Promise<void>;
  clearSimulation: () => void;
  clearEvents: () => void;
  activeDisruptions: Disruption[];
  liveNews: NewsItem[];
  setLiveNews: React.Dispatch<React.SetStateAction<NewsItem[]>>;
  processNewsItem: (news: NewsItem) => Promise<void>;
  isNewsPaused: boolean;
  setIsNewsPaused: (val: boolean) => void;
  newsSpeed: number;
  setNewsSpeed: (val: number) => void;
  newsFilter: { severity: string | null; category: string | null };
  setNewsFilter: (val: { severity: string | null; category: string | null }) => void;
  lastAddedNews: NewsItem | null;
  stats: {
    totalNodes: number;
    alertNodes: number;
    routesCount: number;
    health: number;
    networkHealthScore: number;
  };
  simulationHistory: AIAnalysis[];
  userApiKey: string;
  setUserApiKey: (key: string) => void;
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (val: boolean) => void;
}

const ChainContext = createContext<ChainContextType | undefined>(undefined);

export const ChainProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [userApiKey, setUserApiKey] = useState<string>(() => localStorage.getItem('gemini_api_key') || '');
  const [selectedModel, setSelectedModel] = useState<string>(() => {
    const saved = localStorage.getItem('gemini_model');
    const validModels = ['gemini-2.0-flash', 'gemini-3.1-pro-preview', 'gemini-3-flash-preview'];
    return (saved && validModels.includes(saved)) ? saved : 'gemini-2.0-flash';
  });

  useEffect(() => {
    localStorage.setItem('gemini_api_key', userApiKey);
  }, [userApiKey]);

  useEffect(() => {
    localStorage.setItem('gemini_model', selectedModel);
  }, [selectedModel]);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch(API_ROUTES.HEALTH);
        if (res.ok) {
          console.log('[ChainContext] AI Intelligence Layer: ONLINE');
        }
      } catch (e) {
        console.warn('[ChainContext] AI Intelligence Layer: OFFLINE or UNREACHABLE');
      }
    };
    checkHealth();
  }, []);

  const [activeDisruptions, setActiveDisruptions] = useState<Disruption[]>([]);
  const [liveNews, setLiveNews] = useState<NewsItem[]>([]);
  const [isNewsPaused, setIsNewsPaused] = useState(false);
  const [newsSpeed, setNewsSpeed] = useState(8000);
  const [newsFilter, setNewsFilter] = useState<{ severity: string | null; category: string | null }>({ severity: null, category: null });
  const [lastAddedNews, setLastAddedNews] = useState<NewsItem | null>(null);

  // Initialize with 5 random items
  useEffect(() => {
    const shuffled = [...PRESET_NEWS].sort(() => 0.5 - Math.random());
    const initial = shuffled.slice(0, 5).map(item => {
      const ts = Date.now() - Math.floor(Math.random() * 3600000);
      return {
        ...item,
        id: `${item.id}-${ts}`,
        timestampMillis: ts
      };
    });
    setLiveNews(initial);
  }, []);

  // News Rotation Loop
  useEffect(() => {
    if (isNewsPaused) return;

    const interval = setInterval(() => {
      setLiveNews(prev => {
        // Pick a random news item
        const nextRaw = PRESET_NEWS[Math.floor(Math.random() * PRESET_NEWS.length)];
        const ts = Date.now();
        const next: NewsItem = {
          ...nextRaw,
          id: `${nextRaw.id}-${ts}`,
          timestampMillis: ts
        };
        
        setLastAddedNews(next);
        // Briefly reset notification
        setTimeout(() => setLastAddedNews(null), 3000);

        return [next, ...prev].slice(0, 20);
      });
    }, newsSpeed);

    return () => clearInterval(interval);
  }, [isNewsPaused, newsSpeed]);

  const [suppliers, setSuppliers] = useState<Supplier[]>([
    { id: 'SHZ', name: 'Shenzhen Fab', region: 'China', lead: 28, reliability: 62, capacity: 78, status: 'critical', lat: 22.54, lng: 114.05, type: 'supplier', criticality: 95, geopoliticalRiskScore: 40, lastUpdated: new Date(Date.now() - 12 * 3600000).toISOString() },
    { id: 'LAX', name: 'Los Angeles', region: 'USA West', lead: 7, reliability: 91, capacity: 85, status: 'normal', lat: 34.05, lng: -118.24, type: 'supplier', criticality: 80, geopoliticalRiskScore: 10, lastUpdated: new Date(Date.now() - 36 * 3600000).toISOString() },
    { id: 'FRA', name: 'Frankfurt Hub', region: 'EU', lead: 5, reliability: 74, capacity: 60, status: 'warning', lat: 50.11, lng: 8.68, type: 'supplier', criticality: 75, geopoliticalRiskScore: 5, lastUpdated: new Date(Date.now() - 72 * 3600000).toISOString() },
  ]);

  const [warehouses, setWarehouses] = useState<Warehouse[]>([
    { id: 'SGP', name: 'Singapore DC', region: 'Singapore', stock: 23, capacity: 180, status: 'warning', lat: 1.35, lng: 103.81, type: 'warehouse', criticality: 90, geopoliticalRiskScore: 15, demandForecast: Array.from({ length: 30 }, () => Math.floor(Math.random() * 20) + 10), lastUpdated: new Date(Date.now() - 1 * 3600000).toISOString() },
    { id: 'CHI', name: 'Chicago Dist', region: 'USA', stock: 71, capacity: 140, status: 'normal', lat: 41.87, lng: -87.62, type: 'warehouse', criticality: 70, geopoliticalRiskScore: 5, demandForecast: Array.from({ length: 30 }, () => Math.floor(Math.random() * 15) + 5), lastUpdated: new Date(Date.now() - 50 * 3600000).toISOString() },
    { id: 'DXB', name: 'Dubai Free Zone', region: 'UAE', stock: 55, capacity: 160, status: 'normal', lat: 25.20, lng: 55.27, type: 'warehouse', criticality: 65, geopoliticalRiskScore: 25, demandForecast: Array.from({ length: 30 }, () => Math.floor(Math.random() * 10) + 8), lastUpdated: new Date(Date.now() - 10 * 3600000).toISOString() },
  ]);

  const [routes, setRoutes] = useState<Route[]>([
    { id: 'r1', from: 'SHZ', to: 'SGP', mode: 'sea', cost: 2400, time: 12, capacity: 5000, reliability: 88, alternativeRoutes: ['air_shz_sgp'], carbonFootprint: 120, insuranceCoverage: true },
    { id: 'r2', from: 'SGP', to: 'DXB', mode: 'air', cost: 8100, time: 1, capacity: 450, reliability: 96, alternativeRoutes: ['sea_sgp_dxb'], carbonFootprint: 850, insuranceCoverage: true },
    { id: 'r3', from: 'SHZ', to: 'FRA', mode: 'sea', cost: 4200, time: 22, capacity: 6200, reliability: 75, alternativeRoutes: ['land_silk_road'], carbonFootprint: 180, insuranceCoverage: false },
    { id: 'r4', from: 'FRA', to: 'CHI', mode: 'air', cost: 6200, time: 1, capacity: 550, reliability: 72, alternativeRoutes: ['sea_fra_chi'], carbonFootprint: 720, insuranceCoverage: true },
    { id: 'r5', from: 'LAX', to: 'CHI', mode: 'land', cost: 1100, time: 3, capacity: 1200, reliability: 94, alternativeRoutes: ['rail_lax_chi'], carbonFootprint: 45, insuranceCoverage: true },
    { id: 'r6', from: 'DXB', to: 'FRA', mode: 'air', cost: 3800, time: 1, capacity: 480, reliability: 90, alternativeRoutes: [], carbonFootprint: 450, insuranceCoverage: true },
  ]);

  const [events, setEvents] = useState<EventLog[]>([
    { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }), msg: 'PANTEK Intelligence Engine v1.0 initialized', type: 'ok' }
  ]);

  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [simulationHistory, setSimulationHistory] = useState<AIAnalysis[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [currentIteration, setCurrentIteration] = useState(0);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showConfidenceRings, setShowConfidenceRings] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // History for Undo/Redo
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const saveHistory = useCallback(() => {
    const newItem: HistoryItem = { suppliers, warehouses, routes, disruptions: activeDisruptions };
    setHistory(prev => [...prev.slice(0, historyIndex + 1), newItem].slice(-20));
    setHistoryIndex(prev => prev + 1);
  }, [suppliers, warehouses, routes, activeDisruptions, historyIndex]);

  const undo = () => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      setSuppliers(prev.suppliers);
      setWarehouses(prev.warehouses);
      setRoutes(prev.routes);
      setActiveDisruptions(prev.disruptions);
      setHistoryIndex(prev => prev - 1);
      addEvent('Action Undone', 'ok');
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      setSuppliers(next.suppliers);
      setWarehouses(next.warehouses);
      setRoutes(next.routes);
      setActiveDisruptions(next.disruptions);
      setHistoryIndex(prev => prev + 1);
      addEvent('Action Redone', 'ok');
    }
  };

  const abortControllerRef = useRef<AbortController | null>(null);

  const addEvent = (msg: string, type: 'ok' | 'warn' | 'crit' | '' = '', details?: string) => {
    setEvents(prev => [{ time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }), msg, type, details }, ...prev].slice(0, 100));
  };

  const clearSimulation = () => {
    saveHistory();
    setActiveDisruptions([]);
    setAiAnalysis(null);
    addEvent('Simulation cleared', 'ok');
  };

  const clearEvents = () => {
    setEvents([{ time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }), msg: 'System logs purged.', type: 'ok' }]);
  };

  const runSimulation = async (text: string) => {
    if (!text.trim() || isAiLoading) return;
    
    if (abortControllerRef.current) abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();

    setIsAiLoading(true);
    setAiAnalysis(null);
    setCurrentIteration(0);

    let currentCritique = "";
    let bestAnalysis: AIAnalysis | null = null;
    let auditTrail: any[] = [];
    let iterations = 0;
    const MAX_ITERATIONS = 3;
    let confidence = 0;

    const centralityMap = calculateBetweennessCentrality([...(suppliers || []) , ...(warehouses || [])], routes || []);

    const baseContext = {
      suppliers: (suppliers || []).map(s => ({ id: s.id, name: s.name, crit: s.criticality, centrality: centralityMap[s.id] || 0, geo: s.geopoliticalRiskScore, rel: s.reliability })),
      warehouses: (warehouses || []).map(w => ({ id: w.id, name: w.name, stock: w.stock, forecast: w.demandForecast, centrality: centralityMap[w.id] || 0 })),
      routes: (routes || []).map(r => ({ id: r.id, from: r.from, to: r.to, mode: r.mode, rel: r.reliability }))
    };

    try {
      while (iterations < MAX_ITERATIONS) {
        iterations++;
        setCurrentIteration(iterations);
        addEvent(`Neural Processing Layer ${iterations}...`, 'ok');

        // STEP 1: Propagation
        const simResponse = await fetch(API_ROUTES.SIMULATE, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'x-gemini-key': userApiKey 
          },
          body: JSON.stringify({
            model: selectedModel,
            prompt: text,
            context: { ...baseContext, previousCritique: currentCritique },
            systemInstruction: `ROLE: PROBABILISTIC WORLD MODELER. 
Output ONLY RAW STRICT JSON. DO NOT use markdown code blocks (e.g., NO \`\`\`json). NO preamble. NO postamble. NO commentary.
Apply bidirectional stress and node failure clusters. 
SCHEMA: { "confidence": 0.0-1.0, "nodes": { "id": { "stress": 0-1 } }, "cascades": [{ "from": "id", "to": "id", "prob": 0-1, "impact": "string" }], "disruptions": [{"id": "string", "targetId": "string", "severity": 0-1, "description": "string"}] }`
          }),
          signal: abortControllerRef.current.signal
        });

        if (!simResponse.ok) {
          const errData = await simResponse.json().catch(() => ({}));
          const status = simResponse.status;
          
          if (status === 401 || errData.error === "INVALID_API_KEY") {
            const friendly = getFriendlyErrorMessage('INVALID_API_KEY');
            toast.error(friendly);
            throw new Error('INVALID_API_KEY');
          }
          
          if (status === 429) {
            const friendly = getFriendlyErrorMessage(429);
            toast.error(friendly);
            throw new Error('RATE_LIMIT');
          }

          const friendly = getFriendlyErrorMessage(errData || `Phase 1 Error (${status})`);
          toast.error(friendly);
          throw new Error(JSON.stringify(errData || { message: `Phase 1 Error (${status})` }));
        }

        const simData = await simResponse.json();
        confidence = simData.confidence || 0.5;

        // STEP 2: Analysis & Critique
        const analysisResponse = await fetch(API_ROUTES.SIMULATE, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'x-gemini-key': userApiKey 
          },
          body: JSON.stringify({
            model: selectedModel,
            prompt: `WORLD MODEL: ${JSON.stringify(simData)}\nUser Trigger: ${text}`,
            context: baseContext,
            systemInstruction: `ROLE: CRITICAL INTERPRETER. 
Output ONLY RAW STRICT JSON. DO NOT use markdown code blocks (e.g., NO \`\`\`json). NO preamble. NO postamble. NO commentary.
1. Generate human-facing AIAnalysis JSON.
2. Generate machine-facing CRITIQUE JSON for next reflection.
Combine both into a single JSON object.
SCHEMA: { 
  "analysis": { 
    "summary": "...", 
    "riskLevel": "...", 
    "strategies": [{"label": "...", "action": "...", "tradeoff": "...", "impact": "...", "confidenceScore": 85, "cost": 0, "riskReductionValue": 0}], 
    "timelineProjection": [{"day": 1, "impactLevel": 20, "description": "..."}], 
    "scenarioBreakdown": {"best": {"desc": "...", "confidence": 0.8}, "expected": {"desc": "...", "confidence": 0.9}, "worst": {"desc": "...", "confidence": 0.7}},
    "bottlenecks": ["node_id_1", "node_id_2"],
    "affectedRouteIds": ["route_id_1", "route_id_2"],
    "cascadeEffects": [{"source": "id", "target": "id", "probability": 0.8, "impact": "..."}],
    "secondaryEvents": [{"title": "...", "category": "...", "type": "endogenous", "probability": 60, "onset": "Day 5", "threatenedNodes": ["id"], "confidence": 80, "description": "..."}],
    "tertiaryEvents": [{"title": "...", "description": "..."}],
    "watchTriggers": ["signal 1", "signal 2"],
    "outcomeReasoning": "Detailed logic",
    "recommendation": {"choice": "...", "justification": "..."}
  }, 
  "critique": { "delta": "...", "logic_adjustment": "...", "confidence_gap": "..." } 
}`
          }),
          signal: abortControllerRef.current.signal
        });

        if (!analysisResponse.ok) {
          const status = analysisResponse.status;
          const errData = await analysisResponse.json().catch(() => ({}));
          const friendly = getFriendlyErrorMessage(errData || `Phase 2 Error (${status})`);
          
          toast.error(friendly);
          throw new Error(JSON.stringify(errData || { message: `Phase 2 Error (${status})` }));
        }

        const combinedData = await analysisResponse.json();
        const data = combinedData.analysis || {};
        currentCritique = JSON.stringify(combinedData.critique || {});

        auditTrail.push({
          iteration: iterations,
          modification: combinedData.critique?.logic_adjustment || "Refining propagation logic",
          reason: combinedData.critique?.delta || "Iterative convergence"
        });

        const analysis: AIAnalysis = {
          summary: data.summary || "Processing...",
          riskLevel: data.riskLevel || "MEDIUM",
          strategies: data.strategies || [],
          timelineProjection: data.timelineProjection || [],
          scenarioBreakdown: data.scenarioBreakdown || { best: { desc: "N/A", confidence: 0 }, expected: { desc: "N/A", confidence: 0 }, worst: { desc: "N/A", confidence: 0 } },
          iterationCount: iterations,
          confidenceScore: confidence,
          convergenceStatus: confidence > 0.9 ? 'converged' : iterations === MAX_ITERATIONS ? 'max_reached' : 'diverged',
          auditTrail: [...auditTrail],
          distributionData: [
            { label: 'Worst', value: 20 },
            { label: 'Expected', value: 60 },
            { label: 'Best', value: 20 },
          ],
          affectedNodeIds: Object.keys(simData.nodes || {}),
          simDisruptions: simData.disruptions || [],
          bottlenecks: data.bottlenecks || [],
          cascadeEffects: data.cascadeEffects || [],
          secondaryEvents: data.secondaryEvents || [],
          tertiaryEvents: data.tertiaryEvents || [],
          watchTriggers: data.watchTriggers || [],
          outcomeReasoning: data.outcomeReasoning || "",
          recommendation: data.recommendation || { choice: "", justification: "" },
          affectedRouteIds: data.affectedRouteIds || []
        };

        bestAnalysis = analysis;
        if (confidence > 0.9) break;
      }

      if (bestAnalysis) {
        setAiAnalysis(bestAnalysis);
        setSimulationHistory(prev => [bestAnalysis!, ...prev].slice(0, 10));
        setActiveDisruptions(bestAnalysis.simDisruptions);
        addEvent(`Modeling complete. Risk: ${bestAnalysis.riskLevel}`, bestAnalysis.riskLevel === 'CRITICAL' ? 'crit' : 'warn');
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return;
      
      console.error("[ChainContext] Simulation Engine Error:", err);
      
      const friendlyMessage = getFriendlyErrorMessage(err);
      const rawError = err instanceof Error ? err.message : JSON.stringify(err);
      
      if (rawError !== "INVALID_API_KEY" && rawError !== "RATE_LIMIT") {
        addEvent(friendlyMessage, 'crit', rawError);
      }
    } finally {
      setIsAiLoading(false);
    }
  };

  const runCascadeSimulation = async () => {
    if (activeDisruptions.length === 0) {
      addEvent('No active disruptions to cascade', 'warn');
      return;
    }
    await runSimulation(`Perform a deep 30-day cascade analysis based on current disruptions: ${JSON.stringify(activeDisruptions)}`);
  };

  const runWhatIfScenario = async (stratA: string, stratB: string) => {
    await runSimulation(`Contrast Comparison: Strategy A (${stratA}) vs Strategy B (${stratB}) under current network constraints.`);
  };

  const autoHeal = async () => {
    // This is a placeholder in context, the intelligent solver is typically local to UI 
    // but we can provide a basic implementation here too if needed.
    // However, the instructions imply the button itself should become the solver.
    // I will implement the logic directly in ScenarioLab for better state control (multi-select).
    addEvent('Auto-Heal Solver Initialized...', 'ok');
  };

  const processNewsItem = async (news: NewsItem) => {
    if (isAiLoading) {
      toast.error('Simulation already in progress. Please wait.');
      return;
    }

    addEvent(`Ingesting intelligence: ${news.headline}`, 'warn');
    
    const propagationPrompt = `
      Intelligence Signal: ${news.headline}
      Severity: ${news.severity}
      Category: ${news.category}
      Affected Nodes: ${news.affectedNodes.join(', ')}
      Intelligence Context: ${news.body}
      
      TASK: Analyze the propagation of this specific news event through the digital twin network. 
      Identify first-order failures and second-order cascade ripples.
    `.trim();

    await runSimulation(propagationPrompt);
  };

  const stats = useMemo(() => {
    const totalNodes = suppliers.length + warehouses.length;
    const alertNodes = [...suppliers, ...warehouses].filter(n => n.status !== 'normal').length;
    const avgRel = routes.length ? routes.reduce((acc, r) => acc + (r.reliability || 0), 0) / routes.length : 100;
    
    // Complex network health score
    const nodeStability = 100 - (alertNodes / totalNodes * 100);
    const networkHealthScore = Math.round((nodeStability + avgRel) / 2);
    
    return { totalNodes, alertNodes, routesCount: routes.length, health: Math.round(avgRel), networkHealthScore };
  }, [suppliers, warehouses, routes]);

  return (
    <ChainContext.Provider value={{
      theme, setTheme, suppliers, setSuppliers, warehouses, setWarehouses, routes, setRoutes,
      events, addEvent, aiAnalysis, isAiLoading, 
      showHeatmap, setShowHeatmap, showConfidenceRings, setShowConfidenceRings,
      currentIteration, runSimulation, runCascadeSimulation,
      runWhatIfScenario, autoHeal, clearSimulation, clearEvents, activeDisruptions,
      liveNews, setLiveNews, 
      processNewsItem, isNewsPaused, setIsNewsPaused, newsSpeed, setNewsSpeed,
      newsFilter, setNewsFilter, lastAddedNews,
      stats, simulationHistory, userApiKey, setUserApiKey, 
      selectedModel, setSelectedModel,
      undo, redo, canUndo: historyIndex > 0, canRedo: historyIndex < history.length - 1,
      isSettingsOpen, setIsSettingsOpen
    }}>
      {children}
    </ChainContext.Provider>
  );
};

export const useChain = () => {
  const context = useContext(ChainContext);
  if (!context) throw new Error('useChain must be used within a ChainProvider');
  return context;
};
