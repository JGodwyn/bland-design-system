import { useState, type HTMLAttributes, type MouseEvent, type ReactNode } from 'react';
import { VisuallyHidden } from 'react-aria';
import { Icon } from '../icon/Icon';
import { Indicator } from '../indicator/Indicator';
import './tab-bar.css';

/** One destination (Figma `_tab-bar-item`). */
export interface TabBarItem {
  /** Unique key: compared with the bar's `current`. */
  id: string;
  /** Also the accessible name when the label is hidden. */
  label: string;
  /** Any SVG, sized icon/lg. */
  icon: ReactNode;
  /** The destination's URL. */
  href: string;
  /** Show the icon alone; `label` stays as its accessible name. */
  hideLabel?: boolean;
  /**
   * A small danger dot with a ring on the icon, for new activity. `true` shows it; a string
   * shows it and is read out after the label ("Inbox, new messages").
   */
  indicator?: boolean | string;
}

/** What `renderLink` receives: spread it onto your router's link. */
export interface TabBarLinkProps {
  href: string;
  /** Bland's link classes (look and focus ring). Keep them on the rendered element. */
  className: string;
  /** `"page"` on the current destination. */
  'aria-current'?: 'page';
  /** The label plus the indicator's note, when the item has one. */
  'aria-label'?: string;
  /** Makes the item current when pressed. Keep it on the rendered element. */
  onClick: (event: MouseEvent<HTMLElement>) => void;
  children: ReactNode;
}

export interface TabBarProps extends HTMLAttributes<HTMLElement> {
  /** The destinations, 2 to 5. They share the width equally. */
  items: TabBarItem[];
  /**
   * The `id` of the page the user is on, controlled: it gets `aria-current="page"`. Pair it
   * with `onCurrentChange`, or set it from your router.
   */
  current?: string;
  /** The current item at first, when `current` is left out. Defaults to the first item. */
  defaultCurrent?: string;
  /** Called with an item's `id` when it is pressed, before the link is followed. */
  onCurrentChange?: (id: string) => void;
  /**
   * Renders each link, so any router works: `(props, item) => <Link to={props.href} className={props.className}
   * aria-current={props['aria-current']}>{props.children}</Link>`. Defaults to a plain `<a>`.
   */
  renderLink?: (props: TabBarLinkProps, item: TabBarItem) => ReactNode;
}

const defaultLink = (props: TabBarLinkProps) => <a {...props} />;

/**
 * Mobile bottom navigation: a `<nav>` of links that share the width, the current one in brand. A 1px divider runs
 * along its top; it sits in the page layout, so it has no elevation, and no hover (touch). It fills its container
 * (tab-bar/width is Figma's frame). Figma: Tab bar page, sets "Tab-bar" and "_tab-bar-item".
 */
export function TabBar({
  items,
  current,
  defaultCurrent,
  onCurrentChange,
  renderLink = defaultLink,
  className,
  'aria-label': ariaLabel = 'Main',
  ...rest
}: TabBarProps) {
  const [own, setOwn] = useState(defaultCurrent ?? items[0]?.id);
  const active = current ?? own;
  return (
    <nav {...rest} aria-label={ariaLabel} className={`bland-tab-bar${className ? ` ${className}` : ''}`}>
      <ul className="bland-tab-bar__list">
        {items.map((item) => {
          const note = typeof item.indicator === 'string' ? item.indicator : undefined;
          return (
            <li key={item.id} className="bland-tab-bar__entry">
              {renderLink(
                {
                  href: item.href,
                  className: 'bland-tab-bar__item bland-focus-ring bland-smooth',
                  'aria-current': item.id === active ? 'page' : undefined,
                  // A hidden text after the label would be read with a stray space before its comma.
                  'aria-label': note ? `${item.label}, ${note}` : undefined,
                  onClick: () => {
                    if (current === undefined) setOwn(item.id);
                    onCurrentChange?.(item.id);
                  },
                  children: (
                    <>
                      <span className="bland-tab-bar__icon-wrap">
                        <Icon className="bland-tab-bar__icon">{item.icon}</Icon>
                        {item.indicator && (
                          <Indicator className="bland-tab-bar__indicator" size="sm" emotion="danger" ring />
                        )}
                      </span>
                      {item.hideLabel ? (
                        <VisuallyHidden elementType="span">{item.label}</VisuallyHidden>
                      ) : (
                        <span className="bland-tab-bar__label">{item.label}</span>
                      )}
                    </>
                  ),
                },
                item,
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
