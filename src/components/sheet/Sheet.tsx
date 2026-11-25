import type { ReactNode } from 'react';
import { DialogShell, type ModalProps } from '../modal/Modal';
import '../modal/modal.css';
import './sheet.css';

/**
 * The edge it is attached to and slides in from. `end` is the right edge in left-to-right languages and the left
 * edge in right-to-left ones; `start` the other way round (Figma's right and left).
 */
export type SheetSide = 'end' | 'start' | 'bottom';
export type SheetSize = 'sm' | 'md' | 'lg';

export interface SheetProps extends Omit<ModalProps, 'size' | 'backdrop' | 'align'> {
  /** The edge it is attached to: end (default, Figma's right), start (Figma's left, for navigation) or bottom (a phone sheet). */
  side?: SheetSide;
  /** A side sheet's width: sm 384 (default), md 512, lg 640. A bottom sheet fills the screen width. */
  size?: SheetSize;
  /** Detached from the screen: space-sm from every edge, every corner rounded and a border all round. */
  floating?: boolean;
  /** `👀 Handle`: the grab handle on a bottom sheet. Default true. Decorative; Escape, the close button and the backdrop close it. */
  handle?: boolean;
  /** `👀 Divider`: a line under the title. Default false. */
  titleDivider?: boolean;
  /** `👀 Divider`: a line over the actions. Default false. */
  actionsDivider?: boolean;
  /** Where the actions sit. Default right on side sheets (primary last) and fill on the bottom sheet. */
  actionsAlign?: ModalProps['actionsAlign'];
  /** Default horizontal on side sheets and vertical (stacked full width, primary on top) on the bottom sheet. */
  actionsOrientation?: ModalProps['actionsOrientation'];
  /** The body text, which also describes the sheet (`aria-describedby`). */
  description?: ReactNode;
  /** The body's one slot: any content under the description, such as a form, filters or a record's details. It scrolls. */
  children?: ReactNode;
}

/**
 * A panel that slides in from an edge of the screen over the page: details, editing a record, filters, or a
 * phone's navigation (`side="start"`). A native `<dialog>` opened as modal, like Modal: the page behind is inert and
 * dimmed with Sheet/backdrop, focus moves in on open and back to the trigger on close, Escape closes it. The
 * title row and action bar stay put while the body scrolls. Figma: Sheet page, set "Sheet" with Modal's parts.
 */
export function Sheet({
  side = 'end',
  size = 'sm',
  floating = false,
  handle = true,
  titleDivider = false,
  actionsDivider = false,
  actionsAlign,
  actionsOrientation,
  className,
  ...rest
}: SheetProps) {
  const bottom = side === 'bottom';
  return (
    <DialogShell
      {...rest}
      className={`bland-sheet bland-smooth${className ? ` ${className}` : ''}`}
      data-side={side}
      data-size={bottom ? undefined : size}
      data-floating={floating || undefined}
      titleDivider={titleDivider}
      actionsDivider={actionsDivider}
      actionsAlign={actionsAlign ?? (bottom ? 'fill' : 'right')}
      actionsOrientation={actionsOrientation ?? (bottom ? 'vertical' : 'horizontal')}
      before={bottom && handle ? <span className="bland-sheet__handle" aria-hidden /> : undefined}
    />
  );
}
