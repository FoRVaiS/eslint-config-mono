const node = require('eslint-plugin-n');
const globals = require('globals');

module.exports = [
    node.configs["flat/recommended-script"],
    {
        languageOptions: {
            globals: {
                ...globals.node,
            }
        },
        rules: {
            'no-console': 'off'
        }
    }
]
