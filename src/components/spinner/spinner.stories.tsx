import type { Story } from '../../../playground/story';
import { Button } from '../button/Button';
import {
  Spinner,
  type SpinnerColor,
  type SpinnerLabelPlacement,
  type SpinnerSize,
  type SpinnerType,
} from './Spinner';

const types: SpinnerType[] = ['ring', 'spokes'];
const sizes: SpinnerSize[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];
const colors: SpinnerColor[] = ['default', 'subtle', 'brand'];
const brandFill = {
  background: 'var(--surface-brand-strong)',
  padding: 'var(--space-lg)',
  borderRadius: 'var(--rad-md)',
};

export default {
  title: 'Spinner',
  description:
    'Shows that something is loading: a section, a card, or the text beside it. A `ring` that turns or `spokes` that fade in turn, from icon size up to `2xl` for a whole page.',
  usage: [
    'Use it when the wait has no known length; when you know how far along it is, use a ProgressBar, and when the layout is known, a Skeleton.',
    'It tells screen readers "Loading" once; change `label` to say what is loading, and turn on `showLabel` to show it too.',
    'Inside something that already says it is loading (a loading Button, an `aria-busy` region), make it `decorative`.',
    'Without a `size` it takes the icon size of the component around it, so it can stand in for an icon.',
  ],
  components: ['Spinner'],
  demo: {
    component: 'Spinner',
    args: { type: 'ring', size: 'md', color: 'default', label: 'Loading', showLabel: true, labelPlacement: 'end' },
    controls: {
      type: { kind: 'select', options: types },
      size: { kind: 'select', options: sizes },
      color: { kind: 'select', options: [...colors, 'on-color'] },
      labelPlacement: { kind: 'select', options: ['end', 'start', 'bottom'] },
      label: { kind: 'text' },
      decorative: false,
    },
    render: (args) => {
      const spinner = <Spinner {...(args as object)} />;
      return args.color === 'on-color' ? <div style={brandFill}>{spinner}</div> : spinner;
    },
  },
  render: () => (
    <>
      {types.map((type) => (
        <div key={type} className="pg-stack">
          <span className="pg-label">
            <code>type="{type}"</code>
            {type === 'ring' ? ', turning' : ', fading in turn'}: each <code>size</code> in each <code>color</code>
          </span>
          {colors.map((color) => (
            <div key={color} className="pg-row">
              {sizes.map((size) => (
                <Spinner key={size} type={type} size={size} color={color} data-testid={`${type}-${size}-${color}`} />
              ))}
            </div>
          ))}
          <div className="pg-row" style={brandFill}>
            {sizes.map((size) => (
              <Spinner key={size} type={type} size={size} color="on-color" />
            ))}
          </div>
        </div>
      ))}

      <div className="pg-stack">
        <span className="pg-label">
          <code>showLabel</code> after (<code>labelPlacement="end"</code>), before (<code>"start"</code>) and under (<code>"bottom"</code>)
        </span>
        {(['end', 'start', 'bottom'] as SpinnerLabelPlacement[]).map((placement) => (
          <div key={placement} className="pg-row" style={{ alignItems: 'flex-start' }}>
            {sizes.map((size) => (
              <Spinner
                key={size}
                size={size}
                type={size === 'xl' || size === '2xl' ? 'spokes' : 'ring'}
                showLabel
                labelPlacement={placement}
                color="subtle"
                data-testid={`label-${placement}-${size}`}
              />
            ))}
          </div>
        ))}
        <div style={{ width: 'var(--empty-state-width-sm)' }}>
          <Spinner showLabel label="Loading the messages from the last thirty days" data-testid="label-wrap" />
        </div>
      </div>

      <div className="pg-stack">
        <span className="pg-label">
          In use: on a brand fill, and <code>decorative</code> inside a loading Button
        </span>
        <div className="pg-row">
          <div style={brandFill}>
            <Spinner color="on-color" showLabel label="Saving" />
          </div>
          <Button loading>Saving</Button>
          <Button type="secondary" loading="end">
            Loading more
          </Button>
        </div>
      </div>
    </>
  ),
} satisfies Story;
