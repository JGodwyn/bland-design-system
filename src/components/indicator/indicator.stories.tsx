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
    'Status dot or count badge. sm and md are dots; lg, xl and 2xl carry a label and grow into a pill as the label gets longer. Height and min width use the same indicator size, so a single character stays a circle. Emotion sets the color family and Type sets emphasis: primary is a solid fill, secondary a soft tint. Label colors meet 4.5:1 in Light and Dark. Turn on ring when the Indicator sits on an Avatar or an image: it adds a 2px surface-100 outline that separates it from the content underneath.',
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
          <span className="pg-label">type="{type}": sm, md, lg, xl, 2xl</span>
          {emotions.map((emotion) => (
            <div key={emotion} className="pg-row">
              {sizes.map((size) => (
                <Indicator key={size} size={size} emotion={emotion} type={type}>
                  {size === '2xl' ? 12 : 3}
                </Indicator>
              ))}
              <span className="pg-label">{emotion}</span>
            </div>
          ))}
        </div>
      ))}

      <div className="pg-stack">
        <span className="pg-label">Longer labels grow into a pill; no label leaves an empty circle</span>
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
        <span className="pg-label">ring: a surface-100 outline on top of an avatar or image</span>
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
