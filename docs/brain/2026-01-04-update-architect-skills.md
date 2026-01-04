# Brain: Update Severin Architect Skills

Updating the `Severin Architect` skill to include missing insights from the engine analysis, specifically regarding `sv_gen`, service probes, and actionable fixes.

## Tasks
- [x] Update `severin/rules/1-skills/architect.rb` with enhanced descriptions and rules.
- [x] Run `sv gen` to synchronize `.cursorrules`.
- [x] Run `sv check` to verify overall project integrity.
- [x] Commit changes using `sv commit`.

## Details
- **Status**: ship-it
- **Topic**: Architecture Documentation
- **Insights to add**:
    - Immutable Rules Policy (use `sv_gen`, don't edit `.cursorrules`).
    - Actionable Fixes (check Ruby files for `fix` blocks).
    - Service Probes (check `sv status` for real readiness).

