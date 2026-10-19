import { useRef, type HTMLAttributes, type MouseEvent, type ReactNode, type Ref } from 'react';
import { mergeRefs, useButton, useDateSegment, type AriaButtonProps } from 'react-aria';
import type { DateFieldState, DateSegment } from 'react-stately';
import { CheckCircleIcon, WarningCircleIcon, WarningOctagonIcon } from '../../icons';
import { Icon } from '../icon/Icon';
import '../text-input/text-input.css';
import './date-field.css';

/**
 * Internal: the segmented field Date Picker, Date Range Picker and Time Picker draw. It is Figma's exposed Text
 * Input (same markup and CSS as text-input/), with React Aria's editable segments (dd / mm / yyyy, hh:mm) where
 * the native input would be. Not exported from the package.
 */

export type DateFieldSize = 'sm' | 'md' | 'lg';
export type DateFieldStatus = 'default' | 'danger' | 'success' | 'warning';

const statusIcons = {
  danger: <WarningOctagonIcon />,
  success: <CheckCircleIcon />,
  warning: <WarningCircleIcon />,
} as const;

export interface FieldShellProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  size: DateFieldSize;
  status: DateFieldStatus;
  label?: ReactNode;
  helperText?: ReactNode;
  labelProps?: HTMLAttributes<HTMLElement>;
  helperProps?: HTMLAttributes<HTMLElement>;
  /** Props for the bordered box: React Aria's picker group, or the time field itself. */
  boxProps?: HTMLAttributes<HTMLDivElement>;
  boxRef?: Ref<HTMLDivElement>;
  disabled: boolean;
  filled: boolean;
  /** The segments. */
  children: ReactNode;
  /** At the end of the main row: the calendar button or the clock icon. */
  end?: ReactNode;
  /** Figma `👀 Trailing input`: the Time Picker's AM / PM add-on. */
  trailing?: ReactNode;
  /** After the field, outside the box (so its presses never reach the box): the calendar popover, hidden inputs. */
  after?: ReactNode;
}

/** Label, the bordered box with segments, helper text: Text Input's markup with segments for the input. */
export function FieldShell({
  size,
  status,
  label,
  helperText,
  labelProps,
  helperProps,
  boxProps,
  boxRef,
  disabled,
  filled,
  children,
  end,
  trailing,
  after,
  className,
  ...rest
}: FieldShellProps) {
  const box = useRef<HTMLDivElement | null>(null);
  // A press on the box outside the segments (padding, icons) edits the first empty segment, else the last one,
  // as a click in a text field's padding puts the caret in it.
  const focusSegment = (event: MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    if (disabled || target.closest('[data-segment], button')) return;
    const segments = [...(box.current?.querySelectorAll<HTMLElement>('[data-segment][tabindex]') ?? [])];
    const next = segments.find((s) => s.dataset.placeholder !== undefined) ?? segments.at(-1);
    if (!next) return;
    event.preventDefault();
    next.focus();
  };
  const statusIcon = status !== 'default' ? statusIcons[status] : null;
  return (
    <div
      {...rest}
      className={`bland-text-input bland-date-field${className ? ` ${className}` : ''}`}
      data-size={size}
      data-status={status}
      data-filled={filled || undefined}
      data-disabled={disabled || undefined}
    >
      {label != null && label !== false && (
        <span {...labelProps} className="bland-text-input__label">
          {label}
        </span>
      )}
      <div
        {...boxProps}
        ref={mergeRefs(box, boxRef)}
        className="bland-text-input__field bland-smooth"
        onMouseDown={(event) => {
          boxProps?.onMouseDown?.(event);
          focusSegment(event);
        }}
      >
        <span className="bland-text-input__main">
          {children}
          {statusIcon && <Icon className="bland-text-input__status">{statusIcon}</Icon>}
          {end}
        </span>
        {trailing != null && trailing !== false && (
          <span className="bland-text-input__addon" data-side="end">
            <span className="bland-text-input__divider" />
            <span className="bland-text-input__addon-content">{trailing}</span>
          </span>
        )}
      </div>
      {helperText != null && helperText !== false && (
        <span {...helperProps} className="bland-text-input__helper">
          {helperText}
        </span>
      )}
      {after}
    </div>
  );
}

/** Figma placeholders for the time segments ("hh:mm"); dates keep React Aria's localized ones (dd/mm/yyyy). */
const timePlaceholders: Partial<Record<DateSegment['type'], string>> = { hour: 'hh', minute: 'mm', second: 'ss' };

/** One editable segment (a spinbutton) or a literal between them. */
export function Segment({ segment, state }: { segment: DateSegment; state: DateFieldState }) {
  const ref = useRef<HTMLSpanElement>(null);
  const { segmentProps } = useDateSegment(segment, state, ref);
  const placeholder = timePlaceholders[segment.type] ?? segment.placeholder;
  return (
    <span
      {...segmentProps}
      ref={ref}
      className="bland-date-field__segment"
      data-segment={segment.type}
      data-placeholder={segment.isEditable && segment.isPlaceholder ? '' : undefined}
    >
      {segment.isEditable && segment.isPlaceholder ? placeholder : segment.text}
    </span>
  );
}

/** The segments of a field, in their own group element (React Aria's field props go on it). */
export function Segments({ state, fieldProps, fieldRef, only }: { state: DateFieldState; fieldProps?: HTMLAttributes<HTMLElement>; fieldRef?: Ref<HTMLDivElement>; only?: (s: DateSegment, i: number) => boolean }) {
  return (
    <div {...fieldProps} ref={fieldRef} className="bland-date-field__segments">
      {state.segments.map((segment, i) => (only && !only(segment, i) ? null : <Segment key={i} segment={segment} state={state} />))}
    </div>
  );
}

/** The calendar button at the end of a date field (Figma `🌟 Icon ( R )` = CalendarBlank). */
export function FieldButton({ icon, buttonRef, ...props }: AriaButtonProps & { icon: ReactNode; buttonRef?: Ref<HTMLButtonElement> }) {
  const ref = useRef<HTMLButtonElement>(null);
  const { buttonProps } = useButton(props, ref);
  return (
    <button {...buttonProps} ref={mergeRefs(ref, buttonRef)} className="bland-date-field__button bland-focus-ring bland-smooth">
      <Icon className="bland-text-input__icon">{icon}</Icon>
    </button>
  );
}
