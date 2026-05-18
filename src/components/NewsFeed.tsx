import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Rss, Pause, Play, Zap, Filter, 
  MapPin, Clock, AlertTriangle, 
  ChevronRight, ArrowRight, Activity,
  Globe, Info
} from 'lucide-react';
import { useChain, NewsItem } from '../context/ChainContext';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export const NewsFeed: React.FC = () => {
  const { 
    liveNews, 
    isNewsPaused, 
    setIsNewsPaused, 
    newsSpeed, 
    setNewsSpeed,
    newsFilter,
    setNewsFilter,
    processNewsItem
  } = useChain();

  const navigate = useNavigate();

  const filteredNews = useMemo(() => {
    return liveNews.filter(item => {
      if (newsFilter.severity && item.severity !== newsFilter.severity) return false;
      if (newsFilter.category && item.category !== newsFilter.category) return false;
      return true;
    });
  }, [liveNews, newsFilter]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-error bg-error/10 border-error/20';
      case 'high': return 'text-warning bg-warning/10 border-warning/20';
      case 'medium': return 'text-accent bg-accent/10 border-accent/20';
      default: return 'text-success bg-success/10 border-success/20';
    }
  };

  const handleInject = (news: NewsItem) => {
    // Navigate to Scenario Lab and pre-fill (via state or global signal)
    // For now, we'll store it in a way the ScenarioLab can pick it up
    localStorage.setItem('injected_scenario', JSON.stringify({
      title: news.headline,
      body: news.body
    }));
    toast.success('Intelligence injected into Scenario Lab');
    navigate('/lab');
  };

  return (
    <div className="flex flex-col h-full bg-panel/40 border-l border-border backdrop-blur-md">
      {/* Header */}
      <div className="p-6 border-b border-border space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center border border-accent/20 transition-all group-hover:scale-110">
                <Rss className="text-accent" size={20} />
              </div>
              <motion.div 
                animate={{ scale: [1, 1.2, 1], opacity: [1, 0.5, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-1 -right-1 w-3 h-3 bg-error rounded-full border-2 border-panel shadow-[0_0_10px_rgba(239,68,68,0.5)]"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-black uppercase tracking-widest text-primary">Global Intel</h2>
                <div className="px-1.5 py-0.5 rounded bg-error/10 text-[8px] font-black text-error border border-error/20 animate-pulse">LIVE</div>
              </div>
              <p className="text-[10px] text-muted font-bold tracking-tight opacity-60">Real-time supply chain signals</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button 
              onClick={() => setIsNewsPaused(!isNewsPaused)}
              className="p-2 hover:bg-white/5 rounded-lg transition-colors text-muted hover:text-primary"
            >
              {isNewsPaused ? <Play size={16} /> : <Pause size={16} />}
            </button>
          </div>
        </div>

        {/* Speed & Filter Controls */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
             <div className="flex items-center gap-1">
                {[15000, 8000, 3000].map((s) => (
                  <button
                    key={s}
                    onClick={() => setNewsSpeed(s)}
                    className={`px-2 py-1 text-[8px] font-black uppercase tracking-tighter rounded transition-all border ${
                      newsSpeed === s 
                        ? 'bg-accent text-white border-accent' 
                        : 'bg-white/5 text-muted border-border hover:border-accent/40'
                    }`}
                  >
                    {s === 15000 ? 'Slow' : s === 8000 ? 'Normal' : 'Fast'}
                  </button>
                ))}
             </div>
             <div className="flex items-center gap-1.5">
                <Filter size={10} className="text-muted" />
                <select 
                  className="bg-transparent text-[9px] font-black uppercase text-muted outline-none border-none cursor-pointer hover:text-primary"
                  onChange={(e) => setNewsFilter({ ...newsFilter, severity: e.target.value || null })}
                  value={newsFilter.severity || ''}
                >
                  <option value="">All Severity</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
             </div>
          </div>
        </div>
      </div>

      {/* News List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
        <AnimatePresence initial={false}>
          {filteredNews.map((news) => (
            <motion.div
              key={news.id}
              initial={{ height: 0, opacity: 0, x: 20 }}
              animate={{ height: 'auto', opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="overflow-hidden"
            >
              <div className={`p-4 rounded-2xl border transition-all hover:scale-[1.02] active:scale-[0.98] cursor-default group relative bg-card ${
                news.severity === 'critical' ? 'border-error/40 shadow-[0_0_15px_rgba(239,68,68,0.1)] animate-pulse' : 'border-border'
              }`}>
                {/* News Card Content */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                       <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${getSeverityColor(news.severity)}`}>
                         {news.severity}
                       </span>
                       <span className="flex items-center gap-1 text-[8px] font-bold text-muted uppercase opacity-60">
                         <Globe size={10} /> {news.region}
                       </span>
                    </div>
                    <span className="flex items-center gap-1 text-[9px] font-mono text-muted">
                      <Clock size={10} /> {formatDistanceToNow(news.timestampMillis, { addSuffix: true })}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-xs font-black text-primary leading-tight group-hover:text-accent transition-colors tracking-tight">
                      {news.headline}
                    </h3>
                    <p className="text-[10px] text-muted font-medium leading-relaxed italic opacity-80">
                      "{news.body}"
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border/40">
                    <div className="flex items-center gap-2">
                      <div className="text-[9px] font-black text-accent uppercase tracking-widest bg-accent/5 px-2 py-1 rounded">
                        {news.impact}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                       <button 
                         onClick={() => handleInject(news)}
                         className="p-1.5 rounded-lg bg-white/5 text-muted hover:text-accent hover:bg-accent/10 transition-all hover:scale-110"
                         title="Inject into Simulation"
                       >
                         <Zap size={14} />
                       </button>
                       <button 
                         onClick={() => processNewsItem(news)}
                         className="p-1.5 rounded-lg bg-white/5 text-muted hover:text-primary hover:bg-white/10 transition-all hover:scale-110"
                         title="Analyze Impact"
                       >
                         <ArrowRight size={14} />
                       </button>
                    </div>
                  </div>

                  {/* Impact Nodes Tooltip-like preview */}
                  {news.affectedNodes.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {news.affectedNodes.map(nodeId => (
                        <span key={nodeId} className="text-[7px] font-black text-muted/60 px-1 border border-border/30 rounded uppercase tracking-tighter">
                          {nodeId}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {filteredNews.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
            <Info className="text-muted mb-3" size={32} />
            <p className="text-xs font-black uppercase tracking-widest text-muted">No signals matching filter</p>
          </div>
        )}
      </div>
    </div>
  );
};
