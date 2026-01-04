# Migration Guide: Content Restructuring 🔹CP4xl

This guide provides the exact steps to replicate the content restructuring (moving from `test/snapshots` to `content/` hierarchy) on branches where these changes are missing.

## 1. Directory Structure & Metadata

Create the new structure and metadata files:

```bash
mkdir -p content/RPL/projects content/RPL/pathways content/TAG/projects content/TAG/pathways
```

Create `content/RPL/meta.yml`:
```yaml
github_source: https://github.com/raspberrypi
namespace: rpl
```

Create `content/TAG/meta.yml`:
```yaml
github_source: https://github.com/tag-makerspace
namespace: tag
```

## 2. Content Migration

Move existing content to the new structure:

```bash
# Move projects
mv test/snapshots/* content/RPL/projects/
# Move pathways (if exists)
mv test/pathways.yaml content/RPL/pathways/ 2>/dev/null || true
# Remove old snapshots directory
rm -rf test/snapshots
```

## 3. API Server Updates (`packages/api-server/src/server.js`)

The API server needs to:
1.  Discover providers by scanning `content/*/meta.yml`.
2.  Resolve namespaced slugs (e.g., `rpl:silly-eyes`).
3.  Transform image URLs to point to `/content/...`.

**Key Code Changes:**
- Add `getProviders()` to read metadata.
- Update `getProjectData` to use `resolveSlug(slug)`.
- Update `transformImageUrls` to use the provider-based path.

## 4. Parser Updates (`packages/parser`)

### `packages/parser/src/parse-project.js`
Update `basePath` resolution for transclusions:
```javascript
// Look for 'projects' directory in the path to determine the base for transclusions
const projectsIndex = projectPath.indexOf('/projects/');
const basePath = projectsIndex !== -1 
  ? projectPath.substring(0, projectsIndex + 10) // include '/projects/'
  : projectPath;
```

### `packages/parser/src/plugins/remark-transclusion.js`
Update the directory detection:
```javascript
// Change from 'snapshots' to 'projects'
if (pathParts.includes('projects')) {
  const projectsIndex = pathParts.indexOf('projects');
  // ...
}
```

## 5. Web App Symlink

Update the symlink in the web app:

```bash
cd apps/web/public
rm -f snapshots
ln -s ../../../content content
```

## 6. Test Suite Updates

All tests referencing `test/snapshots` must be updated to `content/RPL/projects`.

**Example Command:**
```bash
find packages/parser/test -name "*.test.js" -exec sed -i "s|test/snapshots|content/RPL/projects|g" {} +
```

## 7. Git Configuration

Update `.gitignore` to ignore fetched content but keep metadata:

```
# Ignore fetched content
content/RPL/projects/*
content/RPL/pathways/*
# Keep metadata and TAG content
!content/RPL/meta.yml
!content/RPL/README.md
!content/TAG/**
```

## 8. Verification

1.  Run API: `npm run dev --workspace=packages/api-server`
2.  Check projects: `curl http://localhost:3102/api/projects` (should show `rpl:` prefix).
3.  Run tests: `npm test --workspace=packages/parser`
