import {
  TranslationErrorMessage,
  TranslationRequestMessage,
  TranslationResponseMessage,
} from '../shared/types';
import { getTranslationHistory } from '../shared/utils/historyStorage';

// Content script entry point
console.log('EasyTrans content script injected');

const demoTranslationRequest: TranslationRequestMessage = {
  type: 'translation:request',
  data: {
    text: 'Hello, EasyTrans!',
    sourceLang: 'en',
    targetLang: 'zh',
  },
};

chrome.runtime.sendMessage(demoTranslationRequest, (response) => {
  if (!response) {
    console.error('No response received for translation request.', chrome.runtime.lastError);
    return;
  }

  if (response.type === 'translation:response') {
    const { data } = response as TranslationResponseMessage;
    console.log('Mock translation result:', data);

    getTranslationHistory().then((history) => {
      console.log('Current translation history:', history);
    });
    return;
  }

  if (response.type === 'translation:error') {
    const { data } = response as TranslationErrorMessage;
    console.error('Translation error:', data.message);
    return;
  }

  console.warn('Received unexpected response:', response);
});