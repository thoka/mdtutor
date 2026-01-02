# Implementation Plan: Migration to pnpm

Migration of the monorepo package management from npm to pnpm for better dependency handling and performance.

## Phase 1: Tests First
- [x] Run existing tests with npm to establish baseline (Note: some content-related tests were already failing).
- [ ] Verify `pnpm install` produces a working environment.
- [ ] Run `pnpm test` and ensure no new regressions are introduced.

## Phase 2: Implementation
- [x] Create `pnpm-workspace.yaml`.
- [x] Update `apps/web/package.json` to use `workspace:*` for local packages.
- [x] Add missing transitive dependencies to `packages/parser/package.json` (e.g., `micromark-util-symbol`).
- [x] Generate `pnpm-lock.yaml`.
- [x] Remove `package-lock.json`.

## Phase 3: Verification
- [x] Successful `pnpm install`.
- [x] Successful `pnpm run lint`.
- [x] Verify workspace linking.
