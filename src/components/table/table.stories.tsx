import { useState, type ReactNode } from 'react';
import type { Story } from '../../../playground/story';
import { UserIcon } from '../../icons';
import { Avatar, type AvatarSize } from '../avatar/Avatar';
import { Badge } from '../badge/Badge';
import { Icon } from '../icon/Icon';
import {
  Table,
  TableBody,
  TableCell,
  TableExpandCell,
  TableHead,
  TableHeaderCell,
  TableOptionCell,
  TableRow,
  type TableProps,
  type TableSize,
  type TableSort,
} from './Table';

interface Person {
  key: string;
  name: string;
  initials: string;
  role: string;
  status: 'Active' | 'Invited' | 'Paused';
  email: string;
  seen: string;
}

const people: Person[] = [
  { key: 'ada', name: 'Ada Lovelace', initials: 'AL', role: 'Owner', status: 'Active', email: 'ada@example.com', seen: '2m ago' },
  { key: 'grace', name: 'Grace Hopper', initials: 'GH', role: 'Admin', status: 'Invited', email: 'grace@example.com', seen: 'Yesterday' },
  { key: 'alan', name: 'Alan Turing', initials: 'AT', role: 'Editor', status: 'Paused', email: 'alan@example.com', seen: 'Oct 2' },
];

const emotion = { Active: 'success', Invited: 'brand', Paused: 'neutral' } as const;
// The Avatar that fills each size's leading slot (table/slot-sm 20, md 24, lg 32).
const avatarSize: Record<TableSize, AvatarSize> = { sm: 'xs', md: 'sm', lg: 'md' };

/** A full row of the people data, as a project would write it. */
function PersonCells({ person, size = 'sm', avatar = true }: { person: Person; size?: TableSize; avatar?: boolean }) {
  return (
    <>
      <TableCell leading={avatar ? <Avatar initials={person.initials} size={avatarSize[size]} /> : undefined}>{person.name}</TableCell>
      <TableCell>{person.role}</TableCell>
      <TableCell>
        <Badge emotion={emotion[person.status]}>{person.status}</Badge>
      </TableCell>
      <TableCell>{person.email}</TableCell>
    </>
  );
}

function Head({ sortable = false }: { sortable?: boolean }) {
  const onSort = sortable ? () => {} : undefined;
  return (
    <TableHead>
      <TableRow>
        <TableHeaderCell onSort={onSort} sort={sortable ? 'ascending' : undefined}>
          Name
        </TableHeaderCell>
        <TableHeaderCell onSort={onSort}>Role</TableHeaderCell>
        <TableHeaderCell>Status</TableHeaderCell>
        <TableHeaderCell>Email</TableHeaderCell>
      </TableRow>
    </TableHead>
  );
}

