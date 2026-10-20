import {
  useState,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
  type Ref,
  type TextareaHTMLAttributes,
} from 'react';
import {
  ArrowBendUpLeftIcon,
  MicrophoneIcon,
  PaperPlaneRightIcon,
  PlusCircleIcon,
  SmileyIcon,
  StickerIcon,
  TrashIcon,
  XIcon,
} from '../../icons';
import { IconButton } from '../button/IconButton';
import { Chip } from '../chip/Chip';
import { Icon } from '../icon/Icon';
import { Indicator } from '../indicator/Indicator';
import './chat-message-bar.css';

/** The words the bar reads out: its field and buttons. */
export interface ChatMessageBarLabels {
  /** The text field's name. Default "Message". */
  message: string;
  send: string;
  record: string;
  emoji: string;
  sticker: string;
  attach: string;
  deleteRecording: string;
  sendRecording: string;
  /** Shown in the field while recording. Default "Recording audio…". */
  recording: string;
  /** Before the quoted name. Default "Replying to". */
  replyingTo: string;
  cancelReply: string;
}

const defaultLabels: ChatMessageBarLabels = {
  message: 'Message',
  send: 'Send',
  record: 'Record voice message',
  emoji: 'Emoji',
  sticker: 'Sticker',
  attach: 'Attach',
  deleteRecording: 'Delete recording',
  sendRecording: 'Send voice message',
  recording: 'Recording audio…',
  replyingTo: 'Replying to',
  cancelReply: 'Cancel reply',
};

export interface ChatMessageBarReply {
  /** Figma `✏️ Replying to…`: who wrote the quoted message. One line, ellipsis. */
  name: ReactNode;
  /** Figma `✏️ Reply`: the quoted message. One line, ellipsis. */
  message: ReactNode;
}

export interface ChatMessageBarProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Figma `✏️ Message`: the text, controlled. Pair it with `onValueChange`. */
  value?: string;
  /** The text at first, uncontrolled. */
  defaultValue?: string;
  /** Called with the text on every change. */
  onValueChange?: (value: string) => void;
  /** Called with the text when the send button or Enter sends it (Shift+Enter starts a new line). Uncontrolled, the field then clears. */
  onSend?: (value: string) => void;
  /** Shown while the field is empty. Default "Type here" (Figma's). */
  placeholder?: string;
  /** Figma `Replying` + `✏️ Replying to…` and `✏️ Reply`: the quoted message above the field. */
  reply?: ChatMessageBarReply;
  /** The reply panel's close button; shown with `reply`. */
  onReplyClose?: () => void;
  /** Figma's Smiley: shows the emoji button. */
  onEmoji?: () => void;
  /** Figma's Sticker: shows the sticker button. */
  onSticker?: () => void;
  /** Figma's PlusCircle: shows the attach button. */
  onAttach?: () => void;
  /** Figma `State=rest`: while the field is empty the send button becomes the record button (Microphone). Without it, send is disabled while empty. */
  onRecordStart?: () => void;
  /** Figma `State=recording-audio`: the field shows a delete button, the recording label and the timer Chip. */
  recording?: boolean;
  /** The timer in the recording Chip, such as "1:00". */
  recordingTime?: ReactNode;
  /** The recording's delete button (Trash). */
  onRecordCancel?: () => void;
  /** The send button while recording. */
  onRecordSend?: () => void;
  /** Turns the whole bar off. */
  disabled?: boolean;
  /** The words read for the field and buttons. */
  labels?: Partial<ChatMessageBarLabels>;
  /** Props for the native `<textarea>`, such as `name`, `maxLength` or `autoFocus`. */
  textareaProps?: Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'value' | 'defaultValue' | 'onChange' | 'placeholder'>;
  /** Reaches the native `<textarea>`, to focus it after picking an emoji. */
  textareaRef?: Ref<HTMLTextAreaElement>;
}

/**
 * Composer at the bottom of a chat: a text field with emoji, sticker and attach buttons, and a send button that turns
 * into record while the field is empty. Replying shows the quoted message above the field; recording swaps the field
 * for a delete button, a label and a timer. Enter sends, Shift+Enter starts a new line. Fills its container
 * (message-bar/width is Figma's frame). Figma: Messaging page, set "Chat-message-bar".
 */
