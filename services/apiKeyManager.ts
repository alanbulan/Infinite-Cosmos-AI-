// 管理 API Key 的存储与获取
export const getApiKey = (): string => {
  // 优先从本地存储获取，其次尝试环境变量 (用于开发环境)
  return localStorage.getItem('gemini_api_key') || (typeof process !== 'undefined' && process.env ? process.env.API_KEY : '') || '';
};

export const setApiKey = (key: string) => {
  localStorage.setItem('gemini_api_key', key);
};

export const hasValidKey = (): boolean => {
  return !!getApiKey();
};