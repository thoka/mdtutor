import { defineConfig, loadEnv } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { execSync } from 'child_process'

// Get current commit hash for version checking
let commitHash = process.env.VITE_COMMIT_HASH || '';
if (!commitHash) {
  try {
    commitHash = execSync('git rev-parse HEAD').toString().trim();
  } catch (e) {
    console.warn('Could not get git commit hash');
  }
}

/** @type {import('vite').Plugin} */
const apiCheckPlugin = (apiPort, expectedCommit) => ({
  name: 'api-check',
  configureServer(server) {
    server.httpServer?.once('listening', () => {
      setTimeout(async () => {
        try {
          const response = await fetch(`http://localhost:${apiPort}/api/health`);
          if (response.ok) {
            const health = await response.json();
            if (health.commitHash !== expectedCommit) {
              console.warn('\n\x1b[33m⚠ API Version Mismatch detected!\x1b[0m');
              console.warn(`  Web App: ${expectedCommit.substring(0, 7)}`);
              console.warn(`  API Server: ${health.commitHashShort || health.commitHash.substring(0, 7)}`);
            } else {
              console.log(`\x1b[32m✓ API version match: ${health.commitHashShort}\x1b[0m`);
            }
          }
        } catch (e) {
          // API might not be up yet, that's okay
        }
      }, 2000);
    });
  }
});

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '../../', '')
  
  // Port MUST be set in .env file - no default fallback
  const webPort = env.WEB_PORT || env.PORT;
  if (!webPort) {
    console.error('ERROR: WEB_PORT or PORT must be set in .env file');
    process.exit(1);
  }
  
  const apiPort = env.API_PORT || env.PORT;
  if (!apiPort) {
    console.error('ERROR: API_PORT or PORT must be set in .env file');
    process.exit(1);
  }

  const achievementsPort = env.ACHIEVEMENTS_PORT;
  if (!achievementsPort) {
    console.warn('WARNING: ACHIEVEMENTS_PORT not set in .env file');
  }

  const ssoPort = env.SSO_PORT;
  if (!ssoPort) {
    console.warn('WARNING: SSO_PORT not set in .env file');
  }
  
  return {
    plugins: [svelte(), apiCheckPlugin(apiPort, commitHash)],
    envDir: '../../',
    define: {
      'import.meta.env.VITE_COMMIT_HASH': JSON.stringify(commitHash),
      'import.meta.env.VITE_SSO_URL': JSON.stringify(env.VITE_SSO_URL || (ssoPort ? `http://localhost:${ssoPort}` : ''))
    },
    server: {
      port: parseInt(webPort, 10),
      strictPort: true,
      host: true,
      allowedHosts: true,
      proxy: {
        // Auth and Actions go to Achievements server
        '/api/v1/auth': {
          target: `http://localhost:${achievementsPort}`,
          changeOrigin: true,
          secure: false
        },
        '/api/v1/actions': {
          target: `http://localhost:${achievementsPort}`,
          changeOrigin: true,
          secure: false
        },
        // Everything else to Node API
        '/api': {
          target: `http://localhost:${apiPort}`,
          changeOrigin: true,
          secure: false,
          ws: true
        }
      }
    },
    // Vite automatically serves files from the 'public' directory
    // A symlink at public/snapshots -> ../../../test/snapshots allows
    // images to be served from /snapshots/:slug/repo/:lang/images/...
    // In production, nginx/caddy will serve these files directly
  }
})
