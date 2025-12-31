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
    .replace(/[^\p{L}\p{N}\ufe0f-]+/gu, '-') // Replace sequences of non-alphanumeric (except \ufe0f and hyphen) with a single hyphen
    .replace(/^-+|-+$/g, ''); // Trim leading and trailing hyphens
}

export default function rehypeHeadingIds() {
  return (tree) => {
    const usedIds = new Set();
    
    visit(tree, 'element', (node) => {
      // Only process heading elements (h1-h6)
      if (node.tagName && /^h[1-6]$/.test(node.tagName)) {
        // Skip if it already has an ID
        if (node.properties && node.properties.id) {
          usedIds.add(node.properties.id);
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
        let id = slugify(text);
        
        // Handle duplicate IDs
        if (id) {
          let originalId = id;
          let counter = 1;
          while (usedIds.has(id)) {
            id = `${originalId}-${counter}`;
            counter++;
          }
          usedIds.add(id);
          
          node.properties = node.properties || {};
          node.properties.id = id;
        }
      }
    });
  };
}

