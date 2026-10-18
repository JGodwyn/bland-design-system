import { useState } from 'react';
import type { Story } from '../../../playground/story';
import { Avatar } from '../avatar/Avatar';
import { Indicator } from '../indicator/Indicator';
import { Chip, type ChipSize } from './Chip';

const sizes: ChipSize[] = ['sm', 'md', 'lg'];

/** Chips that remove themselves, so tests/chip.spec.ts can check the close button. */
function RemovableList() {
  const [tags, setTags] = useState(['Design', 'Research', 'Writing']);
  return (
    <div className="pg-row" data-testid="removable">
      {tags.map((tag) => (
        <Chip key={tag} onRemove={() => setTags((t) => t.filter((x) => x !== tag))}>
          {tag}
        </Chip>
      ))}
      <output className="pg-label" data-testid="removable-count">
        {tags.length}
      </output>
    </div>
  );
}

export default {
  title: 'Chip',
  description:
    'Compact label for a value, filter or attribute. Size sm, md, lg (20, 24, 32 high). Type default shows the label only; cancellable adds a close button; countable adds a count box matching the close box. A leading slot holds one Avatar or Indicator. The close button is smaller than a 24px target on sm and md, so in code its hit area is extended to 24.',
  components: ['Chip'],
  demo: {
    component: 'Chip',
    args: { children: 'Design', size: 'sm', count: '', onRemove: false },
    controls: {
      children: { kind: 'text' },
      count: { kind: 'text' },
      onRemove: { kind: 'boolean' },
      removeLabel: false,
    },
    render: ({ onRemove, count, ...args }) => (
      <Chip {...(args as object)} count={count === '' ? undefined : count} onRemove={onRemove ? () => {} : undefined}>
        {args.children}
      </Chip>
    ),
  },
  render: () => (
    <>
      <div className="pg-stack">
        <span className="pg-label">Sizes sm 20 (default), md 24, lg 32: default, countable, cancellable</span>
        {sizes.map((size) => (
          <div key={size} className="pg-row">
            <Chip size={size}>Chip {size}</Chip>
            <Chip size={size} count={1}>
              Countable
            </Chip>
            <Chip size={size} count={128}>
              Wide count
            </Chip>
            <Chip size={size} onRemove={() => {}}>
              Cancellable
            </Chip>
          </div>
        ))}
      </div>

      <div className="pg-stack">
        <span className="pg-label">Leading slot: one Avatar or Indicator</span>
        {sizes.map((size) => (
          <div key={size} className="pg-row">
            <Chip size={size} leading={<Avatar size="xs" initials="GJ" />}>
              Godwin
            </Chip>
            <Chip size={size} leading={<Indicator size="md" emotion="success" />} onRemove={() => {}}>
              Online
            </Chip>
          </div>
        ))}
      </div>

      <div className="pg-stack">
        <span className="pg-label">Focused close button: the ring shows on keyboard focus; forced on here to show it</span>
        <div className="pg-row pg-focus">
          {sizes.map((size) => (
            <Chip key={size} size={size} onRemove={() => {}}>
              Focused {size}
            </Chip>
          ))}
        </div>
      </div>

      <div className="pg-stack">
        <span className="pg-label">Pressing a close button removes that chip (used by the behaviour tests)</span>
        <RemovableList />
      </div>

      <div className="pg-stack">
        <span className="pg-label">A long label truncates with an ellipsis</span>
        <div className="pg-row" style={{ maxWidth: 200 }}>
          <Chip size="md" onRemove={() => {}}>
            A label far too long for the space it has
          </Chip>
        </div>
      </div>
    </>
  ),
} satisfies Story;
