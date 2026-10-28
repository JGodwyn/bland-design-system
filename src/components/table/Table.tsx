import {
  createContext,
  useCallback,
  useContext,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  isValidElement,
  type HTMLAttributes,
  type MouseEventHandler,
  type ReactNode,
  type Ref,
  type TableHTMLAttributes,
  type TdHTMLAttributes,
  type ThHTMLAttributes,
} from 'react';
import { ArrowDownIcon, ArrowsDownUpIcon, ArrowUpIcon, CaretDownIcon, DotsThreeIcon } from '../../icons';
import { IconButton } from '../button/IconButton';
import { Checkbox } from '../checkbox/Checkbox';
import { Icon } from '../icon/Icon';
import { Menu, type MenuItemData, type MenuPlacement } from '../menu/Menu';
import { Radio } from '../radio-button/Radio';
import { ScrollArea } from '../scroll-area/ScrollArea';
import './table.css';

export type TableSize = 'sm' | 'md' | 'lg';
export type TableSelectionMode = 'none' | 'multiple' | 'single';
export type TableSort = 'ascending' | 'descending' | 'none';

interface TableState {
  size: TableSize;
  selectionMode: TableSelectionMode;
  selectAllLabel: string;
  radioName: string;
  isSelected: (key: string) => boolean;
  setRowSelected: (key: string, selected: boolean) => void;
  /** true, false or 'mixed' over the rows that are not disabled. */
  all: boolean | 'mixed';
  toggleAll: () => void;
  register: (key: string, disabled: boolean) => () => void;
}

const TableContext = createContext<TableState>({
  size: 'sm',
  selectionMode: 'none',
  selectAllLabel: '',
  radioName: '',
  isSelected: () => false,
  setRowSelected: () => {},
  all: false,
  toggleAll: () => {},
  register: () => () => {},
});
const SectionContext = createContext<'head' | 'body'>('body');
const RowContext = createContext<{ disabled: boolean }>({ disabled: false });

export interface TableProps extends TableHTMLAttributes<HTMLTableElement> {
  /** The table's sections: a `TableHead` and a `TableBody`. */
  children: ReactNode;
  /** Row and header height: sm 32 (default), md 40, lg 48. */
  size?: TableSize;
  /**
   * `multiple` adds a Checkbox column with a select all Checkbox in the
   * header (mixed while some rows are selected); `single` adds a Radio column. Rows need a `rowKey`.
   */
  selectionMode?: TableSelectionMode;
  /** The selected rows' `rowKey`s, controlled. */
  selectedKeys?: string[];
  /** The rows selected at first, when `selectedKeys` is left out. */
  defaultSelectedKeys?: string[];
  /** Called with every selected `rowKey` after a change. */
  onSelectionChange?: (keys: string[]) => void;
  /** Accessible name of the header's select all Checkbox. */
  selectAllLabel?: string;
  /** `className` goes on the wrapper that scrolls; every other prop, `ref` too, on the `<table>`. */
  className?: string;
  /** Reaches the native `<table>`. */
  ref?: Ref<HTMLTableElement>;
}

/**
 * Rows and columns of data on a native `<table>`, so screen readers announce headers with every cell. Name it with
 * `aria-label` or `aria-labelledby`. Wider than its container, it scrolls sideways with the edge fade and a visible
 * scrollbar. Figma: Table page, sets "Table-row", "_table-header" and "_table-cell".
 */
