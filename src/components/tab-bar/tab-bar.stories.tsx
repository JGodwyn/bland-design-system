import type { Story } from '../../../playground/story';
import { MagnifyingGlassIcon, PlusIcon, UserIcon } from '../../icons';
import { TabBar, type TabBarItem } from './TabBar';

// Stand-in icons for the story (Bland ships no icon pack; projects bring their own).
const HouseIcon = () => (
  <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 14.5L16 5L27 14.5V27H5V14.5Z" />
    <path d="M13 27V19H19V27" />
  </svg>
);
const BellIcon = () => (
  <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 14a8 8 0 0 1 16 0c0 7 3 9 3 9H5s3-2 3-9Z" />
    <path d="M13 27a3 3 0 0 0 6 0" />
  </svg>
);
const all: TabBarItem[] = [
  { id: 'home', label: 'Home', icon: <HouseIcon />, href: '#/home' },
  { id: 'search', label: 'Search', icon: <MagnifyingGlassIcon />, href: '#/search' },
  { id: 'new', label: 'New', icon: <PlusIcon />, href: '#/new' },
  { id: 'inbox', label: 'Inbox', icon: <BellIcon />, href: '#/inbox', indicator: 'new activity' },
  { id: 'profile', label: 'Profile', icon: <UserIcon />, href: '#/profile' },
];
const prevent = { onClick: (e: { preventDefault(): void }) => e.preventDefault() };

export default {
  title: 'Tab bar',
  description:
    'Mobile bottom navigation. Tabs sets the number of items (2 to 5) and Selected picks the current one, shown with an icon-brand icon and a text-brand bold label. Items share the width equally. A 1px border-subtle divider runs along the top. The indicator is a small danger dot with a ring on the icon for new activity. Sits in the page layout, so no elevation, and no hover state (touch). In code: a nav of links with aria-current="page" on the current one.',
  components: ['TabBar'],
  demo: {
    component: 'TabBar',
    args: { tabs: '4', defaultCurrent: 'home', labels: true },
    controls: {
      tabs: { kind: 'select', options: ['2', '3', '4', '5'] },
      defaultCurrent: { kind: 'select', options: all.map((i) => i.id) },
      current: false,
      labels: { kind: 'boolean' },
      items: false,
      renderLink: false,
    },
    // The key restarts it when defaultCurrent changes in the controls; pressing an item makes it current.
    render: ({ tabs: n, labels, defaultCurrent }) => (
      <div style={{ width: 384 }} {...prevent}>
        <TabBar
          key={defaultCurrent}
          defaultCurrent={defaultCurrent}
          items={all.slice(0, Number(n)).map((i) => ({ ...i, hideLabel: !labels }))}
        />
      </div>
    ),
    code: ({ tabs: n, labels, defaultCurrent }) => ({
      defaultCurrent,
      items: all.slice(0, Number(n)).map(({ icon: _icon, ...i }) => ({ ...i, icon: `<${i.label}Icon />`, ...(labels ? {} : { hideLabel: true }) })),
    }),
  },
  render: () => (
    <>
      {[2, 3, 4, 5].map((n) => (
        <div key={n} className="pg-stack" style={{ maxWidth: 384 }} {...prevent}>
          <span className="pg-label">{n} items; the first is current, press another to move it{n >= 4 ? ', Inbox has the indicator' : ''}</span>
          <TabBar aria-label={`Bar ${n}`} items={all.slice(0, n)} />
        </div>
      ))}
      <div className="pg-stack" style={{ maxWidth: 384 }} {...prevent}>
        <span className="pg-label">Another current item, and icons only (the labels stay as accessible names)</span>
        <TabBar aria-label="Inbox current" data-testid="inbox" defaultCurrent="inbox" items={all} />
        <TabBar aria-label="Icons only" defaultCurrent="search" items={all.map((i) => ({ ...i, hideLabel: true }))} />
      </div>
      <div className="pg-stack" style={{ maxWidth: 384 }} {...prevent}>
        <span className="pg-label">Focused: the ring shows on keyboard focus (:focus-visible); forced on here to show it</span>
        <div className="pg-focus">
          <TabBar aria-label="Focused" items={all.slice(0, 3)} />
        </div>
      </div>
    </>
  ),
} satisfies Story;
