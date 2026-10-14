export interface HookItem {
  id: string;
  type: 'Curiosity Gap' | 'Contrarian' | 'Negative / Fear' | 'Story Driven' | 'Data / Proof';
  hookText: string;
  viralityScore: number; // 1-100
  psychologicalTrigger: string;
  suggestedFirstFrameText: string;
}

export interface ScriptScene {
  timestamp: string; // e.g. "0:00 - 0:05"
  spokenWords: string;
  visualCue: string; // B-roll or gesture
  screenOverlayText: string;
  soundFX: string;
}

export interface ScriptPack {
  title: string;
  targetPlatform: 'TikTok/Reels' | 'YouTube Shorts' | 'LinkedIn Video';
  estimatedDuration: '30s' | '60s';
  scenes: ScriptScene[];
  pacingAdvice: string;
  callToAction: string;
  wordCount?: number;
  estimatedWpm?: number;
}

export interface CarouselSlide {
  id: string;
  slideNumber: number;
  tagline: string;
  title: string;
  body: string;
  highlightText?: string;
  swipeIndicator?: boolean;
}

export type CarouselTheme = 'dark-minimal' | 'bold-gradient' | 'editorial' | 'neon-hacker' | 'sunset-glow';
export type CarouselAspectRatio = '4:5' | '1:1' | '9:16';
export type CarouselFontStyle = 'modern' | 'editorial' | 'mono';
export type CanvasBgPattern = 'mesh' | 'minimal' | 'grid';

export interface CanvasCustomization {
  theme: CarouselTheme;
  aspectRatio: CarouselAspectRatio;
  fontStyle: CarouselFontStyle;
  bgPattern: CanvasBgPattern;
  textAlign: 'left' | 'center';
  fontSizeScale: 'compact' | 'normal' | 'large';
}

export interface GenerationResult {
  topic: string;
  niche: string;
  hooks: HookItem[];
  shortScript: ScriptPack;
  carouselSlides: CarouselSlide[];
}

export interface UserCredits {
  freeCreditsRemaining: number;
  isPro: boolean;
  byokActive: boolean;
  licenseKey?: string;
  lastResetDate: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'error';
  text: string;
}
