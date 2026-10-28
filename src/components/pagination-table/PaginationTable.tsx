import { useId, useRef, useState, type HTMLAttributes, type ReactNode } from 'react';
import { useLocale, useNumberField } from 'react-aria';
import { useNumberFieldState } from 'react-stately';
import { CaretLeftIcon, CaretRightIcon } from '../../icons';
import { Icon } from '../icon/Icon';
import { Pagination, type PaginationProps, type PaginationSize } from '../pagination/Pagination';
import { TextInput } from '../text-input/TextInput';
import '../pagination/pagination.css';
import './pagination-table.css';

export type PaginationTableSize = PaginationSize;
export type PaginationTableNavigation = 'simple' | 'advanced';

export interface PaginationTableProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** How many items the table has in all. With `pageSize` it sets the page count and the summary. */
  total: number;
  /** Items per page. Default 10. */
  pageSize?: number;
  /** The current page, from 1, controlled. Pair it with `onPageChange`. */
  page?: number;
  /** The current page at first, when `page` is left out. Defaults to 1. */
  defaultPage?: number;
  /** Called with the page to show. */
  onPageChange?: (page: number) => void;
  /** 32, 40 or 48 high. Default sm. */
  size?: PaginationTableSize;
  /**
   * `simple`: page numbers (Pagination). `advanced`: a field to type a page into, the page
   * count and previous and next, for long tables. Default simple.
   */
  navigation?: PaginationTableNavigation;
  /**
   * The summary of the items shown. Defaults to "1-10 of 100 items"; pass your own
   * text (translated, say), or `false` to hide it.
   */
  summary?: ReactNode;
  /**
   * advanced only: the page count after the field. Defaults to "of 10 pages";
   * pass your own text, or `false` to hide it.
   */
  pagesLabel?: ReactNode;
  /** Disables the navigation. */
  disabled?: boolean;
  /** Accessible name of the page field (advanced). */
  pageInputLabel?: string;
  /** Simple navigation: links instead of buttons, as Pagination's `getHref`. */
  getHref?: PaginationProps['getHref'];
  /** Simple navigation: renders each link, as Pagination's `renderLink`. */
  renderLink?: PaginationProps['renderLink'];
  /** Accessible name of each page item (simple). */
  pageLabel?: PaginationProps['pageLabel'];
  /** Accessible name of the previous item. */
  previousLabel?: string;
  /** Accessible name of the next item. */
  nextLabel?: string;
  /** Accessible name of the navigation landmark. */
  navLabel?: string;
}

const plural = (n: number, one: string, many: string) => (n === 1 ? one : many);

/** The page field: a Text Input sm that takes a page number, committed on Enter or blur (React Aria NumberField). */
function PageField({
  page,
  pageCount,
  onCommit,
  disabled,
  label,
  describedBy,
}: {
  page: number;
  pageCount: number;
  onCommit: (page: number) => void;
  disabled?: boolean;
  label: string;
  describedBy?: string;
}) {
  const { locale } = useLocale();
  const ref = useRef<HTMLInputElement>(null);
  const props = {
    'aria-label': label,
    'aria-describedby': describedBy,
    value: page,
    // An empty or unreadable entry commits NaN: the field goes back to the current page.
    onChange: (value: number) => {
      if (!Number.isNaN(value) && value !== page) onCommit(value);
    },
    minValue: 1,
    maxValue: pageCount,
    step: 1,
    formatOptions: { maximumFractionDigits: 0, useGrouping: false },
    isDisabled: disabled,
    isWheelDisabled: true,
  };
  const state = useNumberFieldState({ ...props, locale });
  const { inputProps } = useNumberField(props, state, ref);
  // TextInput takes the native size attribute's place for its own size, so it never reaches the input.
  const { size: _size, ...input } = inputProps as typeof inputProps & { size?: number };
  return <TextInput {...input} ref={ref} size="sm" className="bland-pagination-table__field" />;
}

/**
 * Table footer pagination: a summary of the items shown and the page navigation, simple (page numbers) or
 * advanced (a page field, the page count and previous and next). It fills its container (pagination/width is
 * Figma's frame). Figma: Pagination page, set "Pagination-table".
 */
export function PaginationTable({
  total,
  pageSize = 10,
  page,
  defaultPage = 1,
  onPageChange,
  size = 'sm',
  navigation = 'simple',
  summary,
  pagesLabel,
  disabled,
  pageInputLabel = 'Page',
  getHref,
  renderLink,
  pageLabel,
  previousLabel = 'Previous page',
  nextLabel = 'Next page',
  navLabel = 'Pagination',
  className,
  ...rest
}: PaginationTableProps) {
  const pagesId = `${useId()}pages`;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const [own, setOwn] = useState(defaultPage);
  const current = Math.min(Math.max(1, page ?? own), pageCount);

  const go = (target: number) => {
    if (page === undefined) setOwn(target);
    onPageChange?.(target);
  };

  const start = total === 0 ? 0 : (current - 1) * pageSize + 1;
  const end = Math.min(current * pageSize, total);
  const summaryText =
    summary === undefined
      ? total === 0
        ? '0 items'
        : `${start}-${end} of ${total} ${plural(total, 'item', 'items')}`
      : summary;
  const pagesText = pagesLabel === undefined ? `of ${pageCount} ${plural(pageCount, 'page', 'pages')}` : pagesLabel;
  const show = (node: ReactNode) => node != null && node !== false;

  const arrow = (target: number, label: string, blocked: boolean, icon: ReactNode) => (
    <li>
      <button
        type="button"
        className="bland-pagination__item bland-focus-ring bland-smooth"
        aria-label={label}
        aria-disabled={blocked || undefined}
        disabled={disabled}
        onClick={() => {
          if (!blocked) go(target);
        }}
      >
        <Icon>{icon}</Icon>
      </button>
    </li>
  );

  return (
    <div {...rest} className={`bland-pagination-table${className ? ` ${className}` : ''}`} data-size={size}>
      <div className="bland-pagination-table__summary">{show(summaryText) && summaryText}</div>
      {navigation === 'simple' ? (
        <Pagination
          pageCount={pageCount}
          page={current}
          onPageChange={go}
          size={size}
          disabled={disabled}
          getHref={getHref}
          renderLink={renderLink}
          pageLabel={pageLabel}
          previousLabel={previousLabel}
          nextLabel={nextLabel}
          aria-label={navLabel}
        />
      ) : (
        <nav className="bland-pagination-table__nav" aria-label={navLabel}>
          <div className="bland-pagination-table__jump">
            <PageField
              page={current}
              pageCount={pageCount}
              onCommit={go}
              disabled={disabled}
              label={pageInputLabel}
              describedBy={show(pagesText) ? pagesId : undefined}
            />
            {show(pagesText) && (
              <span className="bland-pagination-table__pages" id={pagesId}>
                {pagesText}
              </span>
            )}
          </div>
          <div className="bland-pagination" data-size={size} data-disabled={disabled || undefined}>
            <ul className="bland-pagination__list bland-smooth">
              {arrow(current - 1, previousLabel, current <= 1, <CaretLeftIcon />)}
              {arrow(current + 1, nextLabel, current >= pageCount, <CaretRightIcon />)}
            </ul>
          </div>
        </nav>
      )}
    </div>
  );
}
