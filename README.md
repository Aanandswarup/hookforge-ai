# HookForge AI — Autonomous Viral Script & Carousel Studio

HookForge AI is an ultra-fast, zero-server-cost Micro-SaaS application that transforms any idea, topic, or offer into:
1. **5 Psychological Hook Variants** (Curiosity Gap, Contrarian, Negative/Fear, Story, Data-Driven) with virality CTR scores.
2. **60-Second Retention Video Script** with B-roll visual cues, on-screen text overlays, sound FX cues, and auto-scrolling Teleprompter mode.
3. **In-Browser HTML5 Canvas Carousel Studio** rendering 1080×1350 visual slides with 5 themes, live inline editing, and 1-click batch PNG/PDF exports.
4. **Monetization & Growth Engine** featuring daily free credits, organic viral watermarks on free exports, and a $39 Lifetime Deal upgrade modal.

---

## ⚡ Zero Server Cost Architecture

- **Frontend:** React 18 + Vite + TailwindCSS + Lucide Icons + Canvas Confetti.
- **AI Engine:** Google Gemini API (`gemini-1.5-flash`) with structured output parsing and intelligent fallback for instant demo tests.
- **Graphics & Rendering:** Pure HTML5 Canvas client-side rendering (1080×1350 resolution). **Zero server GPU usage or image generation API fees.**
- **PDF Generation:** In-browser `jspdf` multi-page document export.
- **Credit & License Tracking:** Client-side `localStorage` with BYOK (Bring Your Own Gemini API Key) support.

---

## 🚀 Quickstart (Local Development)

```bash
# 1. Navigate to directory
cd hookforge-ai

# 2. Run local development server (super lightweight on 8GB RAM)
npm run dev
```

Visit `http://localhost:3000` to interact with HookForge AI.

---

## 🌐 Deploy to Vercel in 60 Seconds (Free Hosting)

1. Push this repository to GitHub.
2. Log in to [Vercel](https://vercel.com) and click **"Add New Project"**.
3. Import this repository.
4. (Optional) In Environment Variables, set:
   - `VITE_GEMINI_API_KEY`: Your Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
5. Click **Deploy**. Your app is now live worldwide on a global edge CDN with $0/month bills!

---

## 💰 Monetization Setup

1. Open `src/components/UpgradeModal.tsx`.
2. Replace `CHECKOUT_URL` with your **LemonSqueezy**, **Dodo Payments**, or **Stripe Payment Link**.
3. When customers purchase, provide them with a license key (e.g. `HF-PRO-XXXX`) which permanently unlocks Pro mode and removes watermarks.

---

## 📁 Marketing & Distribution Kit

See [MARKETING_AND_LAUNCH_KIT.md](MARKETING_AND_LAUNCH_KIT.md) for ready-to-post Product Hunt materials, Twitter threads, Reddit posts, and agency outreach templates.
