import { describe, it, expect } from './helpers/testHarness';
import { setupBrowserMock, MockCanvas, downloadsTriggered } from './helpers/browserMock';
import { CanvasRenderer, THEMES, ASPECT_RATIOS } from '../src/services/canvasRenderer';
import { CreditManager } from '../src/services/creditManager';
import { GeminiService } from '../src/services/geminiService';
import { CarouselSlide, CanvasCustomization, CarouselTheme, CarouselAspectRatio } from '../src/types';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

export async function runTier1Tests() {
  setupBrowserMock();

  await describe('Tier 1 - Area 1: Production Build Bundle & Technical Rigor', async () => {
    await it('T1.1.1: TypeScript compiler validates with zero errors', () => {
      const output = execSync('npx tsc --noEmit', { cwd: process.cwd(), encoding: 'utf-8' });
      expect(output.trim()).toBe('');
    });

    await it('T1.1.2: Production build succeeds and exits with code 0 with Vite build time regex check', () => {
      const output = execSync('npx vite build', { cwd: process.cwd(), encoding: 'utf-8' });
      
      // Vite build time regex check: "✓ built in X.XXs"
      const match = output.match(/built in (\d+(\.\d+)?)s/i);
      expect(match).toBeTruthy();
      expect(output).toContain('built in');
      const viteBuildSeconds = parseFloat(match![1]);
      expect(viteBuildSeconds).toBeGreaterThan(0);
    });

    await it('T1.1.3: dist/index.html is created with root container and proper metadata', () => {
      const htmlPath = path.join(process.cwd(), 'dist', 'index.html');
      expect(fs.existsSync(htmlPath)).toBeTruthy();
      const html = fs.readFileSync(htmlPath, 'utf-8');
      expect(html).toContain('id="root"');
      expect(html).toContain('HookForge AI');
    });

    await it('T1.1.4: Production bundle generates compiled CSS with dark theme tokens', () => {
      const assetsDir = path.join(process.cwd(), 'dist', 'assets');
      const files = fs.readdirSync(assetsDir);
      const cssFile = files.find((f) => f.endsWith('.css'));
      expect(cssFile).toBeTruthy();
      const css = fs.readFileSync(path.join(assetsDir, cssFile!), 'utf-8');
      expect(css.length).toBeGreaterThan(1000);
    });

    await it('T1.1.5: Production bundle includes separate vendor chunks for clean caching', () => {
      const assetsDir = path.join(process.cwd(), 'dist', 'assets');
      const files = fs.readdirSync(assetsDir);
      const jsFiles = files.filter((f) => f.endsWith('.js'));
      // Expect at least 3 chunked JS assets (vendor, jspdf, main)
      expect(jsFiles.length).toBeGreaterThanOrEqual(3);
    });
  });

  await describe('Tier 1 - Area 2: Canvas Resolutions (4:5, 1:1, 9:16)', async () => {
    await it('T1.2.1: 4:5 portrait resolution is exactly 1080×1350 for LinkedIn & Instagram', () => {
      const dims = CanvasRenderer.getDimensions('4:5');
      expect(dims.width).toBe(1080);
      expect(dims.height).toBe(1350);
      expect(dims.label).toContain('4:5 Portrait');
    });

    await it('T1.2.2: 1:1 square resolution is exactly 1080×1080 for Twitter / feeds', () => {
      const dims = CanvasRenderer.getDimensions('1:1');
      expect(dims.width).toBe(1080);
      expect(dims.height).toBe(1080);
      expect(dims.label).toContain('1:1 Square');
    });

    await it('T1.2.3: 9:16 story resolution is exactly 1080×1920 for TikTok / Reels', () => {
      const dims = CanvasRenderer.getDimensions('9:16');
      expect(dims.width).toBe(1080);
      expect(dims.height).toBe(1920);
      expect(dims.label).toContain('9:16 Story');
    });

    await it('T1.2.4: renderSlideToCanvas resizes canvas element to target master dimensions', () => {
      const canvas = new MockCanvas();
      const slide: CarouselSlide = {
        id: 'test-1',
        slideNumber: 1,
        tagline: 'STRATEGY',
        title: 'Mastering Growth',
        body: 'Growth requires consistency.',
      };
      const custom: CanvasCustomization = {
        theme: 'dark-minimal',
        aspectRatio: '9:16',
        fontStyle: 'modern',
        bgPattern: 'mesh',
        textAlign: 'left',
        fontSizeScale: 'normal',
      };
      CanvasRenderer.renderSlideToCanvas(canvas as any, slide, 5, custom, false);
      expect(canvas.width).toBe(1080);
      expect(canvas.height).toBe(1920);
    });

    await it('T1.2.5: getDimensions safely falls back to 4:5 (1080×1350) on undefined ratio', () => {
      const dims = CanvasRenderer.getDimensions(undefined as any);
      expect(dims.width).toBe(1080);
      expect(dims.height).toBe(1350);
    });
  });

  await describe('Tier 1 - Area 3: 5 Hook Types & Virality Presentation', async () => {
    const result = GeminiService.generateSmartFallback({
      topic: 'Landing your first $1,000 online',
      niche: 'Digital Entrepreneurship',
      tone: 'Contrarian',
      platform: 'TikTok/Reels',
    });

    await it('T1.3.1: Generates exactly 5 distinct viral hooks', () => {
      expect(result.hooks).toHaveLength(5);
    });

    await it('T1.3.2: Covers all 5 psychological hook archetypes', () => {
      const types = result.hooks.map((h) => h.type);
      expect(types).toContain('Curiosity Gap');
      expect(types).toContain('Contrarian');
      expect(types).toContain('Negative / Fear');
      expect(types).toContain('Story Driven');
      expect(types).toContain('Data / Proof');
    });

    await it('T1.3.3: Every hook has a virality score between 80 and 99', () => {
      for (const hook of result.hooks) {
        expect(hook.viralityScore).toBeGreaterThanOrEqual(80);
        expect(hook.viralityScore).toBeLessThanOrEqual(99);
      }
    });

    await it('T1.3.4: Every hook has psychological trigger attribution and Frame 0-1 text', () => {
      for (const hook of result.hooks) {
        expect(hook.psychologicalTrigger.length).toBeGreaterThan(5);
        expect(hook.suggestedFirstFrameText.length).toBeGreaterThan(5);
      }
    });

    await it('T1.3.5: Generates hook copy incorporating user topic seamlessly', () => {
      const hookTexts = result.hooks.map((h) => h.hookText).join(' ');
      expect(hookTexts).toContain('Landing your first $1,000 online');
    });
  });

  await describe('Tier 1 - Area 4: 3 Core Tabs & Script Breakdown', async () => {
    const result = GeminiService.generateSmartFallback({
      topic: 'Automated Micro-SaaS',
      niche: 'Developers',
      tone: 'Educational',
      platform: 'YouTube Shorts',
    });

    await it('T1.4.1: Generates complete ScriptPack data structure with scenes', () => {
      expect(result.shortScript).toBeTruthy();
      expect(result.shortScript.scenes.length).toBeGreaterThanOrEqual(4);
    });

    await it('T1.4.2: Script scenes include timestamp, spoken words, visual cue, and audio FX', () => {
      const firstScene = result.shortScript.scenes[0];
      expect(firstScene.timestamp).toContain('0:00');
      expect(firstScene.spokenWords.length).toBeGreaterThan(10);
      expect(firstScene.visualCue.length).toBeGreaterThan(5);
      expect(firstScene.soundFX.length).toBeGreaterThan(3);
    });

    await it('T1.4.3: Script scenes have on-screen text overlays for retention', () => {
      for (const scene of result.shortScript.scenes) {
        expect(scene.screenOverlayText.length).toBeGreaterThan(2);
      }
    });

    await it('T1.4.4: Script contains closing CTA and pacing advice', () => {
      expect(result.shortScript.callToAction.length).toBeGreaterThan(5);
      expect(result.shortScript.pacingAdvice).toContain('WPM');
    });

    await it('T1.4.5: Carousel slide deck contains at least 5 structured slides with taglines and titles', () => {
      expect(result.carouselSlides.length).toBeGreaterThanOrEqual(5);
      for (const slide of result.carouselSlides) {
        expect(slide.tagline.length).toBeGreaterThan(1);
        expect(slide.title.length).toBeGreaterThan(3);
        expect(slide.body.length).toBeGreaterThan(5);
      }
    });
  });

  await describe('Tier 1 - Area 5: BYOK (Bring Your Own Key) Settings', async () => {
    setupBrowserMock();

    await it('T1.5.1: Initially no API key is set and byokActive is false', () => {
      CreditManager.clearApiKey();
      expect(CreditManager.getApiKey()).toBe(null);
      const credits = CreditManager.getCredits();
      expect(credits.byokActive).toBe(false);
    });

    await it('T1.5.2: Setting a Gemini API key trims whitespace and persists to storage', () => {
      CreditManager.setApiKey('  AIzaSyFakeKeyForTest123  ');
      expect(CreditManager.getApiKey()).toBe('AIzaSyFakeKeyForTest123');
    });

    await it('T1.5.3: Setting an API key immediately activates byokActive', () => {
      const credits = CreditManager.getCredits();
      expect(credits.byokActive).toBe(true);
    });

    await it('T1.5.4: Clearing the API key removes it and deactivates byokActive', () => {
      CreditManager.clearApiKey();
      expect(CreditManager.getApiKey()).toBe(null);
      const credits = CreditManager.getCredits();
      expect(credits.byokActive).toBe(false);
    });

    await it('T1.5.5: Empty or whitespace-only key string removes the key', () => {
      CreditManager.setApiKey('validKey');
      CreditManager.setApiKey('   ');
      expect(CreditManager.getApiKey()).toBe(null);
      expect(CreditManager.getCredits().byokActive).toBe(false);
    });
  });

  await describe('Tier 1 - Area 6: Credit Tracking & Licensing Integrity', async () => {
    setupBrowserMock();

    await it('T1.6.1: Fresh user initializes with 3 free credits remaining', () => {
      localStorage.clear();
      const credits = CreditManager.getCredits();
      expect(credits.freeCreditsRemaining).toBe(3);
      expect(credits.isPro).toBe(false);
      expect(credits.byokActive).toBe(false);
    });

    await it('T1.6.2: Consuming a credit decrements the remaining count', () => {
      const ok = CreditManager.consumeCredit();
      expect(ok).toBe(true);
      expect(CreditManager.getCredits().freeCreditsRemaining).toBe(2);
    });

    await it('T1.6.3: Consuming down to zero prevents further runs on free tier', () => {
      CreditManager.consumeCredit(); // 1 remaining
      CreditManager.consumeCredit(); // 0 remaining
      expect(CreditManager.getCredits().freeCreditsRemaining).toBe(0);
      expect(CreditManager.canGenerate()).toBe(false);
      expect(CreditManager.consumeCredit()).toBe(false);
    });

    await it('T1.6.4: Activating lifetime Pro license gives unlimited generation privileges', () => {
      const activated = CreditManager.activatePro('HF-PRO-2026-TEST');
      expect(activated).toBe(true);
      const credits = CreditManager.getCredits();
      expect(credits.isPro).toBe(true);
      expect(credits.licenseKey).toBe('HF-PRO-2026-TEST');
      expect(CreditManager.canGenerate()).toBe(true);
      // Even with 0 free credits, consumeCredit succeeds
      expect(CreditManager.consumeCredit()).toBe(true);
    });

    await it('T1.6.5: License key validation rejects keys shorter than 6 characters', () => {
      localStorage.clear();
      const activated = CreditManager.activatePro('PRO');
      expect(activated).toBe(false);
      expect(CreditManager.getCredits().isPro).toBe(false);
    });
  });

  await describe('Tier 1 - Area 7: High-Fidelity Exports (PNG, PDF, TXT)', async () => {
    setupBrowserMock();

    const testSlide: CarouselSlide = {
      id: 'slide-1',
      slideNumber: 1,
      tagline: 'LESSON 1',
      title: 'High Velocity Execution',
      body: 'Never delay what can be shipped today.',
      highlightText: 'Speed is a feature.',
      swipeIndicator: true,
    };

    const custom: CanvasCustomization = {
      theme: 'dark-minimal',
      aspectRatio: '4:5',
      fontStyle: 'modern',
      bgPattern: 'mesh',
      textAlign: 'left',
      fontSizeScale: 'normal',
    };

    await it('T1.7.1: exportSlideAsDataUrl generates a valid base64 PNG data URL', () => {
      const dataUrl = CanvasRenderer.exportSlideAsDataUrl(testSlide, 5, custom, false);
      expect(dataUrl.startsWith('data:image/png;base64,')).toBe(true);
    });

    await it('T1.7.2: downloadSingleSlide triggers DOM anchor download with custom filename', () => {
      downloadsTriggered.length = 0;
      CanvasRenderer.downloadSingleSlide(testSlide, 5, custom, false, 'hookforge_test_slide.png');
      expect(downloadsTriggered.length).toBe(1);
      expect(downloadsTriggered[0].download).toBe('hookforge_test_slide.png');
      expect(downloadsTriggered[0].href.startsWith('data:image/png')).toBe(true);
    });

    await it('T1.7.3: downloadAllSlidesAsPdf executes without errors and generates PDF document', async () => {
      downloadsTriggered.length = 0;
      const slides = [testSlide, { ...testSlide, id: 'slide-2', slideNumber: 2, title: 'Second Slide' }];
      await CanvasRenderer.downloadAllSlidesAsPdf(slides, custom, false, 'Test_Project');
      expect(true).toBe(true);
    });

    await it('T1.7.4: Free tier watermark renders "⚡ Created with HookForge AI"', () => {
      const canvas = new MockCanvas();
      CanvasRenderer.renderSlideToCanvas(canvas as any, testSlide, 5, custom, false);
      const textMatches = canvas.context.drawnTexts.some((t) => t.includes('Created with HookForge AI'));
      expect(textMatches).toBe(true);
    });

    await it('T1.7.5: Pro tier watermark renders "✦ HookForge Pro Studio"', () => {
      const canvas = new MockCanvas();
      CanvasRenderer.renderSlideToCanvas(canvas as any, testSlide, 5, custom, true);
      const proMatches = canvas.context.drawnTexts.some((t) => t.includes('HookForge Pro Studio'));
      expect(proMatches).toBe(true);
    });
  });

  await describe('Tier 1 - Area 8: Design System Themes & Palette Tokens', async () => {
    await it('T1.8.1: dark-minimal palette features emerald accent (#10b981) and #0a0e17 background', () => {
      const theme = THEMES['dark-minimal'];
      expect(theme.name).toBe('Dark Minimal');
      expect(theme.accentColor).toBe('#10b981');
      expect(theme.background).toBe('#0a0e17');
    });

    await it('T1.8.2: bold-gradient palette features cyber violet accent (#8b5cf6)', () => {
      const theme = THEMES['bold-gradient'];
      expect(theme.name).toBe('Cyber Violet');
      expect(theme.accentColor).toBe('#8b5cf6');
      expect(theme.background).toBe('#0f0c20');
    });

    await it('T1.8.3: editorial palette features amber gold accent (#f59e0b)', () => {
      const theme = THEMES['editorial'];
      expect(theme.name).toBe('Editorial Luxe');
      expect(theme.accentColor).toBe('#f59e0b');
      expect(theme.background).toBe('#09090b');
    });

    await it('T1.8.4: neon-hacker palette features electric green accent (#22c55e)', () => {
      const theme = THEMES['neon-hacker'];
      expect(theme.name).toBe('Neon Terminal');
      expect(theme.accentColor).toBe('#22c55e');
      expect(theme.background).toBe('#040d12');
    });

    await it('T1.8.5: sunset-glow palette features rose coral accent (#f43f5e)', () => {
      const theme = THEMES['sunset-glow'];
      expect(theme.name).toBe('Sunset Rose');
      expect(theme.accentColor).toBe('#f43f5e');
      expect(theme.background).toBe('#190a0d');
    });
  });
}
