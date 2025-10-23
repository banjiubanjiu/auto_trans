import { TranslationRequestPayload, TranslationResult } from '../shared/types';
import { addTranslationHistoryEntry } from '../shared/utils/historyStorage';

export interface TranslationRequestOptions extends TranslationRequestPayload {}

/**
 * Mock translation request handler. This will be replaced by real API integration.
 */
export const requestTranslation = async (
  options: TranslationRequestOptions,
): Promise<TranslationResult> => {
  const { text, sourceLang = 'auto', targetLang = 'zh' } = options;

  if (!text?.trim()) {
    throw new Error('Translation text is required');
  }

  // Mock translation result mirrors the input text for now.
  const result: TranslationResult = {
    originalText: text,
    translatedText: `${text} (translated to ${targetLang})`,
    sourceLang,
    targetLang,
  };

  await addTranslationHistoryEntry({
    text: result.originalText,
    translation: result.translatedText,
    timestamp: Date.now(),
  });

  return result;
};
