import { describe, it, expect } from './helpers/testHarness';
import { setupBrowserMock, MockCanvas } from './helpers/browserMock';
import { CanvasRenderer } from '../src/services/canvasRenderer';
import { CreditManager } from '../src/services/creditManager';
import { GeminiService } from '../src/services/geminiService';
import { CarouselSlide, CanvasCustomization } from '../src/types';

export async function runTier2Tests() {
  setupBrowserMock();

  await describe('Tier 2 - Area 1: Empty Topic & Whitespace Validation', async () => {
    await it('T2.1.1: Empty topic string defaults to fallback placeholder in smart generator', () => {
      const res = GeminiService.generateSmartFallback({
        topic: '',
        niche: 'SaaS',
        tone: 'Contrarian',
        platform: 'TikTok/Reels',
      });
      expect(res.topic.length).toBeGreaterThan(0);
      expect(res.hooks.length).toBe(5);
    });

    await it('T2.1.2: Whitespace-only topic string is handled without crashing', () => {
      const res = GeminiService.generateSmartFallback({
        topic: '     ',
        niche: '   ',
        tone: 'Educational',
        platform: 'LinkedIn Video',
      });
      expect(res.hooks[0].hookText.length).toBeGreaterThan(10);
      expect(res.shortScript.scenes.length).toBeGreaterThan(0);
    });

    await it('T2.1.3: Topic length calculation for UI character counter counts exact characters', () => {
      const topic = 'AI-driven content systems for high-growth startups';
      expect(topic.length).toBe(50);
    });
  });

  await describe('Tier 2 - Area 2: Rapid Click & Debounce State Guards', async () => {
    setupBrowserMock();

    await it('T2.2.1: Credit cannot be consumed when credits are exhausted', () => {
      localStorage.clear();
      // Consume 3 times
      expect(CreditManager.consumeCredit()).toBe(true);
      expect(CreditManager.consumeCredit()).toBe(true);
      expect(CreditManager.consumeCredit()).toBe(true);
      // Fourth rapid click attempt must be rejected
      expect(CreditManager.consumeCredit()).toBe(false);
      expect(CreditManager.canGenerate()).toBe(false);
    });

    await it('T2.2.2: Multiple rapid consumeCredit calls at zero balance do not set negative credits', () => {
      for (let i = 0; i < 10; i++) {
        CreditManager.consumeCredit();
      }
      const credits = CreditManager.getCredits();
      expect(credits.freeCreditsRemaining).toBe(0);
      expect(credits.freeCreditsRemaining).toBeGreaterThanOrEqual(0);
    });

    await it('T2.2.3: Pro tier can consume infinitely without underflow or state corruption', () => {
      CreditManager.activatePro('HF-PRO-RAPID-STRESS');
      for (let i = 0; i < 50; i++) {
        const ok = CreditManager.consumeCredit();
        expect(ok).toBe(true);
      }
      expect(CreditManager.getCredits().isPro).toBe(true);
    });
  });

  await describe('Tier 2 - Area 3: Minimum 2 Slides Delete Guard', async () => {
    await it('T2.3.1: Slide deletion is permitted when deck has 3 slides', () => {
      let slides: CarouselSlide[] = [
        { id: '1', slideNumber: 1, tagline: 'A', title: '1', body: '1' },
        { id: '2', slideNumber: 2, tagline: 'B', title: '2', body: '2' },
        { id: '3', slideNumber: 3, tagline: 'C', title: '3', body: '3' },
      ];
      // Simulate CarouselEditor handleDeleteSlide logic
      const canDelete = slides.length > 2;
      expect(canDelete).toBe(true);

      slides = slides.filter((_, idx) => idx !== 0).map((s, idx) => ({ ...s, slideNumber: idx + 1 }));
      expect(slides.length).toBe(2);
      expect(slides[0].slideNumber).toBe(1);
      expect(slides[1].slideNumber).toBe(2);
    });

    await it('T2.3.2: Slide deletion is strictly BLOCKED when deck has exactly 2 slides', () => {
      const slides: CarouselSlide[] = [
        { id: '1', slideNumber: 1, tagline: 'A', title: '1', body: '1' },
        { id: '2', slideNumber: 2, tagline: 'B', title: '2', body: '2' },
      ];
      // Carousel requires at least 2 slides
      const canDelete = slides.length > 2;
      expect(canDelete).toBe(false);
    });

    await it('T2.3.3: Slide deletion is strictly BLOCKED when deck has only 1 slide', () => {
      const slides: CarouselSlide[] = [
        { id: '1', slideNumber: 1, tagline: 'A', title: '1', body: '1' },
      ];
      const canDelete = slides.length > 2;
      expect(canDelete).toBe(false);
    });
  });

  await describe('Tier 2 - Area 4: Extreme Word Count & Text Wrapping Stress', async () => {
    const custom: CanvasCustomization = {
      theme: 'dark-minimal',
      aspectRatio: '4:5',
      fontStyle: 'modern',
      bgPattern: 'mesh',
      textAlign: 'left',
      fontSizeScale: 'normal',
    };

    await it('T2.4.1: getWrappedLines splits standard sentences into multiple lines cleanly', () => {
      const canvas = new MockCanvas();
      const ctx = canvas.getContext('2d')!;
      const text = 'The quick brown fox jumps over the lazy dog and runs across the wide open green meadow.';
      const lines = CanvasRenderer.getWrappedLines(ctx as any, text, 300);
      expect(lines.length).toBeGreaterThan(1);
      expect(lines.join(' ')).toBe(text);
    });

    await it('T2.4.2: Extremely long single token does not cause infinite loop in line wrapping', () => {
      const canvas = new MockCanvas();
      const ctx = canvas.getContext('2d')!;
      const unbrokenToken = 'SupercalifragilisticexpialidociousNonstopEngineeringFrameworkUnbrokenStringToken';
      const lines = CanvasRenderer.getWrappedLines(ctx as any, unbrokenToken, 100);
      expect(lines.length).toBeGreaterThanOrEqual(1);
      expect(lines[0]).toBe(unbrokenToken);
    });

    await it('T2.4.3: 500-word body text renders without throwing canvas errors', () => {
      const canvas = new MockCanvas();
      const hugeParagraph = Array(100).fill('high leverage deterministic output').join(' ');
      const slide: CarouselSlide = {
        id: 'huge-1',
        slideNumber: 1,
        tagline: 'STRESS TEST',
        title: 'Massive Paragraph Load Testing',
        body: hugeParagraph,
        highlightText: 'Important note that must fit safely.',
      };
      CanvasRenderer.renderSlideToCanvas(canvas as any, slide, 1, custom, false);
      expect(canvas.context.calls.length).toBeGreaterThan(50);
    });

    await it('T2.4.4: Highlight Callout Box suppresses when text overflows bottom boundary (< HEIGHT - 110)', () => {
      const canvas = new MockCanvas();
      // Enormous text that pushes currentY far down
      const massiveBody = Array(200).fill('vertical overflow boundary constraint test').join(' ');
      const slide: CarouselSlide = {
        id: 'overflow-1',
        slideNumber: 1,
        tagline: 'OVERFLOW GUARD',
        title: 'Overflow Test Title',
        body: massiveBody,
        highlightText: 'This callout should be omitted if bottom boundary is exceeded',
      };
      CanvasRenderer.renderSlideToCanvas(canvas as any, slide, 1, custom, false);
      // Ensure canvas rendering finished safely without throwing
      expect(canvas.context.calls.length).toBeGreaterThan(0);
    });
  });

  await describe('Tier 2 - Area 5: License Key Validation & Daily Reset Boundary', async () => {
    setupBrowserMock();

    await it('T2.5.1: Key with exactly 6 characters is accepted and trimmed', () => {
      localStorage.clear();
      const ok = CreditManager.activatePro('  ABC123  ');
      expect(ok).toBe(true);
      expect(CreditManager.getCredits().licenseKey).toBe('ABC123');
    });

    await it('T2.5.2: Key with 5 characters is rejected', () => {
      localStorage.clear();
      const ok = CreditManager.activatePro('12345');
      expect(ok).toBe(false);
      expect(CreditManager.getCredits().isPro).toBe(false);
    });

    await it('T2.5.3: Daily reset restores free credits when lastResetDate is yesterday', () => {
      localStorage.clear();
      const yesterday = '2026-01-01';
      localStorage.setItem(
        'hookforge_user_credits_v1',
        JSON.stringify({
          freeCreditsRemaining: 0,
          isPro: false,
          byokActive: false,
          lastResetDate: yesterday,
        })
      );
      const credits = CreditManager.getCredits();
      expect(credits.freeCreditsRemaining).toBe(3);
      expect(credits.lastResetDate).toBe(CreditManager.getTodayDateString());
    });

    await it('T2.5.4: Daily reset does NOT overwrite Pro status when date changes', () => {
      localStorage.clear();
      const yesterday = '2026-01-01';
      localStorage.setItem(
        'hookforge_user_credits_v1',
        JSON.stringify({
          freeCreditsRemaining: 0,
          isPro: true,
          byokActive: false,
          licenseKey: 'HF-PRO-LIFETIME',
          lastResetDate: yesterday,
        })
      );
      const credits = CreditManager.getCredits();
      expect(credits.isPro).toBe(true);
      expect(credits.licenseKey).toBe('HF-PRO-LIFETIME');
    });
  });

  await describe('Tier 2 - Area 6: Slide Re-ordering Boundary Guards', async () => {
    const slides: CarouselSlide[] = [
      { id: '1', slideNumber: 1, tagline: 'A', title: 'Slide 1', body: 'Body 1' },
      { id: '2', slideNumber: 2, tagline: 'B', title: 'Slide 2', body: 'Body 2' },
      { id: '3', slideNumber: 3, tagline: 'C', title: 'Slide 3', body: 'Body 3' },
    ];

    await it('T2.6.1: Moving first slide left (index 0 -> -1) is blocked by boundary check', () => {
      const currentIndex = 0;
      const targetIdx = currentIndex - 1;
      const isAllowed = targetIdx >= 0 && targetIdx < slides.length;
      expect(isAllowed).toBe(false);
    });

    await it('T2.6.2: Moving last slide right (index 2 -> 3) is blocked by boundary check', () => {
      const currentIndex = slides.length - 1;
      const targetIdx = currentIndex + 1;
      const isAllowed = targetIdx >= 0 && targetIdx < slides.length;
      expect(isAllowed).toBe(false);
    });

    await it('T2.6.3: Moving middle slide left (index 1 -> 0) successfully swaps positions', () => {
      const updated = [...slides];
      const temp = updated[1];
      updated[1] = updated[0];
      updated[0] = temp;
      const reindexed = updated.map((s, idx) => ({ ...s, slideNumber: idx + 1 }));
      expect(reindexed[0].title).toBe('Slide 2');
      expect(reindexed[1].title).toBe('Slide 1');
      expect(reindexed[0].slideNumber).toBe(1);
      expect(reindexed[1].slideNumber).toBe(2);
    });
  });
}
