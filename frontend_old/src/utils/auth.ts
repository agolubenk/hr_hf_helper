/**
 * Утилиты для работы с аутентификацией
 */

export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('access_token');
};

export const getAuthToken = (): string | null => {
  return localStorage.getItem('access_token');
};

export const getUser = (): any | null => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }
  return null;
};

export const clearAuth = (): void => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('user');
};

