# MDTutor Project Instructions

Expert guidance for coding in the MDTutor monorepo.

## Architecture & Data Flow
- **Monorepo**: Uses npm workspaces. `packages/` contains shared logic, `apps/` contains end-user applications.
- **Loose Coupling**: Modules are independent. Keep logic, tests, and documentation within the module directory.
- **Parser (`packages/parser`)**: Converts Markdown to RPL-compatible JSON using `unified.js` (remark/rehype).
- **API Server (`packages/api-server`)**: Express server serving content from `test/snapshots`. Supports on-the-fly parsing and language fallback.
- **Web App (`apps/web`)**: Svelte 5 + Vite frontend. Uses `svelte-spa-router`.
- **Data Flow**: Markdown (GitHub) → Parser → JSON (RPL Format) → API Server → Svelte Frontend.

## Critical Workflows
- **Setup**: `npm install` followed by `npm run test:data` to fetch reference snapshots.
- **Development**: `npm run dev` runs both API (3001) and Web (5173) concurrently.
- **Testing**: `npm test` in `packages/parser` runs parser integration tests.
- **Linting**: `npm run lint` (ESLint 9).

## Development Cycle & Git Rules
- **Minimalism**: Generate as little code and documentation as possible. Keep responses concise.
- **Test-First (TDD)**: Always write and commit tests *before* implementing features.
- **Branching**: Use feature branches (`feature/name`). Never commit directly to `main`.
- **Documentation**: Distributed across modules. Use `docs/brain/` for tracking: `implementation_plan.md` (before), `task.md` (during), and `walkthrough.md` (after). Module-specific specifications must be placed in the respective module's `docs/` directory (e.g., `packages/parser/docs/`).
- **Commits**: Use Conventional Commits. Commit subtasks immediately; avoid large "WIP" commits.
- **Verification**: Merge to `main` only after full verification and passing tests.

## Project Conventions
- **Svelte 5**: Use Runes (`$state`, `$derived`, `$effect`, `$props`) exclusively. Avoid Svelte 4 syntax.
- **Language Fallback**: Default to `de-DE`, fallback to `en`. API handles this via `getProjectData`.
- **Parser Plugins**: Custom plugins in `packages/parser/src/plugins/` handle RPL-specific markdown extensions (e.g., `--- task ---`).
- **Styling**: Cloned from Raspberry Pi Learning (RPL). See `apps/web/src/styles/rpl-cloned/`.

## Key Files
- [packages/parser/src/parse-tutorial.js](../packages/parser/src/parse-tutorial.js): The `unified` pipeline configuration.
- [packages/api-server/src/server.js](../packages/api-server/src/server.js): API routing and language fallback logic.
- [apps/web/src/routes/TutorialView.svelte](../apps/web/src/routes/TutorialView.svelte): Main tutorial rendering component.
- [docs/SPEC.md](../docs/SPEC.md): Core project specification.

## Integration Patterns
- **API Responses**: Must match the [Raspberry Pi Learning API](https://learning-admin.raspberrypi.org/api/v1/) structure.
- **Transclusions**: Handled by `remark-transclusion` plugin, resolving relative paths across repositories.
