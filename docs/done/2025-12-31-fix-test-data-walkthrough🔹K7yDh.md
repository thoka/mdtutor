# Walkthrough - Fix `test:data` and Content Structure 🔹K7yDh

Date: 2025-12-31
Topic: Repaired `npm run test:data` and ensured compliance with the new content structure.

## Summary
The data fetching process has been restored and aligned with the new provider-based architecture. Cloned repositories are now stored in `content/RPL/projects`, while API JSON snapshots remain in a flat `test/snapshots` directory. The API server has been updated to support this hybrid structure.

## Changes

### 1. Metadata & Pathways
- Restored `content/RPL/meta.yml` with the `rpl` namespace.
- Verified `content/RPL/pathways/rpl-pathways.yaml` exists and contains valid project slugs.

### 2. `test/get-test-data.js`
- Updated `PROJECTS_DIR` to `content/RPL/projects`.
- Removed redundant subdirectory creation in `test/snapshots` to maintain a flat structure for API JSON files.
- Verified that `npm run test:data` successfully clones repos and fetches API data.

### 3. API Server (`packages/api-server/src/server.js`)
- Added `SNAPSHOTS_DIR` constant pointing to the root `test/snapshots`.
- Updated `getProjectData` to look for API JSON files in `test/snapshots` as a fallback if they are missing from the project directory.
- This ensures that namespaced requests (e.g., `rpl:silly-eyes`) can still find their cached API data.

### 4. Verification
- Created `test/structure-compliance.test.js` which verifies:
    - Provider metadata existence and correctness.
    - Pathway file existence.
    - Repository cloning location.
    - Flat API snapshot storage.
- All 4 structure compliance tests passed.

## Results
- `npm run test:data` is fully functional.
- The project structure is clean and follows the new architecture.
- The API server correctly handles the transition by supporting both repo-based parsing and snapshot-based fallbacks.
