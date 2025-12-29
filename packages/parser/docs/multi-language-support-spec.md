# Multi-Language Support Specification

**Status:** ✅ Implemented  
**Date:** 2025-12-21

## Overview

The parser supports multiple languages with automatic fallback. German (`de-DE`) is preferred when available, with English (`en`) as fallback.

## Language Fallback Strategy

1. **Tutorial Selection:** When a project is requested, the system checks for German content first
2. **Transclusion Fallback:** Transcluded content (embedded panels) also follows the language fallback chain
3. **API Support:** The API server handles language negotiation with fallback logic

## Parser Implementation

### `parseProject` Function

- **Location:** `packages/parser/src/parse-project.js`
- **Parameters:** `projectPath` (base repository path), `options.languages` (array of preferred languages)
- **Behavior:** Attempts to parse each language in order until a valid `meta.yml` is found

### Language Mapping

The system handles mapping between short codes (e.g., `de`) and RPL-specific codes (e.g., `de-DE`).

### Transclusion Language Context

- **Location:** `packages/parser/src/plugins/remark-transclusion.js`
- **Behavior:** Transclusions receive the current language context and use the same fallback strategy

## API Server Implementation

### Fallback Logic

- **Location:** `packages/api-server/src/server.js`
- **Endpoints:** `/api/projects` and `/api/projects/:slug`
- **Behavior:** Automatically falls back to next language if requested language is not available

### Language Detection

- Primary rule: German first, English fallback (as requested)
- Optional: Header-based language detection (future enhancement)

## Language Codes

Supported language codes:
- `de-DE` - German (preferred)
- `en` - English (fallback)

Additional languages can be added by extending the fallback chain.

