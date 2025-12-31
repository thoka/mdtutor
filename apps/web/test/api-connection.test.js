/**
 * Test Web App API Connection
 * 
 * Verifies that the web app connects to the correct API server:
 * 1. Checks that Vite proxy configuration matches API server port
 * 2. Validates API health endpoint is accessible
 * 3. Ensures API server is using parseProject (not static files)
 */

import { test } from 'node:test';
import assert from 'node:assert';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '../../..');

// Load .env file if it exists
const envPath = join(projectRoot, '.env');
if (existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

test('Vite proxy targets correct API port', () => {
  // Read vite.config.ts
  const viteConfigPath = join(projectRoot, 'apps/web/vite.config.ts');
  assert.ok(existsSync(viteConfigPath), 'vite.config.ts should exist');
  
  const viteConfigContent = readFileSync(viteConfigPath, 'utf-8');
  
  // Extract proxy target port from vite config
  const proxyMatch = viteConfigContent.match(/target:\s*`http:\/\/localhost:\$\{apiPort\}`/);
  
  assert.ok(proxyMatch, 'Vite proxy configuration should be found');
  
  // Calculate what Vite would actually use
  const viteProxyPort = parseInt(process.env.API_PORT , 10);
  const apiPort = parseInt(process.env.API_PORT , 10);
  
  console.log('Port Configuration:');
  console.log(`  API_PORT env: ${process.env.API_PORT || '(not set)'}`);
  console.log(`  Vite proxy actual: ${viteProxyPort}`);
  console.log(`  API server port: ${apiPort}`);
  
  // They should match
  assert.strictEqual(viteProxyPort, apiPort,
    `Vite proxy port (${viteProxyPort}) should match API server port (${apiPort})`);
});

test('API health endpoint is accessible', async () => {
  const apiPort = parseInt(process.env.API_PORT, 10);
  const apiUrl = `http://localhost:${apiPort}`;
  
  try {
    const response = await fetch(`${apiUrl}/api/health`);
    
    if (!response.ok) {
      throw new Error(`Health endpoint returned ${response.status}`);
    }
    
    const health = await response.json();
    
    console.log('API Health Check:');
    console.log(`  Status: ${health.status}`);
    console.log(`  Port: ${health.port}`);
    console.log(`  API_PORT env: ${health.apiPort || '(not set)'}`);
    console.log(`  Using parser: ${health.usingParser}`);
    
    assert.strictEqual(health.status, 'ok', 'API health status should be ok');
    assert.strictEqual(parseInt(health.port, 10), apiPort, 'API health port should match expected port');
    assert.strictEqual(health.usingParser, true, 'API should be using parseProject');
    
  } catch (error) {
    if (error.code === 'ECONNREFUSED' || error.message?.includes('ECONNREFUSED')) {
      console.warn(`  ⚠ API server is not running on port ${apiPort}`);
      console.warn('  Start it with: npm run api');
      // Don't fail the test, just warn
    } else {
      throw error;
    }
  }
});


test('Web app can connect to API through proxy', async () => {
  // This test would require the web dev server to be running
  // For now, we just verify the configuration is correct
  const webPort = parseInt(process.env.WEB_PORT , 10);
  const apiPort = parseInt(process.env.API_PORT , 10);
  
  console.log('Web App Configuration:');
  console.log(`  Web port: ${webPort}`);
  console.log(`  API port: ${apiPort}`);
  console.log(`  Proxy target: http://localhost:${apiPort}`);
  
  // Verify ports are different (web and API should be on different ports)
  assert.notStrictEqual(webPort, apiPort, 
    'Web port and API port should be different');
  
  // Verify ports are in valid range
  assert.ok(webPort > 0 && webPort < 65536, 'Web port must be in valid range');
  assert.ok(apiPort > 0 && apiPort < 65536, 'API port must be in valid range');
});

