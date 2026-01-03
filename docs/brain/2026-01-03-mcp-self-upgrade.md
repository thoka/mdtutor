# Brain: MCP Self-Upgrade and Info

## Context
We want to automate the maintenance of the Severin MCP server.

## Goal
1. Allow the MCP server to report its location and status dynamically.
2. Provide a way for the MCP server to upgrade its own engine via `git pull`.
3. Automate the global upgrade during the `ship` process using dynamic discovery (avoiding hardcoded paths like `~/.severin`).

## Implementation
- Added `sv_mcp_info` tool to `server_impl.rb` (dynamic path detection).
- Added `sv_upgrade_self` tool to `server_impl.rb` (dynamic path detection).
- Updated `severin/actions/ship.rb` to discover the global Severin installation via `which sv` or `ENV['SEVERIN_HOME']`.
- Added recursion protection in `ship` to avoid pulling when already in the global path.

## Verification
- [x] `sv_mcp_info` returns correct paths.
- [x] `sv_upgrade_global` performs a git pull in `~/.severin`.
- [x] `ship` action triggers global pull.

