import React, { useState, useEffect } from 'react';
import { X, Key, ExternalLink, Check, Trash2, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { CreditManager } from '../services/creditManager';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeyUpdated: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, onKeyUpdated }) => {
  const currentKey = CreditManager.getApiKey() || '';
  const [apiKeyInput, setApiKeyInput] = useState(currentKey);
  const [showKey, setShowKey] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  // Reset local input and status message when modal opens
  useEffect(() => {
    if (isOpen) {
      setApiKeyInput(CreditManager.getApiKey() || '');
      setShowKey(false);
      setStatusMsg('');
    }
  }, [isOpen]);

  // Accessibility: Escape key listener to dismiss modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    CreditManager.setApiKey(apiKeyInput.trim());
    setStatusMsg('API Key saved successfully! Unlimited BYOK mode active.');
    onKeyUpdated();
    setTimeout(() => {
      setStatusMsg('');
      onClose();
    }, 1200);
  };

  const handleClear = () => {
    CreditManager.clearApiKey();
    setApiKeyInput('');
    setStatusMsg('API Key removed.');
    onKeyUpdated();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-base/80 backdrop-blur-md animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-md bg-surface-card border border-surface-border rounded-2xl p-6 sm:p-7 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.08)] overflow-hidden">
        
        {/* Ambient Top Glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-32 bg-emerald-500/10 blur-3xl rounded-full pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white bg-surface-elevated/80 hover:bg-[#1a2333] border border-surface-border transition-colors"
          title="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5 mb-5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-b from-[#1a2333] to-surface-card border border-white/10 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_-3px_rgba(34,197,94,0.3),inset_0_1px_1px_rgba(255,255,255,0.15)] shrink-0">
            <Key className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight font-sans">
              Gemini API Key (BYOK)
            </h3>
            <p className="text-xs text-slate-400">
              Bring Your Own Key for 100% free unlimited usage
            </p>
          </div>
        </div>

        {/* Instructions / Security Well */}
        <div className="p-3.5 rounded-xl bg-surface-well border border-surface-border/80 text-xs text-slate-300 space-y-2.5 mb-5 shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)]">
          <div className="flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed text-slate-300">
              Your API key is stored <strong className="text-white font-semibold">locally in your browser</strong> and is never sent to our servers.
            </p>
          </div>
          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-semibold transition-colors hover:underline underline-offset-2 pt-0.5"
          >
            <span>Get a free Gemini API key from Google AI Studio</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Enter Gemini API Key
              </label>
              <span className="text-[11px] font-mono text-slate-500">Format: AIzaSy...</span>
            </div>
            
            <div className="relative">
              <input
                type={showKey ? "text" : "password"}
                placeholder="AIzaSy..."
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-surface-well border border-surface-border text-xs text-white placeholder-slate-500 font-mono outline-none focus:border-emerald-500/70 focus:ring-1 focus:ring-emerald-500/30 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)]"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-200 transition-colors"
                title={showKey ? "Hide API Key" : "Show API Key"}
              >
                {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {statusMsg && (
            <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 shadow-[0_0_15px_-3px_rgba(16,185,129,0.2)] animate-fade-in">
              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>{statusMsg}</span>
            </div>
          )}

          <div className="flex items-center justify-between gap-3 pt-2">
            {currentKey ? (
              <button
                type="button"
                onClick={handleClear}
                className="px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-rose-200 border border-rose-500/25 text-xs flex items-center gap-1.5 transition-all shadow-sm"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove Key</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-white/[0.05] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-surface-base font-bold text-xs shadow-[0_0_20px_-3px_rgba(16,185,129,0.35),inset_0_1px_0_rgba(255,255,255,0.3)] transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Save Key
              </button>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
};
