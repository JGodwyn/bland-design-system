import type { Story } from '../../../playground/story';
import { UserIcon } from '../../icons';
import { Breadcrumb, type BreadcrumbItem } from './Breadcrumb';

// Hover is a CSS state, so it shows on interaction, not here.
const pages = ['Home', 'Projects', 'Bland', 'Components', 'Navigation', 'Breadcrumb', 'Overflow'];
const trail = (n: number): BreadcrumbItem[] =>
  pages.slice(0, n).map((label, i) => ({ label, href: `#/${pages.slice(1, i + 1).join('/')}` }));
// A stand-in home icon for the story (Bland ships no icon pack; projects bring their own).
const HouseIcon = () => (
  <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 14.5L16 5L27 14.5V27H5V14.5Z" />
    <path d="M13 27V19H19V27" />
  </svg>
);
const prevent = { onClick: (e: { preventDefault(): void }) => e.preventDefault() };

export default {
  title: 'Breadcrumb',
  description:
    'Shows where the current page sits in the site hierarchy. Crumbs is the total number of items shown, including the current page. Place it above the page title. For deep trails or narrow screens, keep the first item and the last two, and replace the middle with an overflow crumb.',
  components: ['Breadcrumb'],
  demo: {
    component: 'Breadcrumb',
    args: { crumbs: '4', maxItems: 'none' },
    controls: {
      crumbs: { kind: 'select', options: ['2', '3', '4', '5', '6', '7'] },
      maxItems: { kind: 'select', options: ['none', '4', '5', '6'] },
      items: false,
      renderLink: false,
      overflowLabel: false,
    },
    render: ({ crumbs, maxItems }) => (
      <Breadcrumb key={`${crumbs}-${maxItems}`} {...prevent} items={trail(Number(crumbs))} maxItems={maxItems === 'none' ? undefined : Number(maxItems)} />
    ),
    code: ({ crumbs, maxItems }) => ({ items: trail(Number(crumbs)), maxItems: maxItems === 'none' ? undefined : Number(maxItems) }),
  },
  render: () => (
    <>
      <div className="pg-stack">
        <span className="pg-label">Crumbs: 2 to 7; the last item is the current page</span>
        {[2, 3, 4, 5, 6, 7].map((n) => (
          <Breadcrumb key={n} {...prevent} aria-label={`Breadcrumb ${n}`} items={trail(n)} />
        ))}
      </div>
      <div className="pg-stack">
        <span className="pg-label">Collapsed (maxItems 4): first item, overflow, last two; press … for a menu of the rest</span>
        <Breadcrumb {...prevent} data-testid="collapsed" aria-label="Collapsed breadcrumb" items={trail(7)} maxItems={4} />
      </div>
      <div className="pg-stack">
        <span className="pg-label">Icons: with a label, and icon only (the label is its accessible name)</span>
        <Breadcrumb
          {...prevent}
          aria-label="Breadcrumb with icons"
          items={[
            { label: 'Home', href: '#/', icon: <HouseIcon />, hideLabel: true },
            { label: 'Team', href: '#/team', icon: <UserIcon /> },
            { label: 'Godwin', icon: <UserIcon /> },
          ]}
        />
      </div>
      <div className="pg-stack">
        <span className="pg-label">Focused: the ring shows on keyboard focus (:focus-visible); forced on here to show it</span>
        <div className="pg-focus">
          <Breadcrumb {...prevent} aria-label="Focused breadcrumb" items={trail(7)} maxItems={4} />
        </div>
      </div>
    </>
  ),
} satisfies Story;
