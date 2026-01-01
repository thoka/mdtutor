import { visit } from 'unist-util-visit';
import { getTranslation } from '../utils/i18n.js';

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
 * Remark plugin to transform blockDelimiter nodes into nested containers
 */
export default function remarkBlockContainers(options = {}) {
  const languages = options.languages || ['en'];

  return (tree) => {
    // 1. Flatten the tree to handle nested blockDelimiters (e.g. inside paragraphs)
    const flattenedChildren = [];
    
    for (const node of tree.children) {
      if (node.type === 'paragraph' && node.children.some(c => c.type === 'blockDelimiter')) {
        // Split paragraph by blockDelimiter
        let currentParagraphChildren = [];
        for (const child of node.children) {
          if (child.type === 'blockDelimiter') {
            if (currentParagraphChildren.length > 0) {
              flattenedChildren.push({
                type: 'paragraph',
                children: currentParagraphChildren
              });
              currentParagraphChildren = [];
            }
            flattenedChildren.push(child);
          } else {
            currentParagraphChildren.push(child);
          }
        }
        if (currentParagraphChildren.length > 0) {
          flattenedChildren.push({
            type: 'paragraph',
            children: currentParagraphChildren
          });
        }
      } else {
        flattenedChildren.push(node);
      }
    }

    const stack = [];
    const rootChildren = [];
    
    // Initial state: root container
    stack.push({ children: rootChildren });

    for (let i = 0; i < flattenedChildren.length; i++) {
      const node = flattenedChildren[i];
      
      if (node.type === 'blockDelimiter') {
        const { blockType, isClosing } = node.data || {};
        
        if (!isClosing) {
          // Start a new container
          const container = {
            type: 'blockContainer',
            data: {
              hName: 'div',
              hProperties: {
                className: [BLOCK_CLASSES[blockType] || blockType]
              }
            },
            children: []
          };
          
          // Special handling for collapse/save panels
          if (blockType === 'collapse') {
            container.data.hProperties.className.push('c-project-panel--ingredient');
          } else if (blockType === 'save') {
            container.data.hProperties.className.push('c-project-panel--save');
          }

          // Add to current parent
          stack[stack.length - 1].children.push(container);
          // Push to stack to become the new parent
          stack.push(container);
        } else {
          // End current container
          if (stack.length > 1) {
            stack.pop();
          }
        }
      } else {
        // Regular node - add to current parent
        stack[stack.length - 1].children.push(node);
      }
    }
    
    // Update tree children
    tree.children = rootChildren;

    // Second pass: handle special content like titles for panels
    visit(tree, 'blockContainer', (node) => {
      const className = node.data?.hProperties?.className || [];
      if (className.includes('c-project-panel')) {
        processPanel(node, languages);
      }
      if (className.includes('c-project-task')) {
        processTask(node, languages);
      }
    });
  };
}

/**
 * Process a panel (collapse/save) to extract title and wrap body
 */
function processPanel(node, languages) {
  const children = node.children;
  let title = getTranslation('hint', languages); // Default title
  let bodyStartIndex = 0;

  // 1. Check for YAML frontmatter at the start
  if (children.length > 0 && children[0].type === 'yaml') {
    try {
      // Simple regex-based YAML parsing for title
      const yamlValue = children[0].value;
      const titleMatch = yamlValue.match(/title:\s*(.+)/);
      if (titleMatch) {
        title = titleMatch[1].trim().replace(/^["']|["']$/g, '');
      }
      bodyStartIndex = 1;
    } catch {
      // Ignore parsing errors
    }
  }

  // 2. Create panel structure
  const className = node.data?.hProperties?.className || [];
  const isSavePanel = className.includes('c-project-panel--save');
  
  if (isSavePanel && (title === 'Hint' || title === 'Hinweis')) {
    title = getTranslation('save_project', languages);
  }

  const headingClasses = ['c-project-panel__heading'];
  if (!isSavePanel) {
    headingClasses.push('js-project-panel__toggle');
  }

  const heading = {
    type: 'heading',
    depth: 3,
    data: {
      hProperties: { 
        className: headingClasses 
      }
    },
    children: [{ type: 'text', value: title }]
  };

  if (isSavePanel) {
    node.children = [heading];
    node.data.hName = 'div';
    node.data.hProperties = { className };
    return;
  }

  const body = {
    type: 'blockContainerBody',
    data: {
      hName: 'div',
      hProperties: { 
        className: ['c-project-panel__content', 'u-hidden'] 
      }
    },
    children: children.slice(bodyStartIndex)
  };

  node.children = [heading, body];
}

/**
 * Process a task to add checkbox and wrap body
 */
function processTask(node, languages) {
  const children = node.children;

  const checkbox = {
    type: 'html',
    value: `<input type="checkbox" class="c-project-task__checkbox" aria-label="${getTranslation('mark_complete', languages)}" />`
  };

  const body = {
    type: 'blockContainerBody',
    data: {
      hName: 'div',
      hProperties: { className: ['c-project-task__body'] }
    },
    children: children
  };

  node.children = [checkbox, body];
}

