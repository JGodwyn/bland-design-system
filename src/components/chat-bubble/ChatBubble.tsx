import { useState, type ImgHTMLAttributes, type LiHTMLAttributes, type ReactNode } from 'react';
import { FileIcon, PauseIcon, PlayIcon } from '../../icons';
import { Icon } from '../icon/Icon';
import {
  MessageSentIndicator,
  type MessageStatus,
  type MessageStatusLabels,
} from '../message-sent-indicator/MessageSentIndicator';
import './chat-bubble.css';

export type ChatBubbleWho = 'receiver' | 'sender';
export type ChatBubbleType = 'text' | 'audio' | 'image' | 'video' | 'document' | 'typing';
/** One waveform bar: 1 is chat-bubble/wave-xs (4) up to 5, chat-bubble/wave-xl (20). */
export type ChatBubbleWaveLevel = 1 | 2 | 3 | 4 | 5;

export interface ChatBubbleReply {
  /** Figma `✏️ Re:Recipient`: who wrote the quoted message. One line, ellipsis. */
  name: ReactNode;
  /** Figma `✏️ Re:Message`: the quoted message. One line, ellipsis. */
  message: ReactNode;
}

export interface ChatBubbleProps extends Omit<LiHTMLAttributes<HTMLLIElement>, 'children' | 'title'> {
  /** Figma `Who`: receiver (left, neutral) or sender (right, brand). */
  who?: ChatBubbleWho;
  /** Figma `Type`. Figma's audio-playing is `type="audio"` with `playing`. typing: three dots that lift and brighten in turn, on either side. */
  type?: ChatBubbleType;
  /**
   * Figma `✏️ Message`: the text of a text bubble (it keeps line breaks and wraps at chat-bubble/max-width), the
   * caption under an image or video (Figma `👀 Message`), or the file name of a document (one line, ellipsis).
   */
  children?: ReactNode;
  /** Figma `✏️ Date`: the time under the bubble, such as "09:41". Pass a `<time>` element for a machine-readable date. */
  time?: ReactNode;
  /** Figma `_message-sent-indicator`, next to the time on a sender bubble: one check, two checks, or two in brand. */
  status?: MessageStatus;
  /** Words read for each `status`. Default Sent, Delivered, Seen. */
  statusLabels?: Partial<MessageStatusLabels>;
  /** Figma `👀 Replying`: the quoted message at the top of the bubble. */
  reply?: ChatBubbleReply;
  /** image and video: the image, or the video's poster frame. Drawn at chat-bubble/media-height, cropped to fill. */
  src?: string;
  /** image and video: the image's text alternative. Use "" when the caption already says what it shows. */
  alt?: string;
  /** image and video: props for the `<img>`, such as `srcSet` or `loading`. */
  imgProps?: Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt'>;
  /** video: called by the play button on the poster. Without it the play disc is drawn but is not a button. */
  onPlay?: () => void;
  /** audio: the pause icon and the playing state (Figma `audio-playing`). Controlled; pair it with `onPlayingChange`. */
  playing?: boolean;
  /** audio: whether it starts playing, uncontrolled. */
  defaultPlaying?: boolean;
  /** audio: called by the play and pause button with the state it asks for. Start or stop your `<audio>` here. */
  onPlayingChange?: (playing: boolean) => void;
  /** audio: how much has played, 0 to 1. The bars up to it take the played wave color. */
  progress?: number;
  /** audio: the time shown after the waveform, such as "0:28" (the length) or "0:14" (elapsed, while playing). */
  duration?: ReactNode;
  /** audio: bar heights, 1 (quietest) to 5 (loudest). Default Figma's 26 bars. */
  waveform?: ChatBubbleWaveLevel[];
  /** audio and video: the play button's name. Default "Play voice message" (audio) or "Play video" (video). */
  playLabel?: string;
  /** audio: the pause button's name. Default "Pause voice message". */
  pauseLabel?: string;
  /** document: Figma `✏️ File type`, such as "PDF". */
  fileType?: ReactNode;
  /** document: Figma `✏️ File size`, such as "1 MB". */
  fileSize?: ReactNode;
  /** document: the icon before the file name. Default File. */
  fileIcon?: ReactNode;
  /** document: makes the file name a link, to open or download the file. */
  href?: string;
  /** document: the link's `download` attribute (true, or a file name). */
  download?: boolean | string;
  /** typing: the words read for the dots. Default "Typing"; say who, such as "Jane is typing". */
  typingLabel?: string;
}

/** Figma's waveform: 26 bars. */
const figmaWaveform: ChatBubbleWaveLevel[] = [
  2, 3, 4, 3, 5, 4, 2, 3, 5, 4, 3, 2, 4, 5, 3, 2, 3, 4, 2, 3, 4, 3, 2, 1, 2, 1,
];

/**
 * Figma `_chat-bubble-tail`: the receiver tail, 20 x 16. The 8 that show sit outside the bubble; the rest lies under
 * the bubble's rounded bottom corner so the two read as one shape. The sender tail is its mirror (CSS).
 */
const tailPath =
  'M 8 0 C 8 8 6 13 0 15 C 4 16 8 16 11 13.5 C 13 15.2 16 16 20 16 L 20 0 L 8 0 Z';

const has = (node: ReactNode) => node != null && node !== false && node !== '';

