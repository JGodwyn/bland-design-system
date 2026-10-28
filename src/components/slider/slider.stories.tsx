import type { Story } from '../../../playground/story';
import { Slider, type SliderSize } from './Slider';

// Hover, dragging and the value tooltip are interaction states, so they show on use, not here
// (tests/slider.spec.ts screenshots the tooltip).
const sizes: SliderSize[] = ['sm', 'md', 'lg'];

// The demo's labels control: on (five), off, or a count.
const labelOptions = { true: true, false: false, '4': 4, '3': 3, '2': 2 } as const;
const labelsArg = (labels: unknown) => labelOptions[String(labels) as keyof typeof labelOptions];

export default {
  title: 'Slider',
  description:
    'Picks a number, or a range with two thumbs, by dragging along a track.',
  usage: [
    '`type="double"` picks a range; the value is then `[start, end]`.',
    'Name it with `aria-label` or `aria-labelledby`.',
    'Turn on `inputField` when people need an exact value. `labels` shows the scale under the track.',
    'Use `snap` to keep the thumbs on set values.',
  ],
  components: ['Slider'],
  demo: {
    component: 'Slider',
    args: { type: 'single', size: 'sm', labels: true, snap: false, inputField: false, tooltip: true, disabled: false, 'aria-label': 'Volume' },
    controls: {
      type: { kind: 'select', options: ['single', 'double'] },
      labels: { kind: 'select', options: Object.keys(labelOptions) },
      snap: { kind: 'boolean' },
      'aria-label': { kind: 'text' },
      value: false,
      defaultValue: false,
      formatOptions: false,
      name: false,
      thumbLabels: false,
    },
    // The type changes the value's shape, so a new type starts a new slider.
    render: ({ type, labels, ...args }) =>
      type === 'double' ? (
        <Slider key="double" {...args} type="double" labels={labelsArg(labels)} defaultValue={[25, 75]} />
      ) : (
        <Slider key="single" {...args} labels={labelsArg(labels)} defaultValue={50} />
      ),
    code: ({ labels, ...args }) => ({
      ...args,
      labels: labelsArg(labels),
      defaultValue: args.type === 'double' ? [25, 75] : 50,
    }),
  },
  render: () => (
    <>
      <div className="pg-stack">
        <span className="pg-label"><code>type="single"</code>: <code>sm</code>, <code>md</code>, <code>lg</code></span>
        {sizes.map((size) => (
          <Slider key={size} size={size} defaultValue={50} aria-label={`Single ${size}`} />
        ))}
      </div>
      <div className="pg-stack">
        <span className="pg-label"><code>type="double"</code>: <code>sm</code>, <code>md</code>, <code>lg</code></span>
        {sizes.map((size) => (
          <Slider key={size} type="double" size={size} defaultValue={[25, 75]} aria-label={`Double ${size}`} />
        ))}
      </div>
      <div className="pg-stack">
        <span className="pg-label"><code>labels</code>: 4, 3, 2, <code>false</code>; an array with <code>formatOptions</code> (percent)</span>
        <Slider labels={4} defaultValue={35} aria-label="Four labels" />
        <Slider labels={3} defaultValue={70} aria-label="Three labels" />
        <Slider labels={2} defaultValue={0} aria-label="Two labels" />
        <Slider labels={false} defaultValue={100} aria-label="No labels" />
        <Slider
          min={0}
          max={1}
          step={0.05}
          labels={[0, 0.5, 1]}
          formatOptions={{ style: 'percent' }}
          defaultValue={0.4}
          aria-label="Opacity"
        />
      </div>
      <div className="pg-stack">
        <span className="pg-label"><code>inputField</code>: single at each size; double, with a field each side</span>
        {sizes.map((size) => (
          <Slider key={size} size={size} inputField defaultValue={50} aria-label={`Field ${size}`} />
        ))}
        <Slider type="double" inputField labels={3} defaultValue={[20, 80]} aria-label="Price" />
      </div>
      <div className="pg-stack">
        <span className="pg-label"><code>snap</code>: to the labels, and to an array of values</span>
        <Slider snap defaultValue={50} aria-label="Snap single" />
        <Slider type="double" snap labels={4} defaultValue={[0, 100]} aria-label="Snap range" />
        <Slider snap labels={3} inputField defaultValue={50} aria-label="Snap field" />
        <Slider snap={[0, 10, 20, 50, 100]} labels={[0, 10, 20, 50, 100]} defaultValue={20} aria-label="Snap array" />
      </div>
      <div className="pg-stack">
        <span className="pg-label"><code>disabled</code></span>
        <Slider disabled defaultValue={50} aria-label="Disabled single" />
        <Slider type="double" disabled inputField labels={3} defaultValue={[25, 75]} aria-label="Disabled double" />
      </div>
      <div className="pg-stack">
        <span className="pg-label">Keyboard focus: the ring shows when people tab to it (turned on here to show it)</span>
        <div className="pg-focus">
          <Slider size="md" defaultValue={50} labels={false} aria-label="Focused" />
        </div>
      </div>
    </>
  ),
} satisfies Story;
