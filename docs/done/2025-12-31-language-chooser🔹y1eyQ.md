# Implementation Plan - Language Chooser 🔹y1eyQ

Add a language chooser to the top bar to allow users to switch between available languages.

## Proposed Changes

### Web App (`apps/web`)

1.  **`src/lib/stores.ts`**:
    *   Add `currentLanguage` store.
    *   Add `availableLanguages` store (populated from project data).

2.  **`src/lib/LanguageChooser.svelte` (New)**:
    *   A component that displays a language dropdown.
    *   When a language is selected, it updates the URL using `push` from `svelte-spa-router`.
    *   It should handle both the home page (`/:lang/projects`) and tutorial pages (`/:lang/projects/:slug/:step`).

3.  **`src/App.svelte`**:
    *   Import and include `LanguageChooser` in the `global-nav-bar`.

4.  **`src/routes/TutorialView.svelte`**:
    *   Update `availableLanguages` store when tutorial data is loaded.
    *   Update `currentLanguage` store from `params.lang`.

5.  **`src/routes/HomeView.svelte`**:
    *   Update `currentLanguage` store from `params.lang`.

### Styling

*   Use RPL-like styles for the dropdown.
*   The dropdown should be positioned in the top right of the `global-nav-bar`.

## Verification Plan

1.  **Manual Test**:
    *   Open a tutorial.
    *   Change language via the dropdown.
    *   Verify the URL updates and content reloads in the new language.
    *   Go to the home page.
    *   Change language via the dropdown.
    *   Verify the project list updates.
