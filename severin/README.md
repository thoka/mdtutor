# Severin Framework

Severin is the central automated quality assurance and rule enforcement engine for the MDTutor project. It ensures codebase integrity, enforces architectural patterns (TDD, Svelte 5 Runes), and provides automated fixes.

## Orchestrator Structure

The framework is organized into layered environments and rules:

- **`environments.rb`**: Defines the project environments (e.g., Backend, Frontend, Content).
- **`runner.rb`**: A stub that delegates execution to the local Severin engine located at `severin/engine/bin/sv`.
- **`/rules`**: Contains the categorized rule definitions:
    - `1-setup`: Basic environment and dependency checks (Node, Ruby, Ports).
    - `1-process`: Workflow rules (Git branches, Brain documents, Commits).
    - `1-skills`: Role-specific constraints (Backend Architect, Frontend Expert).
    - `2-data`: Data integrity and schema validation.
    - `3-services`: API and backend service standards.
    - `4-contracts`: Interface and API contract enforcement.
    - `5-e2e`: End-to-end system health checks.

## Usage

Execute the `sv` command in your terminal to run all checks:

```bash
sv
```

The output provides automated `bash` fixes and **Contextual Guidance for AI Agents**.

## Advanced Rule Definition

Severin supports a tag-based guidance system to decouple technical tests from procedural instructions.

### Tagged Rules & Fixes

You can add tags to rules and fixes to automatically inject standardized AI instructions:

```ruby
check "Redis Connection" do
  # Tags (:service_status) before the rule text
  rule :service_status, "Redis must be reachable on port 6379"
  
  condition { # ... check redis ... }
  
  # Tags in on_fail and fix trigger central guidance from the engine
  on_fail :service_status, "Redis is down."
  fix :service_status, "sv_start redis"
end
```

### Supported Tags

- **`:git`**: Instructions for using `sv_commit` and `sv_ship`.
- **`:workflow`**: General workflow and planning guidance.
- **`:language`**: Enforcement of the German (Infrastructure) vs. English (Docs) policy.
- **`:service_status`**: Guidance for using Severin Service Management (`sv_start`).
- **`:brain_status`**: Rules for managing task progress and user approvals in Brain documents.
- **`:rspec`**: Best practices for TDD and failure analysis.

## Rules & Development

- **Language Policy**: Communication is in German, but all documentation (including rules and comments) must be in **English**.
- **TDD**: Backend changes require RSpec tests before implementation.
- **Svelte 5**: Frontend components must use Runes ($state, $derived, $props).
- **Branching**: Never commit directly to `main`. Use `feature/` branches and maintain a Brain document in `docs/brain/`.
