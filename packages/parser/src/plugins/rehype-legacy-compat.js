import { visit } from 'unist-util-visit';

/**
 * Rehype plugin to provide compatibility with legacy parser quirks:
 * 1. Wrap text nodes in <p> if they are direct children of <div> and are the only content
 * 2. Parse inline markdown (**bold**, __bold__) in text nodes inside certain tags
 */
export default function rehypeLegacyCompat() {
  return (tree) => {
    visit(tree, 'element', (node) => {
      // 1. Wrap text nodes in <p> if they are direct children of <div>
      // Legacy parser seems to do this for content inside <div>
      if (node.tagName === 'div' && node.children) {
        const newChildren = [];
        let currentParagraph = null;

        for (const child of node.children) {
          // Inline elements that should be wrapped in <p> if they are direct children of <div>
          const isInline = child.type === 'text' || 
                          (child.type === 'element' && ['span', 'strong', 'em', 'code', 'a', 'br', 'img'].includes(child.tagName));
          
          if (isInline) {
            // Skip leading whitespace outside paragraph
            if (child.type === 'text' && child.value.trim() === '' && !currentParagraph) {
              newChildren.push(child);
              continue;
            }
            
            if (!currentParagraph) {
              // Trim leading newlines/spaces from the first text node in a paragraph
              if (child.type === 'text') {
                child.value = child.value.replace(/^\s+/, '');
                if (child.value === '') continue;
              }
              
              currentParagraph = {
                type: 'element',
                tagName: 'p',
                properties: {},
                children: []
              };
              newChildren.push(currentParagraph);
            }
            currentParagraph.children.push(child);
          } else {
            // Trim trailing newlines/spaces from the last text node in the previous paragraph
            if (currentParagraph && currentParagraph.children.length > 0) {
              const lastChild = currentParagraph.children[currentParagraph.children.length - 1];
              if (lastChild.type === 'text') {
                lastChild.value = lastChild.value.replace(/\s+$/, '');
              }
            }
            currentParagraph = null;
            newChildren.push(child);
          }
        }
        
        // Final trim for the last paragraph if it exists
        if (currentParagraph && currentParagraph.children.length > 0) {
          const lastChild = currentParagraph.children[currentParagraph.children.length - 1];
          if (lastChild.type === 'text') {
            lastChild.value = lastChild.value.replace(/\s+$/, '');
          }
        }
        
        node.children = newChildren;
      }

      // 2. Parse inline markdown and smart quotes in text nodes
      if (['p', 'span', 'div', 'li', 'strong', 'em', 'a', 'h1', 'h2', 'h3'].includes(node.tagName) && node.children) {
        // Skip smart quotes for panel headings (legacy quirk)
        const isPanelHeading = node.tagName === 'h3' && 
                               node.properties && 
                               node.properties.className && 
                               Array.isArray(node.properties.className) && 
                               node.properties.className.includes('c-project-panel__heading');

        const newChildren = [];
        
        for (let i = 0; i < node.children.length; i++) {
          const child = node.children[i];
          
          if (child.type === 'text') {
            let text = child.value;
            // 4. Manual parsing of inline markdown (bold, links, and code)
            // This is needed because content inside raw HTML blocks isn't always parsed by remark
            const parts = text.split(/(\*\*.*?\*\*|__.*?__|\[.*?\]\(.*?\)\{:target=".*?"\}|\[.*?\]\(.*?\)|`.*?`\{:class="[^"]+"\}|`.*?`)/g);
            
            if (parts.length > 1) {
              for (const part of parts) {
                if ((part.startsWith('**') && part.endsWith('**')) || (part.startsWith('__') && part.endsWith('__'))) {
                  newChildren.push({
                    type: 'element',
                    tagName: 'strong',
                    properties: {},
                    children: [{ type: 'text', value: part.slice(2, -2) }]
                  });
                } else if (part.startsWith('[') && part.includes('](')) {
                  // Handle links like [text](url) or [text](url){:target="_blank"}
                  const linkMatch = part.match(/\[(.*?)\]\((.*?)\)(\{:target="(.*?)"\})?/);
                  if (linkMatch) {
                    const properties = { href: linkMatch[2] };
                    if (linkMatch[4]) {
                      properties.target = linkMatch[4];
                    }
                    newChildren.push({
                      type: 'element',
                      tagName: 'a',
                      properties,
                      children: [{ type: 'text', value: linkMatch[1] }]
                    });
                  }
                } else if (part.startsWith('`') && part.includes('`{:class="')) {
                  const codeMatch = part.match(/`(.*?)`\{:class="(.*?)"\}/);
                  if (codeMatch) {
                    newChildren.push({
                      type: 'element',
                      tagName: 'code',
                      properties: { className: [codeMatch[2]] },
                      children: [{ type: 'text', value: codeMatch[1] }]
                    });
                  }
                } else if (part.startsWith('`') && part.endsWith('`')) {
                  newChildren.push({
                    type: 'element',
                    tagName: 'code',
                    properties: {},
                    children: [{ type: 'text', value: part.slice(1, -1) }]
                  });
                } else if (part.length > 0) {
                  let partValue = part;
                  if (!isPanelHeading) {
                    // 3. Smart quotes (legacy quirk)
                    // Apply ONLY to non-markdown parts to avoid breaking attributes like {:class="..."}
                    partValue = partValue.replace(/"([^"]+)"/g, '“$1”');
                    partValue = partValue.replace(/'([^']+)'/g, '‘$1’');
                    partValue = partValue.replace(/(\w)'s/g, '$1’s');
                    partValue = partValue.replace(/(\w)'t/g, '$1’t');
                    partValue = partValue.replace(/(\w)'re/g, '$1’re');
                    partValue = partValue.replace(/(\w)'ve/g, '$1’ve');
                    partValue = partValue.replace(/(\w)'ll/g, '$1’ll');
                    partValue = partValue.replace(/(\w)'d/g, '$1’d');
                    partValue = partValue.replace(/(\w)'m/g, '$1’m');
                  }
                  newChildren.push({ type: 'text', value: partValue });
                }
              }
              continue;
            } else {
              if (!isPanelHeading) {
                text = text.replace(/"([^"]+)"/g, '“$1”');
                text = text.replace(/'([^']+)'/g, '‘$1’');
                text = text.replace(/(\w)'s/g, '$1’s');
                text = text.replace(/(\w)'t/g, '$1’t');
                text = text.replace(/(\w)'re/g, '$1’re');
                text = text.replace(/(\w)'ve/g, '$1’ve');
                text = text.replace(/(\w)'ll/g, '$1’ll');
                text = text.replace(/(\w)'d/g, '$1’d');
                text = text.replace(/(\w)'m/g, '$1’m');
              }
              child.value = text;
            }
          }

          // 5. Handle {:class="..."} after inline code
          if (child.type === 'element' && child.tagName === 'code') {
            const nextChild = node.children[i + 1];
            if (nextChild && nextChild.type === 'text') {
              const match = nextChild.value.match(/^\{:class="([^"]+)"\}/);
              if (match) {
                const className = match[1];
                child.properties = child.properties || {};
                child.properties.className = child.properties.className || [];
                if (typeof child.properties.className === 'string') {
                  child.properties.className = [child.properties.className];
                }
                child.properties.className.push(className);
                
                // Remove the attribute from the next text node
                nextChild.value = nextChild.value.replace(/^\{:class="([^"]+)"\}/, '');
              }
            }
          }

          newChildren.push(child);
        }
        node.children = newChildren;
      }
    });
  };
}
