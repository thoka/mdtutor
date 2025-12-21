# MDTutor2

Markdown-based learning platform for Makerspace tutorials, compatible with Raspberry Pi Learning content.

## Project Goal

Build a local, intranet-compatible learning environment with:
- ✅ Tutorial content (from GitHub repositories)
- 🔄 Markdown → JSON parser (unified.js pipeline)
- 🔄 API server (mock initially, Ruby later)
- 🚧 Achievements & Badges
- 🚧 Learning Paths
- 🚧 Help Desk system

## Requirements

- Node.js >= 18 (for native fetch API)
- Git

## Project Structure

```
mdtutor2/
├── packages/              # Modular components (monorepo)
│   ├── parser/           # Markdown → JSON parser
│   └── api-server/       # API server (mock)
├── apps/                 # Applications
│   └── web/             # Svelte + Vite frontend (coming soon)
├── docs/                # Documentation
│   ├── SPEC.md          # Main specification
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

Parser package:
```bash
cd packages/parser
npm test
```

API Server (coming soon):
```bash
cd packages/api-server
npm run dev
```

## Architecture Principles

- **Loosely Coupled**: Independent, reusable modules
- **CLI + Library**: Each component usable standalone or as import
- **Test-First**: TDD approach with comprehensive test coverage
- **Git Workflow**: Feature branches, atomic commits, merge to master

## Documentation

- [Main Specification](docs/SPEC.md)
- [Test Data Collection](docs/test-data-collection.md)
- [RPL Markdown Extensions](docs/RPL%20-%20Markdown%20Extensions.md)

## Development Workflow

1. Create feature branch: `git checkout -b feature/name`
2. Implement with tests
3. Commit after each iteration
4. Merge to master when complete

## License

MIT

## Status

🚧 **Early Development** - Parser and core infrastructure in progress
