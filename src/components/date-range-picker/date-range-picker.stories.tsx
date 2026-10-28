import { useState, type CSSProperties } from 'react';
import type { Story } from '../../../playground/story';
import { DateRangePicker, type DateRange, type DateRangePickerSize } from './DateRangePicker';

// locale="en-GB" draws Figma's dd/mm/yyyy. The screenshots run on a fixed clock, 11 November 2024
// (tests/stories.ts). Opening the calendar moves focus into it, so only one opens here, first,
// where the viewport leaves room under it.
const sizes: DateRangePickerSize[] = ['sm', 'md', 'lg'];
const row: CSSProperties = { width: '100%', maxWidth: 582 };
// No room is kept for the calendar: it opens over whatever is under the fields (Godwin 2026-10-20).
const stage: CSSProperties = { ...row, display: 'grid', alignContent: 'start' };
const stay = { start: '2024-11-09', end: '2024-11-20' };

/** A controlled picker that echoes its value, so tests/date-range-picker.spec.ts can check it. */
function Controlled() {
  const [value, setValue] = useState<DateRange | null>(stay);
  return (
    <div style={{ ...row, display: 'grid', gap: 16 }}>
      <DateRangePicker locale="en-GB" aria-label="Controlled stay" value={value} onValueChange={setValue} data-testid="controlled" />
      <output className="pg-label" data-testid="controlled-value">
        {value ? `${value.start} to ${value.end}` : 'none'}
      </output>
    </div>
  );
}

export default {
  title: 'Date Range Picker',
  description:
    'Two date fields, a start and an end, that share one calendar. The first press in the calendar picks the start, the second the end.',
  usage: [
    'The value is `{ start, end }`, each an ISO string such as `"2024-11-09"`.',
    'Name the pair with `aria-label` (Date range by default), and each field with `startLabel` and `endLabel`.',
    'An end before the start turns the fields to `danger` on their own.',
    'In a form, `startName` and `endName` name the two values.',
  ],
  components: ['DateRangePicker'],
  demo: {
    component: 'DateRangePicker',
    args: { size: 'sm', calendarSize: 'md', status: 'default', startLabel: 'Start date', endLabel: 'End date', helperText: '', locale: 'en-GB', confirm: false, disabled: false },
    controls: {
      startLabel: { kind: 'text' },
      endLabel: { kind: 'text' },
      helperText: { kind: 'text' },
      locale: { kind: 'select', options: ['en-GB', 'en-US', 'nl-NL', 'de-DE'] },
      value: false,
      defaultValue: false,
      minValue: false,
      maxValue: false,
      open: false,
      defaultOpen: false,
      startName: false,
      endName: false,
      calendarLabel: false,
      cancelLabel: false,
      applyLabel: false,
      firstDayOfWeek: false,
      readOnly: false,
      required: false,
    },
    render: ({ helperText, locale, ...args }) => (
      <div style={stage}>
        <DateRangePicker {...args} key={String(locale)} locale={locale} helperText={helperText || undefined} />
      </div>
    ),
    code: ({ helperText, ...args }) => ({ ...args, helperText: helperText || undefined }),
  },
  render: () => (
    <>
      <div className="pg-stack">
        <span className="pg-label"><code>defaultOpen</code>: the calendar opens under the start field, over what is below</span>
        <div style={stage}>
          <DateRangePicker locale="en-US" aria-label="Open" defaultValue={stay} defaultOpen />
        </div>
      </div>
      <div className="pg-stack">
        <span className="pg-label"><code>size</code>: <code>sm</code>, <code>md</code>, <code>lg</code>; empty, then filled</span>
        {sizes.map((size) => (
          <div key={size} style={{ ...row, display: 'grid', gap: 16 }}>
            <DateRangePicker size={size} locale="en-GB" aria-label={`Empty ${size}`} />
            <DateRangePicker size={size} locale="en-GB" aria-label={`Filled ${size}`} defaultValue={stay} />
          </div>
        ))}
      </div>
      <div className="pg-stack">
        <span className="pg-label"><code>helperText</code> with <code>status</code>; an end before the start turns <code>danger</code> on its own; <code>disabled</code>; controlled</span>
        <div style={{ ...row, display: 'grid', gap: 16 }}>
          <DateRangePicker locale="en-GB" aria-label="Warning" status="warning" helperText="Check-out is a Sunday" defaultValue={stay} />
          <DateRangePicker locale="en-GB" aria-label="Reversed" helperText="The end comes before the start" defaultValue={{ start: '2024-11-20', end: '2024-11-09' }} />
          <DateRangePicker locale="en-GB" aria-label="Disabled" disabled helperText="Bookings are closed" defaultValue={stay} />
          <Controlled />
        </div>
      </div>
    </>
  ),
} satisfies Story;
