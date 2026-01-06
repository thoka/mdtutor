# Ruby Coding Standards (Discourse-inspired) 🔹YlCmO
Status: completed

This document outlines the implementation plan for the new Ruby coding standard skill and the dual-logging system for the Severin engine.

## 🎯 Goals
- [x] Define a new Severin skill `:ruby` for all Ruby-related tasks.
- [x] Implement a `Severin::Logger` class in the engine following Discourse patterns.
- [x] Ensure dual logging: `debug.log` (human-readable) and `debug.jsonl` (machine-readable).
- [x] Automate log directory management and git exclusion.
- [x] Establish a "Traceable Logic" skill for observability.
- [x] Define a "Tagging Culture" for granular context control.
- [x] Implement MCP Fail-Fast (Strict Integrity) mechanism.

## 🛠 Tasks
- [x] Create `severin/rules/1-skills/ruby.rb` with Discourse-inspired patterns 🔹YlCmO
- [x] Add `severin/log/` to `.gitignore`
- [x] Implement `Severin::Logger` in `severin/engine/lib/severin/logger.rb`
- [x] Refactor `Severin.log_debug` in `severin/engine/lib/severin.rb` to use the new logger
- [x] Ensure logging happens by default (file-only by default, console optional)
- [x] Implement `Severin.log_duration` helper
- [x] Create `severin/rules/1-skills/traceability.rb` 🔹II3f9
- [x] Create `severin/rules/1-skills/tagging.rb` 🔹S8YoJ
- [x] Analyze and fix MCP Health Check in `MCPClient` (added timeouts and better error handling)
- [x] Add/Update MCP Health rules in `severin_dev.rb` 🔹MCP-S
- [x] Verify the implementation with `sv check` or manual test

## 📜 Discourse-inspired Patterns for Ruby
- **Keyword Arguments**: Use for complex methods instead of positional arguments.
- **Lazy Initialization**: Use `||=` for resource handles (files, caches).
- **UTC Everywhere**: All timestamps must be in UTC.
- **Explicit Flushing**: Use `f.sync = true` for log files to ensure immediate writes.
- **Structured Context**: Pass metadata as hashes (`**context`).

