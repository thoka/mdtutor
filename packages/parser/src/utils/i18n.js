const translations = {
  'de-DE': {
    'hint': 'Hinweis',
    'save_project': 'Speichere dein Projekt',
    'mark_complete': 'Markiere diese Aufgabe als erledigt'
  },
  'en': {
    'hint': 'Hint',
    'save_project': 'Save your project',
    'mark_complete': 'Mark this task as complete'
  }
};

export function getTranslation(key, languages = ['en']) {
  for (const lang of languages) {
    if (translations[lang] && translations[lang][key]) {
      return translations[lang][key];
    }
  }
  // Fallback to English if not found in preferred languages
  return translations['en'][key] || key;
}
