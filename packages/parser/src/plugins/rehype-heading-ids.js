/**
 * Rehype plugin to add IDs to headings based on their text content
 * Generates slugs similar to GitHub's heading ID generation
 */

import { visit } from 'unist-util-visit';

/**
 * Generate a slug from text (similar to GitHub's algorithm)
 */
function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, '-') // Replace non-letters/numbers with hyphen
    .replace(/[\s_-]+/g, '-') // Normalize hyphens
    .replace(/^-+/g, '') // Remove leading hyphens
    .replace(/-+$/g, ''); // Remove trailing hyphens
}

export default function rehypeHeadingIds() {
  return (tree) => {
    visit(tree, 'element', (node) => {
      // Only process heading elements (h1-h6)
      if (node.tagName && /^h[1-6]$/.test(node.tagName)) {
        // Skip if it already has an ID
        if (node.properties && node.properties.id) {
          return;
        }

        // Skip headings that are part of a panel (legacy behavior)
        if (node.properties && node.properties.className && 
            Array.isArray(node.properties.className) && 
            node.properties.className.includes('c-project-panel__heading')) {
          return;
        }

        // Extract text content from heading
        const extractText = (node) => {
          if (node.type === 'text') {
            return node.value;
          }
          if (node.children) {
            return node.children.map(extractText).join('');
          }
          return '';
        };
        
        const text = extractText(node);
        const id = slugify(text);
        console.log(`[rehypeHeadingIds] text="${text}" id="${id}"`);
        
        // Add ID attribute if we have a valid slug
        if (id) {
          node.properties = node.properties || {};
          node.properties.id = id;
        }
      }
    });
  };
}

