# YAML Blocks Parsing 🔹H7yrA

## Overview

The parser supports YAML blocks anywhere in the document, not just at the beginning. This is used for collapse panels and other structured content.

## Syntax

```markdown
---
title: Panel Title
---
```

Three dashes (`---`) on a line by itself (without text before or after) mark the beginning and end of a YAML block.

## Rules

1. **Delimiter**: Three dashes (`---`) on a line by itself
   - Must not have text before or after (to distinguish from block delimiters like `--- collapse ---`)
   - Whitespace-only lines are allowed before/after

2. **Content**: YAML content between the delimiters
   - Can be single-line (e.g., `title: Panel Title`)
   - Can be multi-line YAML

3. **Closing**: Three dashes (`---`) on a line by itself

## Implementation

The parser uses a two-stage approach:

1. **Preprocessing** (`preprocessYamlBlocks` in `parse-tutorial.js`):
   - Scans the markdown text before parsing
   - Converts YAML blocks to code blocks with `yaml-block` language
   - This allows `remark-parse` to handle them correctly

2. **AST Processing** (`remark-yaml-blocks.js` plugin):
   - Finds code blocks with `yaml-block` language
   - Converts them to `yaml` nodes in the AST
   - These can then be processed by other plugins (e.g., `remark-block-delimiters`)

## Usage in Collapse Panels

YAML blocks are commonly used within collapse blocks:

```markdown
--- collapse ---
---
title: What you should already know
---
Content here...
--- /collapse ---
```

The `remark-block-delimiters` plugin recognizes YAML nodes after a `collapse` delimiter and generates the correct panel structure:

```html
<div class="c-project-panel c-project-panel--ingredient">
  <h3 class="c-project-panel__heading js-project-panel__toggle">
    What you should already know
  </h3>
  <div class="c-project-panel__content u-hidden">
    Content here...
  </div>
</div>
```

## Examples

### Empty YAML Block

```markdown
---
---
```

Results in an empty YAML node.

### Single Field

```markdown
---
title: Test Title
---
```

Results in a YAML node with value `title: Test Title`.

### Multiple Fields

```markdown
---
title: Panel Title
type: ingredient
---
```

Results in a YAML node with both fields.

## Distinction from Block Delimiters

YAML blocks are distinguished from block delimiters by the presence of text between the dashes:

- `--- collapse ---` → Block delimiter (has text between dashes)
- `---` → YAML block delimiter (no text, just dashes)

