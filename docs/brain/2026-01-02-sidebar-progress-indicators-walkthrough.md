# Walkthrough - Sidebar Progress Indicators

## Changes
- **Enforced TDD in Project Rules**: Updated `PROJECT_RULES.md` to require a `Phase 1: Tests First` section in implementation plans.
- **Sidebar UI**: Updated `apps/web/src/lib/Sidebar.svelte` to display circular progress indicators (x/y) or a green checkmark for completed steps.
- **Data Flow**: 
  - `apps/web/src/routes/TutorialView.svelte` now calculates step interactions and passes them to the Sidebar.
  - Added `lastActionTimestamp` store to `apps/web/src/lib/achievements.ts` to signal when an action has been tracked.
  - `apps/web/src/routes/TutorialView.svelte` reacts to `lastActionTimestamp` by refreshing the `userState` from the backend.
- **Styling**: Added CSS for the circular indicators in `apps/web/src/app.css`, including a blue theme for quiz-containing steps.

## Verification Results
- **Unit Tests**: `npm run test:unit src/lib/Sidebar.test.ts` passed with 4 tests.
- **E2E Tests**: `npm run test:e2e e2e/sidebar-progress.spec.ts` passed with 2 tests, verifying real-time updates when checking tasks.

## Screenshot-like Description
- Sidebar links now show a circle on the right.
- In-progress step with tasks: `2/4` in a black circle.
- In-progress step with quiz: `1/2` in a blue circle.
- Completed step: Green circle with a white checkmark icon.
