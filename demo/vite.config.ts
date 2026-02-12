import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/react-color-a11y/',
  build: {
    outDir: 'build',
  },
  server: {
    open: true,
  },
})
