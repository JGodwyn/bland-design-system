// npm run test:tokens. Deprecated token aliases (docs/release.md, "Deprecation").
import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { Token } from './core';
import { aliasLines, checkDeprecations, type Deprecation } from './deprecated';

const token = (css: string, dark?: string): Token => ({ name: css, css, collection: 'Theme', type: 'COLOR', description: '', light: '#fff', dark });
const tokens = [token('--surface-raised', '#000'), token('--space-md')];
const card: Deprecation = { name: '--surface-card', use: '--surface-raised', since: '0.2.0', removeIn: '0.3.0' };
const gap: Deprecation = { name: '--gap-md', use: '--space-md', since: '0.2.0', removeIn: '0.3.0' };

test('an alias is written in each block that defines its replacement', () => {
  const light = aliasLines([card, gap], new Set(['--surface-raised', '--space-md']));
  assert.match(light, /--surface-card: var\(--surface-raised\);/);
  assert.match(light, /--gap-md: var\(--space-md\);/);
  assert.match(light, /Deprecated in 0\.2\.0: use --surface-raised\. Removed in 0\.3\.0\./);
  // The dark blocks define only themed tokens, so a scale alias stays out of them.
  const dark = aliasLines([card, gap], new Set(['--surface-raised']));
  assert.match(dark, /--surface-card/);
  assert.doesNotMatch(dark, /--gap-md/);
});

test('no deprecations, no output', () => {
  assert.equal(aliasLines([], new Set(['--space-md'])), '');
  assert.equal(aliasLines([card], new Set(['--space-md'])), '');
});

test('the list is checked against the built tokens', () => {
  assert.doesNotThrow(() => checkDeprecations([card, gap], tokens));
  assert.throws(() => checkDeprecations([{ ...card, name: '--space-md' }], tokens), /still exists in Figma/);
  assert.throws(() => checkDeprecations([{ ...card, use: '--surface-gone' }], tokens), /not a token/);
  assert.throws(() => checkDeprecations([card, card], tokens), /listed twice/);
  assert.throws(() => checkDeprecations([{ ...card, name: 'surface-card' }], tokens), /custom property names/);
});
