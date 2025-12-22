import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// https://vite.dev/config/
export default defineConfig({
  plugins: [svelte()],
  server: {
    port: parseInt(process.env.WEB_PORT || process.env.PORT || '5173', 10),
    proxy: {
      '/api': {
        target: `http://localhost:${process.env.API_PORT || '3001'}`,
        changeOrigin: true,
      }
    }
  },
  // Vite automatically serves files from the 'public' directory
  // A symlink at public/snapshots -> ../../../test/snapshots allows
  // images to be served from /snapshots/:slug/repo/:lang/images/...
  // In production, nginx/caddy will serve these files directly
})
