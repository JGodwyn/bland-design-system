import type { CSSProperties, ReactNode } from 'react';
import type { Story } from '../../../playground/story';
import { MagnifyingGlassIcon, UserIcon } from '../../icons';
import { Button } from '../button/Button';
import { Icon } from '../icon/Icon';
import { Sidebar, type SidebarItem, type SidebarProps } from './Sidebar';

// Stand-in icons for the story (Bland ships no icon pack; projects bring their own).
const svg = { viewBox: '0 0 32 32', fill: 'none', stroke: 'currentColor', strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
const HouseIcon = () => (
  <svg {...svg}>
    <path d="M5 14.5L16 5L27 14.5V27H5V14.5Z" />
    <path d="M13 27V19H19V27" />
  </svg>
);
const TrayIcon = () => (
  <svg {...svg}>
    <path d="M5 19H11L13 22H19L21 19H27" />
    <path d="M5 19L8 7H24L27 19V26H5V19Z" />
  </svg>
);
const FolderIcon = () => (
  <svg {...svg}>
    <path d="M4 9V25H28V11H15L12 8H5L4 9Z" />
  </svg>
);
const CalendarIcon = () => (
  <svg {...svg}>
    <path d="M5 7H27V27H5V7Z" />
    <path d="M5 12H27M10 4V8M22 4V8" />
  </svg>
);
const ChartIcon = () => (
  <svg {...svg}>
    <path d="M5 27V5M5 27H27M11 21V15M17 21V10M23 21V17" />
  </svg>
);
const GearIcon = () => (
  <svg {...svg}>
    <path d="M16 21A5 5 0 1 0 16 11A5 5 0 0 0 16 21Z" />
    <path d="M16 3V7M16 25V29M3 16H7M25 16H29M7 7L10 10M22 22L25 25M7 25L10 22M22 10L25 7" />
  </svg>
);
const ArrowUpRightIcon = () => (
  <svg {...svg}>
    <path d="M9 23L23 9M11 9H23V21" />
  </svg>
);

const items: SidebarItem[] = [
  { id: 'home', label: 'Home', icon: <HouseIcon />, href: '#home' },
  { id: 'inbox', label: 'Inbox', icon: <TrayIcon />, href: '#inbox', count: 8 },
  { id: 'search', label: 'Search', icon: <MagnifyingGlassIcon />, href: '#search' },
  {
    id: 'projects',
    label: 'Projects',
    icon: <FolderIcon />,
    items: [
      { id: 'website', label: 'Website', icon: <FolderIcon />, href: '#website' },
      { id: 'mobile', label: 'Mobile app', icon: <FolderIcon />, href: '#mobile', count: 3 },
      { id: 'brand', label: 'Brand refresh', icon: <FolderIcon />, href: '#brand' },
    ],
  },
  { id: 'calendar', label: 'Calendar', icon: <CalendarIcon />, href: '#calendar' },
  { id: 'reports', label: 'Reports', icon: <ChartIcon />, href: '#reports', disabled: true },
  { id: 'team', label: 'Team', icon: <UserIcon />, href: '#team' },
  { id: 'docs', label: 'Documentation', icon: <ChartIcon />, href: '#docs', trailing: <ArrowUpRightIcon /> },
  { id: 'settings', label: 'Settings', icon: <GearIcon />, href: '#settings' },
];

const many: SidebarItem[] = Array.from({ length: 24 }, (_, i) => ({
  id: `page-${i + 1}`,
  label: `Page ${i + 1}`,
  icon: <FolderIcon />,
  href: `#page-${i + 1}`,
}));

// Links stay on the docs page: the story's hrefs are fragments, which the playground would read as routes.
const prevent = { onClick: (e: { preventDefault(): void }) => e.preventDefault() };

/** A page-wide box: one sidebar per row, so collapsing one never moves another. Never narrower than the sidebar, so on a phone the demo scrolls instead of clipping it. */
function Frame({ children, height = 'var(--sidebar-height)', width = '100%' }: { children: ReactNode; height?: string; width?: string }) {
  // At least as wide as the full sidebar beside the page's padding, so a rail's peek fits inside the frame.
  const style: CSSProperties = { display: 'flex', height, width, minWidth: 'calc(var(--sidebar-width) + var(--space-xl) * 2)', boxShadow: 'inset 0 0 0 var(--stroke-sm) var(--border-subtle)', overflow: 'hidden' };
  return (
    <div style={style} {...prevent}>
      {children}
      <div style={{ flex: 1, minWidth: 0, padding: 'var(--space-xl)', background: 'var(--surface-100)', color: 'var(--text-subtle)', font: 'var(--type-body-lg)' }}>
        Page content
      </div>
    </div>
  );
}

const pad = { padding: 'var(--space-sm) var(--space-md)' };
const Logo = ({ rail }: { rail: boolean }) => (
  <div style={{ ...pad, ...(rail ? { paddingInline: 0 } : {}), font: 'var(--type-title-md)', color: 'var(--text-bold)' }}>
    {rail ? 'B' : 'Bland'}
  </div>
);
const Plan = ({ rail }: { rail: boolean }) =>
  rail ? (
    <div style={{ ...pad, paddingInline: 0, display: 'flex' }}>
      <Icon size="md" label="Account" style={{ color: 'var(--icon-subtle)' }}>
        <UserIcon />
      </Icon>
    </div>
  ) : (
    <div style={{ padding: 'var(--space-md) var(--space-lg) var(--space-lg)', display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)', alignItems: 'flex-start' }}>
      <span style={{ font: 'var(--type-body-lg)', color: 'var(--text-subtle)' }}>Free plan</span>
      <Button size="sm">Upgrade</Button>
    </div>
  );
const sizes = ['sm', 'md', 'lg', 'xl'] as const;

export default {
  title: 'Sidebar',
  description:
    'The main navigation of an app, down the side of the screen. It can shrink to a rail of icons.',
  usage: [
    'Pass `items`; every row is a link (`renderLink` renders your router\'s). A row with its own `items` opens and folds a group.',
    'Turn on `collapsible` to let people shrink it to the rail. Resting the pointer on the rail opens it over the page.',
    'The open rail draws past its own box, over the page: keep the space beside the rail free of `overflow: hidden` up to the full sidebar width, or the peek is cut off.',
    'Put the logo or workspace switcher in `top`, and the account or settings in `bottom`.',
    'For the rail, pass `top` as a function of `{ rail }` and return a logo mark when `rail` is true. A plain logo has no rail version, so the rail shows the expand button instead.',
    'On mobile, hide it and use TabBar.',
  ],
  components: ['Sidebar'],
  demo: {
    component: 'Sidebar',
    // Room for the whole sidebar (sidebar/height) and the stage's padding.
    height: 736,
    args: { size: 'sm', defaultCurrent: 'home', defaultMinimized: false, collapsible: true, slots: true },
    controls: {
      defaultCurrent: { kind: 'select', options: ['home', 'inbox', 'search', 'website', 'mobile', 'brand', 'calendar', 'team', 'settings'] },
      slots: { kind: 'boolean' },
      current: false,
      minimized: false,
      expanded: false,
      defaultExpanded: false,
      items: false,
      renderLink: false,
    },
    // The key restarts it when a default changes in the controls.
    // As wide as the playground, so a collapse never re-centres the demo.
    render: ({ slots, ...args }) => (
      <Frame width="100cqi">
        <Sidebar
          key={`${args.defaultCurrent}-${args.defaultMinimized}`}
          {...(args as Partial<SidebarProps>)}
          items={items}
          top={slots ? ({ rail }) => <Logo rail={rail} /> : undefined}
          bottom={slots ? ({ rail }) => <Plan rail={rail} /> : undefined}
        />
      </Frame>
    ),
    code: ({ slots, ...args }) => ({
      ...args,
      items: '{items}',
      ...(slots ? { top: '<Logo />', bottom: '<Plan />' } : {}),
    }),
  },
  render: () => (
    <>
      <div className="pg-stack">
        <span className="pg-label"><code>size</code>: <code>sm</code>, <code>md</code>, <code>lg</code>, <code>xl</code>; Projects is open because Mobile app is current</span>
        <div className="pg-stack">
          {sizes.map((size) => (
            <Frame key={size}>
              <Sidebar aria-label={`Size ${size}`} size={size} items={items} defaultCurrent="mobile" collapsible />
            </Frame>
          ))}
        </div>
      </div>
      <div className="pg-stack">
        <span className="pg-label"><code>minimized</code>: the icon rail at each size; rest the pointer on it, or tab into it, to open the full sidebar over the page</span>
        <div className="pg-stack">
          {sizes.map((size) => (
            <Frame key={size} height="var(--sidebar-height)">
              <Sidebar aria-label={`Rail ${size}`} data-testid={`rail-${size}`} size={size} items={items} defaultMinimized collapsible />
            </Frame>
          ))}
        </div>
      </div>
      <div className="pg-stack">
        <span className="pg-label"><code>top</code> and <code>bottom</code> with <code>collapsible</code>; the list scrolls between them</span>
        <div className="pg-stack">
          <Frame height="var(--sidebar-height)">
            <Sidebar
              aria-label="With slots"
              data-testid="slots"
              items={[...items, ...many]}
              collapsible
              top={({ rail }) => <Logo rail={rail} />}
              bottom={({ rail }) => <Plan rail={rail} />}
            />
          </Frame>
        </div>
      </div>
      <div className="pg-stack">
        <span className="pg-label">A plain <code>top</code> with no rail version: it fades out as the sidebar collapses, and the rail shows the expand button instead</span>
        <div className="pg-stack">
          <Frame height="var(--sidebar-height)">
            <Sidebar aria-label="Plain top" data-testid="plain-top" items={items} collapsible top={<Logo rail={false} />} />
          </Frame>
        </div>
      </div>
      <div className="pg-stack">
        <span className="pg-label">Current, <code>disabled</code> (Reports), current and disabled, a <code>count</code> on the current row, a closed group</span>
        <div className="pg-stack">
          <Frame height="var(--sidebar-height)">
            <Sidebar aria-label="Current inbox" items={items.slice(0, 6)} defaultCurrent="inbox" />
          </Frame>
          <Frame height="var(--sidebar-height)">
            <Sidebar
              aria-label="Current and disabled"
              items={items.slice(0, 6)}
              current="reports"
            />
          </Frame>
        </div>
      </div>
      <div className="pg-stack">
        <span className="pg-label">Keyboard focus: the ring shows when people tab to it (turned on here to show it)</span>
        <div className="pg-focus pg-stack">
          <Frame height="var(--sidebar-height)">
            <Sidebar aria-label="Focused" items={items.slice(0, 4)} collapsible top={({ rail }) => <Logo rail={rail} />} />
          </Frame>
        </div>
      </div>
    </>
  ),
} satisfies Story;
