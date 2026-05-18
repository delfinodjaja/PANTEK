import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, Rectangle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Supplier, Warehouse, Route, Disruption } from '../context/ChainContext';
import { CorrelatedCluster } from '../services/simulationService';
import { Clock, Activity, Zap } from 'lucide-react';
import { useEffect } from 'react';

// Internal controller for map movements
const MapController = ({ centerNode }: { centerNode?: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    if (centerNode) {
      map.flyTo(centerNode, 6, { duration: 1.5 });
    }
  }, [centerNode, map]);
  return null;
};

const CustomZoomControl = () => {
  const map = useMap();
  return (
    <div className="absolute top-1/2 left-6 -translate-y-1/2 flex flex-col gap-2 z-[1000]">
      <button 
        onClick={() => map.zoomIn()}
        className="w-10 h-10 bg-panel/90 backdrop-blur-md border border-border rounded-xl flex items-center justify-center text-primary hover:text-accent hover:border-accent/40 shadow-xl transition-all font-black text-lg"
      >
        +
      </button>
      <button 
        onClick={() => map.zoomOut()}
        className="w-10 h-10 bg-panel/90 backdrop-blur-md border border-border rounded-xl flex items-center justify-center text-primary hover:text-accent hover:border-accent/40 shadow-xl transition-all font-black text-lg"
      >
        −
      </button>
    </div>
  );
};

// Marker Fix
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
}

interface DigitalTwinMapProps {
  suppliers: Supplier[];
  warehouses: Warehouse[];
  routes: Route[];
  disruptions: Disruption[];
  scrubDay: number;
  globalIntensity: number;
  showHeatmap?: boolean;
  centralityScores?: Record<string, number>;
  showConfidenceRings?: boolean;
  clusters?: CorrelatedCluster[];
  highlightNodeIds?: string[];
  centerNode?: [number, number];
  theme?: 'light' | 'dark';
  height?: string;
  className?: string;
  onNodeClick?: (id: string) => void;
  key?: string;
}

const getCentralityColor = (score: number) => {
  // 0 is light blue, 100 is deep red
  if (score < 20) return '#60a5fa'; // Blue
  if (score < 40) return '#34d399'; // Emerald
  if (score < 60) return '#fbbf24'; // Amber
  if (score < 80) return '#f87171'; // Red
  return '#b91c1c'; // Deep Red
};

const getSeverityColor = (severity: number, baseColor: string) => {
  if (severity < 20) return baseColor;
  if (severity < 50) return '#f59e0b'; // warning
  return '#ef4444'; // critical
};

