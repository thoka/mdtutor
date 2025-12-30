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
        const hasOnlyText = node.children.every(child => 
          child.type === 'text' || (child.type === 'element' && child.tagName === 'br')
        );
        
        if (hasOnlyText && node.children.some(child => child.type === 'text' && child.value.trim().length > 0)) {
          // Wrap all children in a <p>
          node.children = [
            {
              type: 'element',
              tagName: 'p',
              properties: {},
              children: node.children
            }
          ];
        }
      }

      // 2. Parse inline markdown and smart quotes in text nodes
      if (['p', 'span', 'div', 'li', 'strong', 'em', 'a', 'h1', 'h2', 'h3'].includes(node.tagName) && node.children) {
        const newChildren = [];
        
        for (let i = 0; i < node.children.length; i++) {
          const child = node.children[i];
          
          if (child.type === 'text') {
            let text = child.value;

            // 3. Smart quotes (legacy quirk)
            // Replace ' with smart quotes
            text = text.replace(/'([^']+)'/g, '‘$1’');
            // Replace 's with ’s
            text = text.replace(/(\w)'s/g, '$1’s');
            // Replace 't with ’t
            text = text.replace(/(\w)'t/g, '$1’t');
            // Replace 're with ’re
            text = text.replace(/(\w)'re/g, '$1’re');
            // Replace 've with ’ve
            text = text.replace(/(\w)'ve/g, '$1’ve');
            // Replace 'll with ’ll
            text = text.replace(/(\w)'ll/g, '$1’ll');
            // Replace 'd with ’d
            text = text.replace(/(\w)'d/g, '$1’d');
            // Replace 'm with ’m
            text = text.replace(/(\w)'m/g, '$1’m');

            // 4. Manual parsing of inline markdown (bold and code)
            // This is needed because content inside raw HTML blocks isn't always parsed by remark
            const parts = text.split(/(\*\*.*?\*\*|__.*?__|`.*?`\{:class="[^"]+"\}|`.*?`)/g);
            
            if (parts.length > 1) {
              for (const part of parts) {
                if ((part.startsWith('**') && part.endsWith('**')) || (part.startsWith('__') && part.endsWith('__'))) {
                  newChildren.push({
                    type: 'element',
                    tagName: 'strong',
                    properties: {},
                    children: [{ type: 'text', value: part.slice(2, -2) }]
                  });
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
                  newChildren.push({ type: 'text', value: part });
                }
              }
              continue;
            } else {
              child.value = text;
            }
          }

          // 4. Handle {:class="..."} after inline code
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
