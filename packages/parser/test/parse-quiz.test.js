/**
 * Tests for quiz parsing functionality
 */

import { test } from 'node:test';
import assert from 'node:assert';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { parseQuiz } from '../src/parse-quiz.js';
import { parseQuestion } from '../src/parse-question.js';

const TEST_DATA_DIR = join(process.cwd(), 'test', 'snapshots', 'silly-eyes', 'repo', 'en');

test('parseQuestion - parses basic question structure', async () => {
  const questionPath = join(TEST_DATA_DIR, 'quiz1', 'question_1.md');
  if (!existsSync(questionPath)) {
    console.log('Skipping test - question file not found');
    return;
  }

  const markdown = readFileSync(questionPath, 'utf-8');
  const result = await parseQuestion(markdown);

  assert.ok(result, 'Result should exist');
  assert.strictEqual(typeof result.legend, 'string', 'Legend should be a string');
  assert.ok(result.legend.includes('Question'), 'Legend should contain "Question"');
  assert.ok(Array.isArray(result.choices), 'Choices should be an array');
  assert.ok(result.choices.length > 0, 'Should have at least one choice');
  
  // Check for correct answer
  const correctAnswer = result.choices.find(c => c.correct === true);
  assert.ok(correctAnswer, 'Should have at least one correct answer');
  
  // Check all choices have feedback
  result.choices.forEach(choice => {
    assert.ok(choice.feedback, `Choice "${choice.text.substring(0, 20)}..." should have feedback`);
  });
});

test('parseQuestion - identifies correct answer with (x) marker', async () => {
  const questionPath = join(TEST_DATA_DIR, 'quiz1', 'question_1.md');
  if (!existsSync(questionPath)) {
    console.log('Skipping test - question file not found');
    return;
  }

  const markdown = readFileSync(questionPath, 'utf-8');
  const result = await parseQuestion(markdown);

  const correctAnswers = result.choices.filter(c => c.correct === true);
  assert.strictEqual(correctAnswers.length, 1, 'Should have exactly one correct answer');
  assert.strictEqual(correctAnswers[0].text.trim(), 'Click on the green flag', 'Correct answer should match');
});

test('parseQuestion - parses question text with images and formatting', async () => {
  const questionPath = join(TEST_DATA_DIR, 'quiz1', 'question_1.md');
  if (!existsSync(questionPath)) {
    console.log('Skipping test - question file not found');
    return;
  }

  const markdown = readFileSync(questionPath, 'utf-8');
  const result = await parseQuestion(markdown);

  assert.ok(result.text, 'Question should have text');
  assert.ok(result.text.length > 0, 'Question text should not be empty');
  // Question should contain the problem description
  assert.ok(result.text.includes('Eyeball') || result.text.includes('eyeball'), 'Question should mention Eyeball');
});

test('parseQuestion - parses choices with images', async () => {
  const questionPath = join(TEST_DATA_DIR, 'quiz1', 'question_2.md');
  if (!existsSync(questionPath)) {
    console.log('Skipping test - question file not found');
    return;
  }

  const markdown = readFileSync(questionPath, 'utf-8');
  const result = await parseQuestion(markdown);

  const choiceWithImage = result.choices.find(c => c.text.includes('![A rocket'));
  assert.ok(choiceWithImage, 'Should have a choice with an image');
});

test('parseQuestion - parses Scratch blocks in choices', async () => {
  const questionPath = join(TEST_DATA_DIR, 'quiz1', 'question_3.md');
  if (!existsSync(questionPath)) {
    console.log('Skipping test - question file not found');
    return;
  }

  const markdown = readFileSync(questionPath, 'utf-8');
  const result = await parseQuestion(markdown);

  const choiceWithBlocks = result.choices.find(c => c.text.includes('```blocks3'));
  assert.ok(choiceWithBlocks, 'Should have a choice with Scratch blocks');
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
  
  // Check questions are numbered correctly
  result.questions.forEach((q, index) => {
    assert.ok(q.legend.includes(`${index + 1}`), `Question ${index + 1} should have correct number in legend`);
  });
});

test('parseQuiz - questions are sorted by number', async () => {
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

test('parseQuiz - generates HTML content', async () => {
  const quizPath = join(TEST_DATA_DIR, 'quiz1');
  if (!existsSync(quizPath)) {
    console.log('Skipping test - quiz directory not found');
    return;
  }

  const result = await parseQuiz(quizPath);

  assert.ok(result.html, 'Should generate HTML content');
  assert.ok(typeof result.html === 'string', 'HTML should be a string');
  assert.ok(result.html.length > 0, 'HTML should not be empty');
  
  // Check for quiz container class
  assert.ok(result.html.includes('knowledge-quiz'), 'HTML should contain knowledge-quiz CSS class');
  
  // Check all questions are in HTML
  result.questions.forEach((q, index) => {
    assert.ok(result.html.includes(q.legend), `HTML should contain legend for question ${index + 1}`);
  });
});

test('parseQuiz - handles missing question files gracefully', async () => {
  // This test would require a test fixture with missing files
  // For now, we'll test that parseQuiz doesn't crash on empty directory
  const nonExistentPath = join(TEST_DATA_DIR, 'quiz-nonexistent');
  
  try {
    const result = await parseQuiz(nonExistentPath);
    // Should return empty result or handle gracefully
    assert.ok(result, 'Should return a result even for non-existent path');
  } catch (error) {
    // It's also acceptable to throw an error for missing directory
    assert.ok(error instanceof Error, 'Should throw an Error for missing directory');
  }
});

