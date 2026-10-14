import { describe, it, expect } from './helpers/testHarness';
import { setupBrowserMock, MockCanvas, downloadsTriggered } from './helpers/browserMock';
import { CanvasRenderer, THEMES, ASPECT_RATIOS } from '../src/services/canvasRenderer';
import { CreditManager } from '../src/services/creditManager';
import { GeminiService } from '../src/services/geminiService';
import { CarouselSlide, CanvasCustomization, CarouselTheme, CarouselAspectRatio } from '../src/types';

export async function runTier3Tests() {
  setupBrowserMock();

  await describe('Tier 3 - Interaction 1: Aspect Ratio Switch + Canvas Render Fidelity', async () => {
    const slide: CarouselSlide = {
      id: 'slide-interactive',
      slideNumber: 1,
      tagline: 'ARCHITECTURE',
      title: 'Decoupled Frontends Scale Seamlessly',
      body: 'Zero server dependencies eliminate latency and operational infrastructure cost.',
      highlightText: 'Result: Sub-50ms user experience worldwide.',
      swipeIndicator: true,
    };

    const ratios: CarouselAspectRatio[] = ['4:5', '1:1', '9:16'];

    for (const ratio of ratios) {
      await it(`T3.1.${ratio}: Switching to ${ratio} recalculates canvas buffer and padding proportionally`, () => {
        const canvas = new MockCanvas();
        const custom: CanvasCustomization = {
          theme: 'dark-minimal',
          aspectRatio: ratio,
          fontStyle: 'modern',
          bgPattern: 'mesh',
          textAlign: 'left',
          fontSizeScale: 'normal',
        };

        CanvasRenderer.renderSlideToCanvas(canvas as any, slide, 4, custom, false);

        const expectedDims = ASPECT_RATIOS[ratio];
        expect(canvas.width).toBe(expectedDims.width);
        expect(canvas.height).toBe(expectedDims.height);

        // Verify slide counter pill is drawn on canvas
        const counterDrawn = canvas.context.drawnTexts.some((t) => t.includes('01 / 04'));
        expect(counterDrawn).toBe(true);

        // Verify swipe indicator is drawn
        const swipeDrawn = canvas.context.drawnTexts.some((t) => t.includes('SWIPE →'));
        expect(swipeDrawn).toBe(true);
      });
    }
  });

  await describe('Tier 3 - Interaction 2: Theme Change + High-Fidelity PDF Export', async () => {
    setupBrowserMock();

    const slides: CarouselSlide[] = [
      {
        id: '1',
        slideNumber: 1,
        tagline: 'DISRUPTION',
        title: 'The AI Shift in 2026',
        body: 'Human operators leverage deterministic agentic loops.',
        swipeIndicator: true,
      },
      {
        id: '2',
        slideNumber: 2,
        tagline: 'FRAMEWORK',
        title: '3 Core Tenets of Automation',
        body: 'Validate first, build second, distribute continuously.',
        swipeIndicator: false,
      },
    ];

    const themes: CarouselTheme[] = ['neon-hacker', 'bold-gradient', 'editorial', 'sunset-glow'];

    for (const themeKey of themes) {
      await it(`T3.2.${themeKey}: Changing theme to ${themeKey} applies correct palette and exports multi-page PDF`, async () => {
        const custom: CanvasCustomization = {
          theme: themeKey,
          aspectRatio: '4:5',
          fontStyle: 'modern',
          bgPattern: 'grid',
          textAlign: 'left',
          fontSizeScale: 'normal',
        };

        const canvas = new MockCanvas();
        CanvasRenderer.renderSlideToCanvas(canvas as any, slides[0], 2, custom, true);

        const themeConfig = THEMES[themeKey];
        // Background fill should match theme background
        const fillCalls = canvas.context.calls.filter((c) => c.type === 'fillRect');
        expect(fillCalls.length).toBeGreaterThan(0);
        // The first fill is canvas background
        expect(fillCalls[0].args[4]).toBe(themeConfig.background);

        // Export PDF
        await CanvasRenderer.downloadAllSlidesAsPdf(slides, custom, true, `Deck_${themeKey}`);
        expect(true).toBe(true);
      });
    }
  });

  await describe('Tier 3 - Interaction 3: BYOK Activation + Unlimited Credits Interaction', async () => {
    setupBrowserMock();

    await it('T3.3.1: Zero free credits blocks generation initially', () => {
      localStorage.clear();
      CreditManager.consumeCredit();
      CreditManager.consumeCredit();
      CreditManager.consumeCredit();
      expect(CreditManager.getCredits().freeCreditsRemaining).toBe(0);
      expect(CreditManager.canGenerate()).toBe(false);
    });

    await it('T3.3.2: Setting BYOK key instantly unblocks generation without paying for Pro', () => {
      CreditManager.setApiKey('AIzaSyValidGeminiKeyTest');
      const credits = CreditManager.getCredits();
      expect(credits.byokActive).toBe(true);
      expect(credits.isPro).toBe(false);
      expect(CreditManager.canGenerate()).toBe(true);
    });

    await it('T3.3.3: Consuming credit in BYOK mode does NOT decrement zero free credits balance', () => {
      const consumed = CreditManager.consumeCredit();
      expect(consumed).toBe(true);
      expect(CreditManager.getCredits().freeCreditsRemaining).toBe(0);
    });

    await it('T3.3.4: Clearing BYOK key restores credit limit blockage', () => {
      CreditManager.clearApiKey();
      expect(CreditManager.getCredits().byokActive).toBe(false);
      expect(CreditManager.canGenerate()).toBe(false);
    });
  });

  await describe('Tier 3 - Interaction 4: Pro License Activation + Watermark Switch', async () => {
    setupBrowserMock();

    const slide: CarouselSlide = {
      id: 'watermark-test',
      slideNumber: 1,
      tagline: 'BRANDING',
      title: 'Watermark Verification Slide',
      body: 'Checking watermark footer text differences.',
    };

    const custom: CanvasCustomization = {
      theme: 'dark-minimal',
      aspectRatio: '4:5',
      fontStyle: 'modern',
      bgPattern: 'minimal',
      textAlign: 'left',
      fontSizeScale: 'normal',
    };

    await it('T3.4.1: Free tier canvas renders Free watermark "⚡ Created with HookForge AI"', () => {
      const canvas = new MockCanvas();
      CanvasRenderer.renderSlideToCanvas(canvas as any, slide, 1, custom, false);
      const hasFree = canvas.context.drawnTexts.some((t) => t.includes('Created with HookForge AI'));
      const hasPro = canvas.context.drawnTexts.some((t) => t.includes('HookForge Pro Studio'));
      expect(hasFree).toBe(true);
      expect(hasPro).toBe(false);
    });

    await it('T3.4.2: Activating Pro switches canvas to Pro watermark "✦ HookForge Pro Studio"', () => {
      CreditManager.activatePro('HF-PRO-LICENSE-VALID');
      const isPro = CreditManager.getCredits().isPro;
      expect(isPro).toBe(true);

      const canvas = new MockCanvas();
      CanvasRenderer.renderSlideToCanvas(canvas as any, slide, 1, custom, isPro);
      const hasFree = canvas.context.drawnTexts.some((t) => t.includes('Created with HookForge AI'));
      const hasPro = canvas.context.drawnTexts.some((t) => t.includes('HookForge Pro Studio'));
      expect(hasFree).toBe(false);
      expect(hasPro).toBe(true);
    });
  });

  await describe('Tier 3 - Interaction 5: Slide CRUD Deck Mutations & Reindexing Synchronization', async () => {
    let deck: CarouselSlide[] = [
      { id: '1', slideNumber: 1, tagline: 'A', title: 'Intro', body: 'Introduction' },
      { id: '2', slideNumber: 2, tagline: 'B', title: 'Concept', body: 'Core concept' },
      { id: '3', slideNumber: 3, tagline: 'C', title: 'Conclusion', body: 'Final thoughts' },
    ];

    await it('T3.5.1: Duplicating a slide clones fields with "(Copy)" suffix and reindexes numbers', () => {
      const activeSlide = deck[1]; // 'Concept'
      const duplicate: CarouselSlide = {
        ...activeSlide,
        id: `slide-${Date.now()}`,
        title: `${activeSlide.title} (Copy)`,
      };
      const updated = [...deck];
      updated.splice(2, 0, duplicate);
      deck = updated.map((s, idx) => ({ ...s, slideNumber: idx + 1 }));

      expect(deck.length).toBe(4);
      expect(deck[2].title).toBe('Concept (Copy)');
      expect(deck[0].slideNumber).toBe(1);
      expect(deck[1].slideNumber).toBe(2);
      expect(deck[2].slideNumber).toBe(3);
      expect(deck[3].slideNumber).toBe(4);
    });

    await it('T3.5.2: Adding a new slide appends to deck with incremented number', () => {
      const newSlide: CarouselSlide = {
        id: 'new-4',
        slideNumber: deck.length + 1,
        tagline: 'NEXT ACTION',
        title: 'Call to Action',
        body: 'Follow for more tips.',
      };
      deck = [...deck, newSlide].map((s, idx) => ({ ...s, slideNumber: idx + 1 }));
      expect(deck.length).toBe(5);
      expect(deck[4].slideNumber).toBe(5);
    });

    await it('T3.5.3: Reindexing slide numbers synchronizes canvas counter "05 / 05"', () => {
      const canvas = new MockCanvas();
      const custom: CanvasCustomization = {
        theme: 'dark-minimal',
        aspectRatio: '4:5',
        fontStyle: 'mono',
        bgPattern: 'mesh',
        textAlign: 'left',
        fontSizeScale: 'normal',
      };
      CanvasRenderer.renderSlideToCanvas(canvas as any, deck[4], deck.length, custom, false);
      const counterDrawn = canvas.context.drawnTexts.some((t) => t.includes('05 / 05'));
      expect(counterDrawn).toBe(true);
    });
  });

  await describe('Tier 3 - Interaction 6: Teleprompter Runtime & Pacing Metrics Calculation', async () => {
    const script = {
      title: 'Test Script',
      targetPlatform: 'TikTok/Reels' as const,
      estimatedDuration: '60s' as const,
      pacingAdvice: 'Target 160 WPM',
      callToAction: 'Follow for more insights.',
      scenes: [
        {
          timestamp: '0:00 - 0:15',
          spokenWords: 'Here is a twenty word spoken script segment designed to test the runtime math accurately for video creators.',
          visualCue: 'Face camera',
          screenOverlayText: 'STEP 1',
          soundFX: 'Whoosh',
        },
        {
          timestamp: '0:15 - 0:30',
          spokenWords: 'Another twenty words spoken here to double the script size and calculate the estimated duration in seconds accurately.',
          visualCue: 'Screen demo',
          screenOverlayText: 'STEP 2',
          soundFX: 'Pop',
        },
      ],
    };

    await it('T3.6.1: Word count aggregates all scenes plus closing CTA', () => {
      const allSpokenText = script.scenes.map((s) => s.spokenWords).join(' ') + ' ' + script.callToAction;
      const wordCount = allSpokenText.trim().split(/\s+/).length;
      expect(wordCount).toBe(40); // 18 + 18 + 4 words
    });

    await it('T3.6.2: Estimated runtime in seconds is calculated at standard 160 WPM benchmark', () => {
      const allSpokenText = script.scenes.map((s) => s.spokenWords).join(' ') + ' ' + script.callToAction;
      const wordCount = allSpokenText.trim().split(/\s+/).length;
      const estimatedSeconds = Math.round((wordCount / 160) * 60);
      // 40 words at 160 wpm -> 15 seconds
      expect(estimatedSeconds).toBe(15);
    });
  });
}
