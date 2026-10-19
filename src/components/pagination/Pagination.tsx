import { useState, type HTMLAttributes, type MouseEvent, type ReactNode } from 'react';
import { CaretLeftIcon, CaretRightIcon, DotsThreeIcon } from '../../icons';
import { Icon } from '../icon/Icon';
import './pagination.css';

export type PaginationSize = 'sm' | 'md' | 'lg';

/** What `renderLink` receives: spread it onto your router's link. */
export interface PaginationLinkProps {
  /** Left out on previous or next when there is no page that way (the link is disabled). */
  href?: string;
  /** Bland's item classes (look, hover and focus ring). Keep them on the rendered element. */
  className: string;
  /** `"page"` on the current page. */
  'aria-current'?: 'page';
  /** `"true"` on previous or next when there is no page that way. */
  'aria-disabled'?: 'true';
  'aria-label': string;
  /** Calls `onPageChange`. Keep it on the rendered element. */
  onClick: (event: MouseEvent<HTMLElement>) => void;
  children: ReactNode;
}

export interface PaginationProps extends Omit<HTMLAttributes<HTMLElement>, 'onChange'> {
  /** How many pages there are. */
  pageCount: number;
  /** The current page, from 1 (Figma `Selected` on its item), controlled. Pair it with `onPageChange`. */
  page?: number;
  /** The current page at first, when `page` is left out. Defaults to 1. */
  defaultPage?: number;
  /** Called with the page to show when an item, previous or next is pressed. */
  onPageChange?: (page: number) => void;
  /** Figma `Size`: items control/xs, control/sm, control/md (24, 32, 40). Default sm, Figma's. */
  size?: PaginationSize;
  /** Disables every item. */
  disabled?: boolean;
  /**
   * Makes every item a link to its page, for pages that live at their own URL: `(page) => \`?page=${page}\``.
   * Pressing one still calls `onPageChange`. Leave it out for buttons.
   */
  getHref?: (page: number) => string;
  /**
   * Renders each link when `getHref` is set, so any router works: `(props) => <Link to={props.href} {...props} />`.
   * Defaults to a plain `<a>`.
   */
  renderLink?: (props: PaginationLinkProps, page: number) => ReactNode;
  /** Accessible name of each page item. */
  pageLabel?: (page: number) => string;
  /** Accessible name of the previous item. */
  previousLabel?: string;
  /** Accessible name of the next item. */
  nextLabel?: string;
}

type Slot = number | 'start-gap' | 'end-gap';

/**
 * The pages to show: all of them up to seven, else always seven slots (the first page, the last page, the
 * current page with one page either side, and an overflow item for each gap), so the row keeps its length
 * as the page changes. Figma `👀 Overflow` is this gap: automatic in code.
 */
export function pageSlots(page: number, pageCount: number): Slot[] {
  const range = (from: number, to: number) => Array.from({ length: to - from + 1 }, (_, i) => from + i);
  if (pageCount <= 7) return range(1, pageCount);
  if (page <= 4) return [...range(1, 5), 'end-gap', pageCount];
  if (page >= pageCount - 3) return [1, 'start-gap', ...range(pageCount - 4, pageCount)];
  return [1, 'start-gap', page - 1, page, page + 1, 'end-gap', pageCount];
}

const itemClass = 'bland-pagination__item bland-focus-ring bland-smooth';
const defaultLink = (props: PaginationLinkProps) => <a {...props} />;

interface ItemProps {
  target: number;
  label: string;
  current?: boolean;
  blocked?: boolean;
  children: ReactNode;
}

/**
 * Page navigation: previous, the page numbers with an overflow item for each gap, and next, in a bordered box.
 * A `<nav>` named "Pagination"; the current page has `aria-current="page"`. Figma: Pagination page, sets
 * "Pagination-simple" and "_pagination-item".
 */
export function Pagination({
  pageCount,
  page,
  defaultPage = 1,
  onPageChange,
  size = 'sm',
  disabled,
  getHref,
  renderLink = defaultLink,
  pageLabel = (n) => `Page ${n}`,
  previousLabel = 'Previous page',
  nextLabel = 'Next page',
  className,
  'aria-label': ariaLabel = 'Pagination',
  ...rest
}: PaginationProps) {
  const count = Math.max(1, Math.floor(pageCount));
  const [own, setOwn] = useState(defaultPage);
  const current = Math.min(Math.max(1, page ?? own), count);

  const go = (target: number) => {
    if (page === undefined) setOwn(target);
    onPageChange?.(target);
  };

  // Previous and next at the ends stay focusable (aria-disabled, not disabled), so focus is not lost when
  // pressing previous lands on the first page.
  const item = ({ target, label, current: isCurrent, blocked, children }: ItemProps) => {
    const onClick = (event: MouseEvent<HTMLElement>) => {
      if (blocked || disabled) {
        event.preventDefault();
        return;
      }
      if (target !== current) go(target);
    };
    if (getHref && !disabled) {
      return renderLink(
        {
          href: blocked ? undefined : getHref(target),
          className: itemClass,
          'aria-current': isCurrent ? 'page' : undefined,
          'aria-disabled': blocked ? 'true' : undefined,
          'aria-label': label,
          onClick,
          children,
        },
        target,
      );
    }
    return (
      <button
        type="button"
        className={itemClass}
        aria-current={isCurrent ? 'page' : undefined}
        aria-disabled={blocked || undefined}
        aria-label={label}
        disabled={disabled}
        onClick={onClick}
      >
        {children}
      </button>
    );
  };

  return (
    <nav
      {...rest}
      aria-label={ariaLabel}
      className={`bland-pagination${className ? ` ${className}` : ''}`}
      data-size={size}
      data-disabled={disabled || undefined}
    >
      <ul className="bland-pagination__list bland-smooth">
        <li>
          {item({
            target: current - 1,
            label: previousLabel,
            blocked: current <= 1,
            children: (
              <Icon>
                <CaretLeftIcon />
              </Icon>
            ),
          })}
        </li>
        {pageSlots(current, count).map((slot) =>
          typeof slot === 'number' ? (
            <li key={slot}>
              {item({ target: slot, label: pageLabel(slot), current: slot === current, children: slot })}
            </li>
          ) : (
            // An overflow item marks skipped pages; it is not a control (the pages either side are).
            <li key={slot} className="bland-pagination__item bland-pagination__gap" aria-hidden="true">
              <Icon>
                <DotsThreeIcon />
              </Icon>
            </li>
          ),
        )}
        <li>
          {item({
            target: current + 1,
            label: nextLabel,
            blocked: current >= count,
            children: (
              <Icon>
                <CaretRightIcon />
              </Icon>
            ),
          })}
        </li>
      </ul>
    </nav>
  );
}
