# Walkthrough - Architecture Overhaul: Ecosystems and Layering 🔹UiwgC

I have implemented the revised content architecture, moving from a provider-centric model to an ecosystem-centric model with prioritized layers.

## Core Changes

### 1. New Documentation
- **`docs/ARCHITEKTUR_VISION.md` (Deutsch)**: Dokumentiert die Vision von Ökosystemen, Layern, GIDs und semantischem Content.
- **`docs/CONTENT_STRUCTURE.md` (English)**: Technical specification of the new directory hierarchy and resolution logic.

### 2. Restructured Content Directory
- Moved existing RPL content to `content/RPL/layers/official/`.
- Created placeholders for `content/RPL/layers/tag-makerspace/`.
- Added `content/RPL/ecosystem.yaml` to define ecosystem-wide standards.
- Added `content/RPL/sources.yaml` to manage content sources and priorities.

### 3. Updated API Server (`packages/api-server`)
- **Layered Resolution**: The server now scans all layers in an ecosystem and builds a prioritized index.
- **Content Resolver**: New module `src/content-resolver.js` handles the logic of finding the "best" version of a project or pathway based on layer priority.
- **Dynamic Asset Paths**: Image URLs are now dynamically resolved to the correct layer in the `/content/` symlink.

### 4. Enhanced Fetch Tool (`tools/fetch-pathways.js`)
- Now respects `sources.yaml`.
- Supports fetching into specific layers.
- Automatically creates the necessary directory structure.

### 5. Refactored Test Data Tool (`test/get-test-data.js`)
- Refactored to be used as a library by other tools.
- Supports custom destination directories for cloning and snapshots.

## Verification

### Automated Verification
- Ran `node tools/fetch-pathways.js scratch-intro` to verify the new layered fetching logic.
- All files were correctly placed in `content/RPL/layers/official/`.

### Manual Verification (Concepts)
- [x] Ecosystems are clearly separated in `content/`.
- [x] Layers allow for local overrides (e.g., adding a project to `tag-makerspace` will automatically override the `official` version if priority is set correctly).
- [x] API Server successfully resolves paths within the new nested structure.

