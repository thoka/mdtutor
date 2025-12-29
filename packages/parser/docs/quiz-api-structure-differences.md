# Quiz API Structure Differences

## Overview

This document explains the differences between our generated quiz HTML structure and the original Quiz API structure from `https://learning-admin.raspberrypi.org/api/v1/{lang}/projects/{slug}/quizzes/{quizPath}`.

## Key Differences

### 1. Container Element

**Original API:**
```html
<form class="knowledge-quiz-question">
```

**Our Structure:**
```html
<div class="knowledge-quiz knowledge-quiz-question">
```

**Impact:** Both work with CSS, but different semantic meaning. Forms are typically used for submission, while divs are generic containers.

### 2. Radio Button Names

**Original API:**
```html
<input type="radio" name="answer" value="1" id="choice-1" />
<input type="radio" name="answer" value="2" id="choice-2" />
```
- All radio buttons in a question share the same name: `"answer"`
- This groups them together for selection

**Our Structure:**
```html
<input type="radio" name="quiz-question-1" value="0" id="quiz-question-1-answer-1" />
<input type="radio" name="quiz-question-1" value="1" id="quiz-question-1-answer-2" />
```
- Each question has a unique name: `"quiz-question-{N}"`
- More descriptive and prevents conflicts if multiple questions are on the same page

**Impact:** Both work correctly for radio button grouping. Our approach is more explicit.

### 3. Radio Button IDs

**Original API:**
```html
<input type="radio" id="choice-1" />
<input type="radio" id="choice-2" />
```
- Simple sequential IDs: `"choice-1"`, `"choice-2"`, etc.
- IDs are unique within the question but not globally descriptive

**Our Structure:**
```html
<input type="radio" id="quiz-question-1-answer-1" />
<input type="radio" id="quiz-question-1-answer-2" />
```
- Descriptive IDs: `"quiz-question-{N}-answer-{M}"`
- Globally unique and self-documenting

**Impact:** Our IDs are more descriptive but longer. Both work for label association.

### 4. Radio Button Values

**Original API:**
```html
<input type="radio" value="1" />
<input type="radio" value="2" />
<input type="radio" value="3" />
<input type="radio" value="4" />
```
- 1-based indexing: `"1"`, `"2"`, `"3"`, `"4"`
- Matches the choice number in the ID (`choice-1` → value `"1"`)

**Our Structure:**
```html
<input type="radio" value="0" />
<input type="radio" value="1" />
<input type="radio" value="2" />
<input type="radio" value="3" />
```
- 0-based indexing: `"0"`, `"1"`, `"2"`, `"3"`
- Matches JavaScript array indices

**Impact:** This is the most critical difference for feedback lookup. The renderer must handle both.

### 5. Button Value

**Original API:**
```html
<input type="button" name="Submit" value="submit" />
```
- Button value: `"submit"`
- Button name: `"Submit"`

**Our Structure:**
```html
<input type="button" value="Check my answer" data-question="1" />
```
- Button value: `"Check my answer"` (user requirement)
- No name attribute
- Has `data-question` attribute

**Impact:** The renderer should work with both button values.

### 6. Feedback Structure

**Original API:**
```html
<ul class="knowledge-quiz-question__feedback">
  <li class="knowledge-quiz-question__feedback-item" id="feedback-for-choice-1">
    <!-- Feedback content -->
  </li>
  <li class="knowledge-quiz-question__feedback-item" id="feedback-for-choice-2">
    <!-- Feedback content -->
  </li>
</ul>
```
- Feedback items are direct children of `<ul>`
- Each feedback item has an ID: `"feedback-for-choice-{N}"`
- The ID matches the radio button ID: `choice-1` → `feedback-for-choice-1`
- No `data-correct` attribute on radio buttons
- No `data-answer` attribute on feedback container

