import { useState, type ButtonHTMLAttributes, type MouseEvent, type ReactNode } from 'react';
import { Icon } from '../icon/Icon';
import { Indicator } from '../indicator/Indicator';
import './pills.css';

export type PillSize = 'sm' | 'md' | 'lg';

export interface PillProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  /** Figma `✏️ Label`. Leave it out (Figma `👀 Label` off) for an icon-only pill, and give it an `aria-label`. */
  children?: ReactNode;
  /** Figma `Size`. sm 32 (default, as in Figma), md 40, lg 48 high; never narrower than high. */
  size?: PillSize;
  /** Figma `Selected`, controlled. Sets `aria-pressed`. Leave it out to let the pill keep its own state. */
  selected?: boolean;
  /** Starting state when `selected` is left out. */
  defaultSelected?: boolean;
  /** Called with the new state when the pill is pressed. */
  onSelectedChange?: (selected: boolean) => void;
  /** Figma `🌟 Icon` (shown with `👀 Icon`): any SVG before the label, sized icon/md. */
  icon?: ReactNode;
  /**
   * Figma `👀 Number`: the count badge after the label. A number or string becomes an Indicator xl
   * secondary, brand when selected and neutral otherwise (and when disabled); any other node is shown as is.
   */
  count?: ReactNode;
  /** The native `type` attribute. Defaults to `button`, so a Pill inside a form never submits by accident. */
  htmlType?: 'button' | 'submit' | 'reset';
}

/** Selectable pill for filters and quick choices: a toggle button with `aria-pressed`. Figma: Pills page, set "Pills". */
export function Pill({
  children,
  size = 'sm',
  selected,
  defaultSelected = false,
  onSelectedChange,
  icon,
  count,
  htmlType = 'button',
  className,
  onClick,
  ...rest
}: PillProps) {
  const [own, setOwn] = useState(defaultSelected);
  const isSelected = selected ?? own;
  const hasCount = count !== undefined && count !== null && count !== false;
  const badge =
    typeof count === 'number' || typeof count === 'string' ? (
      <Indicator size="xl" type="secondary" emotion={isSelected && !rest.disabled ? 'brand' : 'neutral'}>
        {count}
      </Indicator>
    ) : (
      count
    );

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (event.defaultPrevented) return;
    if (selected === undefined) setOwn(!isSelected);
    onSelectedChange?.(!isSelected);
  };

  return (
    <button
      {...rest}
      type={htmlType}
      className={`bland-pill bland-focus-ring${className ? ` ${className}` : ''}`}
      data-size={size}
      aria-pressed={isSelected}
      onClick={handleClick}
    >
      {icon && <Icon className="bland-pill__icon">{icon}</Icon>}
      {children != null && children !== false && <span className="bland-pill__label">{children}</span>}
      {hasCount && <span className="bland-pill__count">{badge}</span>}
    </button>
  );
}
