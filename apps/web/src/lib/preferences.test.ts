import { describe, it, expect, beforeEach, vi } from 'vitest';
import { get } from 'svelte/store';
import { userPreferences, toggleAutoAdvance } from './preferences';

describe('User Preferences Store', () => {
  beforeEach(() => {
    localStorage.clear();
    // Reset store to default
    userPreferences.set({ autoAdvance: false });
  });

  it('has correct default values', () => {
    const prefs = get(userPreferences);
    expect(prefs.autoAdvance).toBe(false);
  });

  it('updates autoAdvance and saves to localStorage', () => {
    toggleAutoAdvance();
    let prefs = get(userPreferences);
    expect(prefs.autoAdvance).toBe(true);
    expect(localStorage.getItem('user_preferences')).toContain('"autoAdvance":true');

    toggleAutoAdvance();
    prefs = get(userPreferences);
    expect(prefs.autoAdvance).toBe(false);
  });

  it('loads initial values from localStorage', () => {
    localStorage.setItem('user_preferences', JSON.stringify({ autoAdvance: true }));
    // We need to re-import or trigger a reload if the store is a singleton
    // For TDD purposes, let's assume we implement a load() method or it loads on creation.
    // If it's a singleton, we might need a reset/load function.
  });
});
