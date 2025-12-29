/**
 * Parse single tutorial step file
 */

import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkFrontmatter from 'remark-frontmatter';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import remarkYamlBlocks from './plugins/remark-yaml-blocks.js';
import remarkBlockDelimiters from './plugins/remark-block-delimiters.js';
import remarkLinkAttributes from './plugins/remark-link-attributes.js';
import remarkTransclusion from './plugins/remark-transclusion.js';
import rehypeCodePreClass from './plugins/rehype-code-pre-class.js';
import rehypeHeadingIds from './plugins/rehype-heading-ids.js';

/**
 * Parse markdown content to HTML
 * @param {string} markdown - Markdown content
 * @param {Object} options - Parser options
 * @param {string} options.basePath - Base path for transclusion resolution
 * @param {Map} options.transclusionCache - Cache for transclusion content
 * @param {string[]} options.languages - Preferred languages for transclusions
 * @returns {Promise<string>} HTML content
 */
/**
 * Preprocess markdown to convert:
 * 1. YAML blocks to a parseable format
 * 2. Block delimiters (--- TYPE ---) to HTML comments (own tokens)
 * 
 * Converts:
 * ---
 * title: value
 * ---
 * To: ```yaml-block ... ```
 * 
 * Converts:
 * --- task ---
 * To: <!-- block-delimiter:task:open -->
 * 
 * Converts:
 * --- /task ---
 * To: <!-- block-delimiter:task:close -->
 */
function preprocessYamlBlocks(markdown) {
  const lines = markdown.split('\n');
  const processed = [];
  let i = 0;
  
  while (i < lines.length) {
    const line = lines[i];
    
    // First check for block delimiters (--- TYPE --- or --- /TYPE ---)
    // These must be checked before YAML delimiters to avoid conflicts
    // Match with optional trailing whitespace (some files have spaces after ---)
    const blockDelimiterMatch = line.match(/^---\s+(\/?)([a-z-]+)\s+---\s*$/);
    if (blockDelimiterMatch) {
      const isClosing = blockDelimiterMatch[1] === '/';
      const blockType = blockDelimiterMatch[2];
      // Convert to HTML comment - remark-parse will create an 'html' node for this
      processed.push(`<!-- block-delimiter:${blockType}:${isClosing ? 'close' : 'open'} -->`);
      i++;
      continue;
    }
    
    // Check if this line is exactly "---" (YAML delimiter)
    // Must not have text before or after (to distinguish from block delimiters like "--- collapse ---")
    if (line.trim() === '---' && line === '---') {
      // Look ahead for YAML content and closing delimiter
      let yamlLines = [];
      let foundClosing = false;
      let j = i + 1;
      
      while (j < lines.length) {
        const nextLine = lines[j];
        
        // Check if this is the closing delimiter
        if (nextLine.trim() === '---') {
          foundClosing = true;
          break;
        }
        
        // Collect YAML content
        yamlLines.push(nextLine);
        j++;
      }
      
      if (foundClosing) {
        // Found a YAML block - convert to a code block with special marker
        // This will be parsed as a code block, which we can then convert to yaml node
        const yamlContent = yamlLines.join('\n');
        processed.push('```yaml-block');
        if (yamlContent.trim()) {
          processed.push(yamlContent);
        }
        processed.push('```');
        i = j + 1; // Skip the closing ---
        continue;
      }
    }
    
    processed.push(line);
    i++;
  }
  
  return processed.join('\n');
}

export async function parseTutorial(markdown, options = {}) {
  // Preprocess YAML blocks before parsing
  const preprocessed = preprocessYamlBlocks(markdown);
  
  const processor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkFrontmatter, ['yaml'])
    .use(remarkBlockDelimiters) // Process block delimiters early, before YAML blocks processing
    .use(remarkYamlBlocks) // Convert preprocessed YAML blocks to yaml nodes
    .use(remarkLinkAttributes)
    .use(remarkTransclusion, {
      basePath: options.basePath,
      cache: options.transclusionCache,
      languages: options.languages
    })
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeHeadingIds) // Add IDs to headings
    .use(rehypeCodePreClass)
    .use(rehypeStringify, { allowDangerousHtml: true });
  
  const vfile = await processor.process(preprocessed);
  let html = String(vfile);
  
  // Post-process: Remove any remaining raw block delimiters that weren't converted
  // This handles edge cases where delimiters weren't properly processed
  // Match delimiters in various HTML contexts: <p>--- ... ---</p>, standalone, etc.
  const rawDelimiterPatterns = [
    /<p>---\s*\/?[a-z-]+\s*---<\/p>/gi,
    /<p>\s*---\s*\/?[a-z-]+\s*---\s*<\/p>/gi,
    />---\s*\/?[a-z-]+\s*---</gi,  // Between tags
    /---\s*\/?[a-z-]+\s*---/g  // Anywhere (fallback)
  ];
  
  for (const pattern of rawDelimiterPatterns) {
    html = html.replace(pattern, '');
  }
  
  return html;
}

