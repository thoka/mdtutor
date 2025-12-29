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
  // Match with optional trailing whitespace (some files have spaces after ---)
  return text.match(/^---\s+(\/?)([a-z-]+)\s*---$/);
}

/**
 * Check if a node is a YAML frontmatter block
 */
function isYamlFrontmatter(node) {
  return node.type === 'yaml' || 
         (node.type === 'code' && node.lang === 'yaml-block');
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
      // Handle both yaml nodes and code blocks with yaml-block language
      const yamlContent = nextNode.type === 'code' ? nextNode.value : nextNode.value;
      const frontmatter = parseFrontmatter(yamlContent);
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
    const nodeSplits = [];
    const delimiterSplits = []; // For paragraphs that start with delimiters
    
    // First pass: find blockDelimiter nodes (from micromark extension)
    // These are custom nodes created by the micromark extension
    visit(tree, 'blockDelimiter', (node, index, parent) => {
      if (!parent || index === null) return;
      
      const blockType = node.data?.blockType || node.blockType;
      const isClosing = node.data?.isClosing || node.isClosing || false;
      
      if (blockType) {
        transformations.push({
          parent,
          index,
          isClosing,
          blockType,
          nodeType: 'blockDelimiter' // Mark as blockDelimiter node
        });
      }
    });
    
    // Second pass: find HTML comment delimiters (from preprocessing - fallback)
    // These are now own tokens as HTML nodes
    visit(tree, 'html', (node, index, parent) => {
      if (!parent || index === null) return;
      
      // Check if this is a block delimiter comment: <!-- block-delimiter:TYPE:open/close -->
      const match = node.value?.match(/<!--\s*block-delimiter:([a-z-]+):(open|close)\s*-->/);
      if (match) {
        const blockType = match[1];
        const isClosing = match[2] === 'close';
        
        transformations.push({
          parent,
          index,
          isClosing,
          blockType,
          nodeType: 'html' // Mark as HTML node (own token)
        });
      }
    });
    
    // Second pass: find delimiter positions in paragraphs (legacy/fallback)
    // Check paragraphs and headings (not text nodes directly, as they don't have index/parent)
    visit(tree, 'paragraph', (node, index, parent) => {
      if (!parent || index === null) return;
      
      if (!node.children || node.children.length === 0) return;
      
      // Extract text content from paragraph
      // Most paragraphs have a single text child, but some may have multiple
      const textNodes = node.children.filter(child => child.type === 'text');
      if (textNodes.length === 0) return;
      
      const text = textNodes.map(child => child.value).join('').trim();
      
      // Handle case where both delimiters are in one paragraph
      // This can happen when markdown parser combines them into a single paragraph
      const lines = text.split('\n');
      if (lines.length >= 2) {
        // Check first line for opening delimiter
        const line1Match = matchDelimiterLine(lines[0].trim());
        if (line1Match && !line1Match[1]) {
          // Check last line for closing delimiter
          const lastLineMatch = matchDelimiterLine(lines[lines.length - 1].trim());
          if (lastLineMatch && lastLineMatch[1] === '/' && lastLineMatch[2] === line1Match[2]) {
            // This is a complete block in one paragraph - split it after visit
            nodeSplits.push({
              parent,
              index,
              lines: [lines[0], lines[lines.length - 1]],
              blockType: line1Match[2],
              contentLines: lines.slice(1, -1) // Content between delimiters
            });
            return;
          }
        }
      }
      
      // Check if the paragraph starts with a delimiter line
      // The first line might be a delimiter, even if the paragraph contains more text
      if (lines.length > 0) {
        const firstLine = lines[0].trim();
        const match = matchDelimiterLine(firstLine);
        if (match && lines.length > 1) {
          // Paragraph starts with delimiter but has more content - split it after visit
          const isClosing = match[1] === '/';
          const blockType = match[2];
          
          delimiterSplits.push({
            parent,
            index,
            firstLine,
            restLines: lines.slice(1),
            isClosing,
            blockType
          });
          return;
        } else if (match) {
          // Paragraph contains only delimiter
          const isClosing = match[1] === '/';
          const blockType = match[2];
          
          transformations.push({
            parent,
            index,
            isClosing,
            blockType,
            nodeType: node.type
          });
          return;
        }
      }
      
      // Also check if the entire paragraph text is a delimiter (exact match)
      const match = matchDelimiterLine(text);
      if (match) {
        const isClosing = match[1] === '/';
        const blockType = match[2];
        
        transformations.push({
          parent,
          index,
          isClosing,
          blockType,
          nodeType: node.type
        });
      }
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
    
    // Apply delimiter splits (paragraphs that start with delimiters)
    // Process in reverse order to maintain correct indices
    for (const split of delimiterSplits.reverse()) {
      const { parent, index, firstLine, restLines, isClosing, blockType } = split;
      if (!parent || !parent.children || index >= parent.children.length || index < 0) continue;
      
      const node = parent.children[index];
      if (!node || node.type !== 'paragraph') continue;
      
      // Split paragraph: delimiter in first, rest in second
      const delimiterPara = {
        type: 'paragraph',
        children: [{ type: 'text', value: firstLine }],
        position: node.position || undefined
      };
      const restText = restLines.join('\n');
      const restPara = {
        type: 'paragraph',
        children: [{ type: 'text', value: restText }],
        position: node.position || undefined
      };
      
      // Replace original paragraph with split paragraphs
      parent.children.splice(index, 1, delimiterPara, restPara);
      
      // Add transformation for the delimiter paragraph
      transformations.push({
        parent,
        index,
        isClosing,
        blockType,
        nodeType: 'paragraph'
      });
    }
    
    // Apply node splits (after visit to avoid modifying tree during traversal)
    // Process in reverse order to maintain correct indices
    for (const split of nodeSplits.reverse()) {
      const { parent, index, lines, blockType, contentLines } = split;
      if (!parent || !parent.children || index >= parent.children.length || index < 0) continue;
      
      const node = parent.children[index];
      if (!node || !node.children || node.children.length === 0) continue; // Skip if node was already removed or invalid
      
      // Ensure we have valid text content
      const firstChild = node.children[0];
      if (!firstChild || firstChild.type !== 'text') continue;
      
      const openingPara = {
        type: 'paragraph',
        children: [{ type: 'text', value: lines[0] }],
        position: node.position || undefined
      };
      const closingPara = {
        type: 'paragraph',
        children: [{ type: 'text', value: lines[1] }],
        position: node.position || undefined
      };
      
      // Create content paragraph(s) if there's content between delimiters
      const newNodes = [openingPara];
      if (contentLines && contentLines.length > 0) {
        const contentText = contentLines.join('\n');
        if (contentText.trim()) {
          const contentPara = {
            type: 'paragraph',
            children: [{ type: 'text', value: contentText }],
            position: node.position || undefined
          };
          newNodes.push(contentPara);
        }
      }
      newNodes.push(closingPara);
      
      // Validate that parent.children is still valid before splicing
      if (parent.children && Array.isArray(parent.children) && index < parent.children.length) {
        parent.children.splice(index, 1, ...newNodes);
      } else {
        continue; // Skip if parent structure is invalid
      }
      
      // Add transformations for the split nodes
      transformations.push({
        parent,
        index,
        isClosing: false,
        blockType,
        nodeType: 'paragraph'
      });
      transformations.push({
        parent,
        index: index + newNodes.length - 1,
        isClosing: true,
        blockType,
        nodeType: 'paragraph'
      });
    }
    
    // Second pass: match opening/closing pairs and wrap content
    // Sort transformations by index to process in order
    const sortedTransformations = [...transformations].sort((a, b) => a.index - b.index);
    const stack = [];
    const wrapRanges = [];
    
    for (const t of sortedTransformations) {
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
    
    // Handle unclosed save blocks (they don't need closing delimiters)
    for (const t of transformations) {
      if (!t.isClosing && t.blockType === 'save') {
        // Check if this save block was already matched with a closing delimiter
        const alreadyMatched = wrapRanges.some(r => r.startIndex === t.index && r.blockType === 'save');
        if (!alreadyMatched) {
          // Create a wrap range that ends at the end of the parent's children
          wrapRanges.push({
            parent: t.parent,
            startIndex: t.index,
            endIndex: t.parent.children.length - 1,
            blockType: 'save'
          });
        }
      }
    }
    
    // Third pass: apply transformations (reverse order to preserve indices)
    // Since we're early in the pipeline, indices should be stable
    wrapRanges.sort((a, b) => b.startIndex - a.startIndex);
    
    for (const range of wrapRanges) {
      const { parent, startIndex, endIndex, blockType } = range;
      if (!parent || !parent.children) continue;
      const children = parent.children;
      
      // Validate indices - should be stable since we're early in pipeline
      if (startIndex >= children.length || endIndex >= children.length || startIndex < 0 || endIndex < 0) {
        console.warn(`Invalid indices for ${blockType} block: startIndex=${startIndex}, endIndex=${endIndex}, children.length=${children.length}`);
        continue;
      }
      
      // Special handling for collapse blocks with frontmatter
      if (blockType === 'collapse') {
        const titleInfo = extractTitle(children, startIndex);
        
        // Always create panel structure for collapse blocks
        // If no title found, we'll need to extract it from the content or use a default
        const panelModifier = PANEL_MODIFIERS[blockType] || 'c-project-panel--ingredient';
        
        if (titleInfo) {
          // Generate panel structure with title
          const openHTML = {
            type: 'html',
            value: `<div class="c-project-panel ${panelModifier}">\n  <h3 class="c-project-panel__heading js-project-panel__toggle">\n    ${titleInfo.title}\n  </h3>\n\n  <div class="c-project-panel__content u-hidden">`
          };
          
          const closeHTML = {
            type: 'html',
            value: '\n  </div>\n</div>'
          };
          
          // Replace opening delimiter with panel opening
          // Check if startIndex node is an HTML comment delimiter (own token)
          const startNode = children[startIndex];
          if (startNode?.type === 'html' && startNode.value?.match(/<!--\s*block-delimiter:[a-z-]+:open\s*-->/)) {
            parent.children[startIndex] = openHTML;
          } else {
            parent.children[startIndex] = openHTML;
          }
          
          // Remove frontmatter/heading if present
          if (titleInfo.frontmatterIndex !== undefined && titleInfo.frontmatterIndex < endIndex) {
            parent.children.splice(titleInfo.frontmatterIndex, 1);
            // Adjust endIndex if we removed a node before it
            const finalEndIndex = endIndex > titleInfo.frontmatterIndex ? endIndex - 1 : endIndex;
            // Check if endIndex node is an HTML comment delimiter
            const endNode = children[finalEndIndex];
            if (endNode?.type === 'html' && endNode.value?.match(/<!--\s*block-delimiter:[a-z-]+:close\s*-->/)) {
              parent.children[finalEndIndex] = closeHTML;
            } else {
              parent.children[finalEndIndex] = closeHTML;
            }
          } else {
            // Check if endIndex node is an HTML comment delimiter
            const endNode = children[endIndex];
            if (endNode?.type === 'html' && endNode.value?.match(/<!--\s*block-delimiter:[a-z-]+:close\s*-->/)) {
              parent.children[endIndex] = closeHTML;
            } else {
              parent.children[endIndex] = closeHTML;
            }
          }
          
          continue;
        } else {
          // No title found - try to extract from first heading in content
          // Look for first h2 or h3 in the content range
          let extractedTitle = null;
          let titleNodeIndex = null;
          
          for (let i = startIndex + 1; i < endIndex; i++) {
            const node = children[i];
            if (node && node.type === 'heading' && (node.depth === 2 || node.depth === 3)) {
              extractedTitle = extractTextFromNode(node);
              titleNodeIndex = i;
              break;
            }
          }
          
          // Use extracted title or default
          const title = extractedTitle || 'Panel';
          const openHTML = {
            type: 'html',
            value: `<div class="c-project-panel ${panelModifier}">\n  <h3 class="c-project-panel__heading js-project-panel__toggle">\n    ${title}\n  </h3>\n\n  <div class="c-project-panel__content u-hidden">`
          };
          
          const closeHTML = {
            type: 'html',
            value: '\n  </div>\n</div>'
          };
          
          // Replace opening delimiter with panel opening
          // Check if startIndex node is an HTML comment delimiter (own token)
          const startNode = children[startIndex];
          if (startNode?.type === 'html' && startNode.value?.match(/<!--\s*block-delimiter:[a-z-]+:open\s*-->/)) {
            parent.children[startIndex] = openHTML;
          } else {
            parent.children[startIndex] = openHTML;
          }
          
          // Remove title heading if we extracted it
          if (titleNodeIndex !== null && titleNodeIndex < endIndex) {
            parent.children.splice(titleNodeIndex, 1);
            const finalEndIndex = endIndex > titleNodeIndex ? endIndex - 1 : endIndex;
            // Check if endIndex node is an HTML comment delimiter
            const endNode = children[finalEndIndex];
            if (endNode?.type === 'html' && endNode.value?.match(/<!--\s*block-delimiter:[a-z-]+:close\s*-->/)) {
              parent.children[finalEndIndex] = closeHTML;
            } else {
              parent.children[finalEndIndex] = closeHTML;
            }
          } else {
            // Check if endIndex node is an HTML comment delimiter
            const endNode = children[endIndex];
            if (endNode?.type === 'html' && endNode.value?.match(/<!--\s*block-delimiter:[a-z-]+:close\s*-->/)) {
              parent.children[endIndex] = closeHTML;
            } else {
              parent.children[endIndex] = closeHTML;
            }
          }
          
          continue;
        }
      }
      
      // Special handling for save blocks
      if (blockType === 'save') {
        const titleInfo = extractTitle(children, startIndex);
        const panelModifier = PANEL_MODIFIERS[blockType] || 'c-project-panel--save';
        
        // Save blocks always need a heading - use extracted title or default
        const saveTitle = titleInfo?.title || 'Save your project';
        
        const openHTML = {
          type: 'html',
          value: `<div class="c-project-panel ${panelModifier}">\n  <h3 class="c-project-panel__heading">\n    ${saveTitle}\n  </h3>\n</div>`
        };
        
        // For save blocks, we replace the entire block (no content)
        parent.children[startIndex] = openHTML;
        
        // Remove frontmatter/heading if present
        if (titleInfo && titleInfo.frontmatterIndex !== undefined && titleInfo.frontmatterIndex < endIndex) {
          parent.children.splice(titleInfo.frontmatterIndex, 1);
          const finalEndIndex = endIndex > titleInfo.frontmatterIndex ? endIndex - 1 : endIndex;
          // Remove closing delimiter and all content between
          if (finalEndIndex > startIndex) {
            parent.children.splice(startIndex + 1, finalEndIndex - startIndex);
          }
        } else {
          // Remove closing delimiter if it exists (might not exist for unclosed save blocks)
          if (endIndex > startIndex && endIndex < parent.children.length) {
            parent.children.splice(endIndex, 1);
            // Remove content between
            if (endIndex > startIndex + 1) {
              parent.children.splice(startIndex + 1, endIndex - startIndex - 1);
            }
          } else if (endIndex === startIndex) {
            // Unclosed save block - just remove the delimiter paragraph
            // (already replaced above)
          }
        }
        
        continue;
      }
      
      // Default handling for other block types
      const className = BLOCK_CLASSES[blockType] || `c-block-${blockType}`;
      
      // Create opening HTML node
      const openHTML = {
        type: 'html',
        value: blockType === 'task'
          ? `<div class="${className}">\n<input class="c-project-task__checkbox" type="checkbox" aria-label="Mark this task as complete" />\n<div class="c-project-task__body">`
          : `<div class="${className}">`
      };
      
      // Create closing HTML node
      const closeHTML = {
        type: 'html',
        value: blockType === 'task'
          ? '</div>\n</div>'
          : '</div>'
      };
      
      // Replace delimiter nodes with HTML
      // Nodes can be blockDelimiter nodes (from micromark extension), HTML comments (from preprocessing), paragraphs, headings, or other types
      const startNode = children[startIndex];
      const endNode = children[endIndex];
      
      // Check if nodes are blockDelimiter nodes (from micromark extension)
      const isStartBlockDelimiter = startNode?.type === 'blockDelimiter' && 
        !(startNode.data?.isClosing || startNode.isClosing);
      const isEndBlockDelimiter = endNode?.type === 'blockDelimiter' && 
        (endNode.data?.isClosing || endNode.isClosing);
      
      // Check if nodes are HTML comment delimiters (own tokens from preprocessing)
      const isStartHtmlDelimiter = startNode?.type === 'html' && 
        startNode.value?.match(/<!--\s*block-delimiter:[a-z-]+:open\s*-->/);
      const isEndHtmlDelimiter = endNode?.type === 'html' && 
        endNode.value?.match(/<!--\s*block-delimiter:[a-z-]+:close\s*-->/);
      
      // Prefer blockDelimiter nodes over HTML comments (micromark extension takes precedence)
      if (isStartBlockDelimiter && isEndBlockDelimiter) {
        // Both are blockDelimiter nodes - simple replacement
        parent.children[startIndex] = openHTML;
        parent.children[endIndex] = closeHTML;
        continue;
      }
      
      if (isStartHtmlDelimiter && isEndHtmlDelimiter) {
        // Both are HTML comment delimiters - simple replacement
        parent.children[startIndex] = openHTML;
        parent.children[endIndex] = closeHTML;
        continue;
      }
      
      // Also check if start/end nodes are HTML comment delimiters individually
      if (isStartHtmlDelimiter && !isEndHtmlDelimiter) {
        // Start is HTML comment, but end is not - try to find end in children
        parent.children[startIndex] = openHTML;
        // Continue to process end node below
      }
      if (isEndHtmlDelimiter && !isStartHtmlDelimiter) {
        // End is HTML comment, but start is not - try to find start in children
        parent.children[endIndex] = closeHTML;
        // Continue to process start node below
      }
      
      // Fallback: Check if start node contains delimiter text (might be in paragraph, heading, or text node)
      let startNodeIsDelimiter = false;
      let startNodeNeedsSplit = false;
      if (startNode) {
        if (startNode.type === 'paragraph' || startNode.type === 'heading') {
          const text = extractTextFromNode(startNode);
          const lines = text.split('\n');
          // Check if first line is a delimiter (paragraphs can contain delimiter + content)
          if (lines.length > 0 && matchDelimiterLine(lines[0].trim())) {
            startNodeIsDelimiter = true;
            if (lines.length > 1) {
              startNodeNeedsSplit = true;
            }
          } else if (matchDelimiterLine(text.trim())) {
            // Also check entire text as fallback
            startNodeIsDelimiter = true;
          }
        } else if (startNode.type === 'text') {
          if (matchDelimiterLine(startNode.value.trim())) {
            startNodeIsDelimiter = true;
          }
        }
      }
      
      // Check if end node contains delimiter text
      let endNodeIsDelimiter = false;
      let endNodeNeedsSplit = false;
      if (endNode) {
        if (endNode.type === 'paragraph' || endNode.type === 'heading') {
          const text = extractTextFromNode(endNode);
          const lines = text.split('\n');
          // Check if first line is a delimiter, or if last line is a closing delimiter
          if (lines.length > 0) {
            const firstLineMatch = matchDelimiterLine(lines[0].trim());
            const lastLineMatch = lines.length > 1 ? matchDelimiterLine(lines[lines.length - 1].trim()) : null;
            if (firstLineMatch || lastLineMatch) {
              endNodeIsDelimiter = true;
              if ((firstLineMatch && lines.length > 1) || (lastLineMatch && lines.length > 1)) {
                endNodeNeedsSplit = true;
              }
            }
          }
          if (!endNodeIsDelimiter && matchDelimiterLine(text.trim())) {
            // Also check entire text as fallback
            endNodeIsDelimiter = true;
          }
        } else if (endNode.type === 'text') {
          if (matchDelimiterLine(endNode.value.trim())) {
            endNodeIsDelimiter = true;
          }
        }
      }
      
      // Split nodes if needed (delimiter + content in same node)
      if (startNodeNeedsSplit && startNode.type === 'paragraph') {
        const text = extractTextFromNode(startNode);
        const lines = text.split('\n');
        const delimiterLine = lines[0];
        const restText = lines.slice(1).join('\n');
        
        const delimiterPara = {
          type: 'paragraph',
          children: [{ type: 'text', value: delimiterLine }],
          position: startNode.position
        };
        const restPara = {
          type: 'paragraph',
          children: [{ type: 'text', value: restText }],
          position: startNode.position
        };
        
        parent.children.splice(startIndex, 1, delimiterPara, restPara);
        // Adjust endIndex if it was after startIndex
        if (endIndex > startIndex) {
          endIndex++;
        }
      }
      
      if (endNodeNeedsSplit && endNode.type === 'paragraph') {
        const text = extractTextFromNode(endNode);
        const lines = text.split('\n');
        const delimiterLine = lines[lines.length - 1];
        const restText = lines.slice(0, -1).join('\n');
        
        const restPara = {
          type: 'paragraph',
          children: [{ type: 'text', value: restText }],
          position: endNode.position
        };
        const delimiterPara = {
          type: 'paragraph',
          children: [{ type: 'text', value: delimiterLine }],
          position: endNode.position
        };
        
        parent.children.splice(endIndex, 1, restPara, delimiterPara);
        // endIndex now points to the delimiter paragraph
        endIndex++;
      }
      
      // Replace if nodes are delimiters
      if (startNodeIsDelimiter) {
        parent.children[startIndex] = openHTML;
      } else {
        console.warn(`Cannot replace opening delimiter at index ${startIndex} - node type: ${startNode?.type}, text: ${extractTextFromNode(startNode)?.substring(0, 100)}`);
        continue;
      }
      
      if (endNodeIsDelimiter) {
        parent.children[endIndex] = closeHTML;
      } else {
        console.warn(`Cannot replace closing delimiter at index ${endIndex} - node type: ${endNode?.type}, text: ${extractTextFromNode(endNode)?.substring(0, 100)}`);
        continue;
      }
      
      // Update index shift: we replaced 2 nodes (opening and closing) with 2 HTML nodes, so no shift
      // But if we had to search for the closing delimiter, we might have a different shift
    }
  };
}
