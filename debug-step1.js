import { getProjectData } from './packages/api-server/src/server.js';
import { extractHtmlStructure } from './packages/parser/test/test-utils.js';

async function debug() {
  const data = await getProjectData('silly-eyes', 'de-DE');
  const step1 = data.steps[1];
  const structure = extractHtmlStructure(step1.content);
  
  console.log('API Step 1 Structure:');
  console.log(JSON.stringify(structure.root, (key, value) => {
    if (key === 'children' && Array.isArray(value)) {
      return value.map(c => {
        let s = c.tag;
        if (c.id) s += '#' + c.id;
        if (c.classes && c.classes.length) s += '.' + c.classes.join('.');
        return s;
      });
    }
    return value;
  }, 2));
}

debug();
