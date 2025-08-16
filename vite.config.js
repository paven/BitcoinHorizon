import {defineConfig} from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  root: 'web',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  }
})