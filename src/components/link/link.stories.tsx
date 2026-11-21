import type { Story } from '../../../playground/story';
import { CaretRightIcon, FileIcon, PlusIcon } from '../../icons';
import { Link, type LinkColor, type LinkSize, type LinkUnderline } from './Link';

// Hover is a CSS state, so it shows on interaction, not here; tests/link.spec.ts covers it.
// Option names match the icon exports, so the docs code snippet reads like real usage.
const icons = { none: undefined, FileIcon: <FileIcon />, PlusIcon: <PlusIcon />, CaretRightIcon: <CaretRightIcon /> } as const;
const sizes: LinkSize[] = ['sm', 'md', 'lg'];
const underlines: LinkUnderline[] = ['always', 'hover'];
const colors: LinkColor[] = ['link', 'inherit'];
const prevent = { onClick: (e: { preventDefault(): void }) => e.preventDefault() };
const text = (font: string) => ({ font: `var(--type-${font})`, color: 'var(--text-bold)', margin: 0, maxWidth: '28ch' });

export default {
  title: 'Link',
  description:
    'Takes people to another page or place, inside running text or on its own. Without a `size` it takes the font of the text around it.',
  usage: [
    'Leave `size` off inside running text; set `sm`, `md` or `lg` for a link on its own.',
    'Keep `underline="always"` in running text, so the link stands out by more than its color. Use `hover` for links on their own and lists of links.',
    '`color="inherit"` takes the color of the text around it: footers, legal text, a link on a brand fill.',
    'With `target="_blank"` the link shows an arrow and tells screen readers it opens a new tab.',
    'Pass `renderLink` to render your router\'s link component. For an action that stays on the page, use a Button.',
  ],
  components: ['Link'],
  demo: {
    component: 'Link',
    args: {
      children: 'Read the release notes',
      size: 'lg',
      underline: 'always',
      color: 'link',
      iconStart: 'none',
      iconEnd: 'none',
      target: 'none',
    },
    controls: {
      children: { kind: 'text' },
      size: { kind: 'select', options: ['inherit', ...sizes] },
      iconStart: { kind: 'select', options: Object.keys(icons) },
      iconEnd: { kind: 'select', options: Object.keys(icons) },
      target: { kind: 'select', options: ['none', '_blank'] },
      href: false,
      external: false,
      newTabLabel: false,
      renderLink: false,
      ref: false,
    },
    render: ({ size, iconStart, iconEnd, target, ...args }) => {
      const link = (
        <Link
          {...(args as object)}
          {...prevent}
          href="#/components/link"
          size={size === 'inherit' ? undefined : (size as LinkSize)}
          target={target === 'none' ? undefined : target}
          iconStart={icons[iconStart as keyof typeof icons]}
          iconEnd={icons[iconEnd as keyof typeof icons]}
        >
          {args.children}
        </Link>
      );
      // "inherit" is no size prop: shown inside a sentence, so the link visibly takes the text's font.
      return size === 'inherit' ? (
        <p style={text('body-lg')}>
          Before you ship, {link} and check what changed.
        </p>
      ) : (
        link
      );
    },
    code: ({ size, iconStart, iconEnd, target, ...args }) => ({
      href: '/releases',
      ...args,
      size: size === 'inherit' ? undefined : size,
      target: target === 'none' ? undefined : target,
      iconStart: iconStart === 'none' ? undefined : `<${iconStart} />`,
      iconEnd: iconEnd === 'none' ? undefined : `<${iconEnd} />`,
    }),
  },
  render: () => (
    <>
      {underlines.map((underline) =>
        colors.map((color) => (
          <div key={`${underline}-${color}`} className="pg-stack">
            <span className="pg-label">
              <code>underline="{underline}"</code> <code>color="{color}"</code>: <code>sm</code>, <code>md</code>, <code>lg</code>
            </span>
            <div className="pg-row">
              {sizes.map((size) => (
                <Link key={size} {...prevent} href="#/components/link" size={size} underline={underline} color={color}>
                  Link {size}
                </Link>
              ))}
            </div>
          </div>
        )),
      )}

      <div className="pg-stack">
        <span className="pg-label">No <code>size</code>: inside running text it takes the text's font and wraps with it</span>
        <p style={text('body-lg')} data-testid="running-text">
          Bland gives every project the same parts. Read the{' '}
          <Link {...prevent} href="#/components/link">
            guide to setting up a brand color for your project
          </Link>{' '}
          before you start, then pick your fonts.
        </p>
        <p style={text('body-sm')}>
          Smaller text keeps a smaller link: see the{' '}
          <Link {...prevent} href="#/components/link" iconEnd={<CaretRightIcon />}>
            changelog
          </Link>
          .
        </p>
      </div>

      <div className="pg-stack">
        <span className="pg-label"><code>iconStart</code> and <code>iconEnd</code>, never underlined</span>
        <div className="pg-row">
          {sizes.map((size) => (
            <Link key={size} {...prevent} href="#/components/link" size={size} underline="hover" iconStart={<FileIcon />}>
              Documentation
            </Link>
          ))}
          <Link {...prevent} href="#/components/link" size="md" iconEnd={<CaretRightIcon />}>
            All components
          </Link>
        </div>
      </div>

      <div className="pg-stack">
        <span className="pg-label"><code>target="_blank"</code>: the external mark, and "(opens in a new tab)" for screen readers</span>
        <div className="pg-row">
          {sizes.map((size) => (
            <Link key={size} {...prevent} href="https://github.com/JGodwyn/bland-design-system" target="_blank" rel="noreferrer" size={size}>
              GitHub
            </Link>
          ))}
          <Link {...prevent} href="https://github.com/JGodwyn/bland-design-system" target="_blank" rel="noreferrer" size="md" external={false}>
            <code>external={'{false}'}</code>
          </Link>
        </div>
      </div>

      <div className="pg-stack">
        <span className="pg-label"><code>color="inherit"</code> on a brand fill</span>
        <p style={{ ...text('body-md'), color: 'var(--text-on-color)', background: 'var(--surface-brand-strong)', padding: 'var(--space-md)', borderRadius: 'var(--rad-md)' }}>
          Your trial ends in 3 days.{' '}
          <Link {...prevent} href="#/components/link" color="inherit">
            Choose a plan
          </Link>
        </p>
      </div>

      <div className="pg-stack">
        <span className="pg-label">Keyboard focus: the ring shows when people tab to it (turned on here to show it); <code>sm</code> draws it thinner</span>
        <div className="pg-focus pg-row">
          {sizes.map((size) => (
            <Link key={size} {...prevent} href="#/components/link" size={size}>
              Focused {size}
            </Link>
          ))}
          <Link {...prevent} href="#/components/link" size="md" iconStart={<FileIcon />}>
            With an icon
          </Link>
        </div>
      </div>
    </>
  ),
} satisfies Story;
