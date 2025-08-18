module.exports = {
  root: true,
  env: { es2021: true },
  extends: ['eslint:recommended', 'plugin:@react-native/all', 'prettier'],
  plugins: ['import'],
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  rules: { 'import/order': ['warn', { 'newlines-between': 'always', alphabetize: { order: 'asc' } }] },
};
