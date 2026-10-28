import type { Story } from '../../../playground/story';
import { Indicator, type IndicatorEmotion, type IndicatorSize, type IndicatorType } from './Indicator';

const emotions: IndicatorEmotion[] = ['brand', 'neutral', 'success', 'danger', 'warning'];
const types: IndicatorType[] = ['primary', 'secondary'];
const sizes: IndicatorSize[] = ['sm', 'md', 'lg', 'xl', '2xl'];

/** A stand-in for an avatar or image, so the ring has something to separate the Indicator from. */
const swatch = {
  position: 'relative',
  width: 'var(--avatar-lg)',
  height: 'var(--avatar-lg)',
  borderRadius: 'var(--rad-rd)',
  background: 'var(--surface-300)',
} as const;
const corner = { position: 'absolute', right: 0, bottom: 0 } as const;

export default {
  title: 'Indicator',
  description:
    'A status dot or a small count, often on an avatar or icon. Sizes `sm` and `md` are dots; larger sizes hold a short label.',
  usage: [
    'Turn on `ring` when it sits on an Avatar or an image, so it stands out from what is underneath.',
    'A dot has no text, so give it an `aria-label` when its meaning isn\'t shown nearby.',
    'For a label beside content, use Badge.',
  ],
  components: ['Indicator'],
  demo: {
    component: 'Indicator',
    args: { children: '3', size: 'lg', emotion: 'brand', type: 'primary', ring: false },
    controls: { children: { kind: 'text' }, ring: { kind: 'boolean' } },
    render: (args) => <Indicator {...(args as object)}>{args.children}</Indicator>,
  },
  render: () => (
    <>
      {types.map((type) => (
        <div key={type} className="pg-stack">
          <span className="pg-label"><code>type="{type}"</code>: <code>sm</code>, <code>md</code>, <code>lg</code>, <code>xl</code>, <code>2xl</code></span>
          {emotions.map((emotion) => (
            <div key={emotion} className="pg-row">
              {sizes.map((size) => (
                <Indicator key={size} size={size} emotion={emotion} type={type}>
                  {size === '2xl' ? 12 : 3}
                </Indicator>
              ))}
              <span className="pg-label"><code>{emotion}</code></span>
            </div>
          ))}
        </div>
      ))}

      <div className="pg-stack">
        <span className="pg-label">Longer labels grow into a pill; without a label it is a plain circle</span>
        <div className="pg-row">
          {(['lg', 'xl', '2xl'] as const).map((size) => (
            <span key={size} className="pg-row">
              <Indicator size={size} emotion="danger">
                9
              </Indicator>
              <Indicator size={size} emotion="danger">
                99+
              </Indicator>
              <Indicator size={size} emotion="danger" />
            </span>
          ))}
        </div>
      </div>

      <div className="pg-stack">
        <span className="pg-label"><code>ring</code>: an outline that separates it from an avatar or image</span>
        <div className="pg-row">
          {sizes.map((size) => (
            <span key={size} style={swatch}>
              {size === 'sm' || size === 'md' ? (
                <Indicator size={size} emotion="success" ring style={corner} aria-label="Online" />
              ) : (
                <Indicator size={size} emotion="danger" ring style={corner}>
                  2
                </Indicator>
              )}
            </span>
          ))}
        </div>
      </div>
    </>
  ),
} satisfies Story;
