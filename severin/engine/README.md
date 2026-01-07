# 🐺 Severin Engine

> **Note:** Severin is currently under heavy development. It is being incubated and refined as part of the **MDTutor AI** project, serving as its primary orchestration and integrity engine.

Severin is a lightweight, Ruby-based orchestration and integrity framework designed for AI-augmented development. It provides automated checks, rule enforcement, and documentation generation, specifically optimized for integration with AI agents via the Model Context Protocol (MCP).

## Key Features

- **State-Aware Orchestration**: Dynamically activate skills and rules based on the current task state (`severin_state.rb`).
- **Strict Integrity Enforcement**: A binary success model (PASS/FAIL) that ensures project standards are met without silent warnings. Includes **MCP Fail-Fast** to guarantee that the agent's infrastructure (MCP servers) is healthy.
- **Observability by Design**: A dual-logging system (`debug.log` and `debug.jsonl`) provides persistent, traceable history for both humans and AI agents.
- **Validated References**: Link documentation directly to rules with automated file existence checks.
- **On-Demand Prompts**: Generate specialized AI prompt files (`.cursor/prompts/`) directly from rule definitions, including **Discourse Traces** for session narratives.
- **Single Source of Truth**: Rules are defined as executable Ruby objects, keeping documentation and validation in sync.

## Architecture Overview

The engine is built on a modular architecture:

- **Core Module (`lib/severin.rb`)**: Manages the DSL, rule definitions, state evaluation, and tag-based filtering.
- **Structured Logging (`lib/severin/logger.rb`)**: Implements persistent, dual-output logging with Discourse-inspired patterns.
- **CLI (`lib/severin/cli.rb`)**: The `sv` command-line interface for running checks (`check`), managing tasks (`skills`), and generating rules (`gen`).
- **Rule Generator (`generate_rules.rb`)**: Transforms Ruby definitions into human-readable (`PROJECT_RULES.md`) and agent-readable (`.cursorrules`) formats.
- **Action System**: Provides automated "Actions" (e.g., orchestrated commits) available via CLI or MCP.

## Directory Structure

```text
severin/engine/
├── bin/                 # Executable binaries (sv, inject_ids)
├── lib/                 # Core Ruby library
│   ├── severin.rb       # Main module, DSL & State evaluation
│   ├── severin/         # Sub-components (CLI, Action, Config, Service)
├── generate_rules.rb    # Documentation & Prompt generation logic
└── README.md            # You are here
```

## Development Workflow

When contributing to the Severin Engine:

1. **Rule-First**: New features should be codified as Severin rules within the engine or the target project.
2. **State Control**: Use `severin_state.rb` to test new skills or tags during development.
3. **Integrity**: Ensure changes follow the "Strict by Default" principle.
4. **Submodule Sync**: Changes to the engine must be committed within the engine submodule and synced with the parent project.

## 🐺 CLI Commands

Severin provides a powerful CLI via the `sv` command:

- `sv check`: Führt alle Integritäts-Checks aus.
- `sv skills`: Zeigt alle aktiven Skills für das aktuelle Projekt an.
- `sv branch id=🔹xxxxx`: Erstellt einen neuen Feature-Branch basierend auf einer Brain-ID.
- `sv tags`: Führt ein Audit des Agentic Memory durch (aktive/verfügbare Tags und Skills).
- `sv gen`: Synchronisiert Regeln mit `.cursorrules` und Prompts.
- `sv commit`: Orchestrierter Commit mit Integritäts-Checks.
- `sv commit-engine`: Isoliert Änderungen an der Engine committen.
- `sv next-id`: Generiert eine neue RID (Random ID).

## Relationship with MDTutor

Severin is the "brain" of the MDTutor project. While designed to be project-agnostic, its features are currently driven by the requirements of building a complex, AI-assisted educational platform. The goal is to evolve Severin into a standalone framework for any AI-augmented codebase.
