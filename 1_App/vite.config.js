import { defineConfig } from 'vite';
import { resolve } from 'path';
import { viteMultiplayerPlugin } from './scripts/server/viteMultiplayerPlugin.js';

export default defineConfig({
  plugins: [viteMultiplayerPlugin()],
  publicDir: 'public',
  server: {
    port: 8080,
    host: '127.0.0.1',
    strictPort: false
  },
  build: {
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        admin: resolve(import.meta.dirname, 'admin.html')
      }
    }
  }
});
