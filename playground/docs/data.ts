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

// Size steps, smallest first: anywhere the docs list them, they run from smallest to largest.
const STEPS = ['none', 'null', '3xs', '2xs', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl', '7xl', '8xl', '9xl', 'rd', 'full', 'mobile', 'tablet', 'desktop'];
/** Where a value sits in the size order, or -1 when it is not a size step. */
export const stepRank = (step: string) => (/^\d+$/.test(step) ? 1000 + Number(step) : STEPS.indexOf(step));
/** Sorts size steps smallest first; anything else keeps its order. */
export const bySteps = (values: string[]) => (values.every((v) => stepRank(v) >= 0) ? [...values].sort((a, b) => stepRank(a) - stepRank(b)) : values);

/**
 * Tokens with each family's steps smallest first (`icon/xs` … `icon/lg`, `space-none` … `space-9xl`).
 * A family is the name without its last step; families stay where they first appear.
 */
export function bySize(items: Token[]) {
  const split = (t: Token) => {
    const m = t.name.match(/^(.*?)([^/-]+)$/)!;
    return stepRank(m[2]!) >= 0 ? { family: m[1]!, rank: stepRank(m[2]!) } : { family: t.name, rank: 0 };
  };
  return groupBy(items, (t) => split(t).family).flatMap(([, family]) => [...family].sort((a, b) => split(a).rank - split(b).rank));
}

export type PropDoc ={ name: string; type: string; options?: string[]; required: boolean; default?: string; description: string };
export type ComponentDoc = { description: string; file: string; props: PropDoc[] };
// Written by scripts/build-props.ts before the dev server starts; a glob so a missing file is not a type error.
const propsFiles = import.meta.glob<Record<string, ComponentDoc>>('../.generated/props.json', { eager: true, import: 'default' });
// TypeScript lists a union's values in its own order (sm md xs lg); the docs show size steps smallest first.
export const componentDocs: Record<string, ComponentDoc> = Object.fromEntries(
  Object.entries(Object.values(propsFiles)[0] ?? {}).map(([name, doc]) => [
    name,
    { ...doc, props: doc.props.map((p) => (p.options ? { ...p, options: bySteps(p.options) } : p)) },
  ]),
);

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
  { id: 'grid', title: 'Grid' },
  { id: 'elevation', title: 'Elevation' },
  { id: 'motion', title: 'Motion' },
  { id: 'radius', title: 'Corner radius' },
  { id: 'stroke', title: 'Stroke' },
] as const;
export type StylePageId = (typeof stylePages)[number]['id'];

/** A page of the docs, in sidebar order: what the previous and next buttons and the search walk through. */
export type DocsPage = { href: string; title: string; kind: 'overview' | 'brand' | 'style' | 'component'; description: string; icon?: ComponentType };
