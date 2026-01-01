# MDTutor Project Rules & Instructions

Expert guidance for coding in the MDTutor monorepo. This file serves as the central source of truth for AI agents and developers.

## Architecture & Data Flow
- **Monorepo**: Uses npm workspaces. `packages/` contains shared logic, `apps/` contains end-user applications.
- **Ecosystems & Layering**: Content is organized into **Ecosystems** (e.g., `content/RPL`). Each ecosystem has multiple **Layers** (e.g., `layers/official`, `layers/tag-makerspace`). 
- **Layer Priority**: Layers are prioritized (defined in `config/sync.yaml`). Local forks in higher-priority layers override official content.
- **Global Identifiers (GIDs)**: Content elements use GIDs (`ECOSYSTEM:TYPE:SLUG`) for semantical identity across forks and languages.
- **Parser (`packages/parser`)**: Converts Markdown to semantic JSON using `unified.js`, extracting GIDs and semantic metadata.
- **API Server (`packages/api-server`)**: Express server resolving prioritized content from layers using GID mapping.
- **Web App (`apps/web`)**: Svelte 5 + Vite frontend.

## Critical Workflows
- **Planning First**: **NO CODING WITHOUT A PLAN.** Before any functional code changes:
  1. Create a **feature branch** (`feature/name`).
  2. Create and **commit** an Implementation Plan in `docs/brain/YYYY-MM-DD-feature-name.md`.
- **Setup**: `npm install` followed by `npm run test:data` to fetch reference snapshots. Cloned repositories go to `content/RPL/layers/official/projects`, while API JSON dumps go to `test/snapshots` (flat structure).
- **Development**: `npm run dev` runs both API (API_PORT) and Web (WEB_PORT) concurrently.
- **Testing**: `npm test` in `packages/parser` runs parser integration tests.
- **Linting**: `npm run lint` (ESLint 9).

## Development Cycle & Git Rules
- **Minimalism**: Generate as little code and documentation as possible. Keep responses concise.
- **Test-First (TDD)**: Always write and commit tests *before* implementing features.
- **Branching**: Use feature branches (`feature/name`). Never commit directly to `main`.
- **Commits**: Use Conventional Commits. Commit subtasks immediately; avoid large "WIP" commits.
- **Planning**: Implementation plans MUST be discussed and approved BEFORE coding starts.
- **Verification**: Merge to `main` only after full verification and passing tests.
- **Review**: Never merge into `main` without a review and approval.
- **Dates**: Always use the actual current date (check with `date` command if unsure). Never guess or use future dates.

## Iteration Flow
1.  **Preparation**: Create a feature branch.
2.  **Proposal**: Document the approach in `docs/brain/YYYY-MM-DD-feature-name.md` (Implementation Plan).
3.  - **Approval (MANDATORY)**: Present the proposal and wait for explicit feedback/approval BEFORE starting implementation.
4.  - **Clarification**: If an iteration is "expensive" (complex/time-consuming), ask for clarification *before* starting.
5.  **Execution (TDD)**: Implement subtasks using TDD. Log progress and changes in the brain document.
6.  **Walkthrough**: Document the final state/result in a `*-walkthrough.md` in `docs/brain/`.
7.  **Review**: Final verification and merge request.

## Documentation
- **Distributed**: Keep documentation within the respective module's `docs/` directory.
- **Brain (`docs/brain/`)**: Use for tracking ongoing work. Use date-prefixed files: `YYYY-MM-DD-topic.md` for plans and `YYYY-MM-DD-topic-walkthrough.md` for results.
- **Specifications**: Core project spec in `docs/SPEC.md`.
## Project Conventions
- **Svelte 5**: Use Runes (`$state`, `$derived`, `$effect`, `$props`) exclusively. Avoid Svelte 4 syntax.
- **Language Fallback**: Default to `de-DE`, fallback to `en`. API handles this via `getProjectData`.
- **Parser Plugins**: Custom plugins in `packages/parser/src/plugins/` handle RPL-specific markdown extensions (e.g., `--- task ---`).
- **Styling**: Cloned from Raspberry Pi Learning (RPL). See `apps/web/src/styles/rpl-cloned/`.

## Key Files
- [packages/parser/src/parse-tutorial.js](packages/parser/src/parse-tutorial.js): The `unified` pipeline configuration.
- [packages/api-server/src/server.js](packages/api-server/src/server.js): API routing and language fallback logic.
- [apps/web/src/routes/TutorialView.svelte](apps/web/src/routes/TutorialView.svelte): Main tutorial rendering component.
- [docs/SPEC.md](docs/SPEC.md): Core project specification.

## Agent Toolbox
| Tool | Description |
| --- | --- |
| `compare-structure.js` | Compare HTML structure between reference and local. |
| `extract-css.js` | Extract CSS from reference pages. |
| `extract-structure.js` | Extract HTML structure from a single page. |
| `save-html.js` | Save rendered HTML for inspection. |

## Integration Patterns
- **API Responses**: Must match the [Raspberry Pi Learning API](https://learning-admin.raspberrypi.org/api/v1/) structure.
- **Transclusions**: Handled by `remark-transclusion` plugin, resolving relative paths across repositories.
