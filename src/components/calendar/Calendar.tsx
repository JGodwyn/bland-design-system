import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
  type Ref,
} from 'react';
import {
  I18nProvider,
  mergeProps,
  useButton,
  useCalendar,
  useCalendarCell,
  useCalendarGrid,
  useDateFormatter,
  useFocusVisible,
  useLocale,
  useRangeCalendar,
  type AriaButtonProps,
  type AriaCalendarProps,
  type AriaRangeCalendarProps,
} from 'react-aria';
import {
  useCalendarState,
  useRangeCalendarState,
  type CalendarState,
  type DateValue,
  type RangeCalendarState,
} from 'react-stately';
import {
  createCalendar,
  isSameDay,
  isSameMonth,
  isToday,
  toCalendarDate,
  today as todayIn,
  type CalendarDate,
} from '@internationalized/date';
import { CaretLeftIcon, CaretRightIcon, ListIcon } from '../../icons';
import { Icon } from '../icon/Icon';
import { fromDate, fromRange, useDateOptProp, useDateProp, useRangeProp, type DateRange } from './dates';
import '../pagination/pagination.css';
import './calendar.css';

export type CalendarSize = 'sm' | 'md' | 'lg';
/** Figma `Type`: the days of a month, the months of a year, or a page of years. */
export type CalendarView = 'day' | 'month' | 'year';
export type { DateRange } from './dates';

interface CalendarBaseProps extends Omit<HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange'> {
  /** Figma `Size`: cells control/xs, sm, md (24, 32, 40), calendar/width-* wide. Default md (Godwin 2026-10-20; Figma sm). */
  size?: CalendarSize;
  /**
   * Figma `Type`: the view it opens on. day (default) shows a month of days; the title toggle switches to the
   * months of the year, and from there to a page of twelve years. Picking a year shows its months, picking a
   * month shows its days.
   */
  defaultView?: CalendarView;
  /** The earliest date that can be picked, `"2024-01-01"`. Earlier days, months and years are disabled. */
  minValue?: string;
  /** The latest date that can be picked. */
  maxValue?: string;
  /** Marks single dates as not available (drawn disabled, not selectable): called with each date, `"2024-11-09"`. */
  isDateUnavailable?: (date: string) => boolean;
  /** The month shown first when nothing is selected, any date in it (`"2024-11-01"`). Default today. */
  defaultFocusedValue?: string;
  /** The first column of the week. Default from the locale (Sunday in en-US, Monday in en-GB). */
  firstDayOfWeek?: 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat';
  /** The locale for month and weekday names and the first day of the week. Default the app's (React Aria's I18nProvider, else the browser's). */
  locale?: string;
  /** Nothing can be picked or navigated; the days draw disabled. */
  disabled?: boolean;
  /** Shows the value, but it cannot be changed. */
  readOnly?: boolean;
  /** Moves focus to the selected (or focused) day when it mounts. */
  autoFocus?: boolean;
  /** Figma `🧩 Slot` (shown with `👀 Slot`): any content under the grid, space-sm below it. */
  extra?: ReactNode;
  /**
   * Figma `👀 Action-bar`: buttons under the grid, sharing the width equally (Figma: Cancel secondary, then
   * Apply primary). Use Buttons xs on a sm calendar, sm on md, md on lg.
   */
  actions?: ReactNode;
  /** Figma `👀 Divider` on `_calendar-title-bar`: a line under the title bar. Default false, as in Figma. */
  titleDivider?: boolean;
  /** Figma `👀 Divider` on `_calendar-action-bar`: a line over the actions. Default false, as in Figma. */
  actionsDivider?: boolean;
  /** Names the calendar's grid for screen readers, before the month it shows. */
  'aria-label'?: string;
  ref?: Ref<HTMLDivElement>;
}

export interface CalendarSingleProps extends CalendarBaseProps {
  /** Figma `Range`: false picks one date (default), true picks a start and an end. */
  range?: false;
  /** The selected date, `"2024-11-09"`, controlled (`null` for none). Pair it with `onValueChange`. */
  value?: string | null;
  /** The selected date at first, uncontrolled. */
  defaultValue?: string | null;
  /** Called with the picked date, `"2024-11-09"`. */
  onValueChange?: (value: string) => void;
}

