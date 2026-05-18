import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';

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
    <div className="absolute top-1/2 right-6 -translate-y-1/2 flex flex-col gap-2 z-[1000]">
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
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Supplier, Warehouse, Route, Disruption } from '../context/ChainContext';

// Marker Fix
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
}

interface SupplyChainMapProps {
  suppliers: Supplier[];
  warehouses: Warehouse[];
  routes: Route[];
  disruptions: Disruption[];
  highlightNodeIds?: string[];
  highlightRouteIds?: string[];
  centerNode?: [number, number];
  onNodeClick?: (nodeId: string) => void;
  onRouteClick?: (routeId: string) => void;
  theme?: 'light' | 'dark';
  height?: string;
  className?: string;
  zoomState?: { center: [number, number], zoom: number };
}

const getSeverityColor = (severity: number, defaultColor: string) => {
  if (severity <= 0) return defaultColor;
  if (severity < 10) return '#10b981'; // Green (Stable)
  if (severity < 30) return '#facc15'; // Yellow (Warning)
  if (severity < 60) return '#f59e0b'; // Orange (Severe)
  return '#ef4444'; // Red (Critical)
};

const SupplyNodeMarker = ({ node, disruption, isHighlighted, onClick }: { 
  node: Supplier | Warehouse, 
  disruption?: Disruption, 
  isHighlighted?: boolean, 
  onClick?: (id: string) => void,
  key?: string 
}) => {
  const nodeBaseColor = { normal: '#10b981', warning: '#f59e0b', critical: '#ef4444' }[node.status];
  const color = disruption 
    ? getSeverityColor(disruption.severity, nodeBaseColor)
    : isHighlighted ? '#f59e0b' : nodeBaseColor; 
  
  // Visual scale factor based on disruption severity: 1.0 to 2.5
  const severityScale = disruption ? 1.0 + (disruption.severity / 100) * 1.5 : 1.0;
  const finalScale = isHighlighted ? severityScale * 1.3 : severityScale;

  const icon = L.divIcon({
    className: 'custom-div-icon',
    html: `
      <div class="relative group cursor-pointer flex items-center justify-center transition-all duration-300" style="transform: scale(${finalScale})">
        <div class="absolute inset-0 w-8 h-8 -m-1 rounded-full border border-dashed border-accent/20 animate-spin-slow opacity-20"></div>
        <div class="absolute inset-0 w-6 h-6 rounded-full ${isHighlighted ? 'opacity-40 animate-pulse' : 'opacity-20'} ${disruption && disruption.severity > 10 ? 'animate-ping' : ''}" style="background-color: ${color}"></div>
        ${disruption && disruption.severity > 30 ? `<div class="absolute -top-1.5 -right-1.5 bg-error text-white rounded-full p-0.5 animate-bounce shadow-lg ring-1 ring-panel z-20"><svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg></div>` : ''}
        <div class="w-6 h-6 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white font-bold text-[8px] relative z-10 transition-transform hover:scale-110" style="background-color: ${color}">
          ${node.id.slice(0, 3)}
        </div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });

  return (
    <Marker 
      position={[node.lat, node.lng]} 
      icon={icon}
      eventHandlers={{ click: () => onClick?.(node.id) }}
    >
      <Popup className="custom-popup">
        <div className="p-1 min-w-[200px] bg-panel text-primary">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-bold text-sm text-primary">{node.name}</h4>
            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
              node.status === 'normal' ? 'bg-success/10 text-success border border-success/20' : 
              node.status === 'warning' ? 'bg-warning/10 text-warning border border-warning/20' : 
              'bg-error/10 text-error border border-error/20'
            }`}>
              {node.status}
            </span>
          </div>
          {disruption && (
            <div className="mb-3 p-2 bg-error/10 border border-error/20 rounded-lg text-[10px] text-error">
              <strong className="block mb-0.5 uppercase tracking-wider text-[8px]">Current Impact:</strong>
              {disruption.description}
            </div>
          )}
          <div className="space-y-1.5 text-[10px] font-medium text-muted">
            <div className="flex justify-between items-center bg-card/50 p-1.5 rounded-md">
              <span className="uppercase text-[8px] font-black">Location</span>
              <span className="text-primary">{node.region}</span>
            </div>
            {node.type === 'supplier' ? (
              <div className="flex justify-between items-center bg-card/50 p-1.5 rounded-md">
                <span className="uppercase text-[8px] font-black">Lead Time</span>
                <span className="text-primary">{(node as Supplier).lead} Days</span>
              </div>
            ) : (
              <div className="flex justify-between items-center bg-card/50 p-1.5 rounded-md">
                <span className="uppercase text-[8px] font-black">Inventory</span>
                <span className="text-primary">{(node as Warehouse).stock}%</span>
              </div>
            )}
          </div>
        </div>
      </Popup>
    </Marker>
  );
};

