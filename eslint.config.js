import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import pluginVue from 'eslint-plugin-vue'

export default tseslint.config(
  // 忽略目录
  { ignores: ['dist', 'node_modules', 'src/dev'] },

  // 基础规则
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...pluginVue.configs['flat/recommended'],

  // Vue 文件解析器
  {
    files: ['src/**/*.vue'],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
      },
    },
  },

  // 全局规则（src 下所有 .ts / .vue）
  {
    files: ['src/**/*.{ts,vue}'],
    rules: {
      // ── 格式类规则全部关闭（由 oxfmt 负责格式化）──────────────
      'vue/max-attributes-per-line': 'off',
      'vue/singleline-html-element-content-newline': 'off',
      'vue/multiline-html-element-content-newline': 'off',
      'vue/html-self-closing': 'off',
      'vue/html-indent': 'off',

      // ── Vue 架构规则（error = CI 拦截）────────────────────────
      // 组件名允许单词（Badge、Switch 等基础组件）
      'vue/multi-word-component-names': 'off',
      // defineProps / defineEmits 顺序（降级为 warn，逐步修复现有代码）
      'vue/define-macros-order': ['warn', {
        order: ['defineProps', 'defineEmits'],
      }],

      // ── TypeScript 规范 ────────────────────────────────────────
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },

  // ── 四层架构强制规则（error = CI 直接拦截，不可绕过）──────────
  //
  // Layer 3: composables 不能 import .vue 组件（不能向上依赖）
  {
    files: ['src/composables/**/*.ts'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [
          {
            group: ['**/*.vue', '../components/**', './components/**'],
            message:
              '[架构违规] composable (Layer 3) 不能 import Vue 组件 (Layer 2/4)。' +
              '请通过函数参数传入所需数据，保持逻辑层与渲染层分离。',
          },
        ],
      }],
    },
  },

  // Layer 1: constants 不能 import 任何内部模块（只允许纯数据定义）
  {
    files: ['src/constants/**/*.ts'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [
          {
            group: ['../composables/**', '../components/**', '../utils/**'],
            message:
              '[架构违规] constants (Layer 1) 只能包含纯数据定义，不能 import 其他模块。',
          },
        ],
      }],
    },
  },
)
