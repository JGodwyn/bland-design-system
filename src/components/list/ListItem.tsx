import type { LiHTMLAttributes, MouseEventHandler, ReactNode } from 'react';
import './list.css';

export type ListItemLines = '2' | '3+';

/** What `renderLink` receives: spread it onto your router's link. */
export interface ListItemLinkProps {
  href: string;
  /** Bland's row classes (look, hover, pressed and focus ring). Keep them on the rendered element. */
  className: string;
  onClick?: MouseEventHandler<HTMLElement>;
  children: ReactNode;
}

export interface ListItemProps extends Omit<LiHTMLAttributes<HTMLLIElement>, 'title' | 'onClick'> {
  /** Figma `✏️ Title`: one line, ending in an ellipsis when it does not fit. */
  title: ReactNode;
  /** Figma `✏️ Description`, under the title. Without one the row is Figma's `Lines=1`. */
  description?: ReactNode;
  /** Figma `Lines` for a row with a description. `2` (default): the description is one line with an ellipsis. `3+`: it wraps onto as many lines as it needs. */
  lines?: ListItemLines;
  /** Figma `✏️ Alt text` (`👀 Alt text`): a short value on the right of the title, such as a time. Never truncated; the title gives way. */
  altText?: ReactNode;
  /** Figma `🧩 Leading` (`👀 Leading`): an Avatar, an `<Icon>` or a coin, in a list/slot-sm (24) box on 1 line rows and list/slot-lg (40) otherwise. */
  leading?: ReactNode;
  /** Figma `🧩 Trailing` (`👀 Trailing`): hugs its content, such as a value, a Badge, a Toggle or a Checkbox. On a row with `href` or `onClick`, keep it non-interactive. */
  trailing?: ReactNode;
  /** Figma `Flush`: no resting fill and no radius, so rows sit edge to edge inside a container. */
  flush?: boolean;
  /** Makes the whole row a link (Figma's hover and pressed fills, focusable). Rendered as `<a>` unless `renderLink` is given. */
  href?: string;
  /** Makes the whole row a button (Figma's hover and pressed fills, focusable). */
  onClick?: MouseEventHandler<HTMLElement>;
  /** Figma `State=disabled`: muted text; a button row is natively disabled and a link row loses its `href`. */
  disabled?: boolean;
  /** Renders a link row with the project's router link. Default: a plain `<a>`. */
  renderLink?: (props: ListItemLinkProps) => ReactNode;
}

const defaultLink = (props: ListItemLinkProps) => <a {...props} />;

/**
 * Row for lists, menus and settings: a title, an optional description, a leading and a trailing slot. An `<li>`, so
 * put rows inside a `<ul>` or `<ol>`. With `href` or `onClick` the whole row is one link or button; without them it is
 * a plain row, which is the one to use when the trailing slot holds its own control (a Toggle, a Checkbox), so
 * controls are never nested inside a button. Figma: Lists page, set "List".
 */
export function ListItem({
  title,
  description,
  lines = '2',
  altText,
  leading,
  trailing,
  flush = false,
  href,
  onClick,
  disabled = false,
  renderLink = defaultLink,
  className,
  ...rest
}: ListItemProps) {
  const hasDescription = description != null && description !== false;
  const rowClass = 'bland-list-item__row bland-smooth';
  const header = (
    <span className="bland-list-item__header">
      <span className="bland-list-item__title">{title}</span>
      {altText != null && altText !== false && <span className="bland-list-item__alt">{altText}</span>}
    </span>
  );
  const content = (
    <>
      {leading != null && leading !== false && <span className="bland-list-item__leading">{leading}</span>}
      {hasDescription ? (
        <span className="bland-list-item__text">
          {header}
          <span className="bland-list-item__description">{description}</span>
        </span>
      ) : (
        header
      )}
      {trailing != null && trailing !== false && <span className="bland-list-item__trailing">{trailing}</span>}
    </>
  );

  let row: ReactNode;
  if (href !== undefined && !disabled) {
    row = renderLink({ href, className: `${rowClass} bland-focus-ring`, onClick, children: content });
  } else if (href !== undefined) {
    // A disabled link has no href, so it is neither focusable nor followed.
    row = (
      <a className={`${rowClass} bland-focus-ring`} aria-disabled="true">
        {content}
      </a>
    );
  } else if (onClick) {
    row = (
      <button type="button" className={`${rowClass} bland-focus-ring`} disabled={disabled} onClick={onClick}>
        {content}
      </button>
    );
  } else {
    row = <div className={rowClass}>{content}</div>;
  }

  return (
    <li
      {...rest}
      className={`bland-list-item${className ? ` ${className}` : ''}`}
      data-lines={hasDescription ? lines : '1'}
      data-flush={flush || undefined}
      data-disabled={disabled || undefined}
    >
      {row}
    </li>
  );
}
