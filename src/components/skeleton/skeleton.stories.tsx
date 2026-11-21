import type { Story } from '../../../playground/story';
import {
  Skeleton,
  SkeletonGroup,
  type SkeletonRadius,
  type SkeletonShape,
  type SkeletonSize,
  type SkeletonTextType,
} from './Skeleton';

const types: SkeletonTextType[] = [
  'body-sm',
  'body-md',
  'body-lg',
  'title-sm',
  'title-md',
  'title-lg',
  'heading-sm',
  'heading-md',
  'heading-lg',
];
const sizes: SkeletonSize[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'];
const radii: SkeletonRadius[] = ['null', 'xs', 'sm', 'md', 'lg', 'xl'];
const box = { width: 'var(--empty-state-width-lg)', maxWidth: '100%' };

export default {
  title: 'Skeleton',
  description:
    'Holds the space of text, an avatar or an image while it loads, so nothing jumps when the content arrives. Text lines take the line height of the `type` they stand in for.',
  usage: [
    'Match the content: `type` is the text style the real text uses, `size` the Avatar size.',
    'Wrap the loading region in `SkeletonGroup`. It sets `aria-busy` and tells screen readers "Loading" once; each Skeleton is hidden from them.',
    'Set `loading={false}` on the group and swap the skeletons for the content when it arrives.',
    'Give a `rect` a height or an aspect-ratio of its own; it fills its container\'s width.',
  ],
  components: ['Skeleton', 'SkeletonGroup'],
  demo: {
    component: 'Skeleton',
    args: { shape: 'text', type: 'body-md', lines: '3', size: 'md', radius: 'md' },
    controls: {
      shape: { kind: 'select', options: ['text', 'circle', 'rect'] },
      type: { kind: 'select', options: types },
      lines: { kind: 'select', options: ['1', '2', '3', '4', '5'] },
      size: { kind: 'select', options: sizes },
      radius: { kind: 'select', options: radii },
    },
    render: ({ shape, lines, ...args }) => {
      const skeleton = <Skeleton {...(args as object)} shape={shape as SkeletonShape} lines={Number(lines)} />;
      // Text and rect fill a box; a circle has its own size, so it sits alone and the demo view centres it.
      return shape === 'circle' ? skeleton : <div style={box}>{skeleton}</div>;
    },
    code: ({ shape, type, lines, size, radius }) => ({
      shape,
      ...(shape === 'text' && { type, lines: Number(lines) }),
      ...(shape === 'circle' && { size }),
      ...(shape === 'rect' && { radius }),
    }),
  },
  render: () => (
    <>
      <div className="pg-stack">
        <span className="pg-label">
          <code>shape="text"</code>, each <code>type</code> with <code>lines={'{3}'}</code>: the last line is 60% wide
        </span>
        <div className="pg-row" style={{ alignItems: 'flex-start' }}>
          {types.map((type) => (
            <div key={type} className="pg-stack" style={{ width: 'var(--empty-state-width-sm)' }}>
              <code>{type}</code>
              <Skeleton type={type} lines={3} />
            </div>
          ))}
        </div>
      </div>

      <div className="pg-stack">
        <span className="pg-label">One line is full width, and takes exactly the line height of its text</span>
        <div className="pg-row" style={{ alignItems: 'flex-start' }}>
          <div style={{ width: 'var(--empty-state-width-sm)' }}>
            <Skeleton type="title-lg" data-testid="title-skeleton" />
          </div>
          <div style={{ width: 'var(--empty-state-width-sm)', font: 'var(--type-title-lg)', color: 'var(--text-bold)' }} data-testid="title-text">
            The real title
          </div>
        </div>
      </div>

      <div className="pg-stack">
        <span className="pg-label">
          <code>shape="circle"</code>, Avatar's sizes <code>xs</code> to <code>3xl</code>
        </span>
        <div className="pg-row">
          {sizes.map((size) => (
            <Skeleton key={size} shape="circle" size={size} />
          ))}
        </div>
      </div>

      <div className="pg-stack">
        <span className="pg-label">
          <code>shape="rect"</code>: 16:9 by default, any <code>radius</code> from the scale
        </span>
        <div className="pg-row" style={{ alignItems: 'flex-start' }}>
          {radii.map((radius) => (
            <div key={radius} className="pg-stack" style={{ width: 'var(--avatar-3xl)' }}>
              <code>{radius}</code>
              <Skeleton shape="rect" radius={radius} />
            </div>
          ))}
        </div>
      </div>

      <div className="pg-stack">
        <span className="pg-label">
          In a <code>SkeletonGroup</code>: a list row and a card while they load, on the page and on a card
        </span>
        <div className="pg-row" style={{ alignItems: 'flex-start' }}>
          {[
            { padding: 'var(--space-lg)' },
            { padding: 'var(--space-lg)', background: 'var(--surface-raised)', boxShadow: 'var(--elevation-neutral-near)', borderRadius: 'var(--rad-lg)' },
          ].map((card, i) => (
            <SkeletonGroup key={i} className="pg-stack" style={{ ...box, ...card }}>
              <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'flex-start' }}>
                <Skeleton shape="circle" size="lg" />
                <Skeleton type="body-lg" lines={2} style={{ flex: 1 }} />
              </div>
              <Skeleton shape="rect" />
              <Skeleton type="title-md" />
              <Skeleton type="body-md" lines={3} />
            </SkeletonGroup>
          ))}
        </div>
      </div>
    </>
  ),
} satisfies Story;
