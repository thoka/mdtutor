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
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces, underscores, and multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

export default function rehypeHeadingIds() {
  return (tree) => {
    visit(tree, 'element', (node) => {
      // Only process heading elements (h1-h6)
      if (node.tagName && /^h[1-6]$/.test(node.tagName)) {
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
        
        // Add ID attribute if we have a valid slug
        if (id) {
          node.properties = node.properties || {};
          node.properties.id = id;
        }
      }
    });
  };
}