const SimulationNodeMarker = ({ node, disruption, isHighlighted, globalIntensity, showHeatmap, centralityScore, showConfidenceRings, onClick }: { 
  node: Supplier | Warehouse, 
  disruption?: Disruption, 
  isHighlighted?: boolean, 
  globalIntensity: number,
  showHeatmap?: boolean,
  centralityScore?: number,
  showConfidenceRings?: boolean,
  onClick?: (id: string) => void,
  key?: string
}) => {
  const nodeBaseColor = { normal: '#10b981', warning: '#f59e0b', critical: '#ef4444' }[node.status];
  
  // Combine specific disruption with ambient network strain
  const ambientStress = globalIntensity * 25; 
  const effectiveSeverity = disruption ? Math.max(disruption.severity, ambientStress) : ambientStress;
  
  const color = showHeatmap && centralityScore !== undefined 
    ? getCentralityColor(centralityScore)
    : getSeverityColor(effectiveSeverity, nodeBaseColor);
  
  // Simulation Map Special: Severe scaling and multiple pings
  const severityScale = 1.0 + (effectiveSeverity / 100) * 1.5; 
  const finalScale = isHighlighted ? severityScale * 1.3 : severityScale;
  const isSevere = effectiveSeverity > 40;
  
  // Add a jitter / vibration effect if stress is high
  const jitterIntensity = Math.max(0, (effectiveSeverity - 20) / 10);
  const jitterClass = jitterIntensity > 1 ? (jitterIntensity > 3 ? 'animate-shake-heavy' : 'animate-shake-light') : '';

  // Data Confidence Ring Logic
  const lastUpdatedHours = (Date.now() - new Date(node.lastUpdated).getTime()) / 3600000;
  let confidenceRingColor = '';
  if (showConfidenceRings) {
    if (lastUpdatedHours > 48) confidenceRingColor = 'rgba(239, 68, 68, 0.6)'; // Red
    else if (lastUpdatedHours > 24) confidenceRingColor = 'rgba(245, 158, 11, 0.6)'; // Amber
  }

  const icon = L.divIcon({
    className: 'custom-div-icon',
    html: `
      <div class="relative group cursor-pointer flex items-center justify-center transition-all duration-300 ${jitterClass}" style="transform: scale(${finalScale})">
        ${confidenceRingColor ? `
          <div class="absolute inset-x-[-12px] inset-y-[-12px] rounded-full border-2 animate-ping" style="border-color: ${confidenceRingColor}; animation-duration: 3s"></div>
          <div class="absolute inset-x-[-8px] inset-y-[-8px] rounded-full border-2 border-opacity-50" style="border-color: ${confidenceRingColor}"></div>
        ` : ''}

        <div class="absolute inset-0 w-16 h-16 -m-4 rounded-full border border-dashed border-accent/20 animate-spin-slow opacity-20"></div>
        
        <!-- Simulation Shockwaves -->
        <div class="absolute inset-0 w-8 h-8 rounded-full ${isHighlighted ? 'opacity-40 animate-pulse' : 'opacity-20'} ${effectiveSeverity > 10 ? 'animate-ping' : ''}" style="background-color: ${color}"></div>
        ${isSevere ? `<div class="absolute inset-0 w-12 h-12 -m-2 rounded-full opacity-10 animate-ping" style="background-color: ${color}; animation-delay: 0.5s"></div>` : ''}

        <!-- Critical Icon -->
        ${effectiveSeverity > 25 ? `<div class="absolute -top-3 -right-3 bg-error text-white rounded-full p-1 animate-bounce shadow-2xl ring-2 ring-panel z-20"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg></div>` : ''}
        
        <div class="w-8 h-8 rounded-full border-2 border-white shadow-xl flex items-center justify-center text-white font-black text-[9px] relative z-10 transition-transform hover:scale-125" style="background-color: ${color}">
          ${node.id.slice(0, 3)}
        </div>

        <!-- Node Strain Indicator (Small bar below) -->
        ${effectiveSeverity > 5 ? `
          <div class="absolute -bottom-1 w-6 h-1 bg-panel/80 rounded-full overflow-hidden border border-border/50">
            <div class="h-full bg-accent" style="width: ${Math.min(100, effectiveSeverity)}%; background-color: ${color}"></div>
          </div>
        ` : ''}
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });

  return (
    <Marker 
      position={[node.lat, node.lng]} 
      icon={icon}
      eventHandlers={{ click: () => onClick?.(node.id) }}
    >
      <Popup className="custom-popup">
        <div className="p-2 min-w-[220px] bg-panel">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h4 className="font-extrabold text-sm text-primary">{node.name}</h4>
              <div className="flex items-center gap-1 text-[8px] font-black text-muted uppercase mt-0.5">
                <Clock size={10} />
                Updated {Math.round(lastUpdatedHours)}h ago
              </div>
            </div>
            {showHeatmap && centralityScore !== undefined && (
              <div className="flex flex-col items-end">
                <span className="text-[7px] font-black uppercase text-muted">Centrality</span>
                <span className="text-[10px] font-black" style={{ color: getCentralityColor(centralityScore) }}>{centralityScore}</span>
              </div>
            )}
          </div>
          <div className="mb-3 p-3 bg-card border border-border rounded-xl">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[8px] font-black uppercase text-muted">Status</span>
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                disruption ? 'bg-error/20 text-error' : 'bg-success/20 text-success'
              }`}>
                {disruption ? `DISRUPTED (${Math.round(disruption.severity)}%)` : 'OPERATIONAL'}
              </span>
            </div>
            {disruption && (
              <p className="text-[10px] text-primary italic leading-tight border-t border-border pt-2 mt-2">
                "{disruption.description}"
              </p>
            )}
          </div>
          <div className="text-[8px] font-black text-muted uppercase tracking-widest text-center">
            Digital Twin Node Analysis
          </div>
        </div>
      </Popup>
    </Marker>
  );
};

