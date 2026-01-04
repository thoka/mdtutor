# Brain: MCP Dynamic Transparency 🔹bgjq0

## Context
The MCP server needs to know where it was launched from (global path) vs. what engine it is currently using (local project path) to provide accurate info and upgrade capabilities.

## Goal
1. Pass the launcher path from the launcher to the server logic.
2. Report both active and launcher paths in `sv_mcp_info`.
3. Provide `sv_upgrade_self` (active engine) and `sv_upgrade_global` (launcher basis) as separate tools.

## Implementation
- Launcher sets `$SEVERIN_LAUNCHER_PATH ||= File.expand_path(__FILE__)`.
- `server_impl.rb` uses this variable to report paths and perform git pulls.

## Verification
- [x] `sv_mcp_info` shows correct `active_engine` and `launcher_path` when bootstrapped.
- [x] Both upgrade tools work correctly.

