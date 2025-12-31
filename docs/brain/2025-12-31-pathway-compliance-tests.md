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

## Progress Log

- **2025-12-31**: Initial research and plan creation.
- **2025-12-31**: Implemented `pathway-compliance.test.js` with structural HTML comparison.
- **2025-12-31**: Enhanced `test-utils.js` with `normalizeText` to handle whitespace and smart quotes.
- **2025-12-31**: Integrated quiz validation against `api-quiz-*.json` snapshots.
- **2025-12-31**: Fixed bug in `parse-question.js` where `()` choices were skipped.
- **2025-12-31**: Verified all 6 projects in `scratch-intro` pathway (11 tests total across en/de-DE).

## Results

All projects in the `scratch-intro` pathway are now structurally compliant with the reference API:
- `space-talk` (en, de-DE)
- `catch-the-bus` (en, de-DE)
- `find-the-bug` (en, de-DE)
- `silly-eyes` (en, de-DE)
- `surprise-animation` (en, de-DE)
- `i-made-you-a-book` (en)

The tests verify:
1. Metadata (title, step count).
2. Step attributes (quiz status, challenge status).
3. HTML structure (tags, classes, IDs) using normalized text.
4. Quiz structure (question count, answer count, correct answers).
