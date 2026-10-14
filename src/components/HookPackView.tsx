import React, { useState } from 'react';
import { HookItem } from '../types';
import {
  Copy,
  Check,
  Flame,
  Brain,
  ShieldAlert,
  Sparkles,
  Filter,
  Download,
  Zap,
  TrendingUp,
} from 'lucide-react';

interface HookPackViewProps {
  hooks: HookItem[];
  showToast: (text: string, type?: 'success' | 'info' | 'error') => void;
}

interface ViralityGaugeProps {
  score: number;
}

const ViralityGauge: React.FC<ViralityGaugeProps> = ({ score }) => {
  const normalizedScore = Math.min(100, Math.max(0, Math.round(score)));
  const radius = 14;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (normalizedScore / 100) * circumference;

  const isHighScore = normalizedScore >= 90;
  const isGoodScore = normalizedScore >= 80 && normalizedScore < 90;
  const isModerateScore = normalizedScore >= 70 && normalizedScore < 80;

  let strokeColor = '#64748b';
  let textColor = 'text-slate-400';
  let tierLabel = 'Standard';
  let glowStyle: React.CSSProperties | undefined = undefined;

  if (isHighScore) {
    strokeColor = '#10b981';
    textColor = 'text-emerald-400';
    tierLabel = 'Top 1% Viral';
    glowStyle = {
      filter: 'drop-shadow(0 0 8px rgba(16, 185, 129, 0.55))',
    };
  } else if (isGoodScore) {
    strokeColor = '#06b6d4';
    textColor = 'text-cyan-400';
    tierLabel = 'High Retentive';
    glowStyle = {
      filter: 'drop-shadow(0 0 6px rgba(6, 182, 212, 0.4))',
    };
  } else if (isModerateScore) {
    strokeColor = '#f59e0b';
    textColor = 'text-amber-400';
    tierLabel = 'Moderate';
    glowStyle = {
      filter: 'drop-shadow(0 0 5px rgba(245, 158, 11, 0.3))',
    };
  }

  return (
    <div
      className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-surface-well border border-surface-border shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)] shrink-0"
      title={`Virality Score: ${normalizedScore}/100 (${tierLabel})`}
    >
      <div className="relative flex items-center justify-center w-8 h-8 shrink-0">
        <svg className="w-8 h-8 -rotate-90 origin-center" viewBox="0 0 36 36">
          <circle
            cx="18"
            cy="18"
            r={radius}
            className="stroke-surface-border"
            strokeWidth="3"
            fill="none"
          />
          <circle
            cx="18"
            cy="18"
            r={radius}
            fill="none"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            stroke={strokeColor}
            style={glowStyle}
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <span className={`absolute font-mono font-bold text-[10px] ${textColor}`}>
          {normalizedScore}
        </span>
      </div>

      <div className="flex flex-col leading-tight">
        <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400 font-medium">
          Virality
        </span>
        <span className={`text-[10px] font-mono font-semibold ${textColor}`}>
          {tierLabel}
        </span>
      </div>
    </div>
  );
};

const getHookTypeMeta = (type: HookItem['type']) => {
  switch (type) {
    case 'Curiosity Gap':
      return {
        badgeClass: 'bg-purple-500/10 text-purple-300 border-purple-500/30',
        icon: <Sparkles className="w-3 h-3 text-purple-400 shrink-0" />,
      };
    case 'Contrarian':
      return {
        badgeClass: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
        icon: <Zap className="w-3 h-3 text-rose-400 shrink-0" />,
      };
    case 'Negative / Fear':
      return {
        badgeClass: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
        icon: <ShieldAlert className="w-3 h-3 text-amber-400 shrink-0" />,
      };
    case 'Story Driven':
      return {
        badgeClass: 'bg-blue-500/10 text-blue-300 border-blue-500/30',
        icon: <Flame className="w-3 h-3 text-blue-400 shrink-0" />,
      };
    case 'Data / Proof':
      return {
        badgeClass: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
        icon: <TrendingUp className="w-3 h-3 text-emerald-400 shrink-0" />,
      };
    default:
      return {
        badgeClass: 'bg-slate-500/10 text-slate-300 border-slate-500/30',
        icon: <Sparkles className="w-3 h-3 text-slate-400 shrink-0" />,
      };
  }
};

