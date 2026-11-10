import type { ReactNode } from 'react';
import type { Story } from '../../../playground/story';
import { Logo, type LogoColor, type LogoSize } from './Logo';

const sizes: LogoSize[] = ['sm', 'lg'];
const colors: LogoColor[] = ['default', 'on-color'];

/**
 * A project's own logomark, to show the `mark` slot: a brand rounded square with a white bar. Its drawing
 * is this story's choice; the Logo sizes it to logo/mark-*.
 */
function ProjectMark({ inverse = false }: { inverse?: boolean }) {
  return (
    <svg viewBox="0 0 40 40" width="40" height="40">
      <rect width="40" height="40" rx="10" fill={inverse ? 'var(--icon-on-color)' : 'var(--surface-brand)'} />
      <rect x="10" y="17" width="20" height="6" rx="3" fill={inverse ? 'var(--surface-brand-strong)' : 'var(--icon-on-color)'} />
    </svg>
  );
}

/** A brand fill, as the doc Header and Footer: surface-brand-strong, which stays dark enough for white in both themes. */
function Backdrop({ color, children }: { color: LogoColor; children: ReactNode }) {
  if (color === 'default') return <>{children}</>;
  return (
    <div style={{ display: 'flex', padding: 'var(--space-lg)', borderRadius: 'var(--rad-md)', background: 'var(--surface-brand-strong)' }}>
      {children}
    </div>
  );
}

export default {
  title: 'Logo',
  description:
    'The Bland logo: the logomark and the wordmark. Pass `href` to make it the link home.',
  usage: [
    '`size="sm"` fits top bars; `lg` is the default.',
    'Use `color="on-color"` with `mono` on brand fills: the whole logo is white in both themes.',
    '`mono` makes the logomark the wordmark\'s color, for one-color uses.',
    '`mark={false}` shows the wordmark alone; any image or SVG in `mark` replaces Bland\'s logomark.',
    'The wordmark is a drawing of the word Bland. A product with another name draws its own logo.',
  ],
  components: ['Logo'],
  demo: {
    component: 'Logo',
    args: { size: 'lg', color: 'default', mono: false, mark: 'Bland' },
    controls: {
      mark: { kind: 'select', options: ['Bland', 'none', 'ProjectMark'] },
    },
    render: ({ mark, color, ...args }) => (
      <Backdrop color={color as LogoColor}>
        <Logo
          {...args}
          color={color as LogoColor}
          mark={mark === 'Bland' ? undefined : mark === 'none' ? false : <ProjectMark inverse={color === 'on-color'} />}
        />
      </Backdrop>
    ),
    code: ({ mark, ...args }) => ({ ...args, mark: mark === 'Bland' ? undefined : mark === 'none' ? false : '<ProjectMark />' }),
  },
  render: () => (
    <>
      <div className="pg-stack">
        <span className="pg-label"><code>size</code>: <code>sm</code> (for top bars) and <code>lg</code> (default)</span>
        <div className="pg-row">
          {sizes.map((size) => (
            <Logo key={size} size={size} data-testid={`logo-${size}`} />
          ))}
        </div>
      </div>

      <div className="pg-stack">
        <span className="pg-label"><code>color</code>: <code>default</code> (follows the theme) and <code>on-color</code> (white in both, for brand fills)</span>
        <div className="pg-row">
          {colors.map((color) => (
            <Backdrop key={color} color={color}>
              <Logo color={color} />
            </Backdrop>
          ))}
        </div>
      </div>

      <div className="pg-stack">
        <span className="pg-label"><code>mono</code>: the logomark in the wordmark's color; with <code>on-color</code>, the logo for brand fills</span>
        <div className="pg-row">
          {sizes.map((size) => (
            <Logo key={size} size={size} mono data-testid={`mono-${size}`} />
          ))}
          <Backdrop color="on-color">
            <Logo color="on-color" mono />
          </Backdrop>
          <Backdrop color="on-color">
            <Logo size="sm" color="on-color" mono />
          </Backdrop>
        </div>
      </div>

      <div className="pg-stack">
        <span className="pg-label"><code>mark</code>: <code>false</code> for the wordmark alone, or your own image or SVG</span>
        <div className="pg-row">
          {sizes.map((size) => (
            <Logo key={size} size={size} mark={false} />
          ))}
          {sizes.map((size) => (
            <Logo key={size} size={size} mark={<ProjectMark />} data-testid={`mark-${size}`} />
          ))}
        </div>
      </div>

      <div className="pg-stack">
        <span className="pg-label">Keyboard focus: with <code>href</code> it is the link home (turned on here to show it)</span>
        <div className="pg-row pg-focus">
          {sizes.map((size) => (
            <Logo key={size} size={size} href="#/" onClick={(e) => e.preventDefault()} />
          ))}
        </div>
      </div>
    </>
  ),
} satisfies Story;
