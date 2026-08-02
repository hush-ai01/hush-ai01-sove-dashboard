const getBase = () => localStorage.getItem('sove_base') || 'https://eoniix-kyc-api.onrender.com';
const getKey = () => localStorage.getItem('sove_key') || '';

export const headers = () => ({
  'Content-Type': 'application/json',
  'x-api-key': getKey()
});

export const BASE = getBase;
export const KEY = getKey;

export const saveAuth = (key, base) => {
  localStorage.setItem('sove_key', key);
  localStorage.setItem('sove_base', base);
};

export const clearAuth = () => {
  localStorage.removeItem('sove_key');
  localStorage.removeItem('sove_base');
};

export const isAuthed = () => !!localStorage.getItem('sove_key');
