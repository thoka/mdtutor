/**
 * Remark plugin to parse link attributes
 * Converts [text](url){:attr="value"} to links/images with attributes
 */

import { visit } from 'unist-util-visit';

/**
 * Parse attribute syntax: {:key="value"} or {.class}
 * Returns object with parsed attributes
 */
function parseAttributes(text) {
  const attrs = {};
  
  // Match {:key="value"} or {:key='value'}
  const attrPattern = /:([a-z_-]+)="([^"]*)"/g;
  let match;
  while ((match = attrPattern.exec(text)) !== null) {
    attrs[match[1]] = match[2];
  }
  
  // Match {.class}
  const classPattern = /\.([a-z0-9_-]+)/gi;
  const classes = [];
  while ((match = classPattern.exec(text)) !== null) {
    classes.push(match[1]);
  }
  if (classes.length > 0) {
    attrs.className = classes.join(' ');
  }
  
  return attrs;
}

/**
 * Apply attributes to links and images
 */
export default function remarkLinkAttributes() {
  return (tree) => {
    visit(tree, (node, index, parent) => {
      if (!parent || index === null) return;
      
      // Check if next sibling is a text node with attributes
      const nextNode = parent.children[index + 1];
      if (!nextNode || nextNode.type !== 'text') return;
      
      const attrMatch = nextNode.value.match(/^\{([^}]+)\}/);
      if (!attrMatch) return;
      
      // Only process links and images
      if (node.type !== 'link' && node.type !== 'image') return;
      
      // Parse attributes
      const attrs = parseAttributes(attrMatch[1]);
      
      // Apply attributes to node
      node.data = node.data || {};
      node.data.hProperties = node.data.hProperties || {};
      Object.assign(node.data.hProperties, attrs);
      
      // Remove attribute text from next node
      nextNode.value = nextNode.value.slice(attrMatch[0].length);
      
      // If text node is now empty, remove it
      if (nextNode.value === '') {
        parent.children.splice(index + 1, 1);
      }
    });
  };
}
