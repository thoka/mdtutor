import { defineConfig, loadEnv } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '../../', '')
  return {
    plugins: [svelte()],
    envDir: '../../',
    server: {
      port: parseInt(env.WEB_PORT || '5201', 10),
      proxy: {
        '/api': {
          target: `http://localhost:${env.API_PORT || '3201'}`,
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
