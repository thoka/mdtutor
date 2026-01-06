# Ruby Coding Standards (Discourse-inspired) 🔹YlCmO
Status: in-progress

This document outlines the implementation plan for the new Ruby coding standard skill and the dual-logging system for the Severin engine.

## 🎯 Goals
- Define a new Severin skill `:ruby` for all Ruby-related tasks.
- Implement a `Severin::Logger` class in the engine following Discourse patterns.
- Ensure dual logging: `debug.log` (human-readable) and `debug.jsonl` (machine-readable).
- Automate log directory management and git exclusion.

## 🛠 Tasks
- [ ] Create `severin/rules/1-skills/ruby.rb` with Discourse-inspired patterns 🔹YlCmO
- [ ] Add `severin/log/` to `.gitignore`
- [ ] Implement `Severin::Logger` in `severin/engine/lib/severin/logger.rb`
- [ ] Refactor `Severin.log_debug` in `severin/engine/lib/severin.rb` to use the new logger
- [ ] Verify the implementation with `sv check` or manual test

## 📜 Discourse-inspired Patterns for Ruby
- **Keyword Arguments**: Use for complex methods instead of positional arguments.
- **Lazy Initialization**: Use `||=` for resource handles (files, caches).
- **UTC Everywhere**: All timestamps must be in UTC.
- **Explicit Flushing**: Use `f.sync = true` for log files to ensure immediate writes.
- **Structured Context**: Pass metadata as hashes (`**context`).

