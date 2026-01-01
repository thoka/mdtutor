# MDTutor

Markdown-based learning platform for Makerspace tutorials, compatible with Raspberry Pi Learning content.

## Project Goal

Build a local, intranet-compatible learning environment with:
- ✅ Tutorial content (from GitHub repositories)
- ✅ Markdown → JSON parser (unified.js pipeline)
- ✅ API server (Express)
- ✅ Web renderer (Svelte 5 + Vite)
- ✅ Tutorial Library (Home View)
- ✅ RPL Design System & Scratch 3.0 Styling
- 🚧 Achievements & Badges
- 🚧 Learning Paths
- 🚧 Help Desk system

## Requirements

- Node.js >= 18 (for native fetch API)
- Git

## Project Structure

```
mdtutor/
├── packages/              # Modular components (monorepo)
│   ├── parser/           # Markdown → JSON parser
│   ├── api-server/       # Express API server (content delivery)
│   ├── backend-ruby/     # Achievements & Action-Log (Rails)
│   └── sso-server/       # Central Identity & Makerspace Dashboard (Rails)
├── apps/                 # Applications
│   └── web/             # Svelte 5 + Vite frontend
├── db/                   # Centralized SQLite storage
│   ├── achievements/     # Production & Test databases for achievements
│   └── sso/              # Production & Test databases for SSO/Presence
├── docs/                # Documentation
│   ├── brain/           # Implementation plans and walkthroughs
│   ├── SPEC.md          # Main specification
│   └── ...
├── bin/                  # Root-level utility scripts (e.g., ./bin/seed)
└── package.json         # Workspace root
```

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Data & Databases

```bash
npm run test:data    # Fetch reference tutorials
npm run seed         # Initialize development databases with test users
```

### 3. Development

The project uses a multi-service architecture. You can run all services concurrently:

```bash
npm run dev          # Standard development mode
npm run dev:test     # Test mode using separate 'test' databases
```

**Services:**
- **Web App**: `http://localhost:5201`
- **Content API**: `http://localhost:3101`
- **Achievements**: `http://localhost:3102`
- **SSO Server**: `http://localhost:3103`

### 4. Testing

```bash
# Backend Tests (RSpec)
cd packages/backend-ruby && RAILS_ENV=test bundle exec rspec
cd packages/sso-server && RAILS_ENV=test bundle exec rspec

# Parser Tests
cd packages/parser && npm test
```

## Spec-First Workflow

This project follows a strict **Spec-First** approach:
1. **API First**: No frontend implementation begins until the API is specified and verified by backend tests.
2. **TDD**: Always write tests (RSpec) before implementing features.
3. **Data Strategy**: Use `factory_bot` for specs and maintain `db/seeds.rb` for development scenarios (e.g., the "Alice" case).

## Available Scripts

From the root directory:

- `npm run test` - Run tests
- `npm run test:data` - Fetch test data from Raspberry Pi Learning
- `npm run api` - Start API server (port from .env: API_PORT or PORT)
- `npm run web` - Start web dev server (port from .env: WEB_PORT or PORT)
- `npm run dev` - Run both API and web servers concurrently
- `npm run dev:bg` - Run both servers in background (uses .env for ports)
- `npm run lint` - Lint all files
- `npm run lint:fix` - Auto-fix linting issues

### Development Tools

- `npm run compare:structure` - Compare HTML structure with reference site
- `npm run extract:css` - Extract CSS from reference site
- `npm run extract:structure` - Extract HTML structure from a URL
- `npm run save:html` - Save rendered HTML to file for inspection

## Architecture Principles

- **Loosely Coupled**: Independent, reusable modules
- **CLI + Library**: Each component usable standalone or as import
- **Test-First**: TDD approach with comprehensive test coverage
- **Git Workflow**: Feature branches, atomic commits, merge to main

## Features

### Parser
- Unified.js pipeline for Markdown processing
- Transclusion support for nested content
- Code block processing (Scratch, Python, etc.)
- Task and ingredient panel extraction
- Language class propagation from `<code>` to `<pre>` tags
- Link attribute parsing with improved validation (prevents false matches on long alt text)
- Knowledge quiz parsing from separate quiz directories
  - Interactive quiz rendering with radio buttons and feedback
  - Full Markdown parsing for question text, choice text, and feedback
  - Support for `{:class="..."}` attributes on inline code (Scratch block styling)
  - Exact API structure matching (form containers, 1-based IDs/values)
  - Progressive disclosure: Only first unanswered question shown initially
  - No pre-selected answers (better UX than original API)
  - Correct answer: Shows green checkmark, disables inputs, reveals next question
  - Incorrect answer: Shows red X, allows retry, hides feedback on selection change
  - State persistence via className manipulation across Svelte re-renders
  - "Check my answer" button functionality
  - Comprehensive test suite (46+ tests) including API comparison tests

### API Server
- Express server serving cached tutorial data
- CORS enabled for development
- Reads from test/snapshots directory
- Converts relative image URLs to absolute paths for Vite static file serving
- Does not serve static files (images) - handled by Vite dev server or nginx/caddy in production

### Web Renderer
- Svelte 5 with runes mode
- Hash-based routing (/:slug/:step)
- Interactive task checkboxes with LocalStorage persistence
- Collapsible ingredient panels with toggle icons
- Progress tracking across steps
- RPL-compatible CSS styling (cloned from reference site)
- Scratch code block rendering via `scratchblocks` library
  - Renders `<pre class="language-blocks3">` as visual Scratch blocks (SVG)
  - Preserves whitespace and formatting
  - Supports Scratch 3.0 style
- Syntax highlighting for code blocks (Prism.js)
- Material Symbols icons for navigation
- Static file serving: Images served via Vite dev server from `public/snapshots` symlink
  - Development: Vite serves files from `public/snapshots` → `test/snapshots`
  - Production: nginx/caddy serves files directly from `public/snapshots`
  - Image URLs: `/snapshots/:slug/repo/:lang/images/...`

## Documentation

- [Main Specification](docs/SPEC.md)
- [Renderer Specification](docs/renderer-spec.md)
- [Panel Functionality](docs/panel-functionality.md)
- [Scratch Code Blocks](docs/scratch-code-blocks.md)
- [Test Data Collection](docs/test-data-collection.md)
- [RPL Markdown Extensions](docs/RPL%20-%20Markdown%20Extensions.md)

## Development Workflow

1. Create feature branch: `git checkout -b feature/name`
2. Implement with tests
3. Commit after each iteration
4. Merge to main when complete

## License

MIT

## Status

✅ **Parser** - Complete with transclusion support and code block processing  
✅ **API Server** - Serving cached tutorial data  
✅ **Renderer** - Interactive tutorial viewer with progress tracking  
✅ **Library View** - Overview of all available tutorials with card-based layout  
✅ **Design System** - RPL-compatible styling cloned from reference site  
✅ **Scratch Blocks** - Visual rendering of Scratch code blocks via scratchblocks library  
✅ **Syntax Highlighting** - Code block syntax highlighting with Prism.js  
✅ **Navigation** - Previous/Next buttons with step titles and icons  
✅ **Collapsible Panels** - Interactive panels with toggle icons (+/-)  
🚧 **Backend Integration** - Planned  
🚧 **User Management** - Planned  
🚧 **Achievements** - Planned
