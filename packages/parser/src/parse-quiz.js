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
 * @param {Array<Object>} questions - Array of parsed question objects
 * @returns {Promise<string>} HTML string
 */
async function generateQuizHtml(questions) {
  let html = '<div class="c-project-quiz__content">\n';

  for (let i = 0; i < questions.length; i++) {
    const question = questions[i];
    const questionId = `quiz-question-${i + 1}`;

    html += `  <div class="c-project-quiz__question" data-question="${i + 1}">\n`;
    
    // Question legend
    if (question.legend) {
      html += `    <div class="c-project-quiz__legend">${question.legend}</div>\n`;
    }

    // Question text
    html += `    <div class="c-project-quiz__question-text">${question.html}</div>\n`;

    // Choices
    html += '    <div class="c-project-quiz__choices">\n';
    
    for (let j = 0; j < question.choices.length; j++) {
      const choice = question.choices[j];
      // Input IDs should be choice-1, choice-2, etc. (CSS expects this format)
      const inputId = `choice-${j + 1}`;

      html += `      <input type="radio" id="${inputId}" name="${questionId}" class="c-project-quiz__input" value="${j}" />\n`;
      html += `      <label for="${inputId}" class="c-project-quiz__label${choice.correct ? ' c-project-quiz__label--correct' : ''}">\n`;
      html += `        ${choice.text}\n`;
      html += `      </label>\n`;
      
      // Feedback
      if (choice.feedback) {
        const feedbackHtml = await parseFeedback(choice.feedback);
        html += `      <div class="c-project-quiz__thank-you-box" data-choice="${j}">\n`;
        html += `        ${feedbackHtml}\n`;
        html += `      </div>\n`;
      }
    }

    html += '    </div>\n';
    html += '  </div>\n';
  }

  html += '</div>\n';
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

