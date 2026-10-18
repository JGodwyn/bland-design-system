import type { FieldsetHTMLAttributes, ReactNode } from 'react';
import { CheckboxGroupContext, type CheckboxSize } from './Checkbox';
import './checkbox.css';

export type CheckboxGroupOrientation = 'vertical' | 'horizontal';

interface CheckboxGroupBaseProps extends FieldsetHTMLAttributes<HTMLFieldSetElement> {
  /** The Checkbox elements. */
  children: ReactNode;
  /** Figma `Size`, passed to every Checkbox inside that sets none. Default sm, as in Figma. */
  size?: CheckboxSize;
  /** Figma `Orientation`. Vertical rows touch (no gap); horizontal items sit space-lg (16) apart and wrap. */
  orientation?: CheckboxGroupOrientation;
  /** Disables every checkbox inside (the native fieldset `disabled`). */
  disabled?: boolean;
}

/** A group needs a name screen readers announce: `aria-label`, or `aria-labelledby` pointing at a visible heading. */
export type CheckboxGroupProps = CheckboxGroupBaseProps &
  ({ 'aria-label': string } | { 'aria-labelledby': string });

/** Lists Checkbox instances vertically or horizontally, as a `<fieldset>`. Figma: Checkbox page, set "Checkbox Group". */
export function CheckboxGroup({ children, size = 'sm', orientation = 'vertical', className, ...rest }: CheckboxGroupProps) {
  return (
    <fieldset
      {...rest}
      className={`bland-checkbox-group${className ? ` ${className}` : ''}`}
      data-size={size}
      data-orientation={orientation}
    >
      <CheckboxGroupContext.Provider value={{ size }}>{children}</CheckboxGroupContext.Provider>
    </fieldset>
  );
}
