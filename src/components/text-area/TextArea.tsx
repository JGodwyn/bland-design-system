import {
  useCallback,
  useId,
  useLayoutEffect,
  useRef,
  type ChangeEvent,
  type CSSProperties,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
  type Ref,
  type TextareaHTMLAttributes,
} from 'react';
import { ScrollArea } from '../scroll-area/ScrollArea';
import type { TextInputStatus } from '../text-input/TextInput';
import './text-area.css';

export type TextAreaStatus = TextInputStatus;

export interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** The border and the helper text color. danger also sets `aria-invalid`. */
  status?: TextAreaStatus;
  /** A `<label>` tied to the text area. Leave it out and give it an `aria-label`. */
  label?: ReactNode;
  /** Under the field and read with it (`aria-describedby`). */
  helperText?: ReactNode;
  /** Visible lines before the field scrolls. Defaults to 4. */
  rows?: number;
  /** The resize handle: drag it to make the field taller or shorter. Defaults to true. */
  resizable?: boolean;
  /** Reaches the native `<textarea>`, for form libraries. */
  ref?: Ref<HTMLTextAreaElement>;
}

function assign<T>(ref: Ref<T> | undefined, el: T | null) {
  if (typeof ref === 'function') ref(el);
  else if (ref) ref.current = el;
}

/**
 * Multi-line text field with a label, a resize handle and helper text. A native `<textarea>` that grows with its
 * text inside a ScrollArea, so a long text scrolls with the edge fade and a visible scrollbar (CLAUDE.md,
 * "Overflow"). Controlled or uncontrolled; native props and `ref` reach the textarea, `className` the wrapper.
 * Figma: Text-input page, set "Text Area".
 */
export function TextArea({
  status = 'default',
  label,
  helperText,
  rows = 4,
  resizable = true,
  className,
  style,
  id,
  value,
  onChange,
  ref,
  'aria-describedby': describedBy,
  'aria-invalid': ariaInvalid,
  ...rest
}: TextAreaProps) {
  const autoId = useId();
  const inputId = id ?? `${autoId}input`;
  const helperId = `${autoId}helper`;
  const input = useRef<HTMLTextAreaElement | null>(null);
  const field = useRef<HTMLDivElement | null>(null);

  // The textarea is as tall as its text, and at least as tall as the field, so a click anywhere lands in it.
  const fit = useCallback(() => {
    const el = input.current;
    const viewport = el?.closest<HTMLElement>('.bland-scroll-area__viewport');
    if (!el || !viewport) return;
    el.style.height = 'auto';
    el.style.height = `${Math.max(el.scrollHeight, viewport.clientHeight)}px`;
  }, []);

  useLayoutEffect(fit, [fit, value]);
  useLayoutEffect(() => {
    const viewport = input.current?.closest<HTMLElement>('.bland-scroll-area__viewport');
    if (!viewport) return;
    const ro = new ResizeObserver(fit);
    ro.observe(viewport);
    return () => ro.disconnect();
  }, [fit]);

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    onChange?.(event);
    fit();
  };

  // Padding and the handle focus the textarea too.
  const focusInput = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === input.current) return;
    event.preventDefault();
    input.current?.focus();
  };

  // Dragging the handle sets the field's height; CSS keeps it at least one line.
  const startResize = (event: PointerEvent<HTMLSpanElement>) => {
    const box = field.current;
    if (!box || event.button !== 0 || rest.disabled) return;
    event.preventDefault();
    const handle = event.currentTarget;
    const startY = event.clientY;
    const startHeight = box.offsetHeight;
    handle.setPointerCapture(event.pointerId);
    const move = (e: globalThis.PointerEvent) => {
      box.style.height = `${startHeight + e.clientY - startY}px`;
    };
    const up = () => {
      handle.removeEventListener('pointermove', move);
      handle.removeEventListener('pointerup', up);
      handle.removeEventListener('pointercancel', up);
    };
    handle.addEventListener('pointermove', move);
    handle.addEventListener('pointerup', up);
    handle.addEventListener('pointercancel', up);
  };

  const hasHelper = helperText != null && helperText !== false;
  const describedByIds = [hasHelper ? helperId : null, describedBy].filter(Boolean).join(' ');

  return (
    <div
      className={`bland-text-area${className ? ` ${className}` : ''}`}
      data-status={status}
      style={{ '--_rows': rows } as CSSProperties}
    >
      {label != null && label !== false && (
        <label className="bland-text-area__label" htmlFor={inputId}>
          {label}
        </label>
      )}
      <div ref={field} className="bland-text-area__field bland-focus-ring bland-smooth" onMouseDown={focusInput}>
        <ScrollArea className="bland-text-area__scroll">
          <textarea
            {...rest}
            ref={(el) => {
              input.current = el;
              assign(ref, el);
            }}
            id={inputId}
            rows={1}
            style={style}
            className="bland-text-area__input"
            value={value}
            onChange={handleChange}
            aria-invalid={ariaInvalid ?? (status === 'danger' || undefined)}
            aria-describedby={describedByIds || undefined}
          />
        </ScrollArea>
        {resizable && (
          <span className="bland-text-area__resizer" aria-hidden="true" onPointerDown={startResize}>
            {/* Figma: text-area-resizer (166:4939) */}
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeLinecap="round">
              <path d="M13.425 6.10114L4.93977 14.5864" />
              <path d="M13.3777 10.1937L9.13504 14.4363" />
            </svg>
          </span>
        )}
      </div>
      {hasHelper && (
        <span className="bland-text-area__helper" id={helperId}>
          {helperText}
        </span>
      )}
    </div>
  );
}
