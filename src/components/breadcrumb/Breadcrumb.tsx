import { useRef, type HTMLAttributes, type ReactNode } from 'react';
import { CaretRightIcon } from '../../icons';
import { Icon } from '../icon/Icon';
import { Menu } from '../menu/Menu';
import './breadcrumb.css';

/** One page in the trail. The last item is the current page. */
export interface BreadcrumbItem {
  /** The page name. Also the accessible name when the label is hidden. */
  label: string;
  /** The page's URL. Ignored on the last item, the current page, which is never a link. */
  href?: string;
  /** Any SVG before the label. */
  icon?: ReactNode;
  /** Show the icon alone; the label stays as its accessible name. Needs `icon`. */
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
  /** The trail from the top level down to the current page (the last item). */
  items: BreadcrumbItem[];
  /**
   * Collapse the trail when it has more items than this: the first item and the last two stay, and an
   * overflow crumb (…) stands in for the middle. Pressing it opens a Menu of the hidden crumbs; choosing one
   * follows its link. Omit it to show every item.
   */
  maxItems?: number;
  /**
   * Renders each ancestor link, so any router works: `(props, item) => <Link to={props.href} className={props.className}>{props.children}</Link>`.
   * Defaults to a plain `<a>`. The hidden crumbs' links are rendered too, out of sight, and a menu choice clicks
   * the matching one, so your router handles it like any other crumb.
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
  const hiddenRef = useRef<HTMLSpanElement>(null);
  const collapsed = maxItems !== undefined && items.length > maxItems && items.length > 3;

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

  // The middle crumbs, items[1] to items[length - 3], hidden behind the overflow crumb.
  const hidden = items.slice(1, -2);

  // A menu item is not a link, so choosing one clicks that crumb's real link (rendered out of sight below):
  // a plain <a> navigates, a router's link runs its own handler.
  const follow = (id: string) => {
    hiddenRef.current?.querySelector<HTMLElement>(`[data-crumb="${id}"] > *`)?.click();
  };

  return (
    <nav {...rest} aria-label={ariaLabel} className={`bland-breadcrumb${className ? ` ${className}` : ''}`}>
      <ol className="bland-breadcrumb__list">
        {collapsed ? (
          <>
            {crumb(items[0]!, 0)}
            <li className="bland-breadcrumb__item">
              <Menu
                items={hidden.map((item, i) => ({
                  id: String(i + 1),
                  label: item.label,
                  leading: item.icon ? <Icon>{item.icon}</Icon> : undefined,
                }))}
                onAction={follow}
              >
                <button
                  type="button"
                  className="bland-breadcrumb__crumb bland-breadcrumb__overflow bland-focus-ring bland-smooth"
                  aria-label={`${overflowLabel} (${hidden.length})`}
                >
                  <span aria-hidden="true">…</span>
                </button>
              </Menu>
              {separator}
              <span ref={hiddenRef} hidden>
                {hidden.map((item, i) => (
                  <span key={i} data-crumb={i + 1}>
                    {renderLink({ href: item.href ?? '', className: linkClass, children: item.label }, item)}
                  </span>
                ))}
              </span>
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
