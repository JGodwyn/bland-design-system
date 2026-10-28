import type { HTMLAttributes, MouseEvent, ReactNode } from 'react';
import { XIcon } from '../../icons';
import { Icon } from '../icon/Icon';
import './chip.css';

export type ChipSize = 'sm' | 'md' | 'lg';

export interface ChipProps extends HTMLAttributes<HTMLSpanElement> {
  /** The value, filter or attribute. Truncates with an ellipsis. */
  children: ReactNode;
  /** sm 20 (default), md 24, lg 32 high. */
  size?: ChipSize;
  /** One leading Avatar or Indicator. */
  leading?: ReactNode;
  /**
   * The number in the count box after the label.
   * Takes a number or any node.
   */
  count?: ReactNode;
  /**
   * Shows the close button and is called when it is pressed.
   * The chip does not hide itself; remove it from your list here.
   */
  onRemove?: (event: MouseEvent<HTMLButtonElement>) => void;
  /** Accessible name of the close button. Defaults to "Remove <label>" when the label is a string, else "Remove". */
  removeLabel?: string;
}

/** Compact label for a value, filter or attribute, optionally with a count or a close button. Figma: Chip page, set "Chip". */
export function Chip({
  children,
  size = 'sm',
  leading,
  count,
  onRemove,
  removeLabel,
  className,
  ...rest
}: ChipProps) {
  const hasCount = count !== undefined && count !== null && count !== false;
  const type = onRemove ? 'cancellable' : hasCount ? 'countable' : 'default';
  const name = removeLabel ?? (typeof children === 'string' || typeof children === 'number' ? `Remove ${children}` : 'Remove');

  return (
    <span {...rest} className={`bland-chip bland-smooth${className ? ` ${className}` : ''}`} data-size={size} data-type={type}>
      {leading != null && <span className="bland-chip__leading">{leading}</span>}
      <span className="bland-chip__label">{children}</span>
      {hasCount && <span className="bland-chip__count bland-smooth">{count}</span>}
      {onRemove && (
        <button
          type="button"
          className="bland-chip__close bland-focus-ring bland-smooth"
          aria-label={name}
          onClick={onRemove}
        >
          <Icon className="bland-chip__close-icon">
            <XIcon />
          </Icon>
        </button>
      )}
    </span>
  );
}
