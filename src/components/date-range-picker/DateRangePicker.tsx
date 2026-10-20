import { useRef, useState, type HTMLAttributes, type ReactNode } from 'react';
import { I18nProvider, mergeProps, mergeRefs, useDateField, useDateRangePicker, useId, useLocale } from 'react-aria';
import { useDateFieldState, useDateRangePickerState, type DateValue } from 'react-stately';
import { createCalendar } from '@internationalized/date';
import { CalendarBlankIcon } from '../../icons';
import { Button } from '../button/Button';
import { RangeCalendar } from '../calendar/Calendar';
import { fromDate, fromRange, useDateOptProp, useRangeProp, type DateRange } from '../calendar/dates';
import { FieldButton, FieldShell, Segments } from '../date-field/DateField';
import { actionButtonSize, useFieldOpen, useInstant, type DatePickerBaseProps } from '../date-picker/DatePicker';
import { Popover } from '../overlay/Popover';
import '../overlay/popover.css';
import './date-range-picker.css';

export type { DateRange } from '../calendar/dates';
export type { DatePickerSize as DateRangePickerSize, DatePickerStatus as DateRangePickerStatus } from '../date-picker/DatePicker';

export interface DateRangePickerProps extends DatePickerBaseProps {
  /** The range, `{ start, end }` as ISO dates, controlled (`null` for empty). Pair it with `onValueChange`. */
  value?: DateRange | null;
  /** The range at first, uncontrolled. */
  defaultValue?: DateRange | null;
  /** Called with the range once both dates are complete (`null` when cleared). */
  onValueChange?: (value: DateRange | null) => void;
  /** The start field's label (Figma `✏️ Label` on the start Text Input). Default "Start date". */
  startLabel?: ReactNode;
  /** The end field's label. Default "End date". */
  endLabel?: ReactNode;
  /** Names the pair for screen readers (Figma shows no label over both). Default "Date range". */
  'aria-label'?: string;
  /** Form field names: hidden inputs submit each date as `"2024-11-09"`. */
  startName?: string;
  endName?: string;
  /** Accessible name of the calendar buttons. Default React Aria's ("Calendar"). */
  calendarLabel?: string;
}

/**
 * Start and end date fields (Figma's exposed Text Inputs, each with its own label and CalendarBlank button)
 * sharing one Range calendar under the start field. React Aria runs it (`useDateRangePicker`); values are ISO
 * dates. Figma: Date & Time page, set "Date range picker".
 */
export function DateRangePicker(props: DateRangePickerProps) {
  return props.locale ? (
    <I18nProvider locale={props.locale}>
      <DateRangePickerInner {...props} />
    </I18nProvider>
  ) : (
    <DateRangePickerInner {...props} />
  );
}

