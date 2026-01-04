# Implementation Plan - Auto-Advance (Scroll & Navigate) 🔹4x5KR

Experimental feature to automatically scroll to the next task or navigate to the next step upon task completion.

## Phase 1: Tests First

### 1. Vitest Unit Test
Create `apps/web/src/lib/preferences.test.ts` to verify:
- Preferences store correctly loads/saves from localStorage.
- Default values are correct (autoAdvance = false).

### 2. Playwright E2E Test
Create `apps/web/e2e/auto-advance.spec.ts` to verify:
- With autoAdvance enabled:
  - Checking a task scrolls the next task into view.
  - Checking the last task navigates to the next step.
- With autoAdvance disabled:
  - Checking a task does nothing automatic.

## Phase 2: Implementation

### 3. Preferences Store
Create `apps/web/src/lib/preferences.ts`:
- Writable store for `userPreferences`.
- Initially contains `autoAdvance: boolean`.

### 4. Auto-Advance Logic
Modify `apps/web/src/lib/StepContent.svelte`:
- Subscribe to `userPreferences`.
- In `attachTaskHandlers`, when a checkbox is checked:
  - Find the next task (`.c-project-task`).
  - If found, scroll to it smoothly.
  - If NOT found (last task), call a navigation helper.

Modify `apps/web/src/routes/TutorialView.svelte` (or use a shared store action):
- Provide a mechanism for `StepContent` to trigger "next step".

### 5. UI for Toggle
Add a temporary toggle in `apps/web/src/lib/Sidebar.svelte` or `TutorialView.svelte` to enable/disable this feature.

## Phase 3: Verification

### 6. Run Tests
- `npm run test:unit apps/web/src/lib/preferences.test.ts`
- `npm run test:e2e e2e/auto-advance.spec.ts`
