import {
  useEffect,
  useId,
  useLayoutEffect,
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
import { tokenMs } from '../overlay/floating';
import { ScrollArea } from '../scroll-area/ScrollArea';
import './sidebar.css';

/** One row (Figma `_sidebar-item`), or a group header with its nested rows (Figma `_sidebar-item-group`). */
export interface SidebarItem {
  /** Unique key: compared with `current` and the expanded groups. */
  id: string;
  /** Figma `✏️ Label`. Also the accessible name in the minimized rail, where it is hidden. */
  label: string;
  /** Figma `🌟 Leading icon` (`👀 Leading icon` off = leave it out). The minimized rail shows only this. */
  icon?: ReactNode;
  /** The destination's URL. Every row except a group header is a link. */
  href?: string;
  /** Figma `👀 Count` / `✏️ Count`: a small box after the label, e.g. unread items. */
  count?: ReactNode;
  /** Figma `🌟 Trailing icon` / `👀 Trailing icon`: any SVG after the label (and the count). */
  trailing?: ReactNode;
  /** Figma `State=disabled`: the row is drawn in the minimal tokens and cannot be used. */
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
  /** True while the sidebar is drawn as the narrow icon rail (minimized and not open on hover). */
  rail: boolean;
}

type Slot = ReactNode | ((state: SidebarSlotState) => ReactNode);

export interface SidebarProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** The rows, top to bottom. A row with `items` is an expandable group. */
  items: SidebarItem[];
  /** Figma `Size`: row height sidebar/item-sm 24, md 32, lg 40, xl 48. Defaults to sm (Figma's). */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /**
   * The `id` of the page the user is on (Figma `Selected`), controlled: that row gets `aria-current="page"`.
   * Pair it with `onCurrentChange`, or set it from your router.
   */
  current?: string;
  /** The current row at first, when `current` is left out. Defaults to the first link. */
  defaultCurrent?: string;
  /** Called with a row's `id` when it is pressed, before the link is followed. */
  onCurrentChange?: (id: string) => void;
  /** The open groups' ids (Figma `Expanded`), controlled. Pair it with `onExpandedChange`. */
  expanded?: string[];
  /** The open groups at first, when `expanded` is left out. Defaults to the group holding the current row. */
  defaultExpanded?: string[];
  /** Called with the open groups' ids when a group header is pressed. */
  onExpandedChange?: (ids: string[]) => void;
  /**
   * Figma `Minimized`: the icon rail, controlled. While the pointer is over the rail (or keyboard focus is in it)
   * the full sidebar opens over the page; it closes when the pointer or focus leaves, or on Escape.
   */
  minimized?: boolean;
  /** Minimized at first, when `minimized` is left out. */
  defaultMinimized?: boolean;
  /** Called when the collapse or expand button is pressed. */
  onMinimizedChange?: (minimized: boolean) => void;
  /**
   * Figma `👀 Collapse`: the collapse button at the top right, and in the open rail the expand button (the same
   * icon mirrored) that pins the sidebar open.
   */
  collapsible?: boolean;
  /** Accessible name of the collapse button. */
  collapseLabel?: string;
  /** Accessible name of the expand button. */
  expandLabel?: string;
  /**
   * Figma `🧩 Top slot` (`👀 Top slot`): the logo or workspace switcher, fixed above the list. A function gets
   * `{ rail }`, so it can draw a narrower version in the rail. It brings its own padding.
   */
  top?: Slot;
  /** Figma `🧩 Bottom slot` (`👀 Bottom slot`): the plan, account or settings, fixed under the list. As `top`. */
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
  collapseLabel = 'Collapse sidebar',
  expandLabel = 'Expand sidebar',
  top,
  bottom,
  renderLink = defaultLink,
  className,
  'aria-label': ariaLabel = 'Main',
  onPointerEnter,
  onPointerLeave,
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
  const [keyboard, setKeyboard] = useState(false);
  // Keyboard-initiated changes are not animated (docs/motion.md).
  const [instant, setInstant] = useState(false);
  const [peek, setPeek] = useState<Peek>(null);
  const wantPeek = isMinimized && (hover || keyboard);

  useLayoutEffect(() => {
    if (!isMinimized) setPeek(null);
    else if (wantPeek) setPeek('open');
    else setPeek((p) => (p ? 'closing' : null));
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

  const setMinimized = (next: boolean, event: MouseEvent) => {
    // A click with no pointer (detail 0) came from Enter or Space.
    setInstant(event.detail === 0);
    if (minimized === undefined) setOwnMinimized(next);
    onMinimizedChange?.(next);
  };

  const toggleGroup = (id: string) => {
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

  const slot = (s: Slot) => (typeof s === 'function' ? s({ rail }) : s);

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
      data-peek={peek ?? undefined}
      data-instant={instant || undefined}
      onPointerEnter={(event: PointerEvent<HTMLDivElement>) => {
        onPointerEnter?.(event);
        if (event.pointerType !== 'mouse') return;
        setInstant(false);
        setHover(true);
      }}
      onPointerLeave={(event: PointerEvent<HTMLDivElement>) => {
        onPointerLeave?.(event);
        setHover(false);
      }}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
    >
      <div className="bland-sidebar__panel">
        {top !== undefined && <div className="bland-sidebar__slot bland-sidebar__top">{slot(top)}</div>}
        {/* After the top slot in the Tab order: it sits at the top right. */}
        {collapsible && !rail && (
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
        <nav id={navId} aria-label={ariaLabel} className="bland-sidebar__nav">
          <ScrollArea className="bland-sidebar__scroll" fadeSize="sm">
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
                const nestId = `${navId}-${item.id}`;
                return (
                  <li key={item.id} className="bland-sidebar__entry bland-sidebar__group">
                    <button
                      type="button"
                      className="bland-sidebar__item bland-focus-ring bland-smooth"
                      aria-expanded={isOpen}
                      aria-controls={nestId}
                      disabled={item.disabled}
                      onClick={() => toggleGroup(item.id)}
                    >
                      {content(item, false, true)}
                    </button>
                    <ul id={nestId} className="bland-sidebar__nest" hidden={!isOpen || rail}>
                      {item.items.map((child) => (
                        <li key={child.id} className="bland-sidebar__entry">
                          {link(child, true)}
                        </li>
                      ))}
                    </ul>
                  </li>
                );
              })}
            </ul>
          </ScrollArea>
        </nav>
        {bottom !== undefined && <div className="bland-sidebar__slot bland-sidebar__bottom">{slot(bottom)}</div>}
      </div>
    </div>
  );
}
