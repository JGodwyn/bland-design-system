import { useRef, type HTMLAttributes, type ReactNode, type Ref } from 'react';
import { I18nProvider, mergeRefs, useLocale, useTimeField } from 'react-aria';
import { useTimeFieldState, type TimeValue } from 'react-stately';
import type { Time } from '@internationalized/date';
import { ClockIcon } from '../../icons';
import { fromTime, useTimeProp } from '../calendar/dates';
import { FieldShell, Segment, Segments, type DateFieldSize, type DateFieldStatus } from '../date-field/DateField';
import { Icon } from '../icon/Icon';

export type TimePickerSize = DateFieldSize;
export type TimePickerStatus = DateFieldStatus;

export interface TimePickerProps extends Omit<HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange'> {
  /** The field height (input/*, 32, 40, 48). Default sm. */
  size?: TimePickerSize;
  /** Sets the border, helper text color and status icon. A time out of bounds turns the field to danger on its own. */
  status?: TimePickerStatus;
  /** The field's label. Leave it out and give an `aria-label`. */
  label?: ReactNode;
  /** Under the field and read with it. */
  helperText?: ReactNode;
  /** The time, 24-hour `"14:30"` (`"14:30:15"` with seconds), controlled (`null` for empty). Pair it with `onValueChange`. */
  value?: string | null;
  /** The time at first, uncontrolled. */
  defaultValue?: string | null;
  /** Called with the time, 24-hour `"14:30"`, once it is complete (`null` when cleared). */
  onValueChange?: (value: string | null) => void;
  /**
   * 12 shows hours 1 to 12 and an AM / PM segment in the trailing add-on; 24 shows
   * 00 to 23 and no add-on. Default from the locale (12 in en-US, 24 in en-GB). The value is 24-hour either way.
   */
  hourCycle?: 12 | 24;
  /** `second` adds a seconds segment (and seconds to the value). Default `minute`. */
  granularity?: 'hour' | 'minute' | 'second';
  /** The earliest time that is valid, `"09:00"`. */
  minValue?: string;
  /** The latest time that is valid, `"17:30"`. */
  maxValue?: string;
  /** The locale: the separator and, without `hourCycle`, 12 or 24 hours. Default the app's, else the browser's. */
  locale?: string;
  /** No editing; the field draws the disabled colors. */
  disabled?: boolean;
  /** Shows the value; it cannot be changed. */
  readOnly?: boolean;
  /** Required in a form: an empty field is invalid on submit. */
  required?: boolean;
  /** Form field name: a hidden input submits the time as `"14:30"`. */
  name?: string;
  /** Reaches the bordered field box. */
  fieldRef?: Ref<HTMLDivElement>;
}

/**
 * A time field: Figma's exposed Text Input with editable segments (hh:mm, type the digits, arrows step them)
 * and the Clock icon. In 12-hour time the AM / PM segment sits in the trailing add-on. No list of times yet
 * (Figma has none). React Aria runs it (`useTimeField`); values are 24-hour strings.
 * Figma: Date & Time page, set "Time picker".
 */
export function TimePicker(props: TimePickerProps) {
  return props.locale ? (
    <I18nProvider locale={props.locale}>
      <TimePickerInner {...props} />
    </I18nProvider>
  ) : (
    <TimePickerInner {...props} />
  );
}

function TimePickerInner({
  size = 'sm',
  status = 'default',
  label,
  helperText,
  value,
  defaultValue,
  onValueChange,
  hourCycle,
  granularity = 'minute',
  minValue,
  maxValue,
  locale: _locale,
  disabled = false,
  readOnly = false,
  required = false,
  name,
  fieldRef,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy,
  ...rest
}: TimePickerProps) {
  const { locale } = useLocale();
  const seconds = granularity === 'second';
  const ariaProps = {
    label,
    description: helperText,
    value: useTimeProp(value),
    defaultValue: useTimeProp(defaultValue),
    onChange: onValueChange ? (next: TimeValue | null) => onValueChange(fromTime(next as Time | null, seconds)) : undefined,
    minValue: useTimeProp(minValue) ?? undefined,
    maxValue: useTimeProp(maxValue) ?? undefined,
    hourCycle,
    granularity,
    // 09:41, as Figma's hh:mm placeholder reads.
    shouldForceLeadingZeros: true,
    isDisabled: disabled,
    isReadOnly: readOnly,
    isRequired: required,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    'aria-describedby': ariaDescribedBy,
  };
  const state = useTimeFieldState({ ...ariaProps, locale });
  const ref = useRef<HTMLDivElement>(null);
  const { labelProps, fieldProps, descriptionProps } = useTimeField(ariaProps, state, ref);

  // AM / PM goes to the add-on; so does the space React Aria puts between it and the minutes.
  const period = state.segments.findIndex((s) => s.type === 'dayPeriod');
  const inMain = (_: unknown, i: number) => period < 0 || (i !== period && !(state.segments[i]?.type === 'literal' && Math.abs(i - period) === 1));
  const periodSegment = period >= 0 ? state.segments[period] : undefined;

  return (
    <FieldShell
      {...rest}
      size={size}
      status={status === 'default' && state.isInvalid ? 'danger' : status}
      label={label}
      helperText={helperText}
      labelProps={labelProps}
      helperProps={descriptionProps}
      // The whole box is React Aria's field, so arrow keys reach the AM / PM add-on too.
      boxProps={fieldProps}
      boxRef={mergeRefs(ref, fieldRef)}
      disabled={disabled}
      filled={state.value != null}
      end={
        <Icon className="bland-text-input__icon">
          <ClockIcon />
        </Icon>
      }
      trailing={periodSegment && <Segment segment={periodSegment} state={state} />}
      after={name && <input type="hidden" name={name} value={fromTime(state.value as Time | null, seconds) ?? ''} />}
    >
      <Segments state={state} only={inMain} />
    </FieldShell>
  );
}
