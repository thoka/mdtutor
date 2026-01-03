# Brain: tmp_ Prefix Convention for Temporary Files

## Context
Temporary files like logs and diffs are cluttering the repository and risk being accidentally committed.

## Goal
Implement a consistent `tmp_` prefix for all temporary files and automate their cleanup/exclusion.

## Implementation
1. Updated MCP server to use `tmp_mcp.log`.
2. Updated `.gitignore` to exclude `tmp_*` and `**/tmp_*`.
3. Updated `ship` action to automatically delete all `tmp_*` files before release.
4. Updated Severin rules to enforce the `tmp_` prefix convention.

## Verification
- [x] `.gitignore` ignores `tmp_` files.
- [x] `ship` action removes `tmp_` files.
- [x] MCP log is correctly named `tmp_mcp.log`.

