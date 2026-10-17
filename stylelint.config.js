// Token lint for component CSS. The rule lives in scripts/stylelint/bland-tokens.js; see docs/lint.md.
export default {
  plugins: ['./scripts/stylelint/bland-tokens.js'],
  ignoreFiles: ['src/tokens/**', 'dist/**', 'node_modules/**'],
  rules: {
    'bland/use-tokens': true,
  },
}
