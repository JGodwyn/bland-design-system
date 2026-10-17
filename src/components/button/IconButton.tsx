import type { ReactNode } from 'react';
import { Icon } from '../icon/Icon';
import { ButtonSpinner, guardLoading, type ButtonBaseProps } from './Button';
import './button.css';

export interface IconButtonProps extends ButtonBaseProps {
  /** Figma `🌟 Icon`: any SVG, sized and colored by the button. */
  icon: ReactNode;
  /** Accessible name. Required: an Icon Button has no visible label. */
  'aria-label': string;
  /** Swaps the icon to the spinner, sets `aria-busy`, and ignores clicks until loading ends. */
  loading?: boolean;
}

/** A square button with one icon and no label. Figma: Buttons page, set "Icon Button". */
export function IconButton({
  icon,
  size = 'md',
  emotion = 'brand',
  type = 'primary',
  htmlType = 'button',
  loading = false,
  className,
  onClick,
  ...rest
}: IconButtonProps) {
  return (
    <button
      {...rest}
      type={htmlType}
      className={`bland-button bland-icon-button bland-focus-ring bland-smooth${className ? ` ${className}` : ''}`}
      data-size={size}
      data-emotion={emotion}
      data-type={type}
      aria-busy={loading ? true : undefined}
      onClick={guardLoading(loading, onClick)}
    >
      {loading ? <ButtonSpinner /> : <Icon className="bland-button__icon">{icon}</Icon>}
    </button>
  );
}
