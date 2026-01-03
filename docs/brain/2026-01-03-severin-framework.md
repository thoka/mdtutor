# Implementation Plan - Severin Framework (Rebranded from Sentinel)

The Severin Framework is a lightweight validation and agent-guidance system designed to ensure project integrity and provide clear instructions for AI assistants.

## Current Progress (2026-01-03)

### 1. Core Rebranding
- [x] Rename all core components from Sentinel to Severin.
- [x] Update MCP server (`~/.severin/mcp/server.rb`) to use `sv_` tool prefixes.
- [x] Update global generator (`~/.severin/generate_rules.rb`) to support Severin logic.

### 2. Architectural Refactoring
- [x] Implement **Environment Registry** in `Severin` core.
- [x] Introduce `0-config` stage for project-specific output definitions.
- [x] Decouple generator from hardcoded file paths using introspection (`Severin.environments`).
- [x] Move rules into numbered stages (`1-process`, `1-skills`, etc.).
- [x] Clean up legacy structures and document directory roles via READMEs.

### 3. Language Guidance
- [x] Support separate languages for **Chat** (e.g., German) and **Documentation** (e.g., English).
- [x] Automatically inject language instructions into AI environments (`.cursorrules`).
- [x] Add integrity checks to ensure language consistency across generated files.

## Next Steps

### 4. Advanced Validation
- [ ] Implement deeper content validation for specific stages (Setup, Data, Services).
- [ ] Add more "Skills" for specialized AI roles (e.g., DevOps, Security).

### 5. Community Readiness
- [ ] Refine the README and "Self-Documentation" to make the framework approachable for external users.
- [ ] Ensure `sv init` command works reliably for new projects.

## Configuration (As Code)
Projects define their goals in `severin/rules/0-config/environments.rb`:
```ruby
define_environment ".cursorrules" do
  format :ai
  chat_language "Deutsch"
  doc_language  "English"
end
```
