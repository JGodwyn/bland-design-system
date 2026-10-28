import type { HTMLAttributes, ReactNode } from 'react';
import './icon.css';

export type IconSize = 'xs' | 'sm' | 'md' | 'lg';

export interface IconProps extends HTMLAttributes<HTMLSpanElement> {
  /** Any SVG element: Bland's own icons or any icon pack. */
  children: ReactNode;
  /** xs 12, sm 16, md 20, lg 24. Omit it to take the size the parent component sets. */
  size?: IconSize;
  /** Accessible name. Omit it for a decorative icon next to a text label. */
  label?: string;
}

/** Sizes and colors one icon. Decorative unless it gets a label. */
export function Icon({ children, size, label, className, ...rest }: IconProps) {
  return (
    <span
      {...rest}
      className={className ? `bland-icon ${className}` : 'bland-icon'}
      data-size={size}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {children}
    </span>
  );
}
