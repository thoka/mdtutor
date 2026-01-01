# Tutorial Renderer (Web App)

Svelte 5 + Vite web application for rendering Markdown-based tutorials from the Raspberry Pi Learning platform.

## Features

- Step-by-step tutorial navigation with sidebar
- Interactive task checkboxes with LocalStorage and Backend (Achievements API) persistence
- Aggregated user state for efficient progress calculation
- Achievement Debug Overlay for detailed progress analysis (Admins/Dev mode)
- Collapsible ingredient panels (transclusions)
- Hash-based routing (`#/lang/projects/tutorial-slug/step-number`)
- RPL-compatible CSS styling
- Print mode support

## Prerequisites

- Node.js >= 18
- Running API server (see `packages/api-server`)
- Running Achievements backend (see `packages/backend-ruby`)

## Development

```bash
# Install dependencies (from project root)
npm install

# Start all services (API, Web, Achievements, SSO)
npm run dev

# Access at http://localhost:<WEB_PORT from .env>/#/de-DE/pathways/RPL:scratch-intro
```

## Build

```bash
# Production build
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
src/
  routes/
    TutorialView.svelte    # Main tutorial route component
  lib/
    Sidebar.svelte         # Step navigation sidebar
    StepContent.svelte     # HTML content renderer with interactive elements
    stores.ts              # State management (tutorial data, progress)
  styles/
    rpl.css                # RPL-compatible CSS (tasks, panels, typography)
  App.svelte               # Root component with router
  main.ts                  # Entry point
```

## URL Structure

- `#/de-DE/projects/silly-eyes` → Tutorial step 0 (default)
- `#/de-DE/projects/silly-eyes/2` → Tutorial step 2
- `#/de-DE/pathways/pathway-slug` → Pathway overview
- `#/lang/projects/tutorial-slug/step-number` → Any tutorial/step

## Dependencies

- **Svelte 5**: Reactive UI framework with runes
- **Vite 7**: Build tool and dev server
- **svelte-spa-router**: Hash-based routing
- **API Server**: Must be running on port configured in `.env` (API_PORT or PORT)

## Environment

The dev server proxies `/api` requests to the API server port configured in `.env` file where the API server serves cached tutorial data.

## Type Checking

```bash
npm run check
```

