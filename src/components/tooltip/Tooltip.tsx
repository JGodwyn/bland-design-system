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
import { arrow, autoUpdate, flip, hide, offset, shift, useFloating, type Placement } from '@floating-ui/react-dom';
import './tooltip.css';

/** Floating UI's placement names: the side of the trigger, then start, center (no suffix) or end alignment. */
export type TooltipPlacement = Placement;

export interface TooltipProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /**
   * The trigger: one focusable element that takes a `ref` and DOM props (a Button, an Icon Button, a link).
   * It gets the hover and focus handlers and, while the tooltip is open, `aria-describedby`.
   */
  children: ReactElement;
  /** Figma `✏️ Text`: the hint. Keep it to one or two short lines; it wraps at `tooltip/max-width`. */
  text: ReactNode;
  /**
   * Figma `🧩 Slot` (shown with `👀 Slot`): extra content under the text, such as a keyboard shortcut.
   * The tooltip never takes focus, so nothing in it can be clicked or tabbed to: keep it non-interactive.
   */
  extra?: ReactNode;
  /** Figma `Placement`. Flips to the other side and shifts along the edge when it would leave the screen. Default `top-start`, as in Figma. */
  placement?: TooltipPlacement;
  /** Open, controlled. Pair it with `onOpenChange`. */
  open?: boolean;
  /** Starts open when `open` is left out. */
  defaultOpen?: boolean;
  /** Called with the new open state: hover, focus, blur, Escape, a press on the trigger. */
  onOpenChange?: (open: boolean) => void;
  /** Hover time in ms before it opens. Default: React Aria's 1500. Keyboard focus opens it at once. */
  delay?: number;
  /** Time in ms before it closes after the pointer leaves. Default: React Aria's 500. */
  closeDelay?: number;
  /** `focus` opens it on keyboard focus only, never on hover. */
  trigger?: 'focus';
  /** Stops it from opening. */
  disabled?: boolean;
  /** Reaches the tooltip element. */
  ref?: Ref<HTMLDivElement>;
}

/** A length token in px, read where the tooltip sits (0 if tokens.css is not loaded). */
function tokenPx(el: Element, token: string) {
  return parseFloat(getComputedStyle(el).getPropertyValue(token)) || 0;
}

const sideOf = (placement: Placement) => placement.split('-')[0] as 'top' | 'right' | 'bottom' | 'left';

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
  const triggerOptions = { isOpen: open, defaultOpen, onOpenChange, delay, closeDelay, trigger, isDisabled: disabled };
  const state = useTooltipTriggerState(triggerOptions);
  const triggerRef = useRef<HTMLElement>(null);
  const { triggerProps, tooltipProps: triggerTooltipProps } = useTooltipTrigger(triggerOptions, state, triggerRef);
  const { tooltipProps } = useTooltip({}, state);

  // No motion when it opens from the keyboard (React Aria opens on focus only when it is focus-visible, so the
  // trigger matches :focus-visible), when it opens warm (another tooltip was just open, React Aria's
  // shouldSkipAnimation), or when it starts open. It leaves the way it came: no entrance, no exit.
  const [prevOpen, setPrevOpen] = useState(state.isOpen);
  const [instant, setInstant] = useState(true);
  if (state.isOpen !== prevOpen) {
    setPrevOpen(state.isOpen);
    setInstant(state.isOpen ? state.shouldSkipAnimation || !!triggerRef.current?.matches(':focus-visible') : instant || state.shouldSkipAnimation);
  }

  const pointerRef = useRef<HTMLSpanElement>(null);
  const { refs, elements, update, x, y, placement: placed, middlewareData } = useFloating<HTMLElement>({
    placement,
    strategy: 'fixed',
    transform: false,
    middleware: [
      // The pointer's tip touches the trigger.
      offset(({ elements }) => tokenPx(elements.floating, '--tooltip-pointer-depth')),
      flip(),
      shift(({ elements }) => ({ padding: tokenPx(elements.floating, '--space-sm') })),
      // The pointer aims at the trigger, kept space-md from the corners (Figma's start and end inset).
      arrow(({ elements }) => ({ element: pointerRef.current!, padding: tokenPx(elements.floating, '--space-md') })),
      // Hidden while the trigger is scrolled out of an inner scroll area (the page itself carries both along).
      hide({ rootBoundary: 'document' }),
    ],
  });

  // React Aria owns the open state; the popover follows it, and Floating UI tracks the trigger only while open.
  useLayoutEffect(() => {
    const floating = elements.floating;
    const reference = elements.reference;
    if (!floating || !('showPopover' in floating)) return;
    if (!state.isOpen) {
      if (floating.matches(':popover-open')) floating.hidePopover();
      return;
    }
    if (!floating.matches(':popover-open')) floating.showPopover();
    if (!reference) return;
    return autoUpdate(reference, floating, update);
  }, [state.isOpen, elements.floating, elements.reference, update]);

  const side = sideOf(placed);
  const pointer = middlewareData.arrow;
  const origin = side === 'top' || side === 'bottom' ? pointer?.x : pointer?.y;

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
            left: x,
            top: y,
            visibility: middlewareData.hide?.referenceHidden ? 'hidden' : undefined,
            // Where the pointer starts along its edge; the CSS adds half its width to scale from the tip.
            '--_origin': origin != null ? `${origin}px` : undefined,
          } as CSSProperties
        }
      >
        <div className="bland-tooltip__content bland-smooth">
          <span className="bland-tooltip__text">{text}</span>
          {extra != null && extra !== false && <div className="bland-tooltip__slot">{extra}</div>}
        </div>
        <span
          ref={pointerRef}
          className="bland-tooltip__pointer"
          aria-hidden="true"
          style={side === 'top' || side === 'bottom' ? { left: pointer?.x } : { top: pointer?.y }}
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
