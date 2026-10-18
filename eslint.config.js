import js from '@eslint/js';
import globals from 'globals';
import { structuralLimits } from 'karkhana/eslint-limits';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['com.ahmedavais.toolkit.sdPlugin/bin/', 'dist/', 'playground/', 'node_modules/'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['src/**/*.ts'],
    extends: [tseslint.configs.recommendedTypeChecked],
    languageOptions: { parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname } },
    rules: {
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/no-floating-promises': [
        'error',
        { allowForKnownSafeCalls: [{ from: 'package', package: 'node:test', name: ['test', 'it', 'describe', 'suite'] }] },
      ],
    },
  },
  {
    files: ['hooks/**/*.mjs', '*.config.mjs'],
    languageOptions: { globals: globals.node },
  },
  structuralLimits,
);
