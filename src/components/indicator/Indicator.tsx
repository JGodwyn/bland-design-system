import type { HTMLAttributes, ReactNode } from 'react';
import './indicator.css';

export type IndicatorSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type IndicatorEmotion = 'brand' | 'neutral' | 'success' | 'danger' | 'warning';
export type IndicatorType = 'primary' | 'secondary';

export interface IndicatorProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  /** sm 8 and md 12 are dots; lg 16, xl 20 and 2xl 24 hold a label and grow into a pill. */
  size?: IndicatorSize;
  /** The color family. */
  emotion?: IndicatorEmotion;
  /** primary is a solid fill, secondary a soft tint. */
  type?: IndicatorType;
  /**
   * Usually a count. Shown at lg and up; sm and md are dots and ignore it.
   * Omit it for an empty circle.
   */
  children?: ReactNode;
  /**
   * A 2px surface-100 outline that separates the Indicator from an Avatar or image under it.
   * Off by default, since the set description says to turn it on only there.
   */
  ring?: boolean;
}

const labelled: IndicatorSize[] = ['lg', 'xl', '2xl'];

/**
 * Status dot or count. Static, not interactive. Figma: Badges page, set "Indicator".
 * A dot that carries meaning on its own needs an `aria-label`; it then gets `role="img"`.
 */
export function Indicator({
  size = 'sm',
  emotion = 'brand',
  type = 'primary',
  children,
  ring = false,
  className,
  ...rest
}: IndicatorProps) {
  const label = labelled.includes(size) && children != null && children !== false ? children : null;

  return (
    <span
      role={label == null && rest['aria-label'] ? 'img' : undefined}
      {...rest}
      className={`bland-indicator${className ? ` ${className}` : ''}`}
      data-size={size}
      data-emotion={emotion}
      data-type={type}
      data-ring={ring || undefined}
    >
      {label != null && <span className="bland-indicator__label">{label}</span>}
    </span>
  );
}
