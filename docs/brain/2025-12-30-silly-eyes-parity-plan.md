# Implementation Plan - Silly Eyes Parity

Achieve exact HTML parity for the "Silly Eyes" project, starting with `de-DE`, then `en`.

## Current Status
- `de-DE` parity achieved! ✅
- `en` parity is currently failing with 69 structural differences in Step 0.
- Identified issues:
  - Trailing spaces in YAML delimiters (e.g., `--- `) break preprocessing.
  - Potential unclosed `div` tags in `en/step_1.md` source.
  - `basePath` resolution issues for transclusions.
  - Minor mismatches like `<img>` vs `<br>` or text content differences.

## Tasks
- [x] Remove legacy `remark-block-delimiters.js` <!-- id: 0 -->
- [x] Update `parse-tutorial.js` <!-- id: 1 -->
- [x] Implement clean `remark-block-containers.js` <!-- id: 2 -->
- [x] Fix image path resolution <!-- id: 3 -->
- [x] Verify `de-DE` parity <!-- id: 4 -->
- [ ] Fix trailing space issue in YAML preprocessing <!-- id: 7 -->
- [ ] Fix `basePath` resolution for transclusions <!-- id: 8 -->
- [ ] Fix unclosed `div` issue in Step 0 (en) <!-- id: 9 -->
- [ ] Verify `en` parity <!-- id: 5 -->
- [ ] Add regression test to CI/main suite <!-- id: 6 -->

## Verification
- Run `node --test packages/parser/test/silly-eyes-parity.test.js` after each change.
- Aim for 0 structural differences in both `de-DE` and `en`.
