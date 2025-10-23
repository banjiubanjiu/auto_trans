import { TranslationHistoryEntry } from '../types';

export const HISTORY_STORAGE_KEY = 'history';

const readFromStorage = async <T>(key: string, defaultValue: T): Promise<T> => {
  return new Promise<T>((resolve, reject) => {
    chrome.storage.local.get([key], (result) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }

      const value = result[key];
      resolve((value as T | undefined) ?? defaultValue);
    });
  });
};

const writeToStorage = async <T>(key: string, value: T): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    chrome.storage.local.set({ [key]: value }, () => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }

      resolve();
    });
  });
};

export const getTranslationHistory = async (): Promise<TranslationHistoryEntry[]> => {
  return readFromStorage<TranslationHistoryEntry[]>(HISTORY_STORAGE_KEY, []);
};

export const setTranslationHistory = async (
  history: TranslationHistoryEntry[],
): Promise<void> => {
  await writeToStorage(HISTORY_STORAGE_KEY, history);
};

export const addTranslationHistoryEntry = async (
  entry: TranslationHistoryEntry,
): Promise<TranslationHistoryEntry[]> => {
  const history = await getTranslationHistory();
  const updatedHistory = [entry, ...history];
  await setTranslationHistory(updatedHistory);
  return updatedHistory;
};
