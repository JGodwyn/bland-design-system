import {
  createContext,
  useContext,
  useLayoutEffect,
  useRef,
  type ChangeEvent,
  type InputHTMLAttributes,
  type ReactNode,
  type Ref,
} from 'react';
import { CheckIcon, MinusIcon } from '../../icons';
import { Icon } from '../icon/Icon';
import './checkbox.css';

export type CheckboxSize = 'sm' | 'md';
export type CheckboxChecked = boolean | 'mixed';

/** What a CheckboxGroup hands its checkboxes. */
export const CheckboxGroupContext = createContext<{ size?: CheckboxSize }>({});

export interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size' | 'checked' | 'defaultChecked' | 'children'> {
  /** Figma `✏️ Label`, clickable. Leave it out (Figma `👀 Label` off) and give the checkbox an `aria-label`. */
  children?: ReactNode;
  /** Figma `Size`. sm: a 16 box in a 24 hit area, body-md label (default, as in Figma). md: 20 in 32, body-lg. Inside a CheckboxGroup, the group's size. */
  size?: CheckboxSize;
  /** Figma `Checked`, controlled: `true`, `false` or `'mixed'` (a parent whose children are partly selected; the native `indeterminate`). */
  checked?: CheckboxChecked;
  /** Starting state when `checked` is left out. `'mixed'` clears on the first click, as a native checkbox does. */
  defaultChecked?: CheckboxChecked;
  /** Called with the input's new checked state. The native `onChange` works too. */
  onCheckedChange?: (checked: boolean) => void;
  /** Reaches the native `<input>`, for form libraries. */
  ref?: Ref<HTMLInputElement>;
}

/**
 * Lets people select any number of options. A native `<input type="checkbox">` drawn as the Figma box, inside a
 * `<label>` that is the whole hit area; `className` goes on that label, every other prop on the input.
 * Figma: Checkbox page, set "Checkbox".
 */
export function Checkbox({
  children,
  size,
  checked,
  defaultChecked,
  onCheckedChange,
  onChange,
  className,
  ref,
  ...rest
}: CheckboxProps) {
  const group = useContext(CheckboxGroupContext);
  const input = useRef<HTMLInputElement | null>(null);
  const mixed = checked === 'mixed';

  // `indeterminate` is a DOM property with no attribute, so it is set here.
  useLayoutEffect(() => {
    if (input.current && checked !== undefined) input.current.indeterminate = mixed;
  }, [checked, mixed]);
  useLayoutEffect(() => {
    if (input.current && defaultChecked === 'mixed') input.current.indeterminate = true;
    // Only on mount: an uncontrolled checkbox owns its state afterwards.
  }, []);

  const setRef = (el: HTMLInputElement | null) => {
    input.current = el;
    if (typeof ref === 'function') ref(el);
    else if (ref) ref.current = el;
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange?.(event);
    onCheckedChange?.(event.currentTarget.checked);
    // The browser clears indeterminate on click; a controlled mixed box stays mixed until `checked` changes.
    if (mixed) event.currentTarget.indeterminate = true;
  };

  return (
    <label className={`bland-checkbox${className ? ` ${className}` : ''}`} data-size={size ?? group.size ?? 'sm'}>
      <span className="bland-checkbox__control">
        <input
          {...rest}
          ref={setRef}
          type="checkbox"
          className="bland-checkbox__input bland-focus-ring bland-smooth"
          checked={checked === undefined ? undefined : checked === true}
          defaultChecked={defaultChecked === undefined ? undefined : defaultChecked === true}
          onChange={handleChange}
        />
        <Icon className="bland-checkbox__check">
          <CheckIcon />
        </Icon>
        <Icon className="bland-checkbox__mixed">
          <MinusIcon />
        </Icon>
      </span>
      {children != null && children !== false && <span className="bland-checkbox__label">{children}</span>}
    </label>
  );
}
