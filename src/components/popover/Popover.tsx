import { cloneElement, useRef, useState, type HTMLAttributes, type ReactElement, type ReactNode, type Ref } from 'react';
import {
  DismissButton,
  mergeProps,
  mergeRefs,
  useButton,
  useDialog,
  useFocusVisible,
  useId,
  useOverlayTrigger,
} from 'react-aria';
import { useOverlayTriggerState } from 'react-stately';
import type { Placement } from '@floating-ui/react-dom';
import { ModalContent, type ModalActionsAlign, type ModalAlign, type ModalTitleAs } from '../modal/Modal';
import { FloatingPanel } from '../overlay/FloatingPanel';
import '../modal/modal.css';
import '../overlay/floating-panel.css';
import './popover.css';

export type PopoverSize = 'sm' | 'md';
export type PopoverPlacement = Placement;

export interface PopoverProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title' | 'children'> {
  /**
   * The element that opens it: one focusable element that forwards `ref` and DOM props (a Button, an Avatar in a
   * button). It gets `aria-haspopup="dialog"`, `aria-expanded` and `aria-controls`, and focus returns to it on
   * close. Leave it out and drive `open` yourself.
   */
  trigger?: ReactElement;
  /** The width, sm (256) or md (320, default). Never wider than the screen less space-sm each side. */
  size?: PopoverSize;
  /** Where it opens beside the trigger, in Floating UI's names. Default `bottom-start`; flips and shifts to stay on screen. */
  placement?: PopoverPlacement;
  /** Whether it is open (controlled). */
  open?: boolean;
  /** Whether it starts open (uncontrolled). */
  defaultOpen?: boolean;
  /** Called when it opens or closes: the trigger, Escape, a press outside, focus leaving it, the close button. */
  onOpenChange?: (open: boolean) => void;
  /** `👀 Title`: names the panel. Off by default (Figma); without it, name the panel with `aria-label`. */
  title?: ReactNode;
  /** The title's element. Defaults to `h2`; pick the level that fits the page outline. */
  titleAs?: ModalTitleAs;
  /** An icon before the title. */
  icon?: ReactNode;
  /** The title row's close button. Off by default: a press outside and Escape close it. Turn it on for a panel with a form. */
  closeButton?: boolean;
  /** The close button's name. Default "Close". */
  closeLabel?: string;
  /** `👀 Divider`: a line under the title. */
  titleDivider?: boolean;
  /** `✏️ Description`: text in the body; it describes the panel (`aria-describedby`). */
  description?: ReactNode;
  /** `🧩 Slot`: any content under the description: a form, a few options, a picker, a profile. */
  children?: ReactNode;
  /** `Alignment` of the body: left (default) or center. */
  align?: ModalAlign;
  /**
   * `👀 Actions`: sm Buttons, **primary first**. Pass a function to get `close`, for a Cancel that only closes.
   */
  actions?: ReactNode | ((close: () => void) => ReactNode);
  /** `Alignment` of the actions: right (default, primary last on the trailing edge), left or fill. */
  actionsAlign?: ModalActionsAlign;
  /** `👀 Divider`: a line over the actions. */
  actionsDivider?: boolean;
  /** Whether a press outside, Escape or focus leaving it closes it. Default true. */
  dismissable?: boolean;
  /** Reaches the panel (`role="dialog"`). */
  ref?: Ref<HTMLDivElement>;
}

/**
 * A small floating panel that opens beside the element that was pressed and holds any content: a profile panel, a
 * Share panel with a link and Copy, a filter panel with a few options and Apply. It sits above the page without
 * blocking it (no backdrop, `role="dialog"` without `aria-modal`): a press outside, Escape or focus leaving it closes
 * it, and focus goes back to the trigger. Placed by Floating UI space-xs from the trigger, in the top layer; it
 * reuses Modal's title, body and action bar, tighter. Figma: Popover page, set "Popover".
 */
