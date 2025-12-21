/**
 * Parse a single quiz question from markdown
 */

import { parseTutorial } from './parse-tutorial.js';

/**
 * Parse a question markdown file
 * @param {string} markdown - Question markdown content
 * @returns {Promise<Object>} Parsed question object
 */
export async function parseQuestion(markdown) {
  // Extract question block
  const questionMatch = markdown.match(/--- question ---\s*(.*?)\s*--- \/question ---/s);
  if (!questionMatch) {
    throw new Error('Question block not found');
  }

  const questionContent = questionMatch[1];

  // Extract frontmatter (between --- markers at start)
  const frontmatterMatch = questionContent.match(/^---\s*\n(.*?)\n---\s*\n(.*)$/s);
  let frontmatter = {};
  let questionBody = questionContent;

  if (frontmatterMatch) {
    const frontmatterText = frontmatterMatch[1];
    // Simple YAML parsing for legend field
    const legendMatch = frontmatterText.match(/legend:\s*(.+)/);
    if (legendMatch) {
      frontmatter.legend = legendMatch[1].trim();
    }
    questionBody = frontmatterMatch[2];
  }

  // Extract choices block
  const choicesMatch = questionBody.match(/--- choices ---\s*(.*?)\s*--- \/choices ---/s);
  if (!choicesMatch) {
    throw new Error('Choices block not found');
  }

  const choicesText = choicesMatch[1];
  const questionText = questionBody.substring(0, questionBody.indexOf('--- choices ---')).trim();

  // Parse question text to HTML
  const questionHtml = await parseTutorial(questionText);

  // Parse choices
  const choices = parseChoices(choicesText);

  return {
    legend: frontmatter.legend || '',
    text: questionText,
    html: questionHtml,
    choices
  };
}

/**
 * Parse choices from markdown
 * @param {string} choicesText - Choices markdown content
 * @returns {Array<Object>} Array of choice objects
 */
function parseChoices(choicesText) {
  const choices = [];
  
  // Split by list items (lines starting with -)
  const choiceBlocks = choicesText.split(/^- \(/m).filter(block => block.trim());
  
  for (const block of choiceBlocks) {
    // Determine if correct (x) or incorrect ( )
    const isCorrect = block.startsWith('x)');
    const isIncorrect = block.startsWith(' )');
    
    if (!isCorrect && !isIncorrect) {
      continue; // Skip malformed choices
    }

    // Extract choice text (everything before feedback block)
    const feedbackMatch = block.match(/--- feedback ---\s*(.*?)\s*--- \/feedback ---/s);
    let choiceText = block;
    let feedbackText = '';

    if (feedbackMatch) {
      choiceText = block.substring(0, block.indexOf('--- feedback ---')).trim();
      feedbackText = feedbackMatch[1].trim();
    } else {
      // Try to find feedback block (might be after some content)
      const feedbackIndex = block.indexOf('--- feedback ---');
      if (feedbackIndex > 0) {
        choiceText = block.substring(0, feedbackIndex).trim();
        const remaining = block.substring(feedbackIndex);
        const remainingMatch = remaining.match(/--- feedback ---\s*(.*?)\s*--- \/feedback ---/s);
        if (remainingMatch) {
          feedbackText = remainingMatch[1].trim();
        }
      }
    }

    // Remove the marker (x) or ( ) from start
    choiceText = choiceText.replace(/^[x ]\)\s*/, '').trim();

    choices.push({
      correct: isCorrect,
      text: choiceText,
      feedback: feedbackText
    });
  }

  return choices;
}

