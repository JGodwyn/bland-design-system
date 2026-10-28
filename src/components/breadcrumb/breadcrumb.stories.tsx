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
    'Shows where the current page sits in the site\'s hierarchy and links back up through it. Place it above the page title.',
  usage: [
    'List `items` from the top level down. The last one is the current page and isn\'t a link.',
    'Set `maxItems` for deep trails: Bland keeps the first item and the last two, and folds the rest into a menu.',
    'Pass `renderLink` to render your router\'s link component.',
    'Don\'t use it on flat sites, or as a page\'s only navigation.',
  ],
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
        <span className="pg-label">2 to 7 <code>items</code>; the last is the current page</span>
        {[2, 3, 4, 5, 6, 7].map((n) => (
          <Breadcrumb key={n} {...prevent} aria-label={`Breadcrumb ${n}`} items={trail(n)} />
        ))}
      </div>
      <div className="pg-stack">
        <span className="pg-label"><code>maxItems={4}</code>: the first item, the last two, and … for a menu of the rest</span>
        <Breadcrumb {...prevent} data-testid="collapsed" aria-label="Collapsed breadcrumb" items={trail(7)} maxItems={4} />
      </div>
      <div className="pg-stack">
        <span className="pg-label"><code>icon</code> with a label, and <code>hideLabel</code> (the label stays as its name)</span>
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
        <span className="pg-label">Keyboard focus: the ring shows when people tab to it (turned on here to show it)</span>
        <div className="pg-focus">
          <Breadcrumb {...prevent} aria-label="Focused breadcrumb" items={trail(7)} maxItems={4} />
        </div>
      </div>
    </>
  ),
} satisfies Story;
