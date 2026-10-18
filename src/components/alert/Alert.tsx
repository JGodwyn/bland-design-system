import type { HTMLAttributes, ReactNode } from 'react';
import { joinClass, StatusIcon, type MessageIcon, type MessageStatus } from '../message/Message';
import './alert.css';

export type AlertStatus = MessageStatus;

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  /** Figma `Status`: sets the icon and the text color. info is neutral text with the brand icon. */
  status?: AlertStatus;
  /** Figma `✏️ Label`: the message. Wraps at alert/max-width (384). */
  children: ReactNode;
  /** Figma `👀 Icon`: `true` shows the status icon, `false` hides it, or pass any SVG to replace it. */
  icon?: MessageIcon;
  /**
   * Defaults to `alert` for danger (announced at once, for an error that appears after an action)
   * and `status` for the others (announced politely). Pass `role={undefined}` for a message that is on the page from the start.
   */
  role?: HTMLAttributes<HTMLDivElement>['role'];
}

/**
 * Inline message tied to a field or element, such as validation feedback. No surface or elevation.
 * Point the field at it with `aria-describedby`. Figma: Alert page, set "Alert".
 */
export function Alert({ status = 'info', icon = true, children, className, ...rest }: AlertProps) {
  const role = 'role' in rest ? rest.role : status === 'danger' ? 'alert' : 'status';
  return (
    <div {...rest} role={role} className={joinClass('bland-alert bland-message', className)} data-status={status}>
      <StatusIcon status={status} icon={icon} />
      <span className="bland-alert__label">{children}</span>
    </div>
  );
}
