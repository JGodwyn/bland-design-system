import type { ReactNode } from 'react';
import type { Story } from '../../../playground/story';
import { Avatar, type AvatarSize } from './Avatar';

const sizes: AvatarSize[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'];

// A local portrait, so the docs and screenshots never wait on the network.
const portrait =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><defs><linearGradient id="g" x2="0" y2="1"><stop offset="0" stop-color="#f6c28b"/><stop offset="1" stop-color="#e07a5f"/></linearGradient></defs><rect width="80" height="80" fill="url(#g)"/><circle cx="40" cy="32" r="14" fill="#3d405b"/><path d="M12 80c4-18 15-26 28-26s24 8 28 26z" fill="#3d405b"/></svg>',
  );
// Fails to decode without a network request, to show the fallback.
const broken = 'data:image/png;base64,broken';

const images = { portrait, broken, none: undefined } as const;

/**
 * Stand-in for the slot content until the Indicator lands: any node fits a slot.
 * Sized by the slot (avatar/slot-*), ringed like Figma's Indicator Ring.
 */
function Dot({ children }: { children?: ReactNode }) {
  return (
    <span
      style={{
        boxSizing: 'border-box',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        borderRadius: 'var(--rad-rd)',
        background: children ? 'var(--surface-danger)' : 'var(--icon-success)',
        boxShadow: '0 0 0 var(--stroke-lg) var(--surface-100)',
        color: 'var(--text-on-color)',
        font: 'var(--type-body-sm-bold)',
      }}
    >
      {children}
    </span>
  );
}

export default {
  title: 'Avatar',
  description:
    'Shows a person or entity as an image, a placeholder icon or initials. Sizes xs to 3xl are bound to avatar/* tokens (16 to 80) and the placeholder icon to avatar/icon-* (half the avatar size). Use initials when there is no image; xs shows a single initial. Two slots, Top slot and Bottom slot, are centred on the circle edge at 45 degrees on the right side and sized by avatar/slot-* (8 to 24), which fits the matching Indicator: put a count badge in the top slot and a status dot in the bottom slot, with the Indicator Ring on. Avatar is not interactive on its own; wrap it in a button or link when it needs focus.',
  components: ['Avatar'],
  demo: {
    component: 'Avatar',
    args: { size: 'xl', type: 'image', src: 'portrait', alt: 'Ada Lovelace', initials: 'AL' },
    controls: {
      src: { kind: 'select', options: Object.keys(images) },
      alt: { kind: 'text' },
      initials: { kind: 'text' },
      imgProps: false,
    },
    render: ({ src, ...args }) => <Avatar {...(args as object)} src={images[src as keyof typeof images]} />,
  },
  render: () => (
    <>
      <div className="pg-stack">
        <span className="pg-label">type: image, placeholder, initials at every size (xs shows one initial)</span>
        {(['image', 'placeholder', 'initials'] as const).map((type) => (
          <div key={type} className="pg-row">
            {sizes.map((size) => (
              <Avatar key={size} size={size} type={type} src={portrait} initials="AL" alt={`Ada Lovelace (${type}, ${size})`} />
            ))}
          </div>
        ))}
      </div>

      <div className="pg-stack">
        <span className="pg-label">An image that fails falls back to the initials, or to the placeholder without them</span>
        <div className="pg-row">
          <Avatar size="xl" src={broken} initials="GJ" alt="Godwin John" data-testid="fallback-initials" />
          <Avatar size="xl" src={broken} alt="Unknown person" data-testid="fallback-placeholder" />
          <Avatar size="xl" type="image" initials="NS" alt="No source" />
        </div>
      </div>

      <div className="pg-stack">
        <span className="pg-label">Next to a visible name, omit alt: the avatar is decorative</span>
        <div className="pg-row">
          <span className="pg-row" style={{ gap: 'var(--space-sm)' }}>
            <Avatar initials="AL" data-testid="decorative" />
            <span className="pg-label">Ada Lovelace</span>
          </span>
        </div>
      </div>

      <div className="pg-stack">
        <span className="pg-label">Slots: count at the top, status at the bottom, sized by avatar/slot-*</span>
        <div className="pg-row">
          {sizes.map((size) => (
            <Avatar
              key={size}
              size={size}
              src={portrait}
              alt={`Ada Lovelace (${size})`}
              topSlot={size === 'xs' || size === 'sm' ? undefined : <Dot>3</Dot>}
              bottomSlot={<Dot />}
            />
          ))}
        </div>
      </div>
    </>
  ),
} satisfies Story;
