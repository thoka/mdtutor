# Walkthrough - Pathway-only Overview

The project overview page now only shows projects that are part of the learning pathways defined in the content.

## Changes

### API Server
- Added `getPathwayProjects()` helper to `packages/api-server/src/server.js`.
- Updated `/api/projects` route to be pathway-driven. It now iterates over all projects defined in pathways.
- If a project's directory is missing, it is still included in the list with a generated title (e.g., "Space Talk") and an `unavailable: true` flag.

### Tests
- Updated `packages/api-server/test/pathway-filtering.test.js` to verify:
    - All 8 projects from `rpl-pathways.yaml` are returned.
    - Non-pathway projects are excluded.
    - Direct access to non-pathway projects still works.

## Verification Results
- The test passed successfully.
- All 8 projects from the pathway are now visible in the API response.
- Missing projects show up with their slugs converted to titles.
