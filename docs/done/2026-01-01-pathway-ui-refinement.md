# Implementation Plan: Pathway Progress & UI Refinement

**Date**: 2026-01-01
**Feature Branch**: `feature/pathway-completion-and-ui`

## Context
The pathway view and progress calculation needed refinement to handle steps without tasks correctly and to provide a better user experience on different screen sizes.

## Problem Statement
1.  **Progress Calculation**: Steps without tasks were counting towards the total, making it impossible to reach 100% if some steps (like intros) didn't have `step_complete` events or tasks.
2.  **UI Step Count**: The overview showed "X / Total Steps" (e.g., 0 / 8), which was confusing if only 6 steps had tasks.
3.  **Layout**: The grid was not utilizing wide screens effectively, and images were too large, pushing text content down.

## Proposed Changes

### 1. Progress Logic (`apps/web/src/lib/progress.ts`)
- [x] Refactor `calculateProgress` to count steps with actual tasks/quizzes (`taskStepsCount`).
- [x] Base percentage calculation on `taskStepsCount`.
- [x] Ensure projects with no tasks reach 100% upon opening.
- [x] Track `lastViewedStep` for resuming tutorials.

### 2. Frontend UI (`apps/web/src/routes/PathwayView.svelte`)
- [x] Update step count display to use `completedSteps / taskStepsCount`.
- [x] Refactor CSS grid to use `auto-fit` and `justify-content: center`.
- [x] Reduce image height and increase heading/description font sizes for better readability.
- [x] Optimize sidebar width for larger action buttons.

### 3. Verification
- [x] Unit tests in `progress.test.ts` to verify the new logic.
- [x] Manual verification of the layout on different screen widths.

## Approval
- [ ] Approved by USER

