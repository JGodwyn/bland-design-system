import { useRef, useState, type HTMLAttributes, type ReactNode, type Ref, type RefObject } from 'react';
import {
  HiddenSelect,
  mergeProps,
  mergeRefs,
  useButton,
  useComboBox,
  useFilter,
  useFocusVisible,
  useListBox,
  useOption,
  useSelect,
  VisuallyHidden,
  type AriaListBoxOptions,
} from 'react-aria';
import { useComboBoxState, useSelectState, type Key, type ListState, type Node } from 'react-stately';
import { CaretDownIcon, CheckCircleIcon, WarningCircleIcon, WarningOctagonIcon, XCircleIcon } from '../../icons';
import { Chip } from '../chip/Chip';
import { Icon } from '../icon/Icon';
import { disabledKeysOf, MenuRow, renderItem, type MenuItemData, type MenuSize } from '../menu/items';
import { Popover } from '../overlay/Popover';
import { ScrollArea } from '../scroll-area/ScrollArea';
import '../overlay/popover.css';
import '../menu/menu.css';
import './dropdown.css';

export type DropdownType = 'basic' | 'filterable' | 'multi-select';
export type DropdownSize = 'sm' | 'md' | 'lg';
export type DropdownStatus = 'default' | 'danger' | 'success' | 'warning';
/** One option: the same rows as a Menu (Figma `_menu-item`). */
export type DropdownItem = MenuItemData;

interface DropdownBaseProps extends Omit<HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange'> {
  /** The options, top to bottom. */
  items: DropdownItem[];
  /** The field height. sm 32 (default), md 40, lg 48. */
  size?: DropdownSize;
  /** The border, the helper text color and a status icon. danger also sets `aria-invalid`. */
  status?: DropdownStatus;
  /** Tied to the field. Leave it out and give an `aria-label`. */
  label?: ReactNode;
  /** Under the field and read with it (`aria-describedby`). */
  helperText?: ReactNode;
  /** While empty. Default "Select…", or "Type to filter…" when filterable. */
  placeholder?: string;
  /** Any SVG at the start of the field. */
  icon?: ReactNode;
  /** An add-on before the field, cut off by a divider (text or an `<Icon>`). */
  leading?: ReactNode;
  /** The size of the menu's rows. Default md at every field size. */
  menuSize?: MenuSize;
  /** Stops it from opening; the field draws the disabled colors. */
  disabled?: boolean;
  /** The form field name: a hidden native select (basic, multi-select) or the input's text (filterable). */
  name?: string;
  /** Filterable only: the text in the input, controlled. Pair it with `onInputChange`. */
  inputValue?: string;
  /** Filterable only: the text in the input at first, uncontrolled. */
  defaultInputValue?: string;
  /** Filterable only: called with the input's text as it changes. */
  onInputChange?: (value: string) => void;
  /** Filterable only: accessible name of the clear button, shown while the input has text. Default "Clear". */
  clearLabel?: string;
  /** Reaches the trigger: the button (basic, multi-select) or the input (filterable). */
  ref?: Ref<HTMLElement>;
  /** Reaches the bordered field box, the element the menu anchors to. */
  fieldRef?: Ref<HTMLDivElement>;
}

export interface DropdownSingleProps extends DropdownBaseProps {
  /** basic picks one option from a button; filterable types into an input to narrow the options. */
  type?: 'basic' | 'filterable';
  /** The chosen option's id, controlled (`null` for none). Pair it with `onValueChange`. */
  value?: string | null;
  /** The chosen option's id at first, uncontrolled. */
  defaultValue?: string | null;
  /** Called with the chosen option's id (`null` when cleared). */
  onValueChange?: (value: string | null) => void;
}

export interface DropdownMultipleProps extends DropdownBaseProps {
  /** Options with checkboxes; the chosen ones show as Chips in the field. */
  type: 'multi-select';
  /** The chosen option ids, controlled. Pair it with `onValueChange`. */
  value?: string[];
  /** The chosen option ids at first, uncontrolled. */
  defaultValue?: string[];
  /** Called with every chosen id after a change. */
  onValueChange?: (value: string[]) => void;
}

export type DropdownProps = DropdownSingleProps | DropdownMultipleProps;

const statusIcons = {
  danger: <WarningOctagonIcon />,
  success: <CheckCircleIcon />,
  warning: <WarningCircleIcon />,
} as const;

