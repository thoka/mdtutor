# Implementation Plan - Pathway Fetching Tool 🔹RRvRp

Create a tool to fetch learning pathways from the RPL API and save them in the local content structure.

## Goals
- Fetch pathway metadata (title, description, projects, header sections) from RPL API.
- Support multiple languages (defaulting to de-DE and en).
- Save pathway configuration to `content/RPL/pathways/<slug>.yaml`.
- Automatically trigger fetching of all projects associated with the pathway (cloning repo + API snapshots).
- Provide a way to configure a list of pathways to be synced.

## Proposed Changes

### New Tool: `tools/fetch-pathways.js`
- Use `node-fetch` (native in Node 18+).
- Fetch from `https://learning-admin.raspberrypi.org/api/v1/:lang/pathways/:slug`.
- Fetch project list from `https://learning-admin.raspberrypi.org/api/v1/:lang/pathways/:slug/projects`.
- Parse the response and map it to our internal YAML format.
- Integrate with `test/get-test-data.js` to fetch project repositories and snapshots.

### Configuration
- Create `content/RPL/pathways/config.yaml` to list the slugs of pathways we want to maintain.

## Steps
1. Create `tools/fetch-pathways.js`.
2. Refactor `test/get-test-data.js` if necessary to expose project fetching logic.
3. Implement the fetching and mapping logic for pathways.
4. Implement the mapping logic for projects within pathways.
5. Add a CLI interface to fetch a single pathway or all configured pathways.

## Verification Plan
1. Run `node tools/fetch-pathways.js scratch-intro`.
2. Check if `content/RPL/pathways/scratch-intro.yaml` is created with correct content.
3. Verify that `content/RPL/projects/` contains all projects from the pathway.
4. Verify that `test/snapshots/` contains API snapshots for those projects.

