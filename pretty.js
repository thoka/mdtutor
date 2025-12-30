import { readFileSync } from 'fs';
const html = readFileSync('debug-only.html', 'utf-8');
console.log(html.replace(/></g, '>\n<'));