/** The field a Dropdown draws, whichever type: label, the bordered box, helper text (Figma `_dropdown-trigger`). */
interface FieldProps {
  base: DropdownBaseProps & { type: DropdownType };
  open: boolean;
  filled: boolean;
  labelProps: HTMLAttributes<HTMLElement>;
  labelElement: 'label' | 'span';
  helperProps: HTMLAttributes<HTMLElement>;
  setField: (el: HTMLDivElement | null) => void;
  onFieldMouseDown?: (event: React.MouseEvent<HTMLDivElement>) => void;
  /** Rendered first in the box: the basic and multi-select trigger button, laid over the whole field. */
  overlay?: ReactNode;
  /** The middle of the main row: the value, the chips or the input. */
  children: ReactNode;
  /** Between the status icon and the chevron: the filterable clear button. */
  endAction?: ReactNode;
  /** The chevron: an icon, or the filterable toggle button. */
  chevron: ReactNode;
  popover: ReactNode;
  hidden?: ReactNode;
}

function Field({ base, open, filled, labelProps, labelElement, helperProps, setField, onFieldMouseDown, overlay, children, endAction, chevron, popover, hidden }: FieldProps) {
  const {
    type,
    size = 'sm',
    status = 'default',
    label,
    helperText,
    icon,
    leading,
    disabled,
    className,
    fieldRef,
    // Read by the trigger, the state or the menu, not the root.
    items: _items,
    placeholder: _placeholder,
    menuSize: _menuSize,
    name: _name,
    inputValue: _inputValue,
    defaultInputValue: _defaultInputValue,
    onInputChange: _onInputChange,
    clearLabel: _clearLabel,
    ref: _ref,
    id: _id,
    'aria-label': _ariaLabel,
    'aria-labelledby': _ariaLabelledBy,
    'aria-describedby': _ariaDescribedBy,
    value: _value,
    defaultValue: _defaultValue,
    onValueChange: _onValueChange,
    ...rest
  } = base as DropdownBaseProps & { type: DropdownType; value?: unknown; defaultValue?: unknown; onValueChange?: unknown };
  const Label = labelElement;
  const statusIcon = status !== 'default' ? statusIcons[status] : null;
  return (
    <div
      {...rest}
      className={`bland-dropdown${className ? ` ${className}` : ''}`}
      data-type={type}
      data-size={size}
      data-status={status}
      data-filled={filled || undefined}
      data-open={open || undefined}
      data-disabled={disabled || undefined}
    >
      {label != null && label !== false && (
        <Label {...labelProps} className="bland-dropdown__label">
          {label}
        </Label>
      )}
      <div ref={mergeRefs(fieldRef, setField)} className="bland-dropdown__field bland-focus-ring bland-smooth" onMouseDown={onFieldMouseDown}>
        {overlay}
        {leading != null && leading !== false && (
          <span className="bland-dropdown__addon">
            <span className="bland-dropdown__addon-content">{leading}</span>
            <span className="bland-dropdown__divider" />
          </span>
        )}
        <span className="bland-dropdown__main">
          {icon && <Icon className="bland-dropdown__icon">{icon}</Icon>}
          {children}
          {statusIcon && <Icon className="bland-dropdown__status">{statusIcon}</Icon>}
          {endAction}
          {chevron}
        </span>
      </div>
      {helperText != null && helperText !== false && (
        <span {...helperProps} className="bland-dropdown__helper">
          {helperText}
        </span>
      )}
      {hidden}
      {popover}
    </div>
  );
}

const Chevron = () => (
  <Icon className="bland-dropdown__chevron">
    <CaretDownIcon />
  </Icon>
);

/**
 * A field that opens a menu of options to pick from. Figma `Type`: `basic` (one option, from a button),
 * `filterable` (type to narrow the options, a combobox) or `multi-select` (several, shown as Chips). React Aria
 * runs the behaviour (`useSelect`, `useComboBox`, `useListBox`); the menu is Bland's Menu panel, placed under the
 * field and as wide as it. Figma: Dropdown page, sets "Dropdown", "_dropdown-trigger" and "Menu".
 */
export function Dropdown(props: DropdownProps) {
  return props.type === 'filterable' ? <FilterableDropdown {...props} /> : <SelectDropdown {...props} />;
}

// ---- basic and multi-select: useSelect, a button laid over the field ----

