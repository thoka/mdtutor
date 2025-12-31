# Agent Tools

This directory contains scripts optimized for AI agent use.

## General Specs
- **Self-Documentation**: Run any tool with `--help` for usage and examples.
- **Agent-First**: Error messages are descriptive. Use `--json` (where supported) for machine-readable output.
- **Source Truth**: Detailed logic and parameters are documented in the script headers.

## Available Tools
- `compare-structure.js`: Identifies structural HTML differences between reference and local.
- `extract-css.js`: Scrapes CSS from reference pages for cloning.
- `extract-structure.js`: Dumps HTML tag/class hierarchy.
- `save-html.js`: Downloads fully rendered HTML (Puppeteer-backed).
- `fetch-pathways.js`: Fetches learning pathways and projects from the RPL API.

