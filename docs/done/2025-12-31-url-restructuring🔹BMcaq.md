# Implementation Plan - URL Restructuring 🔹BMcaq

Restructure the web app URLs to match the original Raspberry Pi projects structure: `/{lang}/projects/{slug}/{step}`.

## Proposed Changes

### Web App (`apps/web`)

1.  **`src/App.svelte`**:
    *   Update `routes` to include `/:lang/projects/:slug` and `/:lang/projects/:slug/:step`.
    *   Keep old routes as redirects or fallbacks if necessary, but the user wants the new structure.

2.  **`src/routes/TutorialView.svelte`**:
    *   Update `params` type to include `lang`.
    *   Extract `lang` from `params`.
    *   Update `loadTutorial` to use the `lang` from `params`.
    *   Update navigation functions (`handleNavigate`, `handlePrevious`, `handleNext`) to use the new URL structure: `/${lang}/projects/${slug}/${newStep}`.

3.  **`src/routes/HomeView.svelte`**:
    *   Update project links to use the new structure.

### API Server (`packages/api-server`)

1.  **`src/server.js`**:
    *   The API already supports `?lang=...`. No major changes needed unless we want to support the new URL structure directly in the API (but the web app handles the mapping).

## Verification Plan

1.  **Manual Test**:
    *   Navigate to `http://localhost:5201/#/de-DE/projects/space-talk/0`.
    *   Verify the tutorial loads in German.
    *   Navigate to `http://localhost:5201/#/en-GB/projects/space-talk/0`.
    *   Verify the tutorial loads in English (if available).
    *   Check navigation (Next/Previous) and verify the URL remains consistent.

2.  **Automated Test**:
    *   Update existing tests if they rely on the old URL structure.
