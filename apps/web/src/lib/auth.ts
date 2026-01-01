import { writable } from 'svelte/store';

export interface User {
  id: string;
  name: string;
  is_admin: boolean;
}

function createAuthStore() {
  const { subscribe, set } = writable<User | null>(null);

  const getStoredToken = () => localStorage.getItem('sso_token');
  const setStoredToken = (token: string) => localStorage.setItem('sso_token', token);
  const clearStoredToken = () => localStorage.removeItem('sso_token');

  return {
    subscribe,
    async check() {
      // 1. Check for token in URL (callback from SSO)
      const urlParams = new URLSearchParams(window.location.search);
      const tokenFromUrl = urlParams.get('token');
      
      if (tokenFromUrl) {
        setStoredToken(tokenFromUrl);
        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }

      const token = getStoredToken();
      if (!token) {
        set(null);
        return;
      }

      try {
        const res = await fetch('/api/v1/auth/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          set(data.user);
        } else {
          clearStoredToken();
          set(null);
        }
      } catch (e) {
        set(null);
      }
    },
    login() {
      const ssoUrl = import.meta.env.VITE_SSO_URL;
      const returnTo = window.location.href;
      window.location.href = `${ssoUrl}?return_to=${encodeURIComponent(returnTo)}`;
    },
    logout() {
      clearStoredToken();
      set(null);
    }
  };
}

export const auth = createAuthStore();
