# Remark/Rehype Plugins

This directory contains custom unified.js plugins for parsing Raspberry Pi Learning Markdown extensions:

- `remark-transclusion.js` - Handle `[[[tutorial-name]]]` syntax
- `remark-link-attributes.js` - Parse `{.class}` link attributes
- etc.

## Plugin Development

Each plugin follows the unified.js plugin pattern:

```javascript
export default function remarkPluginName(options) {
  return (tree, file) => {
    // Transform AST
  };
}
```
