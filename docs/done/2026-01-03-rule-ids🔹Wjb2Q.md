# Brain: Rule IDs for Searchability and Reference 🔹Wjb2Q

## Context
Rules and skills in Severin are currently identified only by their descriptive strings. This makes it hard to:
1. Grep for specific rules across the codebase.
2. Refer to rules in commits or brain documents without copying long strings.
3. Keep references stable when rule descriptions are rephrased.

## Goal
Introduce unique IDs (format: `📜xxxxx`, where `xxxxx` is 5 random alphanumeric characters) directly at the beginning of rule and check descriptions.

## Implementation Plan
1. **ID Injector Tool**: Create a Ruby script `severin/engine/bin/inject_ids.rb` that:
   - Scans `severin/rules/**/*.rb`.
   - Generates and injects `📜xxxxx` into `check`, `rule`, `define_skill`, and `define_suite` strings if not already present.
2. **Initial Stamping**: Run the tool once to stamp all current rules.
3. **DSL Integration (Optional but Recommended)**: Ensure the engine doesn't trip over these prefixes (it shouldn't, as they are just part of the string).
4. **Validation**: Ensure `sv gen` correctly includes these IDs in `PROJECT_RULES.md` and `.cursorrules`.

## Verification
- [x] All rules in `severin/rules/` have a `📜` prefix followed by 5 chars.
- [x] `PROJECT_RULES.md` shows the IDs.
- [x] `.cursorrules` shows the IDs.
- [x] Searching for a specific ID (e.g., `📜a1B2c`) leads to the correct source file.

## Tasks
- [x] Create `severin/engine/bin/inject_ids.rb`
- [x] Stamp existing rules
- [x] Run `sv gen` to update documentation
- [x] Commit changes

