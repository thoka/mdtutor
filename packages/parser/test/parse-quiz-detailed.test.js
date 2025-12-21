/**
 * Detailed tests for parseQuiz function
 * Based on quiz-parsing-spec.md
 */

import { test } from 'node:test';
import assert from 'node:assert';
import { readFileSync, existsSync, mkdirSync, writeFileSync, rmdirSync, unlinkSync } from 'fs';
import { join } from 'path';
import { parseQuiz } from '../src/parse-quiz.js';
import { parse } from 'node-html-parser';

const TEST_DATA_DIR = join(process.cwd(), 'test', 'snapshots', 'silly-eyes', 'repo', 'en');
const TEMP_TEST_DIR = join(process.cwd(), 'test', 'temp-quiz-test');

test('parseQuiz - returns empty result for non-existent directory', async () => {
  const nonExistentPath = join(TEMP_TEST_DIR, 'non-existent-quiz');
  
  const result = await parseQuiz(nonExistentPath);
  
  assert.ok(result, 'Should return a result');
  assert.deepStrictEqual(result.questions, [], 'Questions should be empty array');
  assert.strictEqual(result.html, '', 'HTML should be empty string');
});

test('parseQuiz - loads all questions from quiz directory', async () => {
  const quizPath = join(TEST_DATA_DIR, 'quiz1');
  if (!existsSync(quizPath)) {
    console.log('Skipping test - quiz directory not found');
    return;
  }

  const result = await parseQuiz(quizPath);

  assert.ok(result, 'Result should exist');
  assert.ok(Array.isArray(result.questions), 'Should have questions array');
  assert.strictEqual(result.questions.length, 3, 'Should have 3 questions');
});

test('parseQuiz - questions are sorted numerically by filename', async () => {
  const quizPath = join(TEST_DATA_DIR, 'quiz1');
  if (!existsSync(quizPath)) {
    console.log('Skipping test - quiz directory not found');
    return;
  }

  const result = await parseQuiz(quizPath);

  result.questions.forEach((q, index) => {
    const expectedNumber = index + 1;
    assert.ok(q.legend.includes(`Question ${expectedNumber}`), 
      `Question at index ${index} should be Question ${expectedNumber}`);
  });
});

test('parseQuiz - handles question files out of order', async () => {
  // Create temporary quiz directory with out-of-order files
  const tempQuizPath = join(TEMP_TEST_DIR, 'out-of-order-quiz');
  mkdirSync(tempQuizPath, { recursive: true });
  
  try {
    // Create question files in reverse order
    writeFileSync(join(tempQuizPath, 'question_3.md'), `--- question ---
---
legend: Question 3 of 3
---
Question 3 text

--- choices ---
- (x) Answer 3
  --- feedback ---
  Feedback 3
  --- /feedback ---
--- /choices ---
--- /question ---`);

    writeFileSync(join(tempQuizPath, 'question_1.md'), `--- question ---
---
legend: Question 1 of 3
---
Question 1 text

--- choices ---
- (x) Answer 1
  --- feedback ---
  Feedback 1
  --- /feedback ---
--- /choices ---
--- /question ---`);

    writeFileSync(join(tempQuizPath, 'question_2.md'), `--- question ---
---
legend: Question 2 of 3
---
Question 2 text

--- choices ---
- (x) Answer 2
  --- feedback ---
  Feedback 2
  --- /feedback ---
--- /choices ---
--- /question ---`);

    const result = await parseQuiz(tempQuizPath);
    
    // Questions should be sorted by number, not file creation order
    assert.strictEqual(result.questions.length, 3, 'Should have 3 questions');
    assert.ok(result.questions[0].legend.includes('Question 1'), 'First question should be Question 1');
    assert.ok(result.questions[1].legend.includes('Question 2'), 'Second question should be Question 2');
    assert.ok(result.questions[2].legend.includes('Question 3'), 'Third question should be Question 3');
  } finally {
    // Cleanup
    try {
      unlinkSync(join(tempQuizPath, 'question_1.md'));
      unlinkSync(join(tempQuizPath, 'question_2.md'));
      unlinkSync(join(tempQuizPath, 'question_3.md'));
      rmdirSync(tempQuizPath);
    } catch (e) {
      // Ignore cleanup errors
    }
  }
});

