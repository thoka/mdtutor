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
- **Login**: Required, handled externally
- **Dev Mode**: Easy identity switching for development
- **User tracking**: Session-based progress and achievements

### 3. Tutorial Content
- **Source**: Local repositories (structure like https://github.com/raspberrypilearning/silly-eyes/)
- **Compatibility**: Direct use of existing markdown structure (en/, de/, step_X.md, meta.yml)
- **Updates**: Manually managed, no automatic sync

### 4. Architecture Principles
- **Coupling**: Loosely coupled, independent modules
- **Usage**: Components usable via CLI and other tools
- **Technology**: 
  - Frontend: unified.js pipeline (remark/rehype)
  - Backend: Ruby (future), simple mocks initially
  - Rendering: Client-side, server-side, and headless browser support

### 5. Help Desk System

**Phase 1**: Basic request tracking
- User selects "?" on tasks/subtasks (alongside "completed")
- Help requests stored and displayed in overview
- View for teachers and public Makerspace display

**Phase 2**: Active matching
- Help requests routed to guests in Makerspace
- Matching based on achievements/badges (skill-based)
- Async (Discourse forum) and sync (live) support

**Integration**: Built on or integrated with Discourse

### 6. Achievements & Skills
- **Skills**: Tutorials contain skill lists
- **Administration**: Centralized skill management (to be decided later)
- **Matching**: Skills used for helper-to-learner matching in help system

## Technical Implementation

### Point of Truth
- **API Reference**: https://learning-admin.raspberrypi.org/api/v1/
- **Goal**: Markdown → JSON conversion producing identical output to existing API

### Rendering Pipeline
- **Parser**: unified.js + remark/rehype
- **Presentation Layer**: Svelte with Vite
- **Execution**: 
  - Client-side (browser)
  - Server-side rendering
  - Headless browser support
- **Output**: JSON structure matching existing API format

### Module Architecture
Independent components:
- Markdown parser (md → JSON)
- API server
- Achievement tracker
- Help desk system
- Learning path manager

Each module:
- Standalone CLI tool
- Importable as library
- Clear interface definitions

### Test Data Collection

Reference tutorial data is fetched from raspberrypilearning repositories and official API for parser development and testing.

**Details:** See [test-data-collection.md](test-data-collection.md)

**Script:** `test/get-test-data.js`

### Development Environment Configuration

**Port Configuration**: Both API server and web dev server support environment variable-based port configuration to enable multiple development environments running simultaneously.

- **API Server Port**: Configured via `API_PORT` environment variable (default: 3201)
- **Web Dev Server Port**: Configured via `WEB_PORT` environment variable (default: 5201)
- **Fallback**: Both services also respect generic `PORT` environment variable if specific port variables are not set

**Background Development Tasks**:
- `npm run dev`: Runs both API server and web dev server concurrently with colored output
- `npm run dev:bg`: Same as `dev` but with kill-on-exit behavior (stops all processes on Ctrl+C)

**Usage Examples**:
```bash
# Default ports (3201 for API, 5201 for web)
npm run dev:bg

# Custom ports for multiple environments
API_PORT=3202 WEB_PORT=5202 npm run dev:bg

# Using .env file (not committed to git)
echo "API_PORT=3002" > .env
echo "WEB_PORT=5174" >> .env
npm run dev:bg
```

The Vite dev server automatically configures its proxy to match the API server port when `API_PORT` is set.

## Development Approach

### Iteration Strategy
1. Minimal text/code for agent-based automation
2. Iterative cycles with focused changes
3. Start with API reverse engineering
4. Build compatibility layer first

### Documentation & Workflow
- All technical decisions, plans, and progress documented in `docs/brain/` directory
- **implementation_plan.md**: Approach sketched before writing new code
- **task.md**: Tracking current progress and open items
- **walkthrough.md**: Documentation of achieved milestones and result verification
- **Test-first Approach**: Tests written first (TDD) before implementation
- **Branching Strategy**: Each feature/task in own branch (e.g., `feature/section-frontmatter`)
- Commits: Regular with clear messages (Conventional Commits style)

### Git Workflow Rules
- **Feature Branches**: Each feature in own branch (`feature/name`)
- **Subtask Commits**: Each completed subtask committed immediately to feature branch (no large "WIP" commits)
- **Iteration Commits**: After each iteration (implementation cycle), create a commit in the feature branch
- **Merging**: Only after complete verification merge to `main`
- **Tests first**: Write and commit tests first!

### Next Steps
1. Analyze existing API responses (learning-admin.raspberrypi.org)
2. Document JSON structure
3. Select reference tutorials (e.g., silly-eyes)
4. Build Markdown → JSON converter prototype
5. Iterate on remaining components

## Open Decisions
- Exact skill taxonomy and administration
- Backend framework choice (Ruby preference noted)
- Discourse integration details
- Client-side vs server-side rendering balance