export function ChatMessageBar({
  value,
  defaultValue = '',
  onValueChange,
  onSend,
  placeholder = 'Type here',
  reply,
  onReplyClose,
  onEmoji,
  onSticker,
  onAttach,
  onRecordStart,
  recording = false,
  recordingTime,
  onRecordCancel,
  onRecordSend,
  disabled = false,
  labels,
  textareaProps,
  textareaRef,
  className,
  ...rest
}: ChatMessageBarProps) {
  const l = { ...defaultLabels, ...labels };
  const [own, setOwn] = useState(defaultValue);
  const text = value ?? own;
  const filled = text.trim() !== '';

  const change = (next: string) => {
    if (value === undefined) setOwn(next);
    onValueChange?.(next);
  };
  const send = () => {
    if (!filled || disabled) return;
    onSend?.(text);
    if (value === undefined) setOwn('');
  };
  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    textareaProps?.onKeyDown?.(e);
    if (e.defaultPrevented) return;
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      send();
    }
  };
  const fieldButton = (icon: ReactNode, label: string, onClick: () => void, extra?: string) => (
    <button
      type="button"
      className={`bland-chat-message-bar__tool bland-focus-ring bland-smooth${extra ? ` ${extra}` : ''}`}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
    >
      <Icon>{icon}</Icon>
    </button>
  );

  let action: ReactNode;
  if (recording) {
    action = <IconButton icon={<PaperPlaneRightIcon />} aria-label={l.sendRecording} disabled={disabled} onClick={onRecordSend} />;
  } else if (!filled && onRecordStart) {
    action = <IconButton icon={<MicrophoneIcon />} aria-label={l.record} disabled={disabled} onClick={onRecordStart} />;
  } else {
    action = <IconButton icon={<PaperPlaneRightIcon />} aria-label={l.send} disabled={disabled || !filled} onClick={send} />;
  }

  return (
    <div
      {...rest}
      className={`bland-chat-message-bar${className ? ` ${className}` : ''}`}
      data-state={recording ? 'recording-audio' : filled ? 'filled' : 'rest'}
      data-disabled={disabled || undefined}
    >
      {reply && (
        <div className="bland-chat-message-bar__reply bland-smooth">
          <Icon className="bland-chat-message-bar__reply-icon">
            <ArrowBendUpLeftIcon />
          </Icon>
          <div className="bland-chat-message-bar__reply-text">
            <span className="bland-chat-message-bar__reply-header">
              <span className="bland-chat-message-bar__reply-to">{l.replyingTo}</span>{' '}
              <span className="bland-chat-message-bar__reply-name">{reply.name}</span>
            </span>
            <span className="bland-chat-message-bar__reply-message">{reply.message}</span>
          </div>
          {onReplyClose && (
            <button
              type="button"
              className="bland-chat-message-bar__reply-close bland-focus-ring"
              aria-label={l.cancelReply}
              disabled={disabled}
              onClick={onReplyClose}
            >
              <Icon>
                <XIcon />
              </Icon>
            </button>
          )}
        </div>
      )}
      <div className="bland-chat-message-bar__row">
        <div className="bland-chat-message-bar__field bland-smooth">
          {recording ? (
            <>
              {onRecordCancel && fieldButton(<TrashIcon />, l.deleteRecording, onRecordCancel, 'bland-chat-message-bar__delete')}
              <span className="bland-chat-message-bar__recording">{l.recording}</span>
              {recordingTime != null && recordingTime !== false && (
                <Chip size="md" leading={<Indicator size="sm" emotion="danger" />} className="bland-chat-message-bar__timer">
                  {recordingTime}
                </Chip>
              )}
            </>
          ) : (
            <>
              {onEmoji && fieldButton(<SmileyIcon />, l.emoji, onEmoji)}
              <textarea
                rows={1}
                {...textareaProps}
                ref={textareaRef}
                className="bland-chat-message-bar__input"
                aria-label={textareaProps?.['aria-label'] ?? l.message}
                placeholder={placeholder}
                value={text}
                disabled={disabled}
                onChange={(e) => change(e.target.value)}
                onKeyDown={onKeyDown}
              />
              {onSticker && fieldButton(<StickerIcon />, l.sticker, onSticker)}
              {onAttach && fieldButton(<PlusCircleIcon />, l.attach, onAttach)}
            </>
          )}
        </div>
        {action}
      </div>
    </div>
  );
}
