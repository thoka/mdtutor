/**
 * Parse meta.yml file and map to API structure
 */

import { readFileSync } from 'fs';
import yaml from 'js-yaml';

/**
 * Preprocess YAML content to handle duplicate keys
 * Merges duplicate keys that are arrays (e.g., completion:)
 * This handles cases where the same key appears multiple times in a step,
 * which is invalid YAML but can occur in source files.
 * @param {string} content - Raw YAML content
 * @returns {string} Preprocessed YAML content
 */
function preprocessYaml(content) {
  const lines = content.split('\n');
  const processed = [];
  let stepIndent = 0;
  let lastCompletionIndex = -1;
  let inCompletionBlock = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    const indent = line.match(/^(\s*)/)?.[1].length || 0;
    
    // Detect start of a new step (starts with "- title:")
    if (trimmed.startsWith('- title:')) {
      stepIndent = indent;
      lastCompletionIndex = -1;
      inCompletionBlock = false;
      processed.push(line);
      continue;
    }
    
    // Detect completion key within a step
    if (trimmed === 'completion:' && indent === stepIndent + 2) {
      if (lastCompletionIndex >= 0) {
        // Duplicate completion key - skip this line but collect its values
        inCompletionBlock = true;
        continue;
      } else {
        // First completion key in this step
        lastCompletionIndex = processed.length;
        inCompletionBlock = true;
        processed.push(line);
        continue;
      }
    }
    
    // If we're in a duplicate completion block, collect values
    if (inCompletionBlock && lastCompletionIndex >= 0) {
      // Check if we're still in the completion block (indent > completion key indent)
      if (indent > stepIndent + 2 && trimmed.startsWith('- ')) {
        // This is a list item - add it to the previous completion block
        // Find where to insert (after last item in completion array)
        let insertPos = lastCompletionIndex + 1;
        while (insertPos < processed.length) {
          const nextIndent = processed[insertPos].match(/^(\s*)/)?.[1].length || 0;
          if (nextIndent <= stepIndent + 2) {
            break;
          }
          insertPos++;
        }
        processed.splice(insertPos, 0, line);
        continue;
      } else {
        // We've left the completion block
        inCompletionBlock = false;
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
