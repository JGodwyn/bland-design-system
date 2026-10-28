import type { HTMLAttributes, MouseEvent, ReactNode } from 'react';
import './logo.css';

export type LogoSize = 'lg' | 'sm';
export type LogoColor = 'default' | 'on-color';

/** What `renderLink` receives: spread it onto your router's link. */
export interface LogoLinkProps {
  href: string;
  /** Bland's link classes (look and focus ring). Keep them on the rendered element. */
  className: string;
  'data-size': LogoSize;
  'data-color': LogoColor;
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
  children: ReactNode;
}

export interface LogoProps extends Omit<HTMLAttributes<HTMLElement>, 'color'> {
  /** lg (40 tall) or sm (24 tall, for top bars). */
  size?: LogoSize;
  /**
   * default is text-bold and follows the theme; on-color is white in both, for brand fills. Put it on
   * `--surface-brand-strong`: `--surface-brand` lightens in dark, where white on it is 2.7:1.
   */
  color?: LogoColor;
  /**
   * A project logomark before the wordmark, any image or SVG, drawn in a
   * square the height of the logo. Decorative: the wordmark names the product, so the mark is hidden from screen readers.
   */
  mark?: ReactNode;
  /** The wordmark. Defaults to "Bland"; set a project's product name. */
  children?: ReactNode;
  /** Makes the logo a link, usually to the home page, with Bland's focus ring. */
  href?: string;
  /**
   * Renders the link when `href` is set, so any router works: `(props) => <Link to={props.href}
   * className={props.className}>{props.children}</Link>`. Defaults to a plain `<a>`.
   */
  renderLink?: (props: LogoLinkProps) => ReactNode;
}

const defaultLink = (props: LogoLinkProps) => <a {...props} />;

/**
 * The Bland wordmark, with an optional project logomark before it. A static `<span>`, or the home link with
 * `href`. Figma: Brand elements page, set "Logo".
 */
export function Logo({
  size = 'lg',
  color = 'default',
  mark,
  children = 'Bland',
  href,
  renderLink = defaultLink,
  className,
  onClick,
  ...rest
}: LogoProps) {
  const content = (
    <>
      {mark != null && mark !== false && (
        <span className="bland-logo__mark" aria-hidden>
          {mark}
        </span>
      )}
      <span className="bland-logo__wordmark">{children}</span>
    </>
  );
  if (href !== undefined) {
    return renderLink({
      ...(rest as HTMLAttributes<HTMLAnchorElement>),
      href,
      className: `bland-logo bland-logo--link bland-focus-ring bland-smooth${className ? ` ${className}` : ''}`,
      'data-size': size,
      'data-color': color,
      onClick: onClick as LogoLinkProps['onClick'],
      children: content,
    });
  }
  return (
    <span {...rest} onClick={onClick} className={`bland-logo${className ? ` ${className}` : ''}`} data-size={size} data-color={color}>
      {content}
    </span>
  );
}
