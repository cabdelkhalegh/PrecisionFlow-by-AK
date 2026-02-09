module.exports = {
  extends: ['@precisionflow/eslint-config/base'],
  overrides: [
    {
      files: ['**/*.{ts,tsx}'],
    },
  ],
  rules: {
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': 'warn',
  },
};
