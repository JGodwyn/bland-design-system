// Fixture tests for bland/use-tokens. Run with `npm run test:lint`.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import stylelint from 'stylelint'

const fixture = (name) => fileURLToPath(new URL(`fixtures/${name}`, import.meta.url))
const repo = (path) => fileURLToPath(new URL(`../../${path}`, import.meta.url))
const configFile = repo('stylelint.config.js')

async function lint(files) {
  const { results } = await stylelint.lint({ files, configFile, allowEmptyInput: true })
  return results.flatMap((r) => r.warnings.filter((w) => w.rule === 'bland/use-tokens'))
}

test('good.css passes', async () => {
  assert.deepEqual(await lint(fixture('good.css')), [])
})

test('bad.css reports each expect line with the token to use, and nothing else', async () => {
  const warnings = await lint(fixture('bad.css'))
  const lines = readFileSync(fixture('bad.css'), 'utf8').split('\n')
  const expected = new Map()
  lines.forEach((text, i) => {
    const m = text.match(/\/\* expect: (.+?) \*\//)
    if (m) expected.set(i + 1, m[1].split('|').map((s) => s.trim()))
  })
  for (const [line, parts] of expected) {
    const text = warnings.filter((w) => w.line === line).map((w) => w.text).join('\n')
    assert.ok(text, `line ${line}: expected a warning for: ${lines[line - 1].trim()}`)
    for (const part of parts) assert.ok(text.includes(part), `line ${line}: expected "${part}" in:\n${text}`)
    assert.ok(text.includes('CLAUDE.md hard rule'), `line ${line}: message must say why`)
  }
  const unexpected = warnings.filter((w) => !expected.has(w.line))
  assert.deepEqual(unexpected.map((w) => `${w.line}: ${w.text}`), [])
})

test('suggestions never name primitives', async () => {
  for (const w of await lint(fixture('bad.css'))) {
    assert.doesNotMatch(w.text, /--(brand|neutral|purple|red|green|amber|unit|alpha)-/i)
  }
})

test('generated token files and the shared fade class pass the lint config', async () => {
  // tokens.css is full of raw values; the config must ignore it rather than report it.
  const { results } = await stylelint.lint({ files: repo('src/tokens/tokens.css'), configFile, allowEmptyInput: true })
  assert.ok(results.every((r) => r.ignored || r.warnings.length === 0))
  assert.ok(results[0]?.ignored, 'src/tokens/tokens.css must be in ignoreFiles')
  assert.deepEqual(await lint(repo('src/components/scroll-area/scroll-fade.css')), [])
})