export const DigitalTwinMap = ({ 
  suppliers, 
  warehouses, 
  routes, 
  disruptions, 
  scrubDay,
  globalIntensity,
  showHeatmap = false,
  centralityScores = {},
  showConfidenceRings = true,
  clusters = [],
  highlightNodeIds = [], 
  centerNode,
  theme = 'dark',
  height = '100%',
  className = '',
  onNodeClick
}: DigitalTwinMapProps) => {
  return (
    <div className={`relative ${className}`} style={{ height }}>
      <MapContainer 
        center={[20, 0]} 
        zoom={2.5} 
        minZoom={2}
        maxBounds={[[-90, -180], [90, 180]]}
        maxBoundsViscosity={1.0}
        scrollWheelZoom={true} 
        className="w-full h-full z-0"
        zoomControl={false}
        worldCopyJump={false}
      >
        <MapController centerNode={centerNode} />
        <CustomZoomControl />
        <TileLayer
          attribution='&copy; CARTO'
          url={theme === 'dark' 
            ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          }
        />

        {/* Cluster Highlights */}
        {clusters.map((cluster, i) => {
          const clusterNodes = [...suppliers, ...warehouses].filter(n => cluster.nodeIds.includes(n.id));
          if (clusterNodes.length < 2) return null;
          
          const lats = clusterNodes.map(n => n.lat);
          const lngs = clusterNodes.map(n => n.lng);
          const bounds: [number, number][] = [
            [Math.min(...lats) - 2, Math.min(...lngs) - 2],
            [Math.max(...lats) + 2, Math.max(...lngs) + 2]
          ];
          
          // Only show cluster if any node in it has significant stress
          const hasStress = disruptions.some(d => cluster.nodeIds.includes(d.targetId) && d.severity > 30);
          if (!hasStress) return null;

          return (
            <React.Fragment key={`cluster-${cluster.name}-${i}`}>
              <Rectangle
                bounds={bounds}
                pathOptions={{
                  color: '#ef4444',
                  weight: 1,
                  dashArray: '5, 10',
                  fillColor: '#ef4444',
                  fillOpacity: 0.05
                }}
              />
              <Marker
                position={[Math.max(...lats) + 2, (Math.min(...lngs) + Math.max(...lngs)) / 2]}
                icon={L.divIcon({
                  className: '!bg-transparent',
                  html: `
                    <div class="px-2 py-1 bg-error/90 backdrop-blur-md rounded-lg border border-error/50 whitespace-nowrap shadow-2xl transition-all animate-in fade-in zoom-in duration-500">
                      <div class="text-[8px] font-black text-white uppercase tracking-tighter flex items-center gap-1">
                        <Activity size={10} />
                        ${cluster.name}
                      </div>
                    </div>
                  `,
                  iconSize: [120, 24],
                  iconAnchor: [60, 24]
                })}
                interactive={false}
              />
            </React.Fragment>
          );
        })}
        
        {routes.map(r => {
          const fromNode = [...suppliers, ...warehouses].find(n => n.id === r.from);
          const toNode = [...suppliers, ...warehouses].find(n => n.id === r.to);
          const disruption = disruptions.find(d => d.targetId === r.id);
          
          if (fromNode && toNode) {
            const baseColor = r.mode === 'air' ? '#3b82f6' : r.mode === 'sea' ? '#6366f1' : '#f59e0b';
            const color = disruption ? getSeverityColor(disruption.severity, baseColor) : baseColor;
            
            // Route strain factor
            const strain = disruption ? Math.min(1.0, disruption.severity / 100) : 0;
            const weight = 2 + (strain * 8); // Thickens significantly
            const opacity = 0.3 + (strain * 0.7);

            return (
              <Polyline
                key={r.id}
                positions={[[fromNode.lat, fromNode.lng], [toNode.lat, toNode.lng]]}
                pathOptions={{
                  color: color,
                  weight: weight,
                  opacity: opacity,
                  dashArray: strain > 0.1 ? (strain > 0.5 ? '4, 4' : '10, 10') : (r.mode === 'land' ? '5, 8' : undefined),
                  interactive: false,
                }}
              />
            );
          }
          return null;
        })}

        {[...suppliers, ...warehouses].map((node) => {
          const disruption = disruptions.find(d => d.targetType === 'node' && d.targetId === node.id);
          const isHighlighted = highlightNodeIds.includes(node.id);
          const centralityScore = centralityScores[node.id];
          
          return (
            <SimulationNodeMarker 
              key={node.id} 
              node={node} 
              disruption={disruption}
              isHighlighted={isHighlighted}
              globalIntensity={globalIntensity}
              showHeatmap={showHeatmap}
              centralityScore={centralityScore}
              showConfidenceRings={showConfidenceRings}
              onClick={onNodeClick}
            />
          );
        })}
      </MapContainer>

      {/* Map Legends */}
      <div className="absolute top-40 left-6 z-[1000] flex flex-col gap-2">
        {showHeatmap && (
          <div className="p-3 bg-panel/90 backdrop-blur-xl rounded-2xl border border-border shadow-2xl min-w-[140px] animate-in slide-in-from-left duration-300">
            <div className="text-[8px] font-black text-muted uppercase tracking-widest mb-2 flex items-center gap-1">
              <Zap size={10} className="text-accent" /> Centrality Score
            </div>
            <div className="h-2 w-full rounded-full bg-gradient-to-r from-blue-400 via-emerald-400 via-amber-400 to-red-600 mb-1" />
            <div className="flex justify-between text-[7px] font-bold text-muted uppercase">
              <span>Low</span>
              <span>Critical</span>
            </div>
          </div>
        )}

        {showConfidenceRings && (
          <div className="p-3 bg-panel/90 backdrop-blur-xl rounded-2xl border border-border shadow-2xl min-w-[140px] animate-in slide-in-from-left duration-300 delay-75">
            <div className="text-[8px] font-black text-muted uppercase tracking-widest mb-2 flex items-center gap-1">
              <Clock size={10} className="text-warning" /> Data Age
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-warning animate-pulse" />
                <span className="text-[7px] font-bold text-primary uppercase leading-none">24-48h (Amber)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-error animate-pulse" />
                <span className="text-[7px] font-bold text-primary uppercase leading-none">&gt;48h (Red)</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
