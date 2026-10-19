import type { Story } from '../../../playground/story';
import { PaginationTable, type PaginationTableSize } from './PaginationTable';

// Hover is a CSS state, so it shows on interaction, not here.
const sizes: PaginationTableSize[] = ['sm', 'md', 'lg'];

export default {
  title: 'Pagination-table',
  description:
    'Table footer pagination: a summary of the items shown and page navigation. Navigation simple uses Pagination; advanced uses a page jump field, the page count and previous and next arrows, for long tables. The summary and the page count can be hidden or replaced. It fills its container (pagination/width is the Figma frame).',
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
          <span className="pg-label">navigation="{navigation}": sm, md, lg (100 items)</span>
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
        <span className="pg-label">Summary and page count hidden (summary and pagesLabel false); custom text</span>
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
        <span className="pg-label">Disabled</span>
        <PaginationTable total={100} defaultPage={2} disabled navLabel="Disabled simple" />
        <PaginationTable navigation="advanced" total={100} defaultPage={2} disabled navLabel="Disabled advanced" pageInputLabel="Disabled page" />
      </div>
      <div className="pg-stack">
        <span className="pg-label">Focused: the ring shows on keyboard focus (:focus-visible); forced on here to show it</span>
        <div className="pg-focus">
          <PaginationTable navigation="advanced" total={100} defaultPage={2} navLabel="Focused pagination" pageInputLabel="Focused page" />
        </div>
      </div>
    </>
  ),
} satisfies Story;
