import { useRef, useState, type HTMLAttributes, type ReactNode, type Ref } from 'react';
import { I18nProvider, mergeRefs, useDateField, useDatePicker, useFocusVisible, useLocale } from 'react-aria';
import { useDateFieldState, useDatePickerState, type DateValue } from 'react-stately';
import { createCalendar } from '@internationalized/date';
import { CalendarBlankIcon } from '../../icons';
import { Button } from '../button/Button';
import { SingleCalendar, type CalendarSize } from '../calendar/Calendar';
import { fromDate, useDateOptProp, useDateProp } from '../calendar/dates';
import { FieldButton, FieldShell, Segments, type DateFieldStatus } from '../date-field/DateField';
import { Popover } from '../overlay/Popover';
import '../overlay/popover.css';

export type DatePickerSize = 'sm' | 'md' | 'lg';
export type DatePickerStatus = DateFieldStatus;

/** Figma's action bar Buttons per calendar size: xs on sm, sm on md, md on lg. */
export const actionButtonSize = { sm: 'xs', md: 'sm', lg: 'md' } as const;

/** Props Date Picker and Date Range Picker share. */
export interface DatePickerBaseProps extends Omit<HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange'> {
  /** Figma `Size`: the field (input/*, 32, 40, 48) and its calendar (sm, md, lg). Default sm, as in Figma. */
  size?: DatePickerSize;
  /** Figma `Status` on the exposed Text Input: border, helper color and status icon. A date out of bounds or unavailable shows danger by itself. */
  status?: DatePickerStatus;
  /** Figma `✏️ Helper text`, under the field and read with it. Put the error message here for danger. */
  helperText?: ReactNode;
  /** The earliest date that can be entered or picked, `"2024-01-01"`. */
  minValue?: string;
  /** The latest date that can be entered or picked. */
  maxValue?: string;
  /** Marks single dates as not available: drawn disabled in the calendar, invalid when typed. Called with `"2024-11-09"`. */
  isDateUnavailable?: (date: string) => boolean;
  /**
   * Figma `👀 Action-bar` on the calendar: Cancel and Apply under the grid. A picked date waits for Apply;
   * Cancel, Escape or a press outside drop it. Off by default (as in Figma): a picked date applies at once and
   * closes the calendar.
   */
  confirm?: boolean;
  /** Text of the action bar's Cancel button. Default "Cancel". */
  cancelLabel?: string;
  /** Text of the action bar's Apply button. Default "Apply". */
  applyLabel?: string;
  /** Whether the calendar is open, controlled. Pair it with `onOpenChange`. */
  open?: boolean;
  /** Whether the calendar is open at first, uncontrolled. */
  defaultOpen?: boolean;
  /** Called when the calendar opens or closes. */
  onOpenChange?: (open: boolean) => void;
  /** The first column of the calendar's weeks. Default from the locale. */
  firstDayOfWeek?: 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat';
  /**
   * The locale: the order, separators and placeholders of the segments (en-US mm/dd/yyyy, en-GB dd/mm/yyyy,
   * nl-NL dd-mm-jjjj) and the calendar's names. Default the app's (React Aria's I18nProvider, else the browser's).
   */
  locale?: string;
  /** No editing, no calendar; the field draws the disabled colors. */
  disabled?: boolean;
  /** Shows the value; it cannot be changed. */
  readOnly?: boolean;
  /** Required in a form: an empty field is invalid on submit. */
  required?: boolean;
  /** Reaches the bordered field box, the element the calendar anchors to. */
  fieldRef?: Ref<HTMLDivElement>;
}

export interface DatePickerProps extends DatePickerBaseProps {
  /** Figma `✏️ Label` on the exposed Text Input. Leave it out and give an `aria-label`. */
  label?: ReactNode;
  /** The date, `"2024-11-09"`, controlled (`null` for empty). Pair it with `onValueChange`. */
  value?: string | null;
  /** The date at first, uncontrolled. */
  defaultValue?: string | null;
  /** Called with the date once it is complete (`null` when cleared). */
  onValueChange?: (value: string | null) => void;
  /** Form field name: a hidden input submits the date as `"2024-11-09"`. */
  name?: string;
  /** Accessible name of the calendar button. Default React Aria's ("Calendar"). */
  calendarLabel?: string;
}

