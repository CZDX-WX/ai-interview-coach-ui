import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path' // Node.js path 模块

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // 设置 '@' 指向 'src' 目录
    },
  },
  base: process.env.VITE_BASE_URL || '/', // (可选) 应用部署的基础路径，例如部署在子目录时
})
