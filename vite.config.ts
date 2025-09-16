import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// VITE_API_BASE_URL can be used to point to a remote backend, otherwise
// the dev server will proxy /api to http://localhost:5000 by default.
const backend = process.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: backend,
        changeOrigin: true,
        secure: false
      }
    }
  },
  build: {
    // Optimizaciones para producción y Vercel
    outDir: 'dist',
    minify: 'esbuild',
    target: 'es2015',
    sourcemap: false, // Deshabilitar sourcemaps en producción
    rollupOptions: {
      output: {
        manualChunks: {
          // Separar vendor chunks para mejor caching
          vendor: ['react', 'react-dom'],
          clerk: ['@clerk/clerk-react'],
          router: ['react-router-dom'],
          utils: ['axios', 'date-fns', 'zod']
        }
      }
    },
    // Reportar chunks grandes
    chunkSizeWarningLimit: 1000,
    // Optimizar para Vercel
    assetsDir: 'assets',
    emptyOutDir: true
  },
  // Optimizar dependencias
  optimizeDeps: {
    include: ['react', 'react-dom', '@clerk/clerk-react', 'react-router-dom', 'axios']
  },
  // Configuración específica para producción
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
  }
});
