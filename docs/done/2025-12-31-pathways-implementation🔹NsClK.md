# Implementation Plan: Pathways API & Progress Integration 🔹NsClK

**Date:** 2025-12-31
**Feature Branch:** `feature/pathways-api`

## Goal
Implement the Pathways infrastructure to mimic the Raspberry Pi Learning experience, including metadata, project grouping, and progress tracking.

## Proposed Changes

### 1. Content Data (`content/RPL/pathways/scratch-intro.yml`)
- Define `scratch-intro` pathway with:
  - Title, description, meta tags.
  - Header sections (What will I make?, What do I need?, etc.).
  - Project list with categories (`explore`, `design`, `invent`).

### 2. API Server (`packages/api-server/src/server.js`)
- Add `GET /api/v1/:lang/pathways/:pathwayId`: Returns pathway metadata.
- Add `GET /api/v1/:lang/pathways/:pathwayId/projects`: Returns full project data for the pathway.
- Support namespaced pathway IDs (e.g., `rpl:scratch-intro`).

### 3. Web App Frontend
- **New Route:** `/:lang/pathways/:slug` -> `PathwayView.svelte`.
- **Component:** `PathwayView.svelte` to render the pathway header, info boxes, and grouped project cards.
- **Progress Tracking:**
  - Generate/store a session UUID in `localStorage`.
  - Update `stores.ts` to track project completion within a pathway.
  - Display progress (e.g., "2 of 6 projects completed") on the pathway view.

### 4. Navigation
- Update `HomeView.svelte` to link to the `scratch-intro` pathway.

## Verification Plan
- **API:** Test endpoints with `curl` or browser.
- **Frontend:** Verify rendering of `PathwayView` and navigation from Home.
- **Progress:** Complete a project and verify that the pathway view reflects the progress.
