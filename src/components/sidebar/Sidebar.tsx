import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type FocusEvent,
  type HTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
} from 'react';
import { CaretDownIcon, SidebarSimpleIcon } from '../../icons';
import { Icon } from '../icon/Icon';
import { slideHeight, sliding } from '../motion/height';
import { tokenMs } from '../overlay/floating';
import { ScrollArea } from '../scroll-area/ScrollArea';
import './sidebar.css';

/** One row (Figma `_sidebar-item`), or a group header with its nested rows (Figma `_sidebar-item-group`). */
export interface SidebarItem {
  /** Unique key: compared with `current` and the expanded groups. */
  id: string;
  /** Also the accessible name in the minimized rail, where it is hidden. */
  label: string;
  /** The minimized rail shows only this. */
  icon?: ReactNode;
  /** The destination's URL. Every row except a group header is a link. */
  href?: string;
  /** A small box after the label, e.g. unread items. */
  count?: ReactNode;
  /** Any SVG after the label (and the count). */
  trailing?: ReactNode;
  /** The row is drawn in the minimal tokens and cannot be used. */
  disabled?: boolean;
  /**
   * Nested rows, which make this row an expandable group (Figma `Expandable`): its header becomes a button that
   * shows or hides them. One level deep, as Figma; nested rows' own `items` are ignored.
   */
  items?: SidebarItem[];
}

/** What `renderLink` receives: spread it onto your router's link. */
export interface SidebarLinkProps {
  /** Left out on a disabled row, so it cannot be followed or focused. */
  href?: string;
  /** Bland's link classes (look and focus ring). Keep them on the rendered element. */
  className: string;
  /** `"page"` on the current row. */
  'aria-current'?: 'page';
  /** `true` on a disabled row. */
  'aria-disabled'?: true;
  /** `"link"` on a disabled row, which has no `href`. */
  role?: 'link';
  /** Makes the row current when pressed. Keep it on the rendered element. */
  onClick: (event: MouseEvent<HTMLElement>) => void;
  children: ReactNode;
}

/** What a slot function receives. */
export interface SidebarSlotState {
  /**
   * True while the sidebar is minimized and not open: the rail, and the slide to it. The slot cross-fades
   * between its two versions as this changes.
   */
  rail: boolean;
}

type Slot = ReactNode | ((state: SidebarSlotState) => ReactNode);

export interface SidebarProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** The rows, top to bottom. A row with `items` is an expandable group. */
  items: SidebarItem[];
  /** Row height: sm 24, md 32, lg 40, xl 48. Defaults to sm. */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /**
   * The `id` of the page the user is on, controlled: that row gets `aria-current="page"`.
   * Pair it with `onCurrentChange`, or set it from your router.
   */
  current?: string;
  /** The current row at first, when `current` is left out. Defaults to the first link. */
  defaultCurrent?: string;
  /** Called with a row's `id` when it is pressed, before the link is followed. */
  onCurrentChange?: (id: string) => void;
  /** The open groups' ids, controlled. Pair it with `onExpandedChange`. */
  expanded?: string[];
  /** The open groups at first, when `expanded` is left out. Defaults to the group holding the current row. */
  defaultExpanded?: string[];
  /** Called with the open groups' ids when a group header is pressed. */
  onExpandedChange?: (ids: string[]) => void;
  /**
   * The icon rail, controlled. While the pointer is over the rail (or keyboard focus is in it)
   * the full sidebar opens over the page; it closes when the pointer or focus leaves, or on Escape.
   */
  minimized?: boolean;
  /** Minimized at first, when `minimized` is left out. */
  defaultMinimized?: boolean;
  /** Called when the collapse or expand button is pressed. */
  onMinimizedChange?: (minimized: boolean) => void;
  /**
   * The collapse button at the top right, and in the open rail the expand button (the same
   * icon mirrored) that pins the sidebar open.
   */
  collapsible?: boolean;
  /**
   * How long, in ms, the pointer rests on the rail before it opens. Defaults to 200;
   * moving restarts the wait, so passing over the rail never opens it.
   */
  peekDelay?: number;
  /** How long, in ms, the open rail waits after the pointer leaves before it closes. Defaults to 300. */
  peekCloseDelay?: number;
  /** Accessible name of the collapse button. */
  collapseLabel?: string;
  /** Accessible name of the expand button. */
  expandLabel?: string;
  /**
   * The logo or workspace switcher, fixed above the list. It brings its own padding. A function gets `{ rail }`,
   * so it can draw a narrower version in the rail (a logo mark); a plain node has none, so it fades out as the
   * sidebar collapses and the rail shows the expand button in its place.
   */
  top?: Slot;
  /** The plan, account or settings, fixed under the list. As `top`. */
  bottom?: Slot;
  /**
   * Renders each link, so any router works: `(props, item) => <Link to={props.href} {...props} />`. Defaults to a
   * plain `<a>`.
   */
  renderLink?: (props: SidebarLinkProps, item: SidebarItem) => ReactNode;
  /** Names the `<nav>`. Defaults to "Main". */
  'aria-label'?: string;
}

