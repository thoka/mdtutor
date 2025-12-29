/**
 * Remark plugin to parse RPL block delimiters
 * Converts --- TYPE --- ... --- /TYPE --- to div wrappers
 * 
 * Strategy: Replace paragraphs containing only delimiters with HTML nodes,
 * then wrap content between opening/closing delimiters
 * 
 * Special handling for collapse blocks with frontmatter:
 * --- collapse ---
 * ---
 * title: Title here
 * ---
 * Content...
 * --- /collapse ---
 */

import { visit } from 'unist-util-visit';
import yaml from 'js-yaml';

/**
 * Block type to CSS class mapping
 */
const BLOCK_CLASSES = {
  'no-print': 'u-no-print',
  'print-only': 'u-print-only',
  'task': 'c-project-task',
  'collapse': 'c-project-panel',
  'save': 'c-project-panel'
};

/**
 * Panel type modifiers (based on context or frontmatter)
 */
const PANEL_MODIFIERS = {
  'collapse': 'c-project-panel--ingredient',
  'save': 'c-project-panel--save'
};

/**
 * Check if a text node is a block delimiter line
 */
function matchDelimiterLine(text) {
  return text.match(/^---\s+(\/?)([a-z-]+)\s+---$/);
}

/**
 * Check if a node is a YAML frontmatter block
 */
function isYamlFrontmatter(node) {
  return node.type === 'yaml';
}

/**
 * Parse YAML frontmatter to extract title and other metadata
 */
function parseFrontmatter(yamlContent) {
  try {
    const data = yaml.load(yamlContent);
    return data || {};
  } catch (error) {
    return {};
  }
}

/**
 * Extract title from frontmatter or heading
 */
function extractTitle(children, startIndex) {
  // Check for YAML frontmatter immediately after opening delimiter
  if (startIndex + 1 < children.length) {
    const nextNode = children[startIndex + 1];
    if (isYamlFrontmatter(nextNode)) {
      const frontmatter = parseFrontmatter(nextNode.value);
      if (frontmatter.title) {
        return {
          title: frontmatter.title,
          frontmatterIndex: startIndex + 1,
          panelType: frontmatter.type || 'ingredient'
        };
      }
    }
  }
  
  // Check for heading with "title: ..." pattern (h2 or h3)
  // This handles cases where frontmatter is parsed as a heading
  for (let i = startIndex + 1; i < Math.min(startIndex + 3, children.length); i++) {
    const node = children[i];
    if (node.type === 'heading' && (node.depth === 2 || node.depth === 3)) {
      const headingText = extractTextFromNode(node);
      // Match "title: ..." pattern
      const titleMatch = headingText.match(/^title:\s*(.+)$/);
      if (titleMatch) {
        return {
          title: titleMatch[1].trim(),
          frontmatterIndex: i,
          panelType: 'ingredient'
        };
      }
    }
  }
  
  // Check for paragraph with "title: ..." pattern (fallback)
  if (startIndex + 1 < children.length) {
    const nextNode = children[startIndex + 1];
    if (nextNode.type === 'paragraph') {
      const paraText = extractTextFromNode(nextNode);
      const titleMatch = paraText.match(/^title:\s*(.+)$/);
      if (titleMatch) {
        return {
          title: titleMatch[1].trim(),
          frontmatterIndex: startIndex + 1,
          panelType: 'ingredient'
        };
      }
    }
  }
  
  return null;
}

/**
 * Extract text content from a node
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
 * Parse block delimiter syntax and convert to HTML wrapper divs
 */
export default function remarkBlockDelimiters() {
  return (tree) => {
    const transformations = [];
    
    // First pass: find delimiter positions
    // Check paragraphs and headings (not text nodes directly, as they don't have index/parent)
    visit(tree, 'paragraph', (node, index, parent) => {
      if (!parent || index === null) return;
      
      if (!node.children || node.children.length !== 1) return;
      const child = node.children[0];
      if (child.type !== 'text') return;
      
      const text = child.value.trim();
      const match = matchDelimiterLine(text);
      if (!match) return;
      
      const isClosing = match[1] === '/';
      const blockType = match[2];
      
      transformations.push({
        parent,
        index,
        isClosing,
        blockType,
        nodeType: node.type
      });
    });
    
    // Also check headings for delimiters
    visit(tree, 'heading', (node, index, parent) => {
      if (!parent || index === null) return;
      
      if (!node.children) return;
      const text = node.children.map(n => n.type === 'text' ? n.value : '').join('').trim();
      if (!text) return;
      
      const match = matchDelimiterLine(text);
      if (!match) return;
      
      const isClosing = match[1] === '/';
      const blockType = match[2];
      
      transformations.push({
        parent,
        index,
        isClosing,
        blockType,
        nodeType: node.type
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
      const children = parent.children;
      
      // Special handling for collapse blocks with frontmatter
      if (blockType === 'collapse') {
        const titleInfo = extractTitle(children, startIndex);
        
        if (titleInfo) {
          // Generate panel structure with title
          const panelModifier = PANEL_MODIFIERS[blockType] || `c-project-panel--${titleInfo.panelType}`;
          const openHTML = {
            type: 'html',
            value: `<div class="c-project-panel ${panelModifier}">\n  <h3 class="c-project-panel__heading js-project-panel__toggle">\n    ${titleInfo.title}\n  </h3>\n\n  <div class="c-project-panel__content u-hidden">`
          };
          
          const closeHTML = {
            type: 'html',
            value: '\n  </div>\n</div>'
          };
          
          // Replace opening delimiter with panel opening
          parent.children[startIndex] = openHTML;
          
          // Remove frontmatter/heading if present
          if (titleInfo.frontmatterIndex !== undefined && titleInfo.frontmatterIndex < endIndex) {
            parent.children.splice(titleInfo.frontmatterIndex, 1);
            // Adjust endIndex if we removed a node before it
            const adjustedEndIndex = endIndex > titleInfo.frontmatterIndex ? endIndex - 1 : endIndex;
            parent.children[adjustedEndIndex] = closeHTML;
          } else {
            parent.children[endIndex] = closeHTML;
          }
          
          continue;
        }
      }
      
      // Special handling for save blocks
      if (blockType === 'save') {
        const titleInfo = extractTitle(children, startIndex);
        const panelModifier = PANEL_MODIFIERS[blockType] || 'c-project-panel--save';
        
        if (titleInfo) {
          const openHTML = {
            type: 'html',
            value: `<div class="c-project-panel ${panelModifier}">\n  <h3 class="c-project-panel__heading">\n    ${titleInfo.title}\n  </h3>\n</div>`
          };
          
          // For save blocks, we replace the entire block (no content)
          parent.children[startIndex] = openHTML;
          
          // Remove frontmatter/heading if present
          if (titleInfo.frontmatterIndex !== undefined && titleInfo.frontmatterIndex < endIndex) {
            parent.children.splice(titleInfo.frontmatterIndex, 1);
            const adjustedEndIndex = endIndex > titleInfo.frontmatterIndex ? endIndex - 1 : endIndex;
            // Remove closing delimiter and all content between
            parent.children.splice(startIndex + 1, adjustedEndIndex - startIndex);
          } else {
            // Remove closing delimiter
            parent.children.splice(endIndex, 1);
            // Remove content between
            parent.children.splice(startIndex + 1, endIndex - startIndex - 1);
          }
          
          continue;
        }
      }
      
      // Default handling for other block types
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
