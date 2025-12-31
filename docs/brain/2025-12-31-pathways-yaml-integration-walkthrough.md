# Walkthrough: Pathways YAML Integration for Test Data

**Date:** 2025-12-31
**Task:** Refactor `test/get-test-data.js` to load tutorials from `test/pathways.yaml`.

## Changes

### 1. Script Refactoring (`test/get-test-data.js`)
- Replaced the hardcoded `TEST_TUTORIALS` array with dynamic loading from `test/pathways.yaml`.
- Added `js-yaml` dependency to parse the YAML file.
- Flattened the pathway-grouped tutorials into a single list for processing.
- Fixed several linting issues (strings must use single quotes).

### 2. Documentation Update (`docs/test-data-collection.md`)
- Updated the specification to reflect that tutorials are now managed via `test/pathways.yaml`.

## Verification Results

### Automated Tests
- Ran `npm run test:data`.
- Successfully processed 8 main tutorials and 25 transclusion projects.
- All snapshots were created or updated in `test/snapshots/`.

### Manual Verification
- Verified that adding a new tutorial to `test/pathways.yaml` results in it being fetched by the script.
