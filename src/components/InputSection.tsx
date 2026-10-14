import React, { useState } from 'react';
import { Sparkles, Wand2, ArrowRight, Layers, Flame, BookOpen, Loader2 } from 'lucide-react';

interface InputSectionProps {
  onGenerate: (params: {
    topic: string;
    niche: string;
    tone: 'Contrarian' | 'Educational' | 'Storyteller' | 'High Energy' | 'Brutally Honest';
    platform: 'TikTok/Reels' | 'YouTube Shorts' | 'LinkedIn Video';
  }) => void;
  isLoading: boolean;
}

const PRESET_TEMPLATES = [
  {
    label: 'Micro-SaaS & AI',
    icon: Flame,
    topic: 'How to build and launch automated cashflow micro-SaaS tools with AI in 72 hours',
    niche: 'AI & Remote Tech Builders',
    tone: 'Contrarian' as const,
    platform: 'TikTok/Reels' as const,
  },
  {
    label: 'Freelance Tech',
    icon: Layers,
    topic: 'Why 95% of freelance developers stay underpaid and how to charge $3,000 per project',
    niche: 'Software Engineers & Freelancers',
    tone: 'Brutally Honest' as const,
    platform: 'LinkedIn Video' as const,
  },
  {
    label: 'Agency Automation',
    icon: BookOpen,
    topic: 'The 3-step automation system that replaced our 5-person agency operations',
    niche: 'B2B Agency Owners',
    tone: 'Educational' as const,
    platform: 'YouTube Shorts' as const,
  },
];

const NICHE_PRESETS = [
  'AI & Tech Builders',
  'SaaS Founders',
  'B2B Agency Owners',
  'Freelance Devs',
  'Growth Marketers',
];

const TONES: Array<{
  id: 'Contrarian' | 'Educational' | 'Storyteller' | 'High Energy' | 'Brutally Honest';
  label: string;
}> = [
  { id: 'Contrarian', label: 'Contrarian' },
  { id: 'Educational', label: 'Educational' },
  { id: 'Storyteller', label: 'Storyteller' },
  { id: 'High Energy', label: 'High Energy' },
  { id: 'Brutally Honest', label: 'Brutally Honest' },
];

const PLATFORMS: Array<{
  id: 'TikTok/Reels' | 'YouTube Shorts' | 'LinkedIn Video';
  label: string;
  badge: string;
}> = [
  { id: 'TikTok/Reels', label: 'TikTok & Reels', badge: '9:16' },
  { id: 'YouTube Shorts', label: 'YouTube Shorts', badge: 'Fast' },
  { id: 'LinkedIn Video', label: 'LinkedIn Video', badge: 'B2B' },
];

