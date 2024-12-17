const node = require('eslint-plugin-node');
const globals = require('globals');

module.exports = [
    {
        languageOptions: {
            globals: {
                ...globals.node,
            }
        },
        plugins: {
            node,
        },
        rules: {
            'node/callback-return': 'error',
            'node/exports-style': ['error', 'module.exports'],
            'node/file-extension-in-import': ['error', 'always'],
            'node/global-require': 'off',
            'node/handle-callback-err': 'error',
            'node/no-callback-literal': 'error',
            'node/no-deprecated-api': 'error',
            'node/no-exports-assign': 'error',
            'node/no-extraneous-import': 'error',
            'node/no-extraneous-require': 'error',
            'node/no-missing-import': 'error',
            'node/no-missing-require': 'error',
            'node/no-mixed-requires': 'off',
            'node/no-new-require': 'error',
            'node/no-path-concat': 'error',
            'node/no-process-env': 'off',
            'node/no-process-exit': 'error',
            'node/no-restricted-import': 'off',
            'node/no-restricted-require': 'off',
            'node/no-sync': 'off',
            'node/no-unpublished-bin': 'error',
            'node/no-unpublished-import': 'error',
            'node/no-unpublished-require': 'error',
            'node/no-unsupported-features/es-builtins': 'error',
            'node/no-unsupported-features/es-syntax': 'error',
            'node/no-unsupported-features/node-builtins': 'error',
            'node/prefer-global/buffer': ['error', 'always'],
            'node/prefer-global/console': ['error', 'always'],
            'node/prefer-global/process': ['error', 'always'],
            'node/prefer-global/text-decoder': ['error', 'always'],
            'node/prefer-global/text-encoder': ['error', 'always'],
            'node/prefer-global/url': ['error', 'always'],
            'node/prefer-global/url-search-params': ['error', 'always'],
            'node/prefer-promises/dns': 'error',
            'node/prefer-promises/fs': 'error',
            'node/process-exit-as-throw': 'off',
            'node/shebang': 'error',
        }
    },
    {
        rules: {
            'no-console': 'off'
        }
    }
]
