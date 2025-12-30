/**
 * Remark plugin to resolve transclusions
 * Converts [[[project-name]]] to embedded panel content
 */

import { visit } from 'unist-util-visit';
import { parseProject } from '../parse-project.js';
import { join } from 'path';

/**
 * Parse transclusion syntax: [[[project-name]]]
 * 
 * Options:
 * - basePath: Base directory containing projects (default: auto-detect from current project)
 * - cache: Cache parsed projects to avoid re-parsing (default: new Map())
 * - languages: Preferred languages for transclusions (default: ['en'])
 */
export default function remarkTransclusion(options = {}) {
  const cache = options.cache || new Map();
  const preferredLanguages = options.languages || ['en'];
  
  return async (tree, file) => {
    const promises = [];
    
    visit(tree, 'paragraph', (node, index, parent) => {
      if (!parent || index === null) return;
      
      // Check if paragraph contains only a transclusion
      const child = node.children[0];
      if (node.children.length !== 1 || child.type !== 'text') return;
      
      const match = child.value.match(/^\[\[\[([a-z0-9-]+)\]\]\]$/);
      if (!match) return;
      
      const projectName = match[1];
      
      // Create async task to load and embed content
      const promise = (async () => {
        try {
          // Determine base path
          let basePath = options.basePath;
          if (!basePath && file.history && file.history[0]) {
            // Auto-detect: go up from current file to snapshots directory
            const currentFile = file.history[0];
            const parts = currentFile.split('/');
            const snapshotsIndex = parts.indexOf('snapshots');
            if (snapshotsIndex !== -1) {
              basePath = parts.slice(0, snapshotsIndex + 1).join('/');
            }
          }
          
          if (!basePath) {
            console.warn(`Cannot resolve basePath for transclusion: ${projectName}`);
            return;
          }
          
          // Load project (with caching and language fallback)
          const repoPath = join(basePath, projectName, 'repo');
          
          let projectData;
          const cacheKey = `${projectName}:${preferredLanguages.join(',')}`;
          
          if (cache.has(cacheKey)) {
            projectData = cache.get(cacheKey);
          } else {
            projectData = await parseProject(repoPath, { 
              languages: preferredLanguages,
              depth: (options.depth || 0) + 1
            });
            cache.set(cacheKey, projectData);
          }
          
          // Extract content (use first step's content)
          const title = projectData.data.attributes.content.title;
          const content = projectData.data.attributes.content.steps[0]?.content || '';
          
          // Create panel HTML
          const panelHTML = `<div class="c-project-panel c-project-panel--ingredient">
  <h3 class="c-project-panel__heading js-project-panel__toggle">
    ${title}
  </h3>

  <div class="c-project-panel__content u-hidden">
    ${content}
  </div>
</div>`;
          
          // Replace paragraph with HTML node
          parent.children[index] = {
            type: 'html',
            value: panelHTML
          };
          
        } catch (error) {
          console.error(`Failed to load transclusion ${projectName}:`, error.message);
          // Keep original text on error
        }
      })();
      
      promises.push(promise);
    });
    
    // Wait for all transclusions to load
    await Promise.all(promises);
  };
}
