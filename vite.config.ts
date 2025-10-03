import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis',
    'process.env': {}
  },
  base: '/', // Ensure relative paths for Netlify
  build: {
    target: 'es2020',
    minify: 'esbuild',
    cssMinify: true,
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          monaco: ['monaco-editor'],
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore']
        }
      }
    }
  },
  resolve: {
    alias: {
      // Map problematic core-js internals to our mock file
      '../internals/define-globalThis-property': '/src/utils/core-js-mocks.js',
      '../internals/globalThis-this': '/src/utils/core-js-mocks.js'
    }
  }
})
