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
    const key = match[1] === 'class' ? 'className' : match[1];
    attrs[key] = match[2];
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
 * Extract text content from a node (for checking paragraph content)
 */
function extractTextFromNode(node) {
  if (node.type === 'text') {
    return node.value;
  }
  if (node.children) {
    return node.children.map(extractTextFromNode).join('');
  }
  return '';
}

/**
 * Apply attributes to links, images, and code blocks
 */
export default function remarkLinkAttributes() {
  return (tree) => {
    // First pass: handle attributes on same line or in same paragraph (text nodes)
    visit(tree, (node, index, parent) => {
      if (!parent || index === null || !node) return;
      
      // Process links, images, and code blocks
      if (node.type !== 'link' && node.type !== 'image' && node.type !== 'inlineCode' && node.type !== 'code') {
        return;
      }
      
      // Check if next sibling is a text node with attributes
      let nextNode = parent.children[index + 1];
      
      // If no next sibling or it's not a text node, check if we're in a paragraph
      // and there are more children in the paragraph (handles attributes on separate lines in same paragraph)
      if ((!nextNode || nextNode.type !== 'text') && parent.type === 'paragraph' && index < parent.children.length - 1) {
        // Look for text node with attributes in the same paragraph (could be on separate line)
        for (let i = index + 1; i < parent.children.length; i++) {
          const sibling = parent.children[i];
          if (sibling && sibling.type === 'text') {
            const trimmed = sibling.value.trim();
            if (trimmed.match(/^\{([^}]+)\}/)) {
              nextNode = sibling;
              break;
            }
          }
        }
      }
      
      if (!nextNode || nextNode.type !== 'text') return;
      
      // Only process if the text node starts with attribute syntax (after trimming)
      const trimmedValue = nextNode.value.trim();
      const attrMatch = trimmedValue.match(/^\{([^}]+)\}/);
      if (!attrMatch) return;
      
      // Verify that the attribute block contains valid attribute syntax
      const attrText = attrMatch[1];
      const hasValidAttr = /:([a-z_-]+)="([^"]*)"/.test(attrText) || /\.([a-z0-9_-]+)/i.test(attrText);
      if (!hasValidAttr) return;
      
      // Parse attributes
      const attrs = parseAttributes(attrText);
      
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
      // Handle both cases: attribute at start of text node, or attribute is the entire text node
      if (nextNode.value.trim() === attrMatch[0]) {
        // Attribute is the entire text node - remove it
        // But keep any trailing whitespace if it's not just the attribute
        const trailingWhitespace = nextNode.value.match(/\}\s+$/);
        if (trailingWhitespace) {
          nextNode.value = trailingWhitespace[0].slice(1);
        } else {
          const nodeIndex = parent.children.indexOf(nextNode);
          if (nodeIndex !== -1) {
            parent.children.splice(nodeIndex, 1);
          }
        }
      } else {
        // Attribute is at the start - remove it
        // Only remove leading whitespace, keep trailing whitespace as it might be a word separator
        nextNode.value = nextNode.value.replace(/^\s*\{([^}]+)\}/, '');
        // If text node is now empty or only whitespace, remove it
        if (nextNode.value.trim() === '') {
          const nodeIndex = parent.children.indexOf(nextNode);
          if (nodeIndex !== -1) {
            parent.children.splice(nodeIndex, 1);
          }
        }
      }
    });
    
    // Second pass: handle attributes on separate lines (paragraphs)
    // This handles cases like:
    // ![Image](url)
    // {:width="300px"}
    // Also handles duplicate attributes (same attribute on same line and separate line)
    // Process in reverse order to avoid index issues when removing nodes
    const attributeParagraphs = [];
    visit(tree, 'paragraph', (paragraphNode, paragraphIndex, paragraphParent) => {
      if (!paragraphParent || paragraphIndex === null) return;
      
      // Check if this paragraph contains only an attribute
      const paragraphText = extractTextFromNode(paragraphNode).trim();
      const attrMatch = paragraphText.match(/^\{([^}]+)\}$/);
      if (!attrMatch) return;
      
      const attrText = attrMatch[1];
      const hasValidAttr = /:([a-z_-]+)="([^"]*)"/.test(attrText) || /\.([a-z0-9_-]+)/i.test(attrText);
      if (!hasValidAttr) return;
      
      // Store for processing (we'll process in reverse order)
      attributeParagraphs.push({
        paragraphNode,
        paragraphIndex,
        paragraphParent,
        attrText
      });
    });
    
    // Process attribute paragraphs in reverse order
    for (const { paragraphNode, paragraphIndex, paragraphParent, attrText } of attributeParagraphs.reverse()) {
      // Look for previous sibling that is a paragraph containing a link, image, or code block
      if (paragraphIndex > 0) {
        const prevNode = paragraphParent.children[paragraphIndex - 1];
        
        // Check if previous node is a paragraph containing an image/link
        if (prevNode && prevNode.type === 'paragraph' && prevNode.children) {
          // Find image/link in previous paragraph (check from end, as it's usually the last element)
          for (let i = prevNode.children.length - 1; i >= 0; i--) {
            const child = prevNode.children[i];
            if (child && (child.type === 'image' || child.type === 'link' || child.type === 'code')) {
              // Parse attributes
              const attrs = parseAttributes(attrText);
              
              // Apply attributes to node (merge with existing attributes)
              child.data = child.data || {};
              child.data.hProperties = child.data.hProperties || {};
              
              // For className, merge with existing classes
              if (attrs.className) {
                const existingClasses = child.data.hProperties.className || [];
                const existingArray = Array.isArray(existingClasses) ? existingClasses : [existingClasses];
                child.data.hProperties.className = [...existingArray, attrs.className].filter(Boolean);
                delete attrs.className;
              }
              
              // Merge other attributes (duplicates will overwrite)
              Object.assign(child.data.hProperties, attrs);
              
              // Remove the attribute paragraph
              paragraphParent.children.splice(paragraphIndex, 1);
              break; // Found and processed, move to next
            }
          }
        }
      }
    }
    
    // Third pass: remove any remaining raw attribute text nodes in paragraphs
    // This handles cases where attributes appear as text (e.g., duplicate attributes)
    visit(tree, 'paragraph', (paragraphNode, paragraphIndex, paragraphParent) => {
      if (!paragraphParent || !paragraphNode.children) return;
      
      // Check all text children for raw attribute syntax
      for (let i = paragraphNode.children.length - 1; i >= 0; i--) {
        const child = paragraphNode.children[i];
        if (child && child.type === 'text') {
          const trimmed = child.value.trim();
          const attrMatch = trimmed.match(/^\{([^}]+)\}$/);
          if (attrMatch) {
            const attrText = attrMatch[1];
            const hasValidAttr = /:([a-z_-]+)="([^"]*)"/.test(attrText) || /\.([a-z0-9_-]+)/i.test(attrText);
            if (hasValidAttr) {
              // This is a standalone attribute that wasn't processed - remove it
              paragraphNode.children.splice(i, 1);
            }
          }
        }
      }
      
      // Remove paragraph if it's now empty
      if (paragraphNode.children.length === 0) {
        const paraIndex = paragraphParent.children.indexOf(paragraphNode);
        if (paraIndex !== -1) {
          paragraphParent.children.splice(paraIndex, 1);
        }
      }
    });
  };
}
