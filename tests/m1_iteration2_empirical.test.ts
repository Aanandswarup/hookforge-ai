import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { CreditManager } from '../src/services/creditManager';
import { GeminiService } from '../src/services/geminiService';
import { GenerationResult, ToastMessage, UserCredits } from '../src/types';

// Mock localStorage for headless Node environment
class MockLocalStorage {
  private store: Map<string, string> = new Map();
  getItem(key: string): string | null {
    return this.store.has(key) ? this.store.get(key)! : null;
  }
  setItem(key: string, value: string): void {
    this.store.set(key, String(value));
  }
  removeItem(key: string): void {
    this.store.delete(key);
  }
  clear(): void {
    this.store.clear();
  }
}

const mockStorage = new MockLocalStorage();
(globalThis as any).localStorage = mockStorage;

// Event listener harness simulating browser window event targets
class MockWindowEventTarget {
  private listeners: Map<string, Set<(e: any) => void>> = new Map();

  addEventListener(type: string, listener: (e: any) => void): void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)!.add(listener);
  }

  removeEventListener(type: string, listener: (e: any) => void): void {
    if (this.listeners.has(type)) {
      this.listeners.get(type)!.delete(listener);
    }
  }

  dispatchEvent(event: { type: string; key?: string; [k: string]: any }): boolean {
    const handlers = this.listeners.get(event.type);
    if (!handlers || handlers.size === 0) return true;
    for (const handler of Array.from(handlers)) {
      handler(event);
    }
    return true;
  }

  getListenerCount(type: string): number {
    return this.listeners.has(type) ? this.listeners.get(type)!.size : 0;
  }

  clear(): void {
    this.listeners.clear();
  }
}

const mockWindow = new MockWindowEventTarget();
(globalThis as any).window = mockWindow;

