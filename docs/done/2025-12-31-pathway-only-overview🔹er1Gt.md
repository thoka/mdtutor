# Implementation Plan - Pathway-only Overview 🔹er1Gt

The user wants the project overview page to only show projects that are part of the learning pathways.

## Current State
- `/api/projects` returns all projects found in `content/*/projects/`.
- `apps/web/src/routes/HomeView.svelte` fetches all projects from `/api/projects` and displays them.
- Pathways are defined in `content/RPL/pathways/rpl-pathways.yaml`.

## Proposed Changes

### API Server (`packages/api-server/src/server.js`)
- Implement `getPathwayProjects()` to collect all project slugs mentioned in any pathway file, along with their provider info.
- Update `/api/projects` route to be pathway-driven: iterate over pathway projects and try to load their data.
- If a project in a pathway is missing from the filesystem, still include it in the list with a generated title and an `unavailable: true` flag.

### Verification
- Run the API server and check `/api/projects`.
- Open the web app and verify the overview page.

## Step-by-Step
1. [ ] Add `getPathwaySlugs` helper to `packages/api-server/src/server.js`.
2. [ ] Update `/api/projects` handler to use `getPathwaySlugs`.
3. [ ] Verify with a manual check or a small test script.
