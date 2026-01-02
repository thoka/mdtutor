# Walkthrough: pnpm Migration

The project has been migrated from npm workspaces to pnpm.

## Changes
- Added `pnpm-workspace.yaml`.
- Updated `apps/web/package.json` to use `workspace:*` syntax.
- Added `micromark-util-symbol` to `packages/parser/package.json` to fix a phantom dependency issue.
- Replaced `package-lock.json` with `pnpm-lock.yaml`.

## Verification Results
- `pnpm install`: Success.
- `pnpm run lint`: Success (after minor fixes).
- `pnpm test`: Baseline established. Some tests fail due to missing content files, which is unrelated to the package manager change.
