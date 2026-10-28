import {
  Children,
  cloneElement,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type DialogHTMLAttributes,
  type MouseEvent,
  type PointerEvent,
  type ReactElement,
  type ReactNode,
  type Ref,
  type SyntheticEvent,
} from 'react';
import { mergeProps, mergeRefs, useButton, useFocusVisible, useId, useOverlayTrigger, usePreventScroll } from 'react-aria';
import { useOverlayTriggerState } from 'react-stately';
import { XIcon } from '../../icons';
import { IconButton } from '../button/IconButton';
import { Icon } from '../icon/Icon';
import { ScrollArea } from '../scroll-area/ScrollArea';
import './modal.css';

export type ModalSize = 'sm' | 'md';
/** The element the title renders as. Pick the level that fits the page's heading outline. */
export type ModalTitleAs = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p';
export type ModalAlign = 'left' | 'center';
export type ModalActionsAlign = 'left' | 'right' | 'fill';
export type ModalActionsOrientation = 'auto' | 'horizontal' | 'vertical';
export type ModalBackdrop = 'minimal' | 'subtle' | 'bold';

export interface ModalProps extends Omit<DialogHTMLAttributes<HTMLDialogElement>, 'title' | 'open' | 'children'> {
  /** The width, sm (384) or md (512). Override it with CSS for a wider layout. */
  size?: ModalSize;
  /** Whether it is open (controlled). */
  open?: boolean;
  /** Whether it starts open (uncontrolled). */
  defaultOpen?: boolean;
  /** Called when it opens or closes: the trigger, Escape, the backdrop, the close button, a `<form method="dialog">`. */
  onOpenChange?: (open: boolean) => void;
  /**
   * The element that opens it, usually a Button. It gets `aria-expanded`, and focus
   * returns to it on close. It must forward `ref` and DOM props. Leave it out and drive `open` yourself.
   */
  trigger?: ReactElement;
  /** Names the dialog. */
  title?: ReactNode;
  /** The title's element. Defaults to `h2`. */
  titleAs?: ModalTitleAs;
  /** Any SVG before the title. Decorative. */
  icon?: ReactNode;
  /** The close button in the title row. Default true. */
  closeButton?: boolean;
  /** The close button's accessible name. Default "Close". */
  closeLabel?: string;
  /** `👀 Divider`: a line under the title row. */
  titleDivider?: boolean;
  /** The body text, which also describes the dialog (`aria-describedby`). */
  description?: ReactNode;
  /** Any content above the description, such as an image. */
  top?: ReactNode;
  /** Any content under the description, such as a form or a list. */
  children?: ReactNode;
  /** `Alignment`: left, or center for short confirmations. */
  align?: ModalAlign;
  /**
   * Up to three md Buttons, **primary first**. Use the danger emotion on the primary for a
   * destructive action. Pass a function to get `close`, for a Cancel that only closes. A
   * `<Button htmlType="submit" form="…">` can submit a form in the body.
   */
  actions?: ReactNode | ((close: () => void) => ReactNode);
  /**
   * `Alignment`: left (primary first, on the leading edge), right (primary last, on the
   * trailing edge; the DOM order follows) or fill (equal widths, primary first).
   */
  actionsAlign?: ModalActionsAlign;
  /** `auto` (default) stacks the actions full width, primary on top, on screens narrower than 640px. */
  actionsOrientation?: ModalActionsOrientation;
  /** `👀 Divider`: a line over the actions. */
  actionsDivider?: boolean;
  /** How much the page behind dims: minimal, subtle (default) or bold, for a decision that needs full attention. */
  backdrop?: ModalBackdrop;
  /** Whether a press on the backdrop closes it. Default true; false for a decision that needs an answer. Escape always closes. */
  dismissable?: boolean;
  /** Reaches the `<dialog>`. */
  ref?: Ref<HTMLDialogElement>;
}

/**
 * A dialog over the page that asks for a decision or shows focused content. A native `<dialog>` opened as modal:
 * the top layer, the page behind inert, `::backdrop` as the scrim, rendered in place so it keeps the theme.
 * Focus moves to the dialog on open and back to the trigger on close; Escape closes it. Figma: Modals page,
 * set "Modal" with `_modal-title`, `_modal-body` and `_modal-action-bar`.
 */