export interface CalendarRangeProps extends CalendarBaseProps {
  /** Figma `Range`: false picks one date (default), true picks a start and an end. */
  range: true;
  /** The selected range, `{ start, end }` as ISO dates, controlled (`null` for none). Pair it with `onValueChange`. */
  value?: DateRange | null;
  /** The selected range at first, uncontrolled. */
  defaultValue?: DateRange | null;
  /** Called with the range once its end is picked (the first press picks the start). */
  onValueChange?: (value: DateRange) => void;
}

export type CalendarProps = CalendarSingleProps | CalendarRangeProps;

/**
 * A month of days to pick a date or a range from, with month and year views to get there fast. React Aria
 * runs the day grid (`useCalendar`, `useRangeCalendar`): arrows move by day and week, Page Up and Down by month
 * (with Shift, by year), Home and End to the week's ends, Enter picks. Values are ISO strings.
 * Figma: Date & Time page, sets "Calendar", "_calendar-title-bar", "_calendar-item" and "_calendar-action-bar".
 */
export function Calendar(props: CalendarProps) {
  const inner = props.range ? <RangeCalendarRoot {...props} /> : <SingleCalendarRoot {...props} />;
  return props.locale ? <I18nProvider locale={props.locale}>{inner}</I18nProvider> : inner;
}

function SingleCalendarRoot({ value, defaultValue, onValueChange, minValue, maxValue, isDateUnavailable, defaultFocusedValue, ...rest }: CalendarSingleProps) {
  const ariaProps = {
    value: useDateProp(value),
    defaultValue: useDateProp(defaultValue),
    onChange: onValueChange ? (next: DateValue | null) => next && onValueChange(fromDate(next)) : undefined,
    minValue: useDateOptProp(minValue),
    maxValue: useDateOptProp(maxValue),
    isDateUnavailable: isDateUnavailable ? (date: DateValue) => isDateUnavailable(fromDate(date)) : undefined,
    defaultFocusedValue: useDateOptProp(defaultFocusedValue),
  };
  return <SingleCalendar {...rest} aria={ariaProps} />;
}

function RangeCalendarRoot({ value, defaultValue, onValueChange, minValue, maxValue, isDateUnavailable, defaultFocusedValue, ...rest }: CalendarRangeProps) {
  const ariaProps = {
    value: useRangeProp(value),
    defaultValue: useRangeProp(defaultValue),
    onChange: onValueChange
      ? (next: { start: DateValue; end: DateValue } | null) => {
          const range = fromRange(next);
          if (range) onValueChange(range);
        }
      : undefined,
    minValue: useDateOptProp(minValue),
    maxValue: useDateOptProp(maxValue),
    isDateUnavailable: isDateUnavailable ? (date: DateValue) => isDateUnavailable(fromDate(date)) : undefined,
    defaultFocusedValue: useDateOptProp(defaultFocusedValue),
  };
  return <RangeCalendar {...rest} aria={ariaProps} />;
}

// ---- Internal: the calendars the pickers render with React Aria's own props ----

/** Layout props of the visible calendar; everything React Aria needs goes in `aria`. */
export type CalendarChromeProps = Omit<
  CalendarBaseProps,
  'minValue' | 'maxValue' | 'isDateUnavailable' | 'defaultFocusedValue' | 'locale'
>;

