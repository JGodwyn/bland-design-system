import { useState, type CSSProperties } from 'react';
import type { Story } from '../../../playground/story';
import { CaretRightIcon, DotsThreeIcon, PlusIcon, UserIcon, XIcon } from '../../icons';
import { Avatar } from '../avatar/Avatar';
import { Button } from '../button/Button';
import { IconButton } from '../button/IconButton';
import { Icon } from '../icon/Icon';
import { MenuRow, type MenuItemData, type MenuSize } from './items';
import { Menu } from './Menu';

const sizes: MenuSize[] = ['sm', 'md', 'lg'];
const stage: CSSProperties = { display: 'grid', placeItems: 'center', minHeight: 300, minWidth: 280 };

const icon = (svg: React.ReactNode) => <Icon>{svg}</Icon>;

const actions: MenuItemData[] = [
  { id: 'new', label: 'New file', leading: icon(<PlusIcon />), trailing: 'Ctrl N' },
  { id: 'share', label: 'Share', leading: icon(<UserIcon />) },
  { id: 'move', label: 'Move to', trailing: icon(<CaretRightIcon />), divider: true },
  { id: 'archive', label: 'Archive', disabled: true },
  { id: 'delete', label: 'Delete', leading: icon(<XIcon />), danger: true },
];

const many: MenuItemData[] = Array.from({ length: 24 }, (_, i) => ({ id: `item-${i + 1}`, label: `Menu item ${i + 1}` }));

/** The static panel: every row state drawn without behaviour, for the docs and the screenshots. */
function Panel({ size, children }: { size: MenuSize; children: React.ReactNode }) {
  return (
    <div className="bland-menu bland-smooth" data-size={size}>
      <ul className="bland-menu__list">
        {children}
      </ul>
    </div>
  );
}

const hover = { '--_fill': 'var(--menu-surface-hover)' } as CSSProperties;

function Rows({ size }: { size: MenuSize }) {
  const row = (id: string, label: string, extra: Partial<MenuItemData> = {}) => ({ id, label, ...extra });
  return (
    <Panel size={size}>
      <MenuRow size={size} item={row('rest', 'Rest')} />
      <MenuRow size={size} item={row('hover', 'Hover')} style={hover} />
      <MenuRow size={size} item={row('pressed', 'Pressed')} pressed />
      <MenuRow size={size} item={row('focused', 'Focused (keyboard)')} focusVisible />
      <MenuRow size={size} item={row('disabled', 'Disabled', { leading: icon(<UserIcon />) })} disabled />
      <MenuRow size={size} item={row('slots', 'Leading and trailing', { leading: icon(<UserIcon />), trailing: 'Ctrl K', divider: true })} />
      <MenuRow size={size} item={row('danger', 'Danger', { danger: true })} />
      <MenuRow size={size} item={row('danger-hover', 'Danger hover', { danger: true })} style={hover} />
    </Panel>
  );
}

function Selection() {
  const [selected, setSelected] = useState<string[]>(['list']);
  return (
    <div className="pg-row">
      <Menu
        items={[
          { id: 'list', label: 'List' },
          { id: 'grid', label: 'Grid' },
          { id: 'board', label: 'Board' },
        ]}
        selectionMode="single"
        selectedKeys={selected}
        onSelectionChange={setSelected}
        aria-label="View"
      >
        <Button type="stroke" data-testid="view-trigger">
          View
        </Button>
      </Menu>
      <output className="pg-label" data-testid="view-value">
        {selected.join(', ')}
      </output>
    </div>
  );
}

function Actions() {
  const [last, setLast] = useState('none');
  return (
    <div className="pg-row">
      <Menu items={actions} onAction={setLast}>
        <Button type="stroke" data-testid="actions-trigger">
          Actions
        </Button>
      </Menu>
      <Menu items={actions} onAction={setLast} placement="bottom-end" aria-label="More">
        <IconButton type="ghost" icon={<DotsThreeIcon />} aria-label="More" data-testid="more-trigger" />
      </Menu>
      <output className="pg-label" data-testid="last-action">
        {last}
      </output>
    </div>
  );
}

export default {
  title: 'Menu',
  description:
    'A list of actions or options in a floating panel, opened from a button. Use it for actions that don\'t fit on screen, such as behind a More button.',
  usage: [
    'Wrap the trigger (a Button or IconButton) in Menu, and handle choices in `onAction`.',
    'Mark destructive actions with `danger`, and separate groups with `divider`.',
    'Set `selectionMode` for a menu that picks options; picked rows show a check.',
    'For a form field with options, use Dropdown.',
  ],
  components: ['Menu'],
  demo: {
    component: 'Menu',
    args: { size: 'sm', placement: 'bottom-start', disabled: false, selectionMode: 'none' },
    controls: {
      selectionMode: { kind: 'select', options: ['none', 'single', 'multiple'] },
      items: false,
      open: false,
      defaultOpen: false,
      selectedKeys: false,
      defaultSelectedKeys: false,
      closeOnSelect: false,
    },
    render: ({ selectionMode, ...args }) => (
      <div style={stage}>
        <Menu
          {...(args as object)}
          items={actions}
          selectionMode={selectionMode === 'none' ? undefined : (selectionMode as 'single' | 'multiple')}
        >
          <Button type="stroke">Open menu</Button>
        </Menu>
      </div>
    ),
    code: ({ selectionMode, ...args }) => ({ ...args, selectionMode: selectionMode === 'none' ? undefined : selectionMode, items: '{items}' }),
  },
  render: () => (
    <>
      <div className="pg-stack">
        <span className="pg-label">Rows at each <code>size</code>: rest, hover, pressed, keyboard focus, <code>disabled</code>, slots with a <code>divider</code>, <code>danger</code></span>
        <div className="pg-row" style={{ alignItems: 'flex-start' }}>
          {sizes.map((size) => (
            <Rows key={size} size={size} />
          ))}
        </div>
      </div>

      <div className="pg-stack">
        <span className="pg-label"><code>leading</code> with an Avatar; <code>trailing</code> with a check</span>
        <Panel size="md">
          <MenuRow size="md" item={{ id: 'a', label: 'Ada Lovelace', leading: <Avatar size="xs" initials="AL" /> }} />
          <MenuRow size="md" item={{ id: 'b', label: 'Grace Hopper', leading: <Avatar size="xs" initials="GH" /> }} mark="check" selected />
        </Panel>
      </div>

      <div className="pg-stack">
        <span className="pg-label">A label that wraps keeps its slots level with the first line</span>
        <Panel size="sm">
          <MenuRow size="sm" item={{ id: 'w', label: 'Move this file and everything inside it to another folder', leading: icon(<PlusIcon />), trailing: 'Ctrl M' }} />
        </Panel>
      </div>

      <div className="pg-stack">
        <span className="pg-label">Try it: press a trigger, or focus it and press Enter, Space or an arrow key</span>
        <Actions />
        <Selection />
        <div className="pg-row">
          <Menu items={many} aria-label="Long">
            <Button type="secondary" data-testid="long-trigger">
              Long menu
            </Button>
          </Menu>
          <Menu items={actions} disabled>
            <Button type="secondary" disabled>
              Disabled
            </Button>
          </Menu>
        </div>
      </div>
    </>
  ),
} satisfies Story;