/**
 * One message in a chat: text, a voice message, an image, a video, a document, or the typing dots. An `<li>`: put
 * bubbles in an `<ol>` inside an element with `role="log"`, so new messages are announced. Receiver bubbles sit on the
 * left in a neutral fill, sender bubbles on the right in brand. Figma: Messaging page, set "Chat-bubble".
 */
export function ChatBubble({
  who = 'receiver',
  type = 'text',
  children,
  time,
  status,
  statusLabels,
  reply,
  src,
  alt,
  imgProps,
  onPlay,
  playing,
  defaultPlaying = false,
  onPlayingChange,
  progress = 0,
  duration,
  waveform = figmaWaveform,
  playLabel,
  pauseLabel = 'Pause voice message',
  fileType,
  fileSize,
  fileIcon,
  href,
  download,
  typingLabel = 'Typing',
  className,
  ...rest
}: ChatBubbleProps) {
  const [ownPlaying, setOwnPlaying] = useState(defaultPlaying);
  const isPlaying = playing ?? ownPlaying;
  const typing = type === 'typing';
  const showMeta = !typing && (has(time) || (who === 'sender' && status));

  const togglePlaying = () => {
    if (playing === undefined) setOwnPlaying(!isPlaying);
    onPlayingChange?.(!isPlaying);
  };

  let body: ReactNode;
  if (typing) {
    body = (
      <>
        <span className="bland-chat-bubble__dots" aria-hidden="true">
          <span className="bland-chat-bubble__dot" />
          <span className="bland-chat-bubble__dot" />
          <span className="bland-chat-bubble__dot" />
        </span>
        <span className="bland-chat-bubble__hidden">{typingLabel}</span>
      </>
    );
  } else if (type === 'audio') {
    const played = Math.round(Math.min(Math.max(progress, 0), 1) * waveform.length);
    body = (
      <span className="bland-chat-bubble__audio">
        <button
          type="button"
          className="bland-chat-bubble__play bland-focus-ring"
          aria-label={isPlaying ? pauseLabel : (playLabel ?? 'Play voice message')}
          onClick={togglePlaying}
        >
          <Icon>{isPlaying ? <PauseIcon /> : <PlayIcon />}</Icon>
        </button>
        <span className="bland-chat-bubble__waveform" aria-hidden="true">
          {waveform.map((level, i) => (
            <span key={i} className="bland-chat-bubble__bar" data-level={level} data-played={i < played || undefined} />
          ))}
        </span>
        {has(duration) && <span className="bland-chat-bubble__duration">{duration}</span>}
      </span>
    );
  } else if (type === 'image' || type === 'video') {
    body = (
      <>
        <span className="bland-chat-bubble__media bland-smooth">
          <img {...imgProps} className="bland-chat-bubble__image" src={src} alt={alt ?? ''} />
          {type === 'video' &&
            (onPlay ? (
              <button
                type="button"
                className="bland-chat-bubble__video-play bland-focus-ring"
                aria-label={playLabel ?? 'Play video'}
                onClick={onPlay}
              >
                <Icon>
                  <PlayIcon />
                </Icon>
              </button>
            ) : (
              <span className="bland-chat-bubble__video-play" aria-hidden="true">
                <Icon>
                  <PlayIcon />
                </Icon>
              </span>
            ))}
        </span>
        {has(children) && <span className="bland-chat-bubble__text">{children}</span>}
      </>
    );
  } else if (type === 'document') {
    const file = (
      <>
        <Icon>{fileIcon ?? <FileIcon />}</Icon>
        <span className="bland-chat-bubble__filename">{children}</span>
      </>
    );
    body = (
      <>
        {href !== undefined ? (
          <a className="bland-chat-bubble__file bland-focus-ring bland-smooth" href={href} download={download === true ? '' : download || undefined}>
            {file}
          </a>
        ) : (
          <span className="bland-chat-bubble__file">{file}</span>
        )}
        {(has(fileType) || has(fileSize)) && (
          <span className="bland-chat-bubble__file-meta">
            {has(fileType) && <span>{fileType}</span>}
            {has(fileType) && has(fileSize) && (
              <span className="bland-chat-bubble__separator" aria-hidden="true" />
            )}
            {has(fileSize) && <span>{fileSize}</span>}
          </span>
        )}
      </>
    );
  } else {
    body = <span className="bland-chat-bubble__text">{children}</span>;
  }

  return (
    <li
      {...rest}
      className={`bland-chat-bubble${className ? ` ${className}` : ''}`}
      data-who={who}
      data-type={type}
      data-playing={(type === 'audio' && isPlaying) || undefined}
    >
      <span className="bland-chat-bubble__body">
        <span className="bland-chat-bubble__tail" aria-hidden="true">
          <svg viewBox="0 0 20 16" focusable="false">
            <path d={tailPath} />
          </svg>
        </span>
        <span className="bland-chat-bubble__bubble bland-smooth">
          {reply && !typing && (
            <span className="bland-chat-bubble__reply bland-smooth">
              <span className="bland-chat-bubble__reply-name">{reply.name}</span>
              <span className="bland-chat-bubble__reply-message">{reply.message}</span>
            </span>
          )}
          {body}
        </span>
      </span>
      {showMeta && (
        <span className="bland-chat-bubble__meta">
          {has(time) && <span className="bland-chat-bubble__time">{time}</span>}
          {who === 'sender' && status && <MessageSentIndicator status={status} labels={statusLabels} />}
        </span>
      )}
    </li>
  );
}
