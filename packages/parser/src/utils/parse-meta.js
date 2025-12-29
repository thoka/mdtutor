/**
 * Parse meta.yml file and map to API structure
 */

import { readFileSync } from 'fs';
import yaml from 'js-yaml';

/**
 * Preprocess YAML content to handle duplicate keys
 * When duplicate completion: keys are found, the last one overwrites the first
 * (matching standard YAML behavior and the API's interpretation).
 * This handles cases where the same key appears multiple times in a step,
 * which is invalid YAML but can occur in source files.
 * @param {string} content - Raw YAML content
 * @returns {string} Preprocessed YAML content
 */
function preprocessYaml(content) {
  const lines = content.split('\n');
  const processed = [];
  let stepIndent = 0;
  let firstCompletionStart = -1;
  let inFirstCompletionBlock = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    const indent = line.match(/^(\s*)/)?.[1].length || 0;
    
    // Detect start of a new step (starts with "- title:")
    if (trimmed.startsWith('- title:')) {
      stepIndent = indent;
      firstCompletionStart = -1;
      inFirstCompletionBlock = false;
      processed.push(line);
      continue;
    }
    
    // Detect completion key within a step
    if (trimmed === 'completion:' && indent === stepIndent + 2) {
      if (firstCompletionStart >= 0) {
        // Duplicate completion key found - remove the first one
        // Find the end of the first completion block by looking backwards
        let firstCompletionEnd = processed.length;
        for (let j = processed.length - 1; j >= firstCompletionStart; j--) {
          const prevLine = processed[j];
          const prevTrimmed = prevLine.trim();
          const prevIndent = prevLine.match(/^(\s*)/)?.[1].length || 0;
          // Stop at the completion: line or when we find a line with same/less indent as completion
          if (prevTrimmed === 'completion:' || (prevIndent <= stepIndent + 2 && j > firstCompletionStart)) {
            firstCompletionEnd = j + 1;
            break;
          }
        }
        // Remove the first completion block
        processed.splice(firstCompletionStart, firstCompletionEnd - firstCompletionStart);
        // Start tracking the new completion block
        firstCompletionStart = processed.length;
        inFirstCompletionBlock = true;
        processed.push(line);
        continue;
      } else {
        // First completion key in this step
        firstCompletionStart = processed.length;
        inFirstCompletionBlock = true;
        processed.push(line);
        continue;
      }
    }
    
    // Track completion block items
    if (inFirstCompletionBlock && firstCompletionStart >= 0) {
      // Check if we're still in the completion block (indent > completion key indent)
      if (indent > stepIndent + 2 && trimmed.startsWith('- ')) {
        // This is a list item in the completion block
        processed.push(line);
        continue;
      } else if (indent <= stepIndent + 2 && trimmed !== '') {
        // We've left the completion block (non-empty line with same/less indent)
        inFirstCompletionBlock = false;
      }
    }
    
    processed.push(line);
  }
  
  return processed.join('\n');
}

/**
 * Parse meta.yml file
 * @param {string} filePath - Path to meta.yml
 * @returns {Object} Parsed metadata matching API structure
 */
export function parseMeta(filePath) {
  const content = readFileSync(filePath, 'utf-8');
  
  // Preprocess to handle duplicate keys
  const preprocessed = preprocessYaml(content);
  
  let data;
  try {
    data = yaml.load(preprocessed);
  } catch (error) {
    // If preprocessing didn't work, try original with error handling
    console.warn(`YAML parsing error in ${filePath}, attempting fallback:`, error.message);
    // Try to load with json option which is more lenient
    try {
      data = yaml.load(content, { json: true });
    } catch (fallbackError) {
      // Last resort: try original again (might work if error was transient)
      throw new Error(`Failed to parse YAML: ${error.message}`);
    }
  }
  
  // Map to API attributes structure
  return {
    title: data.title,
    description: data.description,
    heroImage: data.hero_image,
    metaTitle: data.meta_title,
    metaDescription: data.meta_description,
    pdf: data.pdf,
    version: data.version,
    listed: data.listed ?? true,
    copyedit: data.copyedit ?? false,
    lastTested: data.last_tested,
    steps: (data.steps || []).map((step, index) => ({
      title: step.title,
      position: index,
      quiz: !!step.knowledge_quiz,
      challenge: false, // Will be determined from markdown content
      completion: step.completion || [],
      ingredients: step.ingredients || [],
      knowledgeQuiz: step.knowledge_quiz ? {
        path: step.knowledge_quiz.path || 'quiz1',
        version: step.knowledge_quiz.version || 1,
        questions: step.knowledge_quiz.questions || 0,
        passing_score: step.knowledge_quiz.passing_score || 0
      } : null
    }))
  };
}
