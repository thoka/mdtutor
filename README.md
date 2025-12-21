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
│   └── api-server/       # Express API server
├── apps/                 # Applications
│   └── web/             # Svelte 5 + Vite frontend
├── docs/                # Documentation
│   ├── SPEC.md          # Main specification
│   ├── renderer-spec.md # Renderer specification
│   ├── panel-functionality.md
│   ├── scratch-code-blocks.md
│   ├── test-data-collection.md
│   └── RPL - Markdown Extensions.md
├── test/                # Integration tests & test data
│   ├── get-test-data.js # Fetch reference data from RPL API
│   └── snapshots/       # Test data snapshots
└── package.json         # Workspace root
```

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Fetch Test Data

```bash
npm run test:data
```

This downloads reference tutorials and API responses from raspberrypilearning.org.

### 3. Development

**Run API Server:**
```bash
npm run api
```
Server runs on http://localhost:3001

**Run Web Renderer:**
```bash
npm run web
```
Dev server runs on http://localhost:5173

**Parser Development:**
```bash
cd packages/parser
npm test
```

**Linting:**
```bash
npm run lint        # Check for issues
npm run lint:fix    # Auto-fix issues
```

## Available Scripts

From the root directory:

- `npm run test` - Run tests
- `npm run test:data` - Fetch test data from Raspberry Pi Learning
- `npm run api` - Start API server (port 3001)
- `npm run web` - Start web dev server (port 5173)
- `npm run lint` - Lint all files
- `npm run lint:fix` - Auto-fix linting issues

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

### API Server
- Express server serving cached tutorial data
- CORS enabled for development
- Reads from test/snapshots directory

### Web Renderer
- Svelte 5 with runes mode
- Hash-based routing (/:slug/:step)
- Interactive task checkboxes with LocalStorage persistence
- Collapsible ingredient panels
- Progress tracking across steps
- RPL-compatible CSS styling
- Scratch code block color coding

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

✅ **Parser** - Complete with transclusion support  
✅ **API Server** - Serving cached tutorial data  
✅ **Renderer** - Interactive tutorial viewer with progress tracking  
✅ **Library View** - Overview of all available tutorials  
✅ **Design System** - RPL-compatible styling and Scratch 3.0 colors  
🚧 **Backend Integration** - Planned  
🚧 **User Management** - Planned  
🚧 **Achievements** - Planned
