import { createConfigForNuxt } from '@nuxt/eslint-config/flat'

export default createConfigForNuxt({
  features: {
    stylistic: {
      indent: 2,
      quotes: 'single',
      semi: false,
    },
  },
})
  .append({
    rules: {
      'vue/multi-word-component-names': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  })
  .append({
    files: ['test/**/*.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  })
  .append({
    ignores: [
      'dist/',
      '.nuxt/',
      '.output/',
      'node_modules/',
      'coverage/',
      'playground/.nuxt/',
      'playground/.output/',
    ],
  })
