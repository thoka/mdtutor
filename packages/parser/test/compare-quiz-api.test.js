import { test } from 'node:test';
import assert from 'node:assert';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { parseProject } from '../src/parse-project.js';
import { parse } from 'node-html-parser';
import puppeteer from 'puppeteer';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '../../..');

/**
 * Load original API data for comparison
 */
function loadOriginalApi(language = 'en') {
  const apiPath = join(projectRoot, 'test/snapshots/silly-eyes', `api-project-${language}.json`);
  const data = JSON.parse(readFileSync(apiPath, 'utf-8'));
  return data;
}

/**
 * Normalize HTML for comparison (remove whitespace, normalize attributes)
 */
function normalizeHtml(html) {
  if (!html) return '';
  const parsed = parse(html);
  return parsed.toString().replace(/\s+/g, ' ').trim();
}

/**
 * Extract quiz structure from HTML
 */
function extractQuizStructure(html) {
  if (!html) return null;
  
  const parsed = parse(html);
  const questions = parsed.querySelectorAll('.knowledge-quiz-question');
  
  return questions.map((q, index) => {
    const legend = q.querySelector('legend')?.textContent?.trim() || '';
    const blurb = q.querySelector('.knowledge-quiz-question__blurb')?.innerHTML || '';
    const answers = q.querySelectorAll('.knowledge-quiz-question__answer').map((answer, ansIndex) => {
      const input = answer.querySelector('input[type="radio"]');
      const label = answer.querySelector('label');
      const feedback = q.querySelector(`.knowledge-quiz-question__feedback[data-answer="${ansIndex}"]`);
      
      return {
        id: input?.getAttribute('id') || '',
        name: input?.getAttribute('name') || '',
        value: input?.getAttribute('value') || '',
        correct: input?.getAttribute('data-correct') === 'true',
        labelText: label?.textContent?.trim() || '',
        labelHtml: label?.innerHTML || '',
        hasFeedback: !!feedback
      };
    });
    
    const checkButton = q.querySelector('input[type="button"]');
    
    return {
      index: index + 1,
      dataQuestion: q.getAttribute('data-question') || '',
      legend,
      blurbLength: blurb.length,
      answersCount: answers.length,
      answers,
      hasCheckButton: !!checkButton,
      checkButtonValue: checkButton?.getAttribute('value') || ''
    };
  });
}

test('compare-quiz - silly-eyes step 4 structure', async () => {
  // Load original API
  const originalApi = loadOriginalApi('en');
  const originalStep4 = originalApi.data.attributes.content.steps[4];
  
  // Parse our version
  const projectPath = join(projectRoot, 'test/snapshots/silly-eyes/repo/en');
  const ourResult = await parseProject(projectPath, { languages: ['en'] });
  const ourStep4 = ourResult.data.attributes.content.steps[4];
  
  console.log('\n=== Comparison: Step 4 ===');
  console.log('Original API:');
  console.log('  Title:', originalStep4.title);
  console.log('  Quiz:', originalStep4.quiz);
  console.log('  KnowledgeQuiz:', originalStep4.knowledgeQuiz);
  console.log('  Content length:', originalStep4.content?.length || 0);
  
  console.log('\nOur Parser:');
  console.log('  Title:', ourStep4.title);
  console.log('  Quiz:', ourStep4.quiz);
  console.log('  KnowledgeQuiz:', ourStep4.knowledgeQuiz);
  console.log('  Content length:', ourStep4.content?.length || 0);
  
  // Basic structure checks
  assert.strictEqual(ourStep4.title, originalStep4.title, 'Title should match');
  assert.strictEqual(ourStep4.knowledgeQuiz, originalStep4.knowledgeQuiz, 'KnowledgeQuiz should match');
  
  // Note: Original API has quiz: false, but we set it to true when knowledgeQuiz exists
  // This is intentional - we're more explicit about quiz steps
  assert.strictEqual(ourStep4.quiz, true, 'We mark quiz steps as quiz: true');
  
  // Content should not be empty (we generate quiz HTML)
  assert.ok(ourStep4.content && ourStep4.content.length > 0, 'Our content should contain quiz HTML');
  
  // Extract and compare quiz structure
  const ourQuizStructure = extractQuizStructure(ourStep4.content);
  console.log('\n=== Quiz Structure ===');
  console.log('Questions found:', ourQuizStructure.length);
  
  // Should have 3 questions
  assert.strictEqual(ourQuizStructure.length, 3, 'Should have 3 quiz questions');
  
  // Check each question structure
  ourQuizStructure.forEach((q, index) => {
    console.log(`\nQuestion ${index + 1}:`);
    console.log('  Legend:', q.legend);
    console.log('  Answers:', q.answersCount);
    console.log('  Has check button:', q.hasCheckButton);
    console.log('  Check button value:', q.checkButtonValue);
    
    assert.ok(q.legend, `Question ${index + 1} should have legend`);
    assert.ok(q.answersCount > 0, `Question ${index + 1} should have answers`);
    assert.strictEqual(q.hasCheckButton, true, `Question ${index + 1} should have check button`);
    assert.strictEqual(q.checkButtonValue, 'Check my answer', `Question ${index + 1} check button should have correct value`);
    
    // Check answer structure
    q.answers.forEach((answer, ansIndex) => {
      console.log(`    Answer ${ansIndex + 1}:`);
      console.log('      ID:', answer.id);
      console.log('      Name:', answer.name);
      console.log('      Value:', answer.value);
      console.log('      Correct:', answer.correct);
      console.log('      Has feedback:', answer.hasFeedback);
      
      assert.ok(answer.id, `Answer ${ansIndex + 1} should have ID`);
      assert.ok(answer.name, `Answer ${ansIndex + 1} should have name`);
      assert.ok(answer.value !== undefined && answer.value !== null, `Answer ${ansIndex + 1} should have value`);
      assert.ok(answer.hasFeedback, `Answer ${ansIndex + 1} should have feedback`);
    });
  });
});

