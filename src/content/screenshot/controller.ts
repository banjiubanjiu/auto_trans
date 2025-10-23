import { MessageType, SelectionBounds, ScreenshotErrorMessage, ScreenshotSuccessMessage } from '../../shared/messages';
import { ScreenshotOverlay } from './overlay';

interface ShortcutConfig {
  key: string;
  shiftKey?: boolean;
  altKey?: boolean;
  ctrlKey?: boolean;
  metaKey?: boolean;
}

interface ControllerOptions {
  shortcut?: ShortcutConfig;
  minSelectionSize?: number;
}

const DEFAULT_SHORTCUT: ShortcutConfig = {
  key: 's',
  shiftKey: true,
};

function normalizeKey(key: string): string {
  return key.length === 1 ? key.toLowerCase() : key;
}

function isEditableElement(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName.toLowerCase();
  const editableTypes = ['input', 'textarea'];
  return target.isContentEditable || editableTypes.includes(tag) || target.getAttribute('role') === 'textbox';
}

export class ScreenshotController {
  private readonly shortcut: ShortcutConfig;
  private readonly minSelectionSize: number;
  private overlay: ScreenshotOverlay | null = null;
  private isActive = false;
  private originalOverflow: string | null = null;

  constructor(options: ControllerOptions = {}) {
    this.shortcut = options.shortcut ?? DEFAULT_SHORTCUT;
    this.minSelectionSize = options.minSelectionSize ?? 20;
  }

  init(): void {
    window.addEventListener('keydown', this.handleKeydown, true);
  }

  destroy(): void {
    window.removeEventListener('keydown', this.handleKeydown, true);
    this.exitScreenshotMode();
  }

  activate(): void {
    this.enterScreenshotMode();
  }

  private readonly handleKeydown = (event: KeyboardEvent): void => {
    if (this.isActive) {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        this.exitScreenshotMode();
      }
      return;
    }

    if (isEditableElement(event.target)) {
      return;
    }

    if (this.matchesShortcut(event)) {
      event.preventDefault();
      event.stopPropagation();
      this.enterScreenshotMode();
    }
  };

  private matchesShortcut(event: KeyboardEvent): boolean {
    const keyMatches = normalizeKey(event.key) === normalizeKey(this.shortcut.key);
    return (
      keyMatches &&
      !!event.shiftKey === !!this.shortcut.shiftKey &&
      !!event.altKey === !!this.shortcut.altKey &&
      !!event.ctrlKey === !!this.shortcut.ctrlKey &&
      !!event.metaKey === !!this.shortcut.metaKey
    );
  }

  private enterScreenshotMode(): void {
    if (this.isActive) return;
    this.isActive = true;
    this.originalOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';

    this.overlay = new ScreenshotOverlay({
      onComplete: (bounds) => {
        this.handleSelectionComplete(bounds).catch((error) => {
          console.error('Screenshot capture failed', error);
          this.overlay?.setMessage('截图失败，请重试');
        });
      },
      onCancel: () => this.exitScreenshotMode(),
      onError: (message) => this.overlay?.setMessage(message),
      minSelectionSize: this.minSelectionSize,
    });

    this.overlay.attach();
  }

  private exitScreenshotMode(): void {
    if (!this.isActive) return;
    this.isActive = false;
    if (this.overlay) {
      this.overlay.destroy();
      this.overlay = null;
    }
    if (this.originalOverflow !== null) {
      document.documentElement.style.overflow = this.originalOverflow;
      this.originalOverflow = null;
    } else {
      document.documentElement.style.removeProperty('overflow');
    }
  }

  private async handleSelectionComplete(bounds: SelectionBounds): Promise<void> {
    try {
      const response = (await chrome.runtime.sendMessage({
        type: MessageType.SCREENSHOT_REQUEST,
        payload: {
          bounds,
          viewport: {
            width: window.innerWidth,
            height: window.innerHeight,
          },
          devicePixelRatio: window.devicePixelRatio || 1,
        },
      })) as ScreenshotSuccessMessage | ScreenshotErrorMessage | undefined;

      if (!response) {
        throw new Error('未收到后台响应');
      }

      if (response.type === MessageType.SCREENSHOT_ERROR) {
        throw new Error(response.payload.error);
      }

      console.debug('Screenshot captured', response.payload.dataUrl.slice(0, 32));
      this.exitScreenshotMode();
    } catch (error) {
      const message = error instanceof Error ? error.message : '截图失败';
      this.overlay?.setMessage(message);
      setTimeout(() => this.exitScreenshotMode(), 1200);
    }
  }
}
