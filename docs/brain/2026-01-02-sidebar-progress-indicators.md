# Implementation Plan - Sidebar Progress Indicators (TDD & Rules Update)

This plan includes an update to the project rules to enforce test-first planning, followed by the TDD implementation of sidebar progress indicators.

## Phase 0: Project Rules Improvement
- Update `PROJECT_RULES.md` to:
  - Enforce a `Phase 1: Tests First` section in all implementation plans.
  - Require explicit mention of Vitest and Playwright scenarios during planning.
  - Link planning directly to test design (Coding only after test confirmation).

## Phase 1: Specification (Tests First)

### 1. Unit Test (Vitest)
Create `apps/web/src/lib/Sidebar.test.ts` to verify:
- Sidebar renders progress indicators when `stepInteractions` prop is provided.
- Green circle with checkmark for 100% completion.
- Blue theme for steps containing quizzes.
- Correct text format `(x/y)` for partial completion.

### 2. E2E Test (Playwright)
Update `apps/web/e2e/tutorial-interactions.spec.ts` or create a new one to verify:
- Opening a project shows initial progress in the sidebar.
- Checking a task in `StepContent.svelte` immediately updates the sidebar indicator.
- Completing a quiz updates the sidebar indicator.

## Phase 2: Implementation

### 3. Sidebar Logic & Rendering
Modify `apps/web/src/lib/Sidebar.svelte`:
- Add `stepInteractions` prop.
- Add `$derived` logic for calculating step status.
- Update markup to include the progress circle next to the step title.

### 4. TutorialView Data Flow
Modify `apps/web/src/routes/TutorialView.svelte`:
- Calculate `stepInteractions` using `calculateProgress` from `lib/progress.ts`.
- Re-calculate on `tutorialData` or `userState` updates.
- Pass `stepInteractions` to `Sidebar`.

### 5. Styling
Update `apps/web/src/app.css`:
- Define `.c-step-progress-circle` and its variants (`--done`, `--in-progress`, `--quiz`).
- Use the green (`#42B961`) and blue (`#007bff` or similar) themes requested.

## Phase 3: Verification

### 6. Run Tests
- `cd apps/web && npm run test:unit`
- `cd apps/web && npm run test:e2e` (Requires background services via `npm run dev:test`)
