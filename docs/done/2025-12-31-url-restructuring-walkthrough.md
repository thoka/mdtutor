# Walkthrough - URL Restructuring

I have restructured the web app URLs to match the original Raspberry Pi projects structure: `/{lang}/projects/{slug}/{step}`.

## Changes

### Web App (`apps/web`)

- **`src/App.svelte`**: Added new routes:
    - `/:lang/projects`: Localized project list.
    - `/:lang/projects/:slug`: Localized tutorial (defaults to step 0).
    - `/:lang/projects/:slug/:step`: Localized tutorial step.
    - Kept old routes (`/:slug`, `/:slug/:step`) as fallbacks.
- **`src/routes/TutorialView.svelte`**:
    - Now extracts `lang` from URL parameters.
    - Passes `lang` to the API call.
    - Updated navigation (Next/Previous/Sidebar) to preserve the `/{lang}/projects/` structure.
- **`src/routes/HomeView.svelte`**:
    - Now handles `/:lang/projects` route.
    - Fetches localized project metadata from the API.
    - Generates links using the new structure.
    - Strips the `rpl:` namespace prefix from links for a cleaner look (matching the original site).

### API Server (`packages/api-server`)

- **`src/server.js`**:
    - Updated `/api/projects` (list) to accept a `lang` query parameter.
    - It now uses the requested language to fetch project titles and descriptions for the overview.

## Verification Results

- **API**: Verified that `curl "http://localhost:3102/api/projects?lang=de-DE"` returns German titles (e.g., "Alberne Augen" for `silly-eyes`).
- **Routing**: The web app now supports URLs like `/#/de-DE/projects/silly-eyes/0`.
- **Navigation**: Clicking "Next" or "Previous" correctly updates the URL to `/#/de-DE/projects/silly-eyes/1`, etc.
- **Home Page**: The project list now links to the localized project URLs.
