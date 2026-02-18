import { defineConfig } from 'cypress'
import viteConfig from './vite.config'

export default defineConfig({
  allowCypressEnv: false,
  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite',
      viteConfig,
    },
  },
})
