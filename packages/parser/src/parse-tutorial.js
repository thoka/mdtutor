/**
 * Parse single tutorial step file
 */

import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkFrontmatter from 'remark-frontmatter';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';

/**
 * Parse markdown content to HTML
 * @param {string} markdown - Markdown content
 * @param {Object} options - Parser options
 * @returns {Promise<string>} HTML content
 */
export async function parseTutorial(markdown, options = {}) {
  const processor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkFrontmatter, ['yaml'])
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeStringify, { allowDangerousHtml: true });
  
  const vfile = await processor.process(markdown);
  return String(vfile);
}

