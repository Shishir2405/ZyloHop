module.exports = {
  root: true,
  extends: '@react-native',
  plugins: ['prettier'],
  ignorePatterns: [
    'node_modules/',
    'android/',
    'ios/',
    'dist/',
    'web-build/',
    '.expo/',
    'coverage/',
  ],
  rules: {
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'react-hooks/exhaustive-deps': 'warn',
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': [
      'warn',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
    ],
    'prettier/prettier': 'off',
  },
};