export function Modal({
  size = 'sm',
  open,
  defaultOpen,
  onOpenChange,
  trigger,
  title,
  titleAs: Title = 'h2',
  icon,
  closeButton = true,
  closeLabel = 'Close',
  titleDivider = false,
  description,
  top,
  children,
  align = 'left',
  actions,
  actionsAlign = 'left',
  actionsOrientation = 'auto',
  actionsDivider = false,
  dismissable = true,
  backdrop = 'subtle',
  className,
  ref,
  ...rest
}: ModalProps) {
  const state = useOverlayTriggerState({ isOpen: open, defaultOpen, onOpenChange });
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  const { triggerProps, overlayProps } = useOverlayTrigger({ type: 'dialog' }, state, triggerRef);
  // useButton's native `type="button"` would replace a Bland Button's Figma `type`; Bland's buttons default to it anyway.
  const { buttonProps } = useButton(triggerProps, triggerRef);
  const { type: _type, ...triggerButtonProps } = buttonProps as typeof buttonProps & { type?: string };

  usePreventScroll({ isDisabled: !state.isOpen });

  // No motion when it opens from the keyboard (React Aria's input modality) or is open from the start.
  const { isFocusVisible: keyboard } = useFocusVisible();
  const [prevOpen, setPrevOpen] = useState(state.isOpen);
  const [instant, setInstant] = useState(true);
  // Content is mounted while open and until the exit has played; a new generation (key) on every open.
  const [mounted, setMounted] = useState(false);
  const [generation, setGeneration] = useState(0);
  if (state.isOpen !== prevOpen) {
    setPrevOpen(state.isOpen);
    if (state.isOpen) setInstant(keyboard);
  }
  const openRef = useRef(state.isOpen);
  openRef.current = state.isOpen;
  const returnFocus = useRef<HTMLElement | null>(null);
  const shown = useRef(false);

  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || !('showModal' in dialog)) return;
    if (state.isOpen) {
      if (dialog.open) return;
      shown.current = true;
      returnFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      dialog.showModal();
      // The dialog itself takes focus (React Aria's useDialog). The content mounts only now, into a shown dialog,
      // so an `autoFocus` control inside takes focus after it (React focuses it on mount; hidden, it couldn't).
      dialog.focus({ preventScroll: true });
      setMounted(true);
      setGeneration((g) => g + 1);
      return;
    }
    // Only a real close moves focus; a Modal that mounts closed leaves it alone.
    if (!shown.current) return;
    shown.current = false;
    if (dialog.open) dialog.close();
    // Back to the trigger, or to what had focus before it opened (the browser may already have moved it there).
    const back = triggerRef.current ?? returnFocus.current;
    if (back?.isConnected) back.focus({ preventScroll: true });
    // Unmount the content once the exit transition has played (at once when there is none).
    Promise.allSettled(dialog.getAnimations({ subtree: true }).map((a) => a.finished)).then(() => {
      if (!openRef.current) setMounted(false);
    });
  }, [state.isOpen]);

  // Closed by the browser (Escape's second press, a `<form method="dialog">`): the state follows.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const onClose = () => {
      // The event is queued: after our own close() and a quick reopen, the dialog is open again; leave it.
      if (openRef.current && !dialog.open) state.close();
    };
    dialog.addEventListener('close', onClose);
    return () => dialog.removeEventListener('close', onClose);
  }, [state]);

  const onCancel = (e: SyntheticEvent<HTMLDialogElement>) => {
    // Escape: close through the state, so a controlled Modal stays in charge.
    e.preventDefault();
    state.close();
  };

  // A press that starts and ends on the backdrop closes it; a drag out of a text field does not.
  const downOnBackdrop = useRef(false);
  const onBackdrop = (e: MouseEvent<HTMLDialogElement> | PointerEvent<HTMLDialogElement>) => {
    const dialog = dialogRef.current;
    if (!dialog || e.target !== dialog) return false;
    const r = dialog.getBoundingClientRect();
    return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
  };

  const child = trigger as ReactElement<{ ref?: Ref<HTMLElement> } & Record<string, unknown>> | undefined;

  return (
    <>
      {child &&
        cloneElement(child, {
          ...mergeProps(child.props, triggerButtonProps),
          ref: mergeRefs<HTMLElement>(child.props.ref, triggerRef),
        })}
      <dialog
        {...mergeProps(rest, { id: overlayProps.id })}
        ref={mergeRefs<HTMLDialogElement>(ref, dialogRef)}
        tabIndex={-1}
        aria-labelledby={rest['aria-labelledby'] ?? (title != null && !rest['aria-label'] ? titleId : undefined)}
        aria-describedby={rest['aria-describedby'] ?? (description != null ? descriptionId : undefined)}
        className={`bland-modal bland-smooth${className ? ` ${className}` : ''}`}
        data-size={size}
        data-backdrop={backdrop}
        data-instant={instant || undefined}
        onCancel={onCancel}
        onPointerDown={(e) => {
          downOnBackdrop.current = onBackdrop(e);
          rest.onPointerDown?.(e);
        }}
        onClick={(e) => {
          if (dismissable && downOnBackdrop.current && onBackdrop(e)) state.close();
          downOnBackdrop.current = false;
          rest.onClick?.(e);
        }}
      >
        {mounted && (
          <ModalContent
            key={generation}
            title={title}
            titleAs={Title}
            titleId={titleId}
            icon={icon}
            closeButton={closeButton}
            closeLabel={closeLabel}
            onClose={state.close}
            titleDivider={titleDivider}
            description={description}
            descriptionId={descriptionId}
            top={top}
            align={align}
            actions={actions}
            actionsAlign={actionsAlign}
            actionsOrientation={actionsOrientation}
            actionsDivider={actionsDivider}
          >
            {children}
          </ModalContent>
        )}
      </dialog>
    </>
  );
}