function SelectDropdown(props: DropdownProps) {
  const {
    type = 'basic',
    items,
    size = 'sm',
    status = 'default',
    label,
    helperText,
    placeholder = 'Select…',
    menuSize = 'md',
    disabled = false,
    name,
    value,
    defaultValue,
    onValueChange,
    ref,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    'aria-describedby': ariaDescribedBy,
    id,
  } = props;
  const multiple = type === 'multi-select';
  const state = useSelectState<DropdownItem, 'single' | 'multiple'>({
    items,
    children: renderItem,
    disabledKeys: disabledKeysOf(items),
    selectionMode: multiple ? 'multiple' : 'single',
    value: value as Key | Key[] | null | undefined,
    defaultValue: defaultValue as Key | Key[] | null | undefined,
    onChange: (next) => (onValueChange as ((v: unknown) => void) | undefined)?.(Array.isArray(next) ? next.map(String) : next == null ? null : String(next)),
    isDisabled: disabled,
    label,
    description: helperText,
  });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { labelProps, triggerProps, valueProps, menuProps, descriptionProps } = useSelect(
    {
      selectionMode: multiple ? 'multiple' : 'single',
      isDisabled: disabled,
      label,
      description: helperText,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledBy,
      'aria-describedby': ariaDescribedBy,
      id,
      name,
    },
    state,
    buttonRef,
  );
  const { buttonProps } = useButton(triggerProps, buttonRef);
  const [field, setField] = useState<HTMLDivElement | null>(null);

  // No motion when it opens from the keyboard (React Aria's input modality) or is open from the start.
  const { isFocusVisible: keyboard } = useFocusVisible();
  const [prevOpen, setPrevOpen] = useState(state.isOpen);
  const [instant, setInstant] = useState(true);
  if (state.isOpen !== prevOpen) {
    setPrevOpen(state.isOpen);
    if (state.isOpen) setInstant(keyboard);
  }

  const selected = state.selectedItems ?? [];
  const filled = selected.length > 0;
  const first = selected[0];
  const chipSize = size;
  const keys = (state.value ?? []) as Key[];
  const remove = (key: Key) => state.setValue(keys.filter((k) => k !== key));

  return (
    <Field
      base={{ ...props, type }}
      open={state.isOpen}
      filled={filled}
      labelProps={labelProps}
      labelElement="span"
      helperProps={descriptionProps}
      setField={setField}
      overlay={
        <button
          {...buttonProps}
          ref={mergeRefs(buttonRef, ref as Ref<HTMLButtonElement>)}
          className="bland-dropdown__button"
          aria-invalid={status === 'danger' || undefined}
        />
      }
      chevron={<Chevron />}
      hidden={<HiddenSelect state={state} triggerRef={buttonRef} label={label} name={name} isDisabled={disabled} />}
      popover={
        <Popover
          open={state.isOpen}
          reference={field}
          placement="bottom-start"
          matchWidth
          instant={instant}
          onClose={state.close}
          returnFocus={buttonRef}
        >
          <div className="bland-menu bland-smooth" data-size={menuSize}>
            <ListBox listProps={menuProps} state={state} size={menuSize} mark={multiple ? 'checkbox' : 'check'} />
          </div>
        </Popover>
      }
    >
      {multiple && filled ? (
        <>
          <span className="bland-dropdown__chips">
            {selected.map((node) => (
              <Chip
                key={node.key}
                size={chipSize}
                onRemove={disabled ? undefined : () => remove(node.key)}
                removeLabel={`Remove ${node.textValue}`}
              >
                {node.value?.label ?? node.textValue}
              </Chip>
            ))}
          </span>
          {/* The button's name reads the value from here; the chips' remove buttons would add "Remove …". */}
          <VisuallyHidden {...valueProps}>{selected.map((n) => n.textValue).join(', ')}</VisuallyHidden>
        </>
      ) : (
        <span {...valueProps} className="bland-dropdown__value">
          {first ? (first.value?.label ?? first.textValue) : placeholder}
        </span>
      )}
    </Field>
  );
}

// ---- filterable: useComboBox, an input ----

