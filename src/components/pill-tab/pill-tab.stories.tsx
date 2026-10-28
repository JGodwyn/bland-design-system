import type { Story } from '../../../playground/story';
import { InfoIcon, PlusIcon } from '../../icons';
import { PillTabs, type PillTabItem, type PillTabsSize } from './PillTabs';

const sizes: PillTabsSize[] = ['sm', 'md', 'lg'];
const names = ['All', 'Design', 'Code', 'Docs', 'Research', 'Marketing', 'Sales', 'Support'];
const tabs = (n: number, extra: Partial<PillTabItem> = {}): PillTabItem[] =>
  names.slice(0, n).map((label) => ({ id: label.toLowerCase(), label, ...extra }));
const withPanels = (items: PillTabItem[]) =>
  items.map((t) => ({ ...t, panel: <p className="pg-label">{t.label} panel</p> }));

export default {
  title: 'Pill tab',
  description:
    'Tabs drawn as pills, for switching between views of the same content.',
  usage: [
    'Pass `items`, each with an `id` and a `label`. Give an item a `panel` to show its content under the row.',
    'Name the row with `aria-label`.',
    'For filters people combine, use Pill: these are tabs, so one is always selected.',
  ],
  components: ['PillTabs'],
  demo: {
    component: 'PillTabs',
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
      <PillTabs
        {...(args as object)}
        aria-label="Demo"
        items={withPanels(tabs(Number(n), { icon: icon ? <PlusIcon /> : undefined, count: count ? 3 : undefined }))}
      />
    ),
    code: ({ tabs: n, icon, count, ...args }) => ({
      ...args,
      'aria-label': 'Topics',
      items: tabs(Number(n)).map((t) => ({ ...t, ...(icon ? { icon: '<PlusIcon />' } : {}), ...(count ? { count: 3 } : {}) })),
    }),
  },
  render: () => (
    <>
      {sizes.map((size) => (
        <div key={size} className="pg-stack">
          <span className="pg-label"><code>size="{size}"</code>: selected, rest, <code>icon</code>, <code>count</code>, icon only, <code>disabled</code></span>
          <PillTabs
            aria-label={`Topics ${size}`}
            size={size}
            items={[
              { id: 'a', label: 'All', count: 24 },
              { id: 'b', label: 'Design' },
              { id: 'c', label: 'Add', icon: <PlusIcon /> },
              { id: 'd', label: 'Code', count: 3 },
              { id: 'e', label: 'Info', icon: <InfoIcon />, hideLabel: true },
              { id: 'f', label: 'Archived', disabled: true },
            ]}
          />
        </div>
      ))}
      <div className="pg-stack">
        <span className="pg-label">The whole row <code>disabled</code></span>
        <PillTabs aria-label="Disabled row" disabled items={tabs(3, { count: 2 })} />
      </div>
      <div className="pg-stack">
        <span className="pg-label">Pills that don't fit scroll sideways; the fade shows there is more</span>
        <div style={{ maxWidth: 320 }}>
          <PillTabs aria-label="Overflowing" items={tabs(8)} />
        </div>
      </div>
      <div className="pg-stack">
        <span className="pg-label">Try it: tabs with a <code>panel</code> each</span>
        <PillTabs aria-label="With panels" data-testid="panels" items={withPanels(tabs(3))} />
      </div>
      <div className="pg-stack">
        <span className="pg-label">Keyboard focus: the ring shows when people tab to it (turned on here to show it)</span>
        <div className="pg-focus">
          <PillTabs aria-label="Focused" items={tabs(2)} />
        </div>
      </div>
    </>
  ),
} satisfies Story;