/**
 * A date field with a calendar popover. The field is Figma's exposed Text Input with editable segments (type
 * the digits, arrows step them; the order and placeholder follow the locale); the CalendarBlank button opens
 * the Calendar under it. React Aria runs it (`useDatePicker`, `useDateField`); values are ISO dates.
 * Figma: Date & Time page, set "Single Date picker".
 */
export function DatePicker(props: DatePickerProps) {
  return props.locale ? (
    <I18nProvider locale={props.locale}>
      <DatePickerInner {...props} />
    </I18nProvider>
  ) : (
    <DatePickerInner {...props} />
  );
}

/** No motion when it opens from the keyboard (React Aria's input modality), as Dropdown. */
export function useInstant(open: boolean) {
  const { isFocusVisible: keyboard } = useFocusVisible();
  const [prevOpen, setPrevOpen] = useState(open);
  const [instant, setInstant] = useState(true);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) setInstant(keyboard);
  }
  return instant;
}

function DatePickerInner({
  size = 'sm',
  status = 'default',
  label,
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
  name,
  calendarLabel,
  fieldRef,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy,
  ...rest
}: DatePickerProps) {
  const { locale } = useLocale();
  const ariaProps = {
    label,
    description: helperText,
    value: useDateProp(value),
    defaultValue: useDateProp(defaultValue),
    onChange: onValueChange ? (next: DateValue | null) => onValueChange(fromDate(next)) : undefined,
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
  const state = useDatePickerState(ariaProps);
  const boxRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { groupProps, labelProps, fieldProps, buttonProps, dialogProps, calendarProps, descriptionProps } = useDatePicker(
    ariaProps,
    state,
    boxRef,
  );

  const fieldState = useDateFieldState({ ...fieldProps, locale, createCalendar });
  const segmentsRef = useRef<HTMLDivElement>(null);
  const field = useDateField(fieldProps, fieldState, segmentsRef);

  // With confirm, the calendar edits a pending date that Apply commits; it starts from the value on each open.
  const [pending, setPending] = useState<DateValue | null>(state.value);
  const [prevOpen, setPrevOpen] = useState(state.isOpen);
  if (state.isOpen !== prevOpen) {
    setPrevOpen(state.isOpen);
    if (state.isOpen) setPending(state.value);
  }
  const instant = useInstant(state.isOpen);
  const calendarSize: CalendarSize = size;

  return (
    <FieldShell
      {...rest}
      size={size}
      status={status === 'default' && state.isInvalid ? 'danger' : status}
      label={label}
      helperText={helperText}
      labelProps={labelProps}
      helperProps={descriptionProps}
      boxProps={groupProps}
      boxRef={mergeRefs<HTMLDivElement>(boxRef, (el: HTMLDivElement | null) => setBox(el), fieldRef)}
      disabled={disabled}
      filled={state.value != null}
      end={
        <FieldButton
          {...buttonProps}
          buttonRef={buttonRef}
          aria-label={calendarLabel ?? buttonProps['aria-label']}
          icon={<CalendarBlankIcon />}
        />
      }
      after={
        <>
          {name && <input type="hidden" name={name} value={fromDate(state.value) ?? ''} />}
          <Popover
            open={state.isOpen}
            reference={box}
            placement="bottom-start"
            instant={instant}
            onClose={() => state.setOpen(false)}
            returnFocus={buttonRef}
          >
            <div {...dialogProps} role="dialog" className="bland-date-picker__dialog">
              <SingleCalendar
                size={calendarSize}
                firstDayOfWeek={firstDayOfWeek}
                aria={confirm ? { ...calendarProps, value: pending, onChange: setPending } : calendarProps}
                actions={
                  confirm && (
                    <>
                      <Button size={actionButtonSize[size]} type="secondary" onClick={() => state.setOpen(false)}>
                        {cancelLabel}
                      </Button>
                      <Button
                        size={actionButtonSize[size]}
                        onClick={() => {
                          if (pending) state.setValue(pending);
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
        </>
      }
    >
      <Segments state={fieldState} fieldProps={field.fieldProps} fieldRef={segmentsRef} />
    </FieldShell>
  );
}
