import type { Story } from '../../../playground/story';
import { Button } from '../button/Button';
import { Calendar, type CalendarSize } from './Calendar';

// The screenshots run on a fixed clock, 11 November 2024 (tests/stories.ts), so today is underlined as in
// Figma. Hover is an interaction state; keyboard focus is shown in tests/calendar.spec.ts.
const sizes: CalendarSize[] = ['sm', 'md', 'lg'];
const buttonSize = { sm: 'xs', md: 'sm', lg: 'md' } as const;
const nov = '2024-11-01';

export default {
  title: 'Calendar',
  description:
    'A month grid for picking a date or a date range, placed on the page. For a field with a calendar that opens from it, use Date Picker or Date Range Picker.',
  usage: [
    'Values are ISO strings: `"2024-11-09"` for a date, or `{ start, end }` with `range`.',
    'People press the title to move from days to months to years.',
    'Limit what can be picked with `minValue`, `maxValue` and `isDateUnavailable`.',
    'Add Cancel and Apply with `actions`, and content under the grid with `extra`.',
  ],
  components: ['Calendar'],
  demo: {
    component: 'Calendar',
    args: {
      size: 'md',
      range: false,
      defaultView: 'day',
      actionBar: false,
      titleDivider: false,
      actionsDivider: false,
      disabled: false,
      readOnly: false,
    },
    controls: {
      range: { kind: 'boolean' },
      // Figma 👀 Action-bar: builds the actions slot (Cancel and Apply sized for the calendar).
      actionBar: { kind: 'boolean' },
      actions: false,
      extra: false,
      value: false,
      defaultValue: false,
      defaultFocusedValue: false,
      minValue: false,
      maxValue: false,
      locale: { kind: 'select', options: ['en-US', 'en-GB', 'de-DE', 'fr-FR', 'ja-JP'] },
      firstDayOfWeek: { kind: 'select', options: ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] },
      'aria-label': false,
    },
    // Range changes the value's shape, so switching it starts a new calendar.
    render: ({ range, defaultView, actionBar, ...args }) => {
      const size = (args.size ?? 'md') as CalendarSize;
      const actions = actionBar ? (
        <>
          <Button size={buttonSize[size]} type="secondary">
            Cancel
          </Button>
          <Button size={buttonSize[size]}>Apply</Button>
        </>
      ) : undefined;
      return range ? (
        <Calendar key={`range-${defaultView}`} {...args} defaultView={defaultView} actions={actions} range aria-label="Stay" />
      ) : (
        <Calendar key={`single-${defaultView}`} {...args} defaultView={defaultView} actions={actions} aria-label="Date" />
      );
    },
    code: ({ actionBar, ...args }) => {
      const b = buttonSize[(args.size ?? 'md') as CalendarSize];
      return {
        ...args,
        actions: actionBar
          ? `<><Button size="${b}" type="secondary">Cancel</Button><Button size="${b}">Apply</Button></>`
          : undefined,
      };
    },
  },
  render: () => (
    <>
      <div className="pg-stack">
        <span className="pg-label"><code>size</code>: <code>sm</code>, <code>md</code>, <code>lg</code> (today is underlined)</span>
        <div className="pg-row">
          {sizes.map((size) => (
            <Calendar key={size} size={size} defaultFocusedValue={nov} aria-label={`Day ${size}`} />
          ))}
        </div>
      </div>
      <div className="pg-stack">
        <span className="pg-label"><code>range</code>: a start, an end and the days between; then a single date</span>
        <div className="pg-row">
          {sizes.map((size) => (
            <Calendar key={size} size={size} range defaultValue={{ start: '2024-11-09', end: '2024-11-20' }} aria-label={`Range ${size}`} />
          ))}
          <Calendar defaultValue="2024-11-20" aria-label="Single selected" />
        </div>
      </div>
      <div className="pg-stack">
        <span className="pg-label"><code>defaultView="month"</code> and <code>"year"</code>: <code>sm</code>, <code>md</code>, <code>lg</code></span>
        <div className="pg-row">
          {sizes.map((size) => (
            <Calendar key={size} size={size} defaultView="month" defaultFocusedValue={nov} aria-label={`Month ${size}`} />
          ))}
        </div>
        <div className="pg-row">
          {sizes.map((size) => (
            <Calendar key={size} size={size} defaultView="year" defaultFocusedValue={nov} aria-label={`Year ${size}`} />
          ))}
        </div>
      </div>
      <div className="pg-stack">
        <span className="pg-label"><code>minValue</code> and <code>maxValue</code> (5 to 25 November), <code>isDateUnavailable</code> (weekends), <code>disabled</code></span>
        <div className="pg-row">
          <Calendar minValue="2024-11-05" maxValue="2024-11-25" defaultValue="2024-11-12" aria-label="Bounded" />
          <Calendar
            defaultFocusedValue={nov}
            isDateUnavailable={(date) => [0, 6].includes(new Date(`${date}T00:00`).getDay())}
            aria-label="Weekdays only"
          />
          <Calendar disabled defaultValue="2024-11-12" aria-label="Disabled" />
        </div>
      </div>
      <div className="pg-stack">
        <span className="pg-label"><code>actions</code> at <code>sm</code>, <code>md</code>, <code>lg</code>; <code>extra</code>; <code>titleDivider</code> and <code>actionsDivider</code> (off by default)</span>
        <div className="pg-row">
          {sizes.map((size) => (
            <Calendar
              key={size}
              size={size}
              defaultValue="2024-11-20"
              aria-label={`Actions ${size}`}
              actions={
                <>
                  <Button size={buttonSize[size]} type="secondary">
                    Cancel
                  </Button>
                  <Button size={buttonSize[size]}>Apply</Button>
                </>
              }
            />
          ))}
          <Calendar defaultValue="2024-11-20" aria-label="With slot" extra={<span className="pg-label">Times shown in UTC</span>} />
          <Calendar
            defaultValue="2024-11-20"
            aria-label="With dividers"
            titleDivider
            actionsDivider
            actions={
              <>
                <Button size="sm" type="secondary">
                  Cancel
                </Button>
                <Button size="sm">Apply</Button>
              </>
            }
          />
        </div>
      </div>
      <div className="pg-stack">
        <span className="pg-label"><code>locale="en-GB"</code> (weeks start on Monday) and <code>"de-DE"</code></span>
        <div className="pg-row">
          <Calendar locale="en-GB" defaultValue="2024-11-20" aria-label="British" />
          <Calendar locale="de-DE" defaultValue="2024-11-20" aria-label="German" />
        </div>
      </div>
    </>
  ),
} satisfies Story;