const defaultLink = (props: SidebarLinkProps) => <a {...props} />;

const firstLink = (items: SidebarItem[]): string | undefined => {
  for (const item of items) {
    const id = item.items ? firstLink(item.items) : item.href && !item.disabled ? item.id : undefined;
    if (id) return id;
  }
  return undefined;
};

const groupOf = (items: SidebarItem[], id: string | undefined) =>
  items.find((item) => item.items?.some((child) => child.id === id))?.id;

/** Peek: the rail's full sidebar over the page. `closing` keeps it drawn while it slides back. */
type Peek = 'open' | 'closing' | null;

/**
 * App navigation: a column of links in groups, with fixed top and bottom slots and a list that scrolls between
 * them. Minimized, it is an icon rail that opens the full sidebar over the page on hover. Figma: Sidebar page, sets
 * "Sidebar", "_sidebar-item-group" and "_sidebar-item".
 */
export function Sidebar({
  items,
  size = 'sm',
  current,
  defaultCurrent,
  onCurrentChange,
  expanded,
  defaultExpanded,
  onExpandedChange,
  minimized,
  defaultMinimized = false,
  onMinimizedChange,
  collapsible = false,
  peekDelay,
  peekCloseDelay,
  collapseLabel = 'Collapse sidebar',
  expandLabel = 'Expand sidebar',
  top,
  bottom,
  renderLink = defaultLink,
  className,
  'aria-label': ariaLabel = 'Main',
  onPointerEnter,
  onPointerLeave,
  onPointerMove,
  onFocus,
  onBlur,
  onKeyDown,
  ...rest
}: SidebarProps) {
  const navId = useId();
  const [ownCurrent, setOwnCurrent] = useState(() => defaultCurrent ?? firstLink(items));
  const active = current ?? ownCurrent;
  const [ownExpanded, setOwnExpanded] = useState<string[]>(() => {
    if (defaultExpanded) return defaultExpanded;
    const group = groupOf(items, active);
    return group ? [group] : [];
  });
  const open = expanded ?? ownExpanded;
  const [ownMinimized, setOwnMinimized] = useState(defaultMinimized);
  const isMinimized = minimized ?? ownMinimized;

  // The rail opens while the mouse is over it or keyboard focus is in it.
  const [hover, setHover] = useState(false);
  // Hover intent: open once the pointer rests, close after it has been gone a moment, so passing over or
  // brushing off the rail never flashes it open or shut.
  const hoverTimer = useRef<number | undefined>(undefined);
  const clearHoverTimer = () => window.clearTimeout(hoverTimer.current);
  const setHoverAfter = (next: boolean, ms: number | undefined) => {
    clearHoverTimer();
    if (!ms) setHover(next);
    else hoverTimer.current = window.setTimeout(() => setHover(next), ms);
  };
  useEffect(() => clearHoverTimer, []);
  const [keyboard, setKeyboard] = useState(false);
  // Keyboard-initiated changes are not animated (docs/motion.md).
  const [instant, setInstant] = useState(false);
  const [peek, setPeek] = useState<Peek>(null);
  // A collapse pressed with the pointer closes the sidebar for good: hovering it does not open it again until
  // the pointer has left.
  const [suppressed, setSuppressed] = useState(false);
  // Where that collapse was pressed. WebKit sends pointerenter again as the panel slides under a pointer that
  // has not moved; an enter or move at this point is one of those, not the pointer coming back.
  const collapsedAt = useRef<{ x: number; y: number } | null>(null);
  const unmoved = (event: PointerEvent) =>
    collapsedAt.current?.x === event.clientX && collapsedAt.current?.y === event.clientY;
  const wantPeek = isMinimized && !suppressed && (hover || keyboard);
  const wasMinimized = useRef(isMinimized);

  useLayoutEffect(() => {
    const was = wasMinimized.current;
    wasMinimized.current = isMinimized;
    if (!isMinimized) setPeek(null);
    else if (wantPeek) setPeek('open');
    // Closing slides the full sidebar back to the rail, after a peek or a collapse alike.
    else setPeek((p) => (p || !was ? 'closing' : null));
  }, [isMinimized, wantPeek]);

  // Ends the slide back: on the panel's transition end, or at once when nothing animates.
  useEffect(() => {
    if (peek !== 'closing') return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (instant || reduced) {
      setPeek(null);
      return;
    }
    const timer = window.setTimeout(() => setPeek(null), tokenMs('--duration-2xl') ?? 0);
    return () => window.clearTimeout(timer);
  }, [peek, instant]);

  const rail = isMinimized && peek === null;
  // A top slot without a rail version draws nothing in the rail; the expand button takes its place.
  const topSlot: Slot | undefined = top === undefined || typeof top === 'function' ? top : ({ rail }) => (rail ? null : top);
  // Rows sit where the rail puts them whenever the sidebar is minimized and not open, so the icons slide with
  // the panel as it opens or closes instead of jumping at either end.
  const compact = isMinimized && peek !== 'open';

  // Opening: the slide out of the rail, while it runs. What waits for the full sidebar (the collapse button beside
  // a top slot) comes in after it.
  const [opening, setOpening] = useState(false);
  const wasCompact = useRef(compact);
  useLayoutEffect(() => {
    const was = wasCompact.current;
    wasCompact.current = compact;
    if (compact || !was) {
      setOpening(false);
      return;
    }
    if (instant || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    setOpening(true);
    const timer = window.setTimeout(() => setOpening(false), tokenMs('--duration-2xl') ?? 0);
    return () => window.clearTimeout(timer);
  }, [compact]); // eslint-disable-line react-hooks/exhaustive-deps

  const setMinimized = (next: boolean, event: MouseEvent) => {
    // A click with no pointer (detail 0) came from Enter or Space.
    setInstant(event.detail === 0);
    if (next && event.detail !== 0) {
      setSuppressed(true);
      collapsedAt.current = { x: event.clientX, y: event.clientY };
      // The pointer was over the full sidebar, so hover is on; left on, it would open the peek in the moment
      // between the pointer leaving (which lifts the suppression) and hover's close delay running out.
      clearHoverTimer();
      setHover(false);
    }
    if (minimized === undefined) setOwnMinimized(next);
    onMinimizedChange?.(next);
  };

  const toggleGroup = (id: string, event: MouseEvent) => {
    setInstant(event.detail === 0);
    const next = open.includes(id) ? open.filter((g) => g !== id) : [...open, id];
    if (expanded === undefined) setOwnExpanded(next);
    onExpandedChange?.(next);
  };

  const press = (id: string) => {
    if (current === undefined) setOwnCurrent(id);
    onCurrentChange?.(id);
  };

  const content = (item: SidebarItem, nested: boolean, group: boolean) => (
    <>
      {nested && <span className="bland-sidebar__indent" aria-hidden />}
      {item.icon && <Icon className="bland-sidebar__icon">{item.icon}</Icon>}
      <span className="bland-sidebar__label">{item.label}</span>
      {item.count !== undefined && item.count !== null && item.count !== false && (
        <span className="bland-sidebar__count bland-smooth">{item.count}</span>
      )}
      {item.trailing && <Icon className="bland-sidebar__trailing">{item.trailing}</Icon>}
      {group && (
        <Icon className="bland-sidebar__chevron">
          <CaretDownIcon />
        </Icon>
      )}
    </>
  );

  const link = (item: SidebarItem, nested: boolean) =>
    renderLink(
      {
        href: item.disabled ? undefined : item.href,
        className: 'bland-sidebar__item bland-focus-ring bland-smooth',
        'aria-current': item.id === active ? 'page' : undefined,
        'aria-disabled': item.disabled ? true : undefined,
        role: item.disabled ? 'link' : undefined,
        onClick: (event) => {
          if (item.disabled) {
            event.preventDefault();
            return;
          }
          press(item.id);
        },
        children: content(item, nested, false),
      },
      item,
    );


  const handleFocus = (event: FocusEvent<HTMLDivElement>) => {
    onFocus?.(event);
    // Only keyboard focus opens the rail: a click leaves focus on the link after the pointer has gone.
    if ((event.target as HTMLElement).matches(':focus-visible')) {
      setInstant(true);
      setKeyboard(true);
    }
  };

  const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
    onBlur?.(event);
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setKeyboard(false);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (event.key === 'Escape' && peek === 'open') {
      clearHoverTimer();
      setInstant(true);
      setHover(false);
      setKeyboard(false);
    }
  };

  return (
    <div
      {...rest}
      className={`bland-sidebar${className ? ` ${className}` : ''}`}
      data-size={size}
      data-minimized={isMinimized || undefined}
      data-layout={rail ? 'rail' : 'full'}
      data-compact={compact || undefined}
      data-opening={opening || undefined}
      data-top={top !== undefined || undefined}
      data-top-plain={(top !== undefined && typeof top !== 'function') || undefined}
      data-collapsible={collapsible || undefined}
      data-peek={peek ?? undefined}
      data-instant={instant || undefined}
      onPointerEnter={(event: PointerEvent<HTMLDivElement>) => {
        onPointerEnter?.(event);
        if (event.pointerType !== 'mouse') return;
        setInstant(false);
        if (unmoved(event)) return;
        if (hover) clearHoverTimer();
        else setHoverAfter(true, peekDelay ?? tokenMs('--duration-sidebar-peek-delay'));
      }}
      onPointerMove={(event: PointerEvent<HTMLDivElement>) => {
        onPointerMove?.(event);
        // Still moving: the wait to open starts again.
        if (event.pointerType === 'mouse' && !hover && isMinimized && !suppressed && !unmoved(event)) {
          setHoverAfter(true, peekDelay ?? tokenMs('--duration-sidebar-peek-delay'));
        }
      }}
      onPointerLeave={(event: PointerEvent<HTMLDivElement>) => {
        onPointerLeave?.(event);
        setSuppressed(false);
        if (hover) setHoverAfter(false, peekCloseDelay ?? tokenMs('--duration-sidebar-peek-close-delay'));
        else clearHoverTimer();
      }}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
    >
      <div className="bland-sidebar__panel">
        {(top !== undefined || collapsible) && (
          <div className="bland-sidebar__header">
            {topSlot !== undefined && <SlotFade className="bland-sidebar__top" slot={topSlot} rail={compact} instant={instant} />}
            {/* In the header's flow: beside the top slot, or in its place when there is none. */}
            {collapsible && (
              <button
                type="button"
                className="bland-sidebar__toggle bland-focus-ring bland-smooth"
                aria-expanded={!isMinimized}
                aria-controls={navId}
                aria-label={isMinimized ? expandLabel : collapseLabel}
                onClick={(event) => setMinimized(!isMinimized, event)}
              >
                <Icon className="bland-sidebar__toggle-icon">
                  <SidebarSimpleIcon />
                </Icon>
              </button>
            )}
          </div>
        )}
        <nav id={navId} aria-label={ariaLabel} className="bland-sidebar__nav">
          <ScrollArea className="bland-sidebar__scroll" fadeSize="sm" scrollbar={false}>
            <ul className="bland-sidebar__list">
              {items.map((item) => {
                if (!item.items) {
                  return (
                    <li key={item.id} className="bland-sidebar__entry">
                      {link(item, false)}
                    </li>
                  );
                }
                const isOpen = open.includes(item.id);
                // Nested rows fold away in the rail, and while the sidebar slides to or from it.
                const closed = !isOpen || compact;
                const nestId = `${navId}-${item.id}`;
                return (
                  <li key={item.id} className="bland-sidebar__entry bland-sidebar__group">
                    <button
                      type="button"
                      className="bland-sidebar__item bland-focus-ring bland-smooth"
                      aria-expanded={isOpen}
                      aria-controls={nestId}
                      disabled={item.disabled}
                      onClick={(event) => toggleGroup(item.id, event)}
                    >
                      {content(item, false, true)}
                    </button>
                    <Nest id={nestId} closed={closed}>
                      {item.items.map((child) => (
                        <li key={child.id} className="bland-sidebar__entry">
                          {link(child, true)}
                        </li>
                      ))}
                    </Nest>
                  </li>
                );
              })}
            </ul>
          </ScrollArea>
        </nav>
        {bottom !== undefined && <SlotFade className="bland-sidebar__bottom" slot={bottom} rail={compact} instant={instant} />}
      </div>
    </div>
  );
}

