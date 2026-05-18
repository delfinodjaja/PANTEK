import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  BarChart3, 
  Globe, 
  Zap, 
  Activity, 
  Beaker, 
  Brain, 
  History, 
  ChevronLeft, 
  ChevronRight,
  AlertTriangle,
  Package,
  Settings
} from 'lucide-react';
import { useChain } from '../context/ChainContext';
import { SettingsModal } from './SettingsModal';

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  collapsed: boolean;
}

const NavItem = ({ to, icon, label, collapsed }: NavItemProps) => {
  return (
    <NavLink 
      to={to} 
      className={({ isActive }) => `
        flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative
        ${isActive 
          ? 'bg-accent text-white shadow-xl shadow-accent/30 translate-x-1' 
          : 'text-muted hover:bg-card hover:text-primary hover:translate-x-1'}
      `}
    >
      {({ isActive }) => (
        <>
          <div className={`shrink-0 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>{icon}</div>
          {!collapsed && <span className="text-sm font-bold tracking-tight">{label}</span>}
          {isActive && <motion.div layoutId="active-nav" className="absolute left-0 w-1 h-6 bg-white rounded-r-full" />}
        </>
      )}
    </NavLink>
  );
};

import logo from '../assets/images/logo.jpeg';
import { motion, AnimatePresence } from 'motion/react';

export const Sidebar = () => {
  const [collapsed, setCollapsed] = React.useState(false);
  const { stats, isSettingsOpen, setIsSettingsOpen } = useChain();

  return (
    <>
      <aside 
        className={`
          bg-panel border-r border-border h-screen flex flex-col transition-all duration-300 relative z-30
          ${collapsed ? 'w-[72px]' : 'w-[260px]'}
          max-sm:fixed max-sm:bottom-0 max-sm:left-0 max-sm:w-full max-sm:h-[64px] max-sm:flex-row max-sm:border-r-0 max-sm:border-t
        `}
      >
        {/* Brand */}
        <div className={`p-6 mb-4 flex items-center gap-3 max-sm:hidden ${collapsed ? 'justify-center px-0' : ''}`}>
          <div className="w-12 h-12 bg-panel rounded-2xl flex items-center justify-center shrink-0 overflow-hidden relative border border-border shadow-inner p-1">
            <img src={logo} alt="PANTEK" className="w-full h-full object-contain" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <div className="font-black text-2xl tracking-tighter text-primary italic leading-none">PANTEK</div>
              <div className="font-mono text-[7px] text-muted tracking-widest leading-tight uppercase font-black opacity-80 mt-1">Intelligence Systems</div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className={`flex-1 px-4 space-y-1.5 max-sm:flex max-sm:space-y-0 max-sm:px-2 max-sm:items-center max-sm:w-full max-sm:justify-around text-center overflow-y-auto custom-scrollbar`}>
          <NavItem to="/" icon={<BarChart3 size={20} />} label="Overview" collapsed={collapsed} />
          <NavItem to="/map" icon={<Globe size={20} />} label="Live Map" collapsed={collapsed} />
          <NavItem to="/monitoring" icon={<Activity size={20} />} label="Monitoring" collapsed={collapsed} />
          <NavItem to="/assets" icon={<Package size={20} />} label="Inventory" collapsed={collapsed} />
          <NavItem to="/lab" icon={<Beaker size={20} />} label="Simulation Lab" collapsed={collapsed} />
          <NavItem to="/analysis" icon={<Brain size={20} />} label="Critical Analysis" collapsed={collapsed} />
          <NavItem to="/log" icon={<History size={20} />} label="History Log" collapsed={collapsed} />
          
          <div className="pt-4 mt-4 border-t border-border/50">
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative w-full
                text-muted hover:bg-card hover:text-primary hover:translate-x-1
              `}
            >
              <Settings size={20} className="group-hover:rotate-45 transition-transform duration-300" />
              {!collapsed && <span className="text-sm font-bold tracking-tight">Configuration</span>}
            </button>
          </div>
        </nav>

        {/* Collapse Toggle */}
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-24 w-7 h-7 bg-panel border border-border rounded-full flex items-center justify-center text-muted hover:text-accent shadow-lg transition-all hover:scale-110 z-[50] max-sm:hidden"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>

      {/* Status Footer */}
      {!collapsed && (
        <div className="p-5 mt-auto max-sm:hidden m-4 rounded-2xl bg-card/40 border border-border/60 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 rounded-full -mr-12 -mt-12 transition-transform duration-500 group-hover:scale-150" />
          <div className="relative z-10">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-2.5 h-2.5 rounded-full bg-success shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse" />
              <span className="text-[10px] font-black uppercase text-muted tracking-widest">Global Twin Online</span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span className="text-muted">Network Health</span>
                <span className="text-success">{stats.health}%</span>
              </div>
              <div className="h-1.5 bg-border rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.health}%` }}
                  className="h-full bg-success"
                />
              </div>
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span className="text-muted text-[10px]">Critical Alerts</span>
                <span className="text-error flex items-center gap-1 leading-none uppercase">
                  <AlertTriangle size={10} />
                  {stats.alertNodes}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </aside>
    </>
  );
};
