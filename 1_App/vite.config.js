import { defineConfig } from 'vite';
import { resolve } from 'path';
import { viteMultiplayerPlugin } from './scripts/server/viteMultiplayerPlugin.js';

export default defineConfig({
  root: import.meta.dirname,
  plugins: [viteMultiplayerPlugin()],
  publicDir: resolve(import.meta.dirname, 'public'),
  server: {
    port: 3000,
    host: '0.0.0.0',
    allowedHosts: true,
    strictPort: true,
    hmr: process.env.DISABLE_HMR !== 'true'
  },
  preview: {
    port: 3000,
    host: '0.0.0.0',
    allowedHosts: true
  },
  build: {
    outDir: resolve(import.meta.dirname, 'dist'),
    emptyOutDir: true,
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        admin: resolve(import.meta.dirname, 'admin.html'),
        progress: resolve(import.meta.dirname, 'progress.html'),
        roadmap: resolve(import.meta.dirname, 'roadmap.html'),
        presentation: resolve(import.meta.dirname, 'presentation.html')
      }
    }
  }
});