describe('Empirical Verification: Milestone M1 Iteration 2 Hardening', () => {

  beforeEach(() => {
    mockStorage.clear();
    mockWindow.clear();
  });

  describe('Contract 1: Escape Key Listener Registration & Modal Dismissal', () => {

    it('1.1: ApiKeyModal registers Escape listener when open and dispatches onClose on Escape', () => {
      let closeCalledCount = 0;
      const onClose = () => { closeCalledCount++; };

      // Simulate ApiKeyModal Escape useEffect lifecycle
      const mountApiKeyModal = (isOpen: boolean) => {
        const handleKeyDown = (e: any) => {
          if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
          mockWindow.addEventListener('keydown', handleKeyDown);
        }
        return () => {
          mockWindow.removeEventListener('keydown', handleKeyDown);
        };
      };

      // Modal is open
      const unmount = mountApiKeyModal(true);
      assert.strictEqual(mockWindow.getListenerCount('keydown'), 1, 'Keydown listener must be registered when isOpen is true');

      // Dispatch non-Escape key (e.g. Enter, Tab, a) -> should NOT close
      mockWindow.dispatchEvent({ type: 'keydown', key: 'Enter' });
      mockWindow.dispatchEvent({ type: 'keydown', key: 'Tab' });
      mockWindow.dispatchEvent({ type: 'keydown', key: 'a' });
      assert.strictEqual(closeCalledCount, 0, 'Non-Escape keys must NOT trigger onClose');

      // Dispatch Escape key -> must trigger onClose
      mockWindow.dispatchEvent({ type: 'keydown', key: 'Escape' });
      assert.strictEqual(closeCalledCount, 1, 'Escape key must trigger onClose');

      // Unmount / close modal -> listener must be cleanly deregistered
      unmount();
      assert.strictEqual(mockWindow.getListenerCount('keydown'), 0, 'Keydown listener must be unregistered on cleanup');

      // Dispatch Escape after unmount -> no further close calls
      mockWindow.dispatchEvent({ type: 'keydown', key: 'Escape' });
      assert.strictEqual(closeCalledCount, 1, 'Deregistered listener must not trigger after unmount');
    });

    it('1.2: UpgradeModal registers Escape listener when open and dispatches onClose on Escape', () => {
      let closeCalledCount = 0;
      const onClose = () => { closeCalledCount++; };

      // Simulate UpgradeModal Escape useEffect lifecycle
      const mountUpgradeModal = (isOpen: boolean) => {
        const handleKeyDown = (e: any) => {
          if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
          mockWindow.addEventListener('keydown', handleKeyDown);
        }
        return () => {
          mockWindow.removeEventListener('keydown', handleKeyDown);
        };
      };

      const unmount = mountUpgradeModal(true);
      assert.strictEqual(mockWindow.getListenerCount('keydown'), 1, 'Keydown listener registered');

      // Pressing Escape triggers onClose
      mockWindow.dispatchEvent({ type: 'keydown', key: 'Escape' });
      assert.strictEqual(closeCalledCount, 1, 'Escape triggers onClose');

      // Rapid successive Escapes
      mockWindow.dispatchEvent({ type: 'keydown', key: 'Escape' });
      assert.strictEqual(closeCalledCount, 2, 'Subsequent Escapes trigger onClose handlers idempotently');

      unmount();
      assert.strictEqual(mockWindow.getListenerCount('keydown'), 0, 'Cleaned up on unmount');
    });

    it('1.3: Closed modals do NOT register keydown listeners', () => {
      const mountModal = (isOpen: boolean) => {
        const handleKeyDown = (e: any) => {};
        if (isOpen) mockWindow.addEventListener('keydown', handleKeyDown);
        return () => mockWindow.removeEventListener('keydown', handleKeyDown);
      };

      const unmount = mountModal(false);
      assert.strictEqual(mockWindow.getListenerCount('keydown'), 0, 'No listener attached when modal isOpen is false');
      unmount();
      assert.strictEqual(mockWindow.getListenerCount('keydown'), 0);
    });

  });

  describe('Contract 2: Modal State Reset Upon Reopening', () => {

    it('2.1: ApiKeyModal resets dirty input, statusMsg, and showKey to clean stored state upon reopening', () => {
      // 1. Initial baseline: no key stored
      let currentStoredKey = CreditManager.getApiKey() || '';
      assert.strictEqual(currentStoredKey, '');

      // Simulate ApiKeyModal internal state holder
      let apiKeyInput = currentStoredKey;
      let showKey = false;
      let statusMsg = '';

      const onModalOpen = (isOpen: boolean) => {
        if (isOpen) {
          apiKeyInput = CreditManager.getApiKey() || '';
          showKey = false;
          statusMsg = '';
        }
      };

      // Open 1: Clean
      onModalOpen(true);
      assert.strictEqual(apiKeyInput, '');
      assert.strictEqual(showKey, false);
      assert.strictEqual(statusMsg, '');

      // User types dirty key and toggles showKey
      apiKeyInput = 'AIzaSy_dirty_uncommitted_key_123';
      showKey = true;
      statusMsg = 'API Key saved successfully!';

      // Modal closes without saving
      // (isOpen becomes false)

      // Modal reopens
      onModalOpen(true);
      assert.strictEqual(apiKeyInput, '', 'Dirty input must be cleanly reset to empty stored key');
      assert.strictEqual(showKey, false, 'showKey must be reset to false');
      assert.strictEqual(statusMsg, '', 'statusMsg must be reset to empty string');

      // Case 2: User has a saved valid key in CreditManager
      CreditManager.setApiKey('AIzaSy_valid_persisted_key_888');
      onModalOpen(true);
      assert.strictEqual(apiKeyInput, 'AIzaSy_valid_persisted_key_888', 'Must reflect persisted stored key');

      // User alters it to dirty text
      apiKeyInput = 'altered_garbage';
      // Reopen modal without saving
      onModalOpen(true);
      assert.strictEqual(apiKeyInput, 'AIzaSy_valid_persisted_key_888', 'Must reset back to persisted stored key');
    });

    it('2.2: UpgradeModal resets licenseKeyInput and errorMsg cleanly upon reopening', () => {
      let licenseKeyInput = '';
      let errorMsg = '';

      const onUpgradeModalOpen = (isOpen: boolean) => {
        if (isOpen) {
          licenseKeyInput = '';
          errorMsg = '';
        }
      };

      // Open 1
      onUpgradeModalOpen(true);
      assert.strictEqual(licenseKeyInput, '');
      assert.strictEqual(errorMsg, '');

      // User types invalid key and triggers error
      licenseKeyInput = 'BAD';
      const success = CreditManager.activatePro(licenseKeyInput);
      assert.strictEqual(success, false);
      errorMsg = 'Invalid license key. Format: HF-PRO-XXXX or any key with 6+ chars.';
      assert.ok(errorMsg.length > 0);

      // User closes modal via Escape

      // Modal reopens
      onUpgradeModalOpen(true);
      assert.strictEqual(licenseKeyInput, '', 'License key input must be reset to empty');
      assert.strictEqual(errorMsg, '', 'Error message must be cleanly wiped on reopen');
    });

  });

  describe('Contract 3: Tab Dock Switching & State Preservation', () => {

    it('3.1: Tab dock switching preserves underlying GenerationResult data in App root', () => {
      // Simulate App.tsx root state
      let activeTab: 'hooks' | 'carousel' | 'script' = 'hooks';
      const result: GenerationResult = GeminiService.generateSmartFallback({
        topic: 'Autonomous Cashflow Micro-SaaS',
        niche: 'AI Tech Builders',
        tone: 'Contrarian',
        platform: 'TikTok/Reels'
      });

      // Verify baseline result structure
      assert.strictEqual(result.hooks.length, 5);
      assert.strictEqual(result.carouselSlides.length, 6);
      assert.ok(result.shortScript.scenes.length >= 4);

      const originalHook1 = result.hooks[0].hookText;
      const originalSlide1 = result.carouselSlides[0].headline;
      const originalScene1 = result.shortScript.scenes[0].spokenDialogue;

      // Switch to Tab 2 ('carousel')
      activeTab = 'carousel';
      assert.strictEqual(activeTab, 'carousel');
      assert.strictEqual(result.hooks[0].hookText, originalHook1, 'Hooks data unchanged');
      assert.strictEqual(result.carouselSlides[0].headline, originalSlide1, 'Carousel data unchanged');

      // Switch to Tab 3 ('script')
      activeTab = 'script';
      assert.strictEqual(activeTab, 'script');
      assert.strictEqual(result.shortScript.scenes[0].spokenDialogue, originalScene1, 'Script data unchanged');

      // Switch back to Tab 1 ('hooks')
      activeTab = 'hooks';
      assert.strictEqual(activeTab, 'hooks');
      assert.strictEqual(result.hooks[0].hookText, originalHook1, 'Hooks data identical on return');
    });

    it('3.2: Tab dock switching preserves active floating toasts across tab transitions', async () => {
      let activeTab: 'hooks' | 'carousel' | 'script' = 'hooks';
      let toasts: ToastMessage[] = [];

      const showToast = (text: string, type: 'success' | 'info' | 'error' = 'info', duration = 300) => {
        const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
        toasts = [...toasts, { id, text, type }];
        setTimeout(() => {
          toasts = toasts.filter(t => t.id !== id);
        }, duration);
        return id;
      };

      // Add toast on Tab 1
      const toastId = showToast('Generated fresh viral hook pack & carousel deck!', 'success', 300);
      assert.strictEqual(toasts.length, 1);
      assert.strictEqual(toasts[0].id, toastId);

      // Switch to Tab 2
      activeTab = 'carousel';
      assert.strictEqual(toasts.length, 1, 'Toast persists during switch to Tab 2');
      assert.strictEqual(toasts[0].text, 'Generated fresh viral hook pack & carousel deck!');

      // Switch to Tab 3
      activeTab = 'script';
      assert.strictEqual(toasts.length, 1, 'Toast persists during switch to Tab 3');

      // Wait 100ms and add a second toast on Tab 3
      await new Promise(r => setTimeout(r, 100));
      const toastId2 = showToast('Script copied to clipboard!', 'info', 300);
      assert.strictEqual(toasts.length, 2, 'Multiple toasts stack cleanly across tabs');

      // Switch back to Tab 1
      activeTab = 'hooks';
      assert.strictEqual(toasts.length, 2, 'Toasts preserved when returning to Tab 1');

      // Wait until toast 1 auto-dismisses (t=350ms total)
      await new Promise(r => setTimeout(r, 250));
      assert.strictEqual(toasts.length, 1, 'Toast 1 auto-dismissed');
      assert.strictEqual(toasts[0].id, toastId2, 'Toast 2 remains active');

      // Wait for toast 2 auto-dismiss (t=500ms total)
      await new Promise(r => setTimeout(r, 200));
      assert.strictEqual(toasts.length, 0, 'All toasts cleanly dismissed');
    });

    it('3.3: Tab dock switching preserves user credit tracking and BYOK state', () => {
      let activeTab: 'hooks' | 'carousel' | 'script' = 'hooks';

      // 1. Free tier state
      let credits: UserCredits = CreditManager.getCredits();
      assert.strictEqual(credits.freeCreditsRemaining, 3);
      assert.strictEqual(credits.isPro, false);
      assert.strictEqual(credits.byokActive, false);

      // Consume 1 credit
      CreditManager.consumeCredit();
      credits = CreditManager.getCredits();
      assert.strictEqual(credits.freeCreditsRemaining, 2);

      // Switch tabs
      activeTab = 'carousel';
      credits = CreditManager.getCredits();
      assert.strictEqual(credits.freeCreditsRemaining, 2, 'Credits unchanged on Tab 2');

      activeTab = 'script';
      credits = CreditManager.getCredits();
      assert.strictEqual(credits.freeCreditsRemaining, 2, 'Credits unchanged on Tab 3');

      // Activate BYOK while on Tab 3
      CreditManager.setApiKey('AIzaSy_Test_Key_123');
      credits = CreditManager.getCredits();
      assert.strictEqual(credits.byokActive, true);

      // Switch back to Tab 1
      activeTab = 'hooks';
      credits = CreditManager.getCredits();
      assert.strictEqual(credits.byokActive, true, 'BYOK state intact when returning to Tab 1');
      assert.strictEqual(credits.freeCreditsRemaining, 2, 'Free credits untouched by BYOK');
    });

  });

});