**Our Structure:**
```html
<div class="knowledge-quiz-question__feedback" data-answer="0">
  <ul class="knowledge-quiz-question__feedback-list">
    <li class="knowledge-quiz-question__feedback-item knowledge-quiz-question__feedback-item--correct">
      <!-- Feedback content -->
    </li>
  </ul>
</div>
<div class="knowledge-quiz-question__feedback" data-answer="1">
  <ul class="knowledge-quiz-question__feedback-list">
    <li class="knowledge-quiz-question__feedback-item">
      <!-- Feedback content -->
    </li>
  </ul>
</div>
```
- Each feedback is in its own `<div>` container
- Feedback container has `data-answer` attribute (0-based index)
- Feedback items are inside `<ul class="knowledge-quiz-question__feedback-list">`
- Correct answers have `--correct` class on the feedback item
- Radio buttons have `data-correct="true/false"` attribute

**Impact:** This is the most significant structural difference. The renderer must:
1. Support both feedback lookup methods:
   - Our structure: Find feedback by `data-answer` attribute matching radio `value`
   - Original API: Find feedback by ID `feedback-for-choice-{N}` matching radio ID `choice-{N}`
2. Handle both value systems (0-based vs 1-based)

### 7. Correct Answer Indication

**Original API:**
```html
<input type="radio" id="choice-1" checked/>
```
- Uses `checked` attribute to mark correct answer
- No `data-correct` attribute

**Our Structure:**
```html
<input type="radio" value="0" data-correct="true" />
```
- Uses `data-correct="true"` attribute
- No `checked` attribute (answers are not pre-selected)

**Impact:** The renderer should check `data-correct` for styling, but `checked` attribute is also valid for the original API structure.

## Renderer Adaptation Requirements

The renderer (`StepContent.svelte`) must handle both structures:

1. **Feedback Lookup:**
   - Try our structure first: `data-answer` attribute matching radio `value`
   - Fallback to original API: `feedback-for-choice-{N}` ID matching radio ID `choice-{N}`
   - Handle 0-based vs 1-based value conversion

2. **Button Detection:**
   - Support both button values: `"Check my answer"` and `"submit"`
   - Support both button names: `name="Submit"` and no name attribute

3. **Correct Answer Styling:**
   - Check `data-correct="true"` attribute (our structure)
   - Check `checked` attribute (original API structure)
   - Apply `--correct` or `--incorrect` classes to feedback items

4. **Container Support:**
   - Support both `<form>` and `<div>` containers
   - Both use the same CSS classes, so styling works for both

## Example: Feedback Lookup Logic

```javascript
function findFeedback(selectedInput, question) {
  const selectedValue = selectedInput.value;
  const selectedId = selectedInput.id;
  
  // Try our structure first (data-answer attribute, 0-based)
  const answerIndex = parseInt(selectedValue);
  const feedback = question.querySelector(`.knowledge-quiz-question__feedback[data-answer="${answerIndex}"]`);
  if (feedback) {
    return feedback.querySelector('.knowledge-quiz-question__feedback-item');
  }
  
  // Try original API structure (feedback-for-choice-X ID, 1-based)
  const choiceMatch = selectedId.match(/choice-(\d+)/);
  if (choiceMatch) {
    const choiceNum = choiceMatch[1];
    const feedbackId = `feedback-for-choice-${choiceNum}`;
    return question.querySelector(`#${feedbackId}`);
  }
  
  return null;
}
```

## Summary

The main differences are:
1. **Container**: `<form>` vs `<div>` (cosmetic)
2. **Radio names**: Generic `"answer"` vs unique `"quiz-question-X"` (cosmetic)
3. **Radio IDs**: `"choice-X"` vs `"quiz-question-X-answer-Y"` (cosmetic)
4. **Radio values**: 1-based vs 0-based (critical for feedback lookup)
5. **Button value**: `"submit"` vs `"Check my answer"` (cosmetic)
6. **Feedback structure**: Direct `<ul><li>` vs nested `<div><ul><li>` (critical for feedback lookup)
7. **Correct answer**: `checked` attribute vs `data-correct` attribute (critical for styling)

The renderer must be flexible enough to handle both structures seamlessly.

