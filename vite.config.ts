import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Relative asset paths work both at https://dariavel04.github.io/FastMove/
// and at the site root. FastMove has no client-side routes.
export default defineConfig({
  base: './',
  plugins: [react()],
})
