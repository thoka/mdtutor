# Decision Log: Multi-language Support & Fallback Mechanism

**Date**: 2025-12-21
**Feature**: Multi-language Support (German first, English fallback)

## Context
The platform needs to support multiple languages, specifically preferring German (`de-DE`) when available and falling back to English (`en`) otherwise. This applies to both the main tutorial content and any transcluded content (embedded panels).

## Requirements
1.  **Tutorial Selection**: When a project is requested, the system should check for German content first.
2.  **Transclusion Fallback**: If a tutorial is in German, its transclusions should also prefer German. If a transclusion is not available in German, it should fall back to English.
3.  **API Support**: The API server should handle language negotiation or explicit language requests with fallback logic.

## Proposed Changes

### Parser (`packages/parser`)
- **`parseProject`**: Update to support language fallback. Instead of a fixed path, it will take a base repository path and a list of preferred languages.
- **`remarkTransclusion`**: Update to pass the current language context to the transclusion resolver.
- **Language Mapping**: Handle the mapping between short codes (e.g., `de`) and RPL-specific codes (e.g., `de-DE`).

### API Server (`packages/api-server`)
- **Fallback Logic**: Implement a fallback mechanism in the project endpoints.
- **Language Detection**: (Optional) Detect user language from headers, but primarily follow the "German first" rule as requested.

## Implementation Plan
1.  Create integration tests for multi-language fallback.
2.  Modify `parseProject` to handle multiple language attempts.
3.  Update `remarkTransclusion` to use the language context.
4.  Update `api-server` to implement the fallback logic for both the project list and individual project data.
