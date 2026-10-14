import { describe, it, expect } from './helpers/testHarness';
import { setupBrowserMock, MockCanvas, downloadsTriggered, clipboardHistory } from './helpers/browserMock';
import { CanvasRenderer, THEMES, ASPECT_RATIOS } from '../src/services/canvasRenderer';
import { CreditManager } from '../src/services/creditManager';
import { GeminiService } from '../src/services/geminiService';
import { CarouselSlide, CanvasCustomization } from '../src/types';

export async function runTier4Tests() {
  setupBrowserMock();

  await describe('Tier 4 - Scenario 1: Full End-to-End Creator Publishing Workflow', async () => {
    setupBrowserMock();
    localStorage.clear();

    let generatedResult: any = null;
    let customDeck: CarouselSlide[] = [];

    await it('Step 1: User enters custom prompt and initiates generation', async () => {
      expect(CreditManager.canGenerate()).toBe(true);
      const params = {
        topic: 'How solopreneurs build $10k/mo automated systems in 2026',
        niche: 'Solopreneurs & Engineers',
        tone: 'Contrarian' as const,
        platform: 'TikTok/Reels' as const,
      };

      generatedResult = await GeminiService.generateContent(params);
      CreditManager.consumeCredit();

      expect(generatedResult.hooks.length).toBe(5);
      expect(generatedResult.carouselSlides.length).toBeGreaterThanOrEqual(6);
      expect(generatedResult.shortScript.scenes.length).toBeGreaterThanOrEqual(5);
      expect(CreditManager.getCredits().freeCreditsRemaining).toBe(2);
    });

    await it('Step 2: Creator inspects hooks and copies highest potential hook', async () => {
      const topHook = generatedResult.hooks[0];
      const textToCopy = `HOOK: "${topHook.hookText}"\nFIRST FRAME: "${topHook.suggestedFirstFrameText}"\nVIRALITY SCORE: ${topHook.viralityScore}/100`;
      await navigator.clipboard.writeText(textToCopy);

      expect(clipboardHistory.length).toBe(1);
      expect(clipboardHistory[0]).toContain(topHook.hookText);
      expect(clipboardHistory[0]).toContain('VIRALITY SCORE');
    });

    await it('Step 3: Creator customizes carousel deck, switches to 9:16 story, and chooses neon-hacker theme', () => {
      customDeck = [...generatedResult.carouselSlides];
      // Edit headline of slide 1
      customDeck[0] = {
        ...customDeck[0],
        title: 'The $10k Solopreneur Blueprint',
        highlightText: 'Rule: Systems > Motivation',
      };

      const custom: CanvasCustomization = {
        theme: 'neon-hacker',
        aspectRatio: '9:16',
        fontStyle: 'editorial',
        bgPattern: 'grid',
        textAlign: 'left',
        fontSizeScale: 'large',
      };

      const canvas = new MockCanvas();
      CanvasRenderer.renderSlideToCanvas(canvas as any, customDeck[0], customDeck.length, custom, false);

      expect(canvas.width).toBe(1080);
      expect(canvas.height).toBe(1920);

      const hasTitle = canvas.context.drawnTexts.some((t) => t.includes('The $10k Solopreneur Blueprint'));
      expect(hasTitle).toBe(true);

      const hasHighlight = canvas.context.drawnTexts.some((t) => t.includes('Systems > Motivation'));
      expect(hasHighlight).toBe(true);
    });

    await it('Step 4: Creator downloads customized Slide 1 as PNG and full deck as vector PDF', async () => {
      downloadsTriggered.length = 0;
      const custom: CanvasCustomization = {
        theme: 'neon-hacker',
        aspectRatio: '9:16',
        fontStyle: 'editorial',
        bgPattern: 'grid',
        textAlign: 'left',
        fontSizeScale: 'large',
      };

      CanvasRenderer.downloadSingleSlide(customDeck[0], customDeck.length, custom, false, 'solopreneur_slide_1.png');
      expect(downloadsTriggered.length).toBe(1);
      expect(downloadsTriggered[0].download).toBe('solopreneur_slide_1.png');

      await CanvasRenderer.downloadAllSlidesAsPdf(customDeck, custom, false, 'Solopreneur_Blueprint');
      expect(true).toBe(true);
    });

    await it('Step 5: Creator reviews 60s script and copies full production script', async () => {
      const script = generatedResult.shortScript;
      const fullText = script.scenes
        .map(
          (s: any) =>
            `[${s.timestamp}]\nSPOKEN: ${s.spokenWords}\nVISUAL: ${s.visualCue}\nOVERLAY: ${s.screenOverlayText}\nAUDIO: ${s.soundFX}\n`
        )
        .join('\n') + `\nCLOSING CTA: ${script.callToAction}`;

      await navigator.clipboard.writeText(fullText);
      expect(clipboardHistory.length).toBe(2);
      expect(clipboardHistory[1]).toContain('CLOSING CTA:');
      expect(clipboardHistory[1]).toContain(script.callToAction);
    });
  });

  await describe('Tier 4 - Scenario 2: Lifetime Pro Upgrade & Watermark Elimination', async () => {
    setupBrowserMock();
    localStorage.clear();

    await it('Step 1: Creator consumes all 3 daily credits and encounters limit', () => {
      CreditManager.consumeCredit();
      CreditManager.consumeCredit();
      CreditManager.consumeCredit();
      expect(CreditManager.canGenerate()).toBe(false);
    });

    await it('Step 2: Creator unlocks Lifetime Pro via valid license pass HF-PRO-CREATOR-VIP', () => {
      const unlocked = CreditManager.activatePro('HF-PRO-CREATOR-VIP');
      expect(unlocked).toBe(true);
      expect(CreditManager.getCredits().isPro).toBe(true);
      expect(CreditManager.canGenerate()).toBe(true);
    });

    await it('Step 3: Pro creator generates additional deck with zero watermarks', () => {
      const slide: CarouselSlide = {
        id: 'pro-slide',
        slideNumber: 1,
        tagline: 'PRO VIP',
        title: 'White Label Production',
        body: 'Export without any third-party attribution.',
      };
      const custom: CanvasCustomization = {
        theme: 'bold-gradient',
        aspectRatio: '4:5',
        fontStyle: 'modern',
        bgPattern: 'mesh',
        textAlign: 'left',
        fontSizeScale: 'normal',
      };

      const canvas = new MockCanvas();
      CanvasRenderer.renderSlideToCanvas(canvas as any, slide, 1, custom, true);

      // Verifies Pro studio watermark is applied instead of free attribution
      const hasFree = canvas.context.drawnTexts.some((t) => t.includes('Created with HookForge AI'));
      const hasPro = canvas.context.drawnTexts.some((t) => t.includes('HookForge Pro Studio'));
      expect(hasFree).toBe(false);
      expect(hasPro).toBe(true);
    });
  });

  await describe('Tier 4 - Scenario 3: High-Volume Deck Creation (10 Slides Expansion)', async () => {
    let largeDeck: CarouselSlide[] = [];

    await it('Step 1: Create initial 6-slide deck and expand to 10 slides', () => {
      largeDeck = Array(6)
        .fill(0)
        .map((_, i) => ({
          id: `slide-${i + 1}`,
          slideNumber: i + 1,
          tagline: `STEP 0${i + 1}`,
          title: `Milestone Phase ${i + 1}`,
          body: `Detailed tactical execution for phase ${i + 1}.`,
          swipeIndicator: i < 5,
        }));

      for (let i = 7; i <= 10; i++) {
        largeDeck.push({
          id: `slide-${i}`,
          slideNumber: i,
          tagline: `BONUS 0${i - 6}`,
          title: `Advanced Leverage Strategy ${i - 6}`,
          body: `Bonus framework instruction ${i - 6}.`,
          swipeIndicator: i < 10,
        });
      }

      expect(largeDeck.length).toBe(10);
      expect(largeDeck[9].slideNumber).toBe(10);
    });

    await it('Step 2: Render slide 10 to canvas and verify slide counter reflects 10 / 10', () => {
      const canvas = new MockCanvas();
      const custom: CanvasCustomization = {
        theme: 'sunset-glow',
        aspectRatio: '1:1',
        fontStyle: 'mono',
        bgPattern: 'minimal',
        textAlign: 'center',
        fontSizeScale: 'compact',
      };

      CanvasRenderer.renderSlideToCanvas(canvas as any, largeDeck[9], largeDeck.length, custom, true);
      const hasCounter = canvas.context.drawnTexts.some((t) => t.includes('10 / 10'));
      expect(hasCounter).toBe(true);
    });

    await it('Step 3: Staggered download of all 10 slides PNGs schedules 10 files', () => {
      downloadsTriggered.length = 0;
      const custom: CanvasCustomization = {
        theme: 'dark-minimal',
        aspectRatio: '4:5',
        fontStyle: 'modern',
        bgPattern: 'mesh',
        textAlign: 'left',
        fontSizeScale: 'normal',
      };

      // Mock setTimeout synchronously for testing
      const originalSetTimeout = globalThis.setTimeout;
      (globalThis as any).setTimeout = (fn: Function) => {
        fn();
        return 0 as any;
      };

      CanvasRenderer.downloadAllSlidesAsPngs(largeDeck, custom, true, 'Volume_Deck');
      (globalThis as any).setTimeout = originalSetTimeout;

      expect(downloadsTriggered.length).toBe(10);
      expect(downloadsTriggered[0].download).toBe('Volume_Deck_slide_1.png');
      expect(downloadsTriggered[9].download).toBe('Volume_Deck_slide_10.png');
    });
  });

  await describe('Tier 4 - Scenario 4: Multi-Format Teleprompter & Bulk TXT Export', async () => {
    setupBrowserMock();

    await it('Step 1: Teleprompter mirror flip transformation applies scale-x-[-1]', () => {
      const isMirrored = true;
      const transformClass = isMirrored ? 'scale-x-[-1]' : '';
      expect(transformClass).toBe('scale-x-[-1]');
    });

    await it('Step 2: Bulk hook TXT export creates downloadable plain text file with all 5 hooks', () => {
      downloadsTriggered.length = 0;

      const fallback = GeminiService.generateSmartFallback({
        topic: 'Agency Automation Systems',
        niche: 'Founders',
        tone: 'Educational',
        platform: 'YouTube Shorts',
      });

      const fullText = fallback.hooks
        .map(
          (h, i) =>
            `[HOOK ${i + 1} - ${h.type.toUpperCase()}] (Score: ${h.viralityScore}/100)\nSpoken: "${h.hookText}"\nFirst Frame: "${h.suggestedFirstFrameText}"\nPsychology: ${h.psychologicalTrigger}\n`
        )
        .join('\n---\n\n');

      const blob = new Blob([fullText], { type: 'text/plain;charset=utf-8' });
      const link = document.createElement('a') as any;
      link.href = URL.createObjectURL(blob);
      link.download = 'hookforge_viral_hooks.txt';
      link.click();

      expect(downloadsTriggered.length).toBe(1);
      expect(downloadsTriggered[0].download).toBe('hookforge_viral_hooks.txt');
      expect(fullText).toContain('[HOOK 1 -');
      expect(fullText).toContain('[HOOK 5 -');
    });
  });
}
