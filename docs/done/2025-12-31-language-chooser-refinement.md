# Implementation Plan - Language Chooser Refinement

Refine the language chooser to filter available languages and use i18n for UI labels.

## Proposed Changes

### Web App (`apps/web`)

1.  **`src/lib/i18n.ts` (New)**:
    *   Implement a simple i18n utility.
    *   Define translations for `de-DE` and `en`.
    *   Provide a `t` function or similar to get translations based on the current language.

2.  **`src/lib/LanguageChooser.svelte`**:
    *   Import the i18n utility.
    *   Filter `sortedLanguages` to only include a subset (initially `de-DE` and `en`).
    *   Use the i18n utility for the "Language:" label.

3.  **`src/lib/stores.ts`**:
    *   Ensure `currentLanguage` is used by the i18n utility.

## Verification Plan

1.  **Manual Test**:
    *   Verify that only German and English are visible in the language chooser.
    *   Verify that the "Language:" label changes when switching languages (if translated).
    *   Verify that the UI remains functional.