/** A Table whose sort headers really sort, so tests/table.spec.ts can check aria-sort and the order. */
function SortableTable() {
  const [sort, setSort] = useState<{ column: 'name' | 'seen'; dir: Exclude<TableSort, 'none'> }>({ column: 'name', dir: 'ascending' });
  const rows = [...people].sort((a, b) => {
    const order = sort.column === 'name' ? a.name.localeCompare(b.name) : a.key.localeCompare(b.key);
    return sort.dir === 'ascending' ? order : -order;
  });
  const next = (column: 'name' | 'seen') => () =>
    setSort((s) => ({ column, dir: s.column === column && s.dir === 'ascending' ? 'descending' : 'ascending' }));
  const sortOf = (column: 'name' | 'seen'): TableSort => (sort.column === column ? sort.dir : 'none');
  return (
    <Table aria-label="Sortable people" data-testid="sortable">
      <TableHead>
        <TableRow>
          <TableHeaderCell sort={sortOf('name')} onSort={next('name')}>
            Name
          </TableHeaderCell>
          <TableHeaderCell>Role</TableHeaderCell>
          <TableHeaderCell sort={sortOf('seen')} onSort={next('seen')}>
            Last seen
          </TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.map((p) => (
          <TableRow key={p.key}>
            <TableCell>{p.name}</TableCell>
            <TableCell>{p.role}</TableCell>
            <TableCell>{p.seen}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

/** Expand and option columns: the expand button shows a details row below. */
function ExpandableTable({ size = 'sm' }: { size?: TableSize }) {
  const [open, setOpen] = useState<string[]>(['grace']);
  return (
    <Table aria-label={`Expandable people ${size}`} size={size}>
      <TableHead>
        <TableRow>
          <TableExpandCell />
          <TableHeaderCell>Name</TableHeaderCell>
          <TableHeaderCell>Role</TableHeaderCell>
          <TableOptionCell label="Table options" />
        </TableRow>
      </TableHead>
      <TableBody>
        {people.map((p, i) => {
          const expanded = open.includes(p.key);
          const details = `details-${size}-${p.key}`;
          return [
            <TableRow key={p.key} disabled={i === 2}>
              <TableExpandCell
                expanded={expanded}
                label={`Details for ${p.name}`}
                controls={expanded ? details : undefined}
                onExpandedChange={(on) => setOpen((o) => (on ? [...o, p.key] : o.filter((k) => k !== p.key)))}
              />
              <TableCell>{p.name}</TableCell>
              <TableCell>{p.role}</TableCell>
              <TableOptionCell label={`Options for ${p.name}`} />
            </TableRow>,
            expanded && (
              <TableRow key={`${p.key}-details`} id={details}>
                <TableCell colSpan={4}>
                  {p.email}, last seen {p.seen}
                </TableCell>
              </TableRow>
            ),
          ];
        })}
      </TableBody>
    </Table>
  );
}

function Group({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="pg-stack">
      <span className="pg-label">{label}</span>
      {children}
    </div>
  );
}

export default {
  title: 'Table',
  description:
    'Rows and columns of data. Size sets the row and header height (table/sm, md, lg: 32, 40, 48). Header cells are body-lg-bold on one line and truncate; sortable headers swap the sort icon for the direction. Body cells hold a label between optional Leading and Trailing slots; checkbox and radio columns select rows (selected rows take the brand tint), expand and option columns hold ghost Icon Buttons. Width is table/width (640); use Fill container in layouts, and basic cells fill the row. In code it is a native table: th scope="col", sortable headers hold a button and set aria-sort, and a table wider than its container scrolls sideways with the edge fade and a visible scrollbar.',
  components: ['Table', 'TableHead', 'TableBody', 'TableRow', 'TableHeaderCell', 'TableCell', 'TableExpandCell', 'TableOptionCell'],
  demo: {
    component: 'Table',
    args: { size: 'sm', selectionMode: 'none', sortable: false, option: false, avatars: true },
    controls: {
      sortable: { kind: 'boolean' },
      option: { kind: 'boolean' },
      avatars: { kind: 'boolean' },
      selectAllLabel: false,
      selectedKeys: false,
      defaultSelectedKeys: false,
    },
    render: ({ sortable, option, avatars, ...args }) => {
      const size = (args.size ?? 'sm') as TableSize;
      return (
        <Table {...(args as Omit<TableProps, 'children'>)} aria-label="People" key={String(args.selectionMode)}>
          <TableHead>
            <TableRow>
              <TableHeaderCell onSort={sortable ? () => {} : undefined} sort={sortable ? 'ascending' : undefined}>
                Name
              </TableHeaderCell>
              <TableHeaderCell onSort={sortable ? () => {} : undefined}>Role</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell>Email</TableHeaderCell>
              {option && <TableOptionCell label="Table options" />}
            </TableRow>
          </TableHead>
          <TableBody>
            {people.map((p) => (
              <TableRow key={p.key} rowKey={p.key} selectLabel={`Select ${p.name}`}>
                <PersonCells person={p} size={size} avatar={avatars} />
                {option && <TableOptionCell label={`Options for ${p.name}`} />}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      );
    },
    code: ({ sortable, option, avatars, ...args }) => ({ ...args, 'aria-label': 'People' }),
  },
  render: () => (
    <>
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <Group key={size} label={`size="${size}": rows and header ${size === 'sm' ? 32 : size === 'md' ? 40 : 48} high, leading slot ${size === 'sm' ? 20 : size === 'md' ? 24 : 32}`}>
          <Table aria-label={`People ${size}`} size={size}>
            <Head />
            <TableBody>
              {people.map((p) => (
                <TableRow key={p.key}>
                  <PersonCells person={p} size={size} />
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Group>
      ))}

      <Group label='selectionMode="multiple": a Checkbox column, select all goes mixed; selected rows take the brand tint; the last row is disabled'>
        <Table aria-label="Selectable people" selectionMode="multiple" defaultSelectedKeys={['grace']} data-testid="multiple">
          <Head />
          <TableBody>
            {people.map((p, i) => (
              <TableRow key={p.key} rowKey={p.key} selectLabel={`Select ${p.name}`} disabled={i === 2}>
                <PersonCells person={p} />
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Group>

      <Group label="Every row selected: select all is checked and the header takes the selected fill">
        <Table aria-label="All selected" selectionMode="multiple" defaultSelectedKeys={people.map((p) => p.key)}>
          <Head />
          <TableBody>
            {people.map((p) => (
              <TableRow key={p.key} rowKey={p.key} selectLabel={`Select ${p.name}`}>
                <PersonCells person={p} />
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Group>

      <Group label='selectionMode="single": a Radio column under a blank header'>
        <Table aria-label="Pick one person" selectionMode="single" defaultSelectedKeys={['ada']} data-testid="single">
          <Head />
          <TableBody>
            {people.map((p) => (
              <TableRow key={p.key} rowKey={p.key} selectLabel={`Select ${p.name}`}>
                <PersonCells person={p} />
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Group>

      <Group label="Sortable headers: a button in the th, aria-sort on the sorted column; ArrowsDownUp until sorted">
        <SortableTable />
      </Group>

      <Group label="Expand and option columns (ghost Icon Buttons); blank header above the expand column; a disabled row">
        <ExpandableTable />
        <ExpandableTable size="lg" />
      </Group>

      <Group label="Slots and states: icon and avatar leading, trailing text; a disabled cell">
        <Table aria-label="Slots">
          <TableHead>
            <TableRow>
              <TableHeaderCell leading={<Icon><UserIcon /></Icon>}>Owner</TableHeaderCell>
              <TableHeaderCell trailing="GB">Storage</TableHeaderCell>
              <TableHeaderCell>Note</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell leading={<Icon><UserIcon /></Icon>}>Ada Lovelace</TableCell>
              <TableCell trailing="GB">12.4</TableCell>
              <TableCell disabled>Archived</TableCell>
            </TableRow>
            <TableRow>
              <TableCell leading={<Avatar initials="GH" size="xs" />}>Grace Hopper</TableCell>
              <TableCell trailing="GB">3.1</TableCell>
              <TableCell>
                <a href="#/components/table">Open report</a>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Group>

      <Group label="Overflow: basic columns keep table/cell-width (128), so a narrow container scrolls sideways with the fade and a visible scrollbar; labels that do not fit end in an ellipsis">
        <div style={{ maxWidth: 360 }} data-testid="narrow">
          <Table aria-label="Wide table">
            <TableHead>
              <TableRow>
                <TableHeaderCell>A header far too long for its column</TableHeaderCell>
                <TableHeaderCell>Role</TableHeaderCell>
                <TableHeaderCell>Email</TableHeaderCell>
                <TableHeaderCell>Last seen</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {people.map((p) => (
                <TableRow key={p.key}>
                  <TableCell>{p.name} with a long middle name</TableCell>
                  <TableCell>{p.role}</TableCell>
                  <TableCell>{p.email}</TableCell>
                  <TableCell>{p.seen}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Group>

      <Group label="Focused: the ring shows on keyboard focus (:focus-visible), inset on headers because cells touch; forced on here to show it">
        <div className="pg-focus">
          <Table aria-label="Focused" selectionMode="multiple">
            <Head sortable />
            <TableBody>
              <TableRow rowKey="ada" selectLabel="Select Ada Lovelace">
                <PersonCells person={people[0]!} />
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </Group>
    </>
  ),
} satisfies Story;
