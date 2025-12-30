# MDTutor Parser

The MDTutor Parser is responsible for converting Markdown content from local repositories into the RPL-compatible JSON format used by the API server and the web application.

## Core Functionality

- **Markdown to JSON**: Converts `.md` files and `meta.yml` into a structured JSON response.
- **Unified.js Pipeline**: Uses `remark` and `rehype` for parsing and transformation.
- **Custom Plugins**: Includes custom plugins for RPL-specific extensions like tasks, hints, and quizzes.
- **Multi-language Support**: Handles project parsing for multiple languages with fallback logic.

## Testing

The parser uses a comprehensive testing suite to ensure parity with the original Raspberry Pi Learning API.

### Test Types

- **Integration Tests**: Compare the full parser output against API snapshots.
- **Parity Tests**: Deep structural HTML comparison of step content.
- **Unit Tests**: Test individual components like metadata parsing and custom plugins.

### Running Tests

```bash
# Run all parser tests
npm test

# Run specific parity tests
node --test packages/parser/test/step-content-exact.test.js

# Run targeted parity tests (e.g., for Silly Eyes)
PROJECT=silly-eyes LANG=de-DE node --test packages/parser/test/step-content-exact.test.js
```

For more details on testing, see [docs/testing_guide.md](docs/testing_guide.md).
