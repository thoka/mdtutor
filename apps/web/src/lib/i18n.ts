import { derived } from 'svelte/store';
import { currentLanguage } from './stores';

const translations: Record<string, Record<string, string>> = {
  'de-DE': {
    'language': 'Sprache',
    'loading': 'Lade Tutorial...',
    'error': 'Fehler',
    'next': 'Weiter',
    'previous': 'Zurück',
    'no_projects': 'Keine Tutorials gefunden.',
    'back_to_overview': 'Zurück zur Übersicht',
    'api_mismatch': 'API-Versionskonflikt!',
    'continue_editing': 'Weiter bearbeiten',
    'completed': 'Abgeschlossen',
    'start_project': 'starten...',
    'continue_project': 'weiter...',
    'finished_project': 'Fertig :-)'
  },
  'en': {
    'language': 'Language',
    'loading': 'Loading tutorial...',
    'error': 'Error',
    'next': 'Next',
    'previous': 'Previous',
    'no_projects': 'No tutorials found.',
    'back_to_overview': 'Back to overview',
    'api_mismatch': 'API Version Mismatch!',
    'continue_editing': 'Continue editing',
    'completed': 'Completed',
    'start_project': 'start...',
    'continue_project': 'continue...',
    'finished_project': 'Done :-)'
  }
};

export const t = derived(currentLanguage, ($lang) => {
  const lang = $lang.startsWith('de') ? 'de-DE' : 'en';
  return (key: string) => {
    return translations[lang]?.[key] || translations['en']?.[key] || key;
  };
});
