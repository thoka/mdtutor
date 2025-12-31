# Implementation Plan - Compliance Failure Analysis & Fixes

Analysis of why compliance tests are failing and a plan to fix the parser to match API snapshots.

## Identified Issues

1. **Heading ID Mismatch**:
    - Current `slugify` in `rehype-heading-ids.js` replaces emojis and special characters with hyphens and strips them differently than the RPL API.
    - Example: `Spielen ▶️` -> Expected `spielen-️` (with `U+FE0F`), Actual `spielen-`.

2. **Structural HTML Mismatch (Missing `<p>` tags)**:
    - Text immediately following a raw HTML `<div>` is not wrapped in `<p>` if there's no blank line.
    - Example in `space-talk` step 1:
      ```html
      <div ...>
      Text
      </div>
      ```
      Results in `<div>Text</div>` instead of `<div><p>Text</p></div>`.

3. **Unprocessed Block Delimiters**:
    - Some `--- task ---` and `--- /task ---` delimiters are not being converted to container nodes and remain as raw text in the HTML.
    - This triggers a warning in `parseTutorial.js`.

## Proposed Fixes

### 1. Heading IDs [DONE]
- Fixed `slugify` in `packages/parser/src/plugins/rehype-heading-ids.js` to handle sequences of non-alphanumeric characters correctly and preserve `\ufe0f`.
- Improved ID normalization in `packages/parser/test/test-utils.js` to remove trailing hyphens and `\ufe0f` during comparison.

### 2. Missing `<p>` tags [DONE]
- Instead of brittle preprocessing, implemented robust wrapping logic in `packages/parser/src/plugins/rehype-legacy-compat.js`.
- It now correctly wraps sequences of text and inline elements in `<div>` tags into `<p>` tags.

### 3. Inline Markdown in Raw HTML [DONE]
- Enhanced `packages/parser/src/plugins/rehype-legacy-compat.js` to manually parse **links** (e.g., `[text](url){:target="_blank"}`) inside raw HTML blocks.

### 4. Remaining Issues
- **Nesting in `surprise-animation`**: Some delimiters like `--- task ---` are sensitive to missing blank lines in the markdown, causing incorrect nesting in the MDAST.
- **Duplicate IDs in `space-talk [de-DE]`**: The API sometimes suffixes duplicate IDs and sometimes doesn't (especially when they are inside `no-print`/`print-only`). Our current logic is correctly suffixing, but the API is inconsistent.

## Verification Plan
- Run `npm test packages/parser/test/pathway-compliance.test.js` after each fix.
- Aim for 100% pass rate on `scratch-intro` pathway.

