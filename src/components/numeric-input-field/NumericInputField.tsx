import {
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type ClipboardEvent,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
  type Ref,
} from 'react';
import type { TextInputStatus } from '../text-input/TextInput';
import './numeric-input-field.css';

export type NumericInputFieldSize = 'sm' | 'md' | 'lg';
export type NumericInputFieldStatus = TextInputStatus;

export interface NumericInputFieldProps extends Omit<HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange'> {
  /** Square boxes of sm 40 (default), md 56, lg 72. On mobile, use sm for 6 digits. */
  size?: NumericInputFieldSize;
  /** Every box's border and the helper text color. danger also sets `aria-invalid`. */
  status?: NumericInputFieldStatus;
  /** Number of boxes: 4 or 6. */
  length?: 4 | 6;
  /** Names the group of boxes. Leave it out and give the field an `aria-label`. */
  label?: ReactNode;
  /** Under the boxes and read with each of them (`aria-describedby`). */
  helperText?: ReactNode;
  /** The code, controlled: a string of digits, up to `length` long. */
  value?: string;
  /** The starting code when `value` is left out. */
  defaultValue?: string;
  /** Called with the code (digits only, in box order) whenever a box changes. */
  onValueChange?: (value: string) => void;
  /** Called once every box holds a digit. */
  onComplete?: (value: string) => void;
  /** One character shown in every empty box, such as 0 or a dot. */
  placeholder?: string;
  /** Disables every box. */
  disabled?: boolean;
  /** Submits the code with a form under this name (a hidden input). */
  name?: string;
  /** Focuses the first box on mount. */
  autoFocus?: boolean;
  /** Reaches the first box, so a form library can focus the field. */
  ref?: Ref<HTMLInputElement>;
}

const onlyDigits = (s: string) => s.replace(/\D/g, '');

/** Spread `digits` over the boxes from `start`, keeping the boxes before it. */
function fill(boxes: string[], start: number, digits: string) {
  const next = [...boxes];
  for (let k = 0; k < digits.length && start + k < next.length; k++) next[start + k] = digits.charAt(k);
  return next;
}

const toBoxes = (value: string, length: number) => Array.from({ length }, (_, i) => onlyDigits(value)[i] ?? '');

/**
 * Row of square digit boxes for one-time codes and PINs. One native input per box: typing fills a box and moves
 * on, Backspace moves back, the arrow keys move between boxes, and pasting (or a one-time code from the
 * keyboard's autofill) fills every box. `className` and other props go on the wrapper.
 * Figma: Text-input page, sets "Numeric Input Field" and "_Numeric Input Field Base".
 */
