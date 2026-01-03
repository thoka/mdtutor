# Brain: Refactor Rule IDs to Diamond Suffix

## Context
The current Rule ID format (`📜xxxxx` at the beginning) is functional but might be visually intrusive at the start of rules. Moving it to the end and using a different icon (`🔹xxxxx`) is proposed for a cleaner look while maintaining searchability.

## Goal
Migrate all Rule IDs from the prefix `📜xxxxx` to a suffix `🔹xxxxx`.

## Implementation Plan
1. **Update Injector Tool**: Modify `severin/engine/bin/inject_ids.rb` to:
   - Identify existing `📜xxxxx` prefixes and move them to the end as `🔹xxxxx`.
   - Ensure new rules get the `🔹xxxxx` suffix automatically.
   - Handle heredocs correctly (ID should probably be at the end of the first line or the end of the content).
2. **Migration**: Run the tool to update all rule files.
3. **Generation**: Run `sv gen` to update `PROJECT_RULES.md` and `.cursorrules`.
4. **Validation**: Verify searchability and visual appearance.

## Verification
- [x] No `📜` prefixes remain in `severin/rules/**/*.rb`.
- [x] All rules have a `🔹xxxxx` suffix.
- [x] `PROJECT_RULES.md` and `.cursorrules` reflect the change.
- [x] Searching for `🔹xxxxx` works.

## Tasks
- [x] Update `severin/engine/bin/inject_ids.rb`
- [x] Run migration
- [x] Run `sv gen`
- [x] Commit and ship

