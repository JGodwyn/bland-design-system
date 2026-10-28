import { CheckIcon, ChecksIcon } from '../../icons';
import { Icon } from '../icon/Icon';
import './message-sent-indicator.css';

export type MessageStatus = 'sent' | 'delivered' | 'seen';

/** The words read for each delivery status. */
export type MessageStatusLabels = Record<MessageStatus, string>;

export const defaultStatusLabels: MessageStatusLabels = { sent: 'Sent', delivered: 'Delivered', seen: 'Seen' };

/**
 * One check for sent, two for delivered, two in brand for seen, at icon/xs.
 * The icon is decorative; the status is a visually hidden word, so it reads with the time or the chat row.
 */
export function MessageSentIndicator({ status, labels = defaultStatusLabels }: { status: MessageStatus; labels?: Partial<MessageStatusLabels> }) {
  return (
    <span className="bland-message-sent-indicator" data-status={status}>
      <Icon size="xs">{status === 'sent' ? <CheckIcon /> : <ChecksIcon />}</Icon>
      <span className="bland-message-sent-indicator__label">{labels[status] ?? defaultStatusLabels[status]}</span>
    </span>
  );
}
