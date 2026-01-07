# Engine Integrity & Agentic Memory 🔹vWPMv
Status: in-progress

This document outlines the plan to stabilize the Severin engine tooling and implement new features that support the vision of the agent as a "Living Memory" (Agentic Memory).

## 🎯 Goals
- [x] Fix `sv commit-engine` and `sv [tool]` execution in the CLI.
- [x] Implement `sv branch 🔹ID` to automate feature branching aligned with Brain Docs.
- [x] Implement `sv tags` for structured context review (Agentic Memory Audit).
- [x] Codify the Workflow State Machine (State == Prompt) with `@next` dispatcher.
- [ ] Implement Reactive Event-System & Callback Chains (Rails/Discourse Pattern).
- [ ] Implement "Reflex-Hemmung" (Reflex Inhibition) concepts.
- [ ] Architecture & Implementation: State-Aware File System (SAFS).

## 🛠 Tasks
### 1. Engine Integrity (Bugfixes)
- [x] Fix CLI `else` block to handle dynamic tools (like `next-id`).
- [x] Investigate and fix `sv commit-engine` "Unknown command" issue.
- [x] Add regression tests (Specs) for CLI command dispatching.

### 2. Branch Management (Agentic Flow)
- [x] Implement `Severin::Actions::BranchAction`.
- [x] Logic: `sv branch 🔹xxxxx` -> checks for brain doc -> creates `feature/description-🔹xxxxx`.

### 3. Tag-Consistency (Context Audit)
- [x] Implement `Severin::Actions::TagsAction`.
- [x] Logic: List all defined tags, their descriptions, and current activity status.

### 4. Workflow Evolution (Next Steps)
- [ ] **State Machine Identity**: Unify Prompts and States. `@next` as the primary state transitioner.
- [ ] **Reflex Inhibition**: Block code writes in non-implementation states based on state machine.
- [ ] **Alignment & Meta**: Automate `@align` (README sync) and `@meta` (Rule sync) within the state transitions.

### 5. SAFS (State-Aware File System)
- [ ] **Architecture Design**: Implement SAFS as a decision-support layer (Labor-Instrument).
- [ ] **Metric Collection**: Log operation counts, churn size, and token-impact per variant.
- [ ] **Audit Trail**: JSONL-based logging for multi-variant comparison.
- [ ] **Emergency Exit**: Ensure 1:1 passthrough to physical FS with instant `umount` capability.

## 📐 SAFS Architecture Blueprint
SAFS is not a restrictive police layer but a measurement tool for agentic efficiency.
- **Decision Metrics**: Churn ratio (deleted vs. added), I/O blast radius (files touched), and predicted context growth.
- **Implementation**: Ruby-based FUSE or Proxy layer that intercepts I/O and enriches it with Severin state context.
- **Variant Comparison**: Use audit logs to decide between different implementation paths (A/B testing).

## 🧠 Agentic Memory Principles
- **Synapses (Tags)**: Connect intent with knowledge.
- **Episodes (Branches)**: Isolate learning cycles.
- **Instinct (Tool Integrity)**: Tools must be reflexes, not tasks.
- **Inhibition (Reflex-Hemmung)**: Discourse must precede implementation.
- **Living Memory (Idefix)**: The agent evolves with the project through codified rules.

## 🔗 References
- **Discourse Trace**: [2026-01-06 Narrative](@docs/chat/20260106_114948_discourse_trace.md)
- **Engine Documentation**: [Severin Engine README](@severin/engine/README.md)
- **Workflow Rules**: [Workflow Integrity](@severin/rules/1-process/workflow_integrity.rb)