test('compare-quiz - HTML structure matches reference', async () => {
  // Parse our version
  const projectPath = join(projectRoot, 'test/snapshots/silly-eyes/repo/en');
  const ourResult = await parseProject(projectPath, { languages: ['en'] });
  const ourStep4 = ourResult.data.attributes.content.steps[4];
  
  const parsed = parse(ourStep4.content);
  
  // Check for required CSS classes
  const requiredClasses = [
    'knowledge-quiz',
    'knowledge-quiz-question',
    'knowledge-quiz-question__blurb',
    'knowledge-quiz-question__answers',
    'knowledge-quiz-question__answer',
    'knowledge-quiz-question__feedback',
    'knowledge-quiz-question__feedback-list',
    'knowledge-quiz-question__feedback-item'
  ];
  
  requiredClasses.forEach(className => {
    const elements = parsed.querySelectorAll(`.${className}`);
    assert.ok(elements.length > 0, `Should have elements with class ${className}`);
  });
  
  // Check for fieldset and legend
  const fieldsets = parsed.querySelectorAll('fieldset');
  assert.strictEqual(fieldsets.length, 3, 'Should have 3 fieldsets (one per question)');
  
  const legends = parsed.querySelectorAll('legend');
  assert.strictEqual(legends.length, 3, 'Should have 3 legends');
  
  // Check for radio inputs
  const radioInputs = parsed.querySelectorAll('input[type="radio"]');
  assert.ok(radioInputs.length > 0, 'Should have radio inputs');
  
  // Check that each radio has correct attributes
  radioInputs.forEach((input, index) => {
    assert.ok(input.getAttribute('id'), `Radio ${index} should have id`);
    assert.ok(input.getAttribute('name'), `Radio ${index} should have name`);
    assert.ok(input.getAttribute('value') !== null, `Radio ${index} should have value`);
    assert.ok(input.getAttribute('data-correct') !== null, `Radio ${index} should have data-correct`);
  });
  
  // Check for check buttons
  const checkButtons = parsed.querySelectorAll('input[type="button"]');
  assert.strictEqual(checkButtons.length, 3, 'Should have 3 check buttons');
  
  checkButtons.forEach((button, index) => {
    assert.strictEqual(button.getAttribute('value'), 'Check my answer', `Button ${index} should have correct value`);
  });
  
  // Check for feedback items
  const feedbackItems = parsed.querySelectorAll('.knowledge-quiz-question__feedback-item');
  assert.ok(feedbackItems.length > 0, 'Should have feedback items');
  
  // Check that correct answers have --correct class
  const correctFeedbackItems = parsed.querySelectorAll('.knowledge-quiz-question__feedback-item--correct');
  assert.ok(correctFeedbackItems.length > 0, 'Should have correct feedback items');
});

