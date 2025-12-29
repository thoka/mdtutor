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
import { blockDelimiters } from './plugins/micromark-extension-block-delimiters.js';
import { blockDelimitersFromMarkdown } from './plugins/mdast-util-block-delimiters.js';

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
    
    // NOTE: Block delimiters are now handled by micromark extension
    // We no longer convert them to HTML comments in preprocessing
    // This allows the extension to create proper blockDelimiter nodes
    // Only check for block delimiters to skip them (don't process as YAML)
    const blockDelimiterMatch = line.match(/^---\s+(\/?)([a-z-]+)\s*---\s*$/);
    if (blockDelimiterMatch) {
      // Leave the delimiter as-is for micromark extension to process
      // Just skip it in YAML processing
      processed.push(line);
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
    .data('micromarkExtensions', [blockDelimiters()])
    .data('fromMarkdownExtensions', [blockDelimitersFromMarkdown()])
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
  
  // Post-process: Check for any remaining raw block delimiters that weren't converted
  // With the micromark extension, this should not happen anymore
  // If delimiters are found, it indicates a parsing issue that needs to be fixed
  const rawDelimiterPatterns = [
    { pattern: /<p>---\s*\/?[a-z-]+\s*---<\/p>/gi, name: 'paragraph-wrapped' },
    { pattern: /<p>\s*---\s*\/?[a-z-]+\s*---\s*<\/p>/gi, name: 'paragraph-wrapped-with-spaces' },
    { pattern: />---\s*\/?[a-z-]+\s*---</gi, name: 'between-tags' },
    { pattern: /---\s*\/?[a-z-]+\s*---/g, name: 'anywhere' }
  ];
  
  const foundDelimiters = [];
  for (const { pattern, name } of rawDelimiterPatterns) {
    const matches = html.match(pattern);
    if (matches && matches.length > 0) {
      foundDelimiters.push({
        type: name,
        count: matches.length,
        examples: matches.slice(0, 3) // Show first 3 examples
      });
    }
  }
  
  const warnings = [];
  if (foundDelimiters.length > 0) {
    const totalCount = foundDelimiters.reduce((sum, d) => sum + d.count, 0);
    const warningMessage = `Found ${totalCount} raw block delimiter(s) in HTML output that were not processed by the micromark extension. This indicates a parsing issue.`;
    
    warnings.push({
      type: 'unprocessed_block_delimiter',
      message: warningMessage,
      count: totalCount,
      details: {
        foundTypes: foundDelimiters.map(d => ({ type: d.type, count: d.count })),
        examples: foundDelimiters.flatMap(d => d.examples).slice(0, 3)
      }
    });
    
    // Also log to console for debugging
    console.warn(`WARNING: ${warningMessage}\n` +
      `Found types: ${foundDelimiters.map(d => `${d.type} (${d.count})`).join(', ')}\n` +
      `Examples: ${foundDelimiters.flatMap(d => d.examples).slice(0, 3).map(e => JSON.stringify(e)).join(', ')}`);
    
    // Remove the delimiters to prevent them from appearing in output
    // But this is a workaround - the root cause should be fixed
    for (const { pattern } of rawDelimiterPatterns) {
      html = html.replace(pattern, '');
    }
  }
  
  return { html, warnings };
}

