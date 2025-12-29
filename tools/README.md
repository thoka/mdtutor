# Comparison Tools

Tools for comparing HTML structure and JSON data between the reference RPL site and the local renderer/parser.

## Tools

### 1. `extract-structure.js` - Extract HTML structure from a single page

Extracts and prints the HTML structure (tags, classes, IDs) from a given URL.

```bash
# Extract from reference site (requires Puppeteer for client-side rendering)
npm run extract:structure "https://projects.raspberrypi.org/en/projects/cats-vs-dogs/1" --puppeteer

# Extract from local renderer (Puppeteer used automatically for localhost)
npm run extract:structure "http://localhost:5274/#/cats-vs-dogs/1"
```

### 2. `compare-structure.js` - Compare structures between two pages

Compares the HTML structure between reference and local pages, identifying differences.

```bash
npm run compare:structure "https://projects.raspberrypi.org/en/projects/cats-vs-dogs/1" "http://localhost:5274/#/cats-vs-dogs/1"
```

### 3. `save-html.js` - Save rendered HTML for manual inspection

Saves the fully rendered HTML to a file for manual comparison.

```bash
# Save reference site HTML
node tools/save-html.js "https://projects.raspberrypi.org/en/projects/cats-vs-dogs/1" ref.html

# Save local renderer HTML (make sure dev server is running)
node tools/save-html.js "http://localhost:5274/#/cats-vs-dogs/1" local.html
```

## Usage Workflow

1. **Start your local dev server:**
   ```bash
   npm run dev:bg
   ```

2. **Save HTML from both sites:**
   ```bash
   node tools/save-html.js "https://projects.raspberrypi.org/en/projects/cats-vs-dogs/1" ref.html
   node tools/save-html.js "http://localhost:5274/#/cats-vs-dogs/1" local.html
   ```

3. **Compare the structures:**
   ```bash
   npm run compare:structure "https://projects.raspberrypi.org/en/projects/cats-vs-dogs/1" "http://localhost:5274/#/cats-vs-dogs/1"
   ```

4. **Inspect differences and update renderer components** to match the reference structure.

## What to Look For

- **Div hierarchy**: Ensure the nesting of divs matches exactly
- **Class names**: All class names should match (especially `.c-project*` classes)
- **Element types**: `<div>` vs `<article>` vs `<section>` should match
- **ID attributes**: IDs should match if present
- **Order of elements**: Sidebar, header, main content should be in the same order

### 4. `compare-json.js` - Compare JSON structures (API vs Parser output)

Compares two JSON files/objects and reports differences. Useful for ensuring parser output matches the original API structure.

```bash
# Compare API snapshot with parser output
node tools/compare-json.js test/snapshots/cats-vs-dogs/api-project-en.json parsed-output.json

# With HTML normalization (for content fields)
node tools/compare-json.js --api test/snapshots/cats-vs-dogs/api-project-en.json --parsed parsed-output.json --normalize-html

# Ignore specific paths
node tools/compare-json.js file1.json file2.json --ignore "data.id" --ignore "data.attributes.masterLastCommit"
```

**Options:**
- `--normalize-html`: Normalize HTML content before comparison (removes whitespace differences)
- `--ignore <path>`: Ignore specific paths (can be used multiple times)
- `--max-diffs <n>`: Maximum number of differences to show (default: 50)

## Notes

- The reference site uses client-side rendering, so Puppeteer is required to get the fully rendered HTML
- Local renderer also uses client-side rendering (Svelte), so Puppeteer is used automatically for localhost URLs
- Cookie dialogs and other non-content elements are filtered out during comparison

