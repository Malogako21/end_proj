import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/static/',

  build: {
      rollupOptions: {
        output: {
     //     dir: './static',
          entryFileNames: 'spa.js',
          assetFileNames: 'spa.css',
          chunkFileNames: "chunk.js",
          manualChunks: undefined,
        }
      }
    }

})


