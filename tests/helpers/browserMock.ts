/**
 * Lightweight mock browser environment for testing HookForge AI in Node.js
 */

export interface DrawCall {
  type: string;
  args: any[];
}

export class MockCanvasRenderingContext2D {
  fillStyle: string | any = '#000000';
  strokeStyle: string | any = '#000000';
  lineWidth: number = 1;
  font: string = '10px sans-serif';
  textAlign: string = 'left';

  public calls: DrawCall[] = [];
  public drawnTexts: string[] = [];

  fillRect(x: number, y: number, w: number, h: number) {
    this.calls.push({ type: 'fillRect', args: [x, y, w, h, this.fillStyle] });
  }

  strokeRect(x: number, y: number, w: number, h: number) {
    this.calls.push({ type: 'strokeRect', args: [x, y, w, h, this.strokeStyle] });
  }

  createRadialGradient(x0: number, y0: number, r0: number, x1: number, y1: number, r1: number) {
    return {
      addColorStop: (offset: number, color: string) => {
        this.calls.push({ type: 'addColorStop', args: [offset, color] });
      },
    };
  }

  beginPath() {
    this.calls.push({ type: 'beginPath', args: [] });
  }

  moveTo(x: number, y: number) {
    this.calls.push({ type: 'moveTo', args: [x, y] });
  }

  lineTo(x: number, y: number) {
    this.calls.push({ type: 'lineTo', args: [x, y] });
  }

  stroke() {
    this.calls.push({ type: 'stroke', args: [] });
  }

  fill() {
    this.calls.push({ type: 'fill', args: [] });
  }

  closePath() {
    this.calls.push({ type: 'closePath', args: [] });
  }

  arcTo(x1: number, y1: number, x2: number, y2: number, radius: number) {
    this.calls.push({ type: 'arcTo', args: [x1, y1, x2, y2, radius] });
  }

  save() {
    this.calls.push({ type: 'save', args: [] });
  }

  restore() {
    this.calls.push({ type: 'restore', args: [] });
  }

  measureText(text: string) {
    // Return approximate width proportional to character count
    return { width: (text || '').length * 12 };
  }

  fillText(text: string, x: number, y: number) {
    this.drawnTexts.push(text);
    this.calls.push({ type: 'fillText', args: [text, x, y, this.fillStyle, this.font] });
  }
}

export class MockCanvas {
  public width: number = 0;
  public height: number = 0;
  public context: MockCanvasRenderingContext2D;

  constructor() {
    this.context = new MockCanvasRenderingContext2D();
  }

  getContext(type: string) {
    if (type === '2d') {
      return this.context;
    }
    return null;
  }

  toDataURL(mimeType: string = 'image/png', quality: number = 1.0) {
    return `data:${mimeType};base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==`;
  }
}

class MockStorage implements Storage {
  private store: Map<string, string> = new Map();

  get length(): number {
    return this.store.size;
  }

  clear(): void {
    this.store.clear();
  }

  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }

  key(index: number): string | null {
    const keys = Array.from(this.store.keys());
    return keys[index] ?? null;
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  setItem(key: string, value: string): void {
    this.store.set(key, String(value));
  }
}

export interface DownloadTriggered {
  download: string;
  href: string;
}

export const downloadsTriggered: DownloadTriggered[] = [];
export const clipboardHistory: string[] = [];

export function setupBrowserMock() {
  const storage = new MockStorage();
  downloadsTriggered.length = 0;
  clipboardHistory.length = 0;

  // Global localStorage
  try {
    Object.defineProperty(globalThis, 'localStorage', {
      value: storage,
      configurable: true,
      writable: true,
    });
  } catch {
    (globalThis as any).localStorage = storage;
  }

  // Mock document
  const mockDoc = {
    createElement(tag: string) {
      if (tag.toLowerCase() === 'canvas') {
        return new MockCanvas();
      }
      if (tag.toLowerCase() === 'a') {
        const anchor = {
          download: '',
          href: '',
          click() {
            downloadsTriggered.push({ download: this.download, href: this.href });
          },
        };
        return anchor;
      }
      return {};
    },
  };

  try {
    Object.defineProperty(globalThis, 'document', {
      value: mockDoc,
      configurable: true,
      writable: true,
    });
  } catch {
    (globalThis as any).document = mockDoc;
  }

  // Mock navigator.clipboard
  const mockClipboard = {
    async writeText(text: string) {
      clipboardHistory.push(text);
    },
  };

  try {
    if (globalThis.navigator) {
      Object.defineProperty(globalThis.navigator, 'clipboard', {
        value: mockClipboard,
        configurable: true,
        writable: true,
      });
    } else {
      Object.defineProperty(globalThis, 'navigator', {
        value: { clipboard: mockClipboard },
        configurable: true,
        writable: true,
      });
    }
  } catch {
    (globalThis as any).navigator = { clipboard: mockClipboard };
  }

  // Mock URL.createObjectURL
  const origURL = globalThis.URL;
  if (origURL && !origURL.createObjectURL) {
    (origURL as any).createObjectURL = (blob: any) => `blob:http://localhost/${Math.random().toString(36).substring(2, 9)}`;
    (origURL as any).revokeObjectURL = (url: string) => {};
  }

  return { storage, downloadsTriggered, clipboardHistory };
}
