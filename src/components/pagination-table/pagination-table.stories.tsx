import type { Story } from '../../../playground/story';
import { PaginationTable, type PaginationTableSize } from './PaginationTable';

// Hover is a CSS state, so it shows on interaction, not here.
const sizes: PaginationTableSize[] = ['sm', 'md', 'lg'];

export default {
  title: 'Pagination-table',
  description:
    'The footer of a table: how many items are shown, and the page navigation.',
  usage: [
    'Pass `total` and `pageSize`; the number of pages follows.',
    '`navigation="advanced"` adds a field to jump to a page, for long tables.',
    'Replace or hide the summary with `summary`, and the page count with `pagesLabel`.',
  ],
  components: ['PaginationTable'],
  demo: {
    component: 'PaginationTable',
    args: { total: 100, pageSize: 10, size: 'sm', navigation: 'simple', disabled: false },
    controls: {
      total: { kind: 'select', options: ['0', '8', '100', '1200'] },
      pageSize: { kind: 'select', options: ['10', '25', '50'] },
      page: false,
      defaultPage: false,
      getHref: false,
      renderLink: false,
      pageLabel: false,
      previousLabel: false,
      nextLabel: false,
      navLabel: false,
      pageInputLabel: false,
    },
    render: ({ total, pageSize, ...args }) => (
      <PaginationTable key={`${total}-${pageSize}`} {...args} total={Number(total)} pageSize={Number(pageSize)} />
    ),
    code: ({ total, pageSize, ...args }) => ({ ...args, total: Number(total), pageSize: Number(pageSize) }),
  },
  render: () => (
    <>
      {(['simple', 'advanced'] as const).map((navigation) => (
        <div key={navigation} className="pg-stack">
          <span className="pg-label"><code>navigation="{navigation}"</code>: <code>sm</code>, <code>md</code>, <code>lg</code></span>
          {sizes.map((size) => (
            <PaginationTable
              key={size}
              size={size}
              navigation={navigation}
              total={100}
              navLabel={`Pagination ${navigation} ${size}`}
              pageInputLabel={`Page ${navigation} ${size}`}
            />
          ))}
        </div>
      ))}
      <div className="pg-stack">
        <span className="pg-label"><code>summary</code> and <code>pagesLabel</code> set to <code>false</code>, then to your own text</span>
        <PaginationTable navigation="advanced" total={100} summary={false} pagesLabel={false} navLabel="Bare pagination" pageInputLabel="Bare page" />
        <PaginationTable
          navigation="advanced"
          total={240}
          pageSize={25}
          defaultPage={4}
          summary="Showing 76 to 100 of 240 invoices"
          navLabel="Custom pagination"
          pageInputLabel="Custom page"
        />
      </div>
      <div className="pg-stack">
        <span className="pg-label"><code>disabled</code></span>
        <PaginationTable total={100} defaultPage={2} disabled navLabel="Disabled simple" />
        <PaginationTable navigation="advanced" total={100} defaultPage={2} disabled navLabel="Disabled advanced" pageInputLabel="Disabled page" />
      </div>
      <div className="pg-stack">
        <span className="pg-label">Keyboard focus: the ring shows when people tab to it (turned on here to show it)</span>
        <div className="pg-focus">
          <PaginationTable navigation="advanced" total={100} defaultPage={2} navLabel="Focused pagination" pageInputLabel="Focused page" />
        </div>
      </div>
    </>
  ),
} satisfies Story;
