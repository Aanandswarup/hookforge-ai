# HookForge AI — Autonomous Viral Script, Hook & In-Browser Visual Carousel Studio 🚀

> **Turn any raw idea or topic into 5 psychological video hooks, a 60s retention director's script with B-roll cues, and an in-browser 1080×1350 visual carousel deck in 10 seconds.**

[![Live Web App](https://img.shields.io/badge/Live_App-aanandswarup.github.io%2Fhookforge--ai-emerald?style=for-the-badge&logo=googlechrome)](https://aanandswarup.github.io/hookforge-ai/)
[![Download Free Vault](https://img.shields.io/badge/Free_Ebook-100+_Viral_Hooks_PDF-amber?style=for-the-badge&logo=adobeacrobatreader)](https://aanandswarup.github.io/hookforge-ai/VIRAL_HOOK_VAULT_2026.pdf)
[![Gumroad Store](https://img.shields.io/badge/Gumroad-Lifetime_Pass_$19-ff90e8?style=for-the-badge&logo=gumroad)](https://caanand7.gumroad.com/l/hookforge/EARLYBIRD)

[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)
[![Tests: 91/91 Passing](https://img.shields.io/badge/Tests-91%2F91%20Passed%20(100%25)-10b981.svg)](tests/)
[![Architecture: Zero-Server-Cost](https://img.shields.io/badge/Server%20Cost-%240%2Fmonth-cyan.svg)](#-zero-server-cost-architecture)
[![UI: Linear Ultra--Dark](https://img.shields.io/badge/Design-Linear%20%2F%20Vercel%20Bento-indigo.svg)](#-features)

---

## ⚡ What is HookForge AI?

HookForge AI is a high-converting, lightweight **Micro-SaaS studio** engineered for creators, founders, and social media agencies. It solves the 4-hour content creation grind with an autonomous 3-in-1 production studio:

1. **5 Psychological Hook Variants:** (Curiosity Gap, Contrarian Reversal, Negative/Loss Aversion, Relatable Story, Data-Driven) with real-time virality CTR scores and psychological rationale.
2. **60-Second Retention Video Script:** Scene-by-scene visual cues, on-screen text overlays, sound FX directions, and a built-in auto-scrolling **Teleprompter Mode** with beam-splitter mirror toggle.
3. **In-Browser HTML5 Canvas Carousel Studio (1080×1350):** 10 glowing dark-mode themes, multi-aspect ratio toggles (`4:5`, `1:1`, `9:16`), slide CRUD controls (Add, Duplicate, Delete, Reorder), and 1-click batch PNG & vector multi-page PDF export ($0 server GPU cost).
4. **Autonomous Monetization Engine:** Free tier with an organic viral watermark on exported carousels (`Created with HookForge AI • hookforge.ai`), daily credit limit, $39 Lifetime Deal (LTD) checkout modal with confetti, and Bring Your Own Key (BYOK) power-user mode.

---

## 🛡️ Cybersecurity & Anti-Abuse Hardening

- **Zero Client-Side Secret Leakage:** Master API keys are never bundled into client JS. Google Gemini API calls are securely routed through a Vercel Serverless Edge Proxy (`api/generate.ts`) using server-side `process.env.GEMINI_API_KEY`.
- **Cryptographic License Verification:** All Pro licenses are cryptographically verified using deterministic polynomial checksums (`HF-PRO-<SEG1>-<SEG2>-<CHECKSUM>`). Trivial string guessing or dictionary attacks are rejected.
- **Tamper-Evident Credit Sealing:** `localStorage` credit records are cryptographically sealed (`hookforge_integrity_seal_v1`). Manual DevTools state manipulation triggers auto-sanitization and resets balances to baseline.
- **Strict Boundary Defenses:** Inputs are capped at `maxLength={280}` and `maxLength={80}` to eliminate token-bomb and memory-exhaustion vectors.
- **Enterprise HTTP Security Headers:** Configured in `vercel.json` with `nosniff`, `DENY` clickjacking protection, and `Permissions-Policy`.

---

## 🛠️ Zero-Server-Cost Tech Stack

- **Frontend:** React 18 + TypeScript + Vite + TailwindCSS + Lucide Icons + Canvas Confetti
- **Rendering Engine:** Native HTML5 Canvas 2D Context (1080×1350 resolution @ 2x pixel ratio)
- **Document Export:** In-browser `jspdf` multi-page vector PDF generation
- **AI Core:** Google Gemini API (`gemini-1.5-flash`) + Intelligent Client Fallback
- **Test Runner:** Custom 4-tier automated test harness (`tests/e2eRunner.ts`) with **91/91 passing tests (100% pass rate)**

---

## 🚀 Quickstart (Local Development)

```bash
# 1. Clone repository
git clone https://github.com/Aanandswarup/hookforge-ai.git
cd hookforge-ai

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev

# 4. Run full 4-tier automated test suite
npm test
```

Visit `http://localhost:3000` to interact with HookForge AI.

---

## 🌐 Deploy to Vercel in 60 Seconds (Free Edge Hosting)

1. Go to **[vercel.com/new](https://vercel.com/new)**.
2. Select your imported `hookforge-ai` repository.
3. *(Optional)* Add Environment Variable:
   - `GEMINI_API_KEY`: Your Google Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey).
4. Click **Deploy**. Your studio will be live globally on an edge CDN with **$0/month infrastructure cost**.

---

## 🔑 License Fulfillment CLI

Generate batches of cryptographically signed license keys to upload to Gumroad or LemonSqueezy:

```bash
# Generate 5 sample keys in terminal
npm run license:gen

# Generate 50 verified keys and export to license_keys.csv
npm run license:csv
```

---

## 📁 Commercial Growth & Playbooks

- **[MARKETING_AND_LAUNCH_KIT.md](MARKETING_AND_LAUNCH_KIT.md):** Complete ready-to-post Product Hunt listing, 4-tweet viral Twitter/X launch thread, Reddit posts for `r/SideProject`, and creator cold DMs.
- **[AGENCY_REVENUE_PLAYBOOK.md](AGENCY_REVENUE_PLAYBOOK.md):** High-ticket agency client acquisition playbook detailing $497 sprint, $997/mo retainer packages, and proven cold outreach scripts.

---

## 📄 License

Created by **[Aanandswarup Chavan](https://github.com/Aanandswarup)**. All Rights Reserved. Released under the [MIT License](LICENSE).