/** One-date calendar from React Aria props (`value` as CalendarDate). Date Picker renders this. */
export function SingleCalendar({ aria, disabled, readOnly, autoFocus, firstDayOfWeek, 'aria-label': ariaLabel, ...chrome }: CalendarChromeProps & { aria: AriaCalendarProps<DateValue> }) {
  const { locale } = useLocale();
  const props = { ...aria, isDisabled: disabled ?? aria.isDisabled, isReadOnly: readOnly ?? aria.isReadOnly, autoFocus: autoFocus ?? aria.autoFocus, firstDayOfWeek, 'aria-label': ariaLabel ?? aria['aria-label'] };
  const state = useCalendarState({ ...props, locale, createCalendar });
  useFollowValue(state, aria.value ?? null);
  const ref = useRef<HTMLDivElement>(null);
  const { calendarProps, prevButtonProps, nextButtonProps } = useCalendar(props, state);
  return <CalendarBody {...chrome} state={state} range={false} firstDayOfWeek={firstDayOfWeek} calendarProps={calendarProps} prevButtonProps={prevButtonProps} nextButtonProps={nextButtonProps} gridRef={ref} />;
}

/** Range calendar from React Aria props. Date Range Picker renders this. */
export function RangeCalendar({ aria, disabled, readOnly, autoFocus, firstDayOfWeek, 'aria-label': ariaLabel, ...chrome }: CalendarChromeProps & { aria: AriaRangeCalendarProps<DateValue> }) {
  const { locale } = useLocale();
  const props = { ...aria, isDisabled: disabled ?? aria.isDisabled, isReadOnly: readOnly ?? aria.isReadOnly, autoFocus: autoFocus ?? aria.autoFocus, firstDayOfWeek, 'aria-label': ariaLabel ?? aria['aria-label'] };
  const state = useRangeCalendarState({ ...props, locale, createCalendar });
  useFollowValue(state, aria.value?.start ?? null);
  const ref = useRef<HTMLDivElement>(null);
  const { calendarProps, prevButtonProps, nextButtonProps } = useRangeCalendar(props, state, ref);
  return <CalendarBody {...chrome} state={state} range firstDayOfWeek={firstDayOfWeek} calendarProps={calendarProps} prevButtonProps={prevButtonProps} nextButtonProps={nextButtonProps} gridRef={ref} />;
}

/**
 * A value changed from outside (a date typed into a picker's field while the calendar is open) brings its month
 * into view, unless focus is in the calendar, where the person is choosing.
 */
function useFollowValue(state: CalendarState | RangeCalendarState, value: DateValue | null) {
  const key = value ? fromDate(value) : null;
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (!value || state.isFocused || isSameMonth(value, state.focusedDate)) return;
    state.setFocusedDate(toCalendarDate(value));
    // Only when the value itself changes.
  }, [key]);
}

// ---- The visible calendar ----

type AnyState = CalendarState | RangeCalendarState;

interface BodyProps extends Omit<CalendarChromeProps, 'disabled' | 'readOnly' | 'autoFocus' | 'aria-label'> {
  state: AnyState;
  range: boolean;
  calendarProps: HTMLAttributes<HTMLElement>;
  prevButtonProps: AriaButtonProps;
  nextButtonProps: AriaButtonProps;
  gridRef: Ref<HTMLDivElement>;
}

/** The first year of the page of twelve that holds `year`: pages start on a decade (2020 – 2031, as in Figma). */
const pageStart = (year: number) => Math.floor(year / 10) * 10;

