# Walkthrough: Progress Verification for Alice

This document details the verification and adjustment of Alice's progress tracking for the "Catch the Bus" project.

## Initial State
- **Project**: "Catch the Bus" (RPL:PROJ:catch-the-bus) has 9 steps.
- **Goal**: Reach 50% (initial) then 60%+ progress.
- **Issue**: Initial seeding for Alice resulted in low progress (~17%) because the project has more tasks per step than initially estimated.

## 1. Backend Verification
A new RSpec request test was added to `packages/backend-ruby/spec/requests/api/v1/alice_progress_spec.rb` to verify that the API returns the correct actions for Alice.

### Actions taken:
- Updated `packages/backend-ruby/db/seeds.rb` to include `Action.destroy_all` for a clean state.
- Seeded Alice's progress for "Catch the Bus" by completing steps 0, 1, 2, 3, 4, and 5.
- Verified actions are stored in the database and served via API.

## 2. Frontend Testing (Vitest)
A new frontend test was added to `apps/web/src/lib/progress.test.ts` using Vitest.

### Setup:
- Installed `vitest`, `@testing-library/svelte`, `jsdom`.
- Configured Vitest in `apps/web/vitest.config.ts`.
- Added `npm run test:unit` to `apps/web/package.json`.

### Verification Flow:
1. **Initial Failing Test**: A test was created expecting 60% progress while Alice only had ~50% (4.5 steps). The test failed as expected: `AssertionError: expected 51 to be greater than or equal to 60`.
2. **Achievement Trigger**: Updated backend seeds to complete 6 full steps for Alice (steps 0-5).
3. **Passing Test**: 6 / 9 steps results in 67% progress. The test now passes.

## 3. Results
- **Backend Test**: `1 example, 0 failures`
- **Frontend Test**: `1 passed`
- **Current Alice Progress**: 67% (6/9 steps)

## Summary of Changes
- **Backend**:
  - `packages/backend-ruby/db/seeds.rb`: Added `destroy_all` and expanded Alice's progress.
  - `packages/backend-ruby/spec/requests/api/v1/alice_progress_spec.rb`: New progress verification spec.
- **Frontend**:
  - `apps/web/package.json`: Added `test:unit` script and dependencies.
  - `apps/web/vitest.config.ts`: Vitest configuration.
  - `apps/web/src/test/setup.ts`: Test environment setup.
  - `apps/web/src/lib/progress.test.ts`: Progress calculation tests.
- **Root**:
  - `.gitignore`: Improved SQLite temp file ignore rules.

