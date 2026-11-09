import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("maplibre-gl")) return "maplibre";
          if (id.includes("node_modules/react-dom") || id.includes("node_modules/react/")) return "react-vendor";
        }
      }
    }
  },
  server: {
    proxy: {
      // Local dev only: forwards to scripts/local-api/server.mjs, which
      // runs the real api/_lib/handlers/*.mjs code directly (bypassing
      // `vercel dev`, which currently hangs during its build step on
      // this machine). See scripts/local-api/README.md.
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
});
