/**
 * Parse a quiz directory containing question files
 */

import { readdirSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { parseQuestion } from './parse-question.js';

/**
 * Parse a quiz directory
 * @param {string} quizPath - Path to quiz directory (e.g., en/quiz1/)
 * @returns {Promise<Object>} Parsed quiz object with questions and HTML
 */
export async function parseQuiz(quizPath) {
  if (!existsSync(quizPath)) {
    return {
      questions: [],
      html: ''
    };
  }

  // Find all question files
  const files = readdirSync(quizPath)
    .filter(file => file.startsWith('question_') && file.endsWith('.md'))
    .sort((a, b) => {
      // Sort by question number
      const numA = parseInt(a.match(/question_(\d+)/)?.[1] || '0');
      const numB = parseInt(b.match(/question_(\d+)/)?.[1] || '0');
      return numA - numB;
    });

  const questions = [];

  // Parse each question file
  for (const file of files) {
    try {
      const filePath = join(quizPath, file);
      const markdown = readFileSync(filePath, 'utf-8');
      const question = await parseQuestion(markdown);
      questions.push(question);
    } catch (error) {
      console.warn(`Failed to parse question file ${file}:`, error.message);
      // Continue with other questions
    }
  }

  // Generate HTML for all questions
  const html = await generateQuizHtml(questions);

  return {
    questions,
    html
  };
}

/**
 * Generate HTML for quiz questions
 * Uses knowledge-quiz structure matching the reference site
 * @param {Array<Object>} questions - Array of parsed question objects
 * @returns {Promise<string>} HTML string
 */
async function generateQuizHtml(questions) {
  let html = '';

  for (let i = 0; i < questions.length; i++) {
    const question = questions[i];
    const questionId = `question-${i + 1}`;
    const questionName = `quiz-question-${i + 1}`;

    html += `<div class="knowledge-quiz knowledge-quiz-question" data-question="${i + 1}">\n`;
    html += '  <fieldset>\n';
    
    // Question legend
    if (question.legend) {
      html += `    <legend>${question.legend}</legend>\n`;
    }

    // Question text (blurb)
    html += '    <div class="knowledge-quiz-question__blurb">\n';
    html += `      ${question.html}\n`;
    html += '    </div>\n';

    // Answers container
    html += '    <div class="knowledge-quiz-question__answers">\n';
    
    for (let j = 0; j < question.choices.length; j++) {
      const choice = question.choices[j];
      const answerId = `${questionName}-answer-${j + 1}`;
      const feedbackId = `${questionName}-feedback-${j + 1}`;

      html += '      <div class="knowledge-quiz-question__answer">\n';
      html += `        <input type="radio" id="${answerId}" name="${questionName}" value="${j}" data-correct="${choice.correct}" />\n`;
      html += `        <label for="${answerId}">\n`;
      html += `          ${choice.text}\n`;
      html += '        </label>\n';
      html += '      </div>\n';
      
      // Feedback (initially hidden, shown when answer is selected)
      if (choice.feedback) {
        const feedbackHtml = await parseFeedback(choice.feedback);
        html += `      <div class="knowledge-quiz-question__feedback" id="${feedbackId}" data-answer="${j}">\n`;
        html += `        <ul class="knowledge-quiz-question__feedback-list">\n`;
        html += `          <li class="knowledge-quiz-question__feedback-item${choice.correct ? ' knowledge-quiz-question__feedback-item--correct' : ''}">\n`;
        html += `            ${feedbackHtml}\n`;
        html += `          </li>\n`;
        html += `        </ul>\n`;
        html += '      </div>\n';
      }
    }

    html += '    </div>\n';
    
    // Add "Check my answer" button
    html += '    <input type="button" value="Check my answer" data-question="' + (i + 1) + '" />\n';
    
    html += '  </fieldset>\n';
    html += '</div>\n';
  }

  return html;
}

/**
 * Parse feedback markdown to HTML
 * Simple implementation - could use parseTutorial for full markdown support
 * @param {string} feedbackText - Feedback markdown
 * @returns {string} HTML string
 */
async function parseFeedback(feedbackText) {
  // For now, use parseTutorial to convert markdown to HTML
  // This handles Scratch blocks, formatting, etc.
  const { parseTutorial } = await import('./parse-tutorial.js');
  return await parseTutorial(feedbackText);
}

