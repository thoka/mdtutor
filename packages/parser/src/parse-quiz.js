/**
 * Parse a quiz directory containing question files
 */

import { readdirSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { parseQuestion } from './parse-question.js';

/**
 * Parse a quiz directory
 * @param {string} quizPath - Path to quiz directory (e.g., en/quiz1/)
 * @param {Object} options - Parser options
 * @param {string} options.basePath - Base path for transclusion resolution
 * @param {Map} options.transclusionCache - Cache for transclusion content
 * @param {string[]} options.languages - Preferred languages for transclusions
 * @returns {Promise<Object>} Parsed quiz object with questions and HTML
 */
export async function parseQuiz(quizPath, options = {}) {
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
            const question = await parseQuestion(markdown, options);
            questions.push(question);
          } catch (error) {
            console.warn(`Failed to parse question file ${file}:`, error.message);
            // Continue with other questions
          }
        }

        // Generate HTML for all questions
        const html = await generateQuizHtml(questions, options);

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
async function generateQuizHtml(questions, options = {}) {
  let html = '';

  for (let i = 0; i < questions.length; i++) {
    const question = questions[i];

    // Use <form> container like original API
    html += `<form class="knowledge-quiz-question">\n`;
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
      // Use 1-based IDs and values like original API
      const choiceNum = j + 1;
      const answerId = `choice-${choiceNum}`;
      // No checked attribute - user must select an answer
      // Add data-correct attribute to identify correct answers for the renderer

      html += '    <div class="knowledge-quiz-question__answer">\n';
      // Use generic "answer" name and 1-based value
      // Set checked attribute for API compatibility (original API uses checked)
      // Also add data-correct attribute for renderer (renderer should ignore checked)
      const checkedAttr = choice.correct ? ' checked' : '';
      html += `      <input type="radio" name="answer" value="${choiceNum}" id="${answerId}" data-correct="${choice.correct}"${checkedAttr} />\n`;
      html += `      <label for="${answerId}">\n`;
      // Parse choice text (markdown) to HTML
      const choiceHtml = await parseFeedback(choice.text, options);
      html += `        ${choiceHtml}\n`;
      html += '      </label>\n';
      html += '    </div>\n';
    }

    html += '    </div>\n';
    html += '  </fieldset>\n';
    
    // Feedback structure: direct <ul> with <li> items, like original API
    html += '  <ul class="knowledge-quiz-question__feedback">\n';
    
    for (let j = 0; j < question.choices.length; j++) {
      const choice = question.choices[j];
      if (choice.feedback) {
        const choiceNum = j + 1;
        const feedbackId = `feedback-for-choice-${choiceNum}`;
        const feedbackHtml = await parseFeedback(choice.feedback, options);
        
        html += `  <li class="knowledge-quiz-question__feedback-item" id="${feedbackId}">\n`;
        html += `    ${feedbackHtml}\n`;
        html += '  </li>\n';
      }
    }
    
    html += '  </ul>\n';
    
    // Add submit button for each question (like original API)
    html += '  <input type="button" name="Submit" value="submit" />\n';
    
    html += '</form>\n\n';
  }

  return html;
}

/**
 * Parse feedback markdown to HTML
 * Simple implementation - could use parseTutorial for full markdown support
 * @param {string} feedbackText - Feedback markdown
 * @returns {string} HTML string
 */
async function parseFeedback(feedbackText, options = {}) {
  // Use parseTutorial to convert markdown to HTML
  // This handles Scratch blocks, formatting, images, etc.
  const { parseTutorial } = await import('./parse-tutorial.js');
  return await parseTutorial(feedbackText, {
    basePath: options.basePath,
    transclusionCache: options.transclusionCache,
    languages: options.languages
  });
}

