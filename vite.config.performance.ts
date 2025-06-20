import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      filename: 'dist/bundle-analysis.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    // Performance optimizations
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom'],
          'router-vendor': ['react-router-dom'],
          'query-vendor': ['@tanstack/react-query'],
          'ui-vendor': ['lucide-react', '@uiw/react-md-editor'],
          'd3-vendor': ['d3'],
          
          // Feature chunks
          'auth': [
            './src/components/auth',
            './src/pages/AuthPage',
          ],
          'memories': [
            './src/pages/MemoriesPage',
            './src/pages/MemoryEditorPage',
            './src/pages/MemoryDetailPage',
            './src/components/memory',
          ],
          'search': [
            './src/pages/SearchPage',
            './src/components/search',
          ],
          'collections': [
            './src/pages/CollectionsPage',
            './src/components/collections',
          ],
          'graph': [
            './src/pages/GraphPage',
            './src/components/graph',
          ],
          'settings': [
            './src/pages/SettingsPage',
            './src/components/settings',
          ],
        },
      },
    },
    
    // Chunk size warnings
    chunkSizeWarningLimit: 1000,
    
    // Source maps for production debugging
    sourcemap: false,
    
    // CSS code splitting
    cssCodeSplit: true,
    
    // Asset inlining threshold
    assetsInlineLimit: 4096,
  },
  
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      'zustand',
      'lucide-react',
    ],
    exclude: ['@uiw/react-md-editor'], // Large dependency, load on demand
  },
  
  // Performance settings
  server: {
    hmr: {
      overlay: false,
    },
  },
})