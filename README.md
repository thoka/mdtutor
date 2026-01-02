# MDTutor

MDTutor is a markdown-based learning platform for Makerspace environments. It is designed to be fully intranet-compatible and supports content from the Raspberry Pi Learning (RPL) ecosystem, including local forks and prioritized content layering.

## Project Goal

Build a robust, local learning environment with:
- ✅ **Multi-Ecosystem Support**: Organized content as clones of different ecosystems.
- ✅ **Content Layering**: Prioritized overlays (Official < Community < Local Forks).
- ✅ **Global Identifiers (GIDs)**: Semantic tracking of progress across forks and languages.
- ✅ **SSO Server**: Central identity management with secured **Kiosk Mode** (PIN & Super-Mode).
- ✅ **Achievement System**: Event-sourced tracking with deterministic state aggregation.
- ✅ **Device Sync**: Automatic state synchronization (the "Alice Case") across devices.
- ✅ **RPL Design System**: Authentic styling and Scratch 3.0 visual block rendering.
- 🚧 **Help Desk**: Integrated support and skill-matching (in development).

## Architecture & Data Flow

MDTutor uses a polyglot monorepo (Node.js & Ruby on Rails) with a focus on loose coupling and semantic identity:

- **Apps**:
  - `apps/web`: Svelte 5 + Runes frontend. Authentic RPL-compatible rendering.
- **Packages**:
  - `packages/api-server`: Content resolution & delivery. Resolves GIDs through prioritized layers.
  - `packages/parser`: `unified.js` pipeline (remark/rehype) for semantic JSON extraction.
  - `packages/backend-ruby`: Achievements and Action-Log (Rails). Tracks user progress.
  - `packages/sso-server`: Central Identity and Makerspace Dashboard (Rails).

### Key Concepts

- **Ecosystems**: Groups of content sharing a technical standard (e.g., `content/RPL`).
- **Layers**: Content overlays (e.g., `official`, `tag-makerspace`). Priority defined in `config/sync.yaml`.
- **GIDs**: `ECOSYSTEM:TYPE:SLUG` (e.g., `RPL:PROJ:silly-eyes`) ensure progress is tracked even if content is forked.

## Getting Started

### 1. Requirements
- Node.js >= 18
- pnpm >= 9
- Ruby >= 3.2 (with Bundler)
- SQLite3

### 2. Installation & Content Sync
MDTutor uses a powerful sync tool to fetch reference tutorials and initialize the structure.

```bash
pnpm install
pnpm run init         # Fetches RPL pathways and clones repositories
pnpm run seed         # Initializes development databases (Users, Achievements)
```

### 3. Development
Run all services concurrently in development mode:

```bash
pnpm run dev          # Standard development (Port 5201, 3101, 3102, 3103)
pnpm run dev:test     # Test mode using separate 'test' databases
```

**Access points:**
- **Web App**: `http://localhost:5201`
- **Content API**: `http://localhost:3101`
- **Achievements**: `http://localhost:3102`
- **SSO Server**: `http://localhost:3103`

## Development Workflow

MDTutor follows a strict **Test-First (TDD)** and **Spec-First** approach. AI agents and developers must adhere to the rules in [PROJECT_RULES.md](PROJECT_RULES.md).

1. **Feature Branch**: Always work in `feature/name`.
2. **Implementation Plan**: Commit a plan to `docs/brain/YYYY-MM-DD-feature.md` before coding.
3. **API-First**: Spec the API and implement backend tests (RSpec) before frontend work.
4. **TDD**: Write tests before implementation.
5. **Alice Case**: Always verify progress logic against the complex "Alice" scenario (`pnpm run seed:test`).

## Core Features

### Content Engine
- **Unified.js Pipeline**: Markdown → JSON with transclusion and semantic enrichment.
- **Scratch Blocks**: Visual rendering of Scratch 3.0 code blocks via SVG.
- **Interactive Quizzes**: Progressive disclosure and state persistence.

### User System (SSO)
- **Kiosk Mode**: PIN-protected kachels for users.
- **Super-Mode**: Admin login disables PIN requirements for easy switching during workshops.
- **JWT Authentication**: Secure session handling across all microservices.

### Progress & Achievements
- **Event-Sourced Actions**: `task_check`, `step_view`, `scratch_start`, etc.
- **Aggregated State**: Efficient backend-side progress calculation.
- **Undo Support**: Correct handling of `task_uncheck` with deterministic ordering.

## Testing

- **Backend**: `RAILS_ENV=test bundle exec rspec` in `packages/*`
- **Frontend**: `pnpm run test:unit` in `apps/web`
- **End-to-End**:
  - Dev Server: `pnpm run test:e2e` in `apps/web`
  - Docker Demo:
    ```bash
    cd apps/web
    BASE_URL=http://mdtutor.localhost:13100 \
    ACHIEVEMENTS_URL=http://mdtutor.localhost:13100 \
    SSO_URL=http://sso.mdtutor.localhost:13100 \
    npx playwright test --config playwright.docker.config.ts
    ```
- **Parser**: `pnpm test` in `packages/parser`
- **Compliance**: `node --test test/structure-compliance.test.js`

## Deployment (Docker)

MDTutor provides a production-ready Docker setup using Docker Compose and Traefik.

### 1. Simple Demo Start
Run the automated launcher to set up and start all services:
```bash
./bin/demo-start
```
The demo will be available at `http://mdtutor.localhost:13100`.

### 2. HTTPS / Production
For a public server, configure `docker.env` with your domain and enable Let's Encrypt. Detailed instructions can be found in [docs/deployment.md](docs/deployment.md).

## Documentation
- [PROJECT_RULES.md](PROJECT_RULES.md) - **Mandatory Reading** for developers.
- [docs/SPEC.md](docs/SPEC.md) - Main project specification.
- [docs/brain/](docs/brain/) - Ongoing work and architectural decisions.

## License

AGPL-3.0-or-later

**Note on Content:** Content fetched or linked within this platform (e.g., from the Raspberry Pi Foundation or other ecosystems) may be subject to its own specific licenses and terms of use.
