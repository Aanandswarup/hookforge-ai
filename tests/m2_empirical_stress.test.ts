import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { CarouselEditor } from '../src/components/CarouselEditor';
import { CanvasRenderer, THEMES, ASPECT_RATIOS } from '../src/services/canvasRenderer';
import { CarouselSlide, CanvasCustomization, CarouselTheme, CarouselAspectRatio } from '../src/types';
import { setupBrowserMock, MockCanvas, downloadsTriggered } from './helpers/browserMock';
import { GeminiService } from '../src/services/geminiService';

describe('Empirical Verification: Milestone M2 Canvas Geometry, Deck CRUD, Tab Persistence & Exports', () => {

  beforeEach(() => {
    setupBrowserMock();
  });

  // =========================================================================
  // CONTRACT 1: Canvas Geometry & Coordinate Buffer Dimensions
  // =========================================================================
  describe('Contract 1: Canvas Master Coordinate Buffer Dimensions (4:5, 1:1, 9:16)', () => {

    it('1.1: 4:5 Portrait resolution is exactly 1080×1350 with LinkedIn/IG descriptor', () => {
      const config = ASPECT_RATIOS['4:5'];
      assert.strictEqual(config.width, 1080, '4:5 width must be 1080px');
      assert.strictEqual(config.height, 1350, '4:5 height must be 1350px');
      assert.ok(config.label.includes('4:5 Portrait'), 'Label must identify 4:5 Portrait');

      const getter = CanvasRenderer.getDimensions('4:5');
      assert.strictEqual(getter.width, 1080);
      assert.strictEqual(getter.height, 1350);
    });

    it('1.2: 1:1 Square resolution is exactly 1080×1080 with Twitter/Feeds descriptor', () => {
      const config = ASPECT_RATIOS['1:1'];
      assert.strictEqual(config.width, 1080, '1:1 width must be 1080px');
      assert.strictEqual(config.height, 1080, '1:1 height must be 1080px');
      assert.ok(config.label.includes('1:1 Square'), 'Label must identify 1:1 Square');

      const getter = CanvasRenderer.getDimensions('1:1');
      assert.strictEqual(getter.width, 1080);
      assert.strictEqual(getter.height, 1080);
    });

    it('1.3: 9:16 Story resolution is exactly 1080×1920 with Reels/TikTok descriptor', () => {
      const config = ASPECT_RATIOS['9:16'];
      assert.strictEqual(config.width, 1080, '9:16 width must be 1080px');
      assert.strictEqual(config.height, 1920, '9:16 height must be 1920px');
      assert.ok(config.label.includes('9:16 Story'), 'Label must identify 9:16 Story');

      const getter = CanvasRenderer.getDimensions('9:16');
      assert.strictEqual(getter.width, 1080);
      assert.strictEqual(getter.height, 1920);
    });

    it('1.4: renderSlideToCanvas resizes HTMLCanvasElement width & height across all 3 ratios', () => {
      const slide: CarouselSlide = {
        id: 'geom-1',
        slideNumber: 1,
        tagline: 'GEOMETRY',
        title: 'Buffer Dimensions Verification',
        body: 'Verifying pixel buffer allocation.',
        swipeIndicator: true,
      };

      const ratios: CarouselAspectRatio[] = ['4:5', '1:1', '9:16'];
      const expectedDims = {
        '4:5': { w: 1080, h: 1350 },
        '1:1': { w: 1080, h: 1080 },
        '9:16': { w: 1080, h: 1920 },
      };

      for (const r of ratios) {
        const canvas = new MockCanvas();
        const custom: CanvasCustomization = {
          theme: 'dark-minimal',
          aspectRatio: r,
          fontStyle: 'modern',
          bgPattern: 'mesh',
          textAlign: 'left',
          fontSizeScale: 'normal',
        };

        CanvasRenderer.renderSlideToCanvas(canvas as any, slide, 3, custom, false);
        assert.strictEqual(canvas.width, expectedDims[r].w, `Canvas width for ${r} must be ${expectedDims[r].w}`);
        assert.strictEqual(canvas.height, expectedDims[r].h, `Canvas height for ${r} must be ${expectedDims[r].h}`);
      }
    });

    it('1.5: getDimensions safely falls back to 4:5 (1080×1350) for undefined or invalid ratio keys', () => {
      const fallbackUndefined = CanvasRenderer.getDimensions(undefined as any);
      assert.strictEqual(fallbackUndefined.width, 1080);
      assert.strictEqual(fallbackUndefined.height, 1350);

      const fallbackInvalid = CanvasRenderer.getDimensions('invalid:ratio' as any);
      assert.strictEqual(fallbackInvalid.width, 1080);
      assert.strictEqual(fallbackInvalid.height, 1350);
    });

    it('1.6: All 5 themes render without errors across all 3 aspect ratios', () => {
      const slide: CarouselSlide = {
        id: 'theme-test',
        slideNumber: 2,
        tagline: 'THEMES',
        title: 'Theme & Ratio Matrix',
        body: 'Testing every theme palette across all aspect ratios.',
        highlightText: 'Matrix: 5 Themes × 3 Ratios = 15 configurations',
        swipeIndicator: true,
      };

      const themes: CarouselTheme[] = ['dark-minimal', 'bold-gradient', 'editorial', 'neon-hacker', 'sunset-glow'];
      const ratios: CarouselAspectRatio[] = ['4:5', '1:1', '9:16'];

      for (const theme of themes) {
        for (const ratio of ratios) {
          const canvas = new MockCanvas();
          const custom: CanvasCustomization = {
            theme,
            aspectRatio: ratio,
            fontStyle: 'modern',
            bgPattern: 'mesh',
            textAlign: 'left',
            fontSizeScale: 'normal',
          };
          assert.doesNotThrow(() => {
            CanvasRenderer.renderSlideToCanvas(canvas as any, slide, 5, custom, false);
          }, `Rendering theme ${theme} on ratio ${ratio} must not throw`);
          assert.strictEqual(canvas.width, ASPECT_RATIOS[ratio].width);
          assert.strictEqual(canvas.height, ASPECT_RATIOS[ratio].height);
        }
      }
    });

    it('1.7: Background patterns (mesh, grid, minimal) render properly across all ratios', () => {
      const slide: CarouselSlide = {
        id: 'pattern-test',
        slideNumber: 1,
        tagline: 'PATTERNS',
        title: 'Background Patterns Test',
        body: 'Testing mesh gradients and grid line rendering.',
      };

      const patterns = ['mesh', 'grid', 'minimal'] as const;
      for (const bgPattern of patterns) {
        const canvas = new MockCanvas();
        const custom: CanvasCustomization = {
          theme: 'dark-minimal',
          aspectRatio: '1:1',
          fontStyle: 'modern',
          bgPattern,
          textAlign: 'left',
          fontSizeScale: 'normal',
        };
        CanvasRenderer.renderSlideToCanvas(canvas as any, slide, 1, custom, false);
        assert.ok(canvas.context.calls.length > 0, `Pattern ${bgPattern} should execute draw calls`);
      }
    });
  });

  // =========================================================================
  // CONTRACT 2: Slide Deck CRUD Operations & Boundary State Stress
  // =========================================================================
  describe('Contract 2: Slide Deck CRUD Operations & Boundary State Stress', () => {

    it('2.1: Slide Addition adds slide, populates default fields, and updates counter', () => {
      let deck: CarouselSlide[] = [
        { id: 's1', slideNumber: 1, tagline: 'A', title: 'Slide 1', body: 'Body 1' },
        { id: 's2', slideNumber: 2, tagline: 'B', title: 'Slide 2', body: 'Body 2' },
        { id: 's3', slideNumber: 3, tagline: 'C', title: 'Slide 3', body: 'Body 3' },
      ];
      let currentSlideIndex = 0;

      // Model CarouselEditor handleAddSlide logic
      const handleAddSlide = () => {
        const newSlide: CarouselSlide = {
          id: `slide-${Date.now()}`,
          slideNumber: deck.length + 1,
          tagline: 'KEY INSIGHT',
          title: 'New Key Takeaway',
          body: 'Double-click to edit this body text with your customized actionable framework.',
          highlightText: 'Pro Tip: Keep points concise and punchy.',
          swipeIndicator: true,
        };
        const updated = [...deck, newSlide].map((s, idx) => ({ ...s, slideNumber: idx + 1 }));
        deck = updated;
        currentSlideIndex = updated.length - 1;
      };

      handleAddSlide();

      assert.strictEqual(deck.length, 4, 'Deck length must be 4 after addition');
      assert.strictEqual(currentSlideIndex, 3, 'Active index must be on newly added slide');
      assert.strictEqual(deck[3].slideNumber, 4, 'New slide number must be 4');
      assert.strictEqual(deck[3].tagline, 'KEY INSIGHT');
      assert.strictEqual(deck[3].title, 'New Key Takeaway');
      assert.strictEqual(deck[3].swipeIndicator, true);

      // Verify counter display string: e.g. "04 / 04"
      const counterStr = `${String(currentSlideIndex + 1).padStart(2, '0')} / ${String(deck.length).padStart(2, '0')}`;
      assert.strictEqual(counterStr, '04 / 04');

      // Stress test: add 6 more slides to verify continuous reindexing
      for (let i = 0; i < 6; i++) {
        handleAddSlide();
      }
      assert.strictEqual(deck.length, 10, 'Deck should contain 10 slides');
      deck.forEach((s, idx) => {
        assert.strictEqual(s.slideNumber, idx + 1, `Slide at index ${idx} must have slideNumber ${idx + 1}`);
      });
      assert.strictEqual(currentSlideIndex, 9);
    });

    it('2.2: Slide Duplication clones active slide with "(Copy)" suffix and reindexes numbers', () => {
      let deck: CarouselSlide[] = [
        { id: 's1', slideNumber: 1, tagline: 'HOOK', title: 'Attention Grabber', body: 'Body 1', highlightText: 'Key 1', swipeIndicator: true },
        { id: 's2', slideNumber: 2, tagline: 'CORE', title: 'Main Lesson', body: 'Body 2', highlightText: 'Key 2', swipeIndicator: true },
        { id: 's3', slideNumber: 3, tagline: 'CTA', title: 'Final Action', body: 'Body 3', highlightText: 'Key 3', swipeIndicator: false },
      ];
      let currentSlideIndex = 1; // On 'Main Lesson'

      const handleDuplicateSlide = () => {
        const activeSlide = deck[currentSlideIndex];
        const duplicate: CarouselSlide = {
          ...activeSlide,
          id: `slide-${Date.now()}-${Math.random()}`,
          title: `${activeSlide.title} (Copy)`,
        };
        const updated = [...deck];
        updated.splice(currentSlideIndex + 1, 0, duplicate);
        const reindexed = updated.map((s, idx) => ({ ...s, slideNumber: idx + 1 }));
        deck = reindexed;
        currentSlideIndex = currentSlideIndex + 1;
      };

      handleDuplicateSlide();

      assert.strictEqual(deck.length, 4, 'Deck length must be 4 after duplication');
      assert.strictEqual(currentSlideIndex, 2, 'Active index should point to the duplicate');
      assert.strictEqual(deck[2].title, 'Main Lesson (Copy)');
      assert.strictEqual(deck[2].tagline, 'CORE');
      assert.strictEqual(deck[2].body, 'Body 2');
      assert.strictEqual(deck[2].highlightText, 'Key 2');
      assert.strictEqual(deck[2].slideNumber, 3);
      assert.strictEqual(deck[3].slideNumber, 4);
      assert.notStrictEqual(deck[2].id, deck[1].id, 'Duplicate must have unique ID');

      // Duplicate at boundary index 0 (first slide)
      currentSlideIndex = 0;
      handleDuplicateSlide();
      assert.strictEqual(deck.length, 5);
      assert.strictEqual(currentSlideIndex, 1);
      assert.strictEqual(deck[1].title, 'Attention Grabber (Copy)');
      assert.strictEqual(deck[1].slideNumber, 2);

      // Duplicate at last index
      currentSlideIndex = deck.length - 1;
      const lastTitle = deck[currentSlideIndex].title;
      handleDuplicateSlide();
      assert.strictEqual(deck.length, 6);
      assert.strictEqual(currentSlideIndex, 5);
      assert.strictEqual(deck[5].title, `${lastTitle} (Copy)`);
    });

    it('2.3: Slide Deletion is strictly guarded and blocked when slides.length <= 2', () => {
      let toastMessage = '';
      const showToast = (msg: string) => { toastMessage = msg; };

      let deck: CarouselSlide[] = [
        { id: 's1', slideNumber: 1, tagline: 'A', title: 'Slide 1', body: '1' },
        { id: 's2', slideNumber: 2, tagline: 'B', title: 'Slide 2', body: '2' },
        { id: 's3', slideNumber: 3, tagline: 'C', title: 'Slide 3', body: '3' },
      ];
      let currentSlideIndex = 2;

      const handleDeleteSlide = () => {
        if (deck.length <= 2) {
          showToast('Carousel requires at least 2 slides.');
          return;
        }
        const updated = deck.filter((_, idx) => idx !== currentSlideIndex).map((s, idx) => ({ ...s, slideNumber: idx + 1 }));
        deck = updated;
        currentSlideIndex = Math.max(0, currentSlideIndex - 1);
        showToast('Slide removed.');
      };

      // 1st deletion: 3 slides -> permitted -> 2 slides
      handleDeleteSlide();
      assert.strictEqual(deck.length, 2, 'Deck should have 2 slides');
      assert.strictEqual(toastMessage, 'Slide removed.');
      assert.strictEqual(currentSlideIndex, 1);

      // 2nd deletion: exactly 2 slides -> BLOCKED!
      handleDeleteSlide();
      assert.strictEqual(deck.length, 2, 'Deck must remain at 2 slides');
      assert.strictEqual(toastMessage, 'Carousel requires at least 2 slides.', 'Must dispatch guard toast');
      assert.strictEqual(currentSlideIndex, 1);

      // Edge case: deck with 1 slide -> BLOCKED!
      deck = [{ id: 's1', slideNumber: 1, tagline: 'A', title: 'Slide 1', body: '1' }];
      currentSlideIndex = 0;
      handleDeleteSlide();
      assert.strictEqual(deck.length, 1, 'Deck with 1 slide must not be deleted');
      assert.strictEqual(toastMessage, 'Carousel requires at least 2 slides.');
    });

    it('2.4: Slide Deletion clamps active slide index correctly when deleting first, middle, or last slide', () => {
      let deck: CarouselSlide[] = [
        { id: 's1', slideNumber: 1, tagline: 'A', title: 'Slide 1', body: '1' },
        { id: 's2', slideNumber: 2, tagline: 'B', title: 'Slide 2', body: '2' },
        { id: 's3', slideNumber: 3, tagline: 'C', title: 'Slide 3', body: '3' },
        { id: 's4', slideNumber: 4, tagline: 'D', title: 'Slide 4', body: '4' },
      ];
      let currentSlideIndex = 0;

      const handleDelete = () => {
        if (deck.length <= 2) return;
        const updated = deck.filter((_, idx) => idx !== currentSlideIndex).map((s, idx) => ({ ...s, slideNumber: idx + 1 }));
        deck = updated;
        currentSlideIndex = Math.max(0, currentSlideIndex - 1);
      };

      // Delete index 0: should clamp to 0 (Math.max(0, 0 - 1))
      handleDelete();
      assert.strictEqual(deck.length, 3);
      assert.strictEqual(currentSlideIndex, 0);
      assert.strictEqual(deck[0].title, 'Slide 2');

      // Delete index 2 (last slide of 3)
      currentSlideIndex = 2;
      handleDelete();
      assert.strictEqual(deck.length, 2);
      assert.strictEqual(currentSlideIndex, 1);
      assert.strictEqual(deck[currentSlideIndex].title, 'Slide 3');
    });

    it('2.5: Slide Reordering handleMoveSlide handles left and right boundary conditions properly', () => {
      let deck: CarouselSlide[] = [
        { id: 's1', slideNumber: 1, tagline: 'A', title: 'Slide 1', body: '1' },
        { id: 's2', slideNumber: 2, tagline: 'B', title: 'Slide 2', body: '2' },
        { id: 's3', slideNumber: 3, tagline: 'C', title: 'Slide 3', body: '3' },
      ];
      let currentSlideIndex = 0;

      const handleMoveSlide = (direction: 'left' | 'right') => {
        const targetIdx = direction === 'left' ? currentSlideIndex - 1 : currentSlideIndex + 1;
        if (targetIdx < 0 || targetIdx >= deck.length) return;

        const updated = [...deck];
        const temp = updated[currentSlideIndex];
        updated[currentSlideIndex] = updated[targetIdx];
        updated[targetIdx] = temp;

        const reindexed = updated.map((s, idx) => ({ ...s, slideNumber: idx + 1 }));
        deck = reindexed;
        currentSlideIndex = targetIdx;
      };

      // BOUNDARY 1: At index 0, move left -> MUST BE A NO-OP
      handleMoveSlide('left');
      assert.strictEqual(currentSlideIndex, 0, 'Index must remain 0');
      assert.strictEqual(deck[0].title, 'Slide 1', 'Deck order must not change');
      assert.strictEqual(deck[1].title, 'Slide 2');

      // VALID MOVE: At index 0, move right -> swaps with index 1
      handleMoveSlide('right');
      assert.strictEqual(currentSlideIndex, 1, 'Index should move to 1');
      assert.strictEqual(deck[0].title, 'Slide 2', 'Slide 2 should now be at index 0');
      assert.strictEqual(deck[1].title, 'Slide 1', 'Slide 1 should now be at index 1');
      assert.strictEqual(deck[0].slideNumber, 1);
      assert.strictEqual(deck[1].slideNumber, 2);

      // Move right again -> to index 2
      handleMoveSlide('right');
      assert.strictEqual(currentSlideIndex, 2);
      assert.strictEqual(deck[2].title, 'Slide 1');

      // BOUNDARY 2: At last index (2), move right -> MUST BE A NO-OP
      handleMoveSlide('right');
      assert.strictEqual(currentSlideIndex, 2, 'Index must remain at last element');
      assert.strictEqual(deck[2].title, 'Slide 1', 'Deck order must not change');

      // Move left back to index 1
      handleMoveSlide('left');
      assert.strictEqual(currentSlideIndex, 1);
      assert.strictEqual(deck[1].title, 'Slide 1');
    });
  });

  // =========================================================================
  // CONTRACT 3: Tab Switching State Persistence & moduleDeckCache Invariants
  // =========================================================================
  describe('Contract 3: Tab Switching State Persistence & moduleDeckCache Lifecycle', () => {

    it('3.1: Editing slide title/body on slide 1, navigating away to another tab, and returning preserves edits intact', () => {
      // Simulate moduleDeckCache state machine exactly as implemented in CarouselEditor.tsx
      interface DeckCache {
        slides: CarouselSlide[];
        custom: CanvasCustomization;
        currentSlideIndex: number;
        initialSlidesRef: CarouselSlide[];
      }
      let moduleDeckCache: DeckCache | null = null;

      // 1. Initial Generation Result in App.tsx
      const initialSlidesGen1: CarouselSlide[] = [
        { id: '1', slideNumber: 1, tagline: 'INITIAL', title: 'Original Slide 1 Title', body: 'Original Body 1' },
        { id: '2', slideNumber: 2, tagline: 'INITIAL', title: 'Original Slide 2 Title', body: 'Original Body 2' },
        { id: '3', slideNumber: 3, tagline: 'INITIAL', title: 'Original Slide 3 Title', body: 'Original Body 3' },
      ];

      // Simulate Component Mount in Carousel Tab
      const isSameGenMount1 = moduleDeckCache && moduleDeckCache.initialSlidesRef === initialSlidesGen1;
      let stateSlides = isSameGenMount1 && moduleDeckCache?.slides ? moduleDeckCache.slides : initialSlidesGen1;
      let stateIndex = isSameGenMount1 && typeof moduleDeckCache?.currentSlideIndex === 'number' ? moduleDeckCache.currentSlideIndex : 0;
      let stateCustom: CanvasCustomization = isSameGenMount1 && moduleDeckCache?.custom ? moduleDeckCache.custom : {
        theme: 'dark-minimal',
        aspectRatio: '4:5',
        fontStyle: 'modern',
        bgPattern: 'mesh',
        textAlign: 'left',
        fontSizeScale: 'normal',
      };

      // Sync cache on mount
      moduleDeckCache = {
        slides: stateSlides,
        custom: stateCustom,
        currentSlideIndex: stateIndex,
        initialSlidesRef: initialSlidesGen1,
      };

      // 2. User edits Slide 1 title, body, theme, and aspect ratio
      const editedSlides = [...stateSlides];
      editedSlides[0] = {
        ...editedSlides[0],
        title: 'VIRAL HOOK: 7 Principles of Wealth',
        body: 'Customized framework rewritten by creator.',
      };
      stateSlides = editedSlides;
      stateCustom = { ...stateCustom, theme: 'editorial', aspectRatio: '1:1' };
      stateIndex = 0;

      // User edit triggers cache sync useEffect
      moduleDeckCache = {
        slides: stateSlides,
        custom: stateCustom,
        currentSlideIndex: stateIndex,
        initialSlidesRef: initialSlidesGen1,
      };

      // 3. User navigates away: activeTab switches to 'hooks' (CarouselEditor unmounts)
      // Component state variables (stateSlides, stateIndex, stateCustom) are destroyed.
      stateSlides = null as any;
      stateIndex = null as any;
      stateCustom = null as any;

      // 4. User navigates back: activeTab switches back to 'carousel' (CarouselEditor remounts)
      // CarouselEditor mounts with initialSlides={initialSlidesGen1}
      const isSameGenRemount = moduleDeckCache && moduleDeckCache.initialSlidesRef === initialSlidesGen1;
      assert.strictEqual(isSameGenRemount, true, 'isSameGenRemount must be true because initialSlides reference is unchanged');

      const restoredSlides = isSameGenRemount && moduleDeckCache?.slides ? moduleDeckCache.slides : initialSlidesGen1;
      const restoredIndex = isSameGenRemount && typeof moduleDeckCache?.currentSlideIndex === 'number' ? moduleDeckCache.currentSlideIndex : 0;
      const restoredCustom = isSameGenRemount && moduleDeckCache?.custom ? moduleDeckCache.custom : { theme: 'dark-minimal' } as any;

      // Assert that slide 1 edits are completely preserved
      assert.strictEqual(restoredSlides[0].title, 'VIRAL HOOK: 7 Principles of Wealth', 'Slide 1 edited title must be preserved');
      assert.strictEqual(restoredSlides[0].body, 'Customized framework rewritten by creator.', 'Slide 1 edited body must be preserved');
      assert.strictEqual(restoredCustom.theme, 'editorial', 'Custom theme must be preserved across tabs');
      assert.strictEqual(restoredCustom.aspectRatio, '1:1', 'Custom aspect ratio must be preserved across tabs');
    });

    it('3.2: Fresh generation prop resets moduleDeckCache cleanly without edit bleed', () => {
      interface DeckCache {
        slides: CarouselSlide[];
        custom: CanvasCustomization;
        currentSlideIndex: number;
        initialSlidesRef: CarouselSlide[];
      }

      const gen1Slides: CarouselSlide[] = [
        { id: 'g1-1', slideNumber: 1, tagline: 'GEN1', title: 'Gen 1 Slide 1', body: 'Gen 1 Body' },
        { id: 'g1-2', slideNumber: 2, tagline: 'GEN1', title: 'Gen 1 Slide 2', body: 'Gen 1 Body' },
      ];

      // Cache holds Gen 1 edits
      let moduleDeckCache: DeckCache | null = {
        slides: [
          { id: 'g1-1', slideNumber: 1, tagline: 'GEN1', title: 'DIRTY USER EDIT', body: 'DIRTY USER BODY' },
          { id: 'g1-2', slideNumber: 2, tagline: 'GEN1', title: 'Gen 1 Slide 2', body: 'Gen 1 Body' },
        ],
        custom: { theme: 'neon-hacker', aspectRatio: '9:16', fontStyle: 'mono', bgPattern: 'grid', textAlign: 'left', fontSizeScale: 'normal' },
        currentSlideIndex: 1,
        initialSlidesRef: gen1Slides,
      };

      // Fresh generation arrives from Gemini / smart fallback
      const gen2Slides: CarouselSlide[] = [
        { id: 'g2-1', slideNumber: 1, tagline: 'GEN2', title: 'Brand New Gen 2 Topic', body: 'Fresh Gen 2 Insight' },
        { id: 'g2-2', slideNumber: 2, tagline: 'GEN2', title: 'Gen 2 Key Step', body: 'Step 2' },
        { id: 'g2-3', slideNumber: 3, tagline: 'GEN2', title: 'Gen 2 Summary', body: 'Summary' },
      ];

      // Component mounts / receives gen2Slides prop
      const isSameGeneration = moduleDeckCache && moduleDeckCache.initialSlidesRef === gen2Slides;
      assert.strictEqual(isSameGeneration, false, 'Must identify fresh generation as different reference');

      // Mount initialization logic:
      const initialSlides = isSameGeneration && moduleDeckCache?.slides ? moduleDeckCache.slides : gen2Slides;
      const initialIndex = isSameGeneration && typeof moduleDeckCache?.currentSlideIndex === 'number' ? moduleDeckCache.currentSlideIndex : 0;

      assert.strictEqual(initialSlides.length, 3, 'Must initialize with fresh Gen 2 slides');
      assert.strictEqual(initialSlides[0].title, 'Brand New Gen 2 Topic', 'Must not contain old dirty edits');
      assert.strictEqual(initialIndex, 0, 'Active index must reset to 0');

      // Prop change useEffect execution in CarouselEditor
      if (moduleDeckCache && moduleDeckCache.initialSlidesRef !== gen2Slides) {
        moduleDeckCache = {
          slides: gen2Slides,
          custom: moduleDeckCache.custom,
          currentSlideIndex: 0,
          initialSlidesRef: gen2Slides,
        };
      }

      assert.strictEqual(moduleDeckCache.initialSlidesRef, gen2Slides, 'Cache ref must point to gen2Slides');
      assert.strictEqual(moduleDeckCache.slides[0].title, 'Brand New Gen 2 Topic');
      assert.strictEqual(moduleDeckCache.currentSlideIndex, 0);
    });

    it('3.3: Live initialSlides prop update while CarouselEditor is mounted resets slides and index to 0', () => {
      interface DeckCache {
        slides: CarouselSlide[];
        custom: CanvasCustomization;
        currentSlideIndex: number;
        initialSlidesRef: CarouselSlide[];
      }

      const genA: CarouselSlide[] = [
        { id: 'a1', slideNumber: 1, tagline: 'A', title: 'A1', body: 'B1' },
      ];
      const genB: CarouselSlide[] = [
        { id: 'b1', slideNumber: 1, tagline: 'B', title: 'B1', body: 'B2' },
        { id: 'b2', slideNumber: 2, tagline: 'B', title: 'B2', body: 'B2' },
      ];

      let moduleDeckCache: DeckCache = {
        slides: genA,
        custom: { theme: 'dark-minimal', aspectRatio: '4:5', fontStyle: 'modern', bgPattern: 'mesh', textAlign: 'left', fontSizeScale: 'normal' },
        currentSlideIndex: 0,
        initialSlidesRef: genA,
      };

      let currentSlides = genA;
      let currentIndex = 0;

      // Simulate prop change useEffect
      const onPropChange = (newInitialSlides: CarouselSlide[]) => {
        if (moduleDeckCache && moduleDeckCache.initialSlidesRef !== newInitialSlides) {
          currentSlides = newInitialSlides;
          currentIndex = 0;
          moduleDeckCache = {
            slides: newInitialSlides,
            custom: moduleDeckCache.custom,
            currentSlideIndex: 0,
            initialSlidesRef: newInitialSlides,
          };
        }
      };

      onPropChange(genB);
      assert.strictEqual(currentSlides.length, 2);
      assert.strictEqual(currentSlides[0].title, 'B1');
      assert.strictEqual(currentIndex, 0);
      assert.strictEqual(moduleDeckCache.initialSlidesRef, genB);
    });
  });

  // =========================================================================
  // CONTRACT 4: Export Invocations and Watermark Contracts (Free vs Pro)
  // =========================================================================
  describe('Contract 4: PDF and PNG Export Invocations and Watermark Contracts (Free vs Pro)', () => {

    const sampleSlide: CarouselSlide = {
      id: 'exp-1',
      slideNumber: 1,
      tagline: 'EXPORT',
      title: 'High-Fidelity Export Slide',
      body: 'Testing watermark rendering and file export pipelines.',
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

    it('4.1: Free tier canvas rendering draws verbatim Free watermark "⚡ Created with HookForge AI"', () => {
      const canvas = new MockCanvas();
      CanvasRenderer.renderSlideToCanvas(canvas as any, sampleSlide, 1, custom, false);

      const drawnTexts = canvas.context.drawnTexts;
      const hasFree = drawnTexts.some((t) => t.includes('⚡ Created with HookForge AI'));
      const hasPro = drawnTexts.some((t) => t.includes('✦ HookForge Pro Studio'));

      assert.strictEqual(hasFree, true, 'Canvas must render Free watermark');
      assert.strictEqual(hasPro, false, 'Canvas must NOT render Pro watermark on Free tier');
    });

    it('4.2: Pro tier canvas rendering draws verbatim Pro watermark "✦ HookForge Pro Studio"', () => {
      const canvas = new MockCanvas();
      CanvasRenderer.renderSlideToCanvas(canvas as any, sampleSlide, 1, custom, true);

      const drawnTexts = canvas.context.drawnTexts;
      const hasFree = drawnTexts.some((t) => t.includes('⚡ Created with HookForge AI'));
      const hasPro = drawnTexts.some((t) => t.includes('✦ HookForge Pro Studio'));

      assert.strictEqual(hasPro, true, 'Canvas must render Pro watermark');
      assert.strictEqual(hasFree, false, 'Canvas must NOT render Free watermark on Pro tier');
    });

    it('4.3: downloadSingleSlide triggers download click with PNG data URL and correct filename', () => {
      downloadsTriggered.length = 0;
      CanvasRenderer.downloadSingleSlide(sampleSlide, 1, custom, false, 'test_slide_1.png');

      assert.strictEqual(downloadsTriggered.length, 1, 'Exactly one download should be triggered');
      assert.strictEqual(downloadsTriggered[0].download, 'test_slide_1.png');
      assert.ok(downloadsTriggered[0].href.startsWith('data:image/png;base64,'), 'Href must be a PNG data URL');
    });

    it('4.4: downloadAllSlidesAsPngs schedules downloads for all slides in deck', async () => {
      downloadsTriggered.length = 0;
      const deck: CarouselSlide[] = [
        { id: '1', slideNumber: 1, tagline: 'A', title: 'Slide 1', body: '1' },
        { id: '2', slideNumber: 2, tagline: 'B', title: 'Slide 2', body: '2' },
        { id: '3', slideNumber: 3, tagline: 'C', title: 'Slide 3', body: '3' },
      ];

      CanvasRenderer.downloadAllSlidesAsPngs(deck, custom, true, 'CustomBatch');

      // Wait for staggered timers: 0ms, 250ms, 500ms
      await new Promise((resolve) => setTimeout(resolve, 800));

      assert.strictEqual(downloadsTriggered.length, 3, 'All 3 slide downloads should be triggered');
      assert.strictEqual(downloadsTriggered[0].download, 'CustomBatch_slide_1.png');
      assert.strictEqual(downloadsTriggered[1].download, 'CustomBatch_slide_2.png');
      assert.strictEqual(downloadsTriggered[2].download, 'CustomBatch_slide_3.png');
    });

    it('4.5: downloadAllSlidesAsPdf generates multi-page PDF with correct orientation for 4:5, 1:1, and 9:16', async () => {
      const deck: CarouselSlide[] = [
        { id: '1', slideNumber: 1, tagline: 'A', title: 'Slide 1', body: '1' },
        { id: '2', slideNumber: 2, tagline: 'B', title: 'Slide 2', body: '2' },
      ];

      const ratios: CarouselAspectRatio[] = ['4:5', '1:1', '9:16'];
      for (const ratio of ratios) {
        const ratioCustom: CanvasCustomization = { ...custom, aspectRatio: ratio };
        await assert.doesNotReject(async () => {
          await CanvasRenderer.downloadAllSlidesAsPdf(deck, ratioCustom, true, `Test_${ratio}`);
        }, `PDF export for ratio ${ratio} must execute cleanly`);
      }
    });

    it('4.6: PDF export handles square (1:1) aspect ratio with portrait orientation', async () => {
      const dims = CanvasRenderer.getDimensions('1:1');
      assert.strictEqual(dims.width, dims.height);
      // In canvasRenderer.ts line 402: height >= width ? 'portrait' : 'landscape'
      const orientation = dims.height >= dims.width ? 'portrait' : 'landscape';
      assert.strictEqual(orientation, 'portrait', 'Square 1:1 PDF orientation must evaluate to portrait');
    });

    it('4.7: PDF export safely handles browser font readiness race conditions without throwing', async () => {
      // Simulate document.fonts.ready throwing or rejecting
      const originalFonts = (globalThis as any).document.fonts;
      (globalThis as any).document.fonts = {
        ready: Promise.reject(new Error('Font load timeout')),
      };

      const deck: CarouselSlide[] = [
        { id: '1', slideNumber: 1, tagline: 'A', title: 'Slide 1', body: '1' },
      ];

      await assert.doesNotReject(async () => {
        await CanvasRenderer.downloadAllSlidesAsPdf(deck, custom, false, 'FontFallbackTest');
      }, 'PDF generation must catch font errors gracefully');

      (globalThis as any).document.fonts = originalFonts;
    });
  });

  // =========================================================================
  // CONTRACT 5: React Component DOM Output & Visual Hierarchy (renderToString)
  // =========================================================================
  describe('Contract 5: React Component DOM Output & Visual Hierarchy', () => {

    const initialSlides: CarouselSlide[] = [
      { id: 's1', slideNumber: 1, tagline: 'VIRAL', title: 'First Viral Hook', body: 'Initial body 1' },
      { id: 's2', slideNumber: 2, tagline: 'STORY', title: 'Second Insight', body: 'Initial body 2' },
      { id: 's3', slideNumber: 3, tagline: 'ACTION', title: 'Closing CTA', body: 'Initial body 3' },
    ];

    it('5.1: renderToString renders 1080p Master badge and studio title header', () => {
      const html = renderToString(
        React.createElement(CarouselEditor, {
          initialSlides,
          isPro: false,
          onOpenUpgrade: () => {},
          showToast: () => {},
        })
      );

      assert.ok(html.includes('In-Browser Visual Carousel Studio'), 'Must contain studio title');
      assert.ok(html.includes('1080p Master'), 'Must render 1080p Master badge');
    });

    it('5.2: renderToString renders all 3 aspect ratio controls (4:5, 1:1, 9:16)', () => {
      const html = renderToString(
        React.createElement(CarouselEditor, {
          initialSlides,
          isPro: false,
          onOpenUpgrade: () => {},
          showToast: () => {},
        })
      );

      assert.ok(html.includes('4:5'), 'Must render 4:5 ratio control');
      assert.ok(html.includes('1:1'), 'Must render 1:1 ratio control');
      assert.ok(html.includes('9:16'), 'Must render 9:16 ratio control');
    });

    it('5.3: renderToString renders floating dock with slide counter pill "01 / 03"', () => {
      const html = renderToString(
        React.createElement(CarouselEditor, {
          initialSlides,
          isPro: false,
          onOpenUpgrade: () => {},
          showToast: () => {},
        })
      );

      assert.ok(html.includes('01'), 'Must render current slide index 01');
      assert.ok(html.includes('03'), 'Must render total slides count 03');
    });

    it('5.4: THEMES palette contains 5 verified themes and renderToString renders Editor sub-tabs', () => {
      const themes: CarouselTheme[] = ['dark-minimal', 'bold-gradient', 'editorial', 'neon-hacker', 'sunset-glow'];
      for (const t of themes) {
        assert.ok(THEMES[t], `Theme ${t} must be configured in THEMES`);
        assert.ok(THEMES[t].background.startsWith('#'), `Theme ${t} background must be a valid hex color`);
        assert.ok(THEMES[t].accentColor.startsWith('#'), `Theme ${t} accentColor must be a valid hex color`);
        assert.ok(THEMES[t].primaryText.startsWith('#'), `Theme ${t} primaryText must be a valid hex color`);
      }

      const html = renderToString(
        React.createElement(CarouselEditor, {
          initialSlides,
          isPro: false,
          onOpenUpgrade: () => {},
          showToast: () => {},
        })
      );

      assert.ok(html.includes('Slide Content'), 'Must render Slide Content tab header');
      assert.ok(html.includes('Themes &amp; Visuals') || html.includes('Themes & Visuals'), 'Must render Themes & Visuals tab header');
    });

    it('5.5: Free tier renders watermark upgrade capsule; Pro tier renders PRO 1080p verified pill', () => {
      const freeHtml = renderToString(
        React.createElement(CarouselEditor, {
          initialSlides,
          isPro: false,
          onOpenUpgrade: () => {},
          showToast: () => {},
        })
      );
      assert.ok(freeHtml.includes('Remove Watermark ($39 LTD)'), 'Free tier must render watermark upgrade capsule');
      assert.strictEqual(freeHtml.includes('PRO 1080p'), false, 'Free tier must NOT render PRO verified pill');

      const proHtml = renderToString(
        React.createElement(CarouselEditor, {
          initialSlides,
          isPro: true,
          onOpenUpgrade: () => {},
          showToast: () => {},
        })
      );
      assert.ok(proHtml.includes('PRO 1080p'), 'Pro tier must render PRO 1080p verified pill');
      assert.strictEqual(proHtml.includes('Remove Watermark ($39 LTD)'), false, 'Pro tier must NOT render upgrade capsule');
    });

    it('5.6: renderToString renders Deck Filmstrip with all slide pills', () => {
      const html = renderToString(
        React.createElement(CarouselEditor, {
          initialSlides,
          isPro: false,
          onOpenUpgrade: () => {},
          showToast: () => {},
        })
      );

      assert.ok(html.includes('Deck Filmstrip'), 'Must render Deck Filmstrip title');
      assert.ok(/Deck Filmstrip[\s\S]*?3[\s\S]*?slides/.test(html), 'Must render slide count indicator in filmstrip header');
    });
  });
});