export function Table({
  children,
  size = 'sm',
  selectionMode = 'none',
  selectedKeys,
  defaultSelectedKeys,
  onSelectionChange,
  selectAllLabel = 'Select all rows',
  className,
  ref,
  ...rest
}: TableProps) {
  const radioName = useId();
  const [ownSelection, setOwnSelection] = useState<string[]>(defaultSelectedKeys ?? []);
  const selection = selectedKeys ?? ownSelection;
  const [rows, setRows] = useState<Map<string, boolean>>(() => new Map());
  const tableRef = useRef<HTMLTableElement | null>(null);

  const commit = useCallback(
    (next: string[]) => {
      if (selectedKeys === undefined) setOwnSelection(next);
      onSelectionChange?.(next);
    },
    [selectedKeys, onSelectionChange],
  );

  const register = useCallback((key: string, disabled: boolean) => {
    setRows((prev) => new Map(prev).set(key, disabled));
    return () =>
      setRows((prev) => {
        const next = new Map(prev);
        next.delete(key);
        return next;
      });
  }, []);

  const state = useMemo<TableState>(() => {
    const selected = new Set(selection);
    const enabled = [...rows].filter(([, disabled]) => !disabled).map(([key]) => key);
    const count = enabled.filter((key) => selected.has(key)).length;
    const all = count > 0 && count === enabled.length ? true : count > 0 ? 'mixed' : false;
    return {
      size,
      selectionMode,
      selectAllLabel,
      radioName,
      isSelected: (key) => selected.has(key),
      setRowSelected: (key, on) => {
        if (selectionMode === 'single') commit(on ? [key] : []);
        else commit(on ? [...selection.filter((k) => k !== key), key] : selection.filter((k) => k !== key));
      },
      all,
      // Select all touches only the rows that are not disabled; a disabled row keeps its state.
      toggleAll: () => {
        const keep = selection.filter((key) => !enabled.includes(key));
        commit(all === true ? keep : [...keep, ...enabled]);
      },
      register,
    };
  }, [size, selectionMode, selectAllLabel, radioName, selection, rows, commit, register]);

  // A table that scrolls with nothing focusable inside still has to be reachable by keyboard, so the scrolling
  // element takes focus while the table overflows.
  useLayoutEffect(() => {
    const table = tableRef.current;
    const viewport = table?.closest<HTMLElement>('.bland-scroll-area__viewport');
    if (!table || !viewport) return;
    const update = () => {
      if (viewport.scrollWidth > viewport.clientWidth + 1) viewport.tabIndex = 0;
      else viewport.removeAttribute('tabindex');
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(viewport);
    observer.observe(table);
    return () => observer.disconnect();
  }, []);

  const setRef = (el: HTMLTableElement | null) => {
    tableRef.current = el;
    if (typeof ref === 'function') ref(el);
    else if (ref) ref.current = el;
  };

  return (
    <TableContext.Provider value={state}>
      <ScrollArea axis="x" className={`bland-table${className ? ` ${className}` : ''}`} data-size={size}>
        <table {...rest} ref={setRef} className="bland-table__table">
          {children}
        </table>
      </ScrollArea>
    </TableContext.Provider>
  );
}

export interface TableSectionProps extends HTMLAttributes<HTMLTableSectionElement> {
  /** One `TableRow` (head) or many (body). */
  children: ReactNode;
}

/** The header section, a `<thead>`. Its `TableRow` is Figma's Table-row `Type=header`. */
export function TableHead({ children, className, ...rest }: TableSectionProps) {
  return (
    <SectionContext.Provider value="head">
      <thead {...rest} className={`bland-table__head${className ? ` ${className}` : ''}`}>
        {children}
      </thead>
    </SectionContext.Provider>
  );
}

/** The body section, a `<tbody>` of `TableRow`s. */
export function TableBody({ children, className, ...rest }: TableSectionProps) {
  return (
    <SectionContext.Provider value="body">
      <tbody {...rest} className={`bland-table__body${className ? ` ${className}` : ''}`}>
        {children}
      </tbody>
    </SectionContext.Provider>
  );
}

export interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> {
  /** The row's cells: `TableHeaderCell`s in the head, `TableCell`s in the body. */
  children: ReactNode;
  /** Identifies a body row for selection. Required when the Table has a `selectionMode`. */
  rowKey?: string;
  /** Mutes the row's text and disables its controls. */
  disabled?: boolean;
  /** Accessible name of the row's selection Checkbox or Radio, such as "Select Ada Lovelace". */
  selectLabel?: string;
}

/**
 * A `<tr>`. In a `TableBody` it takes Figma's hover and, while selected, the selected fill, and adds the selection
 * cell first when the Table has a `selectionMode`. In a `TableHead` it adds the select all header.
 */
export function TableRow({ children, rowKey, disabled = false, selectLabel = 'Select row', className, ...rest }: TableRowProps) {
  const table = useContext(TableContext);
  const section = useContext(SectionContext);
  const { register, selectionMode } = table;
  const body = section === 'body';
  const selectable = body && selectionMode !== 'none' && rowKey !== undefined;

  useLayoutEffect(() => {
    if (selectable) return register(rowKey, disabled);
  }, [selectable, register, rowKey, disabled]);

  const selected = selectable && table.isSelected(rowKey);
  const head = section === 'head';
  let selection: ReactNode = null;
  if (head && selectionMode === 'multiple') {
    selection = (
      <th scope="col" className="bland-table__header" data-structure="control">
        <span className="bland-table__inner">
          <Checkbox aria-label={table.selectAllLabel} checked={table.all} onCheckedChange={table.toggleAll} />
        </span>
      </th>
    );
  } else if (head && selectionMode === 'single') {
    // Figma's `empty` header: a blank cell above the Radio column, a td so it is not an empty column header.
    selection = <td className="bland-table__header" data-structure="control" />;
  } else if (body && selectionMode !== 'none') {
    selection = (
      <td className="bland-table__cell" data-structure="control">
        <span className="bland-table__inner">
          {selectionMode === 'multiple' ? (
            <Checkbox
              aria-label={selectLabel}
              checked={selected}
              disabled={disabled || rowKey === undefined}
              onCheckedChange={(on) => rowKey !== undefined && table.setRowSelected(rowKey, on)}
            />
          ) : (
            <Radio
              aria-label={selectLabel}
              name={table.radioName}
              value={rowKey ?? ''}
              checked={selected}
              disabled={disabled || rowKey === undefined}
              onChange={() => rowKey !== undefined && table.setRowSelected(rowKey, true)}
            />
          )}
        </span>
      </td>
    );
  }

  return (
    <RowContext.Provider value={{ disabled }}>
      <tr
        {...rest}
        className={`bland-table__row${className ? ` ${className}` : ''}`}
        aria-selected={selectable ? selected : undefined}
        data-selected={(selected || (head && selectionMode === 'multiple' && table.all === true)) || undefined}
        data-disabled={disabled || undefined}
      >
        {selection}
        {children}
      </tr>
    </RowContext.Provider>
  );
}

/** Figma's slots and the label, shared by header and body cells. */
function CellContent({ leading, children, trailing }: { leading?: ReactNode; children?: ReactNode; trailing?: ReactNode }) {
  return (
    <>
      {leading != null && leading !== false && <span className="bland-table__slot" data-slot="leading">{leading}</span>}
      <span className="bland-table__label">{children}</span>
      {trailing != null && trailing !== false && <span className="bland-table__slot" data-slot="trailing">{trailing}</span>}
    </>
  );
}

export interface TableHeaderCellProps extends ThHTMLAttributes<HTMLTableCellElement> {
  /** One line in body-lg-bold, ending in an ellipsis when it does not fit. */
  children?: ReactNode;
  /** A box of 20, 24 or 32 (by table size) before the label. */
  leading?: ReactNode;
  /** After the label. Not shown on a sortable header, whose sort icon sits there. */
  trailing?: ReactNode;
  /**
   * The current sort of this column. With `onSort` the header is a button, and the th
   * sets `aria-sort` while it is `ascending` or `descending`.
   */
  sort?: TableSort;
  /** Makes the header a sort button. Called on press; set the next `sort` yourself. */
  onSort?: MouseEventHandler<HTMLButtonElement>;
  /** Replaces the icon that shows the sort (ArrowUp, ArrowDown, or ArrowsDownUp unsorted). */
  sortIcon?: ReactNode;
}

/** A column header, `<th scope="col">`: Figma `_table-header` `Structure=basic` or `sortable`. */
export function TableHeaderCell({ children, leading, trailing, sort = 'none', onSort, sortIcon, className, ...rest }: TableHeaderCellProps) {
  const sortable = onSort !== undefined;
  const icon = sortIcon ?? (sort === 'ascending' ? <ArrowUpIcon /> : sort === 'descending' ? <ArrowDownIcon /> : <ArrowsDownUpIcon />);
  return (
    <th
      scope="col"
      {...rest}
      className={`bland-table__header${className ? ` ${className}` : ''}`}
      data-structure="basic"
      data-sortable={sortable || undefined}
      data-sorted={(sortable && sort !== 'none') || undefined}
      aria-sort={sortable && sort !== 'none' ? sort : undefined}
    >
      {sortable ? (
        <button type="button" className="bland-table__inner bland-table__sort bland-focus-ring" onClick={onSort}>
          <CellContent leading={leading}>{children}</CellContent>
          <Icon className="bland-table__sort-icon">{icon}</Icon>
        </button>
      ) : (
        <span className="bland-table__inner">
          <CellContent leading={leading} trailing={trailing}>
            {children}
          </CellContent>
        </span>
      )}
    </th>
  );
}

export interface TableCellProps extends TdHTMLAttributes<HTMLTableCellElement> {
  /** One line in body-lg, ending in an ellipsis when it does not fit. Any node: text, a link, a Badge. */
  children?: ReactNode;
  /** An Avatar, an `<Icon>`, in a box of at least 20, 24 or 32 (by table size). */
  leading?: ReactNode;
  /** After the label. */
  trailing?: ReactNode;
  /** For this cell alone (muted text). A disabled `TableRow` disables all its cells. */
  disabled?: boolean;
}

/** A body cell, `<td>`: Figma `_table-cell` `Structure=basic`, a label between two slots. */
export function TableCell({ children, leading, trailing, disabled, className, ...rest }: TableCellProps) {
  const row = useContext(RowContext);
  return (
    <td
      {...rest}
      className={`bland-table__cell${className ? ` ${className}` : ''}`}
      data-structure="basic"
      data-disabled={(disabled ?? row.disabled) || undefined}
    >
      <span className="bland-table__inner">
        <CellContent leading={leading} trailing={trailing}>
          {children}
        </CellContent>
      </span>
    </td>
  );
}

/** The ghost Icon Button Figma puts in control cells: sm in sm and md tables, md in lg ones. */
function useControlSize() {
  return useContext(TableContext).size === 'lg' ? 'md' : 'sm';
}

/** What a header or body control cell is: a th-less `<td>` in the head (Figma's blank headers), a td in the body. */
function useCellClass() {
  return useContext(SectionContext) === 'head' ? 'bland-table__header' : 'bland-table__cell';
}

export interface TableExpandCellProps extends Omit<TdHTMLAttributes<HTMLTableCellElement>, 'children'> {
  /** Whether the row's details are shown. The caret turns while expanded. */
  expanded?: boolean;
  /** Called with the next expanded state when the button is pressed. Render the details row yourself. */
  onExpandedChange?: (expanded: boolean) => void;
  /** Accessible name of the expand button. */
  label?: string;
  /** The id of the details the button shows, for `aria-controls`. */
  controls?: string;
}

/**
 * `Structure=expand`: a square cell with a ghost Icon Button (CaretDown) that shows or hides the
 * row's details, with `aria-expanded`. In a `TableHead` it is Figma's blank `empty` header above that column.
 */
export function TableExpandCell({ expanded = false, onExpandedChange, label = 'Show details', controls, className, ...rest }: TableExpandCellProps) {
  const row = useContext(RowContext);
  const size = useControlSize();
  const cellClass = useCellClass();
  const head = cellClass === 'bland-table__header';
  return (
    <td {...rest} className={`${cellClass}${className ? ` ${className}` : ''}`} data-structure="control" data-disabled={row.disabled || undefined}>
      {!head && (
        <span className="bland-table__inner">
          <IconButton
            className="bland-table__expand"
            size={size}
            type="ghost"
            icon={<CaretDownIcon />}
            aria-label={label}
            aria-expanded={expanded}
            aria-controls={controls}
            disabled={row.disabled}
            onClick={() => onExpandedChange?.(!expanded)}
          />
        </span>
      )}
    </td>
  );
}

export interface TableOptionCellProps extends Omit<TdHTMLAttributes<HTMLTableCellElement>, 'onClick'> {
  /**
   * Your own trigger. Leave it out for Bland's ghost DotsThree Icon Button. With `items` it must be one focusable
   * element that takes a `ref` and DOM props (it becomes the Menu's trigger).
   */
  children?: ReactNode;
  /** The row's actions: the trigger opens a Menu of them (Menu's `items`). Leave it out for a plain button. */
  items?: MenuItemData[];
  /** Called with an item's `id` when it is chosen from the menu. */
  onAction?: (id: string) => void;
  /** Where the menu opens. Default `bottom-end`, so it lines up under the button at the end of the row. */
  menuPlacement?: MenuPlacement;
  /** Called when the DotsThree button is pressed, when there are no `items`. */
  onClick?: MouseEventHandler<HTMLButtonElement>;
  /** Accessible name of the DotsThree button, such as "Options for Ada Lovelace". */
  label?: string;
}

/**
 * A square cell at the end of the row with a ghost Icon Button
 * (DotsThree), in the head and the body alike. With `items`, the button opens a Menu of the row's actions.
 */
export function TableOptionCell({
  children,
  items,
  onAction,
  menuPlacement = 'bottom-end',
  onClick,
  label = 'Options',
  className,
  ...rest
}: TableOptionCellProps) {
  const row = useContext(RowContext);
  const size = useControlSize();
  const cellClass = useCellClass();
  const trigger = children ?? (
    <IconButton size={size} type="ghost" icon={<DotsThreeIcon />} aria-label={label} disabled={row.disabled} onClick={items ? undefined : onClick} />
  );
  return (
    <td {...rest} className={`${cellClass}${className ? ` ${className}` : ''}`} data-structure="control" data-disabled={row.disabled || undefined}>
      <span className="bland-table__inner">
        {items && isValidElement(trigger) ? (
          <Menu items={items} onAction={onAction} placement={menuPlacement} disabled={row.disabled}>
            {trigger}
          </Menu>
        ) : (
          trigger
        )}
      </span>
    </td>
  );
}
