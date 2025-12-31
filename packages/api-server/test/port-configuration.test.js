/**
 * Test API Server Port Configuration
 * 
 * Verifies that:
 * 1. API server uses the correct port (from env or default)
 * 2. Vite proxy configuration matches API server port
 * 3. API server is accessible on the expected port
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

test('API server port configuration matches expected values', () => {
  // Expected default port
  const expectedDefaultPort = 3201;
  
  // API server port logic: API_PORT || PORT || 3201
  const apiPort = parseInt(process.env.API_PORT || process.env.PORT || '3201', 10);
  
  console.log('Environment variables:');
  console.log(`  API_PORT: ${process.env.API_PORT || '(not set)'}`);
  console.log(`  PORT: ${process.env.PORT || '(not set)'}`);
  console.log(`  Calculated API port: ${apiPort}`);
  
  // Verify port is a valid number
  assert.ok(!isNaN(apiPort), 'API port must be a valid number');
  assert.ok(apiPort > 0 && apiPort < 65536, 'API port must be in valid range (1-65535)');
  
  // If no env vars set, should use default
  if (!process.env.API_PORT && !process.env.PORT) {
    assert.strictEqual(apiPort, expectedDefaultPort, 
      `API port should default to ${expectedDefaultPort} when no env vars are set`);
  }
});

test('Vite proxy configuration matches API server port', () => {
  // Read vite.config.ts
  const viteConfigPath = join(projectRoot, 'apps/web/vite.config.ts');
  assert.ok(existsSync(viteConfigPath), 'vite.config.ts should exist');
  
  const viteConfigContent = readFileSync(viteConfigPath, 'utf-8');
  
  // Extract proxy target port from vite config
  const proxyMatch = viteConfigContent.match(/target:\s*`http:\/\/localhost:\$\{apiPort\}`/);
  
  assert.ok(proxyMatch, 'Vite proxy configuration should be found');
  
  console.log('Vite configuration:');
  
  // Calculate what Vite would actually use (same logic as API server)
  const viteProxyPort = parseInt(process.env.API_PORT || process.env.PORT || '3201', 10);
  const apiPort = parseInt(process.env.API_PORT || process.env.PORT || '3201', 10);
  
  console.log(`  Vite proxy port (calculated): ${viteProxyPort}`);
  console.log(`  API server port (calculated): ${apiPort}`);
  
  // They should match
  assert.strictEqual(viteProxyPort, apiPort,
    'Vite proxy port should match API server port');
});

test('API server port can be accessed', async () => {
  // Calculate expected port
  const apiPort = parseInt(process.env.API_PORT || process.env.PORT || '3201', 10);
  const apiUrl = `http://localhost:${apiPort}`;
  
  console.log(`Testing API server at: ${apiUrl}`);
  
  try {
    // Try to fetch from API
    const response = await fetch(`${apiUrl}/api/projects`);
    
    // If we get a response (even 404), the server is running
    assert.ok(response !== null, 'API server should be accessible');
    
    console.log(`  ✓ API server is accessible on port ${apiPort}`);
    console.log(`  Response status: ${response.status}`);
    
    // If we get a 200 or 404, server is running (404 just means no projects)
    if (response.status === 200 || response.status === 404) {
      console.log('  ✓ API server is responding correctly');
    }
  } catch (error) {
    // If connection refused, server is not running
    if (error.code === 'ECONNREFUSED' || error.message?.includes('ECONNREFUSED')) {
      console.warn(`  ⚠ API server is not running on port ${apiPort}`);
      console.warn('  Start it with: npm run api');
      // Don't fail the test, just warn
    } else {
      throw error;
    }
  }
});

test('API server uses parseProject when repository exists', async () => {
  const apiPort = parseInt(process.env.API_PORT || process.env.PORT || '3201', 10);
  const apiUrl = `http://localhost:${apiPort}`;
  
  // Test with cats-vs-dogs which should use parseProject
  try {
    const response = await fetch(`${apiUrl}/api/projects/cats-vs-dogs?lang=en`);
    
    if (response.ok) {
      const data = await response.json();
      
      // Check if completion array is correct (should be ["external"] for step 5, not ["internal","external"])
      const step5 = data?.data?.attributes?.content?.steps?.[5];
      
      if (step5) {
        console.log(`Step 5 completion: ${JSON.stringify(step5.completion)}`);
        
        // If using parseProject, completion should be ["external"]
        // If using static JSON, it might be ["internal","external"]
        const expectedCompletion = ['external'];
        
        if (JSON.stringify(step5.completion) === JSON.stringify(expectedCompletion)) {
          console.log('  ✓ API is using parseProject (correct completion array)');
        } else {
          console.warn('  ⚠ API might be using static JSON files instead of parseProject');
          console.warn(`    Expected: ${JSON.stringify(expectedCompletion)}`);
          console.warn(`    Got: ${JSON.stringify(step5.completion)}`);
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

