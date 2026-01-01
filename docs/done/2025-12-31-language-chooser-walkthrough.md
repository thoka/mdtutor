# Walkthrough - Language Chooser

I have added a language chooser to the top bar of the web application, allowing users to switch between available languages for both the project list and individual tutorials.

## Changes

### API Server (`packages/api-server`)

- **`src/server.js`**:
    - Updated `getProjectData` to detect and return available languages for a project by scanning the `repo` directory.
    - Updated `/api/projects` (list) to return a union of all available languages across all projects.
    - This ensures the language chooser only shows languages that actually have content.

### Web App (`apps/web`)

- **`src/lib/stores.ts`**: Added `currentLanguage` and `availableLanguages` stores to manage language state globally.
- **`src/lib/LanguageChooser.svelte` (New)**:
    - A dropdown component that displays available languages.
    - Automatically updates the URL (e.g., from `/de-DE/projects/...` to `/en/projects/...`) when a new language is selected.
    - Uses a mapping for common language codes to display friendly names (e.g., "de-DE" -> "Deutsch").
    - Sorts languages alphabetically by their display name.
- **`src/App.svelte`**:
    - Integrated the `LanguageChooser` into a new `global-nav-bar` at the top of the page.
    - Added basic styling for the top bar to match the RPL layout.
- **`src/routes/TutorialView.svelte` & `src/routes/HomeView.svelte`**:
    - Updated to sync the `currentLanguage` and `availableLanguages` stores based on the URL and API response.

## Verification Results

- **Language Detection**: Verified that the API correctly identifies available languages (e.g., `silly-eyes` shows 14+ languages).
- **Switching**: Verified that selecting a language in the dropdown updates the URL and reloads the content in the chosen language.
- **Home Page**: The language chooser on the home page correctly filters/updates the project list based on the selected language.
- **Persistence**: The language is preserved in the URL, allowing for direct linking to localized versions.
