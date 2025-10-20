// Shared types
export interface Message {
  type: string;
  data?: any;
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