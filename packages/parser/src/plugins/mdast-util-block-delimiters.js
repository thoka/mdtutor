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
 * @param {import('mdast-util-from-markdown').State} state
 */
function enterBlockDelimiter(token, state) {
  // Get metadata from token or containerState
  // The metadata is stored in containerState by the micromark extension
  const containerState = state.containerState || {};
  const blockDelimiterData = containerState.blockDelimiter || {};
  const blockType = blockDelimiterData.blockType || token.blockType || '';
  const isClosing = blockDelimiterData.isClosing !== undefined 
    ? blockDelimiterData.isClosing 
    : (token.isClosing || false);
  
  // Create a custom MDAST node
  const node = {
    type: 'blockDelimiter',
    data: {
      blockType: blockType,
      isClosing: isClosing
    }
  };
  
  state.enter(node, token);
  
  // Clear the containerState after use
  if (containerState.blockDelimiter) {
    delete containerState.blockDelimiter;
  }
}

/**
 * Exit a blockDelimiter token
 * 
 * @param {import('mdast-util-from-markdown').Token} token
 * @param {import('mdast-util-from-markdown').State} state
 */
function exitBlockDelimiter(token, state) {
  state.exit(token);
}

