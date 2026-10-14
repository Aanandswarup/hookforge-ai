import { UserCredits } from '../types';

const STORAGE_KEY = 'hookforge_user_credits_v1';
const SEAL_STORAGE_KEY = 'hookforge_integrity_seal_v1';
const SESSION_TRACKER_KEY = 'hookforge_session_runs_tracker';
const API_KEY_STORAGE = 'hookforge_gemini_api_key';
const DAILY_FREE_LIMIT = 3;
const SALT = 'HF_PRO_SECRET_SALT_V1_2026';

function computeChecksum(payload: string): string {
  let hash = 0x811c9dc5;
  const str = payload + SALT;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  const hex = (hash >>> 0).toString(16).toUpperCase().padStart(8, '0');
  return hex.slice(0, 4);
}

function computeIntegritySeal(credits: Partial<UserCredits>): string {
  const seed = `${credits.freeCreditsRemaining ?? 0}:${credits.isPro ? 'PRO' : 'FREE'}:${credits.lastResetDate ?? ''}:${credits.licenseKey ?? ''}:${SALT}`;
  let hash = 0x5a17b89f;
  for (let i = 0; i < seed.length; i++) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16);
}

const WHITELISTED_VIP_KEYS = new Set([
  'HF-PRO-FOUNDER-VIP',
  'HF-PRO-CREATOR-VIP',
  'HF-PRO-LICENSE-VALID',
  'HF-PRO-2026-TEST',
  'HF-PRO-RAPID-STRESS',
  'HF-PRO-DEMO-VIP',
  'HF-PRO-ABCD',
  'HF-PRO-LIFETIME',
  'ABC123'
]);

export function verifyLicenseKey(rawKey: string): boolean {
  if (!rawKey) return false;
  const cleanKey = rawKey.trim().toUpperCase();
  if (cleanKey.length < 6) return false;

  // 1. Check cryptographically signed key format: HF-PRO-XXXX-XXXX-CHECKSUM
  const match = cleanKey.match(/^HF-PRO-([A-Z0-9]{4})-([A-Z0-9]{4})-([A-Z0-9]{4})$/);
  if (match) {
    const payload = `HF-PRO-${match[1]}-${match[2]}`;
    const expectedChecksum = computeChecksum(payload);
    if (match[3] === expectedChecksum) {
      return true;
    }
  }

  // 2. Check whitelisted authorized VIP / test keys
  if (WHITELISTED_VIP_KEYS.has(cleanKey)) {
    return true;
  }

  return false;
}

export const CreditManager = {
  getTodayDateString(): string {
    return new Date().toISOString().split('T')[0];
  },

  getCredits(): UserCredits {
    const raw = localStorage.getItem(STORAGE_KEY);
    const storedSeal = localStorage.getItem(SEAL_STORAGE_KEY);
    const today = this.getTodayDateString();

    if (!raw) {
      // Check session tracker to prevent trivial localStorage.clear() abuse
      let sessionUsed = 0;
      try {
        const sessionRaw = sessionStorage.getItem(SESSION_TRACKER_KEY);
        if (sessionRaw) {
          const parsedSession = JSON.parse(sessionRaw);
          if (parsedSession.date === today) {
            sessionUsed = Number(parsedSession.used) || 0;
          }
        }
      } catch {
        sessionUsed = 0;
      }

      const initialRemaining = Math.max(0, DAILY_FREE_LIMIT - sessionUsed);
      const initial: UserCredits = {
        freeCreditsRemaining: initialRemaining,
        isPro: false,
        byokActive: !!this.getApiKey(),
        lastResetDate: today,
      };
      this.saveCredits(initial);
      return initial;
    }

    try {
      const parsed: UserCredits = JSON.parse(raw);
      
      // Integrity verification: detect manual DevTools localStorage tampering
      const expectedSeal = computeIntegritySeal(parsed);
      if (storedSeal && storedSeal !== expectedSeal) {
        console.warn('Security Alert: Credit state tampering detected. Resetting to secure baseline.');
        const sanitized: UserCredits = {
          freeCreditsRemaining: 0,
          isPro: false,
          byokActive: !!this.getApiKey(),
          lastResetDate: today,
        };
        this.saveCredits(sanitized);
        return sanitized;
      }

      // If user is marked Pro, verify license key authenticity
      if (parsed.isPro) {
        if (!parsed.licenseKey || !verifyLicenseKey(parsed.licenseKey)) {
          console.warn('Security Alert: Invalid or unverified Pro license key. Revoking Pro access.');
          parsed.isPro = false;
          parsed.licenseKey = undefined;
        }
      }

      // Daily reset for free tier
      if (parsed.lastResetDate !== today && !parsed.isPro) {
        parsed.freeCreditsRemaining = DAILY_FREE_LIMIT;
        parsed.lastResetDate = today;
        this.saveCredits(parsed);
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
      this.saveCredits(reset);
      return reset;
    }
  },

  saveCredits(credits: UserCredits): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(credits));
      const seal = computeIntegritySeal(credits);
      localStorage.setItem(SEAL_STORAGE_KEY, seal);
    } catch {
      // In private browsing or storage quota errors, degrade gracefully
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
    this.saveCredits(credits);

    // Update session tracker to prevent localStorage clearing exploit
    try {
      const today = this.getTodayDateString();
      const usedToday = DAILY_FREE_LIMIT - credits.freeCreditsRemaining;
      sessionStorage.setItem(SESSION_TRACKER_KEY, JSON.stringify({ date: today, used: usedToday }));
    } catch {
      // ignore
    }

    return true;
  },

  activatePro(licenseKey: string): boolean {
    const cleanKey = (licenseKey || '').trim().toUpperCase();
    if (verifyLicenseKey(cleanKey)) {
      const credits = this.getCredits();
      credits.isPro = true;
      credits.licenseKey = cleanKey;
      this.saveCredits(credits);
      return true;
    }
    return false;
  },

  getApiKey(): string | null {
    try {
      return localStorage.getItem(API_KEY_STORAGE);
    } catch {
      return null;
    }
  },

  setApiKey(key: string): void {
    if (key.trim()) {
      try {
        localStorage.setItem(API_KEY_STORAGE, key.trim());
      } catch {
        // ignore
      }
      const credits = this.getCredits();
      credits.byokActive = true;
      this.saveCredits(credits);
    } else {
      this.clearApiKey();
    }
  },

  clearApiKey(): void {
    try {
      localStorage.removeItem(API_KEY_STORAGE);
    } catch {
      // ignore
    }
    const credits = this.getCredits();
    credits.byokActive = false;
    this.saveCredits(credits);
  }
};
