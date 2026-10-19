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
    'A row of tabs drawn as Pills (one pill look across filters and tabs), space-xs apart. Tabs sets the number of pills; the first is selected and takes the Control/checked fill. In code the pills here are tabs (role="tab", aria-selected), unlike filter Pills (aria-pressed). The row scrolls sideways when the pills do not fit, with the fade alone.',
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
          <span className="pg-label">size={size}: selected, rest, icon, count, icon only, disabled</span>
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
        <span className="pg-label">The whole row disabled</span>
        <PillTabs aria-label="Disabled row" disabled items={tabs(3, { count: 2 })} />
      </div>
      <div className="pg-stack">
        <span className="pg-label">Overflow: eight pills in 320px scroll sideways; the fade shows there is more (no scrollbar)</span>
        <div style={{ maxWidth: 320 }}>
          <PillTabs aria-label="Overflowing" items={tabs(8)} />
        </div>
      </div>
      <div className="pg-stack">
        <span className="pg-label">With panels (used by the behaviour tests)</span>
        <PillTabs aria-label="With panels" data-testid="panels" items={withPanels(tabs(3))} />
      </div>
      <div className="pg-stack">
        <span className="pg-label">Focused: the ring shows on keyboard focus (:focus-visible); forced on here to show it</span>
        <div className="pg-focus">
          <PillTabs aria-label="Focused" items={tabs(2)} />
        </div>
      </div>
    </>
  ),
} satisfies Story;
