import { useState } from 'react';
import type { Story } from '../../../playground/story';
import { InfoIcon, UserIcon } from '../../icons';
import { SectionTabs, type SectionTabItem, type SectionTabsSize } from './SectionTabs';

const sizes: SectionTabsSize[] = ['sm', 'md', 'lg'];
const names = ['Overview', 'Activity', 'Members', 'Settings', 'Billing', 'Usage', 'Security', 'Logs'];
const tabs = (n: number, extra: Partial<SectionTabItem> = {}): SectionTabItem[] =>
  names.slice(0, n).map((label) => ({ id: label.toLowerCase(), label, ...extra }));
const withPanels = (items: SectionTabItem[]) =>
  items.map((t) => ({ ...t, panel: <p className="pg-label">{t.label} panel</p> }));

/** Controlled tabs that report the selection, for tests/section-tab.spec.ts. */
function Controlled() {
  const [value, setValue] = useState('activity');
  return (
    <div className="pg-stack">
      <SectionTabs aria-label="Controlled" data-testid="controlled" items={withPanels(tabs(4))} value={value} onValueChange={setValue} />
      <output className="pg-label" data-testid="controlled-value">
        {value}
      </output>
    </div>
  );
}

export default {
  title: 'Section tab',
  description:
    'Underlined tabs that switch between sections of a page or panel.',
  usage: [
    'Pass `items`, each with an `id` and a `label`. Give an item a `panel` to show its content under the row.',
    'Add an `icon` or a `count` to an item. `hideLabel` shows the icon alone; the label stays as its name.',
    'Name the row with `aria-label`. Tabs that don\'t fit scroll sideways.',
  ],
  components: ['SectionTabs'],
  demo: {
    component: 'SectionTabs',
    args: { tabs: '4', size: 'sm', icon: false, count: false, disabled: false },
    controls: {
      tabs: { kind: 'select', options: ['2', '3', '4', '5', '6', '7', '8'] },
      icon: { kind: 'boolean' },
      count: { kind: 'boolean' },
      items: false,
      value: false,
      defaultValue: false,
    },
    render: ({ tabs: n, icon, count, ...args }) => (
      <SectionTabs
        {...(args as object)}
        aria-label="Demo"
        items={withPanels(tabs(Number(n), { icon: icon ? <InfoIcon /> : undefined, count: count ? 3 : undefined }))}
      />
    ),
    code: ({ tabs: n, icon, count, ...args }) => ({
      ...args,
      'aria-label': 'Sections',
      items: tabs(Number(n)).map((t) => ({ ...t, ...(icon ? { icon: '<InfoIcon />' } : {}), ...(count ? { count: 3 } : {}) })),
    }),
  },
  render: () => (
    <>
      {sizes.map((size) => (
        <div key={size} className="pg-stack">
          <span className="pg-label"><code>size="{size}"</code>: selected, rest, with <code>icon</code> and <code>count</code>, <code>disabled</code></span>
          <SectionTabs
            aria-label={`Sections ${size}`}
            size={size}
            items={[
              { id: 'a', label: 'Overview' },
              { id: 'b', label: 'Activity' },
              { id: 'c', label: 'Members', icon: <UserIcon />, count: 12 },
              { id: 'd', label: 'Archived', disabled: true, count: 4 },
            ]}
          />
        </div>
      ))}
      <div className="pg-stack">
        <span className="pg-label">The whole row <code>disabled</code>, and a tab with <code>hideLabel</code></span>
        <SectionTabs aria-label="Disabled row" disabled items={tabs(3)} />
        <SectionTabs
          aria-label="Icon only"
          items={[
            { id: 'a', label: 'Overview' },
            { id: 'b', label: 'Info', icon: <InfoIcon />, hideLabel: true },
          ]}
        />
      </div>
      <div className="pg-stack">
        <span className="pg-label">Tabs that don't fit scroll sideways; the fade shows there is more</span>
        <div style={{ maxWidth: 320 }}>
          <SectionTabs aria-label="Overflowing" data-testid="overflow" items={tabs(8)} />
        </div>
      </div>
      <div className="pg-stack">
        <span className="pg-label">Try it: tabs with a <code>panel</code> each</span>
        <Controlled />
      </div>
      <div className="pg-stack">
        <span className="pg-label">Keyboard focus: the ring shows when people tab to it (turned on here to show it)</span>
        <div className="pg-focus">
          <SectionTabs aria-label="Focused" items={tabs(2)} />
        </div>
      </div>
    </>
  ),
} satisfies Story;
