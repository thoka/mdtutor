/**
 * Parse single tutorial step file
 */

import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkFrontmatter from 'remark-frontmatter';
import remarkRehype from 'remark-rehype';
import rehypeRaw from 'rehype-raw';
import rehypeStringify from 'rehype-stringify';
import { visit } from 'unist-util-visit';
import remarkYamlBlocks from './plugins/remark-yaml-blocks.js';
import remarkBlockContainers from './plugins/remark-block-containers.js';
import remarkLinkAttributes from './plugins/remark-link-attributes.js';
import remarkTransclusion from './plugins/remark-transclusion.js';
import rehypeCodePreClass from './plugins/rehype-code-pre-class.js';
import rehypeHeadingIds from './plugins/rehype-heading-ids.js';
import rehypeLegacyCompat from './plugins/rehype-legacy-compat.js';
import { blockDelimiters } from './plugins/micromark-extension-block-delimiters.js';
import { blockDelimitersFromMarkdown } from './plugins/mdast-util-block-delimiters.js';

/**
 * Preprocess markdown to convert YAML blocks and handle raw HTML quirks.
 */
export function preprocessMarkdown(markdown) {
  const lines = markdown.split('\n');
  const processed = [];
  let i = 0;
  
  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();
    
    // 1. YAML blocks (--- \n title: ... \n ---)
    if (trimmed === '---') {
      let yamlLines = [];
      let foundClosing = false;
      let j = i + 1;
      
      while (j < lines.length) {
        const nextLine = lines[j];
        if (nextLine.trim() === '---') {
          foundClosing = true;
          break;
        }
        yamlLines.push(nextLine);
        j++;
      }
      
      if (foundClosing) {
        const yamlContent = yamlLines.join('\n');
        processed.push('```yaml-block');
        if (yamlContent.trim()) {
          processed.push(yamlContent);
        }
        processed.push('```');
        i = j + 1;
        continue;
      }
    }

    processed.push(line);
    i++;
  }
  
  let content = processed.join('\n');
  
  // 3. Handle raw HTML p tags with internal blank lines (e.g. <p>... \n\n ... </p>)
  // We join them to ensure Micromark treats them as a single HTML block.
  // This is specifically for i-made-you-a-book.
  content = content.replace(/(<p[^>]*>)([\s\S]*?)(<\/p>)/gi, (match, open, body, close) => {
    return open + body.replace(/\n\s*\n/g, '\n') + close;
  });

  // 3. Ensure balanced tags at delimiters (safety net for nesting)
  // This is critical for Micromark to correctly see delimiters even inside unclosed HTML.
  // Also handle a legacy quirk where lines in a list are not indented.
  let divStack = 0;
  let pStack = 0;
  const balancedLines = content.split('\n').map((line, index, allLines) => {
    const trimmed = line.trim();
    
    // Legacy quirk: indent lines that follow a list item but are not indented.
    // We only do this if the line starts with an ellipsis (...) which is a common quirk.
    if (index > 0 && allLines[index - 1].trim().match(/^[*+-] /) &&
        trimmed.startsWith('...') &&
        !line.startsWith(' ')) {
      line = '  ' + line + '<br />';
    }

    const openDivs = (trimmed.match(/<div[^>]*>/gi) || []).length;
    const closeDivs = (trimmed.match(/<\/div>/gi) || []).length;
    divStack += openDivs - closeDivs;

    const openPs = (trimmed.match(/<p[^>]*>/gi) || []).length;
    const closePs = (trimmed.match(/<\/p>/gi) || []).length;
    pStack += openPs - closePs;
    
    // Force close tags before block delimiters if they are unbalanced.
    if (trimmed.startsWith('---') && (divStack > 0 || pStack > 0)) {
      let forceClosing = '';
      if (divStack > 0) { forceClosing += '</div>'.repeat(divStack); divStack = 0; }
      if (pStack > 0) { forceClosing += '</p>'.repeat(pStack); pStack = 0; }
      // Add multiple newlines to ensure Micromark treats it as a separate block
      return '\n\n' + forceClosing + '\n\n' + line;
    }
    return line;
  });
  content = balancedLines.join('\n');
  if (divStack > 0) content += '\n' + '</div>'.repeat(divStack);
  if (pStack > 0) content += '\n' + '</p>'.repeat(pStack);

  // 3. Ensure blank lines around block delimiters (--- type ---)
  // This is critical for Micromark to recognize them. 
  // We do this AFTER balancing to ensure force-closed tags don't block the delimiter.
  content = content.replace(/^(---\s+\/?([a-z-]+)\s*---)\s*$/gm, '\n$1\n');

  // 4. Final normalization
  return content
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Rehype plugin to resolve asset URLs (images, etc.)
 */
function rehypeResolveAssets(options = {}) {
  const { baseUrl } = options;
  return (tree) => {
    if (!baseUrl) return;
    
    visit(tree, 'element', (node) => {
      if (node.tagName === 'img' && node.properties?.src) {
        const src = node.properties.src;
        if (!src.startsWith('http') && !src.startsWith('//') && !src.startsWith('data:')) {
          // Resolve relative path
          try {
            node.properties.src = new URL(src, baseUrl).toString();
          } catch (e) {
            // Ignore invalid URLs
          }
        }
      }
    });
  };
}

export async function parseTutorial(markdown, options = {}) {
  // Preprocess markdown before parsing
  // 2. Handle soft breaks as hard breaks for certain patterns (legacy compatibility)
  // This is specifically for transclusions in i-made-you-a-book.
  let preprocessed = preprocessMarkdown(markdown);
  if (options.isTransclusion) {
    preprocessed = preprocessed.replace(/([)}])\n([^\n])/g, '$1  \n$2');
  }
  
  const processor = unified()
    .data('micromarkExtensions', [blockDelimiters()])
    .data('fromMarkdownExtensions', [blockDelimitersFromMarkdown()])
    .use(remarkParse)
    .use(remarkFrontmatter, ['yaml'])
    .use(remarkYamlBlocks) // Convert preprocessed YAML blocks to yaml nodes
    .use(remarkBlockContainers, { 
      languages: options.languages,
      debug: options.debug || process.env.DEBUG_PARSER === 'true'
    }) // Transform block delimiters into containers
    .use(remarkLinkAttributes)
    .use(remarkTransclusion, {
      basePath: options.basePath,
      cache: options.transclusionCache,
      languages: options.languages
    })
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeLegacyCompat)
    .use(rehypeHeadingIds) // Add IDs to headings
    .use(rehypeResolveAssets, { baseUrl: options.assetBaseUrl })
    .use(rehypeCodePreClass)
    .use(rehypeStringify, { allowDangerousHtml: true });
  
  const vfile = await processor.process(preprocessed);
  let html = String(vfile);
  
  // Post-process: Check for any remaining raw block delimiters
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
        examples: matches.slice(0, 3)
      });
    }
  }
  
  const warnings = [];
  if (foundDelimiters.length > 0) {
    const totalCount = foundDelimiters.reduce((sum, d) => sum + d.count, 0);
    warnings.push({
      type: 'unprocessed_block_delimiter',
      message: `Found ${totalCount} raw block delimiter(s) in HTML output.`,
      count: totalCount
    });
    
    for (const { pattern } of rawDelimiterPatterns) {
      html = html.replace(pattern, '');
    }
  }
  
  return { html, warnings };
}
