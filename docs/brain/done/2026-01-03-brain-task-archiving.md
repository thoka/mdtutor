# Brain: Brain Task Archiving on Ship

## Context
Brain documents are used to plan features. Once a feature is shipped, the brain document remains in `docs/brain/`, cluttering the directory. Different agents use different ways to mark tasks, making automation difficult.

## Goal
Automate the archiving of completed brain documents to `docs/brain/done/` during the `sv_ship` process. Define a standard for task marking.

## Implementation Plan
1. [x] Define standard task marking: Use Markdown checkboxes (`- [ ]`, `- [x]`) in brain documents.
2. [x] Add rule to `severin/rules/1-process/workflow.rb` enforcing this standard.
3. [x] Create `docs/brain/done/` directory.
4. [x] Modify `severin/actions/ship.rb` to move completed brain documents to `done/` after successful merge to main.

## Verification
- [x] Rule check fails if brain document has uncompleted tasks? (Confirmed via manual check of logic).
- [x] `sv_ship` moves the file to `docs/brain/done/`.
