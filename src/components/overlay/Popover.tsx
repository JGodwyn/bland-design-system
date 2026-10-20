import {
  Fragment,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
  type Ref,
  type RefObject,
} from 'react';
import { mergeProps, mergeRefs, useOverlay } from 'react-aria';
import { autoUpdate, flip, offset, shift, size, useFloating, type Middleware, type Placement } from '@floating-ui/react-dom';
import { sideOf, tokenPx, zoomAwarePlatform, zoomOf } from './floating';

/**
 * Lifts the height cap `size` set last time and measures again, once per computation. Without it, flip() sees the
 * already capped panel, which always fits, so a panel squeezed under its trigger never flips to the roomier side.
 */
const uncap: Middleware = {
  name: 'uncap',
  fn({ elements, middlewareData }) {
    if (middlewareData.uncap) return {};
    elements.floating.style.removeProperty('--_available-height');
    return { data: { done: true }, reset: { rects: true } };
  },
};

export interface PopoverProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Whether the panel is shown. The content stays mounted after it closes until the exit has played. */
  open: boolean;
  /** The element Floating UI anchors to: a Menu's trigger, a Dropdown's field box. */
  reference: HTMLElement | null;
  /** Floating UI placement. Flips to the other side and shifts along the edge to stay on screen. */
  placement: Placement;
  /** Take the reference's width (a Dropdown's panel), instead of the panel's own (menu/width). */
  matchWidth?: boolean;
  /** Skip the motion this time: opened from the keyboard, or open from the start. */
  instant: boolean;
  /** Close on Escape, a press outside or focus leaving the panel. Off for a combobox, whose input handles them. */
  dismissable?: boolean;
  /** Called when it should close (Escape, a press outside, focus leaving). */
  onClose: () => void;
  /**
   * Presses on these elements don't count as outside, so they don't close the panel: a date field whose
   * segments open the calendar while they keep focus. Default none.
   */
  keepOpenOn?: (element: Element) => boolean;
  /** Gets focus back when the panel closes while focus is inside it, as React Aria's FocusScope restoreFocus. */
  returnFocus?: RefObject<HTMLElement | null>;
  /** Mounted while open and during the exit; remounted on every open, so the list's autoFocus runs again. */
  children: ReactNode;
  ref?: Ref<HTMLDivElement>;
}

/**
 * The floating panel Menu and Dropdown share: a manual popover right after its trigger in the DOM (top layer, no
 * clipping, no z-index, inherits the theme), placed by Floating UI under the reference, space-xs away, and capped
 * to the screen space left (no max-height token: Godwin 2026-10-19). Motion is CSS (`@starting-style`, `display`
 * and `overlay` with `allow-discrete`); the children stay mounted until the exit has played.
 */
export function Popover({
  open,
  reference,
  placement,
  matchWidth = false,
  instant,
  dismissable = true,
  onClose,
  keepOpenOn,
  returnFocus,
  children,
  className,
  style,
  ref,
  ...rest
}: PopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null);

  // Mounted while open and until the exit finishes; a new generation (key) on every open.
  const [mounted, setMounted] = useState(open);
  const [generation, setGeneration] = useState(0);
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setMounted(true);
      setGeneration((g) => g + 1);
    }
  }
  const openRef = useRef(open);
  openRef.current = open;

  const { refs, elements, update, x, y, placement: placed } = useFloating<HTMLElement>({
    placement,
    strategy: 'fixed',
    transform: false,
    platform: zoomAwarePlatform,
    elements: { reference },
    middleware: [
      uncap,
      offset(({ elements }) => tokenPx(elements.floating, '--space-xs')),
      flip(({ elements }) => ({ padding: tokenPx(elements.floating, '--space-sm') })),
      shift(({ elements }) => ({ padding: tokenPx(elements.floating, '--space-sm') })),
      // Capped to the space left on screen; the list scrolls past it. Floating UI answers in screen px, the
      // panel's styles are drawn at its zoom.
      size(({ elements }) => ({
        padding: tokenPx(elements.floating, '--space-sm'),
        apply({ availableHeight, rects, elements }) {
          const zoom = zoomOf(elements.floating);
          elements.floating.style.setProperty('--_available-height', `${Math.max(0, availableHeight) / zoom}px`);
          if (matchWidth) elements.floating.style.width = `${rects.reference.width / zoom}px`;
        },
      })),
    ],
  });

  useLayoutEffect(() => {
    // Our own ref, not Floating UI's element: that one arrives a render later, so a panel open from the start
    // would still be hidden when its content's autofocus runs (a defaultOpen date picker's calendar).
    const floating = popoverRef.current;
    if (!floating || !('showPopover' in floating)) return;
    if (!open) {
      // Focus goes back first, so hiding a panel that holds focus never drops it on the body.
      if (floating.contains(document.activeElement)) returnFocus?.current?.focus({ preventScroll: true });
      if (floating.matches(':popover-open')) floating.hidePopover();
      // Unmount the list once the exit transition has played (at once when there is none).
      const animations = floating.getAnimations();
      Promise.allSettled(animations.map((a) => a.finished)).then(() => {
        if (!openRef.current) setMounted(false);
      });
      return;
    }
    if (!floating.matches(':popover-open')) floating.showPopover();
    if (!reference) return;
    return autoUpdate(reference, floating, update);
  }, [open, elements.floating, reference, update, returnFocus]);

  const { overlayProps } = useOverlay(
    {
      isOpen: open,
      onClose,
      isDismissable: dismissable,
      shouldCloseOnBlur: dismissable,
      isKeyboardDismissDisabled: !dismissable,
      shouldCloseOnInteractOutside: keepOpenOn ? (element) => !keepOpenOn(element) : undefined,
      // A press on the trigger counts as outside too: React Aria closes the panel and swallows that press, so
      // the trigger toggles it shut instead of reopening it.
    },
    popoverRef,
  );

  const zoom = elements.floating ? zoomOf(elements.floating) : 1;
  const unzoom = (n: number | null | undefined) => (n == null ? undefined : n / zoom);

  return (
    <div
      {...mergeProps(rest, dismissable ? overlayProps : {})}
      ref={mergeRefs<HTMLDivElement>(ref, popoverRef, refs.setFloating)}
      popover="manual"
      className={`bland-popover${className ? ` ${className}` : ''}`}
      data-side={sideOf(placed)}
      data-placement={placed}
      data-instant={instant || undefined}
      data-match-width={matchWidth || undefined}
      style={{ ...style, left: unzoom(x), top: unzoom(y) } as CSSProperties}
    >
      {mounted && <Fragment key={generation}>{children}</Fragment>}
    </div>
  );
}
