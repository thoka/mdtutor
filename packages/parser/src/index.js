/**
 * @mdtutor/parser
 * 
 * Main export for Markdown to JSON parser
 * Compatible with Raspberry Pi Learning tutorial structure
 */

import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeRaw from 'rehype-raw';
import rehypeStringify from 'rehype-stringify';

export { parseProject } from './parse-project.js';
export { parseTutorial } from './parse-tutorial.js';

/**
 * Simple Markdown to HTML conversion for strings (e.g. pathway descriptions)
 * @param {string} markdown 
 * @returns {Promise<string>} HTML
 */
export async function simpleParse(markdown) {
  if (!markdown) return '';
  
  const result = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(markdown);
    
  return String(result).trim();
}
