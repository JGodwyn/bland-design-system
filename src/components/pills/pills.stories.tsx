import { useState } from 'react';
import type { Story } from '../../../playground/story';
import { CheckIcon, PlusIcon } from '../../icons';
import { Pill, type PillSize } from './Pill';

const sizes: PillSize[] = ['sm', 'md', 'lg'];

// Option names match the icon exports, so the docs code snippet reads like real usage.
const icons = { none: undefined, PlusIcon: <PlusIcon />, CheckIcon: <CheckIcon /> } as const;

/** A controlled pill that reports its state, so tests/pills.spec.ts can check toggling. */
function Controlled() {
  const [on, setOn] = useState(false);
  return (
    <span className="pg-row">
      <Pill selected={on} onSelectedChange={setOn} data-testid="controlled">
        Controlled
      </Pill>
      <output className="pg-label" data-testid="controlled-state">
        {String(on)}
      </output>
    </span>
  );
}

export default {
  title: 'Pills',
  description:
    'Selectable pill for filters and quick choices. Size sm, md, lg (32, 40, 48 high, never narrower than high). Selected uses the Control/checked tokens with white content in both modes. States rest, hover, disabled; focus shows the 2px ring. Optional leading icon and a count badge (an Indicator). In code: a toggle button with aria-pressed.',
  components: ['Pill'],
  demo: {
    component: 'Pill',
    args: { children: 'Design', size: 'sm', defaultSelected: false, disabled: false, icon: 'none', count: '' },
    controls: {
      children: { kind: 'text' },
      icon: { kind: 'select', options: Object.keys(icons) },
      count: { kind: 'text' },
      disabled: { kind: 'boolean' },
      selected: false,
      htmlType: false,
    },
    // The key resets the pill's own state when defaultSelected changes in the controls.
    render: ({ icon, count, ...args }) => (
      <Pill
        key={String(args.defaultSelected)}
        {...(args as object)}
        icon={icons[icon as keyof typeof icons]}
        count={count === '' ? undefined : count}
      >
        {args.children}
      </Pill>
    ),
  },
  render: () => (
    <>
      {[false, true].map((selected) => (
        <div key={String(selected)} className="pg-stack">
          <span className="pg-label">selected={String(selected)}: rest, icon, count, icon only, then disabled</span>
          {sizes.map((size) => (
            <div key={size} className="pg-row">
              <Pill size={size} selected={selected}>
                Pill {size}
              </Pill>
              <Pill size={size} selected={selected} icon={<PlusIcon />}>
                Icon
              </Pill>
              <Pill size={size} selected={selected} count={3}>
                Count
              </Pill>
              <Pill size={size} selected={selected} icon={<PlusIcon />} aria-label="Add" />
              <Pill size={size} selected={selected} icon={<PlusIcon />} count={3} disabled>
                Disabled
              </Pill>
            </div>
          ))}
        </div>
      ))}

      <div className="pg-stack">
        <span className="pg-label">Focused: the ring shows on keyboard focus (:focus-visible); forced on here to show it</span>
        <div className="pg-row pg-focus">
          <Pill>Focused</Pill>
          <Pill selected size="md">
            Focused
          </Pill>
          <Pill size="lg" icon={<PlusIcon />} aria-label="Add" />
        </div>
      </div>

      <div className="pg-stack">
        <span className="pg-label">Toggling (used by the behaviour tests)</span>
        <div className="pg-row">
          <Pill data-testid="uncontrolled">Uncontrolled</Pill>
          <Controlled />
          <Pill disabled data-testid="disabled">
            Disabled
          </Pill>
        </div>
      </div>

      <div className="pg-stack">
        <span className="pg-label">A long label truncates with an ellipsis</span>
        <div className="pg-row" style={{ maxWidth: 200 }}>
          <Pill icon={<PlusIcon />}>A label far too long for the space it has</Pill>
        </div>
      </div>
    </>
  ),
} satisfies Story;
