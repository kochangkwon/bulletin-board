import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'
import tsconfigPaths from 'vite-tsconfig-paths'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths()],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  // Server configuration
  server: {
    port: 5173,
    strictPort: false,
    open: true,
    // SPA fallback for React Router
    historyApiFallback: true,
  },

  // Preview server (for production build testing)
  preview: {
    port: 4173,
    strictPort: false,
    open: true,
  },

  // Build optimization
  build: {
    target: 'es2020',
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'query-vendor': ['@tanstack/react-query'],
        },
      },
    },
  },

  // Environment variables
  envPrefix: 'VITE_',
})
