# Implementation Plan - Content Restructuring 🔹Org3y

Date: 2025-12-31
Topic: Transition from `test/snapshots` to a provider-based `content/` directory.

## Goal
Support multiple content providers (e.g., RPL, TAG) by organizing content into a hierarchical structure and using namespaces for IDs.

## Proposed Structure
```
content/
├── RPL/
│   ├── meta.yml
│   ├── README.md
│   ├── projects/
│   │   └── [project-slug]/
│   └── pathways/
│       └── [pathway-slug].yaml
└── TAG/
    ├── meta.yml
    ├── README.md
    ├── projects/
    └── pathways/
```

## Meta File Format (`meta.yml`)
```yaml
github_source: https://github.com/raspberrypi
namespace: rpl
```

## Tasks
1. [x] Create `content/` directory and subdirectories.
2. [x] Create `meta.yml` and `README.md` for RPL and TAG.
3. [x] Move existing snapshots from `test/snapshots/` to `content/RPL/projects/`.
4. [x] Move `test/pathways.yaml` to `content/RPL/pathways/`.
5. [x] Update `packages/api-server/src/server.js`:
    - Discover providers by scanning `content/`.
    - Prepend namespaces to project/pathway IDs.
    - Update paths to point to `content/`.
6. [x] Update `packages/parser/src/parse-tutorial.js` for transclusion path resolution.
7. [x] Update `test/get-test-data.js` to use the new structure.
8. [x] Update `apps/web` to fetch from the new structure (fix symlink or update Vite config).
9. [x] Update all tests that rely on `test/snapshots`.

## Verification
- [x] API server returns projects with namespaced IDs (e.g., `rpl:silly-eyes`).
- [x] Web app correctly renders projects from the new `content/` directory.
- [x] Parser correctly handles transclusions in the new structure.

## Results
The content restructuring is complete. The system now supports multiple providers and namespaced IDs.

### Key Changes
- **API Server**: Now dynamically discovers providers and transforms image URLs to point to the new `/content` structure.
- **Parser**: Transclusion logic updated to resolve paths relative to the `projects` directory.
- **Tests**: All 82 parser tests and 9 API server tests are passing with the new structure.
- **Web App**: Accesses content via the `/content` symlink, which now points to the root `content/` directory.

### Walkthrough
1. **Provider Discovery**: The API server reads `content/*/meta.yml` to identify providers and their namespaces.
2. **Namespacing**: Project slugs are returned as `namespace:slug` (e.g., `rpl:silly-eyes`).
3. **Image Serving**: Images are served from `/content/[Provider]/projects/[slug]/repo/[lang]/images/...`.
4. **Backward Compatibility**: The API server still supports fetching by slug without namespace for the default provider (RPL) if needed, but namespaced IDs are preferred.

