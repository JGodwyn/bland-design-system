import { useState, type CSSProperties } from 'react';
import type { Story } from '../../../playground/story';
import { TimePicker, type TimePickerSize, type TimePickerStatus } from './TimePicker';

// hourCycle={12} draws Figma's AM add-on whatever the test browser's locale.
const sizes: TimePickerSize[] = ['sm', 'md', 'lg'];
const statuses: TimePickerStatus[] = ['default', 'danger', 'success', 'warning'];
const helper: Record<TimePickerStatus, string> = {
  default: 'Helper text',
  danger: 'Pick a time in opening hours',
  success: 'Table free',
  warning: 'Kitchen closes soon',
};
const column: CSSProperties = { display: 'grid', gap: 16, width: '100%', maxWidth: 288 };

/** A controlled picker that echoes its value, so tests/time-picker.spec.ts can check it. */
function Controlled() {
  const [value, setValue] = useState<string | null>('14:30');
  return (
    <div style={column}>
      <TimePicker label="Controlled" hourCycle={12} value={value} onValueChange={setValue} data-testid="controlled" />
      <output className="pg-label" data-testid="controlled-value">
        {value ?? 'none'}
      </output>
    </div>
  );
}

export default {
  title: 'Time Picker',
  description:
    'A field for a time of day. People type the hours and minutes, or step them with the arrow keys.',
  usage: [
    'Values are 24-hour strings, such as `"14:30"` (`"14:30:15"` with seconds), whatever the field shows.',
    '`hourCycle={12}` adds an AM/PM switch; by default the field follows `locale`.',
    'Limit the times with `minValue` and `maxValue`.',
  ],
  components: ['TimePicker'],
  demo: {
    component: 'TimePicker',
    args: { size: 'sm', status: 'default', label: 'Label', helperText: '', hourCycle: '12', granularity: 'minute', disabled: false, readOnly: false },
    controls: {
      label: { kind: 'text' },
      helperText: { kind: 'text' },
      hourCycle: { kind: 'select', options: ['12', '24'] },
      locale: false,
      value: false,
      defaultValue: false,
      minValue: false,
      maxValue: false,
      name: false,
    },
    render: ({ helperText, hourCycle, ...args }) => (
      <div style={column}>
        <TimePicker {...args} key={String(hourCycle)} hourCycle={Number(hourCycle) as 12 | 24} helperText={helperText || undefined} />
      </div>
    ),
    code: ({ helperText, hourCycle, ...args }) => ({ ...args, hourCycle: Number(hourCycle), helperText: helperText || undefined }),
  },
  render: () => (
    <>
      <div className="pg-stack">
        <span className="pg-label"><code>size</code>: <code>sm</code>, <code>md</code>, <code>lg</code>; empty, filled with AM/PM, <code>disabled</code></span>
        <div className="pg-row" style={{ alignItems: 'flex-start' }}>
          {sizes.map((size) => (
            <div key={size} style={column}>
              <TimePicker size={size} hourCycle={12} label="Label" />
              <TimePicker size={size} hourCycle={12} label="Filled" defaultValue="09:41" />
              <TimePicker size={size} hourCycle={12} label="Disabled" defaultValue="09:41" disabled />
            </div>
          ))}
        </div>
      </div>
      <div className="pg-stack">
        <span className="pg-label"><code>status</code> with <code>helperText</code>; <code>hourCycle={24}</code>, seconds, a time before <code>minValue</code>, controlled</span>
        <div className="pg-row" style={{ alignItems: 'flex-start' }}>
          <div style={column}>
            {statuses.map((status) => (
              <TimePicker key={status} hourCycle={12} status={status} label={status} helperText={helper[status]} defaultValue="19:30" />
            ))}
          </div>
          <div style={column}>
            <TimePicker hourCycle={24} label="24-hour" defaultValue="14:30" />
            <TimePicker hourCycle={24} granularity="second" label="With seconds" defaultValue="14:30:15" />
            <TimePicker hourCycle={12} label="Opening" minValue="09:00" defaultValue="08:15" helperText="From 9:00 AM" />
            <Controlled />
          </div>
        </div>
      </div>
    </>
  ),
} satisfies Story;
