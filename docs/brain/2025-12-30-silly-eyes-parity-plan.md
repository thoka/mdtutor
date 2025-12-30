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
- [ ] Fix task wrapping in parser <!-- id: 2 -->
- [ ] Fix image path resolution <!-- id: 3 -->
- [ ] Verify `de-DE` parity <!-- id: 4 -->
- [ ] Verify `en` parity <!-- id: 5 -->
