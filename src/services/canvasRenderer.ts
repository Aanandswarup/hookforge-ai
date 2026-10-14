import { CarouselSlide, CarouselTheme, CarouselAspectRatio, CanvasCustomization } from '../types';
import jsPDF from 'jspdf';

export interface ThemeConfig {
  name: string;
  background: string;
  cardBg?: string;
  primaryText: string;
  secondaryText: string;
  accentColor: string;
  tagBg: string;
  tagText: string;
  borderColor: string;
  highlightBoxBg: string;
}

export const THEMES: Record<CarouselTheme, ThemeConfig> = {
  'dark-minimal': {
    name: 'Dark Minimal',
    background: '#0a0e17',
    cardBg: '#111827',
    primaryText: '#f8fafc',
    secondaryText: '#94a3b8',
    accentColor: '#10b981', // emerald
    tagBg: '#064e3b',
    tagText: '#34d399',
    borderColor: '#1e293b',
    highlightBoxBg: '#0f172a',
  },
  'bold-gradient': {
    name: 'Cyber Violet',
    background: '#0f0c20',
    cardBg: '#1a1438',
    primaryText: '#ffffff',
    secondaryText: '#cbd5e1',
    accentColor: '#8b5cf6', // violet
    tagBg: '#4c1d95',
    tagText: '#c4b5fd',
    borderColor: '#2e1065',
    highlightBoxBg: '#1f1345',
  },
  'editorial': {
    name: 'Editorial Luxe',
    background: '#09090b',
    cardBg: '#18181b',
    primaryText: '#fafafa',
    secondaryText: '#a1a1aa',
    accentColor: '#f59e0b', // amber gold
    tagBg: '#451a03',
    tagText: '#fcd34d',
    borderColor: '#27272a',
    highlightBoxBg: '#1c1917',
  },
  'neon-hacker': {
    name: 'Neon Terminal',
    background: '#040d12',
    cardBg: '#081c15',
    primaryText: '#ecfdf5',
    secondaryText: '#6ee7b7',
    accentColor: '#22c55e', // electric green
    tagBg: '#14532d',
    tagText: '#86efac',
    borderColor: '#166534',
    highlightBoxBg: '#062e1a',
  },
  'sunset-glow': {
    name: 'Sunset Rose',
    background: '#190a0d',
    cardBg: '#2a1117',
    primaryText: '#fff1f2',
    secondaryText: '#fecdd3',
    accentColor: '#f43f5e', // rose coral
    tagBg: '#881337',
    tagText: '#fda4af',
    borderColor: '#4c0519',
    highlightBoxBg: '#360d15',
  },
};

export const ASPECT_RATIOS: Record<CarouselAspectRatio, { width: number; height: number; label: string }> = {
  '4:5': { width: 1080, height: 1350, label: '4:5 Portrait (LinkedIn / IG)' },
  '1:1': { width: 1080, height: 1080, label: '1:1 Square (Twitter / Feeds)' },
  '9:16': { width: 1080, height: 1920, label: '9:16 Story (Reels / TikTok)' },
};

