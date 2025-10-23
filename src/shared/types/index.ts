// Shared types
export interface Message {
  type: string;
  data?: unknown;
}

export interface TranslationHistoryEntry {
  text: string;
  translation: string;
  timestamp: number;
}

export interface TranslationRequestPayload {
  text: string;
  sourceLang?: string;
  targetLang?: string;
}

export interface SelectionArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface OCRResult {
  text: string;
  confidence: number;
}

export interface TranslationResult {
  originalText: string;
  translatedText: string;
  sourceLang: string;
  targetLang: string;
}

export interface TranslationRequestMessage extends Message {
  type: 'translation:request';
  data: TranslationRequestPayload;
}

export interface TranslationResponseMessage extends Message {
  type: 'translation:response';
  data: TranslationResult;
}

export interface TranslationErrorMessage extends Message {
  type: 'translation:error';
  data: {
    message: string;
  };
}