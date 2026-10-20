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
    'Slider for picking a value (single) or a range (double) on a track. Size sm, md, lg sets the thumb (16, 20, 24) and the touch row height (control/xs, sm, md). Each thumb shows its value in a tooltip while hovered, focused or dragged. Labels shows the scale under the track; Input field shows a value field (two for a range, one each side). Width defaults to slider/width (256), capped at its container.',
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
        <span className="pg-label">type="single": sm, md, lg</span>
        {sizes.map((size) => (
          <Slider key={size} size={size} defaultValue={50} aria-label={`Single ${size}`} />
        ))}
      </div>
      <div className="pg-stack">
        <span className="pg-label">type="double": sm, md, lg</span>
        {sizes.map((size) => (
          <Slider key={size} type="double" size={size} defaultValue={[25, 75]} aria-label={`Double ${size}`} />
        ))}
      </div>
      <div className="pg-stack">
        <span className="pg-label">labels: 4, 3, 2, false; an array with formatOptions (percent)</span>
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
        <span className="pg-label">inputField: single sm, md, lg; double (a field each side, labels 3: five crowd the shorter track)</span>
        {sizes.map((size) => (
          <Slider key={size} size={size} inputField defaultValue={50} aria-label={`Field ${size}`} />
        ))}
        <Slider type="double" inputField labels={3} defaultValue={[20, 80]} aria-label="Price" />
      </div>
      <div className="pg-stack">
        <span className="pg-label">snap: to the labels (single, range of 4, with a field); to an array</span>
        <Slider snap defaultValue={50} aria-label="Snap single" />
        <Slider type="double" snap labels={4} defaultValue={[0, 100]} aria-label="Snap range" />
        <Slider snap labels={3} inputField defaultValue={50} aria-label="Snap field" />
        <Slider snap={[0, 10, 20, 50, 100]} labels={[0, 10, 20, 50, 100]} defaultValue={20} aria-label="Snap array" />
      </div>
      <div className="pg-stack">
        <span className="pg-label">Disabled</span>
        <Slider disabled defaultValue={50} aria-label="Disabled single" />
        <Slider type="double" disabled inputField labels={3} defaultValue={[25, 75]} aria-label="Disabled double" />
      </div>
      <div className="pg-stack">
        <span className="pg-label">Focused: the ring shows on keyboard focus (:focus-visible); forced on here to show it</span>
        <div className="pg-focus">
          <Slider size="md" defaultValue={50} labels={false} aria-label="Focused" />
        </div>
      </div>
    </>
  ),
} satisfies Story;
