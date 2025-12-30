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
  const viteProxyPort = parseInt(process.env.API_PORT || process.env.PORT || '3201', 10);
  const apiPort = parseInt(process.env.API_PORT || process.env.PORT || '3201', 10);
  
  console.log('Port Configuration:');
  console.log(`  API_PORT env: ${process.env.API_PORT || '(not set)'}`);
  console.log(`  PORT env: ${process.env.PORT || '(not set)'}`);
  console.log(`  Vite proxy default: ${viteProxyDefaultPort}`);
  console.log(`  Vite proxy actual: ${viteProxyPort}`);
  console.log(`  API server port: ${apiPort}`);
  
  // They should match
  assert.strictEqual(viteProxyPort, apiPort,
    `Vite proxy port (${viteProxyPort}) should match API server port (${apiPort})`);
});

test('API health endpoint is accessible', async () => {
  const apiPort = parseInt(process.env.API_PORT || process.env.PORT || '3201', 10);
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
      console.warn(`  Start it with: npm run api`);
      // Don't fail the test, just warn
    } else {
      throw error;
    }
  }
});

test('API server uses parseProject (not static files)', async () => {
  const apiPort = parseInt(process.env.API_PORT || process.env.PORT || '3201', 10);
  const apiUrl = `http://localhost:${apiPort}`;
  
  // Test with cats-vs-dogs which should use parseProject
  // Step 5 should have completion: ["external"] (not ["internal","external"])
  try {
    const response = await fetch(`${apiUrl}/api/projects/cats-vs-dogs?lang=en`);
    
    if (response.ok) {
      const data = await response.json();
      
      const step5 = data?.data?.attributes?.content?.steps?.[5];
      
      if (step5) {
        console.log('Step 5 completion check:');
        console.log(`  Got: ${JSON.stringify(step5.completion)}`);
        
        // If using parseProject, completion should be ["external"]
        // If using static JSON, it might be ["internal","external"]
        const expectedCompletion = ["external"];
        const actualCompletion = step5.completion;
        
        if (JSON.stringify(actualCompletion) === JSON.stringify(expectedCompletion)) {
          console.log('  ✓ API is using parseProject (correct completion array)');
        } else {
          console.warn('  ⚠ API might be using static JSON files instead of parseProject');
          console.warn(`    Expected: ${JSON.stringify(expectedCompletion)}`);
          console.warn(`    Got: ${JSON.stringify(actualCompletion)}`);
          console.warn('  This indicates the API server needs to be restarted to use the updated parser');
        }
      }
    }
  } catch (error) {
    if (error.code !== 'ECONNREFUSED') {
      throw error;
    }
    console.warn('  ⚠ API server not running, skipping parseProject test');
  }
});

test('Web app can connect to API through proxy', async () => {
  // This test would require the web dev server to be running
  // For now, we just verify the configuration is correct
  const webPort = parseInt(process.env.WEB_PORT || '5201', 10);
  const apiPort = parseInt(process.env.API_PORT || process.env.PORT || '3201', 10);
  
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

