import type { HTMLAttributes, ReactNode } from 'react';
import {
  CaretLeftIcon,
  DotsThreeIcon,
  MagnifyingGlassIcon,
  PhoneIcon,
  VideoCameraIcon,
  XIcon,
} from '../../icons';
import { IconButton } from '../button/IconButton';
import { Menu, type MenuItemData, type MenuPlacement } from '../menu/Menu';
import './chat-navbar.css';

type Heading = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

/** The accessible names of the navbar's buttons. */
export interface ChatNavbarLabels {
  back: string;
  search: string;
  voiceCall: string;
  videoCall: string;
  more: string;
  close: string;
}

const defaultLabels: ChatNavbarLabels = {
  back: 'Back',
  search: 'Search',
  voiceCall: 'Voice call',
  videoCall: 'Video call',
  more: 'More',
  close: 'Close',
};

export interface ChatNavbarProps extends HTMLAttributes<HTMLElement> {
  /** Figma `✏️ Name`: who the chat is with. One line, ellipsis. */
  name: ReactNode;
  /** The name's element. Default h2 (Figma's note); pick the level that fits the page outline. */
  nameAs?: Heading;
  /** Figma `✏️ Description`: a status line such as "Online" or "Typing…". One line, ellipsis. */
  description?: ReactNode;
  /** Figma's Avatar (md, 32): pass `<Avatar size="md" … />` without `alt`, since the name is shown next to it. */
  avatar?: ReactNode;
  /** Figma `👀 Back` (for mobile; off on desktop): shows the back button and is called when it is pressed. */
  onBack?: () => void;
  /** Figma `👀 Search`: shows the search button. */
  onSearch?: () => void;
  /** Figma `👀 Voice-call`: shows the voice call button. */
  onVoiceCall?: () => void;
  /** Figma `👀 Video-call`: shows the video call button. */
  onVideoCall?: () => void;
  /** Figma `👀 More`: shows the more button, a plain button. With `moreItems` it opens a Menu instead. */
  onMore?: () => void;
  /** Figma `👀 More`: the more button opens a Menu of these (Menu's `items`). */
  moreItems?: MenuItemData[];
  /** Called with a `moreItems` id when it is chosen. */
  onMoreAction?: (id: string) => void;
  /** Where the more Menu opens. Default bottom-end. */
  morePlacement?: MenuPlacement;
  /** Figma `👀 Close`: shows the close button. */
  onClose?: () => void;
  /** The buttons' names. Default Back, Search, Voice call, Video call, More, Close. */
  labels?: Partial<ChatNavbarLabels>;
}

/**
 * Header of an open chat: a back button for mobile, the avatar, name and status line, then ghost Icon Buttons for
 * search, voice call, video call, more and close. Each button shows when its handler is given. A `<header>`; the name
 * is an h2. Fills its container (chat-navbar/width is Figma's frame). Figma: Messaging page, "Chat-navbar".
 */
export function ChatNavbar({
  name,
  nameAs: NameTag = 'h2',
  description,
  avatar,
  onBack,
  onSearch,
  onVoiceCall,
  onVideoCall,
  onMore,
  moreItems,
  onMoreAction,
  morePlacement = 'bottom-end',
  onClose,
  labels,
  className,
  ...rest
}: ChatNavbarProps) {
  const l = { ...defaultLabels, ...labels };
  const button = (icon: ReactNode, label: string, onClick?: () => void) => (
    <IconButton size="sm" type="ghost" icon={icon} aria-label={label} onClick={onClick} />
  );
  const showMore = onMore || (moreItems && moreItems.length > 0);
  const hasDescription = description != null && description !== false && description !== '';

  return (
    <header {...rest} className={`bland-chat-navbar${className ? ` ${className}` : ''}`}>
      <div className="bland-chat-navbar__user">
        {onBack && button(<CaretLeftIcon />, l.back, onBack)}
        {avatar != null && avatar !== false && <span className="bland-chat-navbar__avatar">{avatar}</span>}
        <div className="bland-chat-navbar__text">
          <NameTag className="bland-chat-navbar__name">{name}</NameTag>
          {hasDescription && <p className="bland-chat-navbar__description">{description}</p>}
        </div>
      </div>
      {(onSearch || onVoiceCall || onVideoCall || showMore || onClose) && (
        <div className="bland-chat-navbar__actions">
          {onSearch && button(<MagnifyingGlassIcon />, l.search, onSearch)}
          {onVoiceCall && button(<PhoneIcon />, l.voiceCall, onVoiceCall)}
          {onVideoCall && button(<VideoCameraIcon />, l.videoCall, onVideoCall)}
          {showMore &&
            (moreItems && moreItems.length > 0 ? (
              <Menu items={moreItems} onAction={onMoreAction} placement={morePlacement}>
                <IconButton size="sm" type="ghost" icon={<DotsThreeIcon />} aria-label={l.more} />
              </Menu>
            ) : (
              button(<DotsThreeIcon />, l.more, onMore)
            ))}
          {onClose && button(<XIcon />, l.close, onClose)}
        </div>
      )}
    </header>
  );
}
