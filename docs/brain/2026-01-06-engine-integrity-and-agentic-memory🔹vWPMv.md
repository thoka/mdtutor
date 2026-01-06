# Engine Integrity & Agentic Memory 🔹vWPMv
Status: in-progress

This document outlines the plan to stabilize the Severin engine tooling and implement new features that support the vision of the agent as a "Living Memory" (Agentic Memory).

## 🎯 Goals
- [ ] Fix `sv commit-engine` and `sv [tool]` execution in the CLI.
- [ ] Implement `sv branch 🔹ID` to automate feature branching aligned with Brain Docs.
- [ ] Implement `sv tags` for structured context review (Agentic Memory Audit).
- [ ] Codify the "Meta-Meta-Thought" (Agentic Memory) into the framework's principles.

## 🛠 Tasks
### 1. Engine Integrity (Bugfixes)
- [ ] Fix CLI `else` block to handle dynamic tools (like `next-id`).
- [ ] Investigate and fix `sv commit-engine` "Unknown command" issue.
- [ ] Add regression tests (Specs) for CLI command dispatching.

### 2. Branch Management (Agentic Flow)
- [ ] Implement `Severin::Actions::BranchAction`.
- [ ] Logic: `sv branch 🔹xxxxx` -> checks for brain doc -> creates `feature/description-🔹xxxxx`.
- [ ] Logic: Automatically update `severin_state.rb` focus or tags for the new branch (optional/experimental).

### 3. Tag-Consistency (Context Audit)
- [ ] Implement `Severin::Actions::TagsAction`.
- [ ] Logic: List all defined tags, their descriptions, and current activity status.
- [ ] Logic: Show which rules are activated by the current `severin_state.rb`.

### 4. Documentation & Reflection
- [ ] Update `docs/CONVARC_WORKFLOW.md` with the new tool-supported steps.
- [ ] Create a "Discourse Trace" reflecting on the emergence of the Agentic Memory concept.

## 🧠 Agentic Memory Principles (Draft)
- **Tags are Synapses**: They connect intent (state) with knowledge (rules).
- **Branches are Episodes**: They isolate learning cycles.
- **Rules are Character**: They define the agent's behavior and values (Minimalism, TDD).