export const CanvasRenderer = {
  getDimensions(aspectRatio: CarouselAspectRatio = '4:5') {
    return ASPECT_RATIOS[aspectRatio] || ASPECT_RATIOS['4:5'];
  },

  renderSlideToCanvas(
    canvas: HTMLCanvasElement,
    slide: CarouselSlide,
    totalSlides: number,
    custom: CanvasCustomization,
    isPro: boolean = false
  ): void {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width: WIDTH, height: HEIGHT } = this.getDimensions(custom.aspectRatio);
    canvas.width = WIDTH;
    canvas.height = HEIGHT;

    const theme = THEMES[custom.theme] || THEMES['dark-minimal'];

    // 1. Draw Background
    ctx.fillStyle = theme.background;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    // Background Pattern
    if (custom.bgPattern === 'mesh') {
      const radialGrad = ctx.createRadialGradient(WIDTH * 0.8, HEIGHT * 0.2, 50, WIDTH * 0.8, HEIGHT * 0.2, WIDTH * 0.7);
      radialGrad.addColorStop(0, `${theme.accentColor}30`);
      radialGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = radialGrad;
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      const bottomGlow = ctx.createRadialGradient(WIDTH * 0.2, HEIGHT * 0.8, 40, WIDTH * 0.2, HEIGHT * 0.8, WIDTH * 0.6);
      bottomGlow.addColorStop(0, `${theme.accentColor}15`);
      bottomGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = bottomGlow;
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
    } else if (custom.bgPattern === 'grid') {
      ctx.save();
      ctx.strokeStyle = `${theme.borderColor}55`;
      ctx.lineWidth = 1;
      const gridSize = 60;
      for (let x = 0; x < WIDTH; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, HEIGHT);
        ctx.stroke();
      }
      for (let y = 0; y < HEIGHT; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(WIDTH, y);
        ctx.stroke();
      }
      ctx.restore();
    }

    // Top Accent Bar
    ctx.fillStyle = theme.accentColor;
    ctx.fillRect(0, 0, WIDTH, 10);

    // Font Family Selection
    let titleFontFamily = 'Inter, sans-serif';
    let bodyFontFamily = 'Inter, sans-serif';
    if (custom.fontStyle === 'editorial') {
      titleFontFamily = 'Georgia, "Playfair Display", serif';
      bodyFontFamily = 'Inter, sans-serif';
    } else if (custom.fontStyle === 'mono') {
      titleFontFamily = '"JetBrains Mono", monospace';
      bodyFontFamily = '"JetBrains Mono", monospace';
    }

    // Font Size Multipliers
    let titleSize = 64;
    let titleLineHeight = 84;
    let bodySize = 36;
    let bodyLineHeight = 56;

    if (custom.fontSizeScale === 'compact') {
      titleSize = 52;
      titleLineHeight = 70;
      bodySize = 30;
      bodyLineHeight = 48;
    } else if (custom.fontSizeScale === 'large') {
      titleSize = 72;
      titleLineHeight = 94;
      bodySize = 40;
      bodyLineHeight = 62;
    }

    // 2. Header Section
    const paddingX = Math.round(WIDTH * 0.08); // 8% responsive padding
    let currentY = Math.round(HEIGHT * 0.08);

    // Tagline Pill
    ctx.save();
    ctx.font = `bold 24px ${custom.fontStyle === 'mono' ? '"JetBrains Mono", monospace' : 'Inter, sans-serif'}`;
    const tagText = (slide.tagline || 'FRAMEWORK').toUpperCase();
    const tagMetrics = ctx.measureText(tagText);
    const tagWidth = tagMetrics.width + 36;
    const tagHeight = 46;

    ctx.fillStyle = theme.tagBg;
    this.roundRect(ctx, paddingX, currentY, tagWidth, tagHeight, 23);
    ctx.fill();

    ctx.fillStyle = theme.tagText;
    ctx.fillText(tagText, paddingX + 18, currentY + 31);
    ctx.restore();

    // Slide Counter Pill
    ctx.save();
    ctx.font = 'bold 26px "JetBrains Mono", monospace';
    ctx.fillStyle = theme.secondaryText;
    const counterText = `${String(slide.slideNumber).padStart(2, '0')} / ${String(totalSlides).padStart(2, '0')}`;
    const counterWidth = ctx.measureText(counterText).width;
    ctx.fillText(counterText, WIDTH - paddingX - counterWidth, currentY + 33);
    ctx.restore();

    // 3. Slide Title
    currentY += Math.round(HEIGHT * 0.1);
    ctx.save();
    ctx.fillStyle = theme.primaryText;
    ctx.font = `bold ${titleSize}px ${titleFontFamily}`;
    ctx.textAlign = custom.textAlign;

    const textTargetX = custom.textAlign === 'center' ? WIDTH / 2 : paddingX;
    const maxWidth = WIDTH - paddingX * 2;

    currentY = this.wrapText(ctx, slide.title, textTargetX, currentY, maxWidth, titleLineHeight, custom.textAlign);
    ctx.restore();

    // Divider Line
    currentY += 36;
    ctx.save();
    ctx.strokeStyle = theme.borderColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(paddingX, currentY);
    ctx.lineTo(WIDTH - paddingX, currentY);
    ctx.stroke();
    ctx.restore();

    // 4. Body Text
    currentY += 50;
    ctx.save();
    ctx.fillStyle = theme.secondaryText;
    ctx.font = `400 ${bodySize}px ${bodyFontFamily}`;
    ctx.textAlign = custom.textAlign;
    currentY = this.wrapText(ctx, slide.body, textTargetX, currentY, maxWidth, bodyLineHeight, custom.textAlign);
    ctx.restore();

    // 5. Highlight Callout Box (if present)
    if (slide.highlightText) {
      currentY += 46;
      const boxPadding = 32;
      ctx.save();
      ctx.font = `600 32px ${bodyFontFamily}`;

      const tempLines = this.getWrappedLines(ctx, slide.highlightText, maxWidth - boxPadding * 2);
      const boxHeight = tempLines.length * 48 + boxPadding * 2;

      // Ensure box fits on screen
      if (currentY + boxHeight < HEIGHT - 110) {
        ctx.fillStyle = theme.highlightBoxBg;
        this.roundRect(ctx, paddingX, currentY, maxWidth, boxHeight, 18);
        ctx.fill();

        ctx.strokeStyle = theme.borderColor;
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = theme.accentColor;
        this.roundRect(ctx, paddingX, currentY, 8, boxHeight, 4);
        ctx.fill();

        ctx.fillStyle = theme.accentColor;
        let boxTextY = currentY + boxPadding + 32;
        for (const line of tempLines) {
          ctx.fillText(line, paddingX + boxPadding + 14, boxTextY);
          boxTextY += 48;
        }
      }
      ctx.restore();
    }

    // 6. Footer (Swipe Indicator & Watermark)
    const footerY = HEIGHT - Math.round(HEIGHT * 0.05);

    if (slide.swipeIndicator) {
      ctx.save();
      ctx.font = 'bold 26px Inter, sans-serif';
      ctx.fillStyle = theme.accentColor;
      const swipeText = 'SWIPE →';
      const swipeWidth = ctx.measureText(swipeText).width;
      ctx.fillText(swipeText, WIDTH - paddingX - swipeWidth, footerY);
      ctx.restore();
    }

    ctx.save();
    ctx.font = '500 22px Inter, sans-serif';
    if (!isPro) {
      ctx.fillStyle = `${theme.secondaryText}99`;
      ctx.fillText('⚡ Created with HookForge AI', paddingX, footerY);
    } else {
      ctx.fillStyle = `${theme.accentColor}cc`;
      ctx.fillText('✦ HookForge Pro Studio', paddingX, footerY);
    }
    ctx.restore();
  },

  wrapText(
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number,
    align: 'left' | 'center' = 'left'
  ): number {
    const lines = this.getWrappedLines(ctx, text, maxWidth);
    for (const line of lines) {
      ctx.fillText(line, x, y);
      y += lineHeight;
    }
    return y;
  },

  getWrappedLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
    if (!text) return [];
    const paragraphs = text.split(/\r?\n/);
    const lines: string[] = [];

    for (let p = 0; p < paragraphs.length; p++) {
      const paragraph = paragraphs[p];
      if (paragraph === '') {
        lines.push('');
        continue;
      }

      const words = paragraph.split(' ');
      let currentLine = '';

      for (let i = 0; i < words.length; i++) {
        const word = words[i];
        const testLine = currentLine.length > 0 ? `${currentLine} ${word}` : word;
        const testWidth = ctx.measureText(testLine).width;

        if (testWidth > maxWidth && i > 0) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      }
      if (currentLine) {
        lines.push(currentLine);
      }
    }
    return lines;
  },

  roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  },

  exportSlideAsDataUrl(
    slide: CarouselSlide,
    totalSlides: number,
    custom: CanvasCustomization,
    isPro: boolean
  ): string {
    const canvas = document.createElement('canvas');
    this.renderSlideToCanvas(canvas, slide, totalSlides, custom, isPro);
    return canvas.toDataURL('image/png', 1.0);
  },

  downloadSingleSlide(
    slide: CarouselSlide,
    totalSlides: number,
    custom: CanvasCustomization,
    isPro: boolean,
    filename?: string
  ): void {
    const dataUrl = this.exportSlideAsDataUrl(slide, totalSlides, custom, isPro);
    const link = document.createElement('a');
    link.download = filename || `slide_${slide.slideNumber}.png`;
    link.href = dataUrl;
    link.click();
  },

  async downloadAllSlidesAsPdf(
    slides: CarouselSlide[],
    custom: CanvasCustomization,
    isPro: boolean,
    title: string = 'HookForge_Carousel'
  ): Promise<void> {
    // Await web-font loading in browser environment before capturing slides
    if (typeof document !== 'undefined' && document.fonts && document.fonts.ready) {
      try {
        await document.fonts.ready;
      } catch {
        // Fallback safely if browser font loading throws
      }
    }

    const { width, height } = this.getDimensions(custom.aspectRatio);
    const orientation = height >= width ? 'portrait' : 'landscape';

    const pdf = new jsPDF({
      orientation,
      unit: 'px',
      format: [width, height],
    });

    for (let i = 0; i < slides.length; i++) {
      const slide = slides[i];
      const dataUrl = this.exportSlideAsDataUrl(slide, slides.length, custom, isPro);

      if (i > 0) {
        pdf.addPage([width, height], orientation);
      }
      pdf.addImage(dataUrl, 'PNG', 0, 0, width, height);
    }

    pdf.save(`${title.replace(/\s+/g, '_')}_carousel.pdf`);
  },

  downloadAllSlidesAsPngs(
    slides: CarouselSlide[],
    custom: CanvasCustomization,
    isPro: boolean,
    title: string = 'HookForge'
  ): void {
    slides.forEach((slide, index) => {
      setTimeout(() => {
        this.downloadSingleSlide(
          slide,
          slides.length,
          custom,
          isPro,
          `${title.replace(/\s+/g, '_')}_slide_${slide.slideNumber}.png`
        );
      }, index * 250);
    });
  },
};
