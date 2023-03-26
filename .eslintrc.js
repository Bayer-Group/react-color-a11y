module.exports = {
  env: {
    browser: true,
    es2021: true
  },
  ignorePatterns: [
    'lib/',
    'demo/',
    'cypress/',
    'cypress.config.ts',
    '**/*.cy.tsx'
  ],
  extends: [
    'plugin:react/recommended',
    'standard-with-typescript'
  ],
  overrides: [],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: './tsconfig.json'
  },
  plugins: [
    'react'
  ],
  rules: {},
  settings: {
    react: {
      version: 'detect'
    }
  }
}
