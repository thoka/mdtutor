# Implementation Plan - Sticky Task Checkboxes 🔹7sPhQ

This plan outlines the changes to make task checkboxes sticky, so they remain visible while the user scrolls through a long task description.

## Phase 1: Tests First

### 1. E2E Test (Playwright)
Create `apps/web/e2e/sticky-tasks.spec.ts` to verify:
- Open a project with a long task.
- Scroll down until the top of the task container is out of view.
- Verify that the checkbox (`.c-project-task__checkbox`) is still visible within the viewport (using its bounding box or visibility check).

## Phase 2: Implementation

### 2. Styling
Update `apps/web/src/app.css`:
- Set `position: sticky` on `.c-project-task__checkbox`.
- Add a `top` offset (e.g., `1rem` or matching the header height).
- Ensure `.c-project-task` has `overflow: visible` to not break stickiness.

## Phase 3: Verification

### 3. Run Tests
- `cd apps/web && npm run test:e2e e2e/sticky-tasks.spec.ts`
