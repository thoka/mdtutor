# Walkthrough - Pathway Fetching Tool

I have implemented a new tool to fetch learning pathways and their associated projects from the Raspberry Pi Learning (RPL) API.

## New Tool: `tools/fetch-pathways.js`

This tool allows you to:
1.  **Fetch a specific pathway**: `node tools/fetch-pathways.js <pathway-slug>`
2.  **Fetch multiple pathways**: Configure them in `content/RPL/pathways/config.yaml` and run `npm run sync:pathways`.

### Features:
- **Automatic Metadata Mapping**: Fetches pathway title, description, and header sections.
- **Language Support**: Prefers German (`de-DE`) metadata if available, falling back to English.
- **Project Categories**: Maps projects to their categories (Explore, Design, Invent) based on the RPL pathway structure.
- **Project Synchronization**: Automatically clones project repositories and fetches API snapshots for all projects in the pathway.
- **Reliable Fetching**: Uses `curl` internally to circumvent potential Node.js fetch limitations in the environment.

## Changes

### apps/web
- Added `sync:pathways` script to `package.json`.

### content/RPL/pathways
- Created `config.yaml` to manage the list of pathways to keep in sync.
- Generated `scratch-intro.yaml` using the new tool.

## Verification
- Running `node tools/fetch-pathways.js scratch-intro` successfully created the localized YAML file and ensured all 6 projects are locally available.
- The 404 error on `http://localhost:5201/#/de-DE/pathways/scratch-intro` is now resolved as the required configuration file exists.