export function NumericInputField({
  size = 'sm',
  status = 'default',
  length = 4,
  label,
  helperText,
  value,
  defaultValue = '',
  onValueChange,
  onComplete,
  placeholder,
  disabled,
  name,
  autoFocus,
  className,
  ref,
  'aria-describedby': describedBy,
  ...rest
}: NumericInputFieldProps) {
  const autoId = useId();
  const labelId = `${autoId}label`;
  const helperId = `${autoId}helper`;
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  // Boxes keep their own positions, so clearing a middle box leaves a gap instead of shifting the rest left.
  const [boxes, setBoxes] = useState(() => toBoxes(value ?? defaultValue, length));
  useEffect(() => {
    if (value !== undefined && onlyDigits(value) !== boxes.join('')) setBoxes(toBoxes(value, length));
    // Only an outside change to `value` resyncs; the boxes' own edits already match it.
  }, [value, length]);

  const focusBox = (i: number) => {
    const el = inputs.current[Math.max(0, Math.min(length - 1, i))];
    el?.focus();
    el?.select();
  };

  const commit = (next: string[]) => {
    setBoxes(next);
    const code = next.join('');
    onValueChange?.(code);
    if (next.every((d) => d !== '') && next.join('') !== boxes.join('')) onComplete?.(code);
  };

  const handleChange = (i: number) => (event: ChangeEvent<HTMLInputElement>) => {
    const raw = event.currentTarget.value;
    let digits = onlyDigits(raw);
    if (raw === '') return commit(boxes.map((d, k) => (k === i ? '' : d)));
    if (digits === '') return; // a letter: ignored, the box keeps its digit
    // A digit typed beside the one already there (caret, not selection): keep only the new one.
    if (boxes[i] !== '' && raw.length === 2) digits = onlyDigits(raw[(event.currentTarget.selectionStart ?? 2) - 1] ?? '');
    if (digits === '') return;
    // One digit typed over the selected one, or a whole code from autofill: fill from this box on.
    const start = digits.length >= length ? 0 : i;
    commit(fill(boxes, start, digits));
    focusBox(start + digits.length);
  };

  const handlePaste = (i: number) => (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const digits = onlyDigits(event.clipboardData.getData('text'));
    if (!digits) return;
    const start = digits.length >= length ? 0 : i;
    commit(fill(boxes, start, digits));
    focusBox(start + digits.length);
  };

  const handleKeyDown = (i: number) => (event: KeyboardEvent<HTMLInputElement>) => {
    const key = event.key;
    if (key === 'Backspace' && boxes[i] === '' && i > 0) {
      event.preventDefault();
      commit(boxes.map((d, k) => (k === i - 1 ? '' : d)));
      focusBox(i - 1);
    } else if (key === 'Delete') {
      event.preventDefault();
      commit(boxes.map((d, k) => (k === i ? '' : d)));
    } else if (key === 'ArrowLeft' || key === 'ArrowRight' || key === 'Home' || key === 'End') {
      event.preventDefault();
      focusBox(key === 'ArrowLeft' ? i - 1 : key === 'ArrowRight' ? i + 1 : key === 'Home' ? 0 : length - 1);
    } else if (key.length === 1 && key === boxes[i] && !event.metaKey && !event.ctrlKey) {
      // Typing the digit a box already holds changes nothing, so no change event: still move on.
      event.preventDefault();
      focusBox(i + 1);
    }
  };

  const hasLabel = label != null && label !== false;
  const hasHelper = helperText != null && helperText !== false;
  const descriptions = [hasHelper ? helperId : null, describedBy].filter(Boolean).join(' ') || undefined;

  return (
    <div
      {...rest}
      role="group"
      aria-labelledby={hasLabel ? labelId : rest['aria-labelledby']}
      aria-describedby={descriptions}
      className={`bland-numeric-input-field${className ? ` ${className}` : ''}`}
      data-size={size}
      data-status={status}
    >
      {hasLabel && (
        <span className="bland-numeric-input-field__label" id={labelId}>
          {label}
        </span>
      )}
      <div className="bland-numeric-input-field__boxes">
        {boxes.map((digit, i) => (
          <input
            key={i}
            ref={(el) => {
              inputs.current[i] = el;
              if (i !== 0) return;
              if (typeof ref === 'function') ref(el);
              else if (ref) ref.current = el;
            }}
            className="bland-numeric-input-field__box bland-focus-ring bland-smooth"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete={i === 0 ? 'one-time-code' : 'off'}
            autoFocus={autoFocus && i === 0}
            aria-label={`Digit ${i + 1} of ${length}`}
            aria-describedby={descriptions}
            aria-invalid={status === 'danger' || undefined}
            placeholder={placeholder}
            disabled={disabled}
            value={digit}
            onChange={handleChange(i)}
            onPaste={handlePaste(i)}
            onKeyDown={handleKeyDown(i)}
            onFocus={(e) => e.currentTarget.select()}
          />
        ))}
      </div>
      {name && <input type="hidden" name={name} value={boxes.join('')} disabled={disabled} />}
      {hasHelper && (
        <span className="bland-numeric-input-field__helper" id={helperId}>
          {helperText}
        </span>
      )}
    </div>
  );
}
