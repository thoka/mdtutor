# Implementation Plan - Structural Test Improvement

Improve structural compliance tests to detect subtle HTML differences like missing `<p>` tags.

## User Request
"space-talk / 'Klicke auf jede Figur, um zu sehen, was sie tut.' ist im Original innerhalb <p>, bei uns nicht. passe die compliance-tests so an, dass sie diesen Fehler finden. erstelle dazu einen Test für den Test, mit Testcases für diese und spätere Abweichungen"

## Proposed Changes
- Enhance `packages/parser/test/test-utils.js`:
    - Fix `extractHtmlStructure` to capture top-level text nodes even when other tags are present.
    - Strengthen `compareNodes` to report `text_content_mismatch` if one node has text and the other doesn't (instead of skipping empty cases).
- Update `packages/parser/test/pathway-compliance.test.js`:
    - Improve `knowledgeQuiz` detection to not skip steps that have empty quiz objects in snapshots.
- Create `packages/parser/test/structural-comparison.test.js`:
    - Unit tests for the comparison algorithm.
    - Test cases for missing wrappers, class mismatches, extra elements, and whitespace normalization.

## Verification Plan
- Run `node --test packages/parser/test/structural-comparison.test.js` to verify the comparison logic.
- Run `npm test` in `packages/parser` and verify that `space-talk` and other projects now report structural failures that were previously hidden.

