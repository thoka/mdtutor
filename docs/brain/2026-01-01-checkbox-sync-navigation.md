# Walkthrough: Checkbox Sync and Navigation Stability

This document details the fixes for Alice's checkbox visibility and the verification of navigation stability.

## 1. Alice's Checkbox Visibility
**Issue**: Alice had >60% progress, but no checkboxes were checked in "Catch the Bus".
**Reason**: The backend seeds used `step_complete` but lacked individual `task_check` actions. The UI's `taskStore` relies on `task_check` to reconstruct the state of individual checkboxes.
**Fix**: 
- Updated `packages/backend-ruby/db/seeds.rb` to include `task_check` actions for all tasks in the completed steps of "Catch the Bus".
- Increased history limit in `ActionsController` from 50 to 200 to accommodate the increased number of actions.

## 2. Expanded Test Data: "Find the Bug"
**Requirement**: Add seeds for "Find the Bug" where half of the subtasks are completed.
**Implementation**:
- Added logic to `db/seeds.rb` to calculate `(total_tasks / 2.0).ceil` for each step of "Find the Bug" and create `task_check` actions for them.
- Verified via RSpec: `has half tasks completed for find-the-bug`.

## 3. Navigation Stability
**Requirement**: Verify that opening, navigating, and leaving a project does not cause unintended achievement changes.
**Implementation**:
- Created `apps/web/src/routes/TutorialView.test.ts`.
- **Test**: `does not trigger achievement changes when opening or navigating`.
- **Verification**: Confirms that only `project_open`, `step_view`, and (upon clicking Next) `step_complete` are tracked. No `task_check` or other actions are triggered by mere navigation.

## Summary of Changes
- **Backend**:
  - `db/seeds.rb`: Detailed task-level seeding for Alice.
  - `ActionsController`: Increased history limit to 200.
  - `alice_progress_spec.rb`: Verified task-level checkmarks and half-finished project state.
- **Frontend**:
  - `TutorialView.test.ts`: New integration test for navigation behavior.
  - `StepContent.svelte`: Added safety check for `contentDiv` in timeout.

