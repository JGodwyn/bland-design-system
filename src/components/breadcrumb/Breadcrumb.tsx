import { useEffect, useRef, useState, type HTMLAttributes, type ReactNode } from 'react';
import { CaretRightIcon } from '../../icons';
import { Icon } from '../icon/Icon';
import './breadcrumb.css';

/** One page in the trail. The last item is the current page. */
export interface BreadcrumbItem {
  /** Figma `✏️ Label`: the page name. Also the accessible name when the label is hidden. */
  label: string;
  /** The page's URL. Ignored on the last item, the current page, which is never a link. */
  href?: string;
  /** Figma `🌟 Icon` (`👀 Icon` on): any SVG before the label, sized icon/md. */
  icon?: ReactNode;
  /** Figma `👀 Label` off: show the icon alone; the label stays as its accessible name. Needs `icon`. */
  hideLabel?: boolean;
}

/** What `renderLink` receives: spread it onto your router's link. */
export interface BreadcrumbLinkProps {
  href: string;
  /** Bland's link classes (look, hover and focus ring). Keep them on the rendered element. */
  className: string;
  children: ReactNode;
}

export interface BreadcrumbProps extends HTMLAttributes<HTMLElement> {
  /** The trail from the top level down to the current page (the last item). Figma `Crumbs` is its length. */
  items: BreadcrumbItem[];
  /**
   * Collapse the trail when it has more items than this: the first item and the last two stay, and an
   * overflow crumb (…) stands in for the middle. Pressing it shows the hidden crumbs in place. Omit it to
   * show every item.
   */
  maxItems?: number;
  /**
   * Renders each ancestor link, so any router works: `(props, item) => <Link to={props.href} className={props.className}>{props.children}</Link>`.
   * Defaults to a plain `<a>`.
   */
  renderLink?: (props: BreadcrumbLinkProps, item: BreadcrumbItem) => ReactNode;
  /** Accessible name of the overflow crumb. */
  overflowLabel?: string;
}

const linkClass = 'bland-breadcrumb__crumb bland-breadcrumb__link bland-focus-ring bland-smooth';
const defaultLink = (props: BreadcrumbLinkProps) => <a {...props} />;

/** Where the current page sits in the site hierarchy. Figma: Breadcrumbs page, set "Breadcrumb". */
export function Breadcrumb({
  items,
  maxItems,
  renderLink = defaultLink,
  overflowLabel = 'Show hidden pages',
  className,
  'aria-label': ariaLabel = 'Breadcrumb',
  ...rest
}: BreadcrumbProps) {
  const [expanded, setExpanded] = useState(false);
  const listRef = useRef<HTMLOListElement>(null);
  const revealed = useRef(false);
  const collapsed = !expanded && maxItems !== undefined && items.length > maxItems && items.length > 3;

  // After the overflow crumb reveals the middle, focus goes to the first crumb it hid, not to the page.
  useEffect(() => {
    if (!expanded || revealed.current) return;
    revealed.current = true;
    listRef.current?.querySelector<HTMLElement>('li:nth-child(2) .bland-breadcrumb__link')?.focus();
  }, [expanded]);

  const separator = (
    <Icon className="bland-breadcrumb__separator">
      <CaretRightIcon />
    </Icon>
  );

  const content = (item: BreadcrumbItem) => (
    <>
      {item.icon && (
        <Icon className="bland-breadcrumb__icon" label={item.hideLabel ? item.label : undefined}>
          {item.icon}
        </Icon>
      )}
      {!(item.hideLabel && item.icon) && <span className="bland-breadcrumb__label">{item.label}</span>}
    </>
  );

  const crumb = (item: BreadcrumbItem, index: number) => {
    const current = index === items.length - 1;
    return (
      <li key={index} className="bland-breadcrumb__item">
        {current ? (
          <span className="bland-breadcrumb__crumb bland-breadcrumb__current bland-smooth" aria-current="page">
            {content(item)}
          </span>
        ) : (
          <>
            {renderLink({ href: item.href ?? '', className: linkClass, children: content(item) }, item)}
            {separator}
          </>
        )}
      </li>
    );
  };

  const hidden = items.length - 3;

  return (
    <nav {...rest} aria-label={ariaLabel} className={`bland-breadcrumb${className ? ` ${className}` : ''}`}>
      <ol ref={listRef} className="bland-breadcrumb__list">
        {collapsed ? (
          <>
            {crumb(items[0]!, 0)}
            <li className="bland-breadcrumb__item">
              <button
                type="button"
                className="bland-breadcrumb__crumb bland-breadcrumb__overflow bland-focus-ring bland-smooth"
                aria-label={`${overflowLabel} (${hidden})`}
                onClick={() => setExpanded(true)}
              >
                <span aria-hidden="true">…</span>
              </button>
              {separator}
            </li>
            {items.slice(-2).map((item, i) => crumb(item, items.length - 2 + i))}
          </>
        ) : (
          items.map(crumb)
        )}
      </ol>
    </nav>
  );
}
