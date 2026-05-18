import React, { useState, useMemo } from 'react';
import { useChain } from '../context/ChainContext';
import { AlertTriangle, Activity, Search, Crosshair, Filter, Layers } from 'lucide-react';
import { SupplyChainMap } from '../components/SupplyChainMap';
import { toast } from 'react-hot-toast';

import { IntelligenceTicker } from '../components/IntelligenceTicker';

export const LiveMap = () => {
  const { theme, suppliers, warehouses, routes, activeDisruptions, lastAddedNews } = useChain();
  const [searchQuery, setSearchQuery] = useState('');
  const [focusedNodeId, setFocusedNodeId] = useState<string | null>(null);
  const [filterMode, setFilterMode] = useState<'all' | 'sea' | 'air' | 'land'>('all');

  const allNodes = useMemo(() => [...suppliers, ...warehouses], [suppliers, warehouses]);

  const filteredRoutes = useMemo(() => {
    if (filterMode === 'all') return routes;
    return routes.filter(r => r.mode === filterMode);
  }, [routes, filterMode]);

  const focusedNode = useMemo(() => {
    if (!focusedNodeId) return undefined;
    const node = allNodes.find(n => n.id === focusedNodeId);
    return node ? ([node.lat, node.lng] as [number, number]) : undefined;
  }, [focusedNodeId, allNodes]);

  const newsHighlights = useMemo(() => {
    return lastAddedNews?.affectedNodes || [];
  }, [lastAddedNews]);

  return (
    <div className="flex-1 flex flex-col min-h-0 relative group">
      {/* Ticker Bar */}
      <IntelligenceTicker />

      <div className="flex-1 relative min-h-0">
        {/* Search & Control Overlay */}
        <div className="absolute top-6 left-6 z-[1000] flex flex-col gap-3">
          <div className="relative group/search">
            <div className="relative flex items-center">
              <Search className="absolute left-3 text-muted group-focus-within/search:text-accent transition-colors" size={14} />
              <input 
                type="text" 
                placeholder="Search nodes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-56 pl-9 pr-4 py-2 bg-panel/95 backdrop-blur-xl border border-border rounded-lg text-xs font-bold focus:outline-none focus:border-accent shadow-xl transition-all"
              />
            </div>
            {searchQuery && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-panel border border-border rounded-lg shadow-2xl max-h-60 overflow-y-auto custom-scrollbar">
                {allNodes
                  .filter(n => n.name.toLowerCase().includes(searchQuery.toLowerCase()) || n.region.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map(n => (
                    <button
                      key={n.id}
                      onClick={() => {
                        setFocusedNodeId(n.id);
                        setSearchQuery('');
                        toast.success(`Focused: ${n.name}`);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-accent/5 flex items-center justify-between border-b border-border/30 last:border-0 transition-colors group/item"
                    >
                      <div>
                        <div className="text-[10px] font-bold text-primary leading-none mb-1 group-hover/item:text-accent">{n.name}</div>
                        <div className="text-[8px] text-muted font-medium uppercase tracking-wider">{n.region}</div>
                      </div>
                      <Crosshair size={10} className="text-muted group-hover/item:text-accent" />
                    </button>
                  ))
                }
              </div>
            )}
          </div>

          <div className="flex gap-1 bg-panel/80 backdrop-blur-md p-1 rounded-lg border border-border shadow-lg w-fit">
            {(['all', 'sea', 'air', 'land'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setFilterMode(mode)}
                className={`px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-widest transition-all ${
                  filterMode === mode 
                    ? 'bg-accent text-white shadow-sm' 
                    : 'text-muted hover:text-primary hover:bg-white/5'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        <SupplyChainMap 
          suppliers={suppliers}
          warehouses={warehouses}
          routes={filteredRoutes}
          disruptions={activeDisruptions}
          theme={theme}
          centerNode={focusedNode}
          onNodeClick={(id) => setFocusedNodeId(id)}
          highlightNodeIds={[...newsHighlights, focusedNodeId].filter(Boolean) as string[]}
        />

        {/* Floating Legend */}
        <div className="absolute bottom-6 left-6 flex flex-col gap-3 p-4 bg-panel/90 backdrop-blur-lg shadow-2xl border border-border rounded-2xl z-[1000] min-w-[150px]">
          <div className="text-[9px] font-black text-muted uppercase tracking-widest border-b border-border pb-1.5 mb-1 opacity-60">Digital Twin Map</div>
          <div className="space-y-2">
             <div className="flex items-center justify-between"><div className="flex items-center gap-2"><div className="w-3 h-0.5 rounded-full bg-blue-500" /> <span className="text-[9px] font-bold text-muted uppercase">Sea Lanes</span></div></div>
             <div className="flex items-center justify-between"><div className="flex items-center gap-2"><div className="w-3 h-0.5 rounded-full bg-accent" /> <span className="text-[9px] font-bold text-muted uppercase">Air Corridor</span></div></div>
             <div className="flex items-center justify-between"><div className="flex items-center gap-2"><div className="w-3 h-0.5 rounded-full bg-warning" /> <span className="text-[9px] font-bold text-muted uppercase">Land Route</span></div></div>
             <div className="h-px bg-border my-1" />
             <div className="flex items-center justify-between"><div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-success" /> <span className="text-[9px] font-bold text-primary uppercase">Optimal</span></div></div>
             <div className="flex items-center justify-between"><div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-warning" /> <span className="text-[9px] font-bold text-primary uppercase">Warning</span></div></div>
             <div className="flex items-center justify-between"><div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-error" /> <span className="text-[9px] font-bold text-primary uppercase">Critical</span></div></div>
          </div>
        </div>
      </div>
    </div>
  );
};