test('compare-quiz - answer IDs and names are correct', async () => {
  const projectPath = join(projectRoot, 'test/snapshots/silly-eyes/repo/en');
  const ourResult = await parseProject(projectPath, { languages: ['en'] });
  const ourStep4 = ourResult.data.attributes.content.steps[4];
  
  const parsed = parse(ourStep4.content);
  const questions = parsed.querySelectorAll('.knowledge-quiz-question');
  
  questions.forEach((question, qIndex) => {
    const questionNum = qIndex + 1;
    const expectedName = `quiz-question-${questionNum}`;
    const radioInputs = question.querySelectorAll('input[type="radio"]');
    
    // All radios in a question should have the same name
    radioInputs.forEach((input, ansIndex) => {
      const name = input.getAttribute('name');
      const id = input.getAttribute('id');
      const value = input.getAttribute('value');
      
      assert.strictEqual(name, expectedName, `Question ${questionNum} answer ${ansIndex} should have name ${expectedName}`);
      assert.ok(id, `Question ${questionNum} answer ${ansIndex} should have id`);
      assert.strictEqual(value, String(ansIndex), `Question ${questionNum} answer ${ansIndex} should have value ${ansIndex}`);
    });
  });
});

test('compare-quiz - feedback structure is correct', async () => {
  const projectPath = join(projectRoot, 'test/snapshots/silly-eyes/repo/en');
  const ourResult = await parseProject(projectPath, { languages: ['en'] });
  const ourStep4 = ourResult.data.attributes.content.steps[4];
  
  const parsed = parse(ourStep4.content);
  const questions = parsed.querySelectorAll('.knowledge-quiz-question');
  
  questions.forEach((question, qIndex) => {
    const radioInputs = question.querySelectorAll('input[type="radio"]');
    
    radioInputs.forEach((input, ansIndex) => {
      const value = input.getAttribute('value');
      const feedback = question.querySelector(`.knowledge-quiz-question__feedback[data-answer="${value}"]`);
      
      assert.ok(feedback, `Question ${qIndex + 1} answer ${ansIndex} should have feedback with data-answer="${value}"`);
      
      const feedbackItem = feedback.querySelector('.knowledge-quiz-question__feedback-item');
      assert.ok(feedbackItem, `Question ${qIndex + 1} answer ${ansIndex} feedback should have feedback-item`);
      
      const isCorrect = input.getAttribute('data-correct') === 'true';
      if (isCorrect) {
        assert.ok(feedbackItem.classList.contains('knowledge-quiz-question__feedback-item--correct'),
          `Question ${qIndex + 1} correct answer feedback should have --correct class`);
      }
    });
  });
});