test('parseQuiz - generates HTML with correct structure', async () => {
  const quizPath = join(TEST_DATA_DIR, 'quiz1');
  if (!existsSync(quizPath)) {
    console.log('Skipping test - quiz directory not found');
    return;
  }

  const result = await parseQuiz(quizPath);

  assert.ok(result.html, 'Should generate HTML content');
  assert.ok(typeof result.html === 'string', 'HTML should be a string');
  assert.ok(result.html.length > 0, 'HTML should not be empty');
  
  const parsed = parse(result.html);
  
  // Check for required CSS classes
  const questions = parsed.querySelectorAll('.knowledge-quiz-question');
  assert.strictEqual(questions.length, 3, 'Should have 3 question containers');
  
  questions.forEach((q, index) => {
    assert.ok(q.querySelector('fieldset'), `Question ${index + 1} should have fieldset`);
    assert.ok(q.querySelector('legend'), `Question ${index + 1} should have legend`);
    assert.ok(q.querySelector('.knowledge-quiz-question__blurb'), 
      `Question ${index + 1} should have blurb`);
    assert.ok(q.querySelector('.knowledge-quiz-question__answers'), 
      `Question ${index + 1} should have answers container`);
    assert.ok(q.querySelector('input[type="button"]'), 
      `Question ${index + 1} should have check button`);
  });
});

test('parseQuiz - HTML contains all question legends', async () => {
  const quizPath = join(TEST_DATA_DIR, 'quiz1');
  if (!existsSync(quizPath)) {
    console.log('Skipping test - quiz directory not found');
    return;
  }

  const result = await parseQuiz(quizPath);

  result.questions.forEach((q, index) => {
    assert.ok(result.html.includes(q.legend), 
      `HTML should contain legend for question ${index + 1}: "${q.legend}"`);
  });
});

test('parseQuiz - HTML contains correct answer structure', async () => {
  const quizPath = join(TEST_DATA_DIR, 'quiz1');
  if (!existsSync(quizPath)) {
    console.log('Skipping test - quiz directory not found');
    return;
  }

  const result = await parseQuiz(quizPath);
  const parsed = parse(result.html);
  
  const questions = parsed.querySelectorAll('.knowledge-quiz-question');
  
  questions.forEach((question, qIndex) => {
    const radioInputs = question.querySelectorAll('input[type="radio"]');
    assert.ok(radioInputs.length > 0, `Question ${qIndex + 1} should have radio inputs`);
    
    // Check that each radio has required attributes
    radioInputs.forEach((input, ansIndex) => {
      assert.ok(input.getAttribute('id'), 
        `Question ${qIndex + 1} answer ${ansIndex} should have id`);
      assert.ok(input.getAttribute('name'), 
        `Question ${qIndex + 1} answer ${ansIndex} should have name`);
      assert.ok(input.getAttribute('value') !== null, 
        `Question ${qIndex + 1} answer ${ansIndex} should have value`);
      assert.ok(input.getAttribute('data-correct') !== null, 
        `Question ${qIndex + 1} answer ${ansIndex} should have data-correct`);
    });
    
    // Check that at least one answer is marked as correct
    const correctAnswers = Array.from(radioInputs).filter(input => 
      input.getAttribute('data-correct') === 'true'
    );
    assert.ok(correctAnswers.length > 0, 
      `Question ${qIndex + 1} should have at least one correct answer`);
  });
});

test('parseQuiz - HTML contains feedback structure', async () => {
  const quizPath = join(TEST_DATA_DIR, 'quiz1');
  if (!existsSync(quizPath)) {
    console.log('Skipping test - quiz directory not found');
    return;
  }

  const result = await parseQuiz(quizPath);
  const parsed = parse(result.html);
  
  const questions = parsed.querySelectorAll('.knowledge-quiz-question');
  
  questions.forEach((question, qIndex) => {
    const feedbacks = question.querySelectorAll('.knowledge-quiz-question__feedback');
    const radioInputs = question.querySelectorAll('input[type="radio"]');
    
    // Should have feedback for each answer
    assert.strictEqual(feedbacks.length, radioInputs.length, 
      `Question ${qIndex + 1} should have feedback for each answer`);
    
    // Check feedback structure
    feedbacks.forEach((feedback, ansIndex) => {
      assert.ok(feedback.getAttribute('data-answer') !== null, 
        `Question ${qIndex + 1} feedback ${ansIndex} should have data-answer`);
      assert.ok(feedback.querySelector('.knowledge-quiz-question__feedback-list'), 
        `Question ${qIndex + 1} feedback ${ansIndex} should have feedback-list`);
      assert.ok(feedback.querySelector('.knowledge-quiz-question__feedback-item'), 
        `Question ${qIndex + 1} feedback ${ansIndex} should have feedback-item`);
    });
  });
});

