import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue(), dts({ include: 'src' })],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es'],
    },
    target: ['es2020', 'chrome87', 'firefox78', 'safari14'],
    sourcemap: false,
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      external: [
        'vue',
        'lucide-vue-next',
        'echarts',
        'mermaid',
        'katex',
        'highlight.js',
        'marked',
        'quill',
        '@vueup/vue-quill',
        'vue-draggable-plus',
      ],
      output: {
        preserveModules: true,
        preserveModulesRoot: 'src',
        entryFileNames: '[name].js',
        exports: 'named',
      },
    },
    cssCodeSplit: false,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.integration.spec.ts'],
  },
})
