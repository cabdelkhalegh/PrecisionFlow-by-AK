module.exports = {
  extends: ['@precisionflow/eslint-config/react-native'],
  overrides: [
    {
      files: ['**/*.{ts,tsx}'],
    },
  ],
  rules: {
    '@typescript-eslint/no-explicit-any': 'warn',
    'react/no-unescaped-entities': 'warn',
  },
};
