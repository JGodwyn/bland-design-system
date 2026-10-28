import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type FocusEvent,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { joinClass, type MessageIcon } from '../message/Message';
import { Toast, type ToastStatus } from './Toast';
import './toast.css';

export interface ToastOptions {
  /** Milliseconds before it dismisses itself; `null` keeps it until dismissed. Defaults to the Toaster's `duration`. */
  duration?: number | null;
  /** Reuse an id to replace a toast that is still showing instead of stacking a second one. */
  id?: string;
}

export interface ToasterApi {
  /** Shows a Toast with this message. Returns its id. */
  toast: (message: ReactNode, options?: ToastOptions & { status?: ToastStatus; icon?: MessageIcon }) => string;
  /** Shows any content, such as a Notification. A function receives `dismiss`, for a close button. Returns its id. */
  show: (content: ReactNode | ((dismiss: () => void) => ReactNode), options?: ToastOptions) => string;
  /** Starts the exit of one toast. */
  dismiss: (id: string) => void;
}

export interface ToasterProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
  /** The app (or the part of it) that shows toasts with `useToaster()`. */
  children?: ReactNode;
  /**
   * Default time on screen in milliseconds; `null` keeps toasts until dismissed. Omitted, it is the
   * `--duration-toast-visible` token (5000ms), read where the Toaster sits.
   * Paused while the pointer is over the stack, focus is inside it or the page is hidden.
   */
  duration?: number | null;
  /** Accessible name of the region that holds the toasts. */
  label?: string;
}

interface Item {
  id: string;
  render: (dismiss: () => void) => ReactNode;
  duration: number | null;
  closing: boolean;
}

const ToasterContext = createContext<ToasterApi | null>(null);

/** The `--duration-toast-visible` token in milliseconds, or `null` (keep until dismissed) when tokens.css is not loaded. */
function tokenDuration(el: Element | null): number | null {
  const raw = el ? getComputedStyle(el).getPropertyValue('--duration-toast-visible').trim() : '';
  const n = parseFloat(raw);
  if (!Number.isFinite(n)) return null;
  return raw.endsWith('ms') ? n : n * 1000;
}

/** Shows toasts from anywhere inside a `<Toaster>`. */
export function useToaster(): ToasterApi {
  const api = useContext(ToasterContext);
  if (!api) throw new Error('useToaster() needs a <Toaster> around the component that calls it.');
  return api;
}

/**
 * A fixed region that stacks toasts at the bottom of the screen (bottom right from the tablet
 * breakpoint), newest last. It is an aria-live="polite" region that exists before any toast, so
 * each one is announced when it appears. Each toast dismisses itself after `duration` (by default the
 * `--duration-toast-visible` token), paused while
 * the pointer is over the stack, focus is inside it or the page is hidden. It sits in the top layer
 * (a manual popover), so it shows above the page without a z-index.
 */
export function Toaster({ children, duration, label = 'Notifications', className, ...rest }: ToasterProps) {
  const [items, setItems] = useState<Item[]>([]);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(false);
  const region = useRef<HTMLElement>(null);
  const prefix = useId();
  const count = useRef(0);

  useEffect(() => {
    const el = region.current;
    if (el && 'showPopover' in el && !el.matches(':popover-open')) el.showPopover();
    const onVisibility = () => setHidden(document.visibilityState === 'hidden');
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  const dismiss = useCallback((id: string) => {
    setItems((list) => list.map((item) => (item.id === id ? { ...item, closing: true } : item)));
  }, []);

  const remove = useCallback((id: string) => {
    setItems((list) => list.filter((item) => item.id !== id));
  }, []);

  const api = useMemo<ToasterApi>(() => {
    const show: ToasterApi['show'] = (content, options = {}) => {
      const id = options.id ?? `${prefix}${++count.current}`;
      const item: Item = {
        id,
        render: typeof content === 'function' ? content : () => content,
        duration: options.duration !== undefined ? options.duration : duration !== undefined ? duration : tokenDuration(region.current),
        closing: false,
      };
      setItems((list) => (list.some((i) => i.id === id) ? list.map((i) => (i.id === id ? item : i)) : [...list, item]));
      return id;
    };
    return {
      show,
      dismiss,
      toast: (message, { status, icon, ...options } = {}) =>
        show(
          <Toast status={status} icon={icon}>
            {message}
          </Toast>,
          options,
        ),
    };
  }, [dismiss, duration, prefix]);

  const onBlur = (event: FocusEvent<HTMLElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(false);
  };

  return (
    <ToasterContext.Provider value={api}>
      {children}
      <section
        {...rest}
        ref={region}
        popover="manual"
        aria-label={label}
        className={joinClass('bland-toaster', className)}
        data-paused={hovered || focused || hidden || undefined}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        onFocus={() => setFocused(true)}
        onBlur={onBlur}
      >
        <ol className="bland-toaster__list" aria-live="polite">
          {items.map((item) => (
            <ToasterItem
              key={item.id}
              item={item}
              paused={hovered || focused || hidden}
              dismiss={dismiss}
              remove={remove}
            />
          ))}
        </ol>
      </section>
    </ToasterContext.Provider>
  );
}

/** One toast in the stack: its timer (which pauses and resumes) and its exit. */
function ToasterItem({ item, paused, dismiss, remove }: { item: Item; paused: boolean; dismiss: (id: string) => void; remove: (id: string) => void }) {
  const ref = useRef<HTMLLIElement>(null);
  const { id } = item;
  const onDismiss = useCallback(() => dismiss(id), [dismiss, id]);
  const remaining = useRef(item.duration);

  useEffect(() => {
    remaining.current = item.duration;
  }, [item]);

  useEffect(() => {
    if (paused || item.closing || remaining.current === null) return;
    const started = Date.now();
    const timer = setTimeout(onDismiss, remaining.current);
    return () => {
      clearTimeout(timer);
      if (remaining.current !== null) remaining.current -= Date.now() - started;
    };
  }, [paused, item, onDismiss]);

  // The exit runs the entrance backwards (toast.css); the item leaves the DOM when its transition ends.
  useEffect(() => {
    if (!item.closing) return;
    const el = ref.current;
    const ms = el ? Math.max(0, ...getComputedStyle(el).transitionDuration.split(',').map((s) => parseFloat(s) * 1000)) : 0;
    const timer = setTimeout(() => remove(id), ms);
    return () => clearTimeout(timer);
  }, [item.closing, remove, id]);

  return (
    <li ref={ref} className="bland-toaster__item" data-state={item.closing ? 'closed' : 'open'}>
      {item.render(onDismiss)}
    </li>
  );
}
