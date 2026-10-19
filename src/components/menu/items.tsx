import type { HTMLAttributes, ReactNode, Ref } from 'react';
import { Item } from 'react-stately';
import { CheckIcon } from '../../icons';
import { Icon } from '../icon/Icon';

export type MenuSize = 'sm' | 'md' | 'lg';

/** One row of a Menu or a Dropdown (Figma `_menu-item`). */
export interface MenuItemData {
  /** Unique key: what `onAction`, `value` and `selectedKeys` report. */
  id: string;
  /** Figma `✏️ Text`. Wraps onto more lines when it is long. */
  label: ReactNode;
  /** The text typeahead and screen readers use. Needed when `label` is not a string. */
  textValue?: string;
  /** Figma `🧩 Leading` (shown with `👀 Leading`): an icon or an Avatar in the 24px leading slot. */
  leading?: ReactNode;
  /** Figma `🧩 Trailing` (shown with `👀 Trailing`): a shortcut, a caret or a Badge. Keep it non-interactive. */
  trailing?: ReactNode;
  /** Figma `Danger=true`: a destructive action, label in `text-danger`. */
  danger?: boolean;
  /** Figma `State=disabled`: shown, skipped by the keyboard, cannot be chosen. */
  disabled?: boolean;
  /** Figma `👀 Divider`: a line along the row's bottom edge, to separate it from the next group. */
  divider?: boolean;
}

/** The React Stately collection element for one item, so the hooks get its key and typeahead text. */
export function renderItem(item: MenuItemData) {
  return (
    <Item key={item.id} textValue={item.textValue ?? (typeof item.label === 'string' ? item.label : item.id)}>
      {item.label}
    </Item>
  );
}

export const disabledKeysOf = (items: MenuItemData[]) => items.filter((i) => i.disabled).map((i) => i.id);

interface MenuRowProps extends HTMLAttributes<HTMLLIElement> {
  item: MenuItemData;
  size: MenuSize;
  /** How a selected row is marked: a Check in the trailing slot, or a checkbox in the leading slot. */
  mark?: 'check' | 'checkbox';
  selected?: boolean;
  focusVisible?: boolean;
  pressed?: boolean;
  disabled?: boolean;
  labelProps?: HTMLAttributes<HTMLElement>;
  ref?: Ref<HTMLLIElement>;
}

/** Figma `_menu-item`: the row a Menu item or a Dropdown option renders; the hooks give it its role and props. */
export function MenuRow({ item, size, mark, selected = false, focusVisible, pressed, disabled, labelProps, className, ref, ...rest }: MenuRowProps) {
  const checkbox = mark === 'checkbox';
  const check = mark === 'check' && selected;
  const leading = checkbox ? (
    <span className="bland-menu__checkbox bland-smooth" data-checked={selected || undefined} aria-hidden="true">
      {selected && (
        <Icon className="bland-menu__checkbox-check">
          <CheckIcon />
        </Icon>
      )}
    </span>
  ) : (
    item.leading
  );
  const trailing = check ? (
    <Icon className="bland-menu__check">
      <CheckIcon />
    </Icon>
  ) : (
    item.trailing
  );
  return (
    <li
      {...rest}
      ref={ref}
      className={`bland-menu__item${className ? ` ${className}` : ''}`}
      data-size={size}
      data-danger={item.danger || undefined}
      data-divider={item.divider || undefined}
      data-focus-visible={focusVisible || undefined}
      data-pressed={pressed || undefined}
      data-disabled={disabled || undefined}
    >
      {leading != null && leading !== false && <span className="bland-menu__slot" data-slot="leading">{leading}</span>}
      <span {...labelProps} className="bland-menu__label">
        {item.label}
      </span>
      {trailing != null && trailing !== false && <span className="bland-menu__slot" data-slot="trailing">{trailing}</span>}
    </li>
  );
}
