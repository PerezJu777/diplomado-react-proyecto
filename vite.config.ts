import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base:"/diplomado-react-proyecto",
  plugins: [react()],
})
