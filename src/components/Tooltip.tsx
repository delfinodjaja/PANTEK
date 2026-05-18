import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface TooltipProps {
  children: React.ReactNode;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export const Tooltip = ({ children, content, position = 'top' }: TooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);

  const getPositionClasses = () => {
    switch (position) {
      case 'bottom':
        return 'top-full left-1/2 -translate-x-1/2 mt-2';
      case 'left':
        return 'right-full top-1/2 -translate-y-1/2 mr-2';
      case 'right':
        return 'left-full top-1/2 -translate-y-1/2 ml-2';
      case 'top':
      default:
        return 'bottom-full left-1/2 -translate-x-1/2 mb-2';
    }
  };

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: position === 'top' ? 5 : -5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: position === 'top' ? 5 : -5 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className={`absolute z-[2000] px-3 py-2 bg-panel border border-border rounded-xl shadow-2xl pointer-events-none min-w-[180px] ${getPositionClasses()}`}
          >
            <div className="text-[10px] font-bold text-primary leading-tight">
              {content}
            </div>
            {/* Arrow */}
            <div 
              className={`absolute w-2 h-2 bg-panel border-r border-b border-border rotate-45 ${
                position === 'top' ? 'left-1/2 -bottom-1 -translate-x-1/2 border-l-0 border-t-0' :
                position === 'bottom' ? 'left-1/2 -top-1 -translate-x-1/2 border-t border-l' :
                position === 'left' ? 'top-1/2 -right-1 -translate-y-1/2 border-t border-r' :
                'top-1/2 -left-1 -translate-y-1/2 border-b border-l'
              }`}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
