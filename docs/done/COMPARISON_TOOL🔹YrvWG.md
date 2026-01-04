# HTML Structure Comparison Tool 🔹YrvWG

## Overview

The `compare-structure.js` tool is designed to identify structural differences between the reference RPL site and the local renderer that could affect CSS matching and styling.

## How It Works

The tool follows a systematic approach to ensure accurate comparison:

### 1. **Fetch Rendered HTML via Puppeteer**
   - Both reference and local URLs are loaded using Puppeteer
   - This ensures we get the fully rendered HTML after all JavaScript has executed
   - Waits for main content to load before extracting

### 2. **Normalize HTML (Remove Content)**
   - Removes all text content, keeping only the structural elements
   - Removes Svelte scoped classes (classes starting with `s-*`)
   - Removes content-related attributes (alt, title, aria-label, etc.)
   - Keeps only structural information: tags, classes, IDs, hierarchy

### 3. **Extract Hierarchical Structure**
   - Builds a tree structure with parent-child relationships
   - Tracks the full path from root to each node
   - Preserves depth information for accurate comparison

### 4. **Compare with Hierarchical Information**
   - Compares nodes at the same position in the hierarchy
   - Identifies:
     - **Tag mismatches**: Different HTML tags at the same position
     - **Class mismatches**: Missing or extra CSS classes
     - **ID mismatches**: Different element IDs
     - **Missing elements**: Elements present in reference but not in local
     - **Extra elements**: Elements present in local but not in reference

## Why This Approach?

### Problem with Previous Approach
- Content differences (text, images) were mixed with structural differences
- Svelte scoped classes (`s-*`) created false positives
- No hierarchical context made it hard to understand where differences occurred

### Benefits of Improved Approach
1. **Focus on Structure**: Only structural differences are reported
2. **Ignore Svelte Artifacts**: Svelte scoped classes are filtered out
3. **Hierarchical Context**: Shows the full path to each difference
4. **Clearer Output**: Grouped by type with clear messages

## Example Use Case

When comparing structures, the tool can identify issues like:

```
[TAG_MISMATCH] (1 found)
  1. Tag mismatch: expected <main>, found <div>
     Path: body > div#root > main.c-layout > div.c-project > div.no-print > main
     Depth: 5
     Expected: <main>
     Found: <div>
```

This clearly shows there's a nested `<main>` tag issue - the reference has `<main>` at a certain depth, but the local renderer has a `<div>` instead.

## Usage

```bash
npm run compare:structure "https://projects.raspberrypi.org/en/projects/cats-vs-dogs/1" "http://localhost:5274/#/cats-vs-dogs/1"
```

## Future Improvements

Potential enhancements:
- **Semantic matching**: Match elements by semantic role, not just position
- **CSS impact analysis**: Show which CSS rules are affected by each difference
- **Auto-fix suggestions**: Generate code changes to fix identified issues
- **Visual diff**: Generate a side-by-side HTML comparison
- **Ignore patterns**: Allow ignoring certain types of differences (e.g., print-only content)

