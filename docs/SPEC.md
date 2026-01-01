# Markdown Based Learning Platform - Specification

## Project Goal

Build a local, intranet-compatible learning environment for Makerspace use with:
- Tutorials (from GitHub repositories)
- Achievements/Badges
- Learning Paths
- Help Desk system

## Core Requirements

### 1. Deployment
- **Environment**: Central server in Makerspace intranet
- **Connectivity**: Offline-capable, no internet dependency required
- **Content**: Locally hosted tutorials (own developments + forks from raspberrypilearning)

### 2. Authentication
- **Login**: Handled by **SSO Server** (Ruby on Rails).
- **Dev Mode**: Easy identity switching for development (see `LoginBar.svelte`).
- **User tracking**: JWT-based session management.

### 3. Tutorial Content
- **Source**: Local repositories (structure like https://github.com/raspberrypilearning/silly-eyes/)
- **Compatibility**: Direct use of existing markdown structure (en/, de/, step_X.md, meta.yml)
- **Updates**: Managed via `sync:pathways` tool.

### 4. Architecture Principles
- **Ecosystems**: Grouping content by technical standard and shared vocabulary (e.g., RPL).
- **Layering**: Support for prioritized overlays (Local Forks > Community > Official).
- **GIDs**: Global identifiers (`ÖKOSYSTEM:TYP:SLUG`) for semantical tracking across forks and languages.
- **Technology**: 
  - Frontend: Svelte 5 + Runes
  - API Server: Node.js (Express), resolves prioritized content from layers.
  - Achievements Backend: Ruby on Rails, aggregates user state.
  - SSO Backend: Ruby on Rails, handles user identity.
  - Parser: unified.js pipeline (remark/rehype) with semantic enrichment.

### 5. Help Desk System (Upcoming)
- **Status**: Planning phase.
- **Phase 1**: Basic request tracking
- **Phase 2**: Active matching based on skills.

### 6. Achievements & Skills
- **Achievements**: Stored as event-sourced actions in Ruby backend.
- **State Aggregation**: Backend provides consolidated "current state" for performance.
- **Skills**: Tutorials contain skill lists (in development).
- **Administration**: Admin-only debug tools for verifying calculations.

## Technical Implementation

### Point of Truth
- **API Reference**: https://learning-admin.raspberrypi.org/api/v1/
- **Backend Architecture**: Polyglot monorepo (Node.js + Ruby on Rails).

### Rendering Pipeline
- **Parser**: unified.js + custom plugins for RPL-specific Markdown.
- **Presentation Layer**: Svelte 5 with Vite.
- **Output**: JSON structure matching existing API format.

### Module Architecture
Independent components:
- `packages/parser`: Markdown → JSON
- `packages/api-server`: Content resolution & delivery
- `packages/backend-ruby`: Achievements tracker & SSO
- `apps/web`: Svelte 5 Frontend

Each module is an npm workspace or separate service.

### Test Data Collection
Reference tutorial data is fetched from official sources for parity testing.
**Details:** See [test-data-collection.md](test-data-collection.md)
**Script:** `npm run test:data`

### Development Environment Configuration
**Port Configuration**: Configured via `.env` file at root.
- `API_PORT`: Node API (default 3101)
- `WEB_PORT`: Web App (default 5201)
- `ACHIEVEMENTS_PORT`: Ruby Backend (default 3102)
- `SSO_PORT`: SSO Server (default 3103)

**Development Tasks**:
- `npm run dev`: Runs all services concurrently.
- `npm run dev:test`: Runs against test databases with RAILS_ENV=test.
- `npm run seed:test`: Initializes complex test scenarios (e.g., Alice).

## Development Approach

### Iteration Strategy
1. Minimal text/code for agent-based automation.
2. Spec-First: APIs must be tested in backend before frontend integration.

### Documentation & Workflow
- **docs/brain/**: Tracking ongoing work (Implementation Plans & Walkthroughs).
- **docs/done/**: Archived documentation.
- **Test-first Approach**: RSpec request specs for all API endpoints.
- **Branching Strategy**: feature/name branches.

## Open Decisions
- Exact skill taxonomy details.
- Help Desk integration with Discourse.
- Kiosk mode specifics for SSO.