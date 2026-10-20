import { useState, type CSSProperties } from 'react';
import type { Story } from '../../../playground/story';
import { DatePicker, type DatePickerSize, type DatePickerStatus } from './DatePicker';

// locale="en-GB" draws Figma's dd/mm/yyyy (en-US would be mm/dd/yyyy). The screenshots run on a fixed clock,
// 11 November 2024 (tests/stories.ts). Opening the calendar moves focus into it, so only one opens here, first,
// where the viewport leaves room under it.
const sizes: DatePickerSize[] = ['sm', 'md', 'lg'];
const statuses: DatePickerStatus[] = ['default', 'danger', 'success', 'warning'];
const helper: Record<DatePickerStatus, string> = {
  default: 'Helper text',
  danger: 'Pick a date in the future',
  success: 'Available',
  warning: 'Close to the deadline',
};
const column: CSSProperties = { display: 'grid', gap: 16, width: '100%', maxWidth: 288 };
// No room is kept for the calendar: it opens over whatever is under the field (Godwin 2026-10-20).
const stage: CSSProperties = { display: 'grid', alignContent: 'start', width: '100%', maxWidth: 288 };

/** A controlled picker that echoes its value, so tests/date-picker.spec.ts can check it. */
function Controlled() {
  const [value, setValue] = useState<string | null>('2024-11-09');
  return (
    <div style={column}>
      <DatePicker label="Controlled" locale="en-GB" value={value} onValueChange={setValue} data-testid="controlled" />
      <output className="pg-label" data-testid="controlled-value">
        {value ?? 'none'}
      </output>
    </div>
  );
}

export default {
  title: 'Date Picker',
  description:
    'Date field with a calendar popover. The field is an exposed Text Input (Status, label and helper text; right icon CalendarBlank) with editable segments: type the digits or step them with the arrow keys; their order and placeholder follow the locale. The CalendarBlank button opens the Calendar under the field; picking a date fills it. Fills its container (Figma 287 is its frame); the calendar keeps its own width. Values are ISO dates ("2024-11-09").',
  components: ['DatePicker'],
  demo: {
    component: 'DatePicker',
    args: { size: 'sm', calendarSize: 'md', status: 'default', label: 'Label', helperText: '', locale: 'en-GB', confirm: false, disabled: false, readOnly: false },
    controls: {
      label: { kind: 'text' },
      helperText: { kind: 'text' },
      locale: { kind: 'select', options: ['en-GB', 'en-US', 'nl-NL', 'de-DE', 'ja-JP'] },
      value: false,
      defaultValue: false,
      minValue: false,
      maxValue: false,
      open: false,
      defaultOpen: false,
      name: false,
      calendarLabel: false,
      cancelLabel: false,
      applyLabel: false,
      firstDayOfWeek: false,
    },
    render: ({ helperText, locale, ...args }) => (
      <div style={stage}>
        <DatePicker {...args} key={String(locale)} locale={locale} helperText={helperText || undefined} />
      </div>
    ),
    code: ({ helperText, ...args }) => ({ ...args, helperText: helperText || undefined }),
  },
  render: () => (
    <>
      <div className="pg-stack">
        <span className="pg-label">Open (defaultOpen) with confirm: the calendar (md by default) opens over what is under the field, with Cancel and Apply</span>
        <div style={stage}>
          <DatePicker locale="en-US" label="Label" defaultValue="2024-11-20" defaultOpen confirm />
        </div>
      </div>
      <div className="pg-stack">
        <span className="pg-label">Sizes sm, md, lg: empty, filled, disabled</span>
        <div className="pg-row" style={{ alignItems: 'flex-start' }}>
          {sizes.map((size) => (
            <div key={size} style={column}>
              <DatePicker size={size} locale="en-GB" label="Label" />
              <DatePicker size={size} locale="en-GB" label="Filled" defaultValue="2024-11-09" />
              <DatePicker size={size} locale="en-GB" label="Disabled" defaultValue="2024-11-09" disabled />
            </div>
          ))}
        </div>
      </div>
      <div className="pg-stack">
        <span className="pg-label">status with helperText; out of bounds turns danger by itself (minValue 2024-11-10)</span>
        <div className="pg-row" style={{ alignItems: 'flex-start' }}>
          <div style={column}>
            {statuses.map((status) => (
              <DatePicker key={status} locale="en-GB" status={status} label={status} helperText={helper[status]} defaultValue="2024-11-12" />
            ))}
          </div>
          <div style={column}>
            <DatePicker locale="en-GB" label="Check-in" minValue="2024-11-10" defaultValue="2024-11-05" helperText="From 10 November" />
            <DatePicker locale="en-US" label="en-US: mm/dd/yyyy" />
            <DatePicker locale="nl-NL" label="nl-NL: dd-mm-jjjj" defaultValue="2024-11-09" />
            <Controlled />
          </div>
        </div>
      </div>
    </>
  ),
} satisfies Story;
