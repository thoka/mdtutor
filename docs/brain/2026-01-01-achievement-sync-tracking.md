# Walkthrough: Achievement Tracking & UI Sync Improvements

This document details the fixes for UI/Backend synchronization and the implementation of new tracking features.

## 1. Syncing UI with Backend (The Alice Case)
**Issue**: Users logging in on new devices saw 0 checked subtasks even if they had progress in the backend.
**Solution**: 
- `TutorialView` now fetches `userActions` from the backend upon loading a project.
- `StepContent` and `createTaskStore` now use these actions to initialize the state of task checkboxes.
- **Verification**: `StepContent.test.ts` confirms checkboxes are checked if a corresponding `task_check` action exists.

## 2. Task Unchecking
**Feature**: Allow users to undo a task and have it reflected in their progress.
**Implementation**:
- `StepContent` now sends a `task_uncheck` action when a checkbox is unchecked.
- `calculateProgress` (Frontend) and `ActionsController` (Backend) now handle these actions.
- **Deterministic Order**: The backend now orders actions by `timestamp DESC, created_at DESC` to ensure "uncheck" correctly overrides a previous "check" if they happen in the same second.
- **Verification**: `alice_progress_spec.rb` (Backend) and `progress.test.ts` (Frontend) verify the undo logic.

## 3. Scratch Game Tracking
**Feature**: Track when a user starts a Scratch game.
**Implementation**:
- Added a `scratch-play-overlay` to Scratch iframes in `StepContent`.
- Clicking the overlay tracks a `scratch_start` action and starts the game (`autostart=true`).
- **Verification**: `StepContent.test.ts` verifies the overlay and action tracking.

## 4. Step View Tracking
**Feature**: Track which steps a user has opened.
**Implementation**:
- `step_view` actions are automatically sent in `TutorialView` when a step is loaded or navigated to.
- **Verification**: `alice_progress_spec.rb` verifies these actions are stored in the backend.

## Summary of New Tests
- **Backend (RSpec)**:
  - `correctly handles task unchecking`: Verifies undo state in DB.
  - `logs starting of scratch games`: Verifies `scratch_start` action.
  - `logs step views`: Verifies `step_view` action.
- **Frontend (Vitest)**:
  - `correctly handles task unchecking in progress calculation`: Verifies % update.
  - `correctly initializes checkboxes from userActions (Alice Case)`: Verifies UI sync.
  - `adds a play overlay to Scratch iframes and tracks scratch_start`: Verifies UI interaction.