export function Popover({
  trigger,
  size = 'md',
  placement = 'bottom-start',
  open,
  defaultOpen,
  onOpenChange,
  title,
  titleAs = 'h2',
  icon,
  closeButton = false,
  closeLabel = 'Close',
  titleDivider = false,
  description,
  children,
  align = 'left',
  actions,
  actionsAlign = 'right',
  actionsDivider = false,
  dismissable = true,
  className,
  ref,
  ...rest
}: PopoverProps) {
  const state = useOverlayTriggerState({ isOpen: open, defaultOpen, onOpenChange });
  const triggerRef = useRef<HTMLElement>(null);
  const [triggerEl, setTriggerEl] = useState<HTMLElement | null>(null);
  const { triggerProps, overlayProps } = useOverlayTrigger({ type: 'dialog' }, state, triggerRef);
  // useButton's native `type="button"` would replace a Bland Button's Figma `type`; Bland's buttons default to it anyway.
  const { buttonProps } = useButton(triggerProps, triggerRef);
  const { type: _type, ...triggerButtonProps } = buttonProps as typeof buttonProps & { type?: string };

  // No motion when it opens from the keyboard (React Aria's input modality) or is open from the start.
  const { isFocusVisible: keyboard } = useFocusVisible();
  const [prevOpen, setPrevOpen] = useState(state.isOpen);
  const [instant, setInstant] = useState(true);
  if (state.isOpen !== prevOpen) {
    setPrevOpen(state.isOpen);
    if (state.isOpen) setInstant(keyboard);
  }

  const child = trigger as ReactElement<{ ref?: Ref<HTMLElement> } & Record<string, unknown>> | undefined;

  return (
    <>
      {child &&
        cloneElement(child, {
          ...mergeProps(child.props, triggerButtonProps, { 'aria-haspopup': 'dialog' }),
          ref: mergeRefs<HTMLElement>(child.props.ref, triggerRef, (el: HTMLElement | null) => setTriggerEl(el)),
        })}
      <FloatingPanel
        open={state.isOpen}
        reference={triggerEl}
        placement={placement}
        instant={instant}
        dismissable={dismissable}
        onClose={state.close}
        returnFocus={triggerRef}
      >
        <PopoverPanel
          {...mergeProps(rest, overlayProps)}
          ref={ref}
          className={className}
          size={size}
          title={title}
          titleAs={titleAs}
          icon={icon}
          closeButton={closeButton}
          closeLabel={closeLabel}
          onClose={state.close}
          titleDivider={titleDivider}
          description={description}
          align={align}
          actions={actions}
          actionsAlign={actionsAlign}
          actionsDivider={actionsDivider}
        >
          {children}
        </PopoverPanel>
      </FloatingPanel>
    </>
  );
}

type PopoverPanelProps = Omit<
  PopoverProps,
  'trigger' | 'placement' | 'open' | 'defaultOpen' | 'onOpenChange' | 'dismissable'
> & { titleAs: ModalTitleAs; onClose: () => void };

/**
 * The panel itself, mounted on every open (so useDialog moves focus in each time): `role="dialog"`, named by its
 * title, described by its description; Modal's parts inside. Internal.
 */
function PopoverPanel({
  size = 'md',
  title,
  titleAs,
  icon,
  closeButton,
  closeLabel,
  onClose,
  titleDivider,
  description,
  children,
  align,
  actions,
  actionsAlign,
  actionsDivider,
  className,
  ref,
  ...rest
}: PopoverPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  const labelledBy = rest['aria-labelledby'] ?? (title != null && !rest['aria-label'] ? titleId : undefined);
  // Focus moves to the panel on open unless something inside takes it (an `autoFocus` field), as Modal.
  const { dialogProps } = useDialog({ 'aria-labelledby': labelledBy }, panelRef);

  return (
    <div
      {...mergeProps(rest, dialogProps)}
      ref={mergeRefs<HTMLDivElement>(ref, panelRef)}
      aria-labelledby={labelledBy}
      aria-describedby={rest['aria-describedby'] ?? (description != null ? descriptionId : undefined)}
      className={`bland-popover bland-smooth${className ? ` ${className}` : ''}`}
      data-size={size}
    >
      <ModalContent
        title={title}
        titleAs={titleAs}
        titleId={titleId}
        icon={icon}
        closeButton={closeButton}
        closeLabel={closeLabel}
        onClose={onClose}
        titleDivider={titleDivider}
        description={description}
        descriptionId={descriptionId}
        align={align}
        actions={actions}
        actionsAlign={actionsAlign}
        actionsOrientation="horizontal"
        actionsDivider={actionsDivider}
      >
        {children}
      </ModalContent>
      <DismissButton onDismiss={onClose} />
    </div>
  );
}
