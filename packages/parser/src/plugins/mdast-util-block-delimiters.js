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
  // Get metadata from containerState
  // The metadata is stored in containerState by the micromark extension
  // Note: containerState is shared across all tokens in the same document
  const containerState = state.containerState || {};
  const blockDelimiterData = containerState.blockDelimiter || {};
  const blockType = blockDelimiterData.blockType || '';
  const isClosing = blockDelimiterData.isClosing || false;
  
  // Create a custom MDAST node
  const node = {
    type: 'blockDelimiter',
    data: {
      blockType: blockType,
      isClosing: isClosing
    }
  };
  
  state.enter(node, token);
  
  // Clear the containerState after use (so next delimiter can set it)
  // But only if we successfully read the data
  if (blockDelimiterData.blockType) {
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

