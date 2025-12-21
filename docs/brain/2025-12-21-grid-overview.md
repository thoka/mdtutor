# Decision Log: Grid Overview & Metadata Integration

**Date**: 2025-12-21
**Feature**: Enhanced Tutorial Overview (Grid Layout)

## Context
The initial tutorial overview was a simple list with limited information. The user requested a more modern, full-width grid layout that utilizes metadata (background/hero images) from the API.

## Changes

### API Server (`packages/api-server`)
- Updated the `/api/projects` endpoint to perform a "deep" fetch of project metadata.
- It now reads the `api-project-en.json` snapshot for each project to extract:
    - `heroImage`: The banner image URL.
    - `title`: The official title (falling back to slug-based title).
    - `description`: The project summary.
- This allows the frontend to display rich cards without making multiple API calls initially.

### Web Frontend (`apps/web`)
- **Layout**: Switched to a full-width container (`max-width: 100%`) with generous padding.
- **Grid**: Implemented a responsive CSS Grid (`repeat(auto-fill, minmax(320px, 1fr))`) for the tutorial cards.
- **Cards**:
    - Added a header image section using the `heroImage` metadata.
    - Added a placeholder style for projects without images.
    - Integrated the project description with `line-clamp` for consistent card heights.
    - Improved visual styling (shadows, hover transitions, rounded corners).

## Technical Decisions
- **Server-side Metadata Aggregation**: Decided to aggregate metadata on the server side in the `/api/projects` call. While this adds some overhead to the list call, it significantly simplifies the frontend logic and reduces the number of network requests needed to render the home page.
- **CSS Grid**: Used `auto-fill` to ensure the grid uses all available space while maintaining a sensible minimum card width.
