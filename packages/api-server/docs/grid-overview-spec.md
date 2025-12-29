# Grid Overview & Metadata Integration Specification

**Status:** ✅ Implemented  
**Date:** 2025-12-21

## Overview

The tutorial overview uses a responsive grid layout that displays rich cards with metadata (hero images, titles, descriptions) from the API.

## API Server Changes

### `/api/projects` Endpoint

- **Location:** `packages/api-server/src/server.js`
- **Behavior:** Performs "deep" fetch of project metadata
- **Metadata Extracted:**
  - `heroImage` - Banner image URL
  - `title` - Official project title (fallback to slug-based title)
  - `description` - Project summary

This allows the frontend to display rich cards without making multiple API calls initially.

## Frontend Implementation

### Layout

- **Container:** Full-width (`max-width: 100%`) with generous padding
- **Grid:** Responsive CSS Grid (`repeat(auto-fill, minmax(320px, 1fr))`)
- **Location:** `apps/web/src/routes/Home.svelte`

### Card Structure

- **Header Image:** Uses `heroImage` metadata
- **Placeholder:** Style for projects without images
- **Description:** Integrated with `line-clamp` for consistent card heights
- **Styling:** Shadows, hover transitions, rounded corners

## Technical Decisions

- **Server-side Metadata Aggregation:** Metadata is aggregated on the server side in the `/api/projects` call
- **Rationale:** Simplifies frontend logic and reduces network requests
- **CSS Grid:** Uses `auto-fill` to ensure the grid uses all available space while maintaining a sensible minimum card width

