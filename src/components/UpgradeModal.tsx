import React, { useState, useEffect } from 'react';
import { X, Check, Crown, Zap, ShieldCheck, Key } from 'lucide-react';
import { CreditManager } from '../services/creditManager';
import confetti from 'canvas-confetti';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [licenseKeyInput, setLicenseKeyInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Reset local input and error state when modal opens
  useEffect(() => {
    if (isOpen) {
      setLicenseKeyInput('');
      setErrorMsg('');
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

  const handleActivateKey = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const success = CreditManager.activatePro(licenseKeyInput);
    if (success) {
      confetti({ particleCount: 120, spread: 100, origin: { y: 0.5 } });
      onSuccess();
      onClose();
    } else {
      setErrorMsg('Invalid or unverified license key. Please check the key in your confirmation email.');
    }
  };

  // Set to your Gumroad product checkout link
  const CHECKOUT_URL = 'https://aanandswarup.gumroad.com/l/hookforge';

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-base/80 backdrop-blur-md animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-lg bg-surface-card border border-surface-border rounded-2xl p-6 sm:p-8 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.08)] overflow-hidden">
        
        {/* Ambient Top Glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-36 bg-gradient-to-b from-amber-500/20 via-emerald-500/10 to-transparent blur-3xl rounded-full pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white bg-surface-elevated/80 hover:bg-[#1a2333] border border-surface-border transition-colors"
          title="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/10 to-amber-500/20 border border-amber-500/30 text-amber-300 text-[11px] font-mono font-medium tracking-wide">
            <Crown className="w-3.5 h-3.5 text-amber-400" />
            Founder Early-Bird Offer
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-sans">
            Unlock HookForge <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">PRO</span>
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
            Automate your entire viral content production pipeline with zero limits.
          </p>
        </div>

        {/* Features Checklist in Inset Well */}
        <div className="space-y-3 p-4 sm:p-5 rounded-xl bg-surface-well border border-surface-border/80 mb-6 text-xs text-slate-200 shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)]">
          <div className="flex items-start gap-2.5">
            <div className="w-4 h-4 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5">
              <Check className="w-3 h-3 text-emerald-400" />
            </div>
            <span><strong className="text-white font-semibold">Zero Watermarks:</strong> Clean 100% white-label exports on all carousels</span>
          </div>
          <div className="flex items-start gap-2.5">
            <div className="w-4 h-4 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5">
              <Check className="w-3 h-3 text-emerald-400" />
            </div>
            <span><strong className="text-white font-semibold">Unlimited Content Runs:</strong> Generate unlimited viral hooks, scripts & decks</span>
          </div>
          <div className="flex items-start gap-2.5">
            <div className="w-4 h-4 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5">
              <Check className="w-3 h-3 text-emerald-400" />
            </div>
            <span><strong className="text-white font-semibold">All 5 Canvas Themes:</strong> High-DPI 1080×1350 PNG & vector multi-page PDF</span>
          </div>
          <div className="flex items-start gap-2.5">
            <div className="w-4 h-4 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5">
              <Check className="w-3 h-3 text-emerald-400" />
            </div>
            <span><strong className="text-white font-semibold">Full Commercial License:</strong> Unlimited use for client deliverables & agency work</span>
          </div>
        </div>

        {/* Pricing & CTA */}
        <div className="text-center space-y-4 mb-6">
          <div className="flex items-baseline justify-center gap-2.5">
            <span className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">$39</span>
            <span className="text-sm text-slate-500 line-through font-mono">$149</span>
            <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              ONE-TIME LIFETIME PASS
            </span>
          </div>

          <a
            href={CHECKOUT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3.5 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2 text-white bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 shadow-[0_0_25px_-5px_rgba(16,185,129,0.4),inset_0_1px_0_rgba(255,255,255,0.25)] hover:shadow-[0_0_35px_-2px_rgba(16,185,129,0.6)] hover:scale-[1.01] active:scale-[0.99] transition-all"
          >
            <Zap className="w-4 h-4 fill-white" />
            <span>Claim Lifetime Access ($39)</span>
          </a>

          <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>14-Day Money-Back Guarantee • Instant License Delivery</span>
          </div>
        </div>

        {/* Already have a key section */}
        <div className="pt-4 border-t border-surface-border text-center">
          <form onSubmit={handleActivateKey} className="space-y-2.5">
            <label className="block text-[11px] font-mono font-semibold text-slate-400">
              Already purchased? Enter your License Key below:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="HF-PRO-XXXX-XXXX"
                value={licenseKeyInput}
                onChange={(e) => setLicenseKeyInput(e.target.value)}
                className="flex-1 px-3 py-2.5 rounded-xl bg-surface-well border border-surface-border text-xs text-white placeholder-slate-500 font-mono uppercase outline-none focus:border-emerald-500/70 focus:ring-1 focus:ring-emerald-500/30 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)]"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-surface-elevated hover:bg-[#1a2333] border border-surface-border text-xs font-semibold text-white transition-all shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
              >
                Activate
              </button>
            </div>
            {errorMsg && <p className="text-[11px] text-rose-400">{errorMsg}</p>}
          </form>
        </div>

      </div>
    </div>
  );
};
