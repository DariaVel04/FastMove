import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Project site: https://dariavel04.github.io/FastMove/
// Local dev and local builds stay at /. GitHub Actions publishes under /FastMove/.
const base = process.env.GITHUB_ACTIONS ? '/FastMove/' : '/'

// https://vite.dev/config/
export default defineConfig({
  base,
  plugins: [react()],
})
