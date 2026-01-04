# Walkthrough - Sidebar Progress Indicators 🔹EWUp7

## Changes
- **Enforced TDD in Project Rules**: Updated `PROJECT_RULES.md` to require a `Phase 1: Tests First` section in implementation plans.
- **Sidebar UI**: Updated `apps/web/src/lib/Sidebar.svelte` to display circular progress indicators (x/y) or a green checkmark for completed steps.
- **Refined Styling**:
  - **Fraction-Style**: Steps in progress show tasks as a compact fraction (e.g., 3/4) with adjusted vertical positions and a tighter slash.
  - **Decent Done State**: Completed steps now have a smaller green circular background (22px) with a proportional white checkmark, making them visually more subtle than the in-progress states (32px).
- **Data Flow**: 
  - `apps/web/src/routes/TutorialView.svelte` now calculates step interactions and passes them to the Sidebar.
  - Added `lastActionTimestamp` store to `apps/web/src/lib/achievements.ts` to signal when an action has been tracked.
  - `apps/web/src/routes/TutorialView.svelte` reacts to `lastActionTimestamp` by refreshing the `userState` from the backend.

## Verification Results
- **Unit Tests**: `npm run test:unit src/lib/Sidebar.test.ts` passed with 4 tests.
- **E2E Tests**: `npm run test:e2e e2e/sidebar-progress.spec.ts` passed with 2 tests, verifying real-time updates when checking tasks.

## Visual Summary
- **In Progress**: 32px circle (black for tasks, blue for quizzes) with a tight fraction display.
- **Done**: 22px green circle with a small white checkmark.
