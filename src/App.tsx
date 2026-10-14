import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { InputSection } from './components/InputSection';
import { HookPackView } from './components/HookPackView';
import { ScriptTeleprompterView } from './components/ScriptTeleprompterView';
import { CarouselEditor } from './components/CarouselEditor';
import { UpgradeModal } from './components/UpgradeModal';
import { ApiKeyModal } from './components/ApiKeyModal';
import { ToastContainer } from './components/Toast';
import { GeminiService } from './services/geminiService';
import { CreditManager } from './services/creditManager';
import { GenerationResult, UserCredits, ToastMessage } from './types';
import { Flame, Layers, Film, TrendingUp, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';

export function App() {
  const [credits, setCredits] = useState<UserCredits>(CreditManager.getCredits());
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [activeTab, setActiveTab] = useState<'hooks' | 'carousel' | 'script'>('hooks');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Modals
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  const [isApiKeyOpen, setIsApiKeyOpen] = useState(false);

  // Initial load: populate with high quality initial showcase
  useEffect(() => {
    const demo = GeminiService.generateSmartFallback({
      topic: 'How to build and launch automated cashflow micro-SaaS tools with AI in 72 hours',
      niche: 'AI & Remote Tech Builders',
      tone: 'Contrarian',
      platform: 'TikTok/Reels',
    });
    setResult(demo);
  }, []);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newToast: ToastMessage = { id, text, type };
    setToasts((prev) => [...prev, newToast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const refreshCredits = () => {
    setCredits(CreditManager.getCredits());
  };

  const handleGenerate = async (params: {
    topic: string;
    niche: string;
    tone: any;
    platform: any;
  }) => {
    // Check credits
    if (!CreditManager.canGenerate()) {
      showToast('Daily free credits reached. Upgrade or add your Gemini API key!', 'info');
      setIsUpgradeOpen(true);
      return;
    }

    setIsLoading(true);
    try {
      const generated = await GeminiService.generateContent(params);
      CreditManager.consumeCredit();
      refreshCredits();
      setResult(generated);
      setActiveTab('hooks');
      confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
      showToast('Generated fresh viral hook pack & carousel deck!', 'success');
    } catch (err: any) {
      console.error(err);
      showToast(`Generation failed: ${err.message || 'Unknown error'}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-base text-slate-100 flex flex-col font-sans selection:bg-emerald-500/20 selection:text-emerald-200 relative overflow-x-hidden">
      
      {/* Ambient Backdrop Lighting & Spotlight */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        {/* Top Radial Spotlight (Emerald/Cyan Linear glow) */}
        <div 
          className="absolute -top-[15%] left-1/2 -translate-x-1/2 w-[1100px] h-[550px] opacity-25 blur-[120px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(16,185,129,0.35) 0%, rgba(6,182,212,0.18) 45%, transparent 70%)'
          }}
        />
        {/* Subtle Mid-Page Ambient Depth */}
        <div 
          className="absolute top-[40%] left-1/2 -translate-x-1/2 w-[900px] h-[450px] opacity-10 blur-[140px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)'
          }}
        />
      </div>

      {/* Launch Celebration Announcement Bar */}
      {!credits.isPro && (
        <aside aria-label="Announcement" className="relative z-40 bg-gradient-to-r from-emerald-950/60 via-amber-950/40 to-teal-950/60 border-b border-emerald-500/20 py-2 px-4 backdrop-blur-md">
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-2.5 flex-wrap text-xs text-slate-300">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono font-bold text-[10px] border border-amber-500/30 uppercase tracking-wider">
              🔥 Launch Special
            </span>
            <span>
              First 10 Creators get <strong className="text-white font-semibold">50% OFF</strong> ($19 Lifetime Access) with code{' '}
              <code className="bg-surface-card px-1.5 py-0.5 rounded text-amber-300 font-mono font-bold border border-surface-border">
                EARLYBIRD
              </code>
            </span>
            <button
              onClick={() => setIsUpgradeOpen(true)}
              className="text-emerald-400 hover:text-emerald-300 font-semibold inline-flex items-center gap-1 transition-colors group cursor-pointer"
            >
              <span>Claim \$19 Pass</span>
              <span className="group-hover:translate-x-0.5 transition-transform">→</span>
            </button>
          </div>
        </aside>
      )}

      {/* Navigation */}
      <Navbar
        credits={credits}
        onOpenUpgrade={() => setIsUpgradeOpen(true)}
        onOpenApiKey={() => setIsApiKeyOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
        
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-5">
          {/* Refined Crisp Chip Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-card/90 border border-surface-border text-[11px] font-mono tracking-wider text-slate-300 shadow-[0_0_20px_-3px_rgba(16,185,129,0.15)] backdrop-blur-md transition-all hover:border-emerald-500/40">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
            </span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <Zap className="w-3 h-3 fill-emerald-400 text-emerald-400" />
              NEXT-GEN CREATOR SUITE
            </span>
            <span className="text-slate-600 hidden sm:inline">|</span>
            <span className="text-slate-400 font-sans tracking-normal hidden sm:inline">10s Autonomous Multi-Format Engine</span>
          </div>

          {/* Refined Typography with Negative Tracking & Gradient Text */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-[-0.03em] text-white leading-[1.1] sm:leading-[1.12]">
            The Autonomous{' '}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(16,185,129,0.22)]">
              Viral Script & Carousel
            </span>{' '}
            Studio
          </h1>

          <p className="text-sm sm:text-base lg:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed font-normal">
            Generate 5 psychological hook variants, a 60s retention video script with director cues, and an in-browser multi-slide visual carousel ready for LinkedIn and Instagram.
          </p>

          {/* Social Proof Micro-Capsules Bar */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-4 pt-2 text-[11px] sm:text-xs text-slate-400 font-mono">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-card/70 border border-surface-border/80 backdrop-blur-sm shadow-sm">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>100% Client-Side ($0 GPU)</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-card/70 border border-surface-border/80 backdrop-blur-sm shadow-sm">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>1080p Master Canvas Engine</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-card/70 border border-surface-border/80 backdrop-blur-sm shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Gemini 2.0 API Powered</span>
            </div>
          </div>
        </div>

        {/* Input Form Section */}
        <InputSection onGenerate={handleGenerate} isLoading={isLoading} />

        {/* Output Workspace Section */}
        {result && (
          <div className="w-full relative pt-8 space-y-8">
            {/* Specular Gradient Divider Line */}
            <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-surface-border to-transparent" />
            
            {/* Segmented Tab Dock — Floating Glassmorphism Pill */}
            <div className="flex items-center justify-center sticky top-20 z-30 py-2 -my-2">
              <div className="flex p-1 rounded-full glass-dock max-w-xl w-full">
                
                {/* Tab 1: Hooks */}
                <button
                  onClick={() => setActiveTab('hooks')}
                  className={`flex-1 py-1.5 sm:py-2 px-2.5 sm:px-4 rounded-full text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 sm:gap-2 transition-all duration-200 relative ${
                    activeTab === 'hooks'
                      ? 'bg-surface-elevated text-white border border-slate-700/80 shadow-[0_2px_12px_rgba(0,0,0,0.5),0_0_20px_-4px_rgba(16,185,129,0.3)] before:absolute before:inset-x-3 before:top-0 before:h-[1px] before:bg-gradient-to-r before:from-transparent before:via-emerald-400/80 before:to-transparent'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03] border border-transparent'
                  }`}
                >
                  <Flame className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 transition-colors ${activeTab === 'hooks' ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'text-slate-500'}`} />
                  <span className="hidden sm:inline">5 Viral Hooks</span>
                  <span className="sm:hidden">Hooks</span>
                  <span className={`hidden sm:inline-block text-[10px] font-mono px-1.5 py-0.2 rounded-full border transition-colors ${
                    activeTab === 'hooks'
                      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                      : 'bg-surface-well text-slate-500 border-slate-800'
                  }`}>5</span>
                </button>

                {/* Tab 2: Carousel Studio */}
                <button
                  onClick={() => setActiveTab('carousel')}
                  className={`flex-1 py-1.5 sm:py-2 px-2.5 sm:px-4 rounded-full text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 sm:gap-2 transition-all duration-200 relative ${
                    activeTab === 'carousel'
                      ? 'bg-surface-elevated text-white border border-slate-700/80 shadow-[0_2px_12px_rgba(0,0,0,0.5),0_0_20px_-4px_rgba(16,185,129,0.3)] before:absolute before:inset-x-3 before:top-0 before:h-[1px] before:bg-gradient-to-r before:from-transparent before:via-emerald-400/80 before:to-transparent'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03] border border-transparent'
                  }`}
                >
                  <Layers className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 transition-colors ${activeTab === 'carousel' ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'text-slate-500'}`} />
                  <span className="hidden sm:inline">Carousel Studio</span>
                  <span className="sm:hidden">Studio</span>
                  <span className={`hidden sm:inline-block text-[10px] font-mono px-1.5 py-0.2 rounded-full border transition-colors ${
                    activeTab === 'carousel'
                      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                      : 'bg-surface-well text-slate-500 border-slate-800'
                  }`}>Deck</span>
                </button>

                {/* Tab 3: Script */}
                <button
                  onClick={() => setActiveTab('script')}
                  className={`flex-1 py-1.5 sm:py-2 px-2.5 sm:px-4 rounded-full text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 sm:gap-2 transition-all duration-200 relative ${
                    activeTab === 'script'
                      ? 'bg-surface-elevated text-white border border-slate-700/80 shadow-[0_2px_12px_rgba(0,0,0,0.5),0_0_20px_-4px_rgba(16,185,129,0.3)] before:absolute before:inset-x-3 before:top-0 before:h-[1px] before:bg-gradient-to-r before:from-transparent before:via-emerald-400/80 before:to-transparent'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03] border border-transparent'
                  }`}
                >
                  <Film className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 transition-colors ${activeTab === 'script' ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'text-slate-500'}`} />
                  <span className="hidden sm:inline">60s Video Script</span>
                  <span className="sm:hidden">Script</span>
                  <span className={`hidden sm:inline-block text-[10px] font-mono px-1.5 py-0.2 rounded-full border transition-colors ${
                    activeTab === 'script'
                      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                      : 'bg-surface-well text-slate-500 border-slate-800'
                  }`}>60s</span>
                </button>

              </div>
            </div>

            {/* Active Tab View */}
            <div className="pt-2 w-full">
              {activeTab === 'hooks' && (
                <HookPackView hooks={result.hooks} showToast={showToast} />
              )}

              {activeTab === 'carousel' && (
                <CarouselEditor
                  initialSlides={result.carouselSlides}
                  isPro={credits.isPro}
                  onOpenUpgrade={() => setIsUpgradeOpen(true)}
                  showToast={showToast}
                />
              )}

              {activeTab === 'script' && (
                <ScriptTeleprompterView script={result.shortScript} showToast={showToast} />
              )}
            </div>

          </div>
        )}

      </main>

      {/* Footer — Linear/Vercel Aesthetic with 1px border (surface-border) & Status Indicator */}
      <footer className="border-t border-surface-border bg-surface-card/50 backdrop-blur-md py-8 mt-16 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Brand & Live System Status */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 font-mono font-bold text-slate-200">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>HookForge<span className="text-emerald-400">.ai</span></span>
            </div>
            <span className="text-surface-border">|</span>
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-surface-well border border-surface-border text-[11px] font-mono text-slate-400">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>All Systems Operational</span>
            </div>
          </div>

          {/* Micro-Copy */}
          <div className="text-center sm:text-left text-[11px] text-slate-400 font-mono space-y-0.5">
            <p>1080p Master Canvas • Client-Side PDF/PNG Export • Gemini AI Engine</p>
          </div>

          {/* Copyright & Version */}
          <div className="flex flex-col sm:items-end text-[11px] text-slate-500 font-mono">
            <span>© {new Date().getFullYear()} Aanandswarup Chavan</span>
            <span className="text-slate-600">All Rights Reserved • v1.0 PRO</span>
          </div>

        </div>
      </footer>

      {/* Upgrade & API Key Modals */}
      <UpgradeModal
        isOpen={isUpgradeOpen}
        onClose={() => setIsUpgradeOpen(false)}
        onSuccess={() => {
          refreshCredits();
          showToast('Pro mode activated! Watermarks removed & unlimited runs enabled.', 'success');
        }}
      />

      <ApiKeyModal
        isOpen={isApiKeyOpen}
        onClose={() => setIsApiKeyOpen(false)}
        onKeyUpdated={() => {
          refreshCredits();
          showToast('Gemini API key updated.', 'info');
        }}
      />

      {/* Floating Toasts */}
      <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />
    </div>
  );
}

export default App;
