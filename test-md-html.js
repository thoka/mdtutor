import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeRaw from 'rehype-raw';
import rehypeStringify from 'rehype-stringify';

const md = `<div style="color: red">**Bold**</div>`;

const processor = unified()
  .use(remarkParse)
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeRaw)
  .use(rehypeStringify);

const result = await processor.process(md);
console.log('Original:', String(result));

const mdWithNewlines = `<div style="color: red">

**Bold**

</div>`;

const result2 = await processor.process(mdWithNewlines);
console.log('With Newlines:', String(result2));