export const HookPackView: React.FC<HookPackViewProps> = ({ hooks, showToast }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedFrameId, setCopiedFrameId] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string>('All');

  if (!hooks || hooks.length === 0) {
    return (
      <div className="card-matte p-8 text-center text-slate-400 text-sm">
        No viral hooks generated yet. Generate a topic above to view your hook pack.
      </div>
    );
  }

  const highestScoreHook = hooks.reduce(
    (prev, current) => (current.viralityScore > prev.viralityScore ? current : prev),
    hooks[0]
  );

  const handleCopy = (hook: HookItem) => {
    const textToCopy = `HOOK: "${hook.hookText}"\nFIRST FRAME: "${hook.suggestedFirstFrameText}"\nVIRALITY SCORE: ${hook.viralityScore}/100\nPSYCHOLOGY: ${hook.psychologicalTrigger}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(hook.id);
    showToast('Hook copied to clipboard!', 'success');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyFirstFrame = (hook: HookItem) => {
    navigator.clipboard.writeText(hook.suggestedFirstFrameText);
    setCopiedFrameId(hook.id);
    showToast('First frame text copied!', 'success');
    setTimeout(() => setCopiedFrameId(null), 2000);
  };

  const handleExportAll = () => {
    const divider = '═'.repeat(64);
    const subDivider = '─'.repeat(64);
    const dateStr = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

    const header = [
      divider,
      `HOOKFORGE AI — 5 VIRAL HOOK VARIANTS`,
      `Generated: ${dateStr} | Total Hooks: ${hooks.length}`,
      `Engineered for Short-Form Video (TikTok, Reels, Shorts, LinkedIn)`,
      divider,
      '',
    ].join('\n');

    const body = hooks
      .map((h, i) => {
        const isHighest = h.id === highestScoreHook?.id;
        return [
          `[HOOK ${i + 1}: ${h.type.toUpperCase()}]${isHighest ? ' ★ HIGHEST POTENTIAL' : ''}`,
          `Virality Score: ${h.viralityScore}/100`,
          `Psychological Mechanism: ${h.psychologicalTrigger}`,
          '',
          `SPOKEN HOOK (0–3s):`,
          `"${h.hookText}"`,
          '',
          `FIRST FRAME ON-SCREEN TEXT (0–1s):`,
          `"${h.suggestedFirstFrameText}"`,
          '',
          subDivider,
        ].join('\n');
      })
      .join('\n\n');

    const footer = [
      '',
      `Generated by HookForge AI`,
      `Best Practice: Film at least 2 hooks for the same core video body to A/B test on social algorithms.`,
      divider,
    ].join('\n');

    const fullText = `${header}\n${body}\n${footer}`;
    const blob = new Blob([fullText], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `hookforge_viral_hooks_${Date.now()}.txt`;
    link.click();
    showToast('Downloaded all hooks as formatted TXT file!', 'success');
  };

  const uniqueTypes = Array.from(new Set(hooks.map((h) => h.type)));
  const filteredHooks = selectedType === 'All' ? hooks : hooks.filter((h) => h.type === selectedType);

  return (
    <div className="w-full space-y-4">
      {/* Header with filters and export */}
      <div className="relative card-matte overflow-hidden p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Specular top border line */}
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)] shrink-0" />
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
              5 Psychological Hook Variants
            </h3>
            <span className="hidden sm:inline-flex items-center text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              A/B Creative Suite
            </span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed max-w-xl">
            Engineered using proven attention-retention psychology. Test all 5 hook variations to maximize 3-second hold rates.
          </p>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0">
          {/* Quick Filter */}
          <div className="flex items-center gap-1.5 bg-surface-well px-2.5 py-1.5 rounded-xl border border-surface-border text-xs font-mono shadow-[inset_0_1px_2px_rgba(0,0,0,0.4)]">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="bg-transparent text-slate-200 text-xs outline-none pr-1 cursor-pointer font-sans"
            >
              <option value="All" className="bg-surface-elevated text-slate-200">
                All Hooks ({hooks.length})
              </option>
              {uniqueTypes.map((type) => (
                <option key={type} value={type} className="bg-surface-elevated text-slate-200">
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Bulk Export Button */}
          <button
            onClick={handleExportAll}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-elevated hover:bg-surface-card border border-surface-border hover:border-slate-600 text-slate-200 hover:text-white text-xs font-mono font-medium shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] hover:shadow-[0_0_15px_-4px_rgba(16,185,129,0.3)] transition-all cursor-pointer"
            title="Download all 5 hooks as formatted TXT"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-sans font-semibold">Export TXT</span>
          </button>
        </div>
      </div>

      {/* Grid of Hooks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredHooks.map((hook, index) => {
          const isCopied = copiedId === hook.id;
          const isFrameCopied = copiedFrameId === hook.id;
          const isHighest = hook.id === highestScoreHook?.id;
          const typeMeta = getHookTypeMeta(hook.type);

          return (
            <div
              key={hook.id || index}
              className={`relative card-matte overflow-hidden p-4 sm:p-5 flex flex-col justify-between transition-all duration-200 group hover:shadow-surface-elevated hover:border-slate-600/80 ${
                isHighest && selectedType === 'All'
                  ? 'md:col-span-2 border-emerald-500/40 bg-gradient-to-b from-[#0c1626] to-surface-card shadow-[0_4px_30px_-5px_rgba(16,185,129,0.15)]'
                  : 'border-surface-border bg-surface-card'
              }`}
            >
              {/* Subtle Specular Top Border */}
              <div
                className={`absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent ${
                  isHighest ? 'via-emerald-400/60' : 'via-white/10 group-hover:via-white/20'
                } to-transparent transition-opacity`}
              />

              <div>
                {/* Header Row: Badges & Virality Gauge */}
                <div className="flex items-start justify-between gap-3 mb-3.5">
                  <div className="flex flex-wrap items-center gap-1.5 min-w-0">
                    {/* Hook Type Pill */}
                    <span
                      className={`inline-flex items-center gap-1.5 text-[11px] font-mono font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${typeMeta.badgeClass}`}
                    >
                      {typeMeta.icon}
                      {hook.type}
                    </span>

                    {/* Highlighted Highest Potential Badge Pill */}
                    {isHighest && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 shadow-[0_0_12px_-2px_rgba(16,185,129,0.4)]">
                        <Sparkles className="w-3 h-3 text-emerald-400" />
                        Highest Potential
                      </span>
                    )}
                  </div>

                  {/* Feature 16: Interactive Virality Progress Gauge */}
                  <ViralityGauge score={hook.viralityScore} />
                </div>

                {/* Spoken Hook Text */}
                <p className="text-base sm:text-lg font-semibold text-slate-100 leading-snug sm:leading-relaxed mb-4 tracking-[-0.01em]">
                  "{hook.hookText}"
                </p>

                {/* Feature 18: Frame 0-1 Visual Badge & On-Screen Text Suggestion */}
                <div className="surface-well-inset p-3 rounded-xl mb-4 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-400">
                      <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>Suggested First Frame (0–1s)</span>
                    </div>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 shrink-0">
                      Visual Anchor
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-surface-base border border-surface-border">
                    <code className="text-xs font-mono font-medium text-amber-200/90 break-words leading-relaxed select-all">
                      {hook.suggestedFirstFrameText}
                    </code>
                    <button
                      onClick={() => handleCopyFirstFrame(hook)}
                      title="Copy First Frame Text"
                      className="p-1.5 rounded-md hover:bg-surface-elevated text-slate-400 hover:text-slate-200 transition-colors shrink-0 cursor-pointer"
                    >
                      {isFrameCopied ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Footer Row: Psychological Theory Pill & 1-Click Copy */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-3 border-t border-surface-border/80 mt-auto">
                {/* Feature 18: Psychological Trigger Theory Pill */}
                <div className="flex items-center gap-1.5 min-w-0" title={hook.psychologicalTrigger}>
                  <span className="badge-pill text-[11px] font-mono text-slate-300 truncate max-w-full">
                    <Brain className="w-3 h-3 text-purple-400 shrink-0" />
                    <span className="truncate">{hook.psychologicalTrigger}</span>
                  </span>
                </div>

                {/* Feature 17: 1-Click Copy Hook Button */}
                <button
                  onClick={() => handleCopy(hook)}
                  className={`flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-mono font-semibold transition-all shrink-0 cursor-pointer ${
                    isCopied
                      ? 'bg-emerald-500 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.5)] font-bold'
                      : 'bg-surface-elevated hover:bg-surface-well border border-surface-border hover:border-slate-500 text-slate-200 hover:text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]'
                  }`}
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                      <span>Copy Hook</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
