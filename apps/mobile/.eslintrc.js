module.exports = {
  extends: ['@precisionflow/eslint-config/react-native'],
  overrides: [
    {
      files: ['**/*.{ts,tsx}'],
    },
  ],
  rules: {
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    'react/no-unescaped-entities': 'warn',
  },
};
