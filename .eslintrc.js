module.exports = {
    env: {
        node: true,
    },
    extends: [
        'eslint:recommended',
        './packages/base/index.js',
    ],
    parserOptions: {
        ecmaVersion: 2018,
        sourceType: 'module',
    },
}
