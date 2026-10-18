import type { HTMLAttributes, ReactNode } from 'react';
import { Icon } from '../icon/Icon';
import './badge.css';

export type BadgeSize = 'sm' | 'md' | 'lg' | 'xl';
export type BadgeEmotion = 'brand' | 'neutral' | 'success' | 'danger' | 'warning';
export type BadgeType = 'primary' | 'secondary' | 'outline';

interface BadgeBaseProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  /** Figma `Emotion`: the color family. */
  emotion?: BadgeEmotion;
  /** Figma `Type`: primary is a solid fill, secondary a soft tint, outline a border only. */
  type?: BadgeType;
}

export interface BadgeLabelProps extends BadgeBaseProps {
  /** Figma `Size`: sm 16 (default), md 20, lg 24, xl 32. */
  size?: BadgeSize;
  /** Figma `✏️ Label`. */
  children: ReactNode;
  /** Figma `🌟 Leading icon` (shown with `👀 Leading icon`): any SVG, sized and colored by the badge. */
  iconStart?: ReactNode;
  /** Figma `🌟 Trailing icon` (shown with `👀 Trailing icon`). */
  iconEnd?: ReactNode;
  icon?: never;
}

export interface BadgeIconOnlyProps extends BadgeBaseProps {
  /** Icon only starts at md (its default), since a 12px icon in a 16px circle is too small to read. */
  size?: Exclude<BadgeSize, 'sm'>;
  /** Figma `Icon only`: a circle holding this icon and no label. */
  icon: ReactNode;
  /** Required for an icon-only badge: what the icon means. */
  'aria-label': string;
  children?: never;
  iconStart?: never;
  iconEnd?: never;
}

export type BadgeProps = BadgeLabelProps | BadgeIconOnlyProps;

/**
 * Labels a status, category or count next to content. Static, not interactive.
 * Figma: Badges page, set "Badge". For a dot or a count on an avatar, use Indicator.
 */
export function Badge({
  size,
  emotion = 'brand',
  type = 'primary',
  children,
  icon,
  iconStart,
  iconEnd,
  className,
  ...rest
}: BadgeProps) {
  const iconOnly = icon != null;
  const slot = (node: ReactNode) => (node ? <Icon className="bland-badge__icon">{node}</Icon> : null);

  return (
    <span
      role={iconOnly ? 'img' : undefined}
      {...rest}
      className={`bland-badge${className ? ` ${className}` : ''}`}
      data-size={size ?? (iconOnly ? 'md' : 'sm')}
      data-emotion={emotion}
      data-type={type}
      data-icon-only={iconOnly || undefined}
    >
      {iconOnly ? (
        slot(icon)
      ) : (
        <>
          {slot(iconStart)}
          <span className="bland-badge__label">{children}</span>
          {slot(iconEnd)}
        </>
      )}
    </span>
  );
}
