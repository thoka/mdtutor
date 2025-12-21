# Test Data Collection Specification

**Purpose:** Fetch reference tutorial data from raspberrypilearning repositories and official API for parser development and testing.

**Script:** `test/get-test-data.js`

**Requirements:**
- Node.js >= 18 (native fetch API support required)
- No external dependencies needed

## API Endpoints to Fetch

For each tutorial and each configured language, the following endpoints are fetched:

### 1. Projects API (Required)

**Endpoint:** `https://learning-admin.raspberrypi.org/api/v1/{language}/projects/{slug}`

**Contains:** Full tutorial metadata, steps, content

**Example:** `/api/v1/en/projects/silly-eyes`

**Status:** **Required** - tutorial fails if this endpoint fails

### 2. Progress API (Optional)

**Endpoint:** `https://learning-admin.raspberrypi.org/api/v1/{language}/progress/{slug}`

**Contains:** User progress data, completion status

**Example:** `/api/v1/en/progress/silly-eyes`

**Status:** **Optional** - log warning if fails, continue processing

**Note:** This endpoint may require user authentication and typically returns 404 for unauthenticated requests.

### 3. Pathways API (Optional)

**Endpoint:** `https://learning-admin.raspberrypi.org/api/v1/{language}/pathways/{pathway-slug}/projects`

**Contains:** All projects in learning pathway, sequence information

**Example:** `/api/v1/en/pathways/scratch-intro/projects`

**Status:** **Optional** - only fetch if pathway detected in tutorial

**Pathway Detection:**
- Parse `en/step_8.md` and `en/step_9.md` for URLs matching pattern `projects.raspberrypi.org/*/pathways/{pathway-slug}`
- Multi-pathway Support: Collect **all** pathway references found (tutorials may belong to multiple pathways)

## File Naming Conventions

```
test/snapshots/{tutorial-slug}/
├── repo/                                        # Cloned GitHub repository
├── api-project-{language}.json                 # Projects API response
├── api-progress-{language}.json                # Progress API response (if available)
├── api-pathway-{pathway-slug}-{language}.json  # Pathways API (one file per pathway)
└── snapshot-meta.json                          # Metadata with all paths and pathway info
```

## Language Configuration

- **Current:** English only via `LANGUAGES = ['en']` in the script
- **Future:** Add German and others: `LANGUAGES = ['en', 'de']`
- **Implementation:** All API calls iterate over configured languages
- **File suffixes:** Always include language code (e.g., `-en.json`, `-de.json`)

## Snapshot Metadata Structure

```json
{
  "tutorial": "silly-eyes",
  "timestamp": "2025-12-21T...",
  "languages": ["en"],
  "paths": {
    "repository": "test/snapshots/silly-eyes/repo",
    "api": {
      "en": {
        "project": "test/snapshots/silly-eyes/api-project-en.json",
        "progress": "test/snapshots/silly-eyes/api-progress-en.json",
        "pathways": {
          "scratch-intro": "test/snapshots/silly-eyes/api-pathway-scratch-intro-en.json"
        }
      }
    }
  },
  "pathways": [
    {
      "slug": "scratch-intro",
      "detected_from": "en/step_8.md or en/step_9.md",
      "available": true
    }
  ]
}
```

## Error Handling

- **Repository cloning fails:** Skip tutorial, log error, continue with next
- **Projects API fails:** Mark tutorial as failed (required endpoint)
- **Progress API fails:** Log warning, continue (optional endpoint)
- **Pathways API fails:** Log warning for that pathway, continue (optional endpoint)
- **No pathway detected:** Skip pathway fetch, note in metadata with empty pathways array

## Rate Limiting

- Caching prevents repeated requests for same resources
- If rate limiting issues occur: Add 100ms delay between API requests
- Pathways fetched once per unique pathway-slug across all tutorials

## Usage

Run the test data collection script:

```bash
node test/get-test-data.js
```

The script will:
1. Clone each tutorial repository from GitHub
2. Detect pathway references in markdown files
3. Fetch all three API endpoints for each configured language
4. Save responses with proper naming conventions
5. Create metadata file with all paths and pathway information
6. Generate summary report in `test/snapshots/summary.json`

## Test Tutorials

Current test tutorials:
- `silly-eyes` - Has pathway reference (scratch-intro)
- `scratchpc-interactive-book` - No pathway
- `getting-started-with-minecraft-pi` - No pathway

Add more tutorials by editing the `TEST_TUTORIALS` array in the script.
