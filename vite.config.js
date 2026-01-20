import { defineConfig } from 'vite'

export default defineConfig({
  // Use relative base path for maximum compatibility on GitHub Pages
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  }
})

