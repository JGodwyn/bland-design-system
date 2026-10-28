import {
  cloneElement,
  useRef,
  useState,
  type HTMLAttributes,
  type Key,
  type ReactElement,
  type Ref,
} from 'react';
import {
  DismissButton,
  mergeProps,
  mergeRefs,
  useButton,
  useFocusVisible,
  useMenu,
  useMenuItem,
  useMenuTrigger,
  type AriaMenuOptions,
} from 'react-aria';
import { useMenuTriggerState, useTreeState, type Node, type TreeState } from 'react-stately';
import type { Placement } from '@floating-ui/react-dom';
import { ScrollArea } from '../scroll-area/ScrollArea';
import { Popover } from '../overlay/Popover';
import { disabledKeysOf, MenuRow, renderItem, type MenuItemData, type MenuSize } from './items';
import '../overlay/popover.css';
import './menu.css';

export type { MenuItemData, MenuSize } from './items';
export type MenuPlacement = Placement;
export type MenuSelectionMode = 'single' | 'multiple';

export interface MenuProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'onSelectionChange'> {
  /**
   * The trigger: one focusable element that takes a `ref` and DOM props (a Button, an Icon Button). It gets the
   * press and keyboard handlers, `aria-haspopup` and `aria-expanded`.
   */
  children: ReactElement;
  /** The rows, top to bottom. */
  items: MenuItemData[];
  /** Called with an item's `id` when it is chosen (a press, Enter or Space). The menu then closes. */
  onAction?: (id: string) => void;
  /** The row size. sm 32 (default), md 40, lg 48 with one line. */
  size?: MenuSize;
  /** Where the menu opens, in Floating UI's names. Default `bottom-start`; flips when there is no room. */
  placement?: MenuPlacement;
  /** Open, controlled. Pair it with `onOpenChange`. */
  open?: boolean;
  /** Starts open when `open` is left out. */
  defaultOpen?: boolean;
  /** Called with the new open state. */
  onOpenChange?: (open: boolean) => void;
  /** Stops the trigger from opening it. */
  disabled?: boolean;
  /** Makes the items checkable: `single` (one at a time) or `multiple`. A selected item shows a Check at its end. */
  selectionMode?: MenuSelectionMode;
  /** The selected item ids, controlled. Pair it with `onSelectionChange`. */
  selectedKeys?: string[];
  /** The selected item ids at first, uncontrolled. */
  defaultSelectedKeys?: string[];
  /** Called with every selected id after a change. */
  onSelectionChange?: (ids: string[]) => void;
  /** Whether choosing an item closes the menu. Default true, false in `multiple` selection. */
  closeOnSelect?: boolean;
  /** Reaches the menu panel. */
  ref?: Ref<HTMLDivElement>;
}

const toIds = (keys: 'all' | Set<Key>, items: MenuItemData[]) =>
  keys === 'all' ? items.filter((i) => !i.disabled).map((i) => i.id) : [...keys].map(String);

/**
 * A list of actions in a floating panel, opened from its trigger. React Aria runs the behaviour (arrow keys,
 * typeahead, Escape returning focus to the trigger, `role="menu"`); Floating UI places it under the trigger and
 * caps it to the screen, past which it scrolls with the fade and the visible thumb. Figma: Dropdown page, sets
 * "Menu" and "_menu-item".
 */