export const InputSection: React.FC<InputSectionProps> = ({ onGenerate, isLoading }) => {
  const [topic, setTopic] = useState('How to build and launch automated cashflow micro-SaaS tools with AI in 72 hours');
  const [niche, setNiche] = useState('AI & Remote Tech Builders');
  const [tone, setTone] = useState<'Contrarian' | 'Educational' | 'Storyteller' | 'High Energy' | 'Brutally Honest'>('Contrarian');
  const [platform, setPlatform] = useState<'TikTok/Reels' | 'YouTube Shorts' | 'LinkedIn Video'>('TikTok/Reels');

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!topic.trim() || isLoading) return;
    onGenerate({ topic, niche, tone, platform });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleApplyPreset = (preset: typeof PRESET_TEMPLATES[0]) => {
    setTopic(preset.topic);
    setNiche(preset.niche);
    setTone(preset.tone);
    setPlatform(preset.platform);
  };

  return (
    <div className="w-full max-w-4xl mx-auto card-matte p-5 sm:p-7 md:p-8 backdrop-blur-xl relative overflow-hidden group">
      
      {/* Specular Top Border Highlight */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/12 to-transparent pointer-events-none" />

      {/* Ambient Corner Light Glow */}
      <div className="absolute -top-24 right-1/4 w-80 h-36 bg-emerald-500/10 blur-[80px] rounded-full pointer-events-none" />

      {/* Preset Blueprints Bar */}
      <div className="flex flex-wrap items-center gap-2 mb-6 pb-4 border-b border-surface-border/60">
        <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          High-Converting Blueprints:
        </span>
        {PRESET_TEMPLATES.map((p, idx) => {
          const Icon = p.icon;
          const isActive = topic === p.topic && niche === p.niche && tone === p.tone && platform === p.platform;
          return (
            <button
              type="button"
              key={idx}
              onClick={() => handleApplyPreset(p)}
              className={`text-xs px-3 py-1.5 rounded-lg border flex items-center gap-1.5 transition-all duration-200 font-medium cursor-pointer ${
                isActive
                  ? 'bg-emerald-500/10 border-emerald-500/60 text-emerald-300 shadow-[0_0_12px_-2px_rgba(16,185,129,0.3)] ring-1 ring-emerald-500/30'
                  : 'bg-surface-well/80 hover:bg-surface-elevated border-surface-border text-slate-300 hover:text-white hover:border-emerald-500/30 shadow-sm'
              }`}
            >
              <Icon className="w-3.5 h-3.5 text-emerald-400" />
              <span>{p.label}</span>
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Topic Inset Well Textarea */}
        <div>
          <label className="block text-sm font-semibold text-slate-200 mb-2 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Wand2 className="w-4 h-4 text-emerald-400" />
              What is your content topic, core idea, or offer?
            </span>
            <span className={`text-[11px] font-mono transition-colors ${topic.length > 280 ? 'text-amber-400 font-medium' : 'text-slate-400'}`}>
              {topic.length}/280 characters
            </span>
          </label>
          <textarea
            rows={3}
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g. Why most people fail at freelancing in 2026 and the 3-step fix..."
            className="w-full px-4 py-3 rounded-xl bg-surface-well border border-surface-border focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30 text-white placeholder-slate-500 text-sm leading-relaxed transition-all outline-none resize-none shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)]"
            required
          />
          {/* Helper Sub-row: Keyboard shortcut & Pro tip */}
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 mt-1.5 px-0.5">
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-surface-elevated border border-surface-border text-[10px] text-slate-300 font-mono shadow-sm">
                ⌘ / Ctrl + Enter
              </span>
              <span className="hidden sm:inline">to generate</span>
            </span>
            <span className="text-slate-500 text-[11px]">
              Specific hooks convert 3x higher
            </span>
          </div>
        </div>

        {/* Filters Grid: Niche, Tone, Platform */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-1">
          
          {/* Target Audience / Niche */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300">
              Target Audience / Niche
            </label>
            <input
              type="text"
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              placeholder="e.g. Freelancers, Tech Founders"
              className="w-full px-3.5 py-2.5 rounded-xl bg-surface-well border border-surface-border focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30 text-white placeholder-slate-500 text-xs outline-none transition-all shadow-[inset_0_1px_3px_rgba(0,0,0,0.3)]"
              required
            />
            {/* Quick Niche Suggestion Chips */}
            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              {NICHE_PRESETS.map((np) => {
                const isMatch = niche === np;
                return (
                  <button
                    key={np}
                    type="button"
                    onClick={() => setNiche(np)}
                    className={`text-[11px] px-2 py-0.5 rounded-md border font-mono transition-all duration-150 cursor-pointer ${
                      isMatch
                        ? 'bg-cyan-500/10 border-cyan-500/60 text-cyan-300 shadow-[0_0_8px_rgba(6,182,212,0.25)] ring-1 ring-cyan-500/20'
                        : 'bg-surface-well/60 border-surface-border text-slate-400 hover:text-slate-200 hover:border-slate-700 hover:bg-surface-elevated'
                    }`}
                  >
                    {np}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tone & Psychology Chip Pills */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span>Tone & Psychology</span>
              <span className="text-[10px] font-mono text-emerald-400">Selected</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {TONES.map((t) => {
                const isSelected = tone === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTone(t.id)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all duration-150 flex items-center gap-1 cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-500/10 border-emerald-500/60 text-emerald-300 shadow-[0_0_12px_-2px_rgba(16,185,129,0.3)] ring-1 ring-emerald-500/30'
                        : 'bg-surface-well border-surface-border text-slate-400 hover:text-slate-200 hover:border-slate-700 hover:bg-surface-elevated'
                    }`}
                  >
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Primary Video Platform Chip Pills */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span>Primary Video Platform</span>
              <span className="text-[10px] font-mono text-cyan-400">Aspect</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {PLATFORMS.map((p) => {
                const isSelected = platform === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPlatform(p.id)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all duration-150 flex items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-500/10 border-cyan-500/60 text-cyan-300 shadow-[0_0_12px_-2px_rgba(6,182,212,0.3)] ring-1 ring-cyan-500/30'
                        : 'bg-surface-well border-surface-border text-slate-400 hover:text-slate-200 hover:border-slate-700 hover:bg-surface-elevated'
                    }`}
                  >
                    <span>{p.label}</span>
                    <span className="text-[10px] font-mono opacity-70">({p.badge})</span>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* High-Converting CTA Button */}
        <button
          type="submit"
          disabled={isLoading || !topic.trim()}
          className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 hover:from-emerald-400 hover:via-teal-300 hover:to-cyan-300 text-slate-950 font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 shadow-[0_0_25px_-5px_rgba(16,185,129,0.4)] hover:shadow-[0_0_35px_-4px_rgba(16,185,129,0.55)] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.005] active:scale-[0.99] relative overflow-hidden group cursor-pointer"
        >
          {/* Subtle specular gleam line on button top */}
          <div className="absolute inset-x-0 top-0 h-[1px] bg-white/40 pointer-events-none" />

          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin text-slate-950" />
              <span className="tracking-tight">Synthesizing Viral Hooks & In-Browser Carousel Deck...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 stroke-[2.5] text-slate-950" />
              <span className="tracking-tight">Generate Viral Hooks, 60s Script & Carousel Deck</span>
              <ArrowRight className="w-5 h-5 ml-1 text-slate-950 transition-transform group-hover:translate-x-1" />
            </>
          )}
        </button>

      </form>
    </div>
  );
};
