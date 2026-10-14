import { GenerationResult, HookItem, ScriptPack, CarouselSlide } from '../types';
import { CreditManager } from './creditManager';

export interface GenerationParams {
  topic: string;
  niche: string;
  tone: 'Contrarian' | 'Educational' | 'Storyteller' | 'High Energy' | 'Brutally Honest';
  platform: 'TikTok/Reels' | 'YouTube Shorts' | 'LinkedIn Video';
}

export const GeminiService = {
  async generateContent(params: {
    topic: string;
    niche: string;
    tone: string;
    platform: string;
  }): Promise<GenerationResult> {
    const userApiKey = CreditManager.getApiKey();

    // 1. If user provided their own key in the UI (BYOK mode), call Gemini API directly
    if (userApiKey && userApiKey.trim().length > 10) {
      try {
        return await this.callGeminiApi(params, userApiKey.trim());
      } catch (err) {
        console.warn('User BYOK Gemini API call failed or rate-limited, falling back to intelligent generator:', err);
        return this.generateSmartFallback(params);
      }
    }

    // 2. If running on a deployed host with serverless edge proxy (/api/generate), call it
    try {
      const serverProxyResponse = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      if (serverProxyResponse.ok) {
        const data = await serverProxyResponse.json();
        if (data && data.hooks && data.carouselSlides) {
          return data;
        }
      }
    } catch {
      // Offline, static host, or local preview: proceed smoothly to client-side smart engine
    }

    // 3. Ultra-fast, zero-cost intelligent client generator
    return this.generateSmartFallback(params);
  },

  async callGeminiApi(
    params: { topic: string; niche: string; tone: string; platform: string },
    apiKey: string
  ): Promise<GenerationResult> {
    const systemPrompt = `You are an elite viral content strategist who has generated over 500M+ views across TikTok, Reels, YouTube Shorts, and LinkedIn.
Given a topic, niche, tone, and platform, generate:
1. Exactly 5 viral psychological hooks of different types: "Curiosity Gap", "Contrarian", "Negative / Fear", "Story Driven", "Data / Proof". Give each a virality score from 80-99.
2. A tightly-paced 60-second video script with exact timestamps (e.g. 0:00 - 0:04), spoken words, high-retention visual B-roll cues, screen text overlays, and sound FX cues.
3. A 6-slide visual carousel (ideal for LinkedIn or Instagram) with punchy slide titles, body summaries, and a final CTA slide.

Respond with ONLY valid JSON adhering strictly to this schema:
{
  "topic": "${params.topic}",
  "niche": "${params.niche}",
  "hooks": [
    {
      "id": "1",
      "type": "Curiosity Gap",
      "hookText": "string",
      "viralityScore": 95,
      "psychologicalTrigger": "string",
      "suggestedFirstFrameText": "string"
    }
  ],
  "shortScript": {
    "title": "string",
    "targetPlatform": "${params.platform}",
    "estimatedDuration": "60s",
    "pacingAdvice": "string",
    "callToAction": "string",
    "scenes": [
      {
        "timestamp": "0:00 - 0:04",
        "spokenWords": "string",
        "visualCue": "string",
        "screenOverlayText": "string",
        "soundFX": "string"
      }
    ]
  },
  "carouselSlides": [
    {
      "id": "1",
      "slideNumber": 1,
      "tagline": "string",
      "title": "string",
      "body": "string",
      "highlightText": "string",
      "swipeIndicator": true
    }
  ]
}`;

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `${systemPrompt}\n\nTOPIC: ${params.topic}\nNICHE: ${params.niche}\nTONE: ${params.tone}\nPLATFORM: ${params.platform}`,
              },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.7,
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidateText) {
      throw new Error('No content returned from Gemini API');
    }

    const cleanJson = candidateText.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed: GenerationResult = JSON.parse(cleanJson);
    return parsed;
  },

  generateSmartFallback(params: { topic: string; niche: string; tone: string; platform: string }): GenerationResult {
    const topic = params.topic || 'Landing your first $1,000 online';
    const niche = params.niche || 'Digital Entrepreneurship';

    const hooks: HookItem[] = [
      {
        id: 'hook-1',
        type: 'Curiosity Gap',
        hookText: `Most people think ${topic} takes 6 months. Here's how people quietly do it in 72 hours.`,
        viralityScore: 94,
        psychologicalTrigger: 'Information Gap Theory (Loewenstein)',
        suggestedFirstFrameText: 'DO NOT SCROLL: The 72-Hour Secret 🤫',
      },
      {
        id: 'hook-2',
        type: 'Contrarian',
        hookText: `Stop listening to gurus about ${topic}. Doing the exact opposite is what actually worked.`,
        viralityScore: 97,
        psychologicalTrigger: 'Authority Challenge & Reversal',
        suggestedFirstFrameText: 'Everything you were told is WRONG ❌',
      },
      {
        id: 'hook-3',
        type: 'Negative / Fear',
        hookText: `If you are still approaching ${topic} the traditional way in 2026, you are losing money every single day.`,
        viralityScore: 91,
        psychologicalTrigger: 'Loss Aversion (Kahneman & Tversky)',
        suggestedFirstFrameText: 'You are losing $1,000s right now ⚠️',
      },
      {
        id: 'hook-4',
        type: 'Story Driven',
        hookText: `At 22, I had $0 and an 8GB laptop. Today, this 1 single framework around ${topic} prints automated results.`,
        viralityScore: 89,
        psychologicalTrigger: 'Zero-to-Hero Relatability',
        suggestedFirstFrameText: 'From $0 to automated cashflow 📈',
      },
      {
        id: 'hook-5',
        type: 'Data / Proof',
        hookText: `We tested 40 different methods for ${topic}. Only 1 had a 93% success rate. Here is the blueprint.`,
        viralityScore: 96,
        psychologicalTrigger: 'Empirical Proof & Certainty Bias',
        suggestedFirstFrameText: '93% SUCCESS RATE (Backed by data) 📊',
      },
    ];

    const shortScript: ScriptPack = {
      title: `The Ultimate Playbook for ${topic}`,
      targetPlatform: params.platform as any,
      estimatedDuration: '60s',
      pacingAdvice: 'Keep speech rate at 155-165 WPM. Cut out all pauses longer than 0.3 seconds. Start speaking on frame 1.',
      callToAction: 'Drop a comment "BLUEPRINT" below and I will send you the raw step-by-step checklist.',
      scenes: [
        {
          timestamp: '0:00 - 0:04',
          spokenWords: `Most people think ${topic} is hard. It's actually a 3-step formula you can execute by tonight.`,
          visualCue: 'Fast snap-zoom to face, holding phone or pointing at screen overlay.',
          screenOverlayText: 'THE 3-STEP FORMULA 🚀',
          soundFX: 'Subtle cinematic whoosh + pop',
        },
        {
          timestamp: '0:04 - 0:18',
          spokenWords: `Step one: Cut out the noise. In ${niche}, 90% of beginners fail because they build before they validate. Never write a single line or build a product until someone asks to buy the solution.`,
          visualCue: 'Screen recording showing an empty doc vs. an eager customer message.',
          screenOverlayText: 'STEP 1: Validate BEFORE Building',
          soundFX: 'Record scratch / vinyl stop',
        },
        {
          timestamp: '0:18 - 0:34',
          spokenWords: `Step two: Leverage micro-automation. Instead of manual busywork, use lean serverless tools to orchestrate everything. This lets one person do the work of a 5-person agency.`,
          visualCue: 'Speed-run screen recording of automated pipeline firing.',
          screenOverlayText: 'STEP 2: Micro-Automation Leverage ⚡',
          soundFX: 'Keyboard typing clicker sound FX',
        },
        {
          timestamp: '0:34 - 0:48',
          spokenWords: `Step three: Package it as a zero-friction offer. Price it with a clear ROI so saying yes is a complete no-brainer for your client or buyer.`,
          visualCue: 'Show stripe/payment notification chime or customer dashboard.',
          screenOverlayText: 'STEP 3: The Irresistible Offer 💰',
          soundFX: 'Cash register chime (subtle)',
        },
        {
          timestamp: '0:48 - 0:60',
          spokenWords: `I packaged the entire implementation framework with all templates. Comment "BLUEPRINT" and I will send the link directly to your inbox.`,
          visualCue: 'Hand gesture pointing down to comments, smiling confident delivery.',
          screenOverlayText: 'COMMENT "BLUEPRINT" BELOW 👇',
          soundFX: 'Rising chord transition',
        },
      ],
    };

    const carouselSlides: CarouselSlide[] = [
      {
        id: 'slide-1',
        slideNumber: 1,
        tagline: `${niche.toUpperCase()} • 2026 PLAYBOOK`,
        title: `How to Master ${topic} Without Burning Out`,
        body: `The exact 5-step framework used to automate high-ticket delivery and scale online revenue with zero bloat.`,
        highlightText: 'Swipe to steal the playbook →',
        swipeIndicator: true,
      },
      {
        id: 'slide-2',
        slideNumber: 2,
        tagline: 'PHASE 01: THE SHIFT',
        title: 'Stop Trading Hours For Dollars',
        body: 'The traditional linear model caps your income. Modern creators and engineers replace repetitive human labor with autonomous deterministic tools.',
        highlightText: 'Key: High leverage assets compound while you sleep.',
        swipeIndicator: true,
      },
      {
        id: 'slide-3',
        slideNumber: 3,
        tagline: 'PHASE 02: VALIDATION',
        title: 'Sell Before You Build',
        body: 'Never spend 3 weeks building something nobody asked for. Create a 1-page offer, reach out to 15 warm prospects, and validate willingness to pay.',
        highlightText: 'Rule: Cashflow validates ideas, not compliments.',
        swipeIndicator: true,
      },
      {
        id: 'slide-4',
        slideNumber: 4,
        tagline: 'PHASE 03: THE STACK',
        title: 'The Lean Zero-Cost Stack',
        body: 'You do not need $500/mo enterprise SaaS. A lightweight React frontend, Gemini API serverless backend, and automated payment links can generate $5k/mo.',
        highlightText: 'Efficiency beats budget every single time.',
        swipeIndicator: true,
      },
      {
        id: 'slide-5',
        slideNumber: 5,
        tagline: 'PHASE 04: DISTRIBUTION',
        title: 'Organic Viral Loops',
        body: 'Every digital asset you produce should carry your watermark and direct users back to your core offer. Turn every deliverable into a customer acquisition engine.',
        highlightText: 'Distribution > Product',
        swipeIndicator: true,
      },
      {
        id: 'slide-6',
        slideNumber: 6,
        tagline: 'NEXT ACTION',
        title: 'Ready to Launch Your System?',
        body: `Save this post for later. Share this with one person who needs to see it. Drop a comment with your biggest question below!`,
        highlightText: 'Follow @aanandswarup for weekly AI blueprints.',
        swipeIndicator: false,
      },
    ];

    return {
      topic,
      niche,
      hooks,
      shortScript,
      carouselSlides,
    };
  },
};
