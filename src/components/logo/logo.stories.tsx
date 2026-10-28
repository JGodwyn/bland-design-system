import type { ReactNode } from 'react';
import type { Story } from '../../../playground/story';
import { Logo, type LogoColor, type LogoSize } from './Logo';

const sizes: LogoSize[] = ['lg', 'sm'];
const colors: LogoColor[] = ['default', 'on-color'];

/**
 * A project's own logomark: a brand rounded square with a white bar. Bland ships none, so its drawing
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
    'The product\'s wordmark, with an optional logomark before it. Pass `href` to make it the link home.',
  usage: [
    '`children` replaces the Bland wordmark with your product\'s name.',
    'Put your logomark in `mark`.',
    'Use `color="on-color"` on brand fills: it is white in both themes. Use your logomark\'s white version there too.',
    '`size="sm"` fits top bars; `lg` is the default.',
  ],
  components: ['Logo'],
  demo: {
    component: 'Logo',
    args: { size: 'lg', color: 'default', mark: 'none', children: 'Bland' },
    controls: {
      children: { kind: 'text' },
      mark: { kind: 'select', options: ['none', 'ProjectMark'] },
    },
    render: ({ mark, color, ...args }) => (
      <Backdrop color={color as LogoColor}>
        <Logo {...args} color={color as LogoColor} mark={mark === 'none' ? undefined : <ProjectMark inverse={color === 'on-color'} />} />
      </Backdrop>
    ),
    code: ({ mark, ...args }) => ({ ...args, mark: mark === 'none' ? undefined : '<ProjectMark />' }),
  },
  render: () => (
    <>
      <div className="pg-stack">
        <span className="pg-label"><code>size</code>: <code>lg</code> (default) and <code>sm</code> (for top bars)</span>
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
        <span className="pg-label"><code>mark</code>: your logomark before the wordmark; on a brand fill, its white version</span>
        <div className="pg-row">
          {sizes.map((size) => (
            <Logo key={size} size={size} mark={<ProjectMark />} data-testid={`mark-${size}`} />
          ))}
          <Backdrop color="on-color">
            <Logo color="on-color" mark={<ProjectMark inverse />} />
          </Backdrop>
        </div>
      </div>

      <div className="pg-stack">
        <span className="pg-label">Your product name as <code>children</code></span>
        <div className="pg-row">
          <Logo mark={<ProjectMark />}>Northwind</Logo>
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
