import vueTsEslintConfig from '@vue/eslint-config-typescript'
import pluginJsdoc from 'eslint-plugin-jsdoc'
import prettierSkipFormatting from 'eslint-plugin-prettier/recommended'
import pluginSecurity from 'eslint-plugin-security'
import pluginSimpleImportSort from 'eslint-plugin-simple-import-sort'
import pluginVue from 'eslint-plugin-vue'

export default [
  {
    name: 'app/files-to-lint',
    files: ['**/*.{ts,mts,tsx,vue}'],
  },
  {
    name: 'app/files-to-ignore',
    ignores: ['**/dist/**', '**/dist-ssr/**', '**/coverage/**', '**/node_modules/**'],
  },
  ...pluginVue.configs['flat/essential'],
  ...vueTsEslintConfig(),
  pluginJsdoc.configs['flat/recommended-typescript'],
  prettierSkipFormatting,
  pluginSecurity.configs.recommended,
  {
    rules: {
      // Vue 规则
      'vue/multi-word-component-names': ['error', { ignores: ['App'] }],

      // TypeScript 规则
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { caughtErrors: 'none', argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],

      // 禁止 console（生产环境）
      'no-console': ['warn', { allow: ['warn', 'error'] }],

      // 禁止 debugger
      'no-debugger': 'error',

      // 强制使用 === 而非 ==
      eqeqeq: ['error', 'always'],

      // 禁止 var 声明
      'no-var': 'error',

      // 强制使用 const/let
      'prefer-const': 'error',

      // 函数参数数量限制（最多 7 个）
      'max-params': ['error', 7],

      // 代码复杂度限制（圈复杂度最大 15）
      complexity: ['error', 15],

      // 禁止空代码块
      'no-empty': ['error', { allowEmptyCatch: true }],

      // 禁止使用 eval
      'no-eval': 'error',

      // 禁止使用 with
      'no-with': 'error',

      // 禁止不必要的 catch 块
      'no-useless-catch': 'error',

      // 禁止不必要的转义字符
      'no-useless-escape': 'error',

      // 强制 Promise 必须有 catch 或 await
      'promise/catch-or-return': 'off', // 由 TypeScript 检查

      // JSDoc 规则
      'jsdoc/require-jsdoc': [
        'warn',
        {
          publicOnly: true,
          require: {
            FunctionDeclaration: true,
            MethodDefinition: true,
            ClassDeclaration: true,
            ArrowFunctionExpression: false,
            FunctionExpression: false,
          },
        },
      ],
      'jsdoc/require-param': 'warn',
      'jsdoc/require-returns': 'warn',
      'jsdoc/check-tag-names': 'error',
      'jsdoc/tag-lines': ['warn', 'any', { startLines: 1 }],

      // Import 排序规则
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
    },
  },
  {
    plugins: {
      'simple-import-sort': pluginSimpleImportSort,
    },
  },
  // Test/Mock 文件禁用安全规则（误报，不涉及真实安全风险）
  {
    name: 'app/test-mock-security-override',
    files: ['**/mocks/**', '**/*.test.*', '**/test/**'],
    rules: {
      'security/detect-object-injection': 'off',
      'security/detect-possible-timing-attacks': 'off',
      'security/detect-non-literal-regexp': 'off',
    },
  },
]
