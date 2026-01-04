# Brain: MCP Bootstrap Launcher

## Context
We want to decouple the global Severin MCP server from the local project engine version. This allows for immediate updates when working on the engine within a project without needing manual synchronization.

## Goal
Implement a launcher script for the MCP server that detects and prefers a local engine if present.

## Implementation
1. Refactored `mcp/server.rb` into a launcher.
2. Moved server logic to `mcp/server_impl.rb`.
3. Updated engine to support bootstrapping.
4. Updated global MCP server to use the launcher.

## Verification
- [x] Global server starts and responds.
- [x] Local engine is detected and used (verified via logs).

