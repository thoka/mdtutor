/**
 * MDast utility to convert blockDelimiter tokens to MDAST nodes
 * 
 * This converts the blockDelimiter tokens created by the micromark extension
 * into MDAST nodes that can be processed by remark plugins.
 */

/**
 * Create a mdast-util-from-markdown handler for blockDelimiter tokens
 * 
 * @returns {import('mdast-util-from-markdown').Handle} Handler function
 */
export function blockDelimitersFromMarkdown() {
  return {
    enter: {
      blockDelimiter: enterBlockDelimiter
    },
    exit: {
      blockDelimiter: exitBlockDelimiter
    }
  };
}

/**
 * Enter a blockDelimiter token
 * 
 * @param {import('mdast-util-from-markdown').Token} token
 */
function enterBlockDelimiter(token) {
  // Create a custom MDAST node
  // At this point, we don't know the type/closing state yet
  const node = {
    type: 'blockDelimiter',
    data: {}
  };
  
  this.enter(node, token);
}

/**
 * Exit a blockDelimiter token
 * 
 * @param {import('mdast-util-from-markdown').Token} token
 */
function exitBlockDelimiter(token) {
  const node = this.stack[this.stack.length - 1];
  
  // Set the properties that were discovered during tokenization
  node.data.blockType = token.blockType || '';
  node.data.isClosing = token.isClosing || false;
  
  this.exit(token);
}

