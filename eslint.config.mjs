import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import playwright from 'eslint-plugin-playwright';
import prettier from 'eslint-config-prettier';
import importPlugin from 'eslint-plugin-import';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default [
    // 1) Ignore patterns (replacement for legacy .eslintignore)
    {
        ignores: [
            'node_modules/**',
            'dist/**',
            'build/**',
            'playwright-report/**',
            '.next/**',
            '.vite/**',
            'coverage/**',
        ],
    },

    // 2) Base JS recommendations
    js.configs.recommended,

    // 3) Playwright rules only for test files
    {
        files: ['tests/**/*.ts', 'tests/**/*.tsx', '**/*.spec.ts', '**/*.test.ts'],
        ...playwright.configs['flat/recommended'],
    },

    // 4) Type-aware TypeScript rules (strict)
    {
        files: ['**/*.ts', '**/*.tsx'],

        // Use TS parser with type info
        languageOptions: {
            parser: tseslint.parser,
            parserOptions: {
                // Auto-discovery of tsconfig: projectService
                projectService: true,
                tsconfigRootDir: __dirname,
                ecmaVersion: 'latest',
                sourceType: 'module',
            },
        },

        plugins: {
            '@typescript-eslint': tseslint.plugin,
            import: importPlugin,
        },

        // Merge recommended type-checked rule sets and tighten further
        rules: {
            // --- Base: recommended type-checked sets
            ...tseslint.configs.recommendedTypeChecked.rules,
            ...tseslint.configs.stylisticTypeChecked.rules,

            // --- “Senior” stricter rules (type-safety & clarity)
            '@typescript-eslint/explicit-function-return-type': ['error', {
                allowExpressions: false,
                allowTypedFunctionExpressions: true,
                allowHigherOrderFunctions: true,
                allowDirectConstAssertionInArrowFunctions: true,
            }],
            '@typescript-eslint/explicit-module-boundary-types': 'error',
            '@typescript-eslint/no-explicit-any': ['error', { fixToUnknown: true, ignoreRestArgs: false }],
            '@typescript-eslint/no-unsafe-assignment': 'error',
            '@typescript-eslint/no-unsafe-call': 'error',
            '@typescript-eslint/no-unsafe-member-access': 'error',
            '@typescript-eslint/no-unsafe-return': 'error',
            '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true, allowBoolean: true }],
            '@typescript-eslint/no-floating-promises': ['error', { ignoreVoid: false, ignoreIIFE: false }],
            '@typescript-eslint/promise-function-async': ['error', { allowAny: false }],
            '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports', fixStyle: 'inline-type-imports' }],
            '@typescript-eslint/no-unnecessary-type-assertion': 'error',
            '@typescript-eslint/prefer-nullish-coalescing': ['error', { ignorePrimitives: false }],
            '@typescript-eslint/prefer-readonly': 'error',
            '@typescript-eslint/prefer-readonly-parameter-types': ['warn', {
                checkParameterProperties: true,
                ignoreInferredTypes: true,
            }],
            '@typescript-eslint/no-confusing-void-expression': ['error', { ignoreArrowShorthand: false }],
            '@typescript-eslint/consistent-type-definitions': ['error', 'type'],

            // --- Import hygiene (ordering, duplicates, unresolved)
            'import/order': ['error', {
                'newlines-between': 'always',
                alphabetize: { order: 'asc', caseInsensitive: true },
                groups: [
                    'builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'object', 'type'
                ],
            }],
            'import/no-duplicates': 'error',
            'import/no-unresolved': 'off', // TS resolver handles this; avoid double-reporting

            // --- Pragmatic defaults
            '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
            'no-console': 'warn', // keep visibility but fail CI only on errors
        },
    },

    // 5) Override for test files (relaxed mode)
    {
        files: ['tests/**/*.ts', '**/*.spec.ts', '**/*.test.ts'],
        rules: {
            // Allow console logging for debugging test runs
            'no-console': 'off',

            // Allow using "any" in tests for mock data or quick type casting
            '@typescript-eslint/no-explicit-any': 'off',

            // Do not require explicit return types in short test callbacks
            '@typescript-eslint/explicit-function-return-type': 'off',

            // Permit void async calls (Playwright actions, teardown hooks, etc.)
            '@typescript-eslint/no-floating-promises': 'off',

            // Only warn about unused vars (fixtures/hooks often require specific signatures)
            '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
        },
    },

    // 6) Keep this config file itself out of TS rules
    {
        files: ['eslint.config.mjs'],
        rules: {},
    },

    // 7) Disable formatting conflicts and delegate to Prettier
    prettier,
];
