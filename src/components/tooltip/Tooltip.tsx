import {
  cloneElement,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react';
import { mergeProps, mergeRefs, useTooltip, useTooltipTrigger } from 'react-aria';
import { useTooltipTriggerState } from 'react-stately';
import {
  autoUpdate,
  flip,
  hide,
  limitShift,
  offset,
  shift,
  useFloating,
  type Middleware,
  type Placement,
} from '@floating-ui/react-dom';
import { cancelExit, exitThenHide } from '../overlay/exit';
import { sideOf, tokenMs, tokenPx, zoomAwarePlatform, zoomOf } from '../overlay/floating';
import './tooltip.css';

/** Floating UI's placement names: the side of the trigger, then start, center (no suffix) or end alignment. */
export type TooltipPlacement = Placement;

export interface TooltipProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /**
   * The trigger: one focusable element that takes a `ref` and DOM props (a Button, an Icon Button, a link).
   * It gets the hover and focus handlers and, while the tooltip is open, `aria-describedby`.
   */
  children: ReactElement;
  /** The hint. Keep it to one or two short lines; it wraps at 256px. */
  text: ReactNode;
  /**
   * Extra content under the text, such as a keyboard shortcut.
   * The tooltip never takes focus, so nothing in it can be clicked or tabbed to: keep it non-interactive.
   */
  extra?: ReactNode;
  /** Flips to the other side and shifts along the edge when it would leave the screen. Default `top-start`. */
  placement?: TooltipPlacement;
  /** Open, controlled. Pair it with `onOpenChange`. */
  open?: boolean;
  /** Starts open when `open` is left out. */
  defaultOpen?: boolean;
  /** Called with the new open state: hover, focus, blur, Escape, a press on the trigger. */
  onOpenChange?: (open: boolean) => void;
  /** Hover time in ms before it opens. Default 500. Keyboard focus opens it at once. */
  delay?: number;
  /** Time in ms it stays after the pointer leaves the trigger or the tooltip. Default 100. */
  closeDelay?: number;
  /** `focus` opens it on keyboard focus only, never on hover. */
  trigger?: 'focus';
  /** Stops it from opening. */
  disabled?: boolean;
  /** Reaches the tooltip element. */
  ref?: Ref<HTMLDivElement>;
}

/**
 * Aims the pointer at the trigger's centre, kept space-md from the tooltip's corners (Figma's start and end
 * inset; less on a tooltip too short for it). Floating UI's own arrow() reads the
 * tooltip's unzoomed clientWidth, so it drifts under CSS `zoom`; this works only from the rects (screen px).
 */
const aimPointer: Middleware = {
  name: 'pointer',
  fn({ x, y, placement, rects, elements }) {
    const alongX = sideOf(placement) === 'top' || sideOf(placement) === 'bottom';
    const size = tokenPx(elements.floating, '--tooltip-pointer-width');
    const inset = tokenPx(elements.floating, '--space-md');
    const length = alongX ? rects.floating.width : rects.floating.height;
    const target = alongX ? rects.reference.x + rects.reference.width / 2 - x : rects.reference.y + rects.reference.height / 2 - y;
    // As Floating UI's arrow(): the inset shrinks on a tooltip too short for it (a one-line left or right one),
    // keeping 1px (zoomed) of the edge clear.
    const pad = Math.max(0, Math.min(inset, length / 2 - size / 2 - zoomOf(elements.floating)));
    const offset = Math.min(Math.max(target - size / 2, pad), length - size - pad);
    return { data: { offset } };
  },
};

/**
 * A short, non-interactive hint shown on hover or keyboard focus of its trigger. React Aria runs the behaviour
 * (delays, one tooltip at a time, Escape, `aria-describedby`); Floating UI places it (flip, shift, the pointer
 * aimed at the trigger). It opens in the top layer as a manual popover, so no overflow clips it and no z-index
 * is needed. Figma: Tooltip page, set "Tooltip".
 */
