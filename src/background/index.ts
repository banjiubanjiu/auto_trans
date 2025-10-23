import { MessageType, ScreenshotRequestMessage } from '../shared/messages';
import { handleScreenshotRequest } from './screenshot';

chrome.runtime.onInstalled?.addListener(() => {
  console.log('EasyTrans background script loaded');
});

chrome.commands?.onCommand.addListener((command) => {
  if (command !== 'capture-area') {
    return;
  }

  chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
    const [activeTab] = tabs;
    if (!activeTab?.id) {
      return;
    }

    chrome.tabs
      .sendMessage(activeTab.id, { type: MessageType.SCREENSHOT_TRIGGER })
      .catch((error) => {
        console.warn('Failed to send screenshot trigger', error);
      });
  });
});

chrome.runtime.onMessage.addListener((message: unknown, sender, sendResponse) => {
  if (!message || typeof message !== 'object') {
    return;
  }

  const typedMessage = message as { type?: MessageType };

  switch (typedMessage.type) {
    case MessageType.CONTENT_READY: {
      console.debug('Content script ready', sender.tab?.id);
      break;
    }
    case MessageType.SCREENSHOT_REQUEST: {
      handleScreenshotRequest(message as ScreenshotRequestMessage, sender)
        .then((response) => sendResponse(response))
        .catch((error: unknown) => {
          const errorMessage = error instanceof Error ? error.message : '截图失败';
          sendResponse({
            type: MessageType.SCREENSHOT_ERROR,
            payload: { error: errorMessage },
          });
        });
      return true;
    }
    default:
      break;
  }

  return undefined;
});
