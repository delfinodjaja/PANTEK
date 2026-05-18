import React from 'react';
import { Sidebar } from './Sidebar';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { useChain } from '../context/ChainContext';
import { Moon, Sun } from 'lucide-react';
import { AssessmentHeader } from './AssessmentHeader';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const { theme, setTheme } = useChain();

  return (
    <div className={`flex h-screen w-full bg-bg font-sans selection:bg-accent/40 ${theme}`}>
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Top Navigation Bar */}
        <header className="h-20 px-6 flex items-center justify-between border-b border-border bg-panel shrink-0 z-[40]">
          <div className="flex items-center gap-4">
            <AssessmentHeader />
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className="p-2.5 rounded-xl bg-card border border-border text-muted hover:text-accent hover:border-accent transition-all duration-300 group"
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? <Moon size={18} className="group-hover:rotate-12 transition-transform" /> : <Sun size={18} className="group-hover:rotate-45 transition-transform" />}
            </button>
          </div>
        </header>

        <main className="flex-1 relative flex flex-col min-h-0 bg-bg/50 custom-scrollbar overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="flex-1 flex flex-col min-h-0"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};
