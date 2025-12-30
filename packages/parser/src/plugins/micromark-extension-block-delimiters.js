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
  let type = '';
  let isClosing = false;
  let dashCount = 0;
  let mainToken;
  
  return start;
  
  function start(code) {
    if (code !== codes.dash) return nok(code);
    
    mainToken = effects.enter('blockDelimiter');
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
        effects.exit('blockDelimiterMarker');
        return afterThreeDashes;
      }
      return afterFirstDash;
    }
    effects.exit('blockDelimiterMarker');
    return nok(code);
  }
  
  function afterThreeDashes(code) {
    if (code === codes.space || code === codes.tab) {
      effects.consume(code);
      return afterThreeDashes;
    }
    if (code === codes.slash) {
      isClosing = true;
      effects.enter('blockDelimiterMarker');
      effects.consume(code);
      effects.exit('blockDelimiterMarker');
      return afterThreeDashes;
    }
    if (
      (code >= codes.digit0 && code <= codes.digit9) ||
      (code >= codes.lowercaseA && code <= codes.lowercaseZ) ||
      code === codes.dash
    ) {
      effects.enter('blockDelimiterName');
      effects.consume(code);
      type += String.fromCharCode(code);
      return inType;
    }
    return nok(code);
  }
  
  function inType(code) {
    if (
      (code >= codes.digit0 && code <= codes.digit9) ||
      (code >= codes.lowercaseA && code <= codes.lowercaseZ) ||
      code === codes.dash
    ) {
      effects.consume(code);
      type += String.fromCharCode(code);
      return inType;
    }
    effects.exit('blockDelimiterName');
    return afterType;
  }
  
  function afterType(code) {
    if (code === codes.space || code === codes.tab) {
      effects.consume(code);
      return afterType;
    }
    if (code === codes.dash) {
      dashCount = 1;
      effects.enter('blockDelimiterMarker');
      effects.consume(code);
      return inClosingDashes;
    }
    return nok(code);
  }
  
  function inClosingDashes(code) {
    if (code === codes.dash) {
      dashCount++;
      effects.consume(code);
      if (dashCount === 3) {
        effects.exit('blockDelimiterMarker');
        mainToken.blockType = type;
        mainToken.isClosing = isClosing;
        return afterClosingDashes;
      }
      return inClosingDashes;
    }
    return nok(code);
  }

  function afterClosingDashes(code) {
    if (code === codes.space || code === codes.tab) {
      effects.consume(code);
      return afterClosingDashes;
    }
    if (code === codes.lineFeed || code === codes.carriageReturn || code === null) {
      effects.exit('blockDelimiter');
      return ok(code);
    }
    return nok(code);
  }
}

/**
 * Resolve block delimiter tokens
 * 
 * @param {import('micromark-util-types').Event[]} events
 * @param {import('micromark-util-types').TokenizeContext} context
 * @returns {import('micromark-util-types').Event[]}
 */
function resolveBlockDelimiter(events, _context) {
  // Micromark expects resolve functions to return the events array
  // If events is undefined or not an array, return empty array
  if (!events || !Array.isArray(events)) {
    return [];
  }
  return events;
}