function CalendarBody({
  state,
  range,
  calendarProps,
  prevButtonProps,
  nextButtonProps,
  gridRef,
  size = 'md',
  defaultView = 'day',
  firstDayOfWeek,
  extra,
  actions,
  titleDivider = false,
  actionsDivider = false,
  className,
  ref,
  ...rest
}: BodyProps) {
  const [view, setView] = useState<CalendarView>(defaultView);
  // Set when a month or year was picked from its grid, so the next view takes focus.
  const [focusNext, setFocusNext] = useState(false);
  const focused = state.focusedDate;
  const monthFormatter = useDateFormatter({ month: 'short', timeZone: state.timeZone });
  const yearFormatter = useDateFormatter({ year: 'numeric', timeZone: state.timeZone });
  const fmtMonth = (d: CalendarDate) => monthFormatter.format(d.toDate(state.timeZone));
  const fmtYear = (d: CalendarDate) => yearFormatter.format(d.toDate(state.timeZone));
  const now = todayIn(state.timeZone);

  // Bounds for the month and year views, by whole month or year.
  const min = state.minValue;
  const max = state.maxValue;
  const monthOutOfBounds = (d: CalendarDate) =>
    (min != null && d.set({ day: d.calendar.getDaysInMonth(d) }).compare(min) < 0) || (max != null && d.set({ day: 1 }).compare(max) > 0);
  const yearOutOfBounds = (d: CalendarDate) => (min != null && d.year < min.year) || (max != null && d.year > max.year);

  const goto = (date: CalendarDate) => {
    // setFocusedDate clamps to min and max.
    state.setFocusedDate(date);
  };

  // The title toggle and the arrows per view (Figma _calendar-title-bar View=day, month, year).
  let toggle: ReactNode;
  let gridLabel = '';
  let prev: AriaButtonProps;
  let next: AriaButtonProps;
  if (view === 'day') {
    toggle = (
      <>
        <span className="bland-calendar__title-month">{fmtMonth(focused)}</span> <span>{fmtYear(focused)}</span>
      </>
    );
    prev = prevButtonProps;
    next = nextButtonProps;
  } else if (view === 'month') {
    toggle = <span className="bland-calendar__title-month">{fmtYear(focused)}</span>;
    prev = { 'aria-label': prevButtonProps['aria-label'], isDisabled: state.isDisabled || (min != null && focused.year <= min.year), onPress: () => goto(focused.subtract({ years: 1 })) };
    next = { 'aria-label': nextButtonProps['aria-label'], isDisabled: state.isDisabled || (max != null && focused.year >= max.year), onPress: () => goto(focused.add({ years: 1 })) };
  } else {
    const start = pageStart(focused.year);
    gridLabel = `${fmtYear(focused.set({ year: start }))} – ${fmtYear(focused.set({ year: start + 11 }))}`;
    toggle = <span className="bland-calendar__title-month">{gridLabel}</span>;
    prev = { 'aria-label': prevButtonProps['aria-label'], isDisabled: state.isDisabled || (min != null && start <= min.year), onPress: () => goto(focused.set({ year: start - 10 })) };
    next = { 'aria-label': nextButtonProps['aria-label'], isDisabled: state.isDisabled || (max != null && start + 11 >= max.year), onPress: () => goto(focused.set({ year: start + 10 })) };
  }

  const pickMonth = (d: CalendarDate) => {
    goto(d.set({ day: Math.min(focused.day, d.calendar.getDaysInMonth(d)) }));
    setView('day');
    setFocusNext(true);
    state.setFocused(true);
  };
  const pickYear = (d: CalendarDate) => {
    // Same month and day in the picked year (the 29th of February falls back to the 28th).
    goto(focused.set({ year: d.year }));
    setView('month');
    setFocusNext(true);
  };

  // The views area eases to its new height when a month has more or fewer weeks, or the view changes (Godwin
  // 2026-10-20). It measures its content and sets its own height; at once from the keyboard (docs/motion.md).
  const viewsRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const { isFocusVisible: keyboard } = useFocusVisible();
  const keyboardRef = useRef(keyboard);
  keyboardRef.current = keyboard;
  useLayoutEffect(() => {
    const views = viewsRef.current;
    const content = contentRef.current;
    if (!views || !content) return;
    const fit = () => {
      views.toggleAttribute('data-instant', keyboardRef.current);
      views.style.height = `${content.offsetHeight}px`;
    };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(content);
    return () => observer.disconnect();
  }, []);

  const months = Array.from({ length: 12 }, (_, i) => focused.set({ month: i + 1, day: 1 }));
  const years = Array.from({ length: 12 }, (_, i) => focused.set({ year: pageStart(focused.year) + i, month: 1, day: 1 }));

  return (
    <div
      {...mergeProps(rest, calendarProps)}
      ref={ref}
      className={`bland-calendar bland-smooth${className ? ` ${className}` : ''}`}
      data-size={size}
      data-view={view}
      data-range={range || undefined}
      data-disabled={state.isDisabled || undefined}
    >
      <div className="bland-calendar__title" data-divider={titleDivider || undefined}>
        {view === 'year' ? (
          <span className="bland-calendar__toggle" data-static>
            {toggle}
          </span>
        ) : (
          <TitleToggle
            expanded={view !== 'day'}
            disabled={state.isDisabled}
            onPress={() => setView(view === 'day' ? 'month' : 'year')}
          >
            {toggle}
          </TitleToggle>
        )}
        <span className="bland-calendar__nav">
          <NavButton {...prev} icon={<CaretLeftIcon />} />
          <NavButton {...next} icon={<CaretRightIcon />} />
        </span>
      </div>
      <div ref={viewsRef} className="bland-calendar__views">
        <div ref={contentRef}>
          {view === 'day' ? (
            <DayGrid state={state} range={range} firstDayOfWeek={firstDayOfWeek} gridRef={gridRef} />
          ) : (
            <PeriodGrid
              key={view}
              label={view === 'month' ? fmtYear(focused) : gridLabel}
              items={(view === 'month' ? months : years).map((d) => ({
                date: d,
                label: view === 'month' ? fmtMonth(d) : fmtYear(d),
                current: view === 'month' ? isSameMonth(d, focused) : d.year === focused.year,
                today: view === 'month' ? isSameMonth(d, now) : d.year === now.year,
                disabled: state.isDisabled || (view === 'month' ? monthOutOfBounds(d) : yearOutOfBounds(d)),
              }))}
              autoFocus={focusNext}
              onPick={(d) => (view === 'month' ? pickMonth(d) : pickYear(d))}
            />
          )}
        </div>
      </div>
      {extra != null && extra !== false && <div className="bland-calendar__extra">{extra}</div>}
      {actions != null && actions !== false && (
        <div className="bland-calendar__actions" data-divider={actionsDivider || undefined}>
          {actions}
        </div>
      )}
    </div>
  );
}

