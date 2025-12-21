# Quiz Parsing Specification

## Overview

Knowledge quizzes are multi-question assessments embedded in tutorial steps. They are defined in separate directories with individual question markdown files.

## Structure

### 1. Meta.yml Definition

In `meta.yml`, a step can define a knowledge quiz:

```yaml
steps:
  - title: Quick quiz
    knowledge_quiz:
      path: quiz1          # Directory name containing question files
      version: 1          # Quiz version number
      questions: 3         # Total number of questions
      passing_score: 3     # Minimum score to pass
    completion:
      - external
```

**Fields:**
- `path` (required): Directory name relative to language directory (e.g., `en/quiz1/`)
- `version` (required): Version number of the quiz
- `questions` (required): Total number of questions in the quiz
- `passing_score` (required): Minimum score required to pass

### 2. Quiz Directory Structure

Quiz questions are stored in a subdirectory named after the `path` value:

```
tutorial-name/
├── en/
│   ├── meta.yml
│   ├── step_1.md
│   ├── step_2.md
│   └── quiz1/              # Quiz directory
│       ├── question_1.md
│       ├── question_2.md
│       └── question_3.md
```

**Naming Convention:**
- Questions are numbered sequentially: `question_1.md`, `question_2.md`, etc.
- Numbering starts at 1 (not 0)

### 3. Question File Format

Each question file (`question_X.md`) contains:

#### Structure:
```markdown
--- question ---
---
legend: Question X of Y
---

[Question text in Markdown]

--- choices ---

- (x) [Correct answer option]

  --- feedback ---

  [Feedback text for correct answer]

  --- /feedback ---

- ( ) [Incorrect answer option]

  --- feedback ---

  [Feedback text for incorrect answer]

  --- /feedback ---

[Additional choices...]

--- /choices ---

--- /question ---
```

#### Elements:

1. **Question Block**: `--- question ---` ... `--- /question ---`
   - Wraps the entire question
   - Contains frontmatter and question content

2. **Frontmatter** (inside question block):
   - `legend: Question X of Y` - Display text showing question number

3. **Question Text**:
   - Standard Markdown content
   - Can include images, code blocks, inline formatting
   - Can include Scratch blocks (`blocks3` language)

4. **Choices Block**: `--- choices ---` ... `--- /choices ---`
   - Contains all answer options
   - Uses list syntax with markers:
     - `(x)` = correct answer (checked)
     - `( )` = incorrect answer (unchecked)

5. **Feedback Block**: `--- feedback ---` ... `--- /feedback ---`
   - Appears after each choice
   - Contains feedback text (Markdown)
   - Shown after user selects that choice

#### Choice Format:
```markdown
- (x) [Answer text with optional image]

  --- feedback ---

  [Feedback content in Markdown]

  --- /feedback ---
```

**Notes:**
- Correct answer is marked with `(x)`
- Incorrect answers are marked with `( )`
- Choices can contain images: `![alt](path.png)`
- Choices can contain code blocks
- Feedback is optional but recommended
- Feedback can contain Markdown formatting

### 4. API Output Structure

In the parsed output, the step should have:

```json
{
  "position": 4,
  "title": "Quick quiz",
  "quiz": true,
  "knowledgeQuiz": "quiz1",
  "content": "[HTML content with embedded quiz]",
  "completion": ["external"]
}
```

**Fields:**
- `quiz`: `true` if step contains a quiz
- `knowledgeQuiz`: String value matching the `path` from meta.yml (e.g., `"quiz1"`)
- `content`: HTML containing the quiz questions rendered inline

**Note:** The API currently stores `knowledgeQuiz` as a string (the path), not as a structured object. The quiz content is embedded in the `content` HTML.

## Parsing Requirements

### 1. Quiz Detection

- Check `meta.yml` for steps with `knowledge_quiz` field
- If present, mark step with `quiz: true`
- Store `knowledgeQuiz: path` value

### 2. Question File Loading

- Read all `question_X.md` files from `{lang}/{path}/` directory
- Sort by question number (extract from filename)
- Parse each question file

### 3. Question Parsing

For each question file:

1. **Extract frontmatter** from question block
   - Parse `legend` field

2. **Parse question text**
   - Content between `--- question ---` and `--- choices ---`
   - Process as standard Markdown
   - Support Scratch blocks (`blocks3` language)
   - Support images, formatting, etc.

3. **Parse choices**
   - Extract all list items from choices block
   - Identify correct answer: `(x)` marker
   - Identify incorrect answers: `( )` marker
   - Extract choice text (can include images, code)
   - Extract feedback for each choice

4. **Generate HTML structure**
   - Use appropriate CSS classes from RPL design system
   - Structure: question → choices → feedback

### 4. Content Integration

- Embed parsed quiz questions into step content
- Maintain question order (1, 2, 3, ...)
- Preserve all formatting and media

## CSS Classes (from RPL Design System)

Based on `computed.css` analysis:

