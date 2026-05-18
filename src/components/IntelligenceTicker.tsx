import React, { useMemo } from 'react';
import { useChain } from '../context/ChainContext';
import { AlertCircle, Zap } from 'lucide-react';

export const IntelligenceTicker: React.FC = () => {
  const { liveNews } = useChain();

  const hasCritical = useMemo(() => liveNews.some(n => n.severity === 'critical'), [liveNews]);

  return (
    <div className="w-full bg-black/40 border-t border-border backdrop-blur-md overflow-hidden h-10 flex items-center shrink-0">
      <div className="bg-accent px-4 h-full flex items-center gap-2 z-10 shrink-0">
        <Zap size={14} className="text-white animate-pulse" />
        <span className="text-[10px] font-black uppercase text-white tracking-widest">Global Intelligence Ticker</span>
      </div>
      <div className="flex-1 overflow-hidden relative">
        <div className={`flex whitespace-nowrap gap-12 items-center ${hasCritical ? 'animate-[ticker_20s_linear_infinite]' : 'animate-[ticker_40s_linear_infinite]'}`}>
          {liveNews.concat(liveNews).map((item, i) => (
            <div key={`${item.id}-${i}`} className="flex items-center gap-4 group cursor-default">
              <span className={`w-1.5 h-1.5 rounded-full ${
                item.severity === 'critical' ? 'bg-error animate-ping' : 
                item.severity === 'high' ? 'bg-warning' : 'bg-muted'
              }`} />
              <span className="text-[10px] font-bold text-primary group-hover:text-accent transition-colors tracking-tight">
                {item.headline}
              </span>
              <span className="text-[9px] font-black text-accent uppercase tracking-widest opacity-60">
                {item.impact}
              </span>
            </div>
          ))}
        </div>
      </div>
      <style>{`
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
};
