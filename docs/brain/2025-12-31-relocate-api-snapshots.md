# Implementation Plan: Relocate RPL API Snapshots

Relocate RPL API JSON dumps to `test/snapshots` with a flat directory structure, while keeping tutorial repositories in `content/RPL/projects`. Update the generation script and all tests to reflect this change.

## Proposed Changes

### 1. Update Snapshot Generation Script
- Modify `test/get-test-data.js` to:
    - Use `content/RPL/projects` for cloned repositories.
    - Use `test/snapshots` for all API-related JSON files.
    - Flatten the file structure in `test/snapshots` using filenames like `<slug>-api-project-<lang>.json`.

### 2. Update Test Utilities
- Modify `packages/parser/test/test-utils.js`:
    - `findProjects` will continue to look in `content/RPL/projects` for repositories.
    - `loadApiData` and `loadQuizApiData` will look in `test/snapshots` with the new flat naming scheme.

### 3. Update Integration and Parity Tests
- Update hardcoded paths in the following files:
    - `packages/parser/test/integration.test.js`
    - `packages/parser/test/compare-cats-vs-dogs-api.test.js`
    - `packages/parser/test/compare-quiz-api-exact.test.js`
    - `packages/parser/test/compare-quiz-api.test.js`
    - `packages/parser/test/parse-project-quiz-integration.test.js`
    - `packages/parser/test/silly-eyes-parity.test.js`
    - `packages/parser/test/pathway-compliance.test.js`
    - `packages/parser/test/step-content-exact.test.js`
    - `packages/parser/test/raw-delimiters.test.js`

### 4. Update Project Rules
- Update `PROJECT_RULES.md` to reflect the new data organization.

