import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  { ignores: ['dist', 'node_modules', 'public', 'prisma/migrations'] },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  prettier,
  {
    rules: {
      // Dívidas conhecidas (issue R11); por enquanto só avisam
      '@typescript-eslint/no-explicit-any': 'warn',
      'preserve-caught-error': 'warn',
    },
  },
);