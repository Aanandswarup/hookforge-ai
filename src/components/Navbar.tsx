import React from 'react';
import { Sparkles, Key, Zap, Crown } from 'lucide-react';
import { UserCredits } from '../types';

interface NavbarProps {
  credits: UserCredits;
  onOpenUpgrade: () => void;
  onOpenApiKey: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ credits, onOpenUpgrade, onOpenApiKey }) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-surface-border/80 bg-surface-base/85 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-1.5 sm:gap-4">
        
        {/* Brand */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Specular logo badge with glowing border */}
          <div className="relative group w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-b from-[#1a2333] to-surface-card border border-white/10 flex items-center justify-center shadow-[0_0_20px_-3px_rgba(34,197,94,0.35),inset_0_1px_1px_0_rgba(255,255,255,0.2)] transition-all duration-300 group-hover:border-emerald-500/40 group-hover:shadow-[0_0_25px_rgba(34,197,94,0.5)]">
            <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.6)] stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-sm sm:text-xl font-bold tracking-tight text-white font-sans">
                HookForge<span className="text-emerald-400">.ai</span>
              </span>
              <span className="hidden sm:inline-flex items-center text-[10px] font-mono font-medium tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                v1.0
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden md:block font-normal">
              Viral Scripts, Hooks & Zero-Cost Carousel Studio
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* API Key Modal Button (Refined BYOK Status Pill) */}
          <button
            onClick={onOpenApiKey}
            title={credits.byokActive ? "Custom Gemini API Key active (Unlimited runs)" : "Add your Gemini API Key"}
            className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-mono font-medium border transition-all ${
              credits.byokActive
                ? 'bg-emerald-950/30 hover:bg-emerald-950/50 border-emerald-500/35 hover:border-emerald-500/60 text-emerald-300 shadow-[0_0_15px_-4px_rgba(16,185,129,0.3)]'
                : 'bg-surface-card/90 hover:bg-surface-elevated border-surface-border hover:border-slate-600 text-slate-300 hover:text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]'
            }`}
          >
            {credits.byokActive ? (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
            ) : (
              <Key className="w-3.5 h-3.5 text-slate-400" />
            )}
            <span className="hidden sm:inline">
              {credits.byokActive ? 'BYOK Active' : 'API Key'}
            </span>
            <span className="sm:hidden text-[11px]">
              {credits.byokActive ? 'BYOK' : 'Key'}
            </span>
          </button>

          {/* Credits Counter or Pro Badge (Refined credits counter pill) */}
          {credits.isPro ? (
            <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] sm:text-xs font-mono font-semibold shadow-[0_0_15px_-4px_rgba(245,158,11,0.25)]">
              <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="hidden sm:inline">LIFETIME PRO</span>
              <span className="sm:hidden text-[11px]">PRO</span>
            </div>
          ) : (
            <button
              onClick={onOpenUpgrade}
              title="Click to upgrade credits"
              className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-surface-card/90 hover:bg-surface-elevated border border-surface-border hover:border-slate-600 text-slate-200 text-[11px] sm:text-xs font-mono font-medium transition-all shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
            >
              <Zap className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="hidden sm:inline">
                {credits.byokActive ? 'Unlimited (BYOK)' : `${credits.freeCreditsRemaining} Free Left`}
              </span>
              <span className="sm:hidden text-[11px]">
                {credits.byokActive ? '∞' : `${credits.freeCreditsRemaining}/3`}
              </span>
            </button>
          )}

          {/* Upgrade CTA (Sleek Upgrade button with subtle gradient and glow) */}
          {!credits.isPro && (
            <button
              onClick={onOpenUpgrade}
              className="relative group overflow-hidden flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3.5 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-semibold text-white bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 shadow-[0_0_20px_-3px_rgba(16,185,129,0.35),inset_0_1px_0_rgba(255,255,255,0.25)] hover:shadow-[0_0_25px_-2px_rgba(16,185,129,0.55)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shrink-0"
            >
              <Crown className="w-3.5 h-3.5 text-white stroke-[2.5] shrink-0" />
              <span className="hidden sm:inline">Get Pro ($39 LTD)</span>
              <span className="sm:hidden text-[11px]">Pro</span>
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none transition-transform" />
            </button>
          )}
        </div>

      </div>
    </header>
  );
};
