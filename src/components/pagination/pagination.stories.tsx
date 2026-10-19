import type { Story } from '../../../playground/story';
import { Pagination, type PaginationSize } from './Pagination';

// Hover is a CSS state, so it shows on interaction, not here.
const sizes: PaginationSize[] = ['sm', 'md', 'lg'];
const prevent = { onClick: (e: { preventDefault(): void }) => e.preventDefault() };

export default {
  title: 'Pagination',
  description:
    'Page navigation built from _pagination-item: previous, page numbers, an overflow item for skipped pages and next. The current page is selected (aria-current="page"). Up to seven pages show them all; past that it always shows seven slots (the first and last page, the current page and one either side, and an overflow item for each gap), so the row keeps its length. Items are control/xs, control/sm and control/md high, and pages with more digits grow wider.',
  components: ['Pagination'],
  demo: {
    component: 'Pagination',
    args: { pageCount: 10, defaultPage: 1, size: 'sm', disabled: false },
    controls: {
      pageCount: { kind: 'select', options: ['5', '7', '10', '50', '120'] },
      defaultPage: { kind: 'select', options: ['1', '4', '5', '10'] },
      page: false,
      getHref: false,
      renderLink: false,
      pageLabel: false,
      previousLabel: false,
      nextLabel: false,
    },
    render: ({ pageCount, defaultPage, ...args }) => (
      <Pagination key={`${pageCount}-${defaultPage}`} {...args} pageCount={Number(pageCount)} defaultPage={Number(defaultPage)} />
    ),
    code: ({ pageCount, defaultPage, ...args }) => ({ ...args, pageCount: Number(pageCount), defaultPage: Number(defaultPage) }),
  },
  render: () => (
    <>
      <div className="pg-stack">
        <span className="pg-label">size: sm, md, lg (10 pages, page 1)</span>
        {sizes.map((size) => (
          <Pagination key={size} size={size} pageCount={10} aria-label={`Pagination ${size}`} />
        ))}
      </div>
      <div className="pg-stack">
        <span className="pg-label">Overflow is automatic: 5 pages (none), then 10 pages on page 1, 5 and 10</span>
        <Pagination pageCount={5} defaultPage={3} aria-label="Five pages" />
        <Pagination pageCount={10} defaultPage={1} aria-label="Overflow at the end" />
        <Pagination pageCount={10} defaultPage={5} aria-label="Overflow both sides" />
        <Pagination pageCount={10} defaultPage={10} aria-label="Overflow at the start" />
      </div>
      <div className="pg-stack">
        <span className="pg-label">More digits grow the items (page 98 of 120)</span>
        {sizes.map((size) => (
          <Pagination key={size} size={size} pageCount={120} defaultPage={98} aria-label={`Wide ${size}`} />
        ))}
      </div>
      <div className="pg-stack">
        <span className="pg-label">Disabled</span>
        <Pagination pageCount={10} defaultPage={2} disabled aria-label="Disabled pagination" />
      </div>
      <div className="pg-stack">
        <span className="pg-label">Links (getHref): each page is a link to its URL</span>
        <Pagination {...prevent} pageCount={10} defaultPage={3} getHref={(p) => `#?page=${p}`} aria-label="Link pagination" />
      </div>
      <div className="pg-stack">
        <span className="pg-label">Focused: the ring shows on keyboard focus (:focus-visible); forced on here to show it</span>
        <div className="pg-focus">
          <Pagination pageCount={5} defaultPage={2} aria-label="Focused pagination" />
        </div>
      </div>
    </>
  ),
} satisfies Story;
