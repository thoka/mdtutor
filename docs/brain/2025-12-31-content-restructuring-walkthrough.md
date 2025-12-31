# Walkthrough - Content Restructuring

Date: 2025-12-31
Topic: Transition from `test/snapshots` to a provider-based `content/` directory.

## Changes

### 1. New Directory Structure
Created a `content/` directory at the root with provider-based subdirectories:
- `content/RPL/`: Raspberry Pi Learning content.
- `content/TAG/`: Custom TAG Makerspace content.

Each provider has:
- `meta.yml`: Metadata including `github_source` and `namespace`.
- `README.md`: Description of the content.
- `projects/`: Project directories.
- `pathways/`: Pathway YAML files.

### 2. API Server Updates
- **Provider Discovery**: The API server now scans `content/` for providers and reads their `meta.yml`.
- **Namespaced IDs**: All project IDs are now namespaced (e.g., `rpl:silly-eyes`).
- **Dynamic Project Listing**: `/api/projects` now scans all providers and returns a combined list of projects with namespaced slugs.
- **Slug Resolution**: `/api/projects/:slug` handles both namespaced and non-namespaced (fallback) slugs.
- **Image Path Transformation**: Image URLs are now transformed to `/content/[provider]/projects/[slug]/...`.

### 3. Parser Updates
- **Transclusion Resolution**: `remark-transclusion` and `parseProject` now correctly resolve transclusions by looking for the `projects` directory within the `content` structure.

### 4. Web App Updates
- **Symlink**: Updated `apps/web/public/content` to point to the root `content/` directory.
- **Navigation**: The web app now uses namespaced slugs for navigation and API requests.

### 5. Test Updates
- Updated all integration tests in `packages/parser/test/` to use the new `content/RPL/projects/` path.
- Updated `test/get-test-data.js` to save fetched data to the new structure.

### 6. Git Configuration
- Updated `.gitignore` to ignore fetched content in `content/RPL/projects/` and `content/RPL/pathways/` while keeping `content/TAG/` and metadata files.

## Verification Results
- **Parser Tests**: 82 tests passed.
- **API Server Tests**: 9 tests passed.
- API server successfully serves projects with namespaced IDs.
- Image URLs are correctly transformed and served via the web app's symlink.
- Transclusions are correctly resolved in the new structure.
- Tests pass with the new paths.