function DateRangePickerInner({
  size = 'sm',
  calendarSize = 'md',
  status = 'default',
  helperText,
  value,
  defaultValue,
  onValueChange,
  minValue,
  maxValue,
  isDateUnavailable,
  confirm = false,
  cancelLabel = 'Cancel',
  applyLabel = 'Apply',
  open,
  defaultOpen,
  onOpenChange,
  firstDayOfWeek,
  locale: _locale,
  disabled = false,
  readOnly = false,
  required = false,
  startLabel = 'Start date',
  endLabel = 'End date',
  startName,
  endName,
  calendarLabel,
  fieldRef,
  className,
  'aria-label': ariaLabel = 'Date range',
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy,
  ...rest
}: DateRangePickerProps) {
  const { locale } = useLocale();
  const ariaProps = {
    description: helperText,
    value: useRangeProp(value),
    defaultValue: useRangeProp(defaultValue),
    onChange: onValueChange ? (next: { start: DateValue; end: DateValue } | null) => onValueChange(fromRange(next)) : undefined,
    minValue: useDateOptProp(minValue),
    maxValue: useDateOptProp(maxValue),
    isDateUnavailable: isDateUnavailable ? (date: DateValue) => isDateUnavailable(fromDate(date)) : undefined,
    isOpen: open,
    defaultOpen,
    onOpenChange,
    isDisabled: disabled,
    isReadOnly: readOnly,
    isRequired: required,
    granularity: 'day' as const,
    // 09/11/2024 in every locale, as Figma draws it (nl-NL would print 9-11-2024).
    shouldForceLeadingZeros: true,
    shouldCloseOnSelect: !confirm,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    'aria-describedby': ariaDescribedBy,
  };
  const state = useDateRangePickerState(ariaProps);
  const groupRef = useRef<HTMLDivElement>(null);
  const [anchor, setAnchor] = useState<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { groupProps, startFieldProps, endFieldProps, buttonProps, dialogProps, calendarProps, descriptionProps } = useDateRangePicker(
    ariaProps,
    state,
    groupRef,
  );

  // Each field is labelled by its own visible label (Figma: Start date, End date) instead of the group's name.
  const startLabelId = useId();
  const endLabelId = useId();
  const startState = useDateFieldState({ ...startFieldProps, locale, createCalendar });
  const endState = useDateFieldState({ ...endFieldProps, locale, createCalendar });
  const startRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const start = useDateField({ ...startFieldProps, 'aria-label': undefined, 'aria-labelledby': startLabelId }, startState, startRef);
  const end = useDateField({ ...endFieldProps, 'aria-label': undefined, 'aria-labelledby': endLabelId }, endState, endRef);

  // Typing while it is open moves the pending range too.
  const [pending, setPending] = useState(state.value);
  const [prevOpen, setPrevOpen] = useState(state.isOpen);
  const [prevValue, setPrevValue] = useState(state.value);
  if (state.isOpen !== prevOpen || state.value !== prevValue) {
    setPrevOpen(state.isOpen);
    setPrevValue(state.value);
    if (state.isOpen) setPending(state.value);
  }
  const instant = useInstant(state.isOpen);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [group, setGroup] = useState<HTMLDivElement | null>(null);
  const fieldOpen = useFieldOpen(state, group, popoverRef, !disabled && !readOnly);
  const complete = (v: typeof state.value) => (v?.start && v?.end ? { start: v.start, end: v.end } : null);
  const invalid = status === 'default' && state.isInvalid ? 'danger' : status;
  const { id: _buttonId, ...endButtonProps } = buttonProps;
  const button = (props: typeof buttonProps, ref?: typeof buttonRef) => (
    <FieldButton {...props} buttonRef={ref} aria-label={calendarLabel ?? props['aria-label']} icon={<CalendarBlankIcon />} />
  );

  return (
    <div {...rest} className={`bland-date-range-picker${className ? ` ${className}` : ''}`} data-size={size} data-disabled={disabled || undefined}>
      {/* React Aria's group (keys move between the four segments' fields); the popover stays outside it. */}
      <div
        {...mergeProps(groupProps, fieldOpen.handlers)}
        ref={mergeRefs<HTMLDivElement>(groupRef, (el: HTMLDivElement | null) => setGroup(el))}
        className="bland-date-range-picker__fields"
      >
        <FieldShell
          size={size}
          status={invalid}
          label={startLabel}
          labelProps={{ id: startLabelId }}
          boxRef={mergeRefs<HTMLDivElement>(fieldRef, (el: HTMLDivElement | null) => setAnchor(el))}
          disabled={disabled}
          filled={state.value?.start != null}
          end={button(buttonProps, buttonRef)}
        >
          <Segments state={startState} fieldProps={start.fieldProps} fieldRef={startRef} />
        </FieldShell>
        <FieldShell
          size={size}
          status={invalid}
          label={endLabel}
          labelProps={{ id: endLabelId }}
          disabled={disabled}
          filled={state.value?.end != null}
          end={button(endButtonProps)}
        >
          <Segments state={endState} fieldProps={end.fieldProps} fieldRef={endRef} />
        </FieldShell>
      </div>
      {helperText != null && helperText !== false && (
        <span {...descriptionProps} className="bland-date-range-picker__helper" data-status={invalid}>
          {helperText}
        </span>
      )}
      {startName && <input type="hidden" name={startName} value={fromDate(state.value?.start) ?? ''} />}
      {endName && <input type="hidden" name={endName} value={fromDate(state.value?.end) ?? ''} />}
      <Popover
        open={state.isOpen}
        reference={anchor}
        placement="bottom-start"
        instant={instant}
        onClose={() => state.setOpen(false)}
        keepOpenOn={fieldOpen.keepOpenOn}
        returnFocus={buttonRef}
        ref={popoverRef}
      >
        <div {...dialogProps} role="dialog" className="bland-date-picker__dialog">
          <RangeCalendar
            size={calendarSize}
            firstDayOfWeek={firstDayOfWeek}
            aria={{
              ...calendarProps,
              autoFocus: !fieldOpen.fromField,
              ...(confirm && { value: complete(pending), onChange: (v: { start: DateValue; end: DateValue } | null) => setPending(v ?? { start: null, end: null }) }),
            }}
            actions={
              confirm && (
                <>
                  <Button size={actionButtonSize[calendarSize]} type="secondary" onClick={() => state.setOpen(false)}>
                    {cancelLabel}
                  </Button>
                  <Button
                    size={actionButtonSize[calendarSize]}
                    onClick={() => {
                      const range = complete(pending);
                      if (range) state.setValue(range);
                      state.setOpen(false);
                    }}
                  >
                    {applyLabel}
                  </Button>
                </>
              )
            }
          />
        </div>
      </Popover>
    </div>
  );
}
