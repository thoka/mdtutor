/**
 * Remark plugin to parse link attributes
 * Converts [text](url){:attr="value"} to links/images with attributes
 * Also handles code blocks with {:class="..."} syntax
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
 * Apply attributes to links, images, and code blocks
 */
export default function remarkLinkAttributes() {
  return (tree) => {
    visit(tree, (node, index, parent) => {
      if (!parent || index === null) return;
      
      // Check if next sibling is a text node with attributes
      const nextNode = parent.children[index + 1];
      if (!nextNode || nextNode.type !== 'text') return;
      
      // Only process if the text node starts with attribute syntax
      // Must start with { and contain at least one valid attribute pattern
      const attrMatch = nextNode.value.match(/^\{([^}]+)\}/);
      if (!attrMatch) return;
      
      // Verify that the attribute block contains valid attribute syntax
      // (either :key="value" or .class)
      const attrText = attrMatch[1];
      const hasValidAttr = /:([a-z_-]+)="([^"]*)"/.test(attrText) || /\.([a-z0-9_-]+)/i.test(attrText);
      if (!hasValidAttr) return;
      
      // Process links, images, and code blocks
      if (node.type !== 'link' && node.type !== 'image' && node.type !== 'inlineCode' && node.type !== 'code') {
        return;
      }
      
      // Parse attributes
      const attrs = parseAttributes(attrMatch[1]);
      
      // Apply attributes to node
      node.data = node.data || {};
      node.data.hProperties = node.data.hProperties || {};
      
      // For className, merge with existing classes
      if (attrs.className) {
        const existingClasses = node.data.hProperties.className || [];
        const existingArray = Array.isArray(existingClasses) ? existingClasses : [existingClasses];
        node.data.hProperties.className = [...existingArray, attrs.className].filter(Boolean);
        delete attrs.className;
      }
      
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