/**
 * A group's nested rows. They open and fold with their height, measured in pixels so every engine animates it
 * (motion/height.ts); `data-instant` and reduced motion turn the CSS transition off, so the change is at once.
 */
function Nest({ id, closed, children }: { id: string; closed: boolean; children: ReactNode }) {
  const ref = useRef<HTMLUListElement>(null);
  const stop = useRef<() => void>(undefined);
  // The state the height last showed (a second effect run in Strict Mode is not a change).
  const shown = useRef(closed);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (shown.current === closed) return;
    shown.current = closed;
    stop.current?.();
    // Mid-slide it starts from where it is; settled, from the other state's height.
    const now = sliding(el) ? el.getBoundingClientRect().height : null;
    stop.current = closed ? slideHeight(el, now ?? el.scrollHeight, 0) : slideHeight(el, now ?? 0, el.scrollHeight);
  }, [closed]);
  return (
    <ul ref={ref} id={id} className="bland-sidebar__nest" data-closed={closed || undefined}>
      {children}
    </ul>
  );
}

/**
 * A top or bottom slot. A slot function draws a rail and a full version; when it switches, the new one fades
 * in out of a blur over the old one fading out, and the slot's height eases from one to the other.
 */
function SlotFade({ slot, rail, instant, className }: { slot: Slot; rail: boolean; instant: boolean; className: string }) {
  const node = typeof slot === 'function' ? slot({ rail }) : slot;
  const ref = useRef<HTMLDivElement>(null);
  const last = useRef<{ node: ReactNode; height: number }>({ node, height: 0 });
  const [swap, setSwap] = useState<{ gen: number; leaving: ReactNode; leavingRail: boolean } | null>(null);
  const wasRail = useRef(rail);

  useLayoutEffect(() => {
    const el = ref.current;
    const changed = wasRail.current !== rail;
    wasRail.current = rail;
    if (!el || !changed || typeof slot !== 'function') return;
    // From the keyboard it switches at once; under reduced motion the CSS keeps the fade and drops the rest.
    if (instant) {
      setSwap(null);
      return;
    }
    setSwap((s) => ({ gen: (s?.gen ?? 0) + 1, leaving: last.current.node, leavingRail: !rail }));
    // Ease from the old height to the new one; the outgoing layer is out of flow.
    const to = el.scrollHeight;
    el.style.height = `${last.current.height}px`;
    void el.offsetHeight;
    el.style.height = `${to}px`;
  }, [rail]); // eslint-disable-line react-hooks/exhaustive-deps

  // Remember what is showing, for the next switch.
  useLayoutEffect(() => {
    if (!swap) last.current = { node, height: ref.current?.offsetHeight ?? 0 };
    else last.current = { ...last.current, node };
  });

  const settle = () => {
    if (ref.current) ref.current.style.height = '';
    if (ref.current) last.current.height = ref.current.offsetHeight;
    setSwap(null);
  };

  return (
    <div ref={ref} className={`bland-sidebar__slot ${className}`}>
      <div
        key={swap?.gen ?? 0}
        className="bland-sidebar__slot-layer"
        data-enter={swap ? true : undefined}
        data-rail={(typeof slot === 'function' && rail) || undefined}
      >
        {node}
      </div>
      {swap && (
        <div
          ref={(el) => el?.setAttribute('inert', '')}
          className="bland-sidebar__slot-layer"
          data-leave
          data-rail={swap.leavingRail || undefined}
          aria-hidden
          onAnimationEnd={(e) => e.target === e.currentTarget && settle()}
        >
          {swap.leaving}
        </div>
      )}
    </div>
  );
}

