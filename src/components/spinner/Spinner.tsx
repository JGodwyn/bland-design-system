import { useEffect, useState, type CSSProperties, type HTMLAttributes } from 'react';
import { SpinnerIcon } from '../../icons';
import './spinner.css';

export type SpinnerType = 'ring' | 'spokes';
export type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type SpinnerColor = 'default' | 'subtle' | 'brand' | 'on-color';
export type SpinnerLabelPlacement = 'start' | 'end' | 'bottom';

export interface SpinnerProps extends HTMLAttributes<HTMLSpanElement> {
  /** `ring` (default) turns; `spokes` stay put and fade in turn. */
  type?: SpinnerType;
  /**
   * xs 12, sm 16, md 20, lg 24 (icon sizes), xl 32 and 2xl 48 for a section or a page.
   * Omit it to take the icon size of the component around it (md on its own).
   */
  size?: SpinnerSize;
  /** `default` follows the text color around it; `subtle`, `brand`, or `on-color` on a brand fill. */
  color?: SpinnerColor;
  /** What it says. Read to screen readers, and shown when `showLabel` is on. Default "Loading". */
  label?: string;
  /** Show the label beside or under the spinner. Off by default: the label is then only for screen readers. */
  showLabel?: boolean;
  /** `end` puts the label after the spinner (default), `start` before it, `bottom` under it. */
  labelPlacement?: SpinnerLabelPlacement;
  /**
   * Hide it from screen readers, for a spinner inside something that already says it is loading
   * (an `aria-busy` region, a loading Button).
   */
  decorative?: boolean;
}

/** Eight spokes on the 20 grid, r 5 to 9, clockwise from the top (Figma `_spinner-spokes`). */
const spokes = Array.from({ length: 8 }, (_, i) => {
  const a = (i * Math.PI) / 4;
  const at = (r: number) => [10 + r * Math.sin(a), 10 - r * Math.cos(a)].map((n) => Math.round(n * 1000) / 1000);
  const [x1, y1] = at(5);
  const [x2, y2] = at(9);
  return { x1, y1, x2, y2 };
});

/**
 * A loading indicator for a section, a card or beside a label: a turning ring or fading spokes.
 * Tells screen readers "Loading" once, unless it is `decorative`.
 * Figma: Spinner page, set "Spinner".
 */
export function Spinner({
  type = 'ring',
  size,
  color = 'default',
  label = 'Loading',
  showLabel = false,
  labelPlacement = 'end',
  decorative = false,
  className,
  ...rest
}: SpinnerProps) {
  // A live region announces changes, not what it holds when it mounts, so the label goes in after the first paint.
  const [announced, setAnnounced] = useState(decorative ? label : '');
  useEffect(() => {
    if (decorative) {
      setAnnounced(label);
      return;
    }
    const frame = requestAnimationFrame(() => setAnnounced(label));
    return () => cancelAnimationFrame(frame);
  }, [decorative, label]);

  return (
    <span
      role={decorative ? undefined : 'status'}
      aria-hidden={decorative || undefined}
      {...rest}
      className={`bland-spinner${className ? ` ${className}` : ''}`}
      data-type={type}
      data-size={size}
      data-color={color}
      data-label-placement={labelPlacement}
      data-show-label={showLabel || undefined}
    >
      {type === 'ring' ? (
        <SpinnerIcon className="bland-spinner__mark" aria-hidden />
      ) : (
        <svg className="bland-spinner__mark" viewBox="0 0 20 20" fill="none" stroke="currentColor" aria-hidden>
          {spokes.map((s, i) => (
            <line
              key={i}
              {...s}
              className="bland-spinner__spoke"
              strokeWidth={2}
              strokeLinecap="round"
              style={{ '--_i': i } as CSSProperties}
            />
          ))}
        </svg>
      )}
      {(showLabel || !decorative) && <span className="bland-spinner__label">{announced}</span>}
    </span>
  );
}
