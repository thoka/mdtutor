# API Server

Express server serving tutorial content from local snapshots, compatible with Raspberry Pi Learning API structure.

## Features

- Serves tutorial data from `test/snapshots`
- Uses `parseProject` to parse markdown repositories on-the-fly
- Falls back to static JSON files if parsing fails
- Language fallback support (German first, English fallback)
- **Commit validation**: Prevents starting if another server is running with a different commit

## Commit Validation

The server validates that no other API server is running with a different commit before starting. This ensures that each IDE/development environment uses the correct API version.

### How it works

1. On startup, the server checks if another API is running on the same port
2. If found, it compares the commit hash of the running server with the current commit
3. If they differ, the server refuses to start (unless `--force` is used)
4. The `/api/health` endpoint includes the current commit hash

### Usage

```bash
# Normal start (validates commit)
npm run api

# Force start (skip validation)
npm run api -- --force

# Or directly
node src/server.js --force
```

### Health Endpoint

```bash
curl http://localhost:3201/api/health
```

Response includes:
```json
{
  "status": "ok",
  "port": 3201,
  "commitHash": "ef01ce767cc3ad0b5b9535131ebfc9af745a6ada",
  "commitHashShort": "ef01ce7",
  "usingParser": true
}
```

## Configuration

Port can be configured via environment variables:
- `API_PORT` (preferred)
- `PORT` (fallback)
- Default: `3201`

## Development

```bash
# Start with watch mode
npm run dev

# Run tests
npm test
```

