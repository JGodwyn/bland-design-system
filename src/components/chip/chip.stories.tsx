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
    'A compact label for a value, such as a picked filter, a tag or a person. Add `onRemove` to give it a remove button.',
  usage: [
    '`count` adds a number after the label, such as how many results a filter matches.',
    'Put an Avatar or Indicator in `leading`.',
    'The remove button is named Remove plus the label; change it with `removeLabel`.',
    'For a filter people turn on and off, use Pill. For a status, use Badge.',
  ],
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
        <span className="pg-label"><code>size</code>: <code>sm</code> (default), <code>md</code>, <code>lg</code>; plain, with <code>count</code>, with <code>onRemove</code></span>
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
        <span className="pg-label"><code>leading</code>: an Avatar or an Indicator</span>
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
        <span className="pg-label">Keyboard focus on the remove button (turned on here to show it)</span>
        <div className="pg-row pg-focus">
          {sizes.map((size) => (
            <Chip key={size} size={size} onRemove={() => {}}>
              Focused {size}
            </Chip>
          ))}
        </div>
      </div>

      <div className="pg-stack">
        <span className="pg-label">Try it: the remove button removes that chip</span>
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
