/**
 * Rehype plugin to copy language class from code to pre tags
 * 
 * This ensures that <pre> tags have the language class (e.g., "language-python")
 * which is needed for syntax highlighting and CSS styling.
 */

import { visit } from 'unist-util-visit';

export default function rehypeCodePreClass() {
  return (tree) => {
    visit(tree, 'element', (node) => {
      // Find <pre> elements
      if (node.tagName === 'pre') {
        // Look for a <code> child with a language class
        const codeChild = node.children?.find(
          child => child.type === 'element' && child.tagName === 'code'
        );
        
        if (codeChild && codeChild.properties?.className) {
          const classes = Array.isArray(codeChild.properties.className)
            ? codeChild.properties.className
            : [codeChild.properties.className];
          
          // Find language-* class
          const languageClass = classes.find(cls => 
            typeof cls === 'string' && cls.startsWith('language-')
          );
          
          if (languageClass) {
            // Add language class to <pre> tag
            if (!node.properties.className) {
              node.properties.className = [];
            }
            const preClasses = Array.isArray(node.properties.className)
              ? node.properties.className
              : [node.properties.className];
            
            // Only add if not already present
            if (!preClasses.includes(languageClass)) {
              node.properties.className = [...preClasses, languageClass];
            }
          }
        }
      }
    });
  };
}

