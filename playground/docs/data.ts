// Data the docs site reads: the generated tokens, the generated props, and the component stories.
import type { ComponentType } from 'react';
import tokensFile from '../../tokens/tokens.json';
import type { Story } from '../story';

export type Token = {
  name: string;
  css: string;
  collection: string;
  type: string;
  description: string;
  light: string;
  dark?: string;
  aliasOf?: { light?: string; dark?: string };
};
export const tokens = tokensFile.tokens as Token[];
export const tokensExportedAt = tokensFile.$exportedAt;
export const inCollection = (collection: string) => tokens.filter((t) => t.collection === collection);

/** Groups items by a key, keeping first-seen order. */
export function groupBy<T>(items: T[], key: (item: T) => string) {
  const groups = new Map<string, T[]>();
  for (const item of items) {
    const k = key(item);
    groups.set(k, [...(groups.get(k) ?? []), item]);
  }
  return [...groups];
}

export type PropDoc = { name: string; type: string; options?: string[]; required: boolean; default?: string; description: string };
export type ComponentDoc = { description: string; file: string; props: PropDoc[] };
// Written by scripts/build-props.ts before the dev server starts; a glob so a missing file is not a type error.
const propsFiles = import.meta.glob<Record<string, ComponentDoc>>('../.generated/props.json', { eager: true, import: 'default' });
export const componentDocs: Record<string, ComponentDoc> = Object.values(propsFiles)[0] ?? {};

const storyModules = import.meta.glob<{ default: Story }>('../../src/components/*/*.stories.tsx', { eager: true });
export const stories = Object.entries(storyModules)
  .map(([path, m]) => ({ id: path.split('/').at(-2)!, story: m.default }))
  .sort((a, b) => a.story.title.localeCompare(b.story.title));

export const stylePages = [
  { id: 'colors', title: 'Colors' },
  { id: 'typography', title: 'Typography' },
  { id: 'spacing', title: 'Spacing' },
  { id: 'icons', title: 'Icons' },
  { id: 'sizing', title: 'Sizing' },
  { id: 'breakpoints', title: 'Breakpoints' },
  { id: 'elevation', title: 'Elevation' },
  { id: 'motion', title: 'Motion' },
  { id: 'radius', title: 'Corner radius' },
  { id: 'stroke', title: 'Stroke' },
] as const;
export type StylePageId = (typeof stylePages)[number]['id'];

/** A page of the docs, in sidebar order: what the previous and next buttons and the search walk through. */
export type DocsPage = { href: string; title: string; kind: 'overview' | 'style' | 'component'; description: string; icon?: ComponentType };
