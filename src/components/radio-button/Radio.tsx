import { createContext, useContext, type ChangeEvent, type InputHTMLAttributes, type ReactNode, type Ref } from 'react';
import './radio-button.css';

export type RadioSize = 'sm' | 'md';

/** What a RadioGroup hands its radios: the shared name, size and (when controlled) the selected value. */
export const RadioGroupContext = createContext<{
  name?: string;
  size?: RadioSize;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
} | null>(null);

export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size' | 'value' | 'children'> {
  /** Clickable. Leave it out and give the radio an `aria-label`. */
  children?: ReactNode;
  /** The value this option submits, and what RadioGroup's `value` matches. */
  value: string;
  /** sm: a 16 circle in a 24 hit area, body-md label (default). md: 20 in 32, body-lg. Inside a RadioGroup, the group's size. */
  size?: RadioSize;
  /** Checked, controlled. Inside a RadioGroup, leave it out: the group's `value` decides. */
  checked?: boolean;
  /** Reaches the native `<input>`, for form libraries. */
  ref?: Ref<HTMLInputElement>;
}

/**
 * Lets people select exactly one option from a set. A native `<input type="radio">` drawn as the Figma circle,
 * inside a `<label>` that is the whole hit area; `className` goes on that label, every other prop on the input.
 * Use it inside a RadioGroup, which names the set and gives arrow-key movement between options.
 * Figma: Radio Button page, set "Radio Button".
 */
export function Radio({ children, value, size, checked, defaultChecked, name, onChange, className, ...rest }: RadioProps) {
  const group = useContext(RadioGroupContext);
  const controlled = checked !== undefined || group?.value !== undefined;

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange?.(event);
    if (event.currentTarget.checked) group?.onValueChange?.(value);
  };

  return (
    <label className={`bland-radio${className ? ` ${className}` : ''}`} data-size={size ?? group?.size ?? 'sm'}>
      <span className="bland-radio__control">
        <input
          {...rest}
          type="radio"
          className="bland-radio__input bland-focus-ring"
          name={name ?? group?.name}
          value={value}
          checked={controlled ? (checked ?? group?.value === value) : undefined}
          defaultChecked={controlled ? undefined : (defaultChecked ?? (group?.defaultValue !== undefined && group.defaultValue === value))}
          onChange={handleChange}
        />
        <span className="bland-radio__dot" aria-hidden="true" />
      </span>
      {children != null && children !== false && <span className="bland-radio__label">{children}</span>}
    </label>
  );
}
