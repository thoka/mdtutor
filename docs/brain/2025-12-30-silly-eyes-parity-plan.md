# Implementation Plan - Silly Eyes Parity

Achieve exact HTML parity for the "Silly Eyes" project, starting with `de-DE`, then `en`.

## Current Status
- `de-DE` parity achieved! ✅
- `en` parity achieved! ✅
- Web-app fix applied (includeQuizData: true in api-server) ✅
- All parser tests passing (80/80) ✅

## Tasks
- [x] Remove legacy `remark-block-delimiters.js` <!-- id: 0 -->
- [x] Update `parse-tutorial.js` <!-- id: 1 -->
- [x] Implement clean `remark-block-containers.js` <!-- id: 2 -->
- [x] Fix image path resolution <!-- id: 3 -->
- [x] Verify `de-DE` parity <!-- id: 4 -->
- [x] Fix trailing space issue in YAML preprocessing <!-- id: 7 -->
- [x] Fix `basePath` resolution for transclusions <!-- id: 8 -->
- [x] Fix unclosed `div` issue in Step 0 (en) <!-- id: 9 -->
- [x] Verify `en` parity <!-- id: 5 -->
- [x] Fix quiz visibility in web-app and integration tests <!-- id: 10 -->
- [ ] Add regression test to CI/main suite <!-- id: 6 -->

## Verification
- Run `node --test packages/parser/test/silly-eyes-parity.test.js` after each change.
- Aim for 0 structural differences in both `de-DE` and `en`.
