import type { ChangeEvent, InputHTMLAttributes, ReactNode, Ref } from 'react';
import './toggle.css';

export type ToggleSize = 'sm' | 'md';

export interface ToggleProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'role' | 'size' | 'children'> {
  /** Figma `✏️ Label`, clickable, beside the track. Leave it out (Figma `👀 Label` off) and give the toggle an `aria-label`. */
  children?: ReactNode;
  /** Figma `Size`. sm: a 40 x 24 track with a 16 knob (default, as in Figma). md: 56 x 32 with a 24 knob. The label is body-lg in both. */
  size?: ToggleSize;
  /** Figma `Checked`, controlled. */
  checked?: boolean;
  /** Starting state when `checked` is left out. */
  defaultChecked?: boolean;
  /** Called with the new on/off state. The native `onChange` works too. */
  onCheckedChange?: (checked: boolean) => void;
  /** Reaches the native `<input>`, for form libraries. */
  ref?: Ref<HTMLInputElement>;
}

/**
 * Switches a single setting on or off, taking effect immediately. A native `<input type="checkbox" role="switch">`
 * drawn as the Figma track, with the knob beside it, inside a `<label>` that is the whole hit area; `className` goes
 * on that label, every other prop on the input. Figma: Toggle page, set "Toggle".
 */
export function Toggle({ children, size = 'sm', onCheckedChange, onChange, className, ...rest }: ToggleProps) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange?.(event);
    onCheckedChange?.(event.currentTarget.checked);
  };

  return (
    <label className={`bland-toggle${className ? ` ${className}` : ''}`} data-size={size}>
      <span className="bland-toggle__control">
        <input {...rest} type="checkbox" role="switch" className="bland-toggle__track bland-focus-ring" onChange={handleChange} />
        <span className="bland-toggle__knob" aria-hidden="true" />
      </span>
      {children != null && children !== false && <span className="bland-toggle__label">{children}</span>}
    </label>
  );
}
