// Every docs page in sidebar order, and the search over them: shared by the sidebar, the previous and
// next buttons and the search dialog, so the three never disagree.
import type { ComponentType } from 'react';
import { Icon } from '../../src/components/icon/Icon';
import { componentDocs, stories, stylePages, tokens, type DocsPage, type StylePageId } from './data';
import {
  ArrowsOutCardinalIcon,
  CornersOutIcon,
  DevicesIcon,
  RectangleDashedIcon,
  RulerIcon,
  ShapesIcon,
  StackIcon,
  SwatchesIcon,
  TextAaIcon,
  TornadoIcon,
  WarehouseIcon,
} from './icons';
import { leads } from './leads';

const styleIcons: Record<StylePageId, ComponentType> = {
  colors: SwatchesIcon,
  typography: TextAaIcon,
  spacing: RulerIcon,
  radius: CornersOutIcon,
  stroke: RectangleDashedIcon,
  elevation: StackIcon,
  motion: TornadoIcon,
  breakpoints: DevicesIcon,
  sizing: ArrowsOutCardinalIcon,
  icons: ShapesIcon,
};

/** A component page's description: the story's own, else the first component's JSDoc. */
export function storyDescription(id: string) {
  const story = stories.find((s) => s.id === id)?.story;
  if (!story) return '';
  const primary = story.components?.[0] ?? story.demo?.component;
  return story.description ?? (primary ? (componentDocs[primary]?.description ?? '') : '');
}

export const overviewPage: DocsPage = {
  href: '#/',
  title: 'Overview',
  kind: 'overview',
  description: 'Bland is a reusable UI kit: light and dark themes, a brand color swapped per project, Inter and Geist Mono, and components built only on tokens.',
  icon: WarehouseIcon,
};
export const stylePageList: DocsPage[] = stylePages.map((p) => ({
  href: `#/styles/${p.id}`,
  title: p.title,
  kind: 'style',
  description: leads[p.id],
  icon: styleIcons[p.id],
}));
export const componentPageList: DocsPage[] = stories.map((s) => ({
  href: `#/components/${s.id}`,
  title: s.story.title,
  kind: 'component',
  description: storyDescription(s.id),
}));
export const docsPages = [overviewPage, ...stylePageList, ...componentPageList];

export const PageIcon = ({ page }: { page: DocsPage }) =>
  page.icon ? (
    <Icon size="md">
      <page.icon />
    </Icon>
  ) : null;

/** Which style page shows a token's collection. */
const tokenPage: Record<string, StylePageId> = {
  Theme: 'colors',
  Typography: 'typography',
  'Text styles': 'typography',
  Spacing: 'spacing',
  'Corner Radius': 'radius',
  Stroke: 'stroke',
  Effects: 'elevation',
  'Effect styles': 'elevation',
  Motion: 'motion',
  Breakpoints: 'breakpoints',
  Sizing: 'sizing',
};

export type SearchHit = { href: string; title: string; detail?: string; page?: DocsPage };
export type SearchResults = { foundations: SearchHit[]; components: SearchHit[]; other: SearchHit[] };

const OTHER_LIMIT = 20;

/**
 * Pages whose title matches go under Foundations or Components; anything else that mentions the
 * words (a page's description, a component's prop, a token's name or use) goes under Other results,
 * with the text that matched. Every word of the query has to match, in any order.
 */
export function search(query: string): SearchResults {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  const all = (text: string) => words.every((w) => text.toLowerCase().includes(w));
  if (words.length === 0) {
    return {
      foundations: stylePageList.map((page) => ({ href: page.href, title: page.title, page })),
      components: componentPageList.map((page) => ({ href: page.href, title: page.title, page })),
      other: [],
    };
  }
  const titled = (list: DocsPage[]) => list.filter((p) => all(p.title)).map((page) => ({ href: page.href, title: page.title, page }));
  const foundations = titled([overviewPage, ...stylePageList]);
  const components = titled(componentPageList);
  const shown = new Set([...foundations, ...components].map((h) => h.href));

  const other: SearchHit[] = [];
  const add = (hit: SearchHit) => {
    if (other.length < OTHER_LIMIT && !other.some((o) => o.href === hit.href && o.detail === hit.detail)) other.push(hit);
  };
  for (const page of docsPages) if (!shown.has(page.href) && all(page.description)) add({ href: page.href, title: page.title, detail: page.description });
  for (const s of stories) {
    const names = s.story.components ?? (s.story.demo ? [s.story.demo.component] : []);
    for (const name of names)
      for (const prop of componentDocs[name]?.props ?? [])
        if (all(`${name} ${prop.name}`)) add({ href: `#/components/${s.id}`, title: s.story.title, detail: `${name} ${prop.name}: ${prop.description}` });
  }
  for (const t of tokens) {
    const page = tokenPage[t.collection];
    if (page && all(`${t.css} ${t.name} ${t.description}`)) add({ href: `#/styles/${page}`, title: t.css, detail: t.description || t.name });
  }
  return { foundations, components, other };
}
