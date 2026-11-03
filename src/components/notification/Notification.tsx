import type { HTMLAttributes, ReactNode } from 'react';
import { joinClass, MessageLayout, type MessageIcon, type MessageOrientation, type MessageStatus } from '../message/Message';
import './notification.css';

export type NotificationStatus = MessageStatus;
export type NotificationOrientation = MessageOrientation;

export interface NotificationProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Sets the icon, and when colored the surface, border and shadow. */
  status?: NotificationStatus;
  /** horizontal is one line with inline actions; vertical adds a title, timestamp and actions under the text. */
  orientation?: NotificationOrientation;
  /** The tinted status surface and border. `false` is surface-raised with border-bold and a neutral shadow. */
  colored?: boolean;
  /** Shown above the description. */
  title?: ReactNode;
  /** The description. */
  children?: ReactNode;
  /** Next to the title on vertical, after the text on horizontal. A `<time>` element works well. */
  timestamp?: ReactNode;
  /** One or two Buttons, size xs on horizontal, md on vertical (primary, then secondary). */
  actions?: ReactNode;
  /** Shows a close button that calls this. In a Toaster, pass the dismiss function. */
  onClose?: () => void;
  /** Accessible name of the close button. */
  closeLabel?: string;
  /** `true` shows the status icon, `false` hides it, or pass any SVG to replace it. */
  icon?: MessageIcon;
}

/**
 * Floating message that reports the result of an action or a system event, with an optional
 * title, timestamp, actions and close button. Show it through a Toaster to have it announced and stacked.
 * Figma: Notification page, set "Notification".
 */
export function Notification({
  status = 'info',
  orientation = 'horizontal',
  colored = true,
  title,
  children,
  timestamp,
  actions,
  onClose,
  closeLabel = 'Dismiss',
  icon = true,
  className,
  ...rest
}: NotificationProps) {
  return (
    <div
      {...rest}
      className={joinClass('bland-notification bland-message bland-smooth', className)}
      data-status={status}
      data-orientation={orientation}
      data-colored={colored}
    >
      <MessageLayout
        status={status}
        orientation={orientation}
        icon={icon}
        title={title}
        description={children}
        timestamp={timestamp}
        actions={actions}
        onClose={onClose}
        closeLabel={closeLabel}
      />
    </div>
  );
}
