import { writable } from 'svelte/store';

export interface UserPreferences {
  autoAdvance: boolean;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  autoAdvance: false
};

function createPreferencesStore() {
  const stored = localStorage.getItem('user_preferences');
  const initial = stored ? { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) } : DEFAULT_PREFERENCES;
  
  const { subscribe, set, update } = writable<UserPreferences>(initial);

  return {
    subscribe,
    set: (prefs: UserPreferences) => {
      localStorage.setItem('user_preferences', JSON.stringify(prefs));
      set(prefs);
    },
    update: (fn: (prefs: UserPreferences) => UserPreferences) => {
      update(prefs => {
        const next = fn(prefs);
        localStorage.setItem('user_preferences', JSON.stringify(next));
        return next;
      });
    }
  };
}

export const userPreferences = createPreferencesStore();

export function toggleAutoAdvance() {
  userPreferences.update(p => ({ ...p, autoAdvance: !p.autoAdvance }));
}
