import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'

const externalPackages = [
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
]

function isExternal(id: string) {
  return externalPackages.some(pkg => id === pkg || id.startsWith(`${pkg}/`))
}

export default defineConfig({
  plugins: [
    vue(),
    dts({
      include: ['src'],
      exclude: [
        'src/dev/**',
        'src/tests/**',
        'src/**/*.spec.ts',
        'src/**/*.integration.spec.ts',
      ],
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        composables: resolve(__dirname, 'src/composables/index.ts'),
        plugin: resolve(__dirname, 'src/plugin.ts'),
        theme: resolve(__dirname, 'src/theme.ts'),
      },
      formats: ['es'],
    },
    target: ['es2020', 'chrome87', 'firefox78', 'safari14'],
    sourcemap: false,
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      external: isExternal,
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
