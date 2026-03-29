module.exports = {
  root: true,
  extends: ['@react-native', 'eslint:recommended', 'plugin:@typescript-eslint/eslint-recommended', 'plugin:prettier/recommended'],
  ignorePatterns: ['**/*.d.ts'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'simple-import-sort', 'eslint-plugin-react-compiler'],
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      rules: {
        '@typescript-eslint/no-shadow': ['error'],
        'no-shadow': 'off',
        'no-undef': 'off'
      }
    }
  ],
  rules: {
    'react-hooks/exhaustive-deps': 'off',
    'comma-dangle': ['error', 'never'],
    semi: ['error', 'never'],
    'no-unused-vars': 'off',
    'simple-import-sort/exports': 'error',
    'simple-import-sort/imports': 'error',
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/ban-ts-ignore': 'off',
    'max-len': [
      'error',
      {
        code: 200
      }
    ],
    '@typescript-eslint/func-call-spacing': 'off',
    'react-compiler/react-compiler': 'error'
  },
  env: {
    node: true,
    'jest/globals': true
  }
}
