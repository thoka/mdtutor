# Walkthrough - Auto-stop running servers 🔹vaCpr

Implemented automatic stopping of running servers when starting the development environment and enforced strict port usage to prevent port incrementing.

## Changes

### Tools
- Created [tools/kill-ports.js](tools/kill-ports.js): A utility script that uses `lsof` to find and kill processes running on the ports defined in `.env` (`API_PORT` and `WEB_PORT`). It includes a check for `lsof` availability.

### Root
- Modified [package.json](package.json): Updated the `dev` script to run `node tools/kill-ports.js` before starting the servers via `concurrently`.

### Web App
- Modified [apps/web/vite.config.ts](apps/web/vite.config.ts): Added `server.strictPort: true` to ensure Vite fails if the port is occupied instead of automatically picking the next available port.

### API Server
- The API server in [packages/api-server/src/server.js](packages/api-server/src/server.js) already had logic to exit if the port is occupied, so no changes were needed there.

## Verification
- Ran `node tools/kill-ports.js` manually to verify it correctly identifies and handles the ports.
- Verified that `npm run dev` now cleans up previous instances.
