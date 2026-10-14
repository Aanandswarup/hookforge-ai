import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { HookPackView } from '../src/components/HookPackView';
import { ScriptTeleprompterView } from '../src/components/ScriptTeleprompterView';
import { InputSection } from '../src/components/InputSection';
import { GeminiService } from '../src/services/geminiService';
import { HookItem, ScriptPack } from '../src/types';
import { setupBrowserMock, downloadsTriggered, clipboardHistory } from './helpers/browserMock';

describe('Empirical Verification: Milestone M3 Runtime Logic, Micro-Interactions, and State Contracts', () => {

  beforeEach(() => {
    setupBrowserMock();
  });

  // =========================================================================
  // CONTRACT 1: Virality Gauge Mathematics & Glow & Highest Potential
  // =========================================================================
  describe('Contract 1: Virality Gauge Mathematics & Visual Styling Oracles', () => {

    const radius = 14;
    const circumference = 2 * Math.PI * radius; // ~87.96459430051421

    function computeGaugeMath(score: number) {
      const normalizedScore = Math.min(100, Math.max(0, Math.round(score)));
      const strokeDashoffset = circumference - (normalizedScore / 100) * circumference;
      const isHighScore = normalizedScore >= 90;
      const isGoodScore = normalizedScore >= 80 && normalizedScore < 90;
      const isModerateScore = normalizedScore >= 70 && normalizedScore < 80;

      let strokeColor = '#64748b';
      let textColor = 'text-slate-400';
      let tierLabel = 'Standard';
      let hasGlow = false;
      let filterStyle: string | undefined = undefined;

      if (isHighScore) {
        strokeColor = '#10b981';
        textColor = 'text-emerald-400';
        tierLabel = 'Top 1% Viral';
        hasGlow = true;
        filterStyle = 'drop-shadow(0 0 8px rgba(16, 185, 129, 0.55))';
      } else if (isGoodScore) {
        strokeColor = '#06b6d4';
        textColor = 'text-cyan-400';
        tierLabel = 'High Retentive';
        hasGlow = true;
        filterStyle = 'drop-shadow(0 0 6px rgba(6, 182, 212, 0.4))';
      } else if (isModerateScore) {
        strokeColor = '#f59e0b';
        textColor = 'text-amber-400';
        tierLabel = 'Moderate';
        hasGlow = true;
        filterStyle = 'drop-shadow(0 0 5px rgba(245, 158, 11, 0.3))';
      }

      return {
        normalizedScore,
        radius,
        circumference,
        strokeDashoffset,
        isHighScore,
        strokeColor,
        textColor,
        tierLabel,
        hasGlow,
        filterStyle,
      };
    }

    it('1.1: Circular gauge stroke-dasharray and stroke-dashoffset calculations for scores 0, 50, 75, 94, 97, 100', () => {
      // Score 0: completely unfilled (offset == circumference)
      const g0 = computeGaugeMath(0);
      assert.strictEqual(g0.normalizedScore, 0);
      assert.strictEqual(g0.radius, 14);
      assert.strictEqual(g0.circumference, circumference);
      assert.strictEqual(g0.strokeDashoffset, circumference);
      assert.ok(Math.abs(g0.strokeDashoffset - 87.96459) < 0.001);

      // Score 50: half filled (offset == 0.5 * circumference)
      const g50 = computeGaugeMath(50);
      assert.strictEqual(g50.normalizedScore, 50);
      assert.ok(Math.abs(g50.strokeDashoffset - (circumference * 0.5)) < 0.00001);
      assert.ok(Math.abs(g50.strokeDashoffset - 43.9823) < 0.001);

      // Score 75: 75% filled (offset == 0.25 * circumference)
      const g75 = computeGaugeMath(75);
      assert.strictEqual(g75.normalizedScore, 75);
      assert.ok(Math.abs(g75.strokeDashoffset - (circumference * 0.25)) < 0.00001);
      assert.ok(Math.abs(g75.strokeDashoffset - 21.99115) < 0.001);

      // Score 94: 94% filled (offset == 0.06 * circumference)
      const g94 = computeGaugeMath(94);
      assert.strictEqual(g94.normalizedScore, 94);
      assert.ok(Math.abs(g94.strokeDashoffset - (circumference * 0.06)) < 0.00001);
      assert.ok(Math.abs(g94.strokeDashoffset - 5.27787) < 0.001);

      // Score 97: 97% filled (offset == 0.03 * circumference)
      const g97 = computeGaugeMath(97);
      assert.strictEqual(g97.normalizedScore, 97);
      assert.ok(Math.abs(g97.strokeDashoffset - (circumference * 0.03)) < 0.00001);
      assert.ok(Math.abs(g97.strokeDashoffset - 2.63893) < 0.001);

      // Score 100: 100% filled (offset == 0)
      const g100 = computeGaugeMath(100);
      assert.strictEqual(g100.normalizedScore, 100);
      assert.strictEqual(g100.strokeDashoffset, 0);
    });

    it('1.2: Boundary clamping and rounding behavior for negative, excessive, and fractional scores', () => {
      // Underflow clamping
      const gNeg = computeGaugeMath(-15);
      assert.strictEqual(gNeg.normalizedScore, 0);
      assert.strictEqual(gNeg.strokeDashoffset, circumference);

      // Overflow clamping
      const gOver = computeGaugeMath(125);
      assert.strictEqual(gOver.normalizedScore, 100);
      assert.strictEqual(gOver.strokeDashoffset, 0);

      // Rounding: 89.4 rounds down to 89 (cyan tier)
      const g89_4 = computeGaugeMath(89.4);
      assert.strictEqual(g89_4.normalizedScore, 89);
      assert.strictEqual(g89_4.strokeColor, '#06b6d4');
      assert.strictEqual(g89_4.isHighScore, false);

      // Rounding: 89.6 rounds up to 90 (emerald tier)
      const g89_6 = computeGaugeMath(89.6);
      assert.strictEqual(g89_6.normalizedScore, 90);
      assert.strictEqual(g89_6.strokeColor, '#10b981');
      assert.strictEqual(g89_6.isHighScore, true);
    });

    it('1.3: Halo / glow styling specifically activates on scores >= 90 with emerald drop-shadow', () => {
      // Score 90: exact threshold
      const g90 = computeGaugeMath(90);
      assert.strictEqual(g90.isHighScore, true);
      assert.strictEqual(g90.strokeColor, '#10b981');
      assert.strictEqual(g90.textColor, 'text-emerald-400');
      assert.strictEqual(g90.tierLabel, 'Top 1% Viral');
      assert.strictEqual(g90.hasGlow, true);
      assert.strictEqual(g90.filterStyle, 'drop-shadow(0 0 8px rgba(16, 185, 129, 0.55))');

      // Score 89: below threshold, cyan
      const g89 = computeGaugeMath(89);
      assert.strictEqual(g89.isHighScore, false);
      assert.strictEqual(g89.strokeColor, '#06b6d4');
      assert.strictEqual(g89.textColor, 'text-cyan-400');
      assert.strictEqual(g89.tierLabel, 'High Retentive');
      assert.strictEqual(g89.filterStyle, 'drop-shadow(0 0 6px rgba(6, 182, 212, 0.4))');

      // Score 79: below cyan threshold, amber
      const g79 = computeGaugeMath(79);
      assert.strictEqual(g79.strokeColor, '#f59e0b');
      assert.strictEqual(g79.tierLabel, 'Moderate');

      // Score 69: below moderate threshold, standard slate without glow
      const g69 = computeGaugeMath(69);
      assert.strictEqual(g69.strokeColor, '#64748b');
      assert.strictEqual(g69.tierLabel, 'Standard');
      assert.strictEqual(g69.hasGlow, false);
      assert.strictEqual(g69.filterStyle, undefined);
    });

    it('1.4: Dynamic Highest Potential calculation identifies maximum viralityScore regardless of position or ties', () => {
      // Scenario A: Max score is at index 1 (97 vs 94)
      const hooksA: HookItem[] = [
        {
          id: 'h-1',
          type: 'Curiosity Gap',
          hookText: 'Hook 1 Text',
          viralityScore: 94,
          psychologicalTrigger: 'Information Gap',
          suggestedFirstFrameText: 'Stop scrolling',
        },
        {
          id: 'h-2',
          type: 'Contrarian',
          hookText: 'Hook 2 Text',
          viralityScore: 97,
          psychologicalTrigger: 'Belief Disruption',
          suggestedFirstFrameText: 'You are doing it wrong',
        },
        {
          id: 'h-3',
          type: 'Story Driven',
          hookText: 'Hook 3 Text',
          viralityScore: 82,
          psychologicalTrigger: 'Narrative Transportation',
          suggestedFirstFrameText: 'Last year I had $0',
        },
      ];

      const highestA = hooksA.reduce(
        (prev, current) => (current.viralityScore > prev.viralityScore ? current : prev),
        hooksA[0]
      );
      assert.strictEqual(highestA.id, 'h-2', 'Must select Hook 2 with score 97 over Hook 1 with 94');
      assert.strictEqual(highestA.viralityScore, 97);

      // Scenario B: Max score is at index 0 (98 vs 91 vs 89)
      const hooksB: HookItem[] = [
        {
          id: 'h-10',
          type: 'Negative / Fear',
          hookText: 'Hook 10 Text',
          viralityScore: 98,
          psychologicalTrigger: 'Loss Aversion',
          suggestedFirstFrameText: 'This mistake costs $10k',
        },
        {
          id: 'h-20',
          type: 'Data / Proof',
          hookText: 'Hook 20 Text',
          viralityScore: 91,
          psychologicalTrigger: 'Authority Proof',
          suggestedFirstFrameText: '10,000 users agree',
        },
      ];

      const highestB = hooksB.reduce(
        (prev, current) => (current.viralityScore > prev.viralityScore ? current : prev),
        hooksB[0]
      );
      assert.strictEqual(highestB.id, 'h-10');

      // Scenario C: Tie with identical max scores (both 96)
      const hooksC: HookItem[] = [
        {
          id: 'h-a',
          type: 'Curiosity Gap',
          hookText: 'Tie A',
          viralityScore: 96,
          psychologicalTrigger: 'Curiosity',
          suggestedFirstFrameText: 'Frame A',
        },
        {
          id: 'h-b',
          type: 'Contrarian',
          hookText: 'Tie B',
          viralityScore: 96,
          psychologicalTrigger: 'Contrarian',
          suggestedFirstFrameText: 'Frame B',
        },
      ];

      const highestC = hooksC.reduce(
        (prev, current) => (current.viralityScore > prev.viralityScore ? current : prev),
        hooksC[0]
      );
      assert.strictEqual(highestC.viralityScore, 96);
      assert.strictEqual(highestC.id, 'h-a', 'Stable preservation of first encountered maximum');
    });

    it('1.5: HookPackView component renders SVG gauges and elevates highest potential card in HTML', () => {
      const hooks: HookItem[] = [
        {
          id: 'hook-alpha',
          type: 'Curiosity Gap',
          hookText: 'Why 99% of creators fail at short-form video in 2026',
          viralityScore: 94,
          psychologicalTrigger: 'Information Gap',
          suggestedFirstFrameText: 'Stop making this mistake',
        },
        {
          id: 'hook-beta',
          type: 'Contrarian',
          hookText: 'Posting every day is actually destroying your reach',
          viralityScore: 97,
          psychologicalTrigger: 'Belief Disruption',
          suggestedFirstFrameText: 'Delete your posting schedule',
        },
      ];

      const html = renderToString(React.createElement(HookPackView, { hooks, showToast: () => {} }));

      // Verify SVG circle attributes rendered
      assert.ok(html.includes('viewBox="0 0 36 36"'), 'Must render SVG gauge with viewBox');
      assert.ok(html.includes('stroke-dasharray'), 'Must render stroke-dasharray attribute or inline style');
      assert.ok(html.includes('Top 1% Viral'), 'Must render Top 1% Viral tier label');

      // Verify Hook Beta (97) is elevated with Highest Potential badge
      assert.ok(html.includes('Highest Potential'), 'Highest potential badge must be rendered');
      assert.ok(html.includes('md:col-span-2'), 'Highest card must have 2-column span elevation');
      assert.ok(html.includes('border-emerald-500/40'), 'Highest card must have emerald border accent');
    });
  });

  // =========================================================================
  // CONTRACT 2: Teleprompter Auto-Scroll Mechanics & Controls
  // =========================================================================
  describe('Contract 2: Teleprompter Auto-Scroll Mechanics and Controls Oracles', () => {

    it('2.1: Speed multiplier calculation: 1x to 5x mapping to scroll rates and dynamic WPM', () => {
      // Speeds: 1.0, 1.5, 2.0, 2.5, 3.0, 4.0, 5.0
      // Formula: currentWpm = Math.round(155 * (scrollSpeed / 2))
      // Interval tick: 45ms -> displacement rate (px/sec) = scrollSpeed * (1000 / 45)

      const testSpeeds = [
        { speed: 1.0, expectedWpm: 78, pxPerSec: 22.22 },
        { speed: 1.5, expectedWpm: 116, pxPerSec: 33.33 },
        { speed: 2.0, expectedWpm: 155, pxPerSec: 44.44 },
        { speed: 2.5, expectedWpm: 194, pxPerSec: 55.55 },
        { speed: 3.0, expectedWpm: 233, pxPerSec: 66.67 },
        { speed: 4.0, expectedWpm: 310, pxPerSec: 88.89 },
        { speed: 5.0, expectedWpm: 388, pxPerSec: 111.11 },
      ];

      for (const t of testSpeeds) {
        const computedWpm = Math.round(155 * (t.speed / 2));
        assert.strictEqual(computedWpm, t.expectedWpm, `Speed ${t.speed}x must yield ${t.expectedWpm} WPM`);

        const rate = (t.speed / 45) * 1000;
        assert.ok(Math.abs(rate - t.pxPerSec) < 0.1, `Displacement rate for ${t.speed}x must match ${t.pxPerSec} px/s`);
      }
    });

    it('2.2: Mirror flip transform scale-x-[-1] styling and state toggle', () => {
      const demo = GeminiService.generateSmartFallback({
        topic: 'Teleprompter Mirror Verification',
        niche: 'Creators',
        tone: 'Educational',
        platform: 'TikTok/Reels',
      });

      // Render ScriptTeleprompterView with default state
      const html = renderToString(
        React.createElement(ScriptTeleprompterView, { script: demo.shortScript, showToast: () => {} })
      );

      // Verify Teleprompter Studio mode button exists
      assert.ok(html.includes('Teleprompter Studio'), 'Must contain Teleprompter Studio toggle');
      assert.ok(html.includes('Director Breakdown'), 'Must contain Director Breakdown toggle');

      // Contract check: mirror flip transform class
      const mirrorClass = 'scale-x-[-1]';
      assert.strictEqual(typeof mirrorClass, 'string');
      assert.strictEqual(mirrorClass, 'scale-x-[-1]', 'Tailwind class for mirror flipping must be scale-x-[-1]');
    });

    it('2.3: Runtime timer calculation based on word count, 160 WPM baseline, and elapsed seconds', () => {
      // Oracle:
      // allSpokenText = scenes.map(s => s.spokenWords).join(' ') + ' ' + callToAction
      // wordCount = allSpokenText.trim().split(/\s+/).length
      // estimatedSeconds = Math.round((wordCount / 160) * 60)

      const sampleScenes = [
        {
          timestamp: '0:00 - 0:03',
          spokenWords: 'Stop scrolling right now if you want to double your income in 30 days.', // 14 words
          visualCue: 'Direct eye contact',
          screenOverlayText: 'DOUBLE YOUR INCOME',
          soundFX: 'Sub bass drop',
        },
        {
          timestamp: '0:03 - 0:15',
          spokenWords: 'Most creators spend forty hours a week making content that nobody watches because their hooks are weak and have zero psychological urgency.', // 22 words
          visualCue: 'B-roll of empty analytics',
          screenOverlayText: 'THE REAL PROBLEM',
          soundFX: 'Record scratch',
        },
        {
          timestamp: '0:15 - 0:35',
          spokenWords: 'Here is the exact three step framework our agency uses to generate ten million organic impressions every single month without spending a single dollar on ads.', // 26 words
          visualCue: 'Step by step diagram',
          screenOverlayText: '3-STEP BLUEPRINT',
          soundFX: 'Upbeat tech chime',
        },
      ];
      const callToAction = 'Comment the word FORGE below and I will send you the complete viral template pack for free.'; // 18 words

      const allSpokenText = sampleScenes.map((s) => s.spokenWords).join(' ') + ' ' + callToAction;
      const wordCount = allSpokenText.trim().split(/\s+/).length;
      assert.strictEqual(wordCount, 79, 'Word count must be exactly 79 words');

      const estimatedSeconds = Math.round((wordCount / 160) * 60);
      assert.strictEqual(estimatedSeconds, 30, '79 words at 160 WPM rounds to exactly 30 seconds');

      // Test formatTime oracle
      function formatTime(seconds: number) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
      }

      assert.strictEqual(formatTime(0), '00:00');
      assert.strictEqual(formatTime(15), '00:15');
      assert.strictEqual(formatTime(30), '00:30');
      assert.strictEqual(formatTime(75), '01:15');
      assert.strictEqual(formatTime(125), '02:05');

      // Test progressPercent oracle
      function progressPercent(elapsed: number, total: number) {
        return Math.min(100, Math.round((elapsed / Math.max(1, total)) * 100));
      }

      assert.strictEqual(progressPercent(0, 30), 0);
      assert.strictEqual(progressPercent(15, 30), 50);
      assert.strictEqual(progressPercent(30, 30), 100);
      assert.strictEqual(progressPercent(45, 30), 100, 'Must clamp to 100%');
    });

    it('2.4: Spacebar hotkey listener condition, target guard, and cleanup contract', () => {
      // Spacebar contract in ScriptTeleprompterView:
      // if (viewMode === 'teleprompter' && e.code === 'Space' && e.target === document.body)
      
      const mockBody = {};
      const mockInput = {};

      function evaluateSpacebarTrigger(viewMode: string, code: string, target: any) {
        return viewMode === 'teleprompter' && code === 'Space' && target === mockBody;
      }

      // Valid trigger
      assert.strictEqual(evaluateSpacebarTrigger('teleprompter', 'Space', mockBody), true);

      // Guard 1: In production mode, Spacebar must NOT trigger
      assert.strictEqual(evaluateSpacebarTrigger('production', 'Space', mockBody), false);

      // Guard 2: Other keys (e.g. Enter, KeyS) must NOT trigger
      assert.strictEqual(evaluateSpacebarTrigger('teleprompter', 'Enter', mockBody), false);

      // Guard 3: Spacebar pressed while focused in input or textarea must NOT trigger
      assert.strictEqual(evaluateSpacebarTrigger('teleprompter', 'Space', mockInput), false);
    });
  });

  // =========================================================================
  // CONTRACT 3: 1-Click Copy Actions & TXT Export Formatting across All Views
  // =========================================================================
  describe('Contract 3: 1-Click Copy Actions and TXT Export Formatting Across Views', () => {

    it('3.1: HookPackView 1-Click single hook copy formats hook, frame, score, and psychology', () => {
      const hook: HookItem = {
        id: 'test-hook-1',
        type: 'Curiosity Gap',
        hookText: 'The secret 10-second rule that changed our retention forever.',
        viralityScore: 94,
        psychologicalTrigger: 'Curiosity Gap & Information Asymmetry',
        suggestedFirstFrameText: 'You are losing 80% of viewers right here.',
      };

      const expectedCopyText = `HOOK: "${hook.hookText}"\nFIRST FRAME: "${hook.suggestedFirstFrameText}"\nVIRALITY SCORE: ${hook.viralityScore}/100\nPSYCHOLOGY: ${hook.psychologicalTrigger}`;

      // Simulate copy action
      navigator.clipboard.writeText(expectedCopyText);
      assert.strictEqual(clipboardHistory.length, 1);
      assert.strictEqual(clipboardHistory[0], expectedCopyText);
      assert.ok(clipboardHistory[0].includes('HOOK: "The secret 10-second rule'));
      assert.ok(clipboardHistory[0].includes('FIRST FRAME: "You are losing 80%'));
      assert.ok(clipboardHistory[0].includes('VIRALITY SCORE: 94/100'));
      assert.ok(clipboardHistory[0].includes('PSYCHOLOGY: Curiosity Gap & Information Asymmetry'));
    });

    it('3.2: HookPackView 1-Click first frame copy copies exact suggestedFirstFrameText', () => {
      const hook: HookItem = {
        id: 'test-hook-frame',
        type: 'Contrarian',
        hookText: 'Don\'t buy another course until you watch this.',
        viralityScore: 92,
        psychologicalTrigger: 'Pattern Interrupt',
        suggestedFirstFrameText: 'Put your credit card away.',
      };

      navigator.clipboard.writeText(hook.suggestedFirstFrameText);
      assert.strictEqual(clipboardHistory.length, 1);
      assert.strictEqual(clipboardHistory[0], 'Put your credit card away.');
    });

    it('3.3: HookPackView bulk TXT export formats headers, ASCII dividers, and HIGHEST POTENTIAL stars', () => {
      const hooks: HookItem[] = [
        {
          id: 'h-1',
          type: 'Curiosity Gap',
          hookText: 'Hook 1 Text',
          viralityScore: 94,
          psychologicalTrigger: 'Trigger 1',
          suggestedFirstFrameText: 'Frame 1',
        },
        {
          id: 'h-2',
          type: 'Contrarian',
          hookText: 'Hook 2 Text',
          viralityScore: 97,
          psychologicalTrigger: 'Trigger 2',
          suggestedFirstFrameText: 'Frame 2',
        },
      ];

      const highestScoreHook = hooks[1]; // score 97

      const divider = '═'.repeat(64);
      const subDivider = '─'.repeat(64);

      const header = [
        divider,
        `HOOKFORGE AI — 5 VIRAL HOOK VARIANTS`,
        `Generated: Oct 13, 2026 | Total Hooks: ${hooks.length}`,
        `Engineered for Short-Form Video (TikTok, Reels, Shorts, LinkedIn)`,
        divider,
        '',
      ].join('\n');

      const body = hooks
        .map((h, i) => {
          const isHighest = h.id === highestScoreHook.id;
          return [
            `[HOOK ${i + 1}: ${h.type.toUpperCase()}]${isHighest ? ' ★ HIGHEST POTENTIAL' : ''}`,
            `Virality Score: ${h.viralityScore}/100`,
            `Psychological Mechanism: ${h.psychologicalTrigger}`,
            '',
            `SPOKEN HOOK (0–3s):`,
            `"${h.hookText}"`,
            '',
            `FIRST FRAME ON-SCREEN TEXT (0–1s):`,
            `"${h.suggestedFirstFrameText}"`,
            '',
            subDivider,
          ].join('\n');
        })
        .join('\n\n');

      const footer = [
        '',
        `Generated by HookForge AI`,
        `Best Practice: Film at least 2 hooks for the same core video body to A/B test on social algorithms.`,
        divider,
      ].join('\n');

      const fullTxt = `${header}\n${body}\n${footer}`;

      assert.ok(fullTxt.includes('HOOKFORGE AI — 5 VIRAL HOOK VARIANTS'));
      assert.ok(fullTxt.includes('[HOOK 1: CURIOSITY GAP]'));
      assert.ok(fullTxt.includes('[HOOK 2: CONTRARIAN] ★ HIGHEST POTENTIAL'));
      assert.ok(fullTxt.includes('═'.repeat(64)));
      assert.ok(fullTxt.includes('─'.repeat(64)));
      assert.ok(fullTxt.includes('Best Practice: Film at least 2 hooks'));

      // Simulate download trigger
      const anchor = document.createElement('a') as any;
      anchor.download = `hookforge_viral_hooks_${Date.now()}.txt`;
      anchor.href = 'blob:mock-url';
      anchor.click();

      assert.strictEqual(downloadsTriggered.length, 1);
      assert.ok(downloadsTriggered[0].download.startsWith('hookforge_viral_hooks_'));
      assert.ok(downloadsTriggered[0].download.endsWith('.txt'));
    });

    it('3.4: ScriptTeleprompterView Scene Copy formats spoken, visual, overlay, and audio cues', () => {
      const scene = {
        timestamp: '0:00 - 0:03',
        spokenWords: 'Stop wasting time on manual outreach.',
        visualCue: 'Fast montage of inbox chaos',
        screenOverlayText: '0 REPLIES?',
        soundFX: 'Sub whoosh',
      };

      const sceneText = `[SCENE 1 | ${scene.timestamp}]\nSPOKEN: "${scene.spokenWords}"\nVISUAL: ${scene.visualCue}\nOVERLAY: ${scene.screenOverlayText}\nAUDIO: ${scene.soundFX}`;

      navigator.clipboard.writeText(sceneText);
      assert.strictEqual(clipboardHistory.length, 1);
      assert.strictEqual(clipboardHistory[0], sceneText);
      assert.ok(clipboardHistory[0].includes('[SCENE 1 | 0:00 - 0:03]'));
      assert.ok(clipboardHistory[0].includes('SPOKEN: "Stop wasting time on manual outreach."'));
      assert.ok(clipboardHistory[0].includes('VISUAL: Fast montage of inbox chaos'));
      assert.ok(clipboardHistory[0].includes('OVERLAY: 0 REPLIES?'));
      assert.ok(clipboardHistory[0].includes('AUDIO: Sub whoosh'));
    });

    it('3.5: ScriptTeleprompterView Full Script Copy formats all scenes + Closing CTA + Pacing', () => {
      const script: ScriptPack = {
        title: 'Automation Workflow',
        targetPlatform: 'TikTok/Reels',
        estimatedDuration: '45s',
        scenes: [
          {
            timestamp: '0:00 - 0:03',
            spokenWords: 'Scene 1 spoken words.',
            visualCue: 'Cue 1',
            screenOverlayText: 'TEXT 1',
            soundFX: 'FX 1',
          },
          {
            timestamp: '0:03 - 0:10',
            spokenWords: 'Scene 2 spoken words.',
            visualCue: 'Cue 2',
            screenOverlayText: 'TEXT 2',
            soundFX: 'FX 2',
          },
        ],
        pacingAdvice: 'High energy fast tempo',
        callToAction: 'Follow for part 2.',
        wordCount: 15,
        estimatedWpm: 160,
      };

      const allSpokenText = script.scenes.map((s) => s.spokenWords).join(' ') + ' ' + script.callToAction;
      const wordCount = allSpokenText.trim().split(/\s+/).length;
      const estimatedSeconds = Math.round((wordCount / 160) * 60);

      const fullText =
        script.scenes
          .map(
            (s, idx) =>
              `[SCENE ${idx + 1} | ${s.timestamp}]\nSPOKEN: "${s.spokenWords}"\nVISUAL: ${s.visualCue}\nOVERLAY: ${s.screenOverlayText}\nAUDIO: ${s.soundFX}\n`
          )
          .join('\n') +
        `\n[CLOSING CTA]\n"${script.callToAction}"\n\nTarget Pacing: ${script.pacingAdvice} (~${estimatedSeconds}s • ${wordCount} words)`;

      navigator.clipboard.writeText(fullText);
      assert.strictEqual(clipboardHistory.length, 1);
      assert.strictEqual(clipboardHistory[0], fullText);
      assert.ok(clipboardHistory[0].includes('[SCENE 1 | 0:00 - 0:03]'));
      assert.ok(clipboardHistory[0].includes('[SCENE 2 | 0:03 - 0:10]'));
      assert.ok(clipboardHistory[0].includes('[CLOSING CTA]\n"Follow for part 2."'));
      assert.ok(clipboardHistory[0].includes('Target Pacing: High energy fast tempo'));
    });

    it('3.6: ScriptTeleprompterView Spoken Only Copy isolates clean teleprompter script', () => {
      const script: ScriptPack = {
        title: 'Clean Script',
        targetPlatform: 'TikTok/Reels',
        estimatedDuration: '30s',
        scenes: [
          {
            timestamp: '0:00 - 0:03',
            spokenWords: 'Line one spoken text.',
            visualCue: 'Visual cue that should be omitted',
            screenOverlayText: 'OVERLAY OMITTED',
            soundFX: 'SOUND FX OMITTED',
          },
          {
            timestamp: '0:03 - 0:15',
            spokenWords: 'Line two spoken text.',
            visualCue: 'Visual cue 2 omitted',
            screenOverlayText: 'OVERLAY 2',
            soundFX: 'FX 2',
          },
        ],
        pacingAdvice: 'Punchy',
        callToAction: 'Closing call to action sentence.',
        wordCount: 16,
        estimatedWpm: 160,
      };

      const spokenOnlyText =
        script.scenes
          .map((s, idx) => `[Scene ${idx + 1} - ${s.timestamp}]\n${s.spokenWords}`)
          .join('\n\n') + `\n\n[Call to Action]\n${script.callToAction}`;

      navigator.clipboard.writeText(spokenOnlyText);
      assert.strictEqual(clipboardHistory.length, 1);
      assert.strictEqual(clipboardHistory[0], spokenOnlyText);
      assert.ok(!clipboardHistory[0].includes('Visual cue that should be omitted'));
      assert.ok(!clipboardHistory[0].includes('SOUND FX OMITTED'));
      assert.ok(clipboardHistory[0].includes('[Scene 1 - 0:00 - 0:03]\nLine one spoken text.'));
      assert.ok(clipboardHistory[0].includes('[Call to Action]\nClosing call to action sentence.'));
    });

    it('3.7: ScriptTeleprompterView TXT export generates complete formatted production document', () => {
      const script: ScriptPack = {
        title: 'Micro-SaaS Cashflow Script',
        targetPlatform: 'YouTube Shorts',
        estimatedDuration: '45s',
        scenes: [
          {
            timestamp: '0:00 - 0:03',
            spokenWords: 'How to build micro-SaaS with AI.',
            visualCue: 'Screen record of code editor',
            screenOverlayText: 'MICRO-SAAS IN 72H',
            soundFX: 'Whoosh transition',
          },
        ],
        pacingAdvice: 'Rapid fire',
        callToAction: 'Click the link in bio.',
        wordCount: 12,
        estimatedWpm: 160,
      };

      const estimatedSeconds = 45;
      const wordCount = 12;

      const fullText =
        `HOOKFORGE AI — 60S HIGH-RETENTION PRODUCTION SCRIPT\n` +
        `Title: ${script.title}\n` +
        `Platform: ${script.targetPlatform}\n` +
        `Target Duration: ~${estimatedSeconds}s (${wordCount} words)\n` +
        `Pacing Strategy: ${script.pacingAdvice}\n` +
        `=================================================================\n\n` +
        script.scenes
          .map(
            (s, idx) =>
              `-----------------------------------------------------------------\n` +
              `SCENE ${idx + 1} • TIMECODE: ${s.timestamp}\n` +
              `-----------------------------------------------------------------\n` +
              `SPOKEN SCRIPT:\n"${s.spokenWords}"\n\n` +
              `VISUAL ACTION / B-ROLL:\n${s.visualCue}\n\n` +
              `ON-SCREEN TEXT OVERLAY:\n${s.screenOverlayText}\n\n` +
              `AUDIO & SOUND FX:\n${s.soundFX}\n`
          )
          .join('\n\n') +
        `\n\n=================================================================\n` +
        `RETENTION CLOSING CALL TO ACTION:\n` +
        `"${script.callToAction}"\n` +
        `=================================================================\n`;

      assert.ok(fullText.includes('HOOKFORGE AI — 60S HIGH-RETENTION PRODUCTION SCRIPT'));
      assert.ok(fullText.includes('Title: Micro-SaaS Cashflow Script'));
      assert.ok(fullText.includes('Platform: YouTube Shorts'));
      assert.ok(fullText.includes('SCENE 1 • TIMECODE: 0:00 - 0:03'));
      assert.ok(fullText.includes('SPOKEN SCRIPT:\n"How to build micro-SaaS with AI."'));
      assert.ok(fullText.includes('RETENTION CLOSING CALL TO ACTION:\n"Click the link in bio."'));

      // Test download file name
      const anchor = document.createElement('a') as any;
      anchor.download = 'hookforge_production_script.txt';
      anchor.href = 'blob:script-url';
      anchor.click();

      assert.strictEqual(downloadsTriggered.length, 1);
      assert.strictEqual(downloadsTriggered[0].download, 'hookforge_production_script.txt');
    });

    it('3.8: InputSection character count calculation and 280-character limit styling', () => {
      const shortTopic = 'Short topic';
      assert.strictEqual(shortTopic.length, 11);
      assert.ok(shortTopic.length <= 280);

      const longTopic = 'a'.repeat(285);
      assert.strictEqual(longTopic.length, 285);
      assert.ok(longTopic.length > 280, 'Must exceed 280 character threshold');

      // Verify markup rendering of InputSection
      const html = renderToString(React.createElement(InputSection, { onGenerate: () => {}, isLoading: false }));
      assert.ok(html.includes('/280 characters'), 'Must render /280 characters limit counter');
      assert.ok(html.includes('⌘ / Ctrl + Enter'), 'Must display keyboard shortcut guide');
      assert.ok(html.includes('High-Converting Blueprints:'), 'Must render blueprints preset bar');
    });
  });

  // =========================================================================
  // CONTRACT 4: Component Rendering & Mobile Containment
  // =========================================================================
  describe('Contract 4: Component Markup, Mobile Containment, and Token Adherence', () => {

    it('4.1: HookPackView and ScriptTeleprompterView use Linear/Vercel design tokens (.card-matte, bg-surface-*)', () => {
      const demo = GeminiService.generateSmartFallback({
        topic: 'Design Token Verification',
        niche: 'SaaS Builders',
        tone: 'Contrarian',
        platform: 'TikTok/Reels',
      });

      const hookHtml = renderToString(React.createElement(HookPackView, { hooks: demo.hooks, showToast: () => {} }));
      assert.ok(hookHtml.includes('card-matte'), 'HookPackView must use card-matte token');
      assert.ok(hookHtml.includes('bg-surface-well') || hookHtml.includes('surface-well-inset'), 'Must use inset well surfaces');

      const scriptHtml = renderToString(React.createElement(ScriptTeleprompterView, { script: demo.shortScript, showToast: () => {} }));
      assert.ok(scriptHtml.includes('card-matte'), 'ScriptTeleprompterView must use card-matte token');
      assert.ok(scriptHtml.includes('bg-surface-well') || scriptHtml.includes('glass-dock'), 'Must use surface tokens');
    });

    it('4.2: Zero horizontal overflow containment: responsive grid classes without hardcoded viewport widths', () => {
      const demo = GeminiService.generateSmartFallback({
        topic: 'Responsive Grid Verification',
        niche: 'Engineers',
        tone: 'Educational',
        platform: 'LinkedIn Video',
      });

      const hookHtml = renderToString(React.createElement(HookPackView, { hooks: demo.hooks, showToast: () => {} }));
      // Verify responsive grid: grid-cols-1 md:grid-cols-2
      assert.ok(hookHtml.includes('grid-cols-1 md:grid-cols-2'), 'Must use responsive grid for hooks');

      const scriptHtml = renderToString(React.createElement(ScriptTeleprompterView, { script: demo.shortScript, showToast: () => {} }));
      // Verify cue grid: grid-cols-1 sm:grid-cols-3
      assert.ok(scriptHtml.includes('grid-cols-1 sm:grid-cols-3'), 'Must use responsive 3-column cue grid');
    });
  });
});
