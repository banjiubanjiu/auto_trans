import {
  Message,
  TranslationErrorMessage,
  TranslationRequestMessage,
  TranslationResponseMessage,
} from '../shared/types';
import { requestTranslation } from './translation';

// Background script entry point
console.log('EasyTrans background script loaded');

chrome.runtime.onMessage.addListener((message: Message, sender, sendResponse) => {
  if (!message?.type) {
    return;
  }

  if (message.type === 'translation:request') {
    const requestMessage = message as TranslationRequestMessage;

    requestTranslation(requestMessage.data)
      .then((result) => {
        const response: TranslationResponseMessage = {
          type: 'translation:response',
          data: result,
        };
        sendResponse(response);
      })
      .catch((error) => {
        const errorMessage = error instanceof Error ? error.message : String(error);
        const response: TranslationErrorMessage = {
          type: 'translation:error',
          data: {
            message: errorMessage || 'Translation failed',
          },
        };
        sendResponse(response);
      });

    return true;
  }

  return undefined;
});