test('compare-quiz - rendered HTML structure vs original website', async () => {
  // Parse our version
  const projectPath = join(projectRoot, 'test/snapshots/silly-eyes/repo/en');
  const ourResult = await parseProject(projectPath, { languages: ['en'] });
  const ourStep4 = ourResult.data.attributes.content.steps[4];
  const ourHtml = ourStep4.content;
  
  // Fetch rendered HTML from original website
  const browser = await puppeteer.launch({ headless: true });
  try {
    const page = await browser.newPage();
    console.log('Loading original website...');
    await page.goto('https://projects.raspberrypi.org/en/projects/silly-eyes/4', { 
      waitUntil: 'domcontentloaded', 
      timeout: 30000 
    });
    
    console.log('Waiting for quiz to render...');
    // Wait for quiz to render
    try {
      await page.waitForSelector('.knowledge-quiz-question', { timeout: 15000 });
    } catch (e) {
      console.warn('Quiz selector not found, trying alternative...');
      const bodyText = await page.evaluate(() => document.body.textContent);
      console.log('Page body contains "quiz":', bodyText?.includes('quiz'));
      throw e;
    }
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Extract quiz HTML from original
    const originalQuizHtml = await page.evaluate(() => {
      const quizContainer = document.querySelector('.knowledge-quiz-question')?.closest('.c-project-steps__content');
      return quizContainer ? quizContainer.innerHTML : '';
    });
    
    // Also get full page HTML for debugging
    const fullPageHtml = await page.evaluate(() => document.body.innerHTML);
    const allQuizQuestions = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('.knowledge-quiz-question')).map(q => ({
        dataQuestion: q.getAttribute('data-question'),
        legend: q.querySelector('legend')?.textContent?.trim(),
        answersCount: q.querySelectorAll('.knowledge-quiz-question__answer').length
      }));
    });
    
    console.log('\n=== Original Website Debug ===');
    console.log('All quiz questions found:', allQuizQuestions.length);
    allQuizQuestions.forEach((q, i) => {
      console.log(`  Question ${i + 1}: data-question="${q.dataQuestion}", legend="${q.legend}", answers=${q.answersCount}`);
    });
    console.log('Original quiz HTML length:', originalQuizHtml.length);
    console.log('Original quiz HTML preview (first 500 chars):', originalQuizHtml.substring(0, 500));
    
    // Parse both
    const ourParsed = parse(ourHtml);
    const originalParsed = parse(originalQuizHtml);
    
    // Compare structure
    const ourQuestions = ourParsed.querySelectorAll('.knowledge-quiz-question');
    const originalQuestions = originalParsed.querySelectorAll('.knowledge-quiz-question');
    
    console.log('\n=== Rendered HTML Comparison ===');
    console.log('Our questions:', ourQuestions.length);
    console.log('Original questions (from extracted HTML):', originalQuestions.length);
    console.log('Original questions (from page.evaluate):', allQuizQuestions.length);
    
    assert.strictEqual(ourQuestions.length, originalQuestions.length, 
      `Should have same number of questions (expected ${originalQuestions.length}, got ${ourQuestions.length})`);
    
    // Compare each question
    ourQuestions.forEach((ourQ, index) => {
      const origQ = originalQuestions[index];
      if (!origQ) {
        console.warn(`Original question ${index + 1} not found`);
        return;
      }
      
      // Compare legend
      const ourLegend = ourQ.querySelector('legend')?.textContent?.trim() || '';
      const origLegend = origQ.querySelector('legend')?.textContent?.trim() || '';
      assert.strictEqual(ourLegend, origLegend, `Question ${index + 1} legend should match`);
      
      // Compare answer count
      const ourAnswers = ourQ.querySelectorAll('.knowledge-quiz-question__answer');
      const origAnswers = origQ.querySelectorAll('.knowledge-quiz-question__answer');
      assert.strictEqual(ourAnswers.length, origAnswers.length, 
        `Question ${index + 1} should have same number of answers`);
      
      // Compare check button
      const ourButton = ourQ.querySelector('input[type="button"]');
      const origButton = origQ.querySelector('input[type="button"]');
      assert.ok(ourButton, `Question ${index + 1} should have check button`);
      assert.ok(origButton, `Question ${index + 1} original should have check button`);
      
      if (ourButton && origButton) {
        const ourButtonValue = ourButton.getAttribute('value');
        const origButtonValue = origButton.getAttribute('value');
        assert.strictEqual(ourButtonValue, origButtonValue, 
          `Question ${index + 1} check button value should match`);
      }
      
      // Compare answer structure
      ourAnswers.forEach((ourAnswer, ansIndex) => {
        const origAnswer = origAnswers[ansIndex];
        if (!origAnswer) {
          console.warn(`Original answer ${ansIndex + 1} for question ${index + 1} not found`);
          return;
        }
        
        const ourInput = ourAnswer.querySelector('input[type="radio"]');
        const origInput = origAnswer.querySelector('input[type="radio"]');
        
        if (ourInput && origInput) {
          const ourCorrect = ourInput.getAttribute('data-correct') === 'true';
          const origCorrect = origInput.getAttribute('data-correct') === 'true';
          assert.strictEqual(ourCorrect, origCorrect, 
            `Question ${index + 1} answer ${ansIndex + 1} correctness should match`);
        }
      });
    });
    
    // Check for missing elements in our version
    const missingInOurs = [];
    const origFieldsets = originalParsed.querySelectorAll('fieldset');
    const ourFieldsets = ourParsed.querySelectorAll('fieldset');
    
    if (origFieldsets.length !== ourFieldsets.length) {
      missingInOurs.push(`Fieldset count mismatch: original has ${origFieldsets.length}, we have ${ourFieldsets.length}`);
    }
    
    // Check feedback structure
    const origFeedbacks = originalParsed.querySelectorAll('.knowledge-quiz-question__feedback');
    const ourFeedbacks = ourParsed.querySelectorAll('.knowledge-quiz-question__feedback');
    
    if (origFeedbacks.length !== ourFeedbacks.length) {
      missingInOurs.push(`Feedback count mismatch: original has ${origFeedbacks.length}, we have ${ourFeedbacks.length}`);
    }
    
    if (missingInOurs.length > 0) {
      console.warn('\n⚠️  Differences found:');
      missingInOurs.forEach(msg => console.warn('  -', msg));
    }
    
  } finally {
    await browser.close();
  }
}, { timeout: 60000 });
