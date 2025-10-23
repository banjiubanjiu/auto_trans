import {
  IncomingContentMessage,
  MessageType,
  OutgoingContentMessage,
} from '../shared/messages';
import { ScreenshotController } from './screenshot/controller';

function registerShortcutListener(controller: ScreenshotController): void {
  controller.init();
}

async function notifyBackground(message: OutgoingContentMessage): Promise<void> {
  try {
    await chrome.runtime.sendMessage(message);
  } catch (error) {
    console.warn('Unable to notify background script', error);
  }
}

function registerBackgroundHandlers(controller: ScreenshotController): void {
  chrome.runtime.onMessage.addListener((message: IncomingContentMessage | undefined) => {
    if (!message || typeof message !== 'object') {
      return;
    }

    if ('type' in message && message.type === MessageType.SCREENSHOT_TRIGGER) {
      controller.activate();
    }
  });
}

export async function initContentMain(): Promise<void> {
  const controller = new ScreenshotController();
  registerShortcutListener(controller);
  registerBackgroundHandlers(controller);
  await notifyBackground({ type: MessageType.CONTENT_READY });
}

void initContentMain();
