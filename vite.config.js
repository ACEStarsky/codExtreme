import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // 引入 Tailwind v4 插件

export default defineConfig({
  plugins: [react(), tailwindcss()],
})