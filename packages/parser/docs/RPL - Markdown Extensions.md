# Raspberry Pi Learning - Markdown Extensions Specification

## Document Purpose
This document identifies custom Markdown extensions used in Raspberry Pi Learning tutorials for test creation and parser implementation.

## File Structure

### Multi-File Organization
Tutorials are split across multiple files:
- `meta.yml` - Project-level metadata (in language directory)
- `step_1.md`, `step_2.md`, ... - Sequential tutorial steps
- Language variants in separate directories: `en/`, `de/`, `es/`, etc.

### Frontmatter Support
**Current behavior:**
- Frontmatter allowed in each `step_X.md` file

**Desired generalization:**
- Frontmatter directly after any heading (at any level)

**Example:**
```markdown
# Step Title
---
custom_field: value
difficulty: medium
---

Step content here...

## Subsection
---
note: "This subsection has metadata"
---

Subsection content...
```

### Directory Structure Example
```
tutorial-name/
├── en/
│   ├── meta.yml
│   ├── step_1.md
│   ├── step_2.md
│   └── step_3.md
├── de/
│   ├── meta.yml
│   ├── step_1.md
│   └── ...
└── images/
    └── ...
```

**Note:** `meta.yml` exists per language directory, not at root level.

## Custom Markdown Extensions

### 1. Block Delimiters
Custom block types using triple-dash syntax:

```markdown
--- TYPE ---
Block content here
--- /TYPE ---
```

**Common block types** (to be identified from actual tutorials):
- `collapse` - Collapsible sections
- `challenge` - Challenge/task blocks
- `hint` - Hint blocks
- `save` - Save point indicators
- `print-only` - Content visible only in print
- `no-print` - Content hidden in print

**Behavior:**
- Opening: `--- TYPE ---`
- Closing: `--- /TYPE ---`
- **Blocks can be nested**

**Nesting example:**
```markdown
--- challenge ---
This is a challenge.

--- hint ---
Here's a hint inside the challenge.
--- /hint ---

Continue with the challenge.
--- /challenge ---
```

### 2. Transclusion
Include content from other tutorials:

```markdown
[[[other-tutorial-name]]]
```

**Behavior:**
- References another tutorial by its slug/identifier
- Presumably renders that tutorial's content inline
- May support step-specific inclusion (needs verification)

**Variations to test:**
- `[[[tutorial-name]]]` - Full tutorial
- `[[[tutorial-name/step-1]]]` - Specific step (hypothetical)
- Circular reference handling

### 3. Link Attributes
CSS classes and other attributes in curly braces after links:

```markdown
[Link text](url){.class-name}
[Link text](url){target="_blank"}
[Link text](url){.button .large}
```

**Common use cases:**
- Style classes: `{.button}`, `{.download}`
- Target attributes: `{target="_blank"}`
- Multiple attributes: `{.class1 .class2 attr="value"}`

**May also apply to:**
- Images: `![alt](image.png){.large}`
- Other elements (needs investigation)

### 4. Standard Markdown with Extensions

#### Images
```markdown
![Alt text](images/filename.png)
![Raspberry Pi logo](http://example.com/image.png)
```

#### Links
```markdown
[Link text](http://example.com)
[Relative link](../other-page.md)
[Section anchor](#section-name)
```

#### Code Blocks
```markdown
```python
print("Hello, World!")
```
```

#### Emphasis
```markdown
**bold**
*italic*
`inline code`
```

## Metadata (meta.yml)

Structure of the YAML frontmatter file:

```yaml
title: "Tutorial Title"
description: "Brief description"
hero_image: images/banner.png
theme: "red"  # or other theme colors
duration: 2  # in hours (estimated)
listed: true/false
ingredient: false
copyedit: false
curriculum: "1, 2"
interests: "games, art"
technologies: "scratch, python"
site_areas: "projects, coderdojo"
hardware: "raspberry-pi, camera"
software: "scratch, python-3"
version: 4
last_tested: "2021-03-01"
steps:
  - title: "Introduction"
  - title: "Step 1"
  - title: "Step 2"
```

**Key fields** (identified so far):
- `title` - Tutorial title
- `description` - Short description
- `steps` - Array of step objects with titles
- `duration` - Estimated completion time
- `hardware` / `software` - Required components
- `technologies` - Primary tech used
- `theme` - Visual theme/color

## Identification Tasks

### To be extracted from actual tutorials:

1. **Complete list of block types**
   - Find all `--- TYPE ---` variations
   - Document their rendering behavior
   - Test nesting capabilities

2. **Transclusion syntax variations**
   - Test `[[[tutorial-name]]]`
   - Test with paths/steps
   - Error handling for missing refs

3. **Link attribute patterns**
   - Common classes used
   - Supported HTML attributes
   - Precedence rules for multiple attributes

4. **Image attribute patterns**
   - Size classes
   - Alignment options
   - Caption support

5. **meta.yml complete schema**
   - All possible fields
   - Required vs optional fields
   - Data types and validation rules
   - Relationship between meta.yml and API output

## Test Strategy

### Parser Tests
For each extension, create tests covering:

1. **Basic parsing**
   ```javascript
   it('parses basic block delimiter', () => {
     const input = '--- hint ---\nContent\n--- /hint ---';
     const output = parse(input);
     expect(output.type).toBe('hint_block');
     expect(output.content).toBe('Content');
   });
   ```

2. **Edge cases**
   - Empty blocks
   - Nested blocks
   - Malformed delimiters
   - Special characters in content

3. **Integration**
   - Block inside list
   - Multiple blocks in sequence
   - Blocks with standard Markdown inside

### Renderer Tests
1. **HTML output**
   - Correct tags/classes
   - Attribute preservation
   - Accessibility attributes

2. **JSON output** (API compatibility)
   - Structure matches existing API
   - All metadata preserved
   - Step ordering maintained

## Example Test Tutorial

Minimal tutorial for testing all features:

```
meta.yml:
---
title: "Test Tutorial"
steps:
  - title: "Step 1"
  - title: "Step 2"

en/step_1.md:
---
# Step 1

This is standard markdown with **bold** and `code`.

--- hint ---
This is a hint block.
--- /hint ---

[Link with class](http://example.com){.button}

![Image with class](images/test.png){.large}

[[[another-tutorial]]]

--- challenge ---
Try this challenge.
--- /challenge ---
```

## API Compatibility Target

The parser should output JSON matching:
```
https://learning-admin.raspberrypi.org/api/v1/projects/{slug}
```

Key JSON structure elements to replicate:
- Project metadata
- Step array with content
- Block type identification
- Asset references (images, etc.)
- Cross-references (transclusions)

## Next Steps

1. Select 2-3 representative tutorials from `raspberrypilearning`
2. Extract complete examples of each extension type
3. Document actual API response structure
4. Create comprehensive test suite
5. Implement parser with unified.js + remark/rehype plugins
