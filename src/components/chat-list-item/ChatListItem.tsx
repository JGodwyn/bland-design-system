import type { LiHTMLAttributes, MouseEventHandler, ReactNode } from 'react';
import { Indicator } from '../indicator/Indicator';
import {
  MessageSentIndicator,
  type MessageStatus,
  type MessageStatusLabels,
} from '../message-sent-indicator/MessageSentIndicator';
import './chat-list-item.css';

export type ChatListItemType = 'receiver' | 'sender';

/** What `renderLink` receives: spread it onto your router's link. */
export interface ChatListItemLinkProps {
  href: string;
  /** Bland's row classes (look, hover and focus ring). Keep them on the rendered element. */
  className: string;
  'aria-current'?: 'page';
  onClick?: MouseEventHandler<HTMLElement>;
  children: ReactNode;
}

export interface ChatListItemProps extends Omit<LiHTMLAttributes<HTMLLIElement>, 'onClick'> {
  /** Figma `✏️ Name`: the person or group. One line, ellipsis. */
  name: ReactNode;
  /** Figma `✏️ Date`: when the last message came, such as "09:41" or "Yesterday". Never truncated. */
  date?: ReactNode;
  /** Figma `✏️ Message`: the last message. One line, ellipsis. */
  message?: ReactNode;
  /** Figma `Type`: who wrote the last message. receiver (the other person) can show `unread`; sender (you) shows `status`. */
  type?: ChatListItemType;
  /** Figma `👀 Unread` (receiver): a brand dot after the message. Off by default (Figma draws it on). */
  unread?: boolean;
  /** The words read for the unread dot. Default "Unread". */
  unreadLabel?: string;
  /** Delivery status of your last message (sender): one check, two checks, or two in brand. Default delivered (Figma's). */
  status?: MessageStatus;
  /** Words read for each `status`. Default Sent, Delivered, Seen. */
  statusLabels?: Partial<MessageStatusLabels>;
  /** Figma's Avatar (lg, 40): pass `<Avatar size="lg" … />` without `alt`, since the name is shown next to it. */
  avatar?: ReactNode;
  /** Makes the row a link to the chat. Rendered as `<a>` unless `renderLink` is given. */
  href?: string;
  /** Makes the row a button that opens the chat. */
  onClick?: MouseEventHandler<HTMLElement>;
  /** The chat that is open: `aria-current` on the row (Figma draws no look for it). */
  current?: boolean;
  /** Renders a link row with the project's router link. Default: a plain `<a>`. */
  renderLink?: (props: ChatListItemLinkProps) => ReactNode;
}

const defaultLink = (props: ChatListItemLinkProps) => <a {...props} />;
const has = (node: ReactNode) => node != null && node !== false && node !== '';

/**
 * One chat in a list of chats: avatar, name, date and the last message, with an unread dot or the delivery status. An
 * `<li>`: put rows in your own `<ul>`; with `href` or `onClick` the row is one link or button. Figma: Messaging page,
 * set "Chat-list-item".
 */
export function ChatListItem({
  name,
  date,
  message,
  type = 'receiver',
  unread = false,
  unreadLabel = 'Unread',
  status = 'delivered',
  statusLabels,
  avatar,
  href,
  onClick,
  current = false,
  renderLink = defaultLink,
  className,
  ...rest
}: ChatListItemProps) {
  const rowClass = 'bland-chat-list-item__row';
  const content = (
    <>
      {has(avatar) && <span className="bland-chat-list-item__avatar">{avatar}</span>}
      <span className="bland-chat-list-item__text">
        <span className="bland-chat-list-item__header">
          <span className="bland-chat-list-item__name">{name}</span>
          {has(date) && <span className="bland-chat-list-item__date">{date}</span>}
        </span>
        <span className="bland-chat-list-item__preview">
          <span className="bland-chat-list-item__message">{message}</span>
          {type === 'receiver' && unread && (
            <span className="bland-chat-list-item__unread">
              <Indicator size="sm" emotion="brand" />
              <span className="bland-chat-list-item__hidden">{unreadLabel}</span>
            </span>
          )}
          {type === 'sender' && <MessageSentIndicator status={status} labels={statusLabels} />}
        </span>
      </span>
    </>
  );

  let row: ReactNode;
  if (href !== undefined) {
    row = renderLink({
      href,
      className: `${rowClass} bland-focus-ring`,
      'aria-current': current ? 'page' : undefined,
      onClick,
      children: content,
    });
  } else if (onClick) {
    row = (
      <button type="button" className={`${rowClass} bland-focus-ring`} aria-current={current || undefined} onClick={onClick}>
        {content}
      </button>
    );
  } else {
    row = <div className={rowClass}>{content}</div>;
  }

  return (
    <li {...rest} className={`bland-chat-list-item${className ? ` ${className}` : ''}`} data-type={type}>
      {row}
    </li>
  );
}
