import { writable } from 'svelte/store';

export interface User {
  id: string;
  is_admin: boolean;
}

function createAuthStore() {
  const { subscribe, set } = writable<User | null>(null);

  return {
    subscribe,
    async check() {
      try {
        const res = await fetch('/api/v1/auth/me');
        if (res.ok) {
          const data = await res.json();
          set(data.user);
        } else {
          set(null);
        }
      } catch (e) {
        set(null);
      }
    },
    async login(userId: string, password?: string) {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, password })
      });
      if (res.ok) {
        const data = await res.json();
        set(data.user);
        return true;
      }
      return false;
    },
    async logout() {
      const res = await fetch('/api/v1/auth/logout', { method: 'DELETE' });
      if (res.ok) {
        set(null);
        return true;
      }
      return false;
    }
  };
}

export const auth = createAuthStore();

