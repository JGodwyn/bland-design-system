import { useState, type HTMLAttributes, type ImgHTMLAttributes, type ReactNode } from 'react';
import { UserIcon } from '../../icons';
import { Icon } from '../icon/Icon';
import './avatar.css';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
export type AvatarType = 'image' | 'placeholder' | 'initials';

export interface AvatarProps extends HTMLAttributes<HTMLSpanElement> {
  /** Figma `Size`: avatar/* xs 16, sm 24, md 32 (default), lg 40, xl 48, 2xl 64, 3xl 80. */
  size?: AvatarSize;
  /**
   * Figma `Type`. Omit it to pick from what you pass: `src` gives image, `initials` gives initials, else placeholder.
   * An image that is missing or fails to load falls back to the initials, or to the placeholder without them.
   */
  type?: AvatarType;
  /** Image URL. */
  src?: string;
  /**
   * Accessible name, such as the person's name. Omit it when the name is shown next to the avatar,
   * so screen readers don't hear it twice; the avatar is then decorative.
   */
  alt?: string;
  /** Figma `✏️ Initials`. xs shows the first character only; other sizes show up to two. */
  initials?: string;
  /** Figma `🧩 Top slot`: top-right on the circle edge. Put a count Indicator here (lg and up). */
  topSlot?: ReactNode;
  /** Figma `🧩 Bottom slot`: bottom-right on the circle edge. Put a status Indicator here, with its ring on. */
  bottomSlot?: ReactNode;
  /** Props for the `<img>`, such as `srcSet`, `loading` or `referrerPolicy`. */
  imgProps?: Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt'>;
}

/** Shows a person or entity as an image, a placeholder icon or initials. Figma: Avatar page, set "Avatar". */
export function Avatar({
  size = 'md',
  type,
  src,
  alt,
  initials,
  topSlot,
  bottomSlot,
  imgProps,
  className,
  ...rest
}: AvatarProps) {
  // The failure is remembered with its src, so a new src gets a fresh try.
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  const letters = initials ? Array.from(initials.trim()).slice(0, size === 'xs' ? 1 : 2).join('') : '';
  const fallback: AvatarType = letters ? 'initials' : 'placeholder';
  const requested: AvatarType = type ?? (src ? 'image' : fallback);
  const shown: AvatarType = requested === 'image' && (!src || failedSrc === src) ? fallback : requested;
  const named = alt ? { role: 'img', 'aria-label': alt } : { 'aria-hidden': true };

  return (
    <span
      {...rest}
      className={`bland-avatar${className ? ` ${className}` : ''}`}
      data-size={size}
      data-type={shown}
    >
      {shown === 'image' ? (
        <span className="bland-avatar__inner">
          <img
            {...imgProps}
            className="bland-avatar__image"
            src={src}
            alt={alt ?? ''}
            onError={(event) => {
              setFailedSrc(src ?? null);
              imgProps?.onError?.(event);
            }}
          />
        </span>
      ) : (
        <span className="bland-avatar__inner" {...named}>
          {shown === 'initials' ? (
            <span className="bland-avatar__initials">{letters}</span>
          ) : (
            <Icon className="bland-avatar__icon">
              <UserIcon />
            </Icon>
          )}
        </span>
      )}
      {topSlot != null && topSlot !== false && (
        <span className="bland-avatar__slot" data-slot="top">
          {topSlot}
        </span>
      )}
      {bottomSlot != null && bottomSlot !== false && (
        <span className="bland-avatar__slot" data-slot="bottom">
          {bottomSlot}
        </span>
      )}
    </span>
  );
}
