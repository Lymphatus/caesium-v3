import js from '@eslint/js';
import eslintReact from '@eslint-react/eslint-plugin';
import perfectionist from 'eslint-plugin-perfectionist';
import prettierRecommended from 'eslint-plugin-prettier/recommended';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['**/node_modules', '**/dist', 'src/workers/UTIF.js'],
  },
  js.configs.recommended,
  tseslint.configs.recommended,
  eslintReact.configs['recommended-typescript'],
  {
    plugins: {
      perfectionist,
    },
    rules: {
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      // Reserved props first, then shorthand, then the rest, callbacks last.
      'perfectionist/sort-jsx-props': [
        'error',
        {
          type: 'alphabetical',
          ignoreCase: true,
          customGroups: [
            { groupName: 'reserved', elementNamePattern: '^(key|ref|dangerouslySetInnerHTML)$' },
            { groupName: 'callback', elementNamePattern: '^on[A-Z]' },
          ],
          groups: ['reserved', 'shorthand-prop', 'unknown', 'callback'],
        },
      ],
    },
  },
  // Must stay last: turns off formatting rules from the presets above.
  prettierRecommended,
);
