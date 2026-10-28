import type { HTMLAttributes, ReactNode } from 'react';
import { joinClass, StatusIcon, type MessageIcon, type MessageStatus } from '../message/Message';
import './toast.css';

export type ToastStatus = MessageStatus;

export interface ToastProps extends HTMLAttributes<HTMLDivElement> {
  /** The solid surface-{status}-strong fill and the matching tinted elevation. Content is white in both modes. */
  status?: ToastStatus;
  /** The message. Wraps at 384px. */
  children: ReactNode;
  /** `true` shows the status icon, `false` hides it, or pass any SVG to replace it. */
  icon?: MessageIcon;
}

/**
 * Short, transient status message that floats above the page and dismisses on its own. Show it
 * with `useToaster().toast()`, which announces it and times it out. No title, actions or close
 * button: for those, use Notification. Figma: Toast page, set "Toast".
 */
export function Toast({ status = 'info', icon = true, children, className, ...rest }: ToastProps) {
  return (
    <div {...rest} className={joinClass('bland-toast bland-message bland-smooth', className)} data-status={status}>
      <StatusIcon status={status} icon={icon} />
      <span className="bland-toast__label">{children}</span>
    </div>
  );
}
