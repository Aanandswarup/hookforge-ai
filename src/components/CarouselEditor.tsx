import React, { useState, useEffect, useRef } from 'react';
import {
  CarouselSlide,
  CarouselTheme,
  CarouselAspectRatio,
  CarouselFontStyle,
  CanvasBgPattern,
  CanvasCustomization,
} from '../types';
import { CanvasRenderer, THEMES, ASPECT_RATIOS } from '../services/canvasRenderer';
import {
  Layers,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  Download,
  FileText,
  Sparkles,
  Edit3,
  Plus,
  Trash2,
  Copy,
  Sliders,
  AlignLeft,
  AlignCenter,
  Maximize2,
  Loader2,
  Check,
  Tag,
  Heading,
} from 'lucide-react';
import confetti from 'canvas-confetti';

// Persistent deck & customization cache to preserve edits across tab switching in App.tsx
interface DeckCache {
  slides: CarouselSlide[];
  custom: CanvasCustomization;
  currentSlideIndex: number;
  initialSlidesRef: CarouselSlide[];
}
let moduleDeckCache: DeckCache | null = null;

interface ThemeMeta {
  key: CarouselTheme;
  title: string;
  tagline: string;
  activeBorder: string;
  activeRing: string;
  activeShadow: string;
  swatches: string[];
}

const THEME_PREVIEWS: Record<CarouselTheme, ThemeMeta> = {
  'dark-minimal': {
    key: 'dark-minimal',
    title: 'Dark Minimal',
    tagline: 'Obsidian & Emerald',
    activeBorder: 'border-slate-400/80',
    activeRing: 'ring-1 ring-slate-400/50',
    activeShadow: 'shadow-[0_0_20px_-3px_rgba(248,250,252,0.15)]',
    swatches: ['#090d16', '#111827', '#94a3b8', '#10b981'],
  },
  'bold-gradient': {
    key: 'bold-gradient',
    title: 'Bold Gradient',
    tagline: 'Indigo & Cyber Violet',
    activeBorder: 'border-violet-500/80',
    activeRing: 'ring-1 ring-violet-500/50',
    activeShadow: 'shadow-[0_0_22px_-3px_rgba(139,92,246,0.35)]',
    swatches: ['#0f0c20', '#1a1438', '#c4b5fd', '#8b5cf6'],
  },
  'editorial': {
    key: 'editorial',
    title: 'Editorial Luxe',
    tagline: 'Classic Warmth & Serif',
    activeBorder: 'border-amber-500/80',
    activeRing: 'ring-1 ring-amber-500/50',
    activeShadow: 'shadow-[0_0_22px_-3px_rgba(245,158,11,0.35)]',
    swatches: ['#09090b', '#18181b', '#d6d3d1', '#f59e0b'],
  },
  'neon-hacker': {
    key: 'neon-hacker',
    title: 'Neon Hacker',
    tagline: 'Matrix Cyber Emerald',
    activeBorder: 'border-emerald-400/80',
    activeRing: 'ring-1 ring-emerald-400/50',
    activeShadow: 'shadow-[0_0_22px_-3px_rgba(34,197,94,0.4)]',
    swatches: ['#040d12', '#081c15', '#6ee7b7', '#22c55e'],
  },
  'sunset-glow': {
    key: 'sunset-glow',
    title: 'Sunset Glow',
    tagline: 'Amber & Radiant Rose',
    activeBorder: 'border-rose-500/80',
    activeRing: 'ring-1 ring-rose-500/50',
    activeShadow: 'shadow-[0_0_22px_-3px_rgba(244,63,94,0.35)]',
    swatches: ['#190a0d', '#2a1117', '#fda4af', '#f43f5e'],
  },
};

export interface CarouselEditorProps {
  initialSlides: CarouselSlide[];
  isPro: boolean;
  onOpenUpgrade: () => void;
  showToast: (text: string, type?: 'success' | 'info' | 'error') => void;
  onSlidesChange?: (slides: CarouselSlide[]) => void;
}

