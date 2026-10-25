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
    'Bland wordmark. Color default uses text-bold and follows light and dark mode; on-color is white in both modes, for brand fills such as the doc Header and Footer. Turn on Mark and drop a project logomark into Mark to brand it. Code: the wordmark is live text that names the product; pass href to make it the home link.',
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
        <span className="pg-label">Sizes: lg (default, heading-md) and sm (title-md, for top bars)</span>
        <div className="pg-row">
          {sizes.map((size) => (
            <Logo key={size} size={size} data-testid={`logo-${size}`} />
          ))}
        </div>
      </div>

      <div className="pg-stack">
        <span className="pg-label">Color: default (text-bold, follows the theme) and on-color (white in both, on surface-brand-strong)</span>
        <div className="pg-row">
          {colors.map((color) => (
            <Backdrop key={color} color={color}>
              <Logo color={color} />
            </Backdrop>
          ))}
        </div>
      </div>

      <div className="pg-stack">
        <span className="pg-label">Mark: a project logomark before the wordmark, sized logo/mark-lg (40) or -sm (24); on a brand fill, the project's white version</span>
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
        <span className="pg-label">A project's product name in place of Bland (code only)</span>
        <div className="pg-row">
          <Logo mark={<ProjectMark />}>Northwind</Logo>
        </div>
      </div>

      <div className="pg-stack">
        <span className="pg-label">Focused: with href it is the home link (:focus-visible); forced on here to show it</span>
        <div className="pg-row pg-focus">
          {sizes.map((size) => (
            <Logo key={size} size={size} href="#/" onClick={(e) => e.preventDefault()} />
          ))}
        </div>
      </div>
    </>
  ),
} satisfies Story;
