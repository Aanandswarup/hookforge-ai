import React, { useState, useEffect, useRef } from 'react';
import { ScriptPack } from '../types';
import {
  Film,
  Play,
  Pause,
  RotateCcw,
  Copy,
  Check,
  Clock,
  Eye,
  Volume2,
  Type,
  FlipHorizontal,
  Download,
  Sparkles,
  Clapperboard,
  Timer,
  Sliders,
  Monitor,
  Zap,
} from 'lucide-react';

interface ScriptTeleprompterViewProps {
  script: ScriptPack;
  showToast: (text: string, type?: 'success' | 'info' | 'error') => void;
}

export const ScriptTeleprompterView: React.FC<ScriptTeleprompterViewProps> = ({ script, showToast }) => {
  const [viewMode, setViewMode] = useState<'production' | 'teleprompter'>('production');
  const [isPlaying, setIsPlaying] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(2); // 1 to 5
  const [fontSize, setFontSize] = useState(28); // 20 to 48px
  const [isMirrored, setIsMirrored] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [copiedSceneIdx, setCopiedSceneIdx] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const teleprompterRef = useRef<HTMLDivElement>(null);

  // Total word count and runtime calculations (160 WPM standard)
  const allSpokenText = script.scenes.map((s) => s.spokenWords).join(' ') + ' ' + script.callToAction;
  const wordCount = allSpokenText.trim().split(/\s+/).length;
  const estimatedSeconds = Math.round((wordCount / 160) * 60);

  // Dynamic WPM indicator based on scroll speed
  const currentWpm = Math.round(155 * (scrollSpeed / 2));

  // Teleprompter Auto-scroll engine
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isPlaying && viewMode === 'teleprompter') {
      interval = setInterval(() => {
        if (teleprompterRef.current) {
          teleprompterRef.current.scrollTop += scrollSpeed;
        }
      }, 45);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, scrollSpeed, viewMode]);

  // Elapsed runtime countdown / timer engine
  useEffect(() => {
    let timerInterval: NodeJS.Timeout | null = null;
    if (isPlaying && viewMode === 'teleprompter') {
      timerInterval = setInterval(() => {
        setElapsedSeconds((prev) => {
          if (prev >= estimatedSeconds) {
            setIsPlaying(false);
            return estimatedSeconds;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => {
      if (timerInterval) clearInterval(timerInterval);
    };
  }, [isPlaying, viewMode, estimatedSeconds]);

  // Spacebar hotkey toggle for teleprompter playback
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (viewMode === 'teleprompter' && e.code === 'Space' && e.target === document.body) {
        e.preventDefault();
        setIsPlaying((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewMode]);

  const handleCopyFullScript = () => {
    const fullText =
      script.scenes
        .map(
          (s, idx) =>
            `[SCENE ${idx + 1} | ${s.timestamp}]\nSPOKEN: "${s.spokenWords}"\nVISUAL: ${s.visualCue}\nOVERLAY: ${s.screenOverlayText}\nAUDIO: ${s.soundFX}\n`
        )
        .join('\n') +
      `\n[CLOSING CTA]\n"${script.callToAction}"\n\nTarget Pacing: ${script.pacingAdvice} (~${estimatedSeconds}s • ${wordCount} words)`;
    navigator.clipboard.writeText(fullText);
    setIsCopied(true);
    showToast('Full production script copied!', 'success');
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleCopySpokenOnly = () => {
    const spokenOnlyText =
      script.scenes
        .map((s, idx) => `[Scene ${idx + 1} - ${s.timestamp}]\n${s.spokenWords}`)
        .join('\n\n') + `\n\n[Call to Action]\n${script.callToAction}`;
    navigator.clipboard.writeText(spokenOnlyText);
    showToast('Spoken teleprompter text copied!', 'success');
  };

  const handleCopyScene = (idx: number, scene: ScriptPack['scenes'][0]) => {
    const sceneText = `[SCENE ${idx + 1} | ${scene.timestamp}]\nSPOKEN: "${scene.spokenWords}"\nVISUAL: ${scene.visualCue}\nOVERLAY: ${scene.screenOverlayText}\nAUDIO: ${scene.soundFX}`;
    navigator.clipboard.writeText(sceneText);
    setCopiedSceneIdx(idx);
    showToast(`Scene ${idx + 1} copied!`, 'success');
    setTimeout(() => setCopiedSceneIdx(null), 2000);
  };

  const handleExportTxt = () => {
    const fullText =
      `HOOKFORGE AI — 60S HIGH-RETENTION PRODUCTION SCRIPT\n` +
      `Title: ${script.title || 'Viral Short-Form Script'}\n` +
      `Platform: ${script.targetPlatform}\n` +
      `Target Duration: ~${estimatedSeconds}s (${wordCount} words)\n` +
      `Pacing Strategy: ${script.pacingAdvice}\n` +
      `=================================================================\n\n` +
      script.scenes
        .map(
          (s, idx) =>
            `-----------------------------------------------------------------\n` +
            `SCENE ${idx + 1} • TIMECODE: ${s.timestamp}\n` +
            `-----------------------------------------------------------------\n` +
            `SPOKEN SCRIPT:\n"${s.spokenWords}"\n\n` +
            `VISUAL ACTION / B-ROLL:\n${s.visualCue}\n\n` +
            `ON-SCREEN TEXT OVERLAY:\n${s.screenOverlayText}\n\n` +
            `AUDIO & SOUND FX:\n${s.soundFX}\n`
        )
        .join('\n\n') +
      `\n\n=================================================================\n` +
      `RETENTION CLOSING CALL TO ACTION:\n` +
      `"${script.callToAction}"\n` +
      `=================================================================\n`;

    const blob = new Blob([fullText], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `hookforge_production_script.txt`;
    link.click();
    showToast('Production script exported as TXT!', 'success');
  };

  const handleResetScroll = () => {
    if (teleprompterRef.current) {
      teleprompterRef.current.scrollTop = 0;
    }
    setElapsedSeconds(0);
    setIsPlaying(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercent = Math.min(100, Math.round((elapsedSeconds / Math.max(1, estimatedSeconds)) * 100));

  return (
    <div className="w-full space-y-5">
      {/* Header controls & Meta Bar */}
      <div className="card-matte p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Clapperboard className="w-5 h-5 text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
              60s High-Retention Production Script
            </h3>
            <span className="badge-pill-brand font-bold">
              ~{estimatedSeconds}s • {wordCount} words
            </span>
            <span className="badge-pill-blue hidden sm:inline-flex">
              {script.targetPlatform}
            </span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Target Pacing: <span className="text-slate-300 font-medium">155–165 WPM</span> • {script.pacingAdvice}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto w-full sm:w-auto">
          {/* Segmented Mode Switcher */}
          <div className="flex bg-surface-well border border-surface-border rounded-xl p-1 text-xs w-full sm:w-auto">
            <button
              onClick={() => {
                setViewMode('production');
                setIsPlaying(false);
              }}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                viewMode === 'production'
                  ? 'bg-surface-elevated text-white border border-slate-700/80 shadow-[0_2px_10px_rgba(0,0,0,0.5)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Film className="w-3.5 h-3.5 text-emerald-400" />
              <span>Director Breakdown</span>
            </button>
            <button
              onClick={() => setViewMode('teleprompter')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                viewMode === 'teleprompter'
                  ? 'bg-surface-elevated text-white border border-slate-700/80 shadow-[0_2px_10px_rgba(0,0,0,0.5)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Monitor className="w-3.5 h-3.5 text-emerald-400" />
              <span>Teleprompter Studio</span>
            </button>
          </div>

          {/* Quick Actions (Copy & Export) */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyFullScript}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-elevated hover:bg-surface-card border border-surface-border text-slate-200 text-xs font-semibold transition-all hover:border-slate-600 shadow-sm cursor-pointer"
              title="Copy formatted script to clipboard"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              <span>{isCopied ? 'Copied' : 'Copy Script'}</span>
            </button>

            <button
              onClick={handleExportTxt}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-elevated hover:bg-surface-card border border-surface-border text-slate-200 text-xs font-semibold transition-all hover:border-slate-600 shadow-sm cursor-pointer"
              title="Download script as TXT file"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Export TXT</span>
            </button>
          </div>
        </div>
      </div>

      {/* VIEW 1: Director Script Breakdown */}
      {viewMode === 'production' && (
        <div className="space-y-4">
          {/* Timeline Container */}
          <div className="relative space-y-4">
            {script.scenes.map((scene, idx) => {
              const sceneWords = scene.spokenWords.trim().split(/\s+/).length;
              const sceneSeconds = Math.round((sceneWords / 160) * 60);
              const isSceneCopied = copiedSceneIdx === idx;

              return (
                <div
                  key={idx}
                  className="card-matte p-5 sm:p-6 transition-all duration-200 hover:border-surface-highlight flex flex-col md:flex-row md:items-start gap-4 sm:gap-6 group relative overflow-hidden"
                >
                  {/* Scene Step & Timestamp Column */}
                  <div className="flex md:flex-col items-center md:items-start justify-between md:justify-start gap-2.5 min-w-[130px] shrink-0">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-200 tracking-wider">
                        SCENE 0{idx + 1}
                      </span>
                    </div>

                    <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-surface-well border border-surface-border text-emerald-400">
                      <Clock className="w-3.5 h-3.5 text-emerald-400" />
                      {scene.timestamp}
                    </span>

                    <span className="text-[11px] font-mono text-slate-400 hidden md:inline-block">
                      ~{sceneSeconds}s • {sceneWords}w
                    </span>

                    <button
                      onClick={() => handleCopyScene(idx, scene)}
                      className="mt-1 md:mt-2 hidden md:inline-flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer"
                      title="Copy scene details"
                    >
                      {isSceneCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{isSceneCopied ? 'Copied' : 'Copy Scene'}</span>
                    </button>
                  </div>

                  {/* Main Script Details */}
                  <div className="flex-1 space-y-3.5 w-full">
                    {/* Spoken Script */}
                    <div>
                      <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center justify-between">
                        <span>Spoken Script (Delivery):</span>
                        <button
                          onClick={() => handleCopyScene(idx, scene)}
                          className="md:hidden inline-flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-emerald-400 cursor-pointer"
                        >
                          {isSceneCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>{isSceneCopied ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                      <p className="text-base sm:text-lg font-semibold text-white leading-relaxed pl-3 border-l-2 border-emerald-500/50">
                        "{scene.spokenWords}"
                      </p>
                    </div>

                    {/* Director 3-Column Cue Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-surface-border/60 text-xs">
                      {/* Visual Action */}
                      <div className="surface-well-inset p-3 rounded-xl flex flex-col justify-between space-y-1">
                        <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                          <Eye className="w-3.5 h-3.5" /> Visual Action
                        </span>
                        <span className="text-slate-300 text-xs sm:text-[13px] leading-relaxed">
                          {scene.visualCue}
                        </span>
                      </div>

                      {/* On-Screen Text Overlay */}
                      <div className="surface-well-inset p-3 rounded-xl flex flex-col justify-between space-y-1">
                        <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5" /> On-Screen Overlay
                        </span>
                        <span className="font-mono text-amber-300 text-xs font-semibold bg-black/40 px-2 py-1 rounded border border-amber-500/20">
                          {scene.screenOverlayText}
                        </span>
                      </div>

                      {/* Audio & Sound FX */}
                      <div className="surface-well-inset p-3 rounded-xl flex flex-col justify-between space-y-1">
                        <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                          <Volume2 className="w-3.5 h-3.5" /> Audio & Sound FX
                        </span>
                        <span className="text-cyan-200/90 text-xs sm:text-[13px] leading-relaxed">
                          {scene.soundFX}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Retention Closing CTA Banner Card */}
          <div className="card-matte relative overflow-hidden p-5 sm:p-6 border-emerald-500/30 bg-gradient-to-r from-surface-card via-surface-card to-emerald-950/20 shadow-glow-brand-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <span className="badge-pill-brand text-[10px] font-bold uppercase tracking-wider">
                  <Zap className="w-3 h-3 text-emerald-400 fill-emerald-400" />
                  Retention Closing Call To Action
                </span>
                <p className="text-base sm:text-lg font-bold text-white mt-1 leading-snug">
                  "{script.callToAction}"
                </p>
                <p className="text-xs text-slate-400">
                  Deliver with high energy directly into the camera lens in the final 3–5 seconds to drive comments.
                </p>
              </div>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(script.callToAction);
                  showToast('Call To Action copied!', 'success');
                }}
                className="self-start sm:self-auto shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-elevated hover:bg-surface-card border border-surface-border text-slate-200 text-xs font-semibold transition-all hover:border-emerald-500/40 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5 text-emerald-400" />
                <span>Copy CTA</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: In-Browser Teleprompter Studio HUD */}
      {viewMode === 'teleprompter' && (
        <div className="card-matte p-4 sm:p-6 flex flex-col items-center shadow-2xl relative overflow-hidden space-y-4">
          {/* Floating Teleprompter HUD Controls */}
          <div className="w-full glass-dock rounded-2xl p-3 sm:p-4 flex flex-col lg:flex-row items-center justify-between gap-4 border border-surface-border">
            {/* Playback Actions */}
            <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-center sm:justify-start">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer ${
                  isPlaying
                    ? 'bg-amber-500 text-surface-base hover:bg-amber-400 shadow-glow-amber'
                    : 'bg-emerald-500 text-surface-base hover:bg-emerald-400 shadow-glow-brand'
                }`}
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-surface-base" /> : <Play className="w-4 h-4 fill-surface-base" />}
                <span>{isPlaying ? 'Pause Prompter' : 'Start Auto-Scroll'}</span>
                <span className="hidden sm:inline-block text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/20 text-surface-base">
                  Space
                </span>
              </button>

              <button
                onClick={handleResetScroll}
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-surface-elevated hover:bg-surface-card border border-surface-border text-slate-300 text-xs font-medium transition-colors cursor-pointer"
                title="Reset scroll to top"
              >
                <RotateCcw className="w-4 h-4" />
                <span className="hidden sm:inline">Reset</span>
              </button>

              {/* Mirror Toggle for physical beam-splitter prompter glass */}
              <button
                onClick={() => setIsMirrored(!isMirrored)}
                className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                  isMirrored
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-glow-brand-sm'
                    : 'bg-surface-elevated border-surface-border text-slate-400 hover:text-slate-200'
                }`}
                title="Mirror text horizontally for glass teleprompters"
              >
                <FlipHorizontal className="w-4 h-4" />
                <span>Mirror Flip</span>
                {isMirrored && <span className="text-[9px] font-bold px-1 rounded bg-emerald-500/30 text-emerald-300">ON</span>}
              </button>

              <button
                onClick={handleCopySpokenOnly}
                className="hidden sm:flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-surface-elevated hover:bg-surface-card border border-surface-border text-slate-300 text-xs font-medium transition-colors cursor-pointer"
                title="Copy spoken script text only"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Spoken</span>
              </button>
            </div>

            {/* Elapsed Timer & Dynamic Progress Bar */}
            <div className="flex items-center gap-3 bg-surface-well px-3.5 py-2 rounded-xl border border-surface-border">
              <Timer className="w-4 h-4 text-emerald-400" />
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-white">
                  <span>{formatTime(elapsedSeconds)}</span>
                  <span className="text-slate-500">/</span>
                  <span className="text-slate-400">{formatTime(estimatedSeconds)}</span>
                </div>
                <div className="w-24 sm:w-28 h-1.5 bg-surface-card rounded-full overflow-hidden mt-1 border border-surface-border">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Speed & Font Size Sliders */}
            <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto justify-center sm:justify-end">
              {/* Speed Slider */}
              <div className="flex items-center gap-2 bg-surface-well px-3 py-1.5 rounded-xl border border-surface-border">
                <Sliders className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-xs text-slate-400">Speed:</span>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="0.5"
                  value={scrollSpeed}
                  onChange={(e) => setScrollSpeed(Number(e.target.value))}
                  className="w-16 sm:w-20 accent-emerald-500 cursor-pointer"
                />
                <span className="text-xs font-mono font-bold text-emerald-400 min-w-[28px]">{scrollSpeed}x</span>
                <span className="text-[10px] font-mono text-slate-500 hidden sm:inline">({currentWpm} WPM)</span>
              </div>

              {/* Font Size Slider */}
              <div className="flex items-center gap-2 bg-surface-well px-3 py-1.5 rounded-xl border border-surface-border">
                <Type className="w-3.5 h-3.5 text-slate-400" />
                <input
                  type="range"
                  min="20"
                  max="48"
                  step="2"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-16 sm:w-20 accent-emerald-500 cursor-pointer"
                />
                <span className="text-xs font-mono font-bold text-slate-300 min-w-[32px]">{fontSize}px</span>
              </div>
            </div>
          </div>

          {/* Teleprompter Stage Well with Ambient Masking & Eye Guideline */}
          <div className="w-full surface-well-inset bg-surface-well rounded-2xl relative overflow-hidden border border-surface-border">
            {/* Top Stage Spotlight Gradient Mask */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-surface-well via-surface-well/80 to-transparent z-10" />

            {/* Bottom Stage Mask */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-surface-well via-surface-well/80 to-transparent z-10" />

            {/* Reading Eye-Level Guideline Indicator */}
            <div className="pointer-events-none absolute top-1/3 inset-x-0 h-20 bg-emerald-500/[0.03] border-y border-emerald-500/20 z-10 flex items-center justify-between px-4 sm:px-6">
              <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-400/60 uppercase flex items-center gap-1.5">
                <Eye className="w-3 h-3 text-emerald-400/60" /> EYE LEVEL
              </span>
              <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-400/60 uppercase hidden sm:flex items-center gap-1.5">
                FOCUS READING ZONE
              </span>
            </div>

            {/* Scrolling Viewport */}
            <div
              ref={teleprompterRef}
              className={`w-full max-w-3xl mx-auto h-[480px] sm:h-[540px] overflow-y-auto px-6 sm:px-12 py-36 space-y-16 text-center select-none transition-transform duration-200 scroll-smooth ${
                isMirrored ? 'scale-x-[-1]' : ''
              }`}
            >
              {script.scenes.map((s, idx) => (
                <div key={idx} className="space-y-4">
                  <div className="flex items-center justify-center gap-2">
                    <span className="inline-block px-3 py-1 rounded-full bg-surface-card border border-surface-border font-mono text-xs text-emerald-400 font-bold shadow-sm">
                      Scene {idx + 1} • {s.timestamp}
                    </span>
                  </div>
                  <p
                    style={{ fontSize: `${fontSize}px` }}
                    className="font-extrabold text-white leading-relaxed tracking-wide drop-shadow-md"
                  >
                    {s.spokenWords}
                  </p>
                  <div className="pt-1">
                    <span className="inline-flex items-center gap-1 text-xs text-purple-300/80 font-medium bg-purple-950/30 px-2.5 py-0.5 rounded-full border border-purple-800/40">
                      <Eye className="w-3 h-3 text-purple-400" /> {s.visualCue}
                    </span>
                  </div>
                </div>
              ))}

              {/* Call To Action Block */}
              <div className="py-16 border-t border-surface-border/80 space-y-3">
                <span className="text-xs uppercase tracking-widest text-emerald-400 font-bold block">
                  ✦ CLOSING CALL TO ACTION ✦
                </span>
                <p
                  style={{ fontSize: `${fontSize}px` }}
                  className="font-extrabold text-emerald-300 drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                >
                  {script.callToAction}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
