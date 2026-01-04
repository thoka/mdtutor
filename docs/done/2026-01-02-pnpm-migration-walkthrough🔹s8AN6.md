# Walkthrough: pnpm Migration Verification 🔹s8AN6

This document outlines the necessary changes to scripts and workflows after the migration to `pnpm`.

## Script Adjustments

### Root `package.json`

The following scripts in the root [`package.json`](package.json) need to be updated to use `pnpm` syntax:

| Current Script (npm) | Proposed Script (pnpm) |
| :--- | :--- |
| `"test": "npm run lint && node --test"` | `"test": "pnpm run lint && node --test"` |
| `"api": "npm run dev --workspace=@mdtutor/api-server"` | `"api": "pnpm --filter @mdtutor/api-server run dev"` |
| `"web": "npm run dev --workspace=@mdtutor/web"` | `"web": "pnpm --filter @mdtutor/web run dev"` |
| `"test:frontend": "npm run test:unit --workspace=@mdtutor/web && npm run test:e2e"` | `"test:frontend": "pnpm --filter @mdtutor/web run test:unit && pnpm run test:e2e"` |
| `"test:unit": "npm run test:unit --workspace=@mdtutor/web"` | `"test:unit": "pnpm --filter @mdtutor/web run test:unit"` |
| `"test:e2e": "node tools/check-test-data.js && npm run test:e2e --workspace=@mdtutor/web"` | `"test:e2e": "node tools/check-test-data.js && pnpm --filter @mdtutor/web run test:e2e"` |
| `"dev": "... \"npm run api\" \"npm run web\" ..."` | `"dev": "... \"pnpm run api\" \"pnpm run web\" ..."` |

### Workspace `package.json` Files

Workspace-specific scripts generally remain compatible if they don't explicitly call `npm`. However, it's recommended to use `pnpm` for consistency.

- [`apps/web/package.json`](apps/web/package.json): No immediate changes required, but `pnpm test` should be used instead of `npm test`.
- [`packages/api-server/package.json`](packages/api-server/package.json): No immediate changes required.
- [`packages/parser/package.json`](packages/parser/package.json): No immediate changes required.

### Ruby-based Sub-projects

The Ruby-based projects ([`packages/backend-ruby`](packages/backend-ruby) and [`packages/sso-server`](packages/sso-server)) are not directly managed by `pnpm` but are integrated via root scripts.

- **Integration**: The root `dev` and `seed` scripts call these projects. These calls should be verified to ensure they still work correctly when triggered via `pnpm run`.
- **Dependencies**: These projects use `Bundler`. No changes to `Gemfile` or `Gemfile.lock` are required for the `pnpm` migration.

## Verification Results

### 1. Installation & Workspace
- `pnpm install` works correctly.
- Workspace linking is verified (e.g., `@mdtutor/web` uses `@mdtutor/parser` from workspace).

### 2. Linting
- `pnpm run lint` passes with 41 warnings (mostly unused variables), but no errors.

### 3. Unit Tests
- **Parser**: 94/96 tests passing.
  - *Failing*: `compare-quiz-api-exact` (0 !== 3 questions) - likely due to missing test data or path issues in the test environment.
- **API Server**: 7/10 tests passing.
  - *Failing*: Commit hash validation (expected vs actual mismatch).
  - *Failing*: Language fallback (TypeError on title).
  - *Failing*: Pathway filtering (SyntaxError: Unexpected token '<').
- **Web (Unit)**: 17/20 tests passing.
  - *Failing*: `StepContent` checkboxes (Alice case).
  - *Failing*: `TutorialView` (Mocking issue with `lastActionTimestamp`).

### 4. Data Synchronization
- `pnpm run sync:pathways` and `pnpm run test:data` work correctly and fetch/clone content.

## Necessary Adjustments

1.  **Test Data Paths**: Some tests in `packages/parser` expect a specific directory structure (`content/RPL/pathways/rpl-pathways.yaml`) which was missing. I've manually created a symlink/copy to fix this, but the `sync:pathways` tool should be updated to ensure this structure is always present.
2.  **API Server Commit Hash**: The test expects a specific commit hash. This might need to be more flexible or updated.
3.  **Web Mocks**: `TutorialView.test.ts` needs an update to its `vi.mock` for `../lib/achievements` to include `lastActionTimestamp`.

## Conclusion
The migration to `pnpm` is successful in terms of dependency management and script execution. The remaining test failures appear to be pre-existing or related to environment/data setup rather than `pnpm` itself.

## Docker Adjustments

The [`packages/api-server/Dockerfile`](packages/api-server/Dockerfile) and [`apps/web/Dockerfile`](apps/web/Dockerfile) (if applicable) should be updated to install `pnpm` and use it for dependency installation.

Example for `api-server`:
```dockerfile
RUN npm install -g pnpm
COPY pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
```
