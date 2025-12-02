import { FlatCompat } from '@eslint/eslintrc';
import perfectionist from 'eslint-plugin-perfectionist';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const ignores = [
  'node_modules/**',
  '.next/**',
  'out/**',
  'build/**',
  'next-env.d.ts',
  'types/database/schema.ts',
];

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    ignores,
  },
  {
    ...eslintPluginPrettierRecommended,
    ignores,
    rules: {
      'prettier/prettier': [
        'error',
        {
          arrowParens: 'avoid',
          bracketSameLine: false,
          bracketSpacing: true,
          endOfLine: 'lf',
          jsxSingleQuote: true,
          plugins: ['prettier-plugin-tailwindcss'],
          printWidth: 80,
          proseWrap: 'preserve',
          quoteProps: 'as-needed',
          semi: true,
          singleQuote: true,
          tabWidth: 2,
          trailingComma: 'es5',
          useTabs: false,
        },
      ],
    },
  },
  {
    ...perfectionist.configs['recommended-alphabetical'],
    ignores,
  },
];

export default eslintConfig;