function TitleToggle({ expanded, disabled, onPress, children }: { expanded: boolean; disabled: boolean; onPress: () => void; children: ReactNode }) {
  const ref = useRef<HTMLButtonElement>(null);
  const { buttonProps } = useButton({ onPress, isDisabled: disabled }, ref);
  return (
    <button {...buttonProps} ref={ref} className="bland-calendar__toggle bland-focus-ring bland-smooth" aria-expanded={expanded}>
      {children}
      <Icon className="bland-calendar__caret">
        <ListIcon />
      </Icon>
    </button>
  );
}

/** Previous and next: Figma's exposed Pagination items, sm at every calendar size. */
function NavButton({ icon, ...props }: AriaButtonProps & { icon: ReactNode }) {
  const ref = useRef<HTMLButtonElement>(null);
  const { buttonProps } = useButton(props, ref);
  return (
    <button {...buttonProps} ref={ref} className="bland-pagination__item bland-calendar__arrow bland-focus-ring bland-smooth">
      <Icon>{icon}</Icon>
    </button>
  );
}

// ---- Day view: React Aria's grid ----

function DayGrid({ state, range, firstDayOfWeek, gridRef }: { state: AnyState; range: boolean; firstDayOfWeek?: CalendarBaseProps['firstDayOfWeek']; gridRef: Ref<HTMLDivElement> }) {
  const { gridProps, headerProps, weekDays, weeksInMonth } = useCalendarGrid({ firstDayOfWeek }, state);
  return (
    <div ref={gridRef} className="bland-calendar__grid-wrap">
      <table {...gridProps} className="bland-calendar__grid">
        <thead {...headerProps}>
          <tr>
            {weekDays.map((day, i) => (
              <th key={i} className="bland-calendar__weekday">
                {day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: weeksInMonth }, (_, week) => (
            <tr key={week}>
              {state.getDatesInWeek(week).map((date, i) =>
                date ? <DayCell key={i} state={state} range={range} date={date} /> : <td key={i} />,
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DayCell({ state, range, date }: { state: AnyState; range: boolean; date: CalendarDate }) {
  const ref = useRef<HTMLDivElement>(null);
  const outside = !isSameMonth(date, state.visibleRange.start);
  const { cellProps, buttonProps, isSelected, isDisabled, isUnavailable, formattedDate } = useCalendarCell({ date, isOutsideMonth: outside }, state, ref);
  // Figma Selection: selected for a single date and a range's ends, range for the days between.
  let selection: 'none' | 'selected' | 'range' = 'none';
  if (isSelected) {
    const highlighted = range ? (state as RangeCalendarState).highlightedRange : null;
    selection = highlighted && !isSameDay(date, highlighted.start) && !isSameDay(date, highlighted.end) ? 'range' : 'selected';
  }
  const today = isToday(date, state.timeZone);
  return (
    <td {...cellProps}>
      <div
        {...buttonProps}
        ref={ref}
        className="bland-calendar__item bland-focus-ring bland-smooth"
        data-selection={outside ? 'none' : selection}
        data-disabled={isDisabled || isUnavailable || outside || undefined}
        data-outside={outside || undefined}
        aria-current={today && !outside ? 'date' : undefined}
      >
        <span className="bland-calendar__label">{formattedDate}</span>
      </div>
    </td>
  );
}

// ---- Month and year views: a 3 x 4 grid of buttons with roving focus ----

interface PeriodItem {
  date: CalendarDate;
  label: string;
  /** The month or year in view: Figma Selection=selected. */
  current: boolean;
  today: boolean;
  disabled: boolean;
}

const COLUMNS = 3;

function PeriodGrid({ label, items, autoFocus, onPick }: { label: string; items: PeriodItem[]; autoFocus: boolean; onPick: (date: CalendarDate) => void }) {
  const initial = Math.max(0, items.findIndex((item) => item.current));
  const [active, setActive] = useState(initial);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const labels = items.map((i) => i.label).join();
  // A new page (arrows) moves the roving stop to its current item.
  useEffect(() => setActive(initial), [labels, initial]);
  // Only on mount: a picked year opens the month view with focus on its current month.
  const focusOnMount = useRef(autoFocus);
  useEffect(() => {
    if (focusOnMount.current) refs.current[initial]?.focus();
    focusOnMount.current = false;
  }, [initial]);

  const move = (event: KeyboardEvent, index: number) => {
    const step: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -COLUMNS, ArrowDown: COLUMNS };
    let to: number | null = null;
    const delta = step[event.key];
    if (delta !== undefined) to = index + delta;
    else if (event.key === 'Home') to = index - (index % COLUMNS);
    else if (event.key === 'End') to = index - (index % COLUMNS) + COLUMNS - 1;
    if (to == null) return;
    event.preventDefault();
    to = Math.max(0, Math.min(items.length - 1, to));
    setActive(to);
    refs.current[to]?.focus();
  };

  const rows = Array.from({ length: items.length / COLUMNS }, (_, r) => items.slice(r * COLUMNS, r * COLUMNS + COLUMNS));
  return (
    <div role="grid" aria-label={label} className="bland-calendar__periods">
      {rows.map((row, r) => (
        <div role="row" key={r} className="bland-calendar__period-row">
          {row.map((item, c) => {
            const index = r * COLUMNS + c;
            return (
              <div role="gridcell" key={index} aria-selected={item.current} className="bland-calendar__period-cell">
                <button
                  ref={(el) => {
                    refs.current[index] = el;
                  }}
                  type="button"
                  className="bland-calendar__item bland-focus-ring bland-smooth"
                  tabIndex={index === active ? 0 : -1}
                  aria-disabled={item.disabled || undefined}
                  data-selection={item.current ? 'selected' : 'none'}
                  data-disabled={item.disabled || undefined}
                  aria-current={item.today ? 'date' : undefined}
                  onKeyDown={(event) => move(event, index)}
                  onFocus={() => setActive(index)}
                  onClick={() => !item.disabled && onPick(item.date)}
                >
                  <span className="bland-calendar__label">{item.label}</span>
                </button>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
