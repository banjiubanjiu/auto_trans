import {
  MessageType,
  ScreenshotErrorMessage,
  ScreenshotRequestMessage,
  ScreenshotSuccessMessage,
} from '../shared/messages';

async function captureVisibleTab(windowId?: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const capture = typeof windowId === 'number'
      ? chrome.tabs.captureVisibleTab.bind(chrome.tabs, windowId)
      : chrome.tabs.captureVisibleTab.bind(chrome.tabs);

    capture({ format: 'png' }, (dataUrl) => {
      const error = chrome.runtime.lastError;
      if (error) {
        reject(new Error(error.message));
        return;
      }
      if (!dataUrl) {
        reject(new Error('未获取到截图数据'));
        return;
      }
      resolve(dataUrl);
    });
  });
}

async function blobToDataUrl(blob: Blob): Promise<string> {
  const buffer = await blob.arrayBuffer();
  const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
  return `data:${blob.type};base64,${base64}`;
}

export async function handleScreenshotRequest(
  message: ScreenshotRequestMessage,
  sender: chrome.runtime.MessageSender,
): Promise<ScreenshotSuccessMessage | ScreenshotErrorMessage> {
  const {
    bounds: { x, y, width, height },
    devicePixelRatio,
  } = message.payload;

  if (width < 1 || height < 1) {
    return {
      type: MessageType.SCREENSHOT_ERROR,
      payload: {
        error: '截图区域过小',
      },
    };
  }

  try {
    const dataUrl = await captureVisibleTab(sender.tab?.windowId);
    const bitmap = await createImageBitmap(await (await fetch(dataUrl)).blob());
    const scale = devicePixelRatio || 1;
    const cropWidth = Math.max(Math.round(width * scale), 1);
    const cropHeight = Math.max(Math.round(height * scale), 1);
    const cropX = Math.round(x * scale);
    const cropY = Math.round(y * scale);

    const canvas = new OffscreenCanvas(cropWidth, cropHeight);
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('无法创建截图上下文');
    }
    ctx.drawImage(bitmap, cropX, cropY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);
    const blob = await canvas.convertToBlob({ type: 'image/png' });
    if (!blob) {
      throw new Error('截图转换失败');
    }
    const croppedDataUrl = await blobToDataUrl(blob);
    return {
      type: MessageType.SCREENSHOT_RESULT,
      payload: {
        dataUrl: croppedDataUrl,
      },
    };
  } catch (error) {
    const messageText = error instanceof Error ? error.message : '截图失败';
    return {
      type: MessageType.SCREENSHOT_ERROR,
      payload: {
        error: messageText,
      },
    };
  }
}
