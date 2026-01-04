# Implementation Plan - Fix kill-ports.js to ignore rathole clients 🔹6chHi

The `npm run dev` command currently kills `rathole` clients because `tools/kill-ports.js` uses `lsof -t -i:[PORT]`, which returns PIDs of both listening processes and connected clients. This fix narrows the search to only processes in the `LISTEN` state.

## Proposed Changes

### Tools
- Modify `tools/kill-ports.js`:
    - Change `lsof -t -i:${port}` to `lsof -t -i:${port} -sTCP:LISTEN`.

## Verification Plan

### Automated Tests
- N/A (Hard to test without mocking `lsof` or setting up complex network states).

### Manual Verification
- Run `npm run dev` while a client is connected to one of the ports and verify the client is not killed.

