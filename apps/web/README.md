# Tutorial Renderer (Web App)

Svelte 5 + Vite web application for rendering Markdown-based tutorials from the Raspberry Pi Learning platform.

## Features

- Step-by-step tutorial navigation with sidebar
- Interactive task checkboxes with LocalStorage persistence
- Collapsible ingredient panels (transclusions)
- Hash-based routing (`#/tutorial-slug/step-number`)
- RPL-compatible CSS styling
- Print mode support

## Prerequisites

- Node.js >= 18
- Running API server (see `packages/api-server`)

## Development

```bash
# Install dependencies (from project root)
npm install

# Start dev server
npm run dev

# Access at http://localhost:5173/#/silly-eyes/0
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

- `#/silly-eyes` → Tutorial step 0 (default)
- `#/silly-eyes/2` → Tutorial step 2
- `#/tutorial-slug/step-number` → Any tutorial/step

## Dependencies

- **Svelte 5**: Reactive UI framework with runes
- **Vite 7**: Build tool and dev server
- **svelte-spa-router**: Hash-based routing
- **API Server**: Must be running on port 3001 (configured in vite.config.ts proxy)

## Environment

The dev server proxies `/api` requests to `http://localhost:3001` where the API server serves cached tutorial data.

## Type Checking

```bash
npm run check
```

