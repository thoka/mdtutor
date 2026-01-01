import { existsSync, readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import yaml from 'js-yaml';

/**
 * Load ecosystem and layer configuration from content directory
 */
export function loadContentConfig(contentDir) {
  const ecosystems = {};
  
  if (!existsSync(contentDir)) return ecosystems;

  const dirs = readdirSync(contentDir, { withFileTypes: true });
  for (const dir of dirs) {
    if (dir.isDirectory()) {
      const ecosystemPath = join(contentDir, dir.name);
      const ecoFile = join(ecosystemPath, 'ecosystem.yaml');
      const sourcesFile = join(ecosystemPath, 'sources.yaml');
      
      if (existsSync(ecoFile)) {
        const ecosystem = yaml.load(readFileSync(ecoFile, 'utf-8'));
        const sources = existsSync(sourcesFile) ? yaml.load(readFileSync(sourcesFile, 'utf-8')) : { layers: [] };
        
        // Sort layers by priority (descending)
        const layers = (sources.layers || []).sort((a, b) => (b.priority || 0) - (a.priority || 0));
        
        ecosystems[dir.name] = {
          ...ecosystem,
          id: dir.name,
          path: ecosystemPath,
          layers: layers.map(layer => ({
            ...layer,
            path: join(ecosystemPath, 'layers', layer.id)
          }))
        };
      }
    }
  }
  
  return ecosystems;
}

/**
 * Resolve a project slug to its prioritized layer path
 */
export function resolveProjectLayer(ecosystems, namespacedSlug) {
  let [ecoId, slug] = namespacedSlug.includes(':') ? namespacedSlug.split(':') : ['RPL', namespacedSlug];
  ecoId = ecoId.toUpperCase();
  
  const ecosystem = ecosystems[ecoId];
  if (!ecosystem) return null;
  
  for (const layer of ecosystem.layers) {
    const projectPath = join(layer.path, 'projects', slug);
    if (existsSync(projectPath)) {
      return {
        path: projectPath,
        ecosystem: ecosystem,
        layer: layer,
        slug: slug,
        namespace: ecosystem.namespace
      };
    }
  }
  
  return null;
}

/**
 * Resolve a pathway slug to its prioritized layer path
 */
export function resolvePathwayLayer(ecosystems, namespacedSlug) {
  let [ecoId, slug] = namespacedSlug.includes(':') ? namespacedSlug.split(':') : ['RPL', namespacedSlug];
  ecoId = ecoId.toUpperCase();
  
  const ecosystem = ecosystems[ecoId];
  if (!ecosystem) return null;
  
  for (const layer of ecosystem.layers) {
    const pathwayPath = join(layer.path, 'pathways', `${slug}.yaml`);
    const pathwayPathYml = join(layer.path, 'pathways', `${slug}.yml`);
    
    if (existsSync(pathwayPath)) return { path: pathwayPath, ecosystem, layer, slug };
    if (existsSync(pathwayPathYml)) return { path: pathwayPathYml, ecosystem, layer, slug };
  }
  
  return null;
}