export const CarouselEditor: React.FC<CarouselEditorProps> = ({
  initialSlides,
  isPro,
  onOpenUpgrade,
  showToast,
  onSlidesChange,
}) => {
  const isSameGeneration = moduleDeckCache && moduleDeckCache.initialSlidesRef === initialSlides;

  const [slides, setSlides] = useState<CarouselSlide[]>(() => {
    if (isSameGeneration && moduleDeckCache?.slides) {
      return moduleDeckCache.slides;
    }
    return initialSlides;
  });

  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(() => {
    if (isSameGeneration && typeof moduleDeckCache?.currentSlideIndex === 'number') {
      return Math.min(moduleDeckCache.currentSlideIndex, (moduleDeckCache.slides?.length || 1) - 1);
    }
    return 0;
  });

  const [custom, setCustom] = useState<CanvasCustomization>(() => {
    if (isSameGeneration && moduleDeckCache?.custom) {
      return moduleDeckCache.custom;
    }
    return {
      theme: 'dark-minimal',
      aspectRatio: '4:5',
      fontStyle: 'modern',
      bgPattern: 'mesh',
      textAlign: 'left',
      fontSizeScale: 'normal',
    };
  });

  const [exportingType, setExportingType] = useState<'single' | 'all' | 'pdf' | null>(null);
  const [activeTab, setActiveTab] = useState<'content' | 'style'>('content');

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Sync cache with active state
  useEffect(() => {
    moduleDeckCache = {
      slides,
      custom,
      currentSlideIndex,
      initialSlidesRef: initialSlides,
    };
  }, [slides, custom, currentSlideIndex, initialSlides]);

  // Keep slides in sync when a completely new generation prop arrives
  useEffect(() => {
    if (moduleDeckCache && moduleDeckCache.initialSlidesRef !== initialSlides) {
      setSlides(initialSlides);
      setCurrentSlideIndex(0);
      moduleDeckCache = {
        slides: initialSlides,
        custom,
        currentSlideIndex: 0,
        initialSlidesRef: initialSlides,
      };
    }
  }, [initialSlides]);

  const activeSlide = slides[currentSlideIndex] || slides[0];

  // Render to canvas whenever dependencies change
  useEffect(() => {
    if (canvasRef.current && activeSlide) {
      CanvasRenderer.renderSlideToCanvas(
        canvasRef.current,
        activeSlide,
        slides.length,
        custom,
        isPro
      );
    }
  }, [activeSlide, slides.length, custom, isPro]);

  // Web-font loading sync: re-render canvas when fonts are ready in browser
  useEffect(() => {
    if (typeof document !== 'undefined' && document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        if (canvasRef.current && activeSlide) {
          CanvasRenderer.renderSlideToCanvas(
            canvasRef.current,
            activeSlide,
            slides.length,
            custom,
            isPro
          );
        }
      });
    }
  }, []);

  const updateDeck = (newSlides: CarouselSlide[]) => {
    setSlides(newSlides);
    if (onSlidesChange) {
      onSlidesChange(newSlides);
    }
  };

  const handleUpdateActiveSlide = (field: keyof CarouselSlide, val: any) => {
    const updated = [...slides];
    updated[currentSlideIndex] = {
      ...updated[currentSlideIndex],
      [field]: val,
    };
    updateDeck(updated);
  };

  // Slide CRUD Actions
  const handleAddSlide = () => {
    const newSlide: CarouselSlide = {
      id: `slide-${Date.now()}`,
      slideNumber: slides.length + 1,
      tagline: 'KEY INSIGHT',
      title: 'New Key Takeaway',
      body: 'Double-click to edit this body text with your customized actionable framework.',
      highlightText: 'Pro Tip: Keep points concise and punchy.',
      swipeIndicator: true,
    };
    const updated = [...slides, newSlide].map((s, idx) => ({ ...s, slideNumber: idx + 1 }));
    updateDeck(updated);
    setCurrentSlideIndex(updated.length - 1);
    showToast('New slide added to deck!', 'success');
  };

  const handleDuplicateSlide = () => {
    const duplicate: CarouselSlide = {
      ...activeSlide,
      id: `slide-${Date.now()}`,
      title: `${activeSlide.title} (Copy)`,
    };
    const updated = [...slides];
    updated.splice(currentSlideIndex + 1, 0, duplicate);
    const reindexed = updated.map((s, idx) => ({ ...s, slideNumber: idx + 1 }));
    updateDeck(reindexed);
    setCurrentSlideIndex(currentSlideIndex + 1);
    showToast('Slide duplicated!', 'success');
  };

  const handleDeleteSlide = () => {
    if (slides.length <= 2) {
      showToast('Carousel requires at least 2 slides.', 'info');
      return;
    }
    const updated = slides.filter((_, idx) => idx !== currentSlideIndex).map((s, idx) => ({ ...s, slideNumber: idx + 1 }));
    updateDeck(updated);
    setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1));
    showToast('Slide removed.', 'info');
  };

  const handleMoveSlide = (direction: 'left' | 'right') => {
    const targetIdx = direction === 'left' ? currentSlideIndex - 1 : currentSlideIndex + 1;
    if (targetIdx < 0 || targetIdx >= slides.length) return;

    const updated = [...slides];
    const temp = updated[currentSlideIndex];
    updated[currentSlideIndex] = updated[targetIdx];
    updated[targetIdx] = temp;

    const reindexed = updated.map((s, idx) => ({ ...s, slideNumber: idx + 1 }));
    updateDeck(reindexed);
    setCurrentSlideIndex(targetIdx);
  };

  // Export handlers
  const isExporting = exportingType !== null;

  const handleDownloadSingle = async () => {
    if (isExporting) return;
    setExportingType('single');
    try {
      await new Promise((r) => setTimeout(r, 60));
      CanvasRenderer.downloadSingleSlide(
        activeSlide,
        slides.length,
        custom,
        isPro,
        `hookforge_slide_${activeSlide.slideNumber}.png`
      );
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.75 },
        colors: ['#10b981', '#34d399', '#6ee7b7', '#059669'],
      });
      showToast(`Downloaded Slide ${activeSlide.slideNumber} of ${slides.length} (1080p PNG)!`, 'success');
    } catch (err: any) {
      showToast(`Single export failed: ${err.message || 'Unknown error'}`, 'error');
    } finally {
      setTimeout(() => setExportingType(null), 300);
    }
  };

  const handleDownloadAllPngs = async () => {
    if (isExporting) return;
    setExportingType('all');
    try {
      showToast(`Rendering all ${slides.length} slides to 1080p PNG masters...`, 'info');
      await new Promise((r) => setTimeout(r, 80));
      CanvasRenderer.downloadAllSlidesAsPngs(slides, custom, isPro);
      confetti({
        particleCount: 85,
        spread: 80,
        origin: { y: 0.65 },
        colors: ['#10b981', '#06b6d4', '#6366f1', '#a855f7'],
      });
      showToast(`All ${slides.length} slides exported successfully!`, 'success');
    } catch (err: any) {
      showToast(`Batch export failed: ${err.message || 'Unknown error'}`, 'error');
    } finally {
      const waitTime = Math.max(1200, slides.length * 280);
      setTimeout(() => setExportingType(null), waitTime);
    }
  };

  const handleDownloadPdf = async () => {
    if (isExporting) return;
    setExportingType('pdf');
    try {
      showToast('Compiling multi-page vector-sharp PDF presentation...', 'info');
      await new Promise((r) => setTimeout(r, 80));
      await CanvasRenderer.downloadAllSlidesAsPdf(slides, custom, isPro);
      confetti({
        particleCount: 130,
        spread: 100,
        origin: { y: 0.55 },
        colors: ['#10b981', '#38bdf8', '#fbbf24', '#f43f5e', '#a855f7'],
      });
      showToast(`Vector PDF (${slides.length} pages) downloaded ready for LinkedIn!`, 'success');
    } catch (err: any) {
      showToast(`PDF generation failed: ${err.message || 'Unknown error'}`, 'error');
    } finally {
      setExportingType(null);
    }
  };

  // Calculate aspect ratio CSS for canvas container with zero distortion
  const getAspectRatioCss = () => {
    switch (custom.aspectRatio) {
      case '1:1':
        return 'aspect-square max-w-[360px] sm:max-w-[420px]';
      case '9:16':
        return 'aspect-[9/16] max-w-[260px] sm:max-w-[300px]';
      case '4:5':
      default:
        return 'aspect-[4/5] max-w-[360px] sm:max-w-[420px]';
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Bento Top Header: Studio Title & Aspect Ratio Segmented Control */}
      <div className="card-matte p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden backdrop-blur-sm before:absolute before:inset-x-0 before:top-0 before:h-[1px] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-surface-elevated border border-surface-border flex items-center justify-center text-emerald-400 shadow-[0_0_20px_-3px_rgba(16,185,129,0.25)] shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold tracking-tight text-white">
                In-Browser Visual Carousel Studio
              </h3>
              <span className="badge-pill-brand text-[10px] hidden sm:inline-flex">
                1080p Master
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Client-side canvas engine with zero cloud GPU latency. High-res vector-sharp export.
            </p>
          </div>
        </div>

        {/* Aspect Ratio Segmented Control */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-mono text-slate-400 font-semibold hidden lg:inline">
            Ratio:
          </span>
          <div className="flex bg-surface-well p-1 rounded-xl border border-surface-border/90 shadow-inner">
            {(
              [
                { ratio: '4:5', label: '4:5', desc: 'Portrait', res: '1080×1350' },
                { ratio: '1:1', label: '1:1', desc: 'Square', res: '1080×1080' },
                { ratio: '9:16', label: '9:16', desc: 'Story', res: '1080×1920' },
              ] as const
            ).map(({ ratio, label, desc, res }) => {
              const isSelected = custom.aspectRatio === ratio;
              return (
                <button
                  key={ratio}
                  onClick={() => setCustom((prev) => ({ ...prev, aspectRatio: ratio }))}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 relative ${
                    isSelected
                      ? 'bg-surface-elevated text-emerald-300 border border-emerald-500/30 shadow-[0_2px_8px_rgba(0,0,0,0.4),0_0_15px_-4px_rgba(16,185,129,0.3)]'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03] border border-transparent'
                  }`}
                  title={`${label} ${desc} (${res})`}
                >
                  <span className="font-mono">{label}</span>
                  <span className="text-[10px] font-normal text-slate-400 hidden sm:inline">
                    {desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Bento Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Canvas Preview Stage & Consolidated Floating Dock (7 cols) */}
        <div className="lg:col-span-7 flex flex-col items-center card-matte p-4 sm:p-6 lg:p-7 relative overflow-hidden">
          
          {/* Ambient Stage Spotlighting & Grid Mesh Backdrop */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] sm:w-[500px] h-[380px] sm:h-[500px] rounded-full bg-gradient-to-tr from-emerald-500/10 via-teal-500/5 to-cyan-500/10 blur-3xl opacity-70" />
            <div className="absolute inset-0 bg-grid-mesh opacity-30" />
          </div>

          {/* Canvas Device Frame Viewport */}
          <div className={`relative group w-full ${getAspectRatioCss()} rounded-2xl overflow-hidden shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] border border-white/10 ring-1 ring-white/5 bg-black transition-all duration-300 z-10 mx-auto`}>
            <canvas
              ref={canvasRef}
              className="w-full h-full object-contain block select-none"
            />

            {/* Free Tier Watermark Upgrade Capsule */}
            {!isPro && (
              <div
                onClick={onOpenUpgrade}
                className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-surface-card/90 border border-amber-500/40 text-[10px] font-mono text-amber-300 cursor-pointer hover:bg-surface-elevated hover:border-amber-400 transition-all flex items-center gap-1.5 shadow-lg backdrop-blur-md group-hover:scale-105"
                title="Click to remove watermark with Pro license"
              >
                <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />
                <span>Remove Watermark ($39 LTD)</span>
              </div>
            )}

            {/* Pro Tier Verified Pill */}
            {isPro && (
              <div className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full bg-surface-card/80 border border-emerald-500/30 text-[10px] font-mono text-emerald-400 backdrop-blur-md flex items-center gap-1 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>PRO 1080p</span>
              </div>
            )}
          </div>

          {/* Consolidated Floating Studio Dock Toolbar */}
          <div className="w-full max-w-xl mx-auto mt-5 z-10 relative">
            <div className="glass-dock rounded-2xl p-1.5 sm:p-2 flex items-center justify-between gap-1.5 sm:gap-2 shadow-glass-dock border border-surface-border">
              
              {/* Navigation & Counter Group */}
              <div className="flex items-center gap-1 sm:gap-1.5">
                <button
                  onClick={() => setCurrentSlideIndex((prev) => Math.max(0, prev - 1))}
                  disabled={currentSlideIndex === 0}
                  className="p-1.5 sm:p-2 rounded-xl text-slate-300 hover:text-white hover:bg-surface-elevated disabled:opacity-25 disabled:pointer-events-none transition-colors"
                  title="Previous slide"
                  aria-label="Previous slide"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {/* Crisp Slide Counter Pill: e.g. 01 / 06 */}
                <div className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-surface-well border border-surface-border text-slate-200 font-mono text-xs font-semibold tracking-wider flex items-center gap-1 shadow-inner select-none">
                  <span className="text-emerald-400 font-bold">
                    {String(currentSlideIndex + 1).padStart(2, '0')}
                  </span>
                  <span className="text-slate-600">/</span>
                  <span className="text-slate-400">
                    {String(slides.length).padStart(2, '0')}
                  </span>
                </div>

                <button
                  onClick={() => setCurrentSlideIndex((prev) => Math.min(slides.length - 1, prev + 1))}
                  disabled={currentSlideIndex === slides.length - 1}
                  className="p-1.5 sm:p-2 rounded-xl text-slate-300 hover:text-white hover:bg-surface-elevated disabled:opacity-25 disabled:pointer-events-none transition-colors"
                  title="Next slide"
                  aria-label="Next slide"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Vertical Divider */}
              <div className="h-5 w-[1px] bg-surface-border" />

              {/* Reorder Buttons Group */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleMoveSlide('left')}
                  disabled={currentSlideIndex === 0}
                  className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-white hover:bg-surface-elevated disabled:opacity-25 disabled:pointer-events-none transition-colors"
                  title="Move slide earlier in deck (Left)"
                  aria-label="Move slide left"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleMoveSlide('right')}
                  disabled={currentSlideIndex === slides.length - 1}
                  className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-white hover:bg-surface-elevated disabled:opacity-25 disabled:pointer-events-none transition-colors"
                  title="Move slide later in deck (Right)"
                  aria-label="Move slide right"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Vertical Divider */}
              <div className="h-5 w-[1px] bg-surface-border" />

              {/* Slide CRUD Actions Group */}
              <div className="flex items-center gap-1 sm:gap-1.5">
                <button
                  onClick={handleDuplicateSlide}
                  className="p-1.5 sm:p-2 rounded-xl text-slate-300 hover:text-white hover:bg-surface-elevated transition-colors"
                  title="Duplicate current slide"
                  aria-label="Duplicate slide"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={handleDeleteSlide}
                  disabled={slides.length <= 2}
                  className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 disabled:opacity-25 disabled:pointer-events-none transition-colors"
                  title={slides.length <= 2 ? 'Carousel requires at least 2 slides' : 'Delete current slide'}
                  aria-label="Delete slide"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={handleAddSlide}
                  className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all active:scale-95 ml-0.5"
                  title="Add new slide"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span className="hidden sm:inline">Add</span>
                </button>
              </div>

            </div>
          </div>

          {/* Slide Filmstrip Deck Ribbon */}
          <div className="w-full mt-5 pt-4 border-t border-surface-border/70 z-10 relative">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-2 px-1">
              <span className="flex items-center gap-1.5 uppercase tracking-wider text-slate-400 font-semibold">
                <Layers className="w-3 h-3 text-emerald-400" />
                <span>Deck Filmstrip</span>
                <span className="text-slate-500">({slides.length} slides)</span>
              </span>
              <button
                onClick={handleDownloadSingle}
                className="text-emerald-400 hover:text-emerald-300 font-sans font-medium text-xs flex items-center gap-1 transition-colors"
                title="Download only this active slide as PNG"
              >
                <Download className="w-3 h-3" />
                <span>Download Slide {activeSlide.slideNumber} (PNG)</span>
              </button>
            </div>

            {/* Horizontal Filmstrip Track */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 px-1 scrollbar-thin scrollbar-thumb-surface-border scrollbar-track-transparent">
              {slides.map((s, idx) => {
                const isActive = currentSlideIndex === idx;
                return (
                  <button
                    key={s.id || idx}
                    onClick={() => setCurrentSlideIndex(idx)}
                    className={`group relative flex-shrink-0 flex flex-col text-left rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-surface-elevated border-emerald-500/60 shadow-[0_0_15px_-3px_rgba(16,185,129,0.3)] ring-1 ring-emerald-500/40 -translate-y-0.5'
                        : 'bg-surface-well/80 border-surface-border hover:border-slate-600 hover:bg-surface-elevated/60'
                    } border p-2 w-24 sm:w-28`}
                  >
                    {/* Top Row: Index and active beacon */}
                    <div className="flex items-center justify-between w-full mb-1">
                      <span
                        className={`text-[10px] font-mono font-bold ${
                          isActive ? 'text-emerald-400' : 'text-slate-400 group-hover:text-slate-300'
                        }`}
                      >
                        #{String(idx + 1).padStart(2, '0')}
                      </span>
                      {isActive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.9)]" />
                      )}
                    </div>

                    {/* Title Snippet */}
                    <div className="text-[10px] font-medium text-slate-300 truncate w-full group-hover:text-white">
                      {s.title || `Slide ${idx + 1}`}
                    </div>

                    {/* Tagline / Micro category */}
                    <div className="text-[9px] font-mono text-slate-500 truncate w-full mt-0.5">
                      {s.tagline || 'FRAMEWORK'}
                    </div>
                  </button>
                );
              })}

              {/* Append Slide Quick Button at End of Ribbon */}
              <button
                onClick={handleAddSlide}
                className="flex-shrink-0 flex flex-col items-center justify-center rounded-xl border border-dashed border-surface-border hover:border-emerald-500/50 bg-surface-well/40 hover:bg-emerald-500/5 p-2 w-16 sm:w-20 text-slate-500 hover:text-emerald-400 transition-all group"
                title="Add new slide to end of deck"
              >
                <Plus className="w-4 h-4 mb-0.5 group-hover:scale-110 transition-transform" />
                <span className="text-[9px] font-mono font-medium">Add</span>
              </button>
            </div>
          </div>

        </div>

        {/* Right Column: Customizer & Content Editor Tabs (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* Export Studio Assets Card */}
          <div className="card-matte p-5 sm:p-6 space-y-4 relative overflow-hidden group">
            <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-surface-well border border-surface-border text-emerald-400">
                  <Download className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-white tracking-tight">
                    Export Studio Assets
                  </h4>
                  <p className="text-[10px] text-slate-400 font-mono">
                    Deck Size: {slides.length} slides · 1080p Master
                  </p>
                </div>
              </div>
              <span className="badge-pill font-mono text-[10px] text-emerald-300 border-emerald-500/30 bg-emerald-500/10">
                VECTOR-SHARP
              </span>
            </div>

            <div className="space-y-2.5 pt-1">
              {/* Primary Hero CTA: Export PDF (All Slides) */}
              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={isExporting}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 hover:from-emerald-400 hover:via-teal-300 hover:to-cyan-300 text-surface-base font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-[0_0_25px_-5px_rgba(16,185,129,0.4)] hover:shadow-[0_0_35px_-4px_rgba(16,185,129,0.6)] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                title="Generate multi-page PDF document ideal for LinkedIn carousel posts"
              >
                {exportingType === 'pdf' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-surface-base stroke-[2.5]" />
                    <span>Compiling PDF Document...</span>
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4 fill-surface-base stroke-[1.5]" />
                    <span>Export PDF (All {slides.length} Slides)</span>
                  </>
                )}
              </button>

              {/* Secondary 2-Col Grid: Single Slide PNG & All PNGs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={handleDownloadSingle}
                  disabled={isExporting}
                  className="py-2.5 px-3.5 rounded-xl bg-surface-elevated hover:bg-surface-card border border-surface-border hover:border-emerald-500/40 text-slate-200 hover:text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  title="Download currently active slide as a lossless 1080p PNG image"
                >
                  {exportingType === 'single' ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                      <span>Rendering Slide...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Download Slide {String(currentSlideIndex + 1).padStart(2, '0')} (PNG)</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleDownloadAllPngs}
                  disabled={isExporting}
                  className="py-2.5 px-3.5 rounded-xl bg-surface-elevated hover:bg-surface-card border border-surface-border hover:border-cyan-500/40 text-slate-200 hover:text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  title="Download all slides as individual 1080p PNG images"
                >
                  {exportingType === 'all' ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                      <span>Archiving {slides.length} Slides...</span>
                    </>
                  ) : (
                    <>
                      <Layers className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Download All ({slides.length} PNGs)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Editor Tabs: Content vs Styling */}
          <div className="card-matte p-5 sm:p-6 space-y-5 relative overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            {/* Tab Dock Header */}
            <div className="flex bg-surface-well p-1 rounded-xl border border-surface-border">
              <button
                type="button"
                onClick={() => setActiveTab('content')}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  activeTab === 'content'
                    ? 'bg-surface-elevated text-white border border-slate-700/80 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.02]'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Slide Content</span>
                <span className="badge-pill font-mono text-[9px] px-1 py-0">#{currentSlideIndex + 1}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('style')}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  activeTab === 'style'
                    ? 'bg-surface-elevated text-white border border-slate-700/80 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.02]'
                }`}
              >
                <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                <span>Themes & Visuals</span>
                <span className="badge-pill font-mono text-[9px] px-1 py-0">{custom.theme}</span>
              </button>
            </div>

            {/* TAB 1: Content Editor */}
            {activeTab === 'content' && (
              <div className="space-y-4 animate-fade-in">
                {/* Slide Badge Input */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Tag className="w-3 h-3 text-emerald-400" />
                      <span>Slide Badge / Category</span>
                    </label>
                    <span className="text-[10px] font-mono text-slate-500">
                      {(activeSlide.tagline || '').length}/25
                    </span>
                  </div>
                  <input
                    type="text"
                    maxLength={30}
                    value={activeSlide.tagline || ''}
                    onChange={(e) => handleUpdateActiveSlide('tagline', e.target.value)}
                    placeholder="e.g. FRAMEWORK, PRO TIP, STEP 1"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-well border border-surface-border text-xs text-white placeholder-slate-600 outline-none focus:border-emerald-500/70 focus:ring-1 focus:ring-emerald-500/40 font-mono tracking-wide transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)]"
                  />
                  <p className="text-[10px] text-slate-500 mt-1 font-sans">
                    Top-left pill badge that categorizes this slide.
                  </p>
                </div>

                {/* Slide Headline Textarea */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Heading className="w-3 h-3 text-emerald-400" />
                      <span>Slide Headline</span>
                    </label>
                    <span className={`text-[10px] font-mono ${(activeSlide.title || '').length > 60 ? 'text-amber-400' : 'text-slate-500'}`}>
                      {(activeSlide.title || '').length}/70
                    </span>
                  </div>
                  <textarea
                    rows={2}
                    maxLength={85}
                    value={activeSlide.title || ''}
                    onChange={(e) => handleUpdateActiveSlide('title', e.target.value)}
                    placeholder="Enter high-impact headline..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-well border border-surface-border text-xs sm:text-sm font-semibold text-white placeholder-slate-600 outline-none focus:border-emerald-500/70 focus:ring-1 focus:ring-emerald-500/40 resize-none transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)] leading-snug"
                  />
                  <p className="text-[10px] text-slate-500 mt-1 font-sans">
                    Rendered at 64px bold. Keep under 2 punchy lines for maximum retention.
                  </p>
                </div>

                {/* Body Explanation Textarea */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <AlignLeft className="w-3 h-3 text-emerald-400" />
                      <span>Body Explanation</span>
                    </label>
                    <span className={`text-[10px] font-mono ${(activeSlide.body || '').length > 220 ? 'text-amber-400' : 'text-slate-500'}`}>
                      {(activeSlide.body || '').length}/240
                    </span>
                  </div>
                  <textarea
                    rows={4}
                    maxLength={260}
                    value={activeSlide.body || ''}
                    onChange={(e) => handleUpdateActiveSlide('body', e.target.value)}
                    placeholder="Explain the tactical concept with high clarity..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-well border border-surface-border text-xs text-slate-200 placeholder-slate-600 outline-none focus:border-emerald-500/70 focus:ring-1 focus:ring-emerald-500/40 resize-none transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)] leading-relaxed"
                  />
                  <p className="text-[10px] text-slate-500 mt-1 font-sans">
                    Core explanatory paragraph. Automatically word-wraps onto the canvas.
                  </p>
                </div>

                {/* Highlight Callout Box */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      <span>Highlight Callout Box (Optional)</span>
                    </label>
                    <span className="text-[10px] font-mono text-slate-500">
                      {(activeSlide.highlightText || '').length}/65
                    </span>
                  </div>
                  <input
                    type="text"
                    maxLength={75}
                    value={activeSlide.highlightText || ''}
                    onChange={(e) => handleUpdateActiveSlide('highlightText', e.target.value)}
                    placeholder="e.g. Pro Tip: Distribution > Innovation"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-well border border-surface-border text-xs text-white placeholder-slate-600 outline-none focus:border-amber-500/70 focus:ring-1 focus:ring-amber-500/40 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)]"
                  />
                  <p className="text-[10px] text-slate-500 mt-1 font-sans">
                    Accent callout container rendered with theme border and colored highlight strip.
                  </p>
                </div>

                {/* Slide Options: Swipe Indicator Toggle */}
                <div className="pt-3 flex items-center justify-between border-t border-surface-border/60">
                  <div>
                    <div className="text-xs text-slate-200 font-medium">Swipe Indicator ("SWIPE →")</div>
                    <div className="text-[10px] text-slate-500">Footer navigation prompt for readers</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleUpdateActiveSlide('swipeIndicator', !activeSlide.swipeIndicator)}
                    className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      activeSlide.swipeIndicator ? 'bg-emerald-500' : 'bg-surface-well border-surface-border'
                    }`}
                    title="Toggle SWIPE indicator on this slide"
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out mt-0.5 ml-0.5 ${
                        activeSlide.swipeIndicator ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: Visual Styling & Design System */}
            {activeTab === 'style' && (
              <div className="space-y-5 animate-fade-in text-xs">
                {/* Theme Picker */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                      Color Theme & Palette
                    </label>
                    <span className="badge-pill text-[9px] font-mono text-slate-400">5 curated styles</span>
                  </div>

                  <div className="grid grid-cols-1 gap-2.5">
                    {(Object.keys(THEMES) as CarouselTheme[]).map((themeKey) => {
                      const meta = THEME_PREVIEWS[themeKey];
                      const isSelected = custom.theme === themeKey;
                      return (
                        <button
                          key={themeKey}
                          type="button"
                          onClick={() => setCustom((prev) => ({ ...prev, theme: themeKey }))}
                          className={`relative group p-3 rounded-xl border text-left transition-all duration-200 overflow-hidden flex items-center justify-between gap-3 ${
                            isSelected
                              ? `${meta.activeBorder} ${meta.activeRing} ${meta.activeShadow} bg-surface-elevated`
                              : 'border-surface-border bg-surface-well/50 hover:bg-surface-elevated/70 hover:border-slate-700'
                          }`}
                        >
                          {/* Specular Highlight */}
                          <div className={`absolute inset-x-0 top-0 h-[1px] transition-opacity duration-200 ${isSelected ? 'bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-100' : 'opacity-0 group-hover:opacity-100 bg-gradient-to-r from-transparent via-white/10 to-transparent'}`} />

                          <div>
                            <div className="font-semibold text-white text-xs flex items-center gap-1.5">
                              <span>{meta.title}</span>
                              {isSelected && (
                                <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                              {meta.tagline}
                            </div>
                          </div>

                          {/* Glowing Palette Swatches Pill */}
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-base border border-surface-border shadow-inner">
                            {meta.swatches.map((color, i) => (
                              <span
                                key={i}
                                className="w-3.5 h-3.5 rounded-full border border-black/30 transition-transform group-hover:scale-110"
                                style={{
                                  backgroundColor: color,
                                  boxShadow: i === meta.swatches.length - 1 ? `0 0 10px ${color}` : undefined,
                                }}
                                title={color}
                              />
                            ))}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Typography & Alignment Grid */}
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-surface-border/60">
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                      Font Pair
                    </label>
                    <select
                      value={custom.fontStyle}
                      onChange={(e) => setCustom((prev) => ({ ...prev, fontStyle: e.target.value as CarouselFontStyle }))}
                      className="w-full px-2.5 py-2 rounded-xl bg-surface-well border border-surface-border text-xs text-white outline-none focus:border-emerald-500/60 font-sans"
                    >
                      <option value="modern">Modern Bold (Inter)</option>
                      <option value="editorial">Editorial (Serif Luxe)</option>
                      <option value="mono">Cyber Tech (Mono)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                      Text Alignment
                    </label>
                    <div className="flex bg-surface-well p-1 rounded-xl border border-surface-border">
                      <button
                        type="button"
                        onClick={() => setCustom((prev) => ({ ...prev, textAlign: 'left' }))}
                        className={`flex-1 py-1 rounded-lg flex items-center justify-center transition-all ${
                          custom.textAlign === 'left' ? 'bg-surface-elevated text-white shadow-sm' : 'text-slate-400 hover:text-white'
                        }`}
                        title="Align Left"
                      >
                        <AlignLeft className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setCustom((prev) => ({ ...prev, textAlign: 'center' }))}
                        className={`flex-1 py-1 rounded-lg flex items-center justify-center transition-all ${
                          custom.textAlign === 'center' ? 'bg-surface-elevated text-white shadow-sm' : 'text-slate-400 hover:text-white'
                        }`}
                        title="Align Center"
                      >
                        <AlignCenter className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Texture & Size Scale */}
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-surface-border/60">
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                      Canvas Texture
                    </label>
                    <select
                      value={custom.bgPattern}
                      onChange={(e) => setCustom((prev) => ({ ...prev, bgPattern: e.target.value as CanvasBgPattern }))}
                      className="w-full px-2.5 py-2 rounded-xl bg-surface-well border border-surface-border text-xs text-white outline-none focus:border-emerald-500/60 font-sans"
                    >
                      <option value="mesh">Radial Mesh Glow</option>
                      <option value="grid">Cyber Tech Grid</option>
                      <option value="minimal">Minimal Pure Matte</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                      Font Size Scale
                    </label>
                    <select
                      value={custom.fontSizeScale}
                      onChange={(e) => setCustom((prev) => ({ ...prev, fontSizeScale: e.target.value as any }))}
                      className="w-full px-2.5 py-2 rounded-xl bg-surface-well border border-surface-border text-xs text-white outline-none focus:border-emerald-500/60 font-sans"
                    >
                      <option value="compact">Compact (More Text)</option>
                      <option value="normal">Balanced (Standard)</option>
                      <option value="large">Punchy (Bold Impact)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};
