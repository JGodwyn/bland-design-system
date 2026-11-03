import {
  useLayoutEffect,
  useRef,
  useState,
  type DetailsHTMLAttributes,
  type MouseEvent,
  type ReactNode,
  type Ref,
  type SyntheticEvent,
} from 'react';
import { mergeRefs } from 'react-aria';
import { CaretDownIcon } from '../../icons';
import { Icon } from '../icon/Icon';
import { slideHeight, sliding } from '../motion/height';
import './accordion.css';

export type AccordionSize = 'sm' | 'md';

export interface AccordionProps extends Omit<DetailsHTMLAttributes<HTMLDetailsElement>, 'title' | 'open' | 'children'> {
  /** The header label. Bold while open. Wraps onto more lines when it is long. */
  title: ReactNode;
  /** The content shown while open. Text or any nodes, stacked space-lg apart. */
  children?: ReactNode;
  /** sm: a 32px header (default). md: a 40px header. */
  size?: AccordionSize;
  /** No header fill and no side padding, so the item lines up with surrounding content; the title underlines on hover. */
  flush?: boolean;
  /** Open or closed, controlled. Pair it with `onOpenChange`. */
  open?: boolean;
  /** Starting state when `open` is left out. Rendered as the native `open` attribute, so it works before scripts load. */
  defaultOpen?: boolean;
  /** Called with the new open state, from a click, Enter or Space, or the browser (find in page, another item in the same `name` group opening). */
  onOpenChange?: (open: boolean) => void;
  /** The header stops responding and leaves the Tab order; an open item stays open. */
  disabled?: boolean;
  /** Native `name`: items sharing one name form a group where only one is open at a time (the browser closes the others). */
  name?: string;
  /** Reaches the native `<details>`. */
  ref?: Ref<HTMLDetailsElement>;
}

/**
 * Shows or hides a content region under a header. A native `<details>` with a `<summary>` header, so it opens
 * without scripts and keeps the browser's keyboard and screen reader behaviour (a button with an expanded state).
 * Figma: Accordion page, set "Accordion".
 */
export function Accordion({
  title,
  children,
  size = 'sm',
  flush = false,
  open,
  defaultOpen = false,
  onOpenChange,
  disabled = false,
  className,
  onToggle,
  ref,
  ...rest
}: AccordionProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const controlled = open !== undefined;
  const isOpen = controlled ? open : uncontrolledOpen;

  const change = (next: boolean) => {
    if (!controlled) setUncontrolledOpen(next);
    onOpenChange?.(next);
  };

  // The height eases between the header alone and the whole item (motion/height.ts: every engine). Closing keeps
  // the native `open` until the fold has played. A change the browser made (find in page, a `name` group closing
  // this one) happens at once: drawing it open again would close the item that took its place.
  const details = useRef<HTMLDetailsElement>(null);
  const summary = useRef<HTMLElement>(null);
  const byBrowser = useRef(false);
  const stop = useRef<() => void>(undefined);
  // The state the height last showed (a second effect run in Strict Mode is not a change).
  const shown = useRef(isOpen);
  const [closing, setClosing] = useState(false);
  const [wasOpen, setWasOpen] = useState(isOpen);
  if (wasOpen !== isOpen) {
    setWasOpen(isOpen);
    setClosing(!isOpen && !byBrowser.current);
  }

  useLayoutEffect(() => {
    const el = details.current;
    const header = summary.current;
    if (!el || !header) return;
    if (shown.current === isOpen) return;
    shown.current = isOpen;
    stop.current?.();
    if (byBrowser.current) {
      byBrowser.current = false;
      el.style.height = '';
      return;
    }
    const now = el.getBoundingClientRect().height;
    if (isOpen) {
      stop.current = slideHeight(el, sliding(el) ? now : header.offsetHeight, el.scrollHeight);
    } else {
      stop.current = slideHeight(el, now, header.offsetHeight, () => setClosing(false));
    }
  }, [isOpen]);

  // The fold has ended and `open` is gone: the item takes its own height again.
  useLayoutEffect(() => {
    if (!closing && !isOpen && details.current) details.current.style.height = '';
  }, [closing, isOpen]);

  // React owns the open state: the click (also Enter and Space) is cancelled and the state decides.
  const handleClick = (event: MouseEvent<HTMLElement>) => {
    event.preventDefault();
    if (!disabled) change(!isOpen);
  };

  // The browser can still open or close it (find in page, a `name` group); follow it.
  const handleToggle = (event: SyntheticEvent<HTMLDetailsElement>) => {
    onToggle?.(event as Parameters<NonNullable<typeof onToggle>>[0]);
    const now = event.currentTarget.open;
    if (now !== isOpen) {
      byBrowser.current = true;
      change(now);
    }
  };

  return (
    <details
      {...rest}
      className={`bland-accordion${className ? ` ${className}` : ''}`}
      data-size={size}
      data-flush={flush || undefined}
      data-disabled={disabled || undefined}
      data-open={isOpen || undefined}
      data-closing={closing || undefined}
      ref={mergeRefs(details, ref)}
      open={isOpen || closing}
      onToggle={handleToggle}
    >
      <summary
        ref={summary}
        className="bland-accordion__header bland-focus-ring bland-smooth"
        aria-disabled={disabled || undefined}
        tabIndex={disabled ? -1 : undefined}
        onClick={handleClick}
      >
        <span className="bland-accordion__title">{title}</span>
        <Icon className="bland-accordion__caret">
          <CaretDownIcon />
        </Icon>
      </summary>
      <div className="bland-accordion__content">{children}</div>
    </details>
  );
}