test('parseQuiz - handles missing question files gracefully', async () => {
  const tempQuizPath = join(TEMP_TEST_DIR, 'missing-questions-quiz');
  mkdirSync(tempQuizPath, { recursive: true });
  
  try {
    // Create only question_1.md and question_3.md (missing question_2.md)
    writeFileSync(join(tempQuizPath, 'question_1.md'), `--- question ---
---
legend: Question 1 of 3
---
Question 1 text

--- choices ---
- (x) Answer 1
  --- feedback ---
  Feedback 1
  --- /feedback ---
--- /choices ---
--- /question ---`);

    writeFileSync(join(tempQuizPath, 'question_3.md'), `--- question ---
---
legend: Question 3 of 3
---
Question 3 text

--- choices ---
- (x) Answer 3
  --- feedback ---
  Feedback 3
  --- /feedback ---
--- /choices ---
--- /question ---`);

    const result = await parseQuiz(tempQuizPath);
    
    // Should parse available questions and skip missing ones
    assert.strictEqual(result.questions.length, 2, 'Should parse 2 available questions');
    assert.ok(result.questions[0].legend.includes('Question 1'), 'Should have Question 1');
    assert.ok(result.questions[1].legend.includes('Question 3'), 'Should have Question 3');
  } finally {
    // Cleanup
    try {
      unlinkSync(join(tempQuizPath, 'question_1.md'));
      unlinkSync(join(tempQuizPath, 'question_3.md'));
      rmdirSync(tempQuizPath);
    } catch (e) {
      // Ignore cleanup errors
    }
  }
});

test('parseQuiz - handles malformed question files gracefully', async () => {
  const tempQuizPath = join(TEMP_TEST_DIR, 'malformed-questions-quiz');
  mkdirSync(tempQuizPath, { recursive: true });
  
  try {
    // Create a valid question
    writeFileSync(join(tempQuizPath, 'question_1.md'), `--- question ---
---
legend: Question 1 of 2
---
Question 1 text

--- choices ---
- (x) Answer 1
  --- feedback ---
  Feedback 1
  --- /feedback ---
--- /choices ---
--- /question ---`);

    // Create a malformed question (missing choices block)
    writeFileSync(join(tempQuizPath, 'question_2.md'), `--- question ---
---
legend: Question 2 of 2
---
Question 2 text without choices
--- /question ---`);

    const result = await parseQuiz(tempQuizPath);
    
    // Should parse valid question and skip malformed one
    assert.strictEqual(result.questions.length, 1, 'Should parse 1 valid question');
    assert.ok(result.questions[0].legend.includes('Question 1'), 'Should have Question 1');
  } finally {
    // Cleanup
    try {
      unlinkSync(join(tempQuizPath, 'question_1.md'));
      unlinkSync(join(tempQuizPath, 'question_2.md'));
      rmdirSync(tempQuizPath);
    } catch (e) {
      // Ignore cleanup errors
    }
  }
});

test('parseQuiz - check button has correct value', async () => {
  const quizPath = join(TEST_DATA_DIR, 'quiz1');
  if (!existsSync(quizPath)) {
    console.log('Skipping test - quiz directory not found');
    return;
  }

  const result = await parseQuiz(quizPath);
  const parsed = parse(result.html);
  
  const checkButtons = parsed.querySelectorAll('input[type="button"]');
  assert.strictEqual(checkButtons.length, 3, 'Should have 3 check buttons');
  
  checkButtons.forEach((button, index) => {
    assert.strictEqual(button.getAttribute('value'), 'Check my answer', 
      `Button ${index + 1} should have correct value`);
    assert.ok(button.getAttribute('data-question'), 
      `Button ${index + 1} should have data-question attribute`);
  });
});

test('parseQuiz - HTML uses knowledge-quiz class', async () => {
  const quizPath = join(TEST_DATA_DIR, 'quiz1');
  if (!existsSync(quizPath)) {
    console.log('Skipping test - quiz directory not found');
    return;
  }

  const result = await parseQuiz(quizPath);
  
  assert.ok(result.html.includes('knowledge-quiz'), 
    'HTML should contain knowledge-quiz class');
  assert.ok(result.html.includes('knowledge-quiz-question'), 
    'HTML should contain knowledge-quiz-question class');
});