type ModalContentProps = Pick<
  ModalProps,
  | 'title'
  | 'icon'
  | 'closeButton'
  | 'closeLabel'
  | 'titleDivider'
  | 'description'
  | 'top'
  | 'children'
  | 'align'
  | 'actions'
  | 'actionsAlign'
  | 'actionsOrientation'
  | 'actionsDivider'
> & {
  titleAs: ModalTitleAs;
  titleId?: string;
  descriptionId?: string;
  onClose?: () => void;
};

/** The dialog's inside: title row, scrolling body, action bar. Internal; the stories draw it statically too. */
export function ModalContent({
  title,
  titleAs: Title,
  titleId,
  icon,
  closeButton = true,
  closeLabel = 'Close',
  onClose,
  titleDivider,
  description,
  descriptionId,
  top,
  children,
  align = 'left',
  actions,
  actionsAlign = 'left',
  actionsOrientation = 'auto',
  actionsDivider,
}: ModalContentProps) {
  // A body that scrolls with nothing focusable inside still has to be reachable by keyboard (as Table), so the
  // scrolling element takes focus while it overflows.
  const bodyRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const body = bodyRef.current;
    const viewport = body?.closest<HTMLElement>('.bland-scroll-area__viewport');
    if (!body || !viewport) return;
    const update = () => {
      if (viewport.scrollHeight > viewport.clientHeight + 1) viewport.tabIndex = 0;
      else viewport.removeAttribute('tabindex');
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(viewport);
    observer.observe(body);
    return () => observer.disconnect();
  }, []);

  const actionItems = Children.toArray(typeof actions === 'function' ? actions(onClose ?? (() => {})) : actions);
  if (actionsAlign === 'right') actionItems.reverse();

  return (
    <div className="bland-modal__content">
      {(title != null || closeButton) && (
        <div className="bland-modal__header" data-divider={titleDivider || undefined}>
          {icon != null && icon !== false && <Icon className="bland-modal__icon">{icon}</Icon>}
          {title != null && (
            <Title id={titleId} className="bland-modal__title">
              {title}
            </Title>
          )}
          {closeButton && (
            <IconButton
              className="bland-modal__close"
              size="xs"
              type="ghost"
              icon={<XIcon />}
              aria-label={closeLabel}
              onClick={onClose}
            />
          )}
        </div>
      )}
      {(description != null || top != null || children != null) && (
        <ScrollArea className="bland-modal__scroll">
          <div ref={bodyRef} className="bland-modal__body" data-align={align}>
            {top != null && <div className="bland-modal__slot">{top}</div>}
            {description != null && (
              <div id={descriptionId} className="bland-modal__description">
                {description}
              </div>
            )}
            {children != null && <div className="bland-modal__slot">{children}</div>}
          </div>
        </ScrollArea>
      )}
      {actionItems.length > 0 && (
        <div
          className="bland-modal__actions"
          data-align={actionsAlign}
          data-orientation={actionsOrientation}
          data-divider={actionsDivider || undefined}
        >
          {actionItems}
        </div>
      )}
    </div>
  );
}
