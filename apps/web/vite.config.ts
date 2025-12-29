import { defineConfig, loadEnv } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

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
  
  return {
    plugins: [svelte()],
    envDir: '../../',
    server: {
      port: parseInt(webPort, 10),
      proxy: {
        '/api': {
          target: `http://localhost:${apiPort}`,
          changeOrigin: true,
        }
      }
    },
    // Vite automatically serves files from the 'public' directory
    // A symlink at public/snapshots -> ../../../test/snapshots allows
    // images to be served from /snapshots/:slug/repo/:lang/images/...
    // In production, nginx/caddy will serve these files directly
  }
})
