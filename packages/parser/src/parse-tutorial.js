/**
 * Parse single tutorial step file
 */

import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkFrontmatter from 'remark-frontmatter';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import remarkBlockDelimiters from './plugins/remark-block-delimiters.js';
import remarkLinkAttributes from './plugins/remark-link-attributes.js';
import remarkTransclusion from './plugins/remark-transclusion.js';

/**
 * Parse markdown content to HTML
 * @param {string} markdown - Markdown content
 * @param {Object} options - Parser options
 * @param {string} options.basePath - Base path for transclusion resolution
 * @param {Map} options.transclusionCache - Cache for transclusion content
 * @returns {Promise<string>} HTML content
 */
export async function parseTutorial(markdown, options = {}) {
  const processor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkFrontmatter, ['yaml'])
    .use(remarkBlockDelimiters)
    .use(remarkLinkAttributes)
    .use(remarkTransclusion, {
      basePath: options.basePath,
      cache: options.transclusionCache
    })
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeStringify, { allowDangerousHtml: true });
  
  const vfile = await processor.process(markdown);
  return String(vfile);
}

