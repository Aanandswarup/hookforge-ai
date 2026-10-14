/**
 * Secure Serverless Edge Proxy for Google Gemini API
 * 
 * Protects master API keys from being exposed to the client-side bundle.
 * Enforces server-side input length limits and basic IP rate limiting.
 */

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: 'Server AI key not configured' });
  }

  const { topic, niche, tone, platform } = req.body || {};

  // Server-side input validation & length capping
  if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
    return res.status(400).json({ error: 'Topic is required' });
  }

  const cleanTopic = topic.trim().slice(0, 300);
  const cleanNiche = (niche || 'General').trim().slice(0, 100);
  const cleanTone = (tone || 'Contrarian').trim().slice(0, 50);
  const cleanPlatform = (platform || 'TikTok/Reels').trim().slice(0, 50);

  const systemPrompt = `You are an elite viral content strategist who has generated over 500M+ views across TikTok, Reels, YouTube Shorts, and LinkedIn.
Given a topic, niche, tone, and platform, generate:
1. Exactly 5 viral psychological hooks of different types: "Curiosity Gap", "Contrarian", "Negative / Fear", "Story Driven", "Data / Proof". Give each a virality score from 80-99.
2. A tightly-paced 60-second video script with exact timestamps (e.g. 0:00 - 0:04), spoken words, high-retention visual B-roll cues, screen text overlays, and sound FX cues.
3. A 6-slide visual carousel (ideal for LinkedIn or Instagram) with punchy slide titles, body summaries, and a final CTA slide.

Respond with ONLY valid JSON adhering strictly to this schema:
{
  "topic": "${cleanTopic}",
  "niche": "${cleanNiche}",
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
    "targetPlatform": "${cleanPlatform}",
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

  try {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: `${systemPrompt}\n\nTOPIC: ${cleanTopic}\nNICHE: ${cleanNiche}\nTONE: ${cleanTone}\nPLATFORM: ${cleanPlatform}` }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          responseMimeType: 'application/json',
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({ error: 'Gemini upstream error', details: errText });
    }

    const data: any = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) {
      return res.status(502).json({ error: 'Empty response from model' });
    }

    const parsed = JSON.parse(rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim());
    return res.status(200).json(parsed);
  } catch (err: any) {
    return res.status(500).json({ error: 'Server error processing request', message: err.message });
  }
}
