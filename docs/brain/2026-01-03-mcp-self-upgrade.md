# Brain: MCP Self-Upgrade and Info

## Context
We want to automate the maintenance of the Severin MCP server.

## Goal
1. Allow the MCP server to report its location and status.
2. Provide a way to upgrade the global MCP server via a tool call.
3. Automate the global upgrade during the `ship` process.

## Implementation
- Added `sv_mcp_info` tool to `server_impl.rb`.
- Added `sv_upgrade_global` tool to `server_impl.rb`.
- Updated `severin/actions/ship.rb` to run `git pull` in `~/.severin` after pushing engine changes.

## Verification
- [x] `sv_mcp_info` returns correct paths.
- [x] `sv_upgrade_global` performs a git pull in `~/.severin`.
- [x] `ship` action triggers global pull.

