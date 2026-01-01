# Walkthrough - Language Chooser Refinement

Refined the language chooser to support a subset of languages and implemented a basic i18n system for the UI.

## Changes

### Web App (`apps/web`)

- **i18n System**: Created [apps/web/src/lib/i18n.ts](apps/web/src/lib/i18n.ts) using a derived store that provides a translation function `$t`.
- **Language Filtering**: Updated [apps/web/src/lib/LanguageChooser.svelte](apps/web/src/lib/LanguageChooser.svelte) to only show `de-DE` and `en`.
- **Localized UI**:
    - The "Language:" label in the top bar is now localized.
    - Loading and error messages in `HomeView` and `TutorialView` are localized.
    - The API mismatch banner in `App.svelte` is localized.
- **Navigation Fixes**: Updated `TutorialView` to use localized URLs for "Next" and "Previous" buttons, resolving accessibility lint warnings.

## Verification Results

- **Language Chooser**: Only "Deutsch" and "English" are visible.
- **Localization**: Switching to English changes "Sprache:" to "Language:" and "Lade Tutorial..." to "Loading tutorial...".
- **Navigation**: "Next" and "Previous" buttons correctly update the URL with the current language code.
