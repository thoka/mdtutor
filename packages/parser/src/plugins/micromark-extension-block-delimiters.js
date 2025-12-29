/**
 * Micromark extension for block delimiters
 * Recognizes --- TYPE --- and --- /TYPE --- syntax
 * 
 * Similar to micromark-extension-directive, but for --- TYPE --- syntax
 */

import { codes } from 'micromark-util-symbol';

/**
 * Create a micromark extension for block delimiters
 * 
 * @returns {import('micromark-util-types').Extension} Micromark extension
 */
export function blockDelimiters() {
  return {
    flow: {
      [codes.dash]: {
        name: 'blockDelimiter',
        tokenize: tokenizeBlockDelimiter,
        resolve: resolveBlockDelimiter
      }
    }
  };
}

/**
 * Tokenize block delimiter syntax: --- TYPE --- or --- /TYPE ---
 * 
 * @param {import('micromark-util-types').Effects} effects
 * @param {import('micromark-util-types').State} ok
 * @param {import('micromark-util-types').State} nok
 * @returns {import('micromark-util-types').State}
 */
function tokenizeBlockDelimiter(effects, ok, nok) {
  const self = this;
  let type = '';
  let isClosing = false;
  let dashCount = 0;
  
  // Initialize containerState if needed
  if (!self.containerState) {
    self.containerState = {};
  }
  
  return start;
  
  function start(code) {
    // We're already at the first dash (code === codes.dash)
    // Check if we have --- (three dashes)
    if (code !== codes.dash) return nok(code);
    
    dashCount = 1;
    effects.enter('blockDelimiterMarker');
    effects.consume(code);
    return afterFirstDash;
  }
  
  function afterFirstDash(code) {
    if (code === codes.dash) {
      dashCount++;
      effects.consume(code);
      if (dashCount === 3) {
        return afterThreeDashes;
      }
      return afterFirstDash;
    }
    effects.exit('blockDelimiterMarker');
    return nok(code);
  }
  
  function afterThreeDashes(code) {
    // After ---, expect whitespace
    if (code === codes.space || code === codes.tab) {
      effects.consume(code);
      effects.exit('blockDelimiterMarker');
      return beforeType;
    }
    // Allow newline after --- (some files have newlines)
    if (code === codes.lineFeed || code === codes.carriageReturn) {
      effects.consume(code);
      effects.exit('blockDelimiterMarker');
      return beforeType;
    }
    effects.exit('blockDelimiterMarker');
    return nok(code);
  }
  
  function beforeType(code) {
    // Check for closing delimiter: /
    if (code === codes.slash) {
      isClosing = true;
      effects.enter('blockDelimiterMarker');
      effects.consume(code);
      effects.exit('blockDelimiterMarker');
      // Skip whitespace after /
      return skipWhitespace;
    }
    
    // Start reading type name
    if (code === codes.space || code === codes.tab) {
      effects.consume(code);
      return beforeType;
    }
    
    if (code === null || code === codes.eof || code === codes.lineFeed || code === codes.carriageReturn) {
      return nok(code);
    }
    
    // Start of type name
    effects.enter('blockDelimiterName');
    effects.consume(code);
    type += String.fromCharCode(code);
    return inType;
  }
  
  function skipWhitespace(code) {
    if (code === codes.space || code === codes.tab) {
      effects.consume(code);
      return skipWhitespace;
    }
    
    // Start reading type name after /
    if (code === null || code === codes.eof || code === codes.lineFeed || code === codes.carriageReturn) {
      return nok(code);
    }
    
    effects.enter('blockDelimiterName');
    effects.consume(code);
    type += String.fromCharCode(code);
    return inType;
  }
  
  function inType(code) {
    // Type name can contain letters, numbers, and hyphens
    if (
      (code >= codes.digit0 && code <= codes.digit9) ||
      (code >= codes.lowercaseA && code <= codes.lowercaseZ) ||
      code === codes.dash
    ) {
      effects.consume(code);
      type += String.fromCharCode(code);
      return inType;
    }
    
    // End of type name - expect whitespace and closing ---
    if (code === codes.space || code === codes.tab) {
      effects.exit('blockDelimiterName');
      effects.consume(code);
      return beforeClosingDashes;
    }
    
    return nok(code);
  }
  
  function beforeClosingDashes(code) {
    // Expect --- to close
    if (code === codes.dash) {
      dashCount = 1;
      effects.enter('blockDelimiterMarker');
      effects.consume(code);
      return inClosingDashes;
    }
    
    // Allow optional whitespace
    if (code === codes.space || code === codes.tab) {
      effects.consume(code);
      return beforeClosingDashes;
    }
    
    return nok(code);
  }
  
  function inClosingDashes(code) {
    if (code === codes.dash) {
      dashCount++;
      effects.consume(code);
      if (dashCount === 3) {
        effects.exit('blockDelimiterMarker');
        // Create the token with metadata stored in the token
        effects.enter('blockDelimiter');
        // Store metadata - will be accessible in mdast handler
        const token = {
          type: 'blockDelimiter',
          blockType: type,
          isClosing: isClosing
        };
        // Attach metadata to token context
        if (!self.containerState) {
          self.containerState = {};
        }
        self.containerState.blockDelimiter = {
          blockType: type,
          isClosing: isClosing
        };
        effects.exit('blockDelimiter');
        
        return ok;
      }
      return inClosingDashes;
    }
    
    return nok(code);
  }
}

/**
 * Resolve block delimiter tokens
 * 
 * @param {import('micromark-util-types').Event[]} events
 * @param {import('micromark-util-types').TokenizeContext} context
 * @returns {void}
 */
function resolveBlockDelimiter(events, context) {
  // This can be used to post-process tokens if needed
  // For now, we just pass through
}

