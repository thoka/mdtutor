# Implementation Plan - Move Auto-Advance Toggle

Move the experimental auto-advance toggle from the sidebar to the global navigation bar for better accessibility.

## Phase 1: Implementation

### 1. Update App.svelte
- Import `userPreferences` and `toggleAutoAdvance` from `./lib/preferences`.
- Add the toggle checkbox before `LanguageChooser`.
- Add styling to match the dark navigation bar.

### 2. Update Sidebar.svelte
- Remove the preferences section and related imports.

## Phase 2: Verification

### 3. Manual Verification
- Verify the toggle is visible in the top right, before the language selection.
- Verify it still toggles the behavior as expected.
