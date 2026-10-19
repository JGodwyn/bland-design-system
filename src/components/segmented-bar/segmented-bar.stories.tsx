import { useState } from 'react';
import type { Story } from '../../../playground/story';
import { InfoIcon, UserIcon } from '../../icons';
import { SegmentedBar, type SegmentedBarItem, type SegmentedBarSize } from './SegmentedBar';

const sizes: SegmentedBarSize[] = ['md', 'lg'];
const names = ['Day', 'Week', 'Month', 'Year'];
const segments = (n: number, extra: Partial<SegmentedBarItem> = {}): SegmentedBarItem[] =>
  names.slice(0, n).map((label) => ({ id: label.toLowerCase(), label, ...extra }));

/** A controlled radio bar that reports its value, for tests/segmented-bar.spec.ts. */
function Controlled() {
  const [value, setValue] = useState('week');
  return (
    <div className="pg-stack">
      <SegmentedBar aria-label="Range" data-testid="radios" items={segments(3)} value={value} onValueChange={setValue} />
      <output className="pg-label" data-testid="radios-value">
        {value}
      </output>
    </div>
  );
}

export default {
  title: 'Segmented bar',
  description:
    'A row of 2 to 4 equal segments on a track (Segment/track, rad-md, space-2xs inset); Selected picks the selected one. Selected: Segment/selected fill, Elevation/neutral/near, bold label. Unselected hover: Segment/hover fill. Disabled: minimal text and icon. It fills its container; the selected segment slides to a pressed one. In code: a radio group (native radios), or tabs when the segments switch panels.',
  components: ['SegmentedBar'],
  demo: {
    component: 'SegmentedBar',
    args: { tabs: '3', size: 'md', icon: false, disabled: false },
    controls: {
      tabs: { kind: 'select', options: ['2', '3', '4'] },
      icon: { kind: 'boolean' },
      items: false,
      value: false,
      defaultValue: false,
      name: false,
      keyboardActivation: false,
    },
    render: ({ tabs: n, icon, ...args }) => (
      <div style={{ width: 320 }}>
        <SegmentedBar {...(args as object)} aria-label="Demo" items={segments(Number(n), { icon: icon ? <InfoIcon /> : undefined })} />
      </div>
    ),
    code: ({ tabs: n, icon, ...args }) => ({
      ...args,
      'aria-label': 'Range',
      items: segments(Number(n)).map((s) => ({ ...s, ...(icon ? { icon: '<InfoIcon />' } : {}) })),
    }),
  },
  render: () => (
    <>
      {sizes.map((size) => (
        <div key={size} className="pg-stack" style={{ maxWidth: 384 }}>
          <span className="pg-label">size={size}: 2, 3 and 4 segments, then icons, a disabled segment, the whole bar disabled</span>
          <SegmentedBar aria-label={`Two ${size}`} size={size} items={segments(2)} />
          <SegmentedBar aria-label={`Three ${size}`} size={size} items={segments(3)} defaultValue="week" />
          <SegmentedBar aria-label={`Four ${size}`} size={size} items={segments(4)} defaultValue="year" />
          <SegmentedBar
            aria-label={`Icons ${size}`}
            size={size}
            items={[
              { id: 'people', label: 'People', icon: <UserIcon /> },
              { id: 'info', label: 'Info', icon: <InfoIcon />, hideLabel: true },
              { id: 'off', label: 'Off', disabled: true },
            ]}
          />
          <SegmentedBar aria-label={`Disabled ${size}`} size={size} items={segments(3)} disabled />
        </div>
      ))}
      <div className="pg-stack" style={{ maxWidth: 384 }}>
        <span className="pg-label">Radio group, controlled (used by the behaviour tests)</span>
        <Controlled />
      </div>
      <div className="pg-stack" style={{ maxWidth: 384 }}>
        <span className="pg-label">Tabs: segments with panels</span>
        <SegmentedBar
          aria-label="Views"
          data-testid="tabs"
          items={segments(3).map((s) => ({ ...s, panel: <p className="pg-label">{s.label} view</p> }))}
        />
      </div>
      <div className="pg-stack" style={{ maxWidth: 384 }}>
        <span className="pg-label">Focused: the ring shows on keyboard focus (:focus-visible); forced on here to show it</span>
        <div className="pg-focus">
          <SegmentedBar aria-label="Focused" items={segments(2)} />
        </div>
      </div>
    </>
  ),
} satisfies Story;
