import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path' // Node.js path 模块


export default defineConfig({
  plugins: [vue()],
  server:{
    port: 5173, // 固定为5173
    strictPort: true // 禁止自动切换端口
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // 设置 '@' 指向 'src' 目录
    },
  },
  base: '/interview-agent/' // 根据部署路径调整
})
