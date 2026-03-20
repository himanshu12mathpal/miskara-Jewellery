import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],

  // Build optimizations for production
  build: {
    outDir: 'dist',
    sourcemap: false,      // No sourcemaps in production (security)
    minify: 'terser',
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // Split large vendor chunks for better caching
        manualChunks: {
          vendor:  ['react', 'react-dom', 'react-router-dom'],
          icons:   ['react-icons'],
          axios:   ['axios'],
          toast:   ['react-hot-toast'],
        },
      },
    },
  },

  // Dev server proxy (only used in development)
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});