- `.c-project-quiz__content` - Quiz container
- `.c-project-quiz__input` - Radio button input (hidden)
- `.c-project-quiz__label` - Choice label/button
- `.c-project-quiz__label--active` - Selected choice
- `.c-project-quiz__label--disabled` - Disabled state
- `.c-project-quiz__thank-you-box` - Feedback display

## Example

### Input (meta.yml):
```yaml
- title: Quick quiz
  knowledge_quiz:
    path: quiz1
    version: 1
    questions: 3
    passing_score: 3
```

### Input (quiz1/question_1.md):
```markdown
--- question ---
---
legend: Question 1 of 3
---

How could you fix the problem?

--- choices ---

- (x) Click on the green flag

  --- feedback ---

  Yes! You need to click on the green flag.

  --- /feedback ---

- ( ) Click on the eyeball

  --- feedback ---

  The script does not start with a `when this sprite clicked` block.

  --- /feedback ---

--- /choices ---

--- /question ---
```

### Output (JSON):
```json
{
  "position": 4,
  "title": "Quick quiz",
  "quiz": true,
  "knowledgeQuiz": "quiz1",
  "content": "<div class=\"c-project-quiz__content\">...</div>"
}
```

## Implementation Tasks

1. **Parser Updates:**
   - Extend `parse-project.js` to detect `knowledge_quiz` in meta.yml
   - Create `parse-quiz.js` to parse quiz directory
   - Create `parse-question.js` to parse individual question files
   - Integrate quiz HTML into step content

2. **Markdown Processing:**
   - Handle `--- question ---` blocks
   - Handle `--- choices ---` blocks
   - Handle `--- feedback ---` blocks
   - Process choice markers `(x)` and `( )`
   - Support nested blocks (feedback inside choices)

3. **HTML Generation:**
   - Generate quiz container structure
   - Generate choice inputs and labels
   - Generate feedback elements
   - Apply RPL CSS classes

4. **Testing:**
   - Test with `silly-eyes` tutorial
   - Compare output with API data
   - Test edge cases (missing files, malformed questions, etc.)
   - **Test Coverage:**
     - `parse-question-detailed.test.js`: 15 tests for question parsing
     - `parse-quiz-detailed.test.js`: 12 tests for quiz directory parsing
     - `parse-project-quiz-integration.test.js`: 10 tests for project integration
     - `compare-quiz-api.test.js`: 5 tests comparing with original API structure
     - `compare-quiz-api-exact.test.js`: 4 tests for exact API comparison and difference documentation

## Edge Cases

1. **Missing question files**: Skip missing questions, log warning
2. **Malformed question structure**: Try to parse what's possible, log errors
3. **Missing feedback**: Allow questions without feedback
4. **No correct answer marked**: Log error, treat first as correct (or skip)
5. **Multiple correct answers**: Use first `(x)` as correct
6. **Wrong question count**: Use actual number of files found

## Implementation Status

### ✅ Completed

1. **Parser Implementation:**
   - `parse-question.js`: Parses individual question markdown files
   - `parse-quiz.js`: Parses quiz directories and generates HTML
   - `parse-project.js`: Integrates quiz parsing into project parsing

2. **HTML Generation:**
   - Generates quiz structure with correct CSS classes
   - Includes check buttons for each question
   - Properly structures feedback elements
   - Uses `knowledge-quiz` and `knowledge-quiz-question` classes

3. **Renderer Implementation:**
   - Quiz interaction handling in `StepContent.svelte`
   - Radio button selection and feedback display
   - Check button functionality
   - Answer disabling after check

4. **Testing:**
   - Comprehensive test suite (46+ tests)
   - API comparison tests
   - Edge case handling tests

### 📝 Known Differences from Original API

The implementation intentionally differs from the original API in several ways:

1. **Container Element**: API uses `<form>`, we use `<div>` (both work with CSS)
2. **Radio Button Names**: API uses generic `"answer"`, we use unique `"quiz-question-X"`
3. **Radio Button IDs**: API uses `"choice-X"`, we use descriptive `"quiz-question-X-answer-Y"`
4. **Radio Button Values**: API uses 1-based (`"1"`, `"2"`), we use 0-based (`"0"`, `"1"`) for array indices
5. **Button Value**: API uses `"submit"`, we use `"Check my answer"` (user requirement)
6. **Feedback Structure**: Different nesting, but same CSS classes

These differences are documented in `compare-quiz-api-exact.test.js` and are intentional design decisions.

## References

- Original Project API: `test/snapshots/silly-eyes/api-project-en.json`
- Original Quiz API: `test/snapshots/silly-eyes/api-quiz-quiz1-en.json`
- Example quiz: `test/snapshots/silly-eyes/repo/en/quiz1/`
- Meta definition: `test/snapshots/silly-eyes/repo/en/meta.yml`
- CSS classes: `apps/web/src/styles/rpl-cloned/computed.css` (lines 1680-1723)
- Test files: `packages/parser/test/parse-question*.test.js`, `parse-quiz*.test.js`, `compare-quiz-api*.test.js`

