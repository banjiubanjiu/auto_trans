// Shared utilities
export const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const formatDate = (date: Date): string => {
  return date.toLocaleString('zh-CN');
};

export * from './historyStorage';