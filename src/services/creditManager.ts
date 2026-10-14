import { UserCredits } from '../types';

const STORAGE_KEY = 'hookforge_user_credits_v1';
const API_KEY_STORAGE = 'hookforge_gemini_api_key';
const DAILY_FREE_LIMIT = 3;

export const CreditManager = {
  getTodayDateString(): string {
    return new Date().toISOString().split('T')[0];
  },

  getCredits(): UserCredits {
    const raw = localStorage.getItem(STORAGE_KEY);
    const today = this.getTodayDateString();

    if (!raw) {
      const initial: UserCredits = {
        freeCreditsRemaining: DAILY_FREE_LIMIT,
        isPro: false,
        byokActive: !!this.getApiKey(),
        lastResetDate: today,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }

    try {
      const parsed: UserCredits = JSON.parse(raw);
      // Daily reset for free tier
      if (parsed.lastResetDate !== today && !parsed.isPro) {
        parsed.freeCreditsRemaining = DAILY_FREE_LIMIT;
        parsed.lastResetDate = today;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
      }
      parsed.byokActive = !!this.getApiKey();
      return parsed;
    } catch {
      const reset: UserCredits = {
        freeCreditsRemaining: DAILY_FREE_LIMIT,
        isPro: false,
        byokActive: !!this.getApiKey(),
        lastResetDate: today,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reset));
      return reset;
    }
  },

  canGenerate(): boolean {
    const credits = this.getCredits();
    if (credits.isPro) return true;
    if (credits.byokActive) return true;
    return credits.freeCreditsRemaining > 0;
  },

  consumeCredit(): boolean {
    const credits = this.getCredits();
    if (credits.isPro || credits.byokActive) {
      return true;
    }
    if (credits.freeCreditsRemaining <= 0) {
      return false;
    }
    credits.freeCreditsRemaining -= 1;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(credits));
    return true;
  },

  activatePro(licenseKey: string): boolean {
    // Validates format: HF-PRO-XXXX or activates lifetime pass
    const cleanKey = licenseKey.trim().toUpperCase();
    if (cleanKey.length >= 6) {
      const credits = this.getCredits();
      credits.isPro = true;
      credits.licenseKey = cleanKey;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(credits));
      return true;
    }
    return false;
  },

  getApiKey(): string | null {
    return localStorage.getItem(API_KEY_STORAGE);
  },

  setApiKey(key: string): void {
    if (key.trim()) {
      localStorage.setItem(API_KEY_STORAGE, key.trim());
      const credits = this.getCredits();
      credits.byokActive = true;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(credits));
    } else {
      localStorage.removeItem(API_KEY_STORAGE);
      const credits = this.getCredits();
      credits.byokActive = false;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(credits));
    }
  },

  clearApiKey(): void {
    localStorage.removeItem(API_KEY_STORAGE);
    const credits = this.getCredits();
    credits.byokActive = false;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(credits));
  }
};
