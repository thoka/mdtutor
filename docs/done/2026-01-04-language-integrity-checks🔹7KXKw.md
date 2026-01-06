# 2026-01-04 Language Integrity Checks 🔹7KXKw
Status: ship-it

Ensuring consistency between German infrastructure (Severin) and English documentation.

## Context
Brain documents were accidentally written in German. We need a system to enforce the language policy:
- Severin Rules & Fixes: German (de)
- Documentation (Brain Docs): English (en)

## Requirements
- Centralized language detection logic in `Severin::LanguageDetector`.
- Heuristics based on common functional words (stop words).
- Automated checks via `sv check`.
- Automated fix instructions for agents.

## Implementation Plan
- [x] Create feature branch `feature/language-integrity-checks`.
- [x] Implement `Severin::LanguageDetector` in `severin/engine/lib/severin/language_detector.rb`.
- [x] Create language integrity suite in `severin/rules/1-process/language.rb`.
- [x] Sync project rules with `sv gen`.
- [x] Translate this brain document to English.
- [x] Verify that `language_brain_docs` passes for this file.
- [x] Verify that `language_severin_rules` passes for all rule files.
- [x] Final `sv commit`.
