# Block Delimiters Specification

**Status:** ✅ Implemented  
**Date:** 2025-12-29

## Overview

Block delimiters (`--- TYPE ---` syntax) are parsed using a custom micromark extension that integrates directly into the Markdown parser pipeline. This provides robust token recognition and eliminates the need for preprocessing.

## Syntax

Block delimiters use the format:
- Opening: `--- TYPE ---`
- Closing: `--- /TYPE ---`

Supported block types:
- `task` - Task blocks
- `collapse` - Collapsible panels (ingredients)
- `save` - Save panels
- `no-print` - Hidden in print
- `print-only` - Only visible in print

## Architecture

```
Markdown → micromark (with Extension) → Tokens → mdast-util (with Handler) → MDAST Nodes → remark Plugin → HTML
```

## Implementation

### Micromark Extension
- **File:** `packages/parser/src/plugins/micromark-extension-block-delimiters.js`
- **Purpose:** Tokenizes `--- TYPE ---` syntax directly in the markdown stream
- **Output:** Creates `blockDelimiter` tokens

### MDast Utility
- **File:** `packages/parser/src/plugins/mdast-util-block-delimiters.js`
- **Purpose:** Converts tokens to MDAST nodes
- **Output:** Creates `blockDelimiter` nodes in the AST

### Remark Plugin
- **File:** `packages/parser/src/plugins/remark-block-delimiters.js`
- **Purpose:** Processes `blockDelimiter` nodes and converts them to HTML structure
- **Output:** Generates HTML divs with appropriate CSS classes

## Integration

The extension is integrated via `unified.data()` in `parse-tutorial.js`:

```javascript
.data('micromarkExtensions', [blockDelimiters()])
.data('fromMarkdownExtensions', [blockDelimitersFromMarkdown()])
```

## HTML Output

Block delimiters are converted to HTML structures:

- **Task blocks:** `<div class="c-project-task">...</div>`
- **Collapse panels:** `<div class="c-project-panel c-project-panel--ingredient">...</div>`
- **Save panels:** `<div class="c-project-panel c-project-panel--save">...</div>`
- **No-print:** `<div class="u-no-print">...</div>`
- **Print-only:** `<div class="u-print-only">...</div>`

## Frontmatter Support

Collapse blocks can include YAML frontmatter for metadata:

```markdown
--- collapse ---
---
title: Panel Title
type: ingredient
---
Content...
--- /collapse ---
```

The frontmatter is parsed and used to customize the panel structure.

## Preprocessing

Block delimiters are NOT converted to HTML comments in preprocessing. The micromark extension handles them directly. Preprocessing only distinguishes between YAML delimiters (`---`) and block delimiters (`--- TYPE ---`) to avoid false matches.

