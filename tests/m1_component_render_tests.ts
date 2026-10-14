import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { Navbar } from '../src/components/Navbar';
import { ApiKeyModal } from '../src/components/ApiKeyModal';
import { UpgradeModal } from '../src/components/UpgradeModal';
import { ToastContainer } from '../src/components/Toast';
import { ToastMessage, UserCredits } from '../src/types';

// Mock browser localStorage for Node.js environment
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

describe('Suite 4: React Component Render Contracts & DOM Output Verification', () => {

  beforeEach(() => {
    mockStorage.clear();
  });

  it('4.1: ApiKeyModal returns empty markup when isOpen is false', () => {
    const html = renderToString(
      React.createElement(ApiKeyModal, {
        isOpen: false,
        onClose: () => {},
        onKeyUpdated: () => {},
      })
    );
    assert.strictEqual(html, '', 'ApiKeyModal must render null / empty string when closed');
  });

  it('4.2: ApiKeyModal renders full modal dialog, input field, and action buttons when isOpen is true', () => {
    const html = renderToString(
      React.createElement(ApiKeyModal, {
        isOpen: true,
        onClose: () => {},
        onKeyUpdated: () => {},
      })
    );
    assert.ok(html.includes('Gemini API Key (BYOK)'), 'Must render modal title');
    assert.ok(html.includes('AIzaSy...'), 'Must render input placeholder');
    assert.ok(html.includes('Save Key'), 'Must render Save button');
    assert.ok(html.includes('Cancel'), 'Must render Cancel button');
    assert.ok(html.includes('Get a free Gemini API key'), 'Must render Google AI Studio link');
  });

  it('4.3: UpgradeModal returns empty markup when isOpen is false', () => {
    const html = renderToString(
      React.createElement(UpgradeModal, {
        isOpen: false,
        onClose: () => {},
        onSuccess: () => {},
      })
    );
    assert.strictEqual(html, '', 'UpgradeModal must render null / empty string when closed');
  });

  it('4.4: UpgradeModal renders pricing ($39), features checklist, and activation form when isOpen is true', () => {
    const html = renderToString(
      React.createElement(UpgradeModal, {
        isOpen: true,
        onClose: () => {},
        onSuccess: () => {},
      })
    );
    assert.ok(html.includes('Unlock HookForge'), 'Must render title');
    assert.ok(html.includes('$39'), 'Must render $39 pricing');
    assert.ok(html.includes('LIFETIME PASS'), 'Must render lifetime pass pill');
    assert.ok(html.includes('Zero Watermarks'), 'Must render feature 1');
    assert.ok(html.includes('Unlimited Content Runs'), 'Must render feature 2');
    assert.ok(html.includes('Activate'), 'Must render Activate button');
    assert.ok(html.includes('Demo Test: Instantly Unlock Pro for Testing'), 'Must render quick demo unlock button');
  });

  it('4.5: Navbar render contract adapts to Free, BYOK, and Pro states accurately', () => {
    // 1. Free tier state
    const freeCredits: UserCredits = {
      freeCreditsRemaining: 2,
      isPro: false,
      byokActive: false,
      lastResetDate: '2026-01-01',
    };
    const freeHtml = renderToString(
      React.createElement(Navbar, {
        credits: freeCredits,
        onOpenUpgrade: () => {},
        onOpenApiKey: () => {},
      })
    );
    assert.ok(freeHtml.includes('2 Free Left'), 'Must display free credits counter');
    assert.ok(freeHtml.includes('API Key'), 'Must display API Key button');
    assert.ok(freeHtml.includes('Get Pro'), 'Must display Upgrade CTA');
    assert.ok(!freeHtml.includes('LIFETIME PRO'), 'Must not display LIFETIME PRO');

    // 2. BYOK active state
    const byokCredits: UserCredits = {
      freeCreditsRemaining: 2,
      isPro: false,
      byokActive: true,
      lastResetDate: '2026-01-01',
    };
    const byokHtml = renderToString(
      React.createElement(Navbar, {
        credits: byokCredits,
        onOpenUpgrade: () => {},
        onOpenApiKey: () => {},
      })
    );
    assert.ok(byokHtml.includes('BYOK Active'), 'Must display BYOK Active indicator');
    assert.ok(byokHtml.includes('Unlimited (BYOK)'), 'Must display Unlimited BYOK credits');

    // 3. Pro tier state
    const proCredits: UserCredits = {
      freeCreditsRemaining: 0,
      isPro: true,
      byokActive: false,
      lastResetDate: '2026-01-01',
    };
    const proHtml = renderToString(
      React.createElement(Navbar, {
        credits: proCredits,
        onOpenUpgrade: () => {},
        onOpenApiKey: () => {},
      })
    );
    assert.ok(proHtml.includes('LIFETIME PRO'), 'Must display LIFETIME PRO badge');
    assert.ok(!proHtml.includes('Get Pro ($39 LTD)'), 'Must hide Get Pro CTA for Pro users');
  });

  it('4.6: ToastContainer render contract displays differentiated glows for success, error, and info', () => {
    // Empty state
    const emptyHtml = renderToString(React.createElement(ToastContainer, { toasts: [], onDismiss: () => {} }));
    assert.strictEqual(emptyHtml, '', 'Empty toasts should render null');

    // 3 differentiated toasts
    const toasts: ToastMessage[] = [
      { id: '1', text: 'Success Message', type: 'success' },
      { id: '2', text: 'Error Message', type: 'error' },
      { id: '3', text: 'Info Message', type: 'info' },
    ];
    const html = renderToString(React.createElement(ToastContainer, { toasts, onDismiss: () => {} }));

    assert.ok(html.includes('Success Message'));
    assert.ok(html.includes('border-emerald-500/50'), 'Success toast must have emerald glow border');
    assert.ok(html.includes('Error Message'));
    assert.ok(html.includes('border-rose-500/50'), 'Error toast must have rose glow border');
    assert.ok(html.includes('Info Message'));
    assert.ok(html.includes('border-sky-500/50'), 'Info toast must have sky glow border');
  });

});
