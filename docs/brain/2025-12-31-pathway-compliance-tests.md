# Implementation Plan - Pathway Compliance Tests

Add API compliance tests for all projects listed in `scratch-intro` pathway.

## User Request
"füge api compliance test für alle projekte aus pathways.yaml/scratch-intro hinzu"

## Proposed Changes
- Enhance `packages/parser/test/test-utils.js` with text normalization (whitespace, smart quotes) to focus on structural compliance.
- Create `packages/parser/test/pathway-compliance.test.js`
- The test will:
    - Load `test/pathways.yaml` using `js-yaml`.
    - Iterate over projects in `scratch-intro`.
    - For each project, test both `en` and `de-DE` if available.
    - Compare the local parser output with the reference API snapshot using `test-utils.js`.
    - Focus on structural compliance: HTML tags, classes, IDs, and step attributes.
    - Ignore whitespace and smart quote differences in text content.

## Verification Plan
- Run `npm test` in `packages/parser`.
- Ensure all `scratch-intro` projects pass the compliance check in available languages.
