import js from '@eslint/js';
import reactNative from '@react-native/eslint-plugin';
import tsParser from '@typescript-eslint/parser';

const rnGlobals = { console: 'readonly', JSX: 'readonly' };

export default [
  { ignores: ['node_modules/**', 'dist/**', '.expo/**'] },
  js.configs.recommended,

  // React Native & TS files
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: tsParser,
      globals: rnGlobals,
    },
    plugins: { 'react-native': reactNative },
    rules: {
      'react-native/no-raw-text': 'off',
      'no-console': 'off',
      'no-unused-vars': 'off'   // <— disable core rule to avoid TS false positives
    },
  },

  // Node / config files (allow process/module)
  {
    files: ['app.config.ts', 'jest.config.*', '**/*.config.{js,cjs,ts}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: tsParser,
      globals: {
        ...rnGlobals,
        process: 'readonly',
        module: 'readonly',
        __dirname: 'readonly',
        require: 'readonly',
      },
    },
    rules: {},
  },
];
