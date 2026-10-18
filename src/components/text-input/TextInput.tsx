import {
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ChangeEvent,
  type InputHTMLAttributes,
  type MouseEvent,
  type ReactNode,
  type Ref,
} from 'react';
import { CheckCircleIcon, WarningCircleIcon, WarningOctagonIcon } from '../../icons';
import { Icon } from '../icon/Icon';
import './text-input.css';

export type TextInputSize = 'sm' | 'md' | 'lg';
export type TextInputStatus = 'default' | 'danger' | 'success' | 'warning';

export interface TextInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Figma `Size`. sm 32 (default, as in Figma), md 40, lg 48 (input/*). The text is body-lg at every size. */
  size?: TextInputSize;
  /** Figma `Status`: the border, the helper text color and a status icon. danger also sets `aria-invalid`. */
  status?: TextInputStatus;
  /** Figma `✏️ Label`, a `<label>` tied to the input. Leave it out (Figma `👀 Label` off) and give the input an `aria-label`. */
  label?: ReactNode;
  /** Figma `✏️ Helper text`, under the field and read with the input (`aria-describedby`). Put the error message here for danger. */
  helperText?: ReactNode;
  /** Figma `🌟 Icon ( L )`: any SVG at the start of the field, sized and colored by the field. */
  iconStart?: ReactNode;
  /** Figma `🌟 Icon ( R )`: any SVG at the end of the field. */
  iconEnd?: ReactNode;
  /** Figma `✏️ Alt text`: short text at the end of the field, such as a unit or a shortcut. */
  altText?: ReactNode;
  /** Figma `👀 Leading input`: an add-on before the field, cut off by a divider. Text, an `<Icon>` or any slot. */
  leading?: ReactNode;
  /** Figma `👀 Trailing input`: an add-on after the field, cut off by a divider. */
  trailing?: ReactNode;
  /** Reaches the native `<input>`, for form libraries and for components that wrap Text Input. */
  ref?: Ref<HTMLInputElement>;
  /** Reaches the bordered field box, for anchoring a popover to it (Dropdown, Date pickers). */
  fieldRef?: Ref<HTMLDivElement>;
}

const statusIcons = {
  danger: <WarningOctagonIcon />,
  success: <CheckCircleIcon />,
  warning: <WarningCircleIcon />,
} as const;

function assign<T>(ref: Ref<T> | undefined, el: T | null) {
  if (typeof ref === 'function') ref(el);
  else if (ref) ref.current = el;
}

/**
 * The field Text Input and Search Input share. `endAction` is an interactive control at the end of the field
 * (Search's clear button); it is not part of Text Input's public props.
 */
export function InputField({
  size = 'sm',
  status = 'default',
  label,
  helperText,
  iconStart,
  iconEnd,
  altText,
  leading,
  trailing,
  endAction,
  className,
  id,
  type = 'text',
  value,
  defaultValue,
  onChange,
  ref,
  fieldRef,
  'aria-describedby': describedBy,
  'aria-invalid': ariaInvalid,
  ...rest
}: TextInputProps & { endAction?: ReactNode }) {
  const autoId = useId();
  const inputId = id ?? `${autoId}input`;
  const helperId = `${autoId}helper`;
  const input = useRef<HTMLInputElement | null>(null);

  // Filled (Figma State=filled) styles the add-ons; the value itself needs no state.
  const [filledUncontrolled, setFilled] = useState(() => String(defaultValue ?? '') !== '');
  const filled = value !== undefined ? String(value) !== '' : filledUncontrolled;
  useLayoutEffect(() => {
    // Autofill or a form library can set the value without a change event React sees.
    if (value === undefined && input.current) setFilled(input.current.value !== '');
  }, [value]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (value === undefined) setFilled(event.currentTarget.value !== '');
    onChange?.(event);
  };

  // A click anywhere in the field (padding, icons, add-on labels) focuses the input, as a native field would.
  const focusInput = (event: MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    if (target === input.current || target.closest('button, a, input, select, textarea')) return;
    event.preventDefault();
    input.current?.focus();
  };

  const describedByIds = [helperText != null && helperText !== false ? helperId : null, describedBy].filter(Boolean).join(' ');
  const statusIcon = status !== 'default' ? statusIcons[status] : null;

  return (
    <div
      className={`bland-text-input${className ? ` ${className}` : ''}`}
      data-size={size}
      data-status={status}
      data-filled={filled || undefined}
    >
      {label != null && label !== false && (
        <label className="bland-text-input__label" htmlFor={inputId}>
          {label}
        </label>
      )}
      <div ref={fieldRef} className="bland-text-input__field bland-focus-ring bland-smooth" onMouseDown={focusInput}>
        {leading != null && leading !== false && (
          <span className="bland-text-input__addon" data-side="start">
            <span className="bland-text-input__addon-content">{leading}</span>
            <span className="bland-text-input__divider" />
          </span>
        )}
        <span className="bland-text-input__main">
          {iconStart && <Icon className="bland-text-input__icon">{iconStart}</Icon>}
          <input
            {...rest}
            ref={(el) => {
              input.current = el;
              assign(ref, el);
            }}
            id={inputId}
            type={type}
            className="bland-text-input__input"
            value={value}
            defaultValue={defaultValue}
            onChange={handleChange}
            aria-invalid={ariaInvalid ?? (status === 'danger' || undefined)}
            aria-describedby={describedByIds || undefined}
          />
          {altText != null && altText !== false && <span className="bland-text-input__alt">{altText}</span>}
          {statusIcon && <Icon className="bland-text-input__status">{statusIcon}</Icon>}
          {iconEnd && <Icon className="bland-text-input__icon">{iconEnd}</Icon>}
          {endAction}
        </span>
        {trailing != null && trailing !== false && (
          <span className="bland-text-input__addon" data-side="end">
            <span className="bland-text-input__divider" />
            <span className="bland-text-input__addon-content">{trailing}</span>
          </span>
        )}
      </div>
      {helperText != null && helperText !== false && (
        <span className="bland-text-input__helper" id={helperId}>
          {helperText}
        </span>
      )}
    </div>
  );
}

/**
 * Single-line text field with a label, the input and helper text. A plain native `<input>`: controlled or
 * uncontrolled, every native prop and `ref` reach it; `className` goes on the wrapper.
 * Figma: Text-input page, set "Text Input".
 */
export function TextInput(props: TextInputProps) {
  return <InputField {...props} />;
}
