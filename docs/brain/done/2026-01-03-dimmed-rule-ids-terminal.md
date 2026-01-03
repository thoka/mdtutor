# Brain: Dimmed Rule IDs in Terminal Output

## Context
Rule IDs (`🔹xxxxx`) are now part of the rule and suite names. In the terminal output (`sv check`), they can be visually distracting if they have the same color/weight as the main text.

## Goal
Dim (gray out) the Rule IDs in the terminal output to keep the focus on the rule descriptions while still allowing the IDs to be visible for reference.

## Implementation Plan
1. **Identify IDs**: Rule IDs match the pattern `🔹[a-zA-Z0-9]{5}`.
2. **Update HumanFormatter**: Modify `Severin::HumanFormatter` in `severin/engine/lib/severin.rb` to replace occurrences of this pattern with a dimmed version using ANSI escape codes.
3. **Helper Method**: Add a helper method to format strings by dimming IDs.

## Verification
- [x] Run `sv check`.
- [x] Verify that Rule IDs at the end of suite names and check names are displayed in gray/dimmed color in the terminal.

## Tasks
- [x] Modify `severin/engine/lib/severin.rb`
- [x] Verify with `sv check`
- [x] Commit and ship