export const SupplyChainMap = ({ 
  suppliers, 
  warehouses, 
  routes, 
  disruptions, 
  highlightNodeIds = [], 
  highlightRouteIds = [],
  centerNode,
  onNodeClick,
  onRouteClick,
  theme = 'dark',
  height = '100%',
  className = ''
}: SupplyChainMapProps) => {
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
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          noWrap={true}
          url={theme === 'dark' 
            ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          }
        />
        
        {routes.map(r => {
          const fromNode = [...suppliers, ...warehouses].find(n => n.id === r.from);
          const toNode = [...suppliers, ...warehouses].find(n => n.id === r.to);
          const disruption = disruptions.find(d => d.targetId === r.id);
          const isHighlighted = highlightRouteIds.includes(r.id);

          if (fromNode && toNode) {
            const baseColor = r.mode === 'air' ? '#3b82f6' : r.mode === 'sea' ? '#6366f1' : '#f59e0b';
            const color = disruption ? getSeverityColor(disruption.severity, baseColor) : isHighlighted ? '#3b82f6' : baseColor;
            
            return (
              <Polyline
                key={`${r.id}-${disruption?.severity || 0}-${isHighlighted}`}
                positions={[[fromNode.lat, fromNode.lng], [toNode.lat, toNode.lng]]}
                eventHandlers={{ click: () => onRouteClick?.(r.id) }}
                pathOptions={{
                  color: color,
                  weight: isHighlighted ? 6 : (disruption ? 4 : 2),
                  opacity: isHighlighted ? 1 : (disruption ? 0.9 : 0.4),
                  dashArray: disruption ? '10, 10' : (r.mode === 'land' ? '5, 8' : undefined),
                }}
              >
                <Popup>
                  <div className="p-1 min-w-[150px]">
                    <div className="font-extrabold text-xs uppercase mb-1">{r.mode} Route</div>
                    <div className="text-[10px] text-muted flex justify-between">
                      <span>Capacity:</span>
                      <span className="text-primary">{r.capacity} units</span>
                    </div>
                    {disruption && (
                      <div className="mt-2 p-2 bg-error/10 border border-error/20 rounded text-[10px] text-error font-medium">
                        {disruption.description}
                      </div>
                    )}
                  </div>
                </Popup>
              </Polyline>
            );
          }
          return null;
        })}

        {[...suppliers, ...warehouses].map((node) => {
          const disruption = disruptions.find(d => d.targetType === 'node' && d.targetId === node.id);
          const isHighlighted = highlightNodeIds.includes(node.id);
          // Using a composite key to force Leaflet to re-render the marker when severity or highlights change
          // This ensures the icon HTML is updated immediately in the DOM
          const markerKey = `${node.id}-${disruption?.severity || 0}-${isHighlighted}`;
          
          return (
            <SupplyNodeMarker 
              key={markerKey} 
              node={node} 
              disruption={disruption}
              isHighlighted={isHighlighted}
              onClick={onNodeClick}
            />
          );
        })}
      </MapContainer>
    </div>
  );
};
