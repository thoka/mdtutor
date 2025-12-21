/**
 * Remark plugin to parse RPL block delimiters
 * Converts --- TYPE --- ... --- /TYPE --- to div wrappers
 * 
 * Strategy: Replace paragraphs containing only delimiters with HTML nodes,
 * then wrap content between opening/closing delimiters
 */

import { visit } from 'unist-util-visit';

/**
 * Block type to CSS class mapping
 */
const BLOCK_CLASSES = {
  'no-print': 'u-no-print',
  'print-only': 'u-print-only',
  'task': 'c-project-task',
  'collapse': 'c-project-collapse',
  'save': 'c-project-save'
};

/**
 * Check if a text node is a block delimiter line
 */
function matchDelimiterLine(text) {
  return text.match(/^---\s+(\/?)([a-z-]+)\s+---$/);
}

/**
 * Parse block delimiter syntax and convert to HTML wrapper divs
 */
export default function remarkBlockDelimiters() {
  return (tree) => {
    const transformations = [];
    
    // First pass: find delimiter positions
    visit(tree, 'paragraph', (node, index, parent) => {
      if (!parent || index === null) return;
      
      const child = node.children[0];
      if (node.children.length !== 1 || child.type !== 'text') return;
      
      const match = matchDelimiterLine(child.value.trim());
      if (!match) return;
      
      const isClosing = match[1] === '/';
      const blockType = match[2];
      
      transformations.push({
        parent,
        index,
        isClosing,
        blockType
      });
    });
    
    // Second pass: match opening/closing pairs and wrap content
    const stack = [];
    const wrapRanges = [];
    
    for (const t of transformations) {
      if (!t.isClosing) {
        stack.push(t);
      } else {
        const opening = stack.pop();
        if (opening && opening.blockType === t.blockType && opening.parent === t.parent) {
          wrapRanges.push({
            parent: t.parent,
            startIndex: opening.index,
            endIndex: t.index,
            blockType: t.blockType
          });
        }
      }
    }
    
    // Third pass: apply transformations (reverse order to preserve indices)
    wrapRanges.sort((a, b) => b.startIndex - a.startIndex);
    
    for (const range of wrapRanges) {
      const { parent, startIndex, endIndex, blockType } = range;
      const className = BLOCK_CLASSES[blockType] || `c-block-${blockType}`;
      
      // Create opening HTML node
      const openHTML = {
        type: 'html',
        value: blockType === 'task'
          ? `<div class="${className}">\n<input class="c-project-task__checkbox" type="checkbox" aria-label="Mark this task as complete" />`
          : `<div class="${className}">`
      };
      
      // Create closing HTML node
      const closeHTML = {
        type: 'html',
        value: '</div>'
      };
      
      // Replace delimiter paragraphs with HTML
      parent.children[startIndex] = openHTML;
      parent.children[endIndex] = closeHTML;
    }
  };
}
