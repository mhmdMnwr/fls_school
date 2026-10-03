const TOKEN_KEY = 'fls_token';
const ACTIVITY_SEEN_KEY = 'fls_activity_seen';

export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const setToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const removeToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

export const hasToken = (): boolean => {
  return !!getToken();
};

export const getActivitySeen = (): string | null => {
  return localStorage.getItem(ACTIVITY_SEEN_KEY);
};

export const setActivitySeen = (isoTimestamp: string = new Date().toISOString()): void => {
  localStorage.setItem(ACTIVITY_SEEN_KEY, isoTimestamp);
};
