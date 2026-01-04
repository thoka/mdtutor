# Implementation Plan - Fix `test:data` and Content Structure 🔹Aj8eI

Date: 2025-12-31
Topic: Repair `npm run test:data` and ensure compliance with the new content structure.

## Goal
Restore the ability to fetch test data while adhering to the new provider-based structure for repositories and the flat `test/snapshots` directory for API JSON.

## Proposed Changes

### 1. Metadata Restoration
- Create `content/RPL/meta.yml` to define the RPL provider.
- Create `content/RPL/pathways/rpl-pathways.yaml` with a baseline of projects to enable data fetching.

### 2. `test/get-test-data.js` Refactoring
- Update `PROJECTS_DIR` to `content/RPL/projects`.
- Keep `SNAPSHOTS_DIR` as `test/snapshots`.
- Ensure API JSON files are saved directly in `test/snapshots` (flat structure).
- Remove redundant subdirectory creation in `test/snapshots`.

### 3. API Server Alignment
- Update `packages/api-server/src/server.js` to look for API JSON snapshots in `test/snapshots` if they are not found in the project directory.
- Ensure namespaced slugs (e.g., `rpl:silly-eyes`) correctly map to flat snapshot filenames (e.g., `silly-eyes-api-project-en.json`).

### 4. Verification
- Create `test/structure-compliance.test.js` to verify:
    - `content/RPL/meta.yml` exists.
    - `content/RPL/projects/[slug]/repo` exists for fetched projects.
    - `test/snapshots/[slug]-api-project-[lang].json` exists.
- Run `npm run test:data` and verify the output.

## Tasks
- [ ] Restore RPL metadata and pathways.
- [ ] Update `test/get-test-data.js`.
- [ ] Update `packages/api-server/src/server.js`.
- [ ] Create and run structure compliance test.