export function Menu({
  children,
  items,
  onAction,
  size = 'sm',
  placement = 'bottom-start',
  open,
  defaultOpen,
  onOpenChange,
  disabled = false,
  selectionMode,
  selectedKeys,
  defaultSelectedKeys,
  onSelectionChange,
  closeOnSelect,
  className,
  ref,
  'aria-label': ariaLabel,
  ...rest
}: MenuProps) {
  const state = useMenuTriggerState({ isOpen: open, defaultOpen, onOpenChange });
  const triggerRef = useRef<HTMLElement>(null);
  const [triggerEl, setTriggerEl] = useState<HTMLElement | null>(null);
  const { menuTriggerProps, menuProps } = useMenuTrigger({ isDisabled: disabled }, state, triggerRef);
  // useButton's native `type="button"` would replace a Bland Button's Figma `type`; Bland's buttons default to it anyway.
  const { buttonProps: ariaButtonProps } = useButton({ ...menuTriggerProps, isDisabled: disabled }, triggerRef);
  const { type: _type, ...buttonProps } = ariaButtonProps as typeof ariaButtonProps & { type?: string };

  // No motion when it opens from the keyboard (React Aria's input modality) or is open from the start.
  const { isFocusVisible: keyboard } = useFocusVisible();
  const [prevOpen, setPrevOpen] = useState(state.isOpen);
  const [instant, setInstant] = useState(true);
  if (state.isOpen !== prevOpen) {
    setPrevOpen(state.isOpen);
    if (state.isOpen) setInstant(keyboard);
  }

  const child = children as ReactElement<{ ref?: Ref<HTMLElement> } & Record<string, unknown>>;

  return (
    <>
      {cloneElement(child, {
        ...mergeProps(child.props, buttonProps),
        ref: mergeRefs<HTMLElement>(child.props.ref, triggerRef, (el: HTMLElement | null) => setTriggerEl(el)),
      })}
      <Popover
        open={state.isOpen}
        reference={triggerEl}
        placement={placement}
        instant={instant}
        onClose={state.close}
        returnFocus={triggerRef}
      >
        <div {...rest} ref={ref} className={`bland-menu bland-smooth${className ? ` ${className}` : ''}`} data-size={size}>
          <MenuList
            {...menuProps}
            aria-label={ariaLabel}
            items={items}
            size={size}
            onAction={onAction ? (key) => onAction(String(key)) : undefined}
            selectionMode={selectionMode}
            selectedKeys={selectedKeys}
            defaultSelectedKeys={defaultSelectedKeys}
            onSelectionChange={onSelectionChange ? (keys) => onSelectionChange(toIds(keys, items)) : undefined}
            closeOnSelect={closeOnSelect}
          />
          <DismissButton onDismiss={state.close} />
        </div>
      </Popover>
    </>
  );
}

interface MenuListProps extends AriaMenuOptions<MenuItemData> {
  items: MenuItemData[];
  size: MenuSize;
  closeOnSelect?: boolean;
}

function MenuList({ items, size, closeOnSelect, ...props }: MenuListProps) {
  const state = useTreeState<MenuItemData>({
    ...props,
    items,
    children: renderItem,
    disabledKeys: disabledKeysOf(items),
  });
  const listRef = useRef<HTMLUListElement>(null);
  const { menuProps } = useMenu(props, state, listRef);
  return (
    <ScrollArea fadeSize="sm" className="bland-menu__scroll">
      <ul {...menuProps} ref={listRef} className="bland-menu__list">
        {[...state.collection].map((node) => (
          <MenuItem key={node.key} node={node} state={state} size={size} closeOnSelect={closeOnSelect} />
        ))}
      </ul>
    </ScrollArea>
  );
}

function MenuItem({ node, state, size, closeOnSelect }: { node: Node<MenuItemData>; state: TreeState<MenuItemData>; size: MenuSize; closeOnSelect?: boolean }) {
  const ref = useRef<HTMLLIElement>(null);
  const { menuItemProps, labelProps, isFocusVisible, isPressed, isDisabled, isSelected } = useMenuItem(
    { key: node.key, closeOnSelect },
    state,
    ref,
  );
  const selectable = state.selectionManager.selectionMode !== 'none';
  return (
    <MenuRow
      {...menuItemProps}
      ref={ref}
      item={node.value!}
      size={size}
      mark={selectable ? 'check' : undefined}
      selected={isSelected}
      focusVisible={isFocusVisible}
      pressed={isPressed}
      disabled={isDisabled}
      labelProps={labelProps}
    />
  );
}
