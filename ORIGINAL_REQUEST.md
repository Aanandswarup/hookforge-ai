# Original User Request

## 2026-10-13T13:48:52Z

Execute a comprehensive, world-class frontend redesign of HookForge AI in the Linear/Vercel ultra-dark aesthetic—elevating it from a functional utility to an elite, visually stunning, high-converting Micro-SaaS.

Working directory: C:\Users\hp\.gemini\antigravity\scratch\hookforge-ai
Integrity mode: development

## Requirements

### R1. Linear / Vercel Ultra-Dark Design System & Layout Overhaul
Redesign the entire application visual system to match top-tier developer/creator tools (Linear, Raycast, Vercel):
- Matte dark surfaces (`#090d16` base, `#0d131f` card surfaces, subtle 1px border lines `#1e293b`).
- Micro-typography hierarchy using crisp fonts, refined badge pills, and balanced whitespace.
- Ambient backdrop lighting, subtle glassmorphism cards, and interactive hover states.

### R2. High-End Studio Workspace (Bento-Grid Architecture)
Restructure the generation output and canvas editor into an immersive, modular workspace:
- Sleek studio canvas container with realistic device/card frame shadows and floating toolbars.
- Refined theme picker with interactive glowing swatch pills.
- Seamless, intuitive slide controls (Add, Duplicate, Delete, Reorder) and aspect-ratio toggles.

### R3. Micro-Interactions, Polish & Motion
- Smooth animated tab transitions and collapsible drawers.
- Interactive virality progress gauges with subtle glow on high scores.
- Non-blocking floating toast notifications and celebratory export effects.

### R4. Zero-Regression Technical Rigor
- Maintain 100% functionality of all underlying services: Gemini API calls, HTML5 Canvas rendering (1080×1350, 1080×1080, 1080×1920), PDF/PNG export, credit tracking, and BYOK settings.
- Maintain zero TypeScript errors and a clean `npm run build` production bundle under 12 seconds.

## Acceptance Criteria

### Visual & Architectural Verification
- [ ] Application visual aesthetic matches modern Linear/Vercel design patterns (no basic flat cards or unstyled controls).
- [ ] Headline, buttons, tabs, and canvas controls exhibit cohesive contrast and subtle glowing states.
- [ ] Full responsiveness across mobile (375px+), tablet, and desktop viewports with zero horizontal scroll bleed.

### Functional & Automated Verification
- [ ] `npm run build` executes with exit code 0 and zero TypeScript or linting errors.
- [ ] All 3 tabs (5 Viral Hooks, In-Browser Carousel Studio, 60s Script/Teleprompter) operate cleanly with real-time text updates.
- [ ] In-browser Canvas PNG and multi-page PDF exports download successfully without distortion.
