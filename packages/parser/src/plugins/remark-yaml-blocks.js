/**
 * Remark plugin to parse YAML blocks anywhere in the document
 * 
 * Extends remark-frontmatter to recognize YAML blocks that are not at the start of the document.
 * 
 * Syntax:
 * ---
 * title: value
 * ---
 * 
 * These blocks are converted to 'yaml' nodes in the AST, which can then be processed
 * by other plugins (e.g., block delimiters for collapse panels).
 * 
 * Rules:
 * - Three dashes (`---`) on a line by itself (without text before or after on the same line)
 * - YAML content between the dashes (can be in headings or paragraphs)
 * - Closing `---` on a line by itself
 * 
 * Implementation:
 * Since remark-parse may parse `---` after headings as headings instead of thematicBreak,
 * we look for patterns like:
 * - thematicBreak -> heading with "title: ..." -> thematicBreak
 * - thematicBreak -> paragraph with YAML content -> thematicBreak
 * - thematicBreak -> heading with "title: ..." -> (no closing, but next node might be content)
 */

import { visit } from 'unist-util-visit';

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
 * Check if a heading contains YAML-like content (e.g., "title: ...")
 */
function isYamlHeading(node) {
  if (node.type !== 'heading') return false;
  if (!node.children) return false;
  const text = extractTextFromNode(node);
  // Check for YAML-like patterns: "title: ...", "key: value", etc.
  return /^[a-z_-]+:\s*.+$/i.test(text.trim());
}

/**
 * Check if a paragraph is a YAML delimiter (just "---")
 */
function isYamlDelimiterParagraph(node) {
  if (node.type !== 'paragraph') return false;
  if (!node.children || node.children.length !== 1) return false;
  const child = node.children[0];
  if (child.type !== 'text') return false;
  return child.value.trim() === '---';
}

/**
 * Find YAML blocks in the AST (marked by code blocks with "yaml-block" language)
 * and convert them to yaml nodes
 */
export default function remarkYamlBlocks() {
  return (tree) => {
    // Find code blocks with "yaml-block" language (from preprocessing)
    visit(tree, 'code', (node, index, parent) => {
      if (!parent || index === null) return;
      if (node.lang !== 'yaml-block') return;
      
      // Convert code block to yaml node
      const yamlNode = {
        type: 'yaml',
        value: node.value || ''
      };
      
      parent.children[index] = yamlNode;
    });
  };
}
