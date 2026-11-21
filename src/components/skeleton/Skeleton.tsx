import { useEffect, useState, type CSSProperties, type HTMLAttributes, type ReactNode } from 'react';
import './skeleton.css';

export type SkeletonShape = 'text' | 'circle' | 'rect';
/** The text style a text skeleton stands in for (the `--type-*` composites). */
export type SkeletonTextType =
  | 'display-lg'
  | 'display-md'
  | 'display-sm'
  | 'heading-lg'
  | 'heading-md'
  | 'heading-sm'
  | 'title-lg'
  | 'title-md'
  | 'title-sm'
  | 'body-lg'
  | 'body-md'
  | 'body-sm'
  | 'code-body-lg'
  | 'code-body-md'
  | 'code-body-sm';
export type SkeletonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
export type SkeletonRadius = 'null' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface SkeletonProps extends HTMLAttributes<HTMLSpanElement> {
  /** `text` lines (default), a `circle` for an avatar, or a `rect` for an image or card. */
  shape?: SkeletonShape;
  /**
   * Text only: the text style it stands in for (default `body-md`). Each line is that style's line height and
   * the bar is its font size, so the real text takes the same space.
   */
  type?: SkeletonTextType;
  /** Text only: how many lines (default 1). The last of several is 60% wide. */
  lines?: number;
  /** Circle only: the Avatar size it stands in for, xs 16 to 3xl 80 (default `md`, 32). */
  size?: SkeletonSize;
  /**
   * Rect only: corner radius from the rad-* scale (default `md`). The rect fills its container's width and is
   * 16:9 until you give it a height or an aspect-ratio.
   */
  radius?: SkeletonRadius;
}

/**
 * A loading placeholder that holds the space of text, an avatar or an image until the content arrives.
 * Hidden from screen readers: wrap the loading region in SkeletonGroup, which announces it once.
 * Figma: Skeleton page, sets "Skeleton-text", "Skeleton-circle", "Skeleton-rectangle".
 */
export function Skeleton({
  shape = 'text',
  type = 'body-md',
  lines = 1,
  size = 'md',
  radius = 'md',
  className,
  style,
  ...rest
}: SkeletonProps) {
  const classes = `bland-skeleton${className ? ` ${className}` : ''}`;

  if (shape === 'circle') {
    return <span {...rest} aria-hidden className={classes} style={style} data-shape="circle" data-size={size} />;
  }

  if (shape === 'rect') {
    return (
      <span
        {...rest}
        aria-hidden
        className={`${classes} bland-smooth`}
        style={style}
        data-shape="rect"
        data-radius={radius}
      />
    );
  }

  const count = Math.max(1, Math.floor(lines));
  return (
    <span
      {...rest}
      aria-hidden
      className={classes}
      // The text style is a token per type; set inline so every style works without a rule each.
      style={{ font: `var(--type-${type})`, ...style } as CSSProperties}
      data-shape="text"
      data-type={type}
    >
      {Array.from({ length: count }, (_, i) => (
        <span key={i} className="bland-skeleton__line">
          <span className="bland-skeleton__bar bland-smooth" />
        </span>
      ))}
    </span>
  );
}

export interface SkeletonGroupProps extends HTMLAttributes<HTMLDivElement> {
  /** While true (default) the region is `aria-busy` and announces `label` once. Set it false when the content is in. */
  loading?: boolean;
  /** Announced politely to screen readers while loading. Default "Loading". */
  label?: string;
  /** The skeletons while loading, the real content after. */
  children?: ReactNode;
}

/**
 * The region that is loading: sets `aria-busy` and announces one polite "Loading", so a screen reader hears it once
 * instead of once per skeleton.
 */
export function SkeletonGroup({ loading = true, label = 'Loading', className, children, ...rest }: SkeletonGroupProps) {
  // A live region announces changes, not what it holds when it mounts, so the label goes in after the first paint.
  const [announced, setAnnounced] = useState('');
  useEffect(() => {
    if (!loading) {
      setAnnounced('');
      return;
    }
    const frame = requestAnimationFrame(() => setAnnounced(label));
    return () => cancelAnimationFrame(frame);
  }, [loading, label]);

  return (
    <div {...rest} className={`bland-skeleton-group${className ? ` ${className}` : ''}`} aria-busy={loading}>
      <span className="bland-skeleton-group__status" role="status">
        {announced}
      </span>
      {children}
    </div>
  );
}
