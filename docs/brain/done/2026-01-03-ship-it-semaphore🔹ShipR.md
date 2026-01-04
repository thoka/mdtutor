# Brain: Release Safety with 'ship-it' Semaphore
Status: ship-it

## Context
To prevent premature merging and shipping to `main`, a manual confirmation step is needed. Relying only on conversational agreement is prone to errors.

## Goal
Introduce a mandatory `Status` field in brain documents. The `sv_ship` action should only proceed if the status is explicitly set to `ship-it`.

## Implementation Plan
1. **Rule Addition**: Add a new check `Release-Freigabe (Status) 🔹ShipReady` to `severin/rules/1-process/workflow.rb`.
2. **Logic**: The rule should scan the relevant brain document for the current branch and check for `Status: ship-it`.
3. **ID Stamping**: Run `inject_ids.rb` to ensure the new rule gets a diamond ID.
4. **Documentation**: Update `.cursorrules` to inform AI agents about this new requirement.

## Verification
- [x] `sv check` fails if status is `in-progress`.
- [x] `sv check` passes if status is `ship-it`.
- [x] `sv_ship` is blocked until status is `ship-it`.

## Tasks
- [x] Implement rule in `workflow.rb`
- [x] Run `sv gen` and `inject_ids.rb`
- [x] Verify blocking behavior
- [x] Final ship with `ship-it` status

