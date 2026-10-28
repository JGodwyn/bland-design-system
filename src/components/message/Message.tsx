// Shared by Alert, Banner, Toast and Notification: the status model, the status icon and the
// Banner / Notification layout. Internal: not exported from the package.
import type { ReactNode } from 'react';
import { CheckCircleIcon, InfoIcon, WarningCircleIcon, WarningOctagonIcon, XIcon } from '../../icons';
import { ButtonSizeContext, type ButtonSize } from '../button/Button';
import { IconButton } from '../button/IconButton';
import { Icon } from '../icon/Icon';
import './message.css';

/** Shared by the four feedback sets. info uses the brand tokens. */
export type MessageStatus = 'info' | 'danger' | 'success' | 'warning';
export type MessageOrientation = 'horizontal' | 'vertical';

const statusIcons = {
  info: InfoIcon,
  danger: WarningOctagonIcon,
  success: CheckCircleIcon,
  warning: WarningCircleIcon,
} as const;

/** `true` (default) draws Bland's icon for the status, `false` hides it (Figma `👀 Icon` off), a node replaces it. */
export type MessageIcon = boolean | ReactNode;

/** The leading status icon, colored by the status (message.css). Decorative: the text carries the meaning. */
export function StatusIcon({ status, icon = true }: { status: MessageStatus; icon?: MessageIcon }) {
  if (icon === false || icon === null) return null;
  const Svg = statusIcons[status];
  return <Icon className="bland-message__icon">{icon === true || icon === undefined ? <Svg /> : icon}</Icon>;
}

export function joinClass(base: string, className?: string) {
  return className ? `${base} ${className}` : base;
}

export interface MessageLayoutProps {
  status: MessageStatus;
  orientation: MessageOrientation;
  icon?: MessageIcon;
  title?: ReactNode;
  description?: ReactNode;
  timestamp?: ReactNode;
  actions?: ReactNode;
  onClose?: () => void;
  closeLabel: string;
  /** Default size of the Buttons in `actions` (a button's own `size` wins). */
  actionSize?: ButtonSize;
}

/**
 * Banner and Notification share Figma's anatomy: icon, content, actions, close.
 * Horizontal: one row, actions inline after the text. Vertical: title row over the description,
 * actions under the text.
 */
export function MessageLayout({ status, orientation, icon, title, description, timestamp, actions, onClose, closeLabel, actionSize }: MessageLayoutProps) {
  const vertical = orientation === 'vertical';
  const hasHeader = title != null || (vertical && timestamp != null);
  const stamp = timestamp != null ? <span className="bland-message__timestamp">{timestamp}</span> : null;
  const actionRow =
    actions != null ? (
      <div className="bland-message__actions">
        <ButtonSizeContext.Provider value={actionSize}>{actions}</ButtonSizeContext.Provider>
      </div>
    ) : null;

  return (
    <>
      <StatusIcon status={status} icon={icon} />
      <div className="bland-message__content">
        <div className="bland-message__text">
          {hasHeader && (
            <div className="bland-message__header">
              {title != null && <div className="bland-message__title">{title}</div>}
              {vertical && stamp}
            </div>
          )}
          {description != null && <div className="bland-message__description">{description}</div>}
        </div>
        {!vertical && stamp}
        {vertical && actionRow}
      </div>
      {!vertical && actionRow}
      {onClose && (
        <IconButton
          className="bland-message__close"
          size="xs"
          type="ghost"
          icon={<XIcon />}
          aria-label={closeLabel}
          onClick={onClose}
        />
      )}
    </>
  );
}
