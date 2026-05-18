import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Key, Shield, AlertCircle } from 'lucide-react';
import { useChain } from '../context/ChainContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { userApiKey, setUserApiKey } = useChain();
  const [tempKey, setTempKey] = useState(userApiKey);

  const handleSave = () => {
    setUserApiKey(tempKey);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-panel border border-border w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
              id="settings-modal"
            >
              <div className="p-6 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-accent/10 rounded-lg">
                    <Key className="w-5 h-5 text-accent" />
                  </div>
                  <h2 className="text-xl font-semibold text-primary">System Settings</h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-card rounded-full transition-colors text-muted hover:text-primary"
                  id="close-settings"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="space-y-2">
                  <label htmlFor="api-key" className="text-sm font-medium text-muted flex items-center gap-2">
                    Gemini API Key
                    <span className="text-[10px] bg-card px-1.5 py-0.5 rounded border border-border">REQUIRED</span>
                  </label>
                  <div className="relative">
                    <input
                      id="api-key"
                      type="password"
                      value={tempKey}
                      onChange={(e) => setTempKey(e.target.value)}
                      placeholder="Enter your API Key..."
                      className="w-full bg-card border border-border rounded-xl px-4 py-3 text-primary focus:ring-2 focus:ring-accent/50 outline-none transition-all pr-10"
                    />
                    <Shield className="w-4 h-4 text-muted absolute right-3 top-1/2 -translate-y-1/2" />
                  </div>
                  <p className="text-[11px] text-muted leading-relaxed">
                    This key is stored locally in your browser. It is used to authenticate AI-powered simulations and analyses. 
                    <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-accent hover:underline ml-1">
                      Get a key here.
                    </a>
                  </p>
                </div>

                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex gap-3">
                  <AlertCircle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-warning">API Key Notice</p>
                    <p className="text-xs text-warning/80">
                      If no key is provided, the system will attempt to use the global server-side key (if configured). 
                      Your local key always takes precedence.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-card/50 border-t border-border flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-border text-primary font-medium hover:bg-card transition-colors"
                  id="cancel-settings"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-accent text-white font-medium hover:opacity-90 transition-all shadow-lg shadow-accent/20"
                  id="save-settings"
                >
                  Save Changes
                </button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
