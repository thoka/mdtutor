import { writable } from 'svelte/store';

export interface User {
  id: string;
  name: string;
  is_admin: boolean;
  avatar?: string;
  is_present?: boolean;
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
      // We check both window.location.search AND the search part of the hash
      const searchParams = new URLSearchParams(window.location.search);
      let tokenFromUrl = searchParams.get('token');
      
      if (!tokenFromUrl && window.location.hash.includes('?')) {
        const hashSearch = window.location.hash.split('?')[1];
        tokenFromUrl = new URLSearchParams(hashSearch).get('token');
      }

      if (tokenFromUrl === 'logout') {
        clearStoredToken();
        set(null);
        // Clean URL
        const newUrl = window.location.href
          .replace(/[?&]token=logout/g, '')
          .replace(/&&+/g, '&')
          .replace(/\?&/g, '?')
          .replace(/[?&]$/g, '');
        window.history.replaceState({}, document.title, newUrl);
        return;
      }

      if (tokenFromUrl) {
        setStoredToken(tokenFromUrl);
        // Clean URL - remove all token parameters from search and hash
        const newUrl = window.location.href
          .replace(/[?&]token=[^&]+/g, '')
          .replace(/&&+/g, '&')
          .replace(/\?&/g, '?')
          .replace(/[?&]$/g, '');
        window.history.replaceState({}, document.title, newUrl);
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
      // Ensure we don't pass an existing token in the return_to URL
      const returnTo = window.location.href.replace(/[?&]token=[^&]+/g, '');
      window.location.href = `${ssoUrl}?return_to=${encodeURIComponent(returnTo)}`;
    },
    logout() {
      clearStoredToken();
      set(null);
    }
  };
}

export const auth = createAuthStore();
