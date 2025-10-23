import { SelectionBounds } from '../../shared/messages';

type ResizeHandle =
  | 'n'
  | 's'
  | 'e'
  | 'w'
  | 'ne'
  | 'nw'
  | 'se'
  | 'sw';

interface OverlayCallbacks {
  onComplete: (bounds: SelectionBounds) => void;
  onCancel: () => void;
  onError: (message: string) => void;
  minSelectionSize?: number;
}

interface PointerState {
  startX: number;
  startY: number;
  originBounds: SelectionBounds | null;
  mode: 'creating' | 'moving' | 'resizing';
  handle?: ResizeHandle;
}

const STYLE_ID = '__easytrans_screenshot_style__';

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function ensureStylesInjected(): void {
  if (document.getElementById(STYLE_ID)) {
    return;
  }

  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    .easytrans-screenshot-overlay {
      position: fixed;
      inset: 0;
      z-index: 2147483647;
      cursor: crosshair;
      background: rgba(15, 23, 42, 0.35);
      backdrop-filter: blur(1px);
      user-select: none;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .easytrans-screenshot-selection {
      position: absolute;
      border: 2px solid #38bdf8;
      box-shadow: 0 0 0 1px rgba(14, 165, 233, 0.4);
      background: rgba(56, 189, 248, 0.12);
      display: none;
      cursor: move;
    }
    .easytrans-screenshot-selection.active {
      display: block;
    }
    .easytrans-screenshot-controls {
      position: absolute;
      top: 8px;
      right: 8px;
      display: flex;
      gap: 8px;
    }
    .easytrans-screenshot-btn {
      background: #0ea5e9;
      color: white;
      border: none;
      border-radius: 4px;
      padding: 4px 10px;
      font-size: 12px;
      font-family: system-ui, sans-serif;
      cursor: pointer;
      box-shadow: 0 2px 6px rgba(14, 165, 233, 0.4);
    }
    .easytrans-screenshot-btn:hover {
      background: #0284c7;
    }
    .easytrans-screenshot-message {
      position: absolute;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%);
      color: white;
      font-size: 14px;
      font-family: system-ui, sans-serif;
      background: rgba(15, 23, 42, 0.6);
      padding: 8px 14px;
      border-radius: 999px;
      pointer-events: none;
    }
    .easytrans-screenshot-handle {
      position: absolute;
      width: 10px;
      height: 10px;
      background: #38bdf8;
      border: 1px solid white;
      border-radius: 2px;
      box-shadow: 0 0 0 1px rgba(14, 165, 233, 0.4);
    }
    .easytrans-screenshot-handle[data-handle='n'],
    .easytrans-screenshot-handle[data-handle='s'] {
      cursor: ns-resize;
    }
    .easytrans-screenshot-handle[data-handle='e'],
    .easytrans-screenshot-handle[data-handle='w'] {
      cursor: ew-resize;
    }
    .easytrans-screenshot-handle[data-handle='ne'],
    .easytrans-screenshot-handle[data-handle='sw'] {
      cursor: nesw-resize;
    }
    .easytrans-screenshot-handle[data-handle='nw'],
    .easytrans-screenshot-handle[data-handle='se'] {
      cursor: nwse-resize;
    }
  `;
  document.head.appendChild(style);
}

export class ScreenshotOverlay {
  private readonly root: HTMLDivElement;
  private readonly selection: HTMLDivElement;
  private readonly controls: HTMLDivElement;
  private readonly confirmBtn: HTMLButtonElement;
  private readonly cancelBtn: HTMLButtonElement;
  private readonly message: HTMLDivElement;
  private readonly handles: Map<ResizeHandle, HTMLDivElement> = new Map();
  private pointerState: PointerState | null = null;
  private currentBounds: SelectionBounds | null = null;
  private readonly callbacks: Required<Omit<OverlayCallbacks, 'minSelectionSize'>>;
  private readonly minSelectionSize: number;
  private attached = false;

  constructor(options: OverlayCallbacks) {
    ensureStylesInjected();

    this.callbacks = {
      onComplete: options.onComplete,
      onCancel: options.onCancel,
      onError: options.onError,
    };
    this.minSelectionSize = options.minSelectionSize ?? 12;

    this.root = document.createElement('div');
    this.root.className = 'easytrans-screenshot-overlay';

    this.selection = document.createElement('div');
    this.selection.className = 'easytrans-screenshot-selection';

    this.controls = document.createElement('div');
    this.controls.className = 'easytrans-screenshot-controls';

    this.confirmBtn = document.createElement('button');
    this.confirmBtn.className = 'easytrans-screenshot-btn';
    this.confirmBtn.textContent = '完成';

    this.cancelBtn = document.createElement('button');
    this.cancelBtn.className = 'easytrans-screenshot-btn';
    this.cancelBtn.textContent = '取消';

    this.controls.append(this.confirmBtn, this.cancelBtn);
    this.selection.appendChild(this.controls);

    this.message = document.createElement('div');
    this.message.className = 'easytrans-screenshot-message';
    this.message.textContent = '拖拽选择截图区域，按 Esc 退出';

    this.root.append(this.selection, this.message);

    this.createHandles();
    this.attachEvents();
  }

  attach(): void {
    if (this.attached) return;
    document.body.appendChild(this.root);
    this.attached = true;
  }

  destroy(): void {
    if (!this.attached) return;
    this.detachEvents();
    this.root.remove();
    this.attached = false;
  }

  private createHandles(): void {
    const positions: ResizeHandle[] = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'];
    for (const handle of positions) {
      const el = document.createElement('div');
      el.className = 'easytrans-screenshot-handle';
      el.dataset.handle = handle;
      this.selection.appendChild(el);
      this.handles.set(handle, el);
    }
    this.layoutHandles({ x: 0, y: 0, width: 0, height: 0 });
  }

  private attachEvents(): void {
    this.root.addEventListener('pointerdown', this.handlePointerDown, true);
    window.addEventListener('pointermove', this.handlePointerMove, true);
    window.addEventListener('pointerup', this.handlePointerUp, true);
    this.confirmBtn.addEventListener('click', this.handleConfirm);
    this.cancelBtn.addEventListener('click', this.handleCancel);
  }

  private detachEvents(): void {
    this.root.removeEventListener('pointerdown', this.handlePointerDown, true);
    window.removeEventListener('pointermove', this.handlePointerMove, true);
    window.removeEventListener('pointerup', this.handlePointerUp, true);
    this.confirmBtn.removeEventListener('click', this.handleConfirm);
    this.cancelBtn.removeEventListener('click', this.handleCancel);
  }

  private readonly handlePointerDown = (event: PointerEvent): void => {
    if (event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();

    const target = event.target as HTMLElement;
    const rect = this.root.getBoundingClientRect();
    const x = clamp(event.clientX - rect.left, 0, rect.width);
    const y = clamp(event.clientY - rect.top, 0, rect.height);

    if (target.dataset.handle) {
      this.pointerState = {
        mode: 'resizing',
        startX: x,
        startY: y,
        originBounds: this.currentBounds ? { ...this.currentBounds } : null,
        handle: target.dataset.handle as ResizeHandle,
      };
      return;
    }

    if (target === this.selection || this.selection.contains(target)) {
      this.pointerState = {
        mode: 'moving',
        startX: x,
        startY: y,
        originBounds: this.currentBounds ? { ...this.currentBounds } : null,
      };
      return;
    }

    this.pointerState = {
      mode: 'creating',
      startX: x,
      startY: y,
      originBounds: null,
    };
    this.currentBounds = {
      x,
      y,
      width: 0,
      height: 0,
    };
    this.updateSelection();
  };

  private readonly handlePointerMove = (event: PointerEvent): void => {
    if (!this.pointerState) return;
    event.preventDefault();
    event.stopPropagation();

    const rect = this.root.getBoundingClientRect();
    const x = clamp(event.clientX - rect.left, 0, rect.width);
    const y = clamp(event.clientY - rect.top, 0, rect.height);

    const state = this.pointerState;
    const origin = state.originBounds ? { ...state.originBounds } : this.currentBounds ? { ...this.currentBounds } : { x: 0, y: 0, width: 0, height: 0 };

    if (state.mode === 'creating') {
      const startX = state.startX;
      const startY = state.startY;
      const newX = Math.min(startX, x);
      const newY = Math.min(startY, y);
      const width = Math.abs(x - startX);
      const height = Math.abs(y - startY);
      this.currentBounds = { x: newX, y: newY, width, height };
    } else if (state.mode === 'moving' && origin) {
      const deltaX = x - state.startX;
      const deltaY = y - state.startY;
      const newX = clamp(origin.x + deltaX, 0, rect.width - origin.width);
      const newY = clamp(origin.y + deltaY, 0, rect.height - origin.height);
      this.currentBounds = {
        x: newX,
        y: newY,
        width: origin.width,
        height: origin.height,
      };
    } else if (state.mode === 'resizing' && origin) {
      this.currentBounds = this.resizeBounds(origin, state.handle!, x - state.startX, y - state.startY, rect.width, rect.height);
    }

    this.updateSelection();
  };

  private readonly handlePointerUp = (event: PointerEvent): void => {
    if (!this.pointerState) return;
    event.preventDefault();
    event.stopPropagation();

    this.pointerState = null;
    if (!this.currentBounds) return;

    if (this.currentBounds.width < this.minSelectionSize || this.currentBounds.height < this.minSelectionSize) {
      this.callbacks.onError('选区太小，请重新选择');
      this.clearSelection();
      return;
    }
  };

  private readonly handleConfirm = (event: MouseEvent): void => {
    event.preventDefault();
    event.stopPropagation();
    if (this.currentBounds) {
      this.callbacks.onComplete({ ...this.currentBounds });
    } else {
      this.callbacks.onError('请先选择截图区域');
    }
  };

  private readonly handleCancel = (event: MouseEvent): void => {
    event.preventDefault();
    event.stopPropagation();
    this.callbacks.onCancel();
  };

  private updateSelection(): void {
    if (!this.currentBounds) {
      this.selection.classList.remove('active');
      this.setMessage('拖拽选择截图区域，按 Esc 退出');
      return;
    }
    const bounds = this.currentBounds;
    this.selection.classList.add('active');
    this.selection.style.left = `${bounds.x}px`;
    this.selection.style.top = `${bounds.y}px`;
    this.selection.style.width = `${bounds.width}px`;
    this.selection.style.height = `${bounds.height}px`;
    this.layoutHandles(bounds);
    if (bounds.width >= this.minSelectionSize && bounds.height >= this.minSelectionSize) {
      this.setMessage('调整选区或点击完成确认');
    }
  }

  private layoutHandles(bounds: SelectionBounds): void {
    const { x, y, width, height } = bounds;
    const halfHandle = 5; // handle width / 2
    const positions: Record<ResizeHandle, [number, number]> = {
      n: [x + width / 2 - halfHandle, y - halfHandle],
      s: [x + width / 2 - halfHandle, y + height - halfHandle],
      e: [x + width - halfHandle, y + height / 2 - halfHandle],
      w: [x - halfHandle, y + height / 2 - halfHandle],
      ne: [x + width - halfHandle, y - halfHandle],
      nw: [x - halfHandle, y - halfHandle],
      se: [x + width - halfHandle, y + height - halfHandle],
      sw: [x - halfHandle, y + height - halfHandle],
    };

    for (const [handle, el] of this.handles.entries()) {
      const pos = positions[handle];
      el.style.left = `${pos[0]}px`;
      el.style.top = `${pos[1]}px`;
    }
  }

  private resizeBounds(
    origin: SelectionBounds,
    handle: ResizeHandle,
    deltaX: number,
    deltaY: number,
    maxWidth: number,
    maxHeight: number,
  ): SelectionBounds {
    let { x, y, width, height } = origin;

    switch (handle) {
      case 'n': {
        const newY = clamp(y + deltaY, 0, y + height - this.minSelectionSize);
        height += y - newY;
        y = newY;
        break;
      }
      case 's': {
        const newBottom = clamp(y + height + deltaY, y + this.minSelectionSize, maxHeight);
        height = newBottom - y;
        break;
      }
      case 'w': {
        const newX = clamp(x + deltaX, 0, x + width - this.minSelectionSize);
        width += x - newX;
        x = newX;
        break;
      }
      case 'e': {
        const newRight = clamp(x + width + deltaX, x + this.minSelectionSize, maxWidth);
        width = newRight - x;
        break;
      }
      case 'ne': {
        const newRight = clamp(x + width + deltaX, x + this.minSelectionSize, maxWidth);
        const newY = clamp(y + deltaY, 0, y + height - this.minSelectionSize);
        height += y - newY;
        y = newY;
        width = newRight - x;
        break;
      }
      case 'nw': {
        const newX = clamp(x + deltaX, 0, x + width - this.minSelectionSize);
        const newY = clamp(y + deltaY, 0, y + height - this.minSelectionSize);
        width += x - newX;
        height += y - newY;
        x = newX;
        y = newY;
        break;
      }
      case 'se': {
        const newRight = clamp(x + width + deltaX, x + this.minSelectionSize, maxWidth);
        const newBottom = clamp(y + height + deltaY, y + this.minSelectionSize, maxHeight);
        width = newRight - x;
        height = newBottom - y;
        break;
      }
      case 'sw': {
        const newX = clamp(x + deltaX, 0, x + width - this.minSelectionSize);
        const newBottom = clamp(y + height + deltaY, y + this.minSelectionSize, maxHeight);
        width += x - newX;
        x = newX;
        height = newBottom - y;
        break;
      }
    }

    return { x, y, width, height };
  }

  private clearSelection(): void {
    this.currentBounds = null;
    this.updateSelection();
  }

  setMessage(text: string): void {
    this.message.textContent = text;
  }
}
