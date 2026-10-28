import type { Story } from '../../../playground/story';
import { Pagination, type PaginationSize } from './Pagination';

// Hover is a CSS state, so it shows on interaction, not here.
const sizes: PaginationSize[] = ['sm', 'md', 'lg'];
const prevent = { onClick: (e: { preventDefault(): void }) => e.preventDefault() };

export default {
  title: 'Pagination',
  description:
    'Moves between pages of results. The row keeps its length: past seven pages it shows the first, the last and the pages around the current one.',
  usage: [
    'Pass `pageCount` and `page` (from 1), with `onPageChange`.',
    'Use `getHref` when each page has its own URL, so the pages are links.',
    'Under a table, use PaginationTable.',
  ],
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
        <span className="pg-label"><code>size</code>: <code>sm</code>, <code>md</code>, <code>lg</code></span>
        {sizes.map((size) => (
          <Pagination key={size} size={size} pageCount={10} aria-label={`Pagination ${size}`} />
        ))}
      </div>
      <div className="pg-stack">
        <span className="pg-label">Five pages all show; ten pages, on page 1, 5 and 10</span>
        <Pagination pageCount={5} defaultPage={3} aria-label="Five pages" />
        <Pagination pageCount={10} defaultPage={1} aria-label="Overflow at the end" />
        <Pagination pageCount={10} defaultPage={5} aria-label="Overflow both sides" />
        <Pagination pageCount={10} defaultPage={10} aria-label="Overflow at the start" />
      </div>
      <div className="pg-stack">
        <span className="pg-label">Longer page numbers widen their items</span>
        {sizes.map((size) => (
          <Pagination key={size} size={size} pageCount={120} defaultPage={98} aria-label={`Wide ${size}`} />
        ))}
      </div>
      <div className="pg-stack">
        <span className="pg-label"><code>disabled</code></span>
        <Pagination pageCount={10} defaultPage={2} disabled aria-label="Disabled pagination" />
      </div>
      <div className="pg-stack">
        <span className="pg-label"><code>getHref</code>: each page is a link</span>
        <Pagination {...prevent} pageCount={10} defaultPage={3} getHref={(p) => `#?page=${p}`} aria-label="Link pagination" />
      </div>
      <div className="pg-stack">
        <span className="pg-label">Keyboard focus: the ring shows when people tab to it (turned on here to show it)</span>
        <div className="pg-focus">
          <Pagination pageCount={5} defaultPage={2} aria-label="Focused pagination" />
        </div>
      </div>
    </>
  ),
} satisfies Story;
