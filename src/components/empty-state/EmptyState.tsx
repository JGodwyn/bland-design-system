import type { HTMLAttributes, ReactNode } from 'react';
import './empty-state.css';

export type EmptyStateSize = 'sm' | 'lg';
/** The element the title renders as. Pick the level that fits the page's heading outline. */
export type EmptyStateTitleAs = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p';

export interface EmptyStateProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title' | 'children'> {
  /** sm for cards, panels and table bodies; lg for full pages. */
  size?: EmptyStateSize;
  /** Short, says what is empty. */
  title: ReactNode;
  /**
   * The title's element. Defaults to `h2`; set the level that fits where the empty state sits
   * (an `h3` inside a panel under an `h2`), or `p` when the view already has its heading.
   */
  titleAs?: EmptyStateTitleAs;
  /** One or two lines on how to fill the space. */
  description?: ReactNode;
  /**
   * Any node (an image, an SVG, an icon), centered above
   * the title and drawn as is, so the project sizes and colors it. Omit it for none: Bland ships no
   * default. Usually decorative: give an image an
   * empty `alt` and an icon no label, since the title carries the meaning.
   */
  illustration?: ReactNode;
  /** Up to two Buttons, primary first, stacked at full width. */
  actions?: ReactNode;
}

/**
 * Shows that a view, list or panel has no content yet and what the user can do next. Takes no focus
 * itself; only its actions do. Figma: Empty State page, set "Empty-state".
 */
export function EmptyState({
  size = 'sm',
  title,
  titleAs: Title = 'h2',
  description,
  illustration,
  actions,
  className,
  ...rest
}: EmptyStateProps) {
  return (
    <div {...rest} className={`bland-empty-state${className ? ` ${className}` : ''}`} data-size={size}>
      {illustration != null && illustration !== false && <div className="bland-empty-state__illustration">{illustration}</div>}
      <div className="bland-empty-state__text">
        <Title className="bland-empty-state__title">{title}</Title>
        {description != null && <div className="bland-empty-state__description">{description}</div>}
      </div>
      {actions != null && <div className="bland-empty-state__actions">{actions}</div>}
    </div>
  );
}
