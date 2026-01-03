# Refactor: Dynamic Progress Calculation

**Date**: 2026-01-01
**Topic**: Switch from event-based to task-based progress calculation.

## Context
The previous logic relied on `step_complete` and `project_complete` events sent by the frontend. This led to inconsistencies when a user unchecked a task after the project was marked as completed.

## New Logic
1.  **Single Source of Truth**: Progress is calculated dynamically from the list of `task_check` / `task_uncheck` actions in the user history.
2.  **Step Completion**:
    *   A step with tasks is complete only if all tasks (and quizzes) are checked.
    *   A step without tasks is **ignored** for the total percentage calculation. This ensures that projects with introductory or informational steps can reach 100% completion by only doing the actual work.
3.  **Project Completion**: A project is 100% complete only if all its **task-bearing steps** are complete.
    *   If a project has NO tasks at all, it reaches 100% as soon as it is opened (at least one action exists).
4.  **UI Representation**:
    *   The project overview now shows `Completed Task-Bearing Steps / Total Task-Bearing Steps` (e.g., `6 / 6` instead of `8 / 8` if only 6 steps have tasks).
5.  **Resuming**:
    *   When opening a project without a step ID, the app now jumps to the `lastViewedStep` (the index of the most recent `step_view` action).
6.  **Tracking**: `step_complete` events are still tracked for history/dashboard visibility but are no longer used for progress calculation.

## Implementation
- Updated `apps/web/src/lib/progress.ts` to implement the dynamic logic.
- Updated `apps/web/src/routes/TutorialView.svelte` to redirect to `lastStep` if no step is provided.
- Updated `apps/web/src/routes/PathwayView.svelte` to use `lastStep` for the "Continue" button.
- Updated `packages/backend-ruby/db/seeds.rb` to include realistic `step_view` actions.
- Updated `apps/web/src/lib/progress.test.ts` to match the new behavior.
- Updated `apps/web/vitest.config.ts` to exclude E2E tests from unit test runs.

## Verification
- Unit tests (`npm run test:unit`) pass.
- Manual verification: Unchecking a task in a 100% finished project correctly reduces the progress percentage.
- Resuming: Clicking "Continue" on a project card goes to the last viewed step.

