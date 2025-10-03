import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react({
    babel: {
      presets: [
        [
          '@babel/preset-env',
          {
            targets: {
              ie: '9',
              chrome: '49',
              firefox: '45',
              safari: '10',
              edge: '12'
            },
            modules: false,
            useBuiltIns: false
          }
        ]
      ]
    }
  })],
  define: {
    global: 'globalThis',
    'process.env': {}
  },
  build: {
    target: 'es2015',
    minify: 'terser',
    cssMinify: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore']
        }
      }
    }
  },
  esbuild: {
    target: 'es2015'
  }
})
