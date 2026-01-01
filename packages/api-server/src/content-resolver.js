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
      const sourcesFile = join(ecosystemPath, 'config', 'sync.yaml');
      
      if (existsSync(ecoFile)) {
        const ecosystem = yaml.load(readFileSync(ecoFile, 'utf-8'));
        const sources = existsSync(sourcesFile) ? yaml.load(readFileSync(sourcesFile, 'utf-8')) : { layers: {} };
        
        // Convert dictionary to array and sort by priority (descending)
        const layers = Object.entries(sources.layers || {})
          .map(([id, config]) => ({
            id,
            ...config,
            path: join(ecosystemPath, 'layers', id)
          }))
          .sort((a, b) => (b.priority || 0) - (a.priority || 0));
        
        ecosystems[dir.name.toUpperCase()] = {
          ...ecosystem,
          id: dir.name,
          path: ecosystemPath,
          layers: layers
        };
      }
    }
  }
  
  return ecosystems;
}

/**
 * Normalize a GID or namespaced slug to [ecosystem, slug]
 */
function normalizeIdentifier(namespacedSlug) {
  const parts = namespacedSlug.split(':');
  if (parts.length === 3) {
    // ECOSYSTEM:TYPE:SLUG
    return [parts[0].toUpperCase(), parts[2]];
  } else if (parts.length === 2) {
    // ECOSYSTEM:SLUG
    return [parts[0].toUpperCase(), parts[1]];
  } else {
    // SLUG
    return ['RPL', namespacedSlug];
  }
}

/**
 * Resolve a project identifier to its prioritized layer path
 */
export function resolveProjectLayer(ecosystems, identifier) {
  const [ecoId, slug] = normalizeIdentifier(identifier);
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
 * Resolve a pathway identifier to its prioritized layer path
 */
export function resolvePathwayLayer(ecosystems, identifier) {
  const [ecoId, slug] = normalizeIdentifier(identifier);
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
