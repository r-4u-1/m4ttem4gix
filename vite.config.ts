import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// IMPORTANT: Set the base path to the repository name for GitHub Pages deployment.
// If your repository name or desired Pages URL differs, update the string below.
// Example: For https://<username>.github.io/m4ttem4gix/ base should be '/m4ttem4gix/'
export default defineConfig({
  base: '/m4ttem4gix/',
  plugins: [react()],
})