function FilterableDropdown(props: DropdownSingleProps) {
  const {
    items,
    status = 'default',
    label,
    helperText,
    placeholder = 'Type to filter…',
    menuSize = 'md',
    disabled = false,
    name,
    value,
    defaultValue,
    onValueChange,
    inputValue,
    defaultInputValue,
    onInputChange,
    clearLabel = 'Clear',
    ref,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    'aria-describedby': ariaDescribedBy,
    id,
  } = props;
  const { contains } = useFilter({ sensitivity: 'base' });
  const options = {
    // defaultItems, not items: React Aria filters only uncontrolled items (it reads them on every render).
    defaultItems: items,
    children: renderItem,
    disabledKeys: disabledKeysOf(items),
    defaultFilter: contains,
    value,
    defaultValue,
    onChange: (next: Key | null) => onValueChange?.(next == null ? null : String(next)),
    inputValue,
    defaultInputValue,
    onInputChange,
    isDisabled: disabled,
    label,
    description: helperText,
    placeholder,
    name,
    id,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    'aria-describedby': ariaDescribedBy,
  };
  const state = useComboBoxState<DropdownItem>(options);
  const inputRef = useRef<HTMLInputElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listBoxRef = useRef<HTMLUListElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const { labelProps, inputProps, listBoxProps, buttonProps, descriptionProps } = useComboBox(
    { ...options, inputRef, buttonRef, listBoxRef, popoverRef },
    state,
  );
  const { buttonProps: toggleProps } = useButton(buttonProps, buttonRef);
  const [field, setField] = useState<HTMLDivElement | null>(null);
  const filled = state.inputValue !== '';

  const clear = () => {
    state.setInputValue('');
    state.setValue(null);
    inputRef.current?.focus();
  };

  // A press anywhere in the field (padding, icons) focuses the input, as a native field would.
  const focusInput = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    if (target === inputRef.current || target.closest('button, input')) return;
    event.preventDefault();
    inputRef.current?.focus();
  };

  return (
    <Field
      base={{ ...props, type: 'filterable' }}
      open={state.isOpen}
      filled={filled}
      labelProps={labelProps}
      labelElement="label"
      helperProps={descriptionProps}
      setField={setField}
      onFieldMouseDown={focusInput}
      endAction={
        filled && !disabled ? (
          <button
            type="button"
            className="bland-dropdown__clear"
            aria-label={clearLabel}
            tabIndex={-1}
            onMouseDown={(e) => e.preventDefault()}
            onClick={clear}
          >
            <Icon className="bland-dropdown__clear-icon">
              <XCircleIcon />
            </Icon>
          </button>
        ) : null
      }
      chevron={
        <button {...toggleProps} ref={buttonRef} className="bland-dropdown__toggle">
          <Chevron />
        </button>
      }
      popover={
        <Popover
          ref={popoverRef}
          open={state.isOpen}
          reference={field}
          placement="bottom-start"
          matchWidth
          instant
          dismissable={false}
          onClose={state.close}
        >
          <div className="bland-menu bland-smooth" data-size={menuSize}>
            <ListBox listProps={listBoxProps} state={state} size={menuSize} mark="check" listRef={listBoxRef} />
          </div>
        </Popover>
      }
    >
      <input
        {...inputProps}
        ref={mergeRefs(inputRef, ref as Ref<HTMLInputElement>)}
        className="bland-dropdown__input"
        aria-invalid={status === 'danger' || undefined}
      />
    </Field>
  );
}

// ---- the options ----

interface ListBoxProps {
  listProps: AriaListBoxOptions<DropdownItem>;
  state: ListState<DropdownItem>;
  size: MenuSize;
  mark: 'check' | 'checkbox';
  listRef?: RefObject<HTMLUListElement | null>;
}

function ListBox({ listProps, state, size, mark, listRef }: ListBoxProps) {
  const ownRef = useRef<HTMLUListElement>(null);
  const ref = listRef ?? ownRef;
  const { listBoxProps } = useListBox(listProps, state, ref);
  return (
    <ScrollArea fadeSize="sm" className="bland-menu__scroll">
      <ul {...listBoxProps} ref={ref} className="bland-menu__list">
        {[...state.collection].map((node) => (
          <Option key={node.key} node={node} state={state} size={size} mark={mark} />
        ))}
      </ul>
    </ScrollArea>
  );
}

function Option({ node, state, size, mark }: { node: Node<DropdownItem>; state: ListState<DropdownItem>; size: MenuSize; mark: 'check' | 'checkbox' }) {
  const ref = useRef<HTMLLIElement>(null);
  const { optionProps, labelProps, isSelected, isFocusVisible, isPressed, isDisabled } = useOption({ key: node.key }, state, ref);
  return (
    <MenuRow
      {...mergeProps(optionProps)}
      ref={ref}
      item={node.value!}
      size={size}
      mark={mark}
      selected={isSelected}
      focusVisible={isFocusVisible}
      pressed={isPressed}
      disabled={isDisabled}
      labelProps={labelProps}
    />
  );
}