export function Tooltip({
  children,
  text,
  extra,
  placement = 'top-start',
  open,
  defaultOpen,
  onOpenChange,
  delay,
  closeDelay,
  trigger,
  disabled = false,
  className,
  style,
  ref,
  ...rest
}: TooltipProps) {
  // Delays come from the Motion tokens, read once per tooltip; without tokens.css, React Aria's defaults apply.
  const [tokenDelays] = useState(() => ({ delay: tokenMs('--duration-tooltip-delay'), closeDelay: tokenMs('--duration-tooltip-close-delay') }));
  const triggerOptions = {
    isOpen: open,
    defaultOpen,
    onOpenChange,
    delay: delay ?? tokenDelays.delay,
    closeDelay: closeDelay ?? tokenDelays.closeDelay,
    trigger,
    isDisabled: disabled,
  };
  const state = useTooltipTriggerState(triggerOptions);
  const triggerRef = useRef<HTMLElement>(null);
  const { triggerProps, tooltipProps: triggerTooltipProps } = useTooltipTrigger(triggerOptions, state, triggerRef);
  const { tooltipProps } = useTooltip({}, state);

  // No motion when it opens from the keyboard (React Aria opens on focus only when it is focus-visible, so the
  // trigger matches :focus-visible, or holds the focused element, as a Slider thumb does), when it opens warm (another tooltip was just open, React Aria's
  // shouldSkipAnimation), or when it starts open. It leaves the way it came: no entrance, no exit.
  const [prevOpen, setPrevOpen] = useState(state.isOpen);
  const [instant, setInstant] = useState(true);
  if (state.isOpen !== prevOpen) {
    setPrevOpen(state.isOpen);
    setInstant(state.isOpen ? state.shouldSkipAnimation || !!triggerRef.current?.matches(':focus-visible, :has(:focus-visible)') : instant || state.shouldSkipAnimation);
  }

  const { refs, elements, update, x, y, placement: placed, middlewareData } = useFloating<HTMLElement>({
    placement,
    strategy: 'fixed',
    transform: false,
    platform: zoomAwarePlatform,
    middleware: [
      // The pointer's tip sits tooltip/offset from the trigger.
      offset(({ elements }) => tokenPx(elements.floating, '--tooltip-pointer-depth') + tokenPx(elements.floating, '--tooltip-offset')),
      flip(),
      // Slides along the edge to stay on screen, but never past the trigger (limitShift), so it stays attached.
      shift(({ elements }) => ({ padding: tokenPx(elements.floating, '--space-sm'), limiter: limitShift() })),
      aimPointer,
      // Hidden while the trigger is scrolled out of view (the page or an inner scroll area).
      hide(),
    ],
  });

  // React Aria owns the open state; the popover follows it, and Floating UI tracks the trigger only while open.
  useLayoutEffect(() => {
    const floating = elements.floating;
    const reference = elements.reference;
    if (!floating || !('showPopover' in floating)) return;
    if (!state.isOpen) {
      // The exit plays while it is still shown (overlay/exit.ts).
      if (floating.matches(':popover-open')) exitThenHide(floating, () => floating.hidePopover());
      return;
    }
    cancelExit(floating);
    if (!floating.matches(':popover-open')) floating.showPopover();
    if (!reference) return;
    return autoUpdate(reference, floating, update);
  }, [state.isOpen, elements.floating, elements.reference, update]);

  const side = sideOf(placed);
  // Floating UI answers in screen px; the tooltip's own styles are drawn at its CSS zoom, so divide by it.
  const zoom = elements.floating ? zoomOf(elements.floating) : 1;
  const unzoom = (n: number | null | undefined) => (n == null ? undefined : n / zoom);
  const pointer = unzoom((middlewareData.pointer as { offset?: number } | undefined)?.offset);

  const child = children as ReactElement<{ ref?: Ref<HTMLElement> } & Record<string, unknown>>;
  const childRef = child.props.ref;

  return (
    <>
      {cloneElement(child, {
        ...mergeProps(child.props, triggerProps),
        ref: mergeRefs(childRef, triggerRef, refs.setReference),
      })}
      <div
        {...mergeProps(rest, triggerTooltipProps, tooltipProps)}
        ref={mergeRefs<HTMLDivElement>(ref, refs.setFloating)}
        popover="manual"
        className={`bland-tooltip${className ? ` ${className}` : ''}`}
        data-placement={placed}
        data-side={side}
        data-instant={instant || undefined}
        style={
          {
            ...style,
            left: unzoom(x),
            top: unzoom(y),
            visibility: middlewareData.hide?.referenceHidden ? 'hidden' : undefined,
            // Where the pointer starts along its edge; the CSS adds half its width to scale from the tip.
            '--_origin': pointer != null ? `${pointer}px` : undefined,
          } as CSSProperties
        }
      >
        <div className="bland-tooltip__content bland-smooth">
          <span className="bland-tooltip__text">{text}</span>
          {extra != null && extra !== false && <div className="bland-tooltip__slot">{extra}</div>}
        </div>
        <span
          className="bland-tooltip__pointer"
          aria-hidden="true"
          style={side === 'top' || side === 'bottom' ? { left: pointer } : { top: pointer }}
        >
          {/* Figma _Tooltip-pointers, Direction=down, exported with its rad-xs corners; CSS turns it to the side. */}
          <svg viewBox="0 0 16 12" focusable="false">
            <path d="M3.41975 3.98456C1.89888 1.32305 1.13845 -0.00770724 1.71654 -1.00385C2.29463 -2 3.82732 -2 6.89272 -2H9.10728C12.1727 -2 13.7054 -2 14.2835 -1.00385C14.8615 -0.00770724 14.1011 1.32305 12.5803 3.98456L11.473 5.9223C9.93142 8.62001 9.16065 9.96887 8 9.96887C6.83936 9.96887 6.06858 8.62001 4.52703 5.9223L3.41975 3.98456Z" />
          </svg>
        </span>
      </div>
    </>
  );
}
