import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import pluginVue from 'eslint-plugin-vue'
import pluginA11y from 'eslint-plugin-vuejs-accessibility'

export default tseslint.config(
  // 忽略目录
  { ignores: ['dist', 'node_modules', 'src/dev', 'src/components/_template'] },

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

  // ── a11y 无障碍规则（warn 级别，逐步修复）────────────────────
  // flat/recommended 是数组，整体 spread 进来以注册插件和默认规则
  ...pluginA11y.configs['flat/recommended'],
  // 覆盖降级为 warn（避免现有组件大量 error 阻断 CI）
  {
    files: ['src/**/*.vue'],
    rules: {
      'vuejs-accessibility/alt-text': 'warn',
      'vuejs-accessibility/anchor-has-content': 'warn',
      'vuejs-accessibility/aria-props': 'warn',
      'vuejs-accessibility/aria-role': 'warn',
      'vuejs-accessibility/aria-unsupported-elements': 'warn',
      'vuejs-accessibility/click-events-have-key-events': 'warn',
      'vuejs-accessibility/form-control-has-label': 'warn',
      'vuejs-accessibility/heading-has-content': 'warn',
      'vuejs-accessibility/iframe-has-title': 'warn',
      'vuejs-accessibility/interactive-supports-focus': 'warn',
      'vuejs-accessibility/label-has-for': 'warn',
      'vuejs-accessibility/media-has-caption': 'warn',
      'vuejs-accessibility/mouse-events-have-key-events': 'warn',
      'vuejs-accessibility/no-access-key': 'warn',
      'vuejs-accessibility/no-autofocus': 'off',  // Modal focus trap 需要 autofocus
      'vuejs-accessibility/no-distracting-elements': 'warn',
      'vuejs-accessibility/no-redundant-roles': 'warn',
      'vuejs-accessibility/no-static-element-interactions': 'warn',
      'vuejs-accessibility/role-has-required-aria-props': 'warn',
      'vuejs-accessibility/tabindex-no-positive': 'warn',
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
