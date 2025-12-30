# Implementation Plan - Silly Eyes Parity

Achieve exact HTML parity for the "Silly Eyes" project, starting with `de-DE`.

## Current Status
- Targeted testing infrastructure is in place (`silly-eyes-parity.test.js`).
- Significant structural mismatches identified in `silly-eyes/de-DE` (missing wrappers, relative paths).
- Legacy code identified for removal.

## Proposed Changes

### 1. Cleanup Legacy Code
- Remove `packages/parser/src/plugins/remark-block-delimiters.js`.
- Update `packages/parser/src/parse-tutorial.js` to remove references to the deleted plugin.

### 2. Fix Structural Mismatches
- Investigate why `u-no-print` and `c-project-task` wrappers are missing.
- Adjust `packages/parser/src/plugins/remark-yaml-blocks.js` or related plugins to ensure correct wrapping.
- Ensure image paths are handled correctly (absolute vs relative).

### 3. Verification
- Run `PROJECT=silly-eyes LANG=de-DE node --test packages/parser/test/step-content-exact.test.js` after each change.
- Aim for 0 structural differences in `de-DE`, then proceed to `en`.

## Tasks
- [x] Remove legacy `remark-block-delimiters.js` <!-- id: 0 -->
- [x] Update `parse-tutorial.js` <!-- id: 1 -->
- [x] Implement clean `remark-block-containers.js` <!-- id: 2 -->
- [x] Fix image path resolution <!-- id: 3 -->
- [x] Verify `de-DE` parity <!-- id: 4 -->
- [x] Verify `en` parity <!-- id: 5 -->
- [x] Add regression test to CI/main suite <!-- id: 6 -->

## Persistence & Regression Prevention
To ensure this progress is not lost again:
1. **Dedicated Test**: `silly-eyes-parity.test.js` will remain as a permanent part of the test suite.
2. **CI Integration**: We will add a check to the main test runner that specifically flags Silly Eyes regressions.
3. **Documentation**: The `testing_guide.md` clearly documents how to maintain this parity.





