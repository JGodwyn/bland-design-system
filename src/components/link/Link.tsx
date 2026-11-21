import type { AnchorHTMLAttributes, ReactNode, Ref } from 'react';
import { ArrowUpRightIcon } from '../../icons';
import { Icon } from '../icon/Icon';
import './link.css';

export type LinkSize = 'sm' | 'md' | 'lg';
export type LinkUnderline = 'always' | 'hover';
export type LinkColor = 'link' | 'inherit';

/** What `renderLink` receives: spread all of it onto your router's link. */
export interface LinkRenderProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  /** Bland's link classes (look, hover and focus ring). Keep them on the rendered element. */
  className: string;
  'data-size'?: LinkSize;
  'data-underline': LinkUnderline;
  'data-color': LinkColor;
  ref?: Ref<HTMLAnchorElement>;
  children: ReactNode;
}

export interface LinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'color'> {
  /** Where the link goes. */
  href: string;
  /** The link text. */
  children: ReactNode;
  /**
   * sm, md or lg set body-sm, body-md or body-lg, for a link on its own. Omit it inside running text: the link
   * takes the font of the text around it.
   */
  size?: LinkSize;
  /**
   * always (the default) underlines the link at rest, so color is not the only cue in running text; hover
   * underlines it only under the pointer, for links on their own and lists of links.
   */
  underline?: LinkUnderline;
  /** link is the brand link color; inherit takes the color of the text around it (footers, legal text, brand fills). */
  color?: LinkColor;
  /** Any SVG before the text, sized to the text and in the link's color. */
  iconStart?: ReactNode;
  /** Any SVG after the text. It stays on the same line as the last word. */
  iconEnd?: ReactNode;
  /**
   * Show the external mark (an arrow up and right) and tell screen readers the link opens a new tab. On by
   * itself with `target="_blank"`; `false` turns it off.
   */
  external?: boolean;
  /** What screen readers hear after the text of an external link. */
  newTabLabel?: string;
  /**
   * Renders the link, so any router works: `(props) => <RouterLink to={props.href} {...props} />`. It gets every
   * prop the `<a>` would, `className` and the `data-*` attributes included; keep them all. Defaults to a plain `<a>`.
   */
  renderLink?: (props: LinkRenderProps) => ReactNode;
  ref?: Ref<HTMLAnchorElement>;
}

const defaultLink = (props: LinkRenderProps) => <a {...props} />;
// A word joiner keeps an icon on the same line as the word beside it. It sits in an aria-hidden span with the
// icon, so it never reaches the accessible name.
const JOIN = '⁠';

/** A text link, in running text or on its own. Figma: Link page, set "Link". */
export function Link({
  href,
  children,
  size,
  underline = 'always',
  color = 'link',
  iconStart,
  iconEnd,
  external,
  newTabLabel = 'opens in a new tab',
  renderLink = defaultLink,
  className,
  target,
  ...rest
}: LinkProps) {
  const showExternal = external ?? target === '_blank';
  return renderLink({
    ...rest,
    href,
    target,
    className: `bland-link bland-focus-ring bland-smooth${className ? ` ${className}` : ''}`,
    'data-size': size,
    'data-underline': underline,
    'data-color': color,
    children: (
      <>
        {iconStart != null && iconStart !== false && (
          <span className="bland-link__start" aria-hidden="true">
            <Icon className="bland-link__icon bland-link__icon--start">{iconStart}</Icon>
            {JOIN}
          </span>
        )}
        {children}
        {(iconEnd != null && iconEnd !== false) || showExternal ? (
          <span className="bland-link__end" aria-hidden="true">
            {JOIN}
            {iconEnd != null && iconEnd !== false && <Icon className="bland-link__icon bland-link__icon--end">{iconEnd}</Icon>}
            {showExternal && (
              <Icon className="bland-link__icon bland-link__icon--end bland-link__external">
                <ArrowUpRightIcon />
              </Icon>
            )}
          </span>
        ) : null}
        {showExternal && <span className="bland-link__hidden"> ({newTabLabel})</span>}
      </>
    ),
  });
}
