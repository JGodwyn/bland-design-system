import type { Story } from '../../../playground/story';
import { Indicator, type IndicatorEmotion, type IndicatorSize } from '../indicator/Indicator';
import { Avatar, type AvatarSize } from './Avatar';
// The photo on Figma's Avatar (Unsplash 3TLl_97HNJo), cropped to 160px and kept local,
// so the docs and screenshots never wait on the network.
import portrait from '../../../playground/assets/avatar-portrait.jpg';

const sizes: AvatarSize[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'];

// Fails to decode without a network request, to show the fallback.
const broken = 'data:image/png;base64,broken';

const images = { portrait, broken, none: undefined } as const;

// Indicator size that fills each avatar/slot-* (8, 8, 12, 12, 16, 20, 24).
const slotIndicator: Record<AvatarSize, IndicatorSize> = {
  xs: 'sm',
  sm: 'sm',
  md: 'md',
  lg: 'md',
  xl: 'lg',
  '2xl': 'xl',
  '3xl': '2xl',
};

// Demo slot content: a status dot (named for screen readers) or a count, as a ringed Indicator sized for the slot.
const emotions: IndicatorEmotion[] = ['brand', 'neutral', 'success', 'danger', 'warning'];
const statusNames: Record<IndicatorEmotion, string> = {
  brand: 'Active',
  neutral: 'Offline',
  success: 'Online',
  danger: 'Busy',
  warning: 'Away',
};
type SlotArgs = { kind: string; emotion: IndicatorEmotion; count: string; size: AvatarSize };

function slotNode({ kind, emotion, count, size }: SlotArgs) {
  if (kind === 'dot') return <Indicator ring size={slotIndicator[size]} emotion={emotion} aria-label={statusNames[emotion]} />;
  if (kind === 'count')
    return (
      <Indicator ring size={slotIndicator[size]} emotion={emotion}>
        {count}
      </Indicator>
    );
  return undefined;
}

function slotCode({ kind, emotion, count, size }: SlotArgs) {
  const open = `<Indicator ring size="${slotIndicator[size]}" emotion="${emotion}"`;
  if (kind === 'dot') return `${open} aria-label="${statusNames[emotion]}" />`;
  if (kind === 'count') return `${open}>${count}</Indicator>`;
  return undefined;
}

/** Splits the demo args into Avatar's props and the two slots' settings. */
function demoSlots({ topSlot, topEmotion, topCount, bottomSlot, bottomEmotion, bottomCount, ...avatar }: Record<string, any>) {
  const size = (avatar.size ?? 'md') as AvatarSize;
  return {
    avatar,
    top: { kind: topSlot, emotion: topEmotion, count: topCount, size },
    bottom: { kind: bottomSlot, emotion: bottomEmotion, count: bottomCount, size },
  };
}

export default {
  title: 'Avatar',
  description:
    'Shows a person or entity as a photo, their initials or a placeholder icon. Pass `src` and `initials` together: if the photo fails to load, the initials show instead.',
  usage: [
    'Use `topSlot` for a count and `bottomSlot` for a status, each an Indicator with `ring` on.',
    'Give it `alt` when it stands alone. Leave `alt` out next to a visible name, so the name isn\'t read twice.',
    'Avatar isn\'t interactive. Wrap it in a button or link when pressing it should do something.',
  ],
  components: ['Avatar'],
  demo: {
    component: 'Avatar',
    args: {
      size: 'xl',
      type: 'image',
      src: 'portrait',
      alt: 'Ada Lovelace',
      initials: 'AL',
      topSlot: 'count',
      topEmotion: 'danger',
      topCount: '3',
      bottomSlot: 'dot',
      bottomEmotion: 'success',
      bottomCount: '1',
    },
    // Slot content is a node, so the controls build an Indicator: none, a status dot or a count.
    // A count shows from avatar xl up; smaller slots hold Indicator sm or md, which are dots.
    controls: {
      src: { kind: 'select', options: Object.keys(images) },
      alt: { kind: 'text' },
      initials: { kind: 'text' },
      imgProps: false,
      topSlot: { kind: 'select', options: ['none', 'dot', 'count'] },
      topEmotion: { kind: 'select', options: emotions },
      topCount: { kind: 'text' },
      bottomSlot: { kind: 'select', options: ['none', 'dot', 'count'] },
      bottomEmotion: { kind: 'select', options: emotions },
      bottomCount: { kind: 'text' },
    },
    render: (args) => {
      const { avatar, top, bottom } = demoSlots(args);
      return (
        <Avatar
          {...(avatar as object)}
          src={images[avatar.src as keyof typeof images]}
          topSlot={slotNode(top)}
          bottomSlot={slotNode(bottom)}
        />
      );
    },
    code: (args) => {
      const { avatar, top, bottom } = demoSlots(args);
      return { ...avatar, topSlot: slotCode(top), bottomSlot: slotCode(bottom) };
    },
  },
  render: () => (
    <>
      <div className="pg-stack">
        <span className="pg-label"><code>type</code>: <code>image</code>, <code>placeholder</code>, <code>initials</code> at every size (<code>xs</code> shows one initial)</span>
        {(['image', 'placeholder', 'initials'] as const).map((type) => (
          <div key={type} className="pg-row">
            {sizes.map((size) => (
              <Avatar key={size} size={size} type={type} src={portrait} initials="AL" alt={`Ada Lovelace (${type}, ${size})`} />
            ))}
          </div>
        ))}
      </div>

      <div className="pg-stack">
        <span className="pg-label">A photo that fails to load shows the initials, or the placeholder without them</span>
        <div className="pg-row">
          <Avatar size="xl" src={broken} initials="GJ" alt="Godwin John" data-testid="fallback-initials" />
          <Avatar size="xl" src={broken} alt="Unknown person" data-testid="fallback-placeholder" />
          <Avatar size="xl" type="image" initials="NS" alt="No source" />
        </div>
      </div>

      <div className="pg-stack">
        <span className="pg-label">Next to a visible name, leave out <code>alt</code></span>
        <div className="pg-row">
          <span className="pg-row" style={{ gap: 'var(--space-sm)' }}>
            <Avatar initials="AL" data-testid="decorative" />
            <span className="pg-label">Ada Lovelace</span>
          </span>
        </div>
      </div>

      <div className="pg-stack">
        <span className="pg-label"><code>topSlot</code> for a count, <code>bottomSlot</code> for a status</span>
        <div className="pg-row">
          {sizes.map((size) => (
            <Avatar
              key={size}
              size={size}
              src={portrait}
              alt={`Ada Lovelace (${size})`}
              topSlot={
                // sm and md Indicators are dots and drop the count, so it reads from avatar xl up.
                size === 'xs' || size === 'sm' ? undefined : (
                  <Indicator ring size={slotIndicator[size]} emotion="danger">
                    3
                  </Indicator>
                )
              }
              bottomSlot={<Indicator ring size={slotIndicator[size]} emotion="success" aria-label="Online" />}
            />
          ))}
        </div>
      </div>
    </>
  ),
} satisfies Story;
