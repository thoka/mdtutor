# Walkthrough: Silly Eyes 100% Parity 🔹G834S

**Date:** 2025-12-30
**Status:** Completed
**Goal:** Achieve 100% HTML parity for the "Silly Eyes" project between the new parser and legacy snapshots.

## Successful Strategies

### 1. Brute-Force Legacy Compatibility (`rehype-legacy-compat.js`)
The most effective strategy was introducing a dedicated "cleanup" plugin at the end of the Rehype pipeline. This plugin handles quirks that are difficult to model with standard Remark/Rehype plugins:
- **Text Wrapping:** Automatically wrapping loose text nodes in `<p>` tags if they aren't already inside a block element.
- **Manual Markdown Parsing:** Standard `remark-parse` stops processing markdown inside raw HTML blocks. We implemented a regex-based parser in the Rehype phase to catch `**bold**` and `` `code`{:class="..."} `` syntax that survived the initial pass.
- **Smart Quotes:** Converting single quotes to German smart quotes (`‘...’`) to match legacy output.

### 2. Slugification Alignment
The legacy parser used a very specific slugification algorithm for heading IDs. We updated `rehype-heading-ids.js` to match this:
- Lowercasing all characters.
- Replacing spaces with hyphens.
- Removing special characters (like emojis or punctuation) instead of encoding them.

### 3. Quiz Content Management
Legacy API responses for steps containing quizzes have an empty `content` field, as the quiz data is handled separately. We updated `parse-project.js` to set `content = ''` when a quiz is detected in a step.

### 4. Panel Defaults and Structure
The `remark-block-containers.js` plugin was refined to handle specific panel types:
- **Save Panels:** Automatically adding the default title "Speichere dein Projekt" if none is provided.
- **Structural Parity:** Removing the `u-hidden` content wrapper for save panels to match the legacy HTML structure.

## Necessary Adjustments

- **Remark GFM Removal:** Disabled `remark-gfm` as it was interfering with legacy table/link parsing.
- **Link Attributes:** Ensured `target="_blank"` is only added when explicitly requested via `{:target="_blank"}`.
- **Whitespace Control:** Fine-tuned `rehype-stringify` and manual text node manipulation to match legacy whitespace exactly.

## Verification
Parity is verified using `debug-compare-v2.js`, which compares the local parser output against `test/snapshots/silly-eyes/`.

```bash
node debug-compare-v2.js
# Output: Differences in Step 0-6: 0
```
