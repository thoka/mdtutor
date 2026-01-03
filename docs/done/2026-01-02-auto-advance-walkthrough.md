# Walkthrough - Auto-Advance (Scroll & Navigate)

Experimental feature to improve user flow by automatically advancing to the next task or step upon task completion.

## Changes
- **Preferences Store**: Created `apps/web/src/lib/preferences.ts` to store user settings like `autoAdvance`, with localStorage persistence.
- **Auto-Advance Logic**:
  - Modified `apps/web/src/lib/StepContent.svelte` to detect when a task is checked.
  - If `autoAdvance` is enabled:
    - Automatically scrolls the next unchecked task into the center of the viewport.
    - If no unchecked tasks remain in the current step, it triggers navigation to the next step.
- **UI Toggle**: Added a toggle switch at the bottom of the sidebar to enable/disable this feature.
- **Data Flow**: `TutorialView.svelte` now passes its navigation handler to `StepContent`.

## Verification Results
- **Unit Test**: `apps/web/src/lib/preferences.test.ts` verified that the store correctly manages state and persistence.
- **E2E Test**: `apps/web/e2e/auto-advance.spec.ts` verified:
  - Real scrolling behavior when checking a task.
  - Automatic navigation to the next step when the last task is checked.
  - No automatic behavior when disabled.
