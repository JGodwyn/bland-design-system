import type { HTMLAttributes, ReactNode } from 'react';
import { joinClass, MessageLayout, type MessageIcon, type MessageOrientation, type MessageStatus } from '../message/Message';
import './banner.css';

export type BannerStatus = MessageStatus;
export type BannerOrientation = MessageOrientation;

export interface BannerProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Figma `Status`: sets the icon and its color. The surface stays surface-100 with a border-bold outline. */
  status?: BannerStatus;
  /** Figma `Orientation`: horizontal is one row with inline actions; vertical puts a title over the text and actions under it. */
  orientation?: BannerOrientation;
  /** Figma `✏️ Title` (on horizontal, `👀 Title`): shown above the description. */
  title?: ReactNode;
  /** Figma `✏️ Description` (`👀 Description` off = no children). */
  children?: ReactNode;
  /** Figma `👀 Btn` / `👀 Btn (2nd)`: one or two Buttons, size xs on horizontal banners, md on vertical ones (primary, then secondary). */
  actions?: ReactNode;
  /** Figma `👀 Close`: shows a close button that calls this. The banner never hides itself. */
  onClose?: () => void;
  /** Accessible name of the close button. */
  closeLabel?: string;
  /** Figma `👀 Icon`: `true` shows the status icon, `false` hides it, or pass any SVG to replace it. */
  icon?: MessageIcon;
}

/**
 * Persistent message in the page layout, usually full width under a header, until dismissed or the
 * condition clears. No elevation. Figma: Banner page, set "Banner".
 */
export function Banner({
  status = 'info',
  orientation = 'horizontal',
  title,
  children,
  actions,
  onClose,
  closeLabel = 'Dismiss',
  icon = true,
  className,
  ...rest
}: BannerProps) {
  return (
    <div
      {...rest}
      className={joinClass('bland-banner bland-message bland-smooth', className)}
      data-status={status}
      data-orientation={orientation}
    >
      <MessageLayout
        status={status}
        orientation={orientation}
        icon={icon}
        title={title}
        description={children}
        actions={actions}
        onClose={onClose}
        closeLabel={closeLabel}
      />
    </div>
  );
}
