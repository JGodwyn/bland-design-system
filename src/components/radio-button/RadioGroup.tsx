import { useId, type FieldsetHTMLAttributes, type ReactNode } from 'react';
import { RadioGroupContext, type RadioSize } from './Radio';
import './radio-button.css';

export type RadioGroupOrientation = 'vertical' | 'horizontal';

interface RadioGroupBaseProps extends Omit<FieldsetHTMLAttributes<HTMLFieldSetElement>, 'defaultValue' | 'onChange'> {
  /** The Radio elements. */
  children: ReactNode;
  /** The name every radio inside shares, so the browser keeps one selected. Generated when left out. */
  name?: string;
  /** The selected radio's value, controlled. */
  value?: string;
  /** The radio selected at first when `value` is left out. */
  defaultValue?: string;
  /** Called with the newly selected radio's value. */
  onValueChange?: (value: string) => void;
  /** Passed to every Radio inside that sets none. Default sm. */
  size?: RadioSize;
  /** Vertical rows touch (no gap); horizontal items sit space-lg (16) apart and wrap. */
  orientation?: RadioGroupOrientation;
  /** Disables every radio inside (the native fieldset `disabled`). */
  disabled?: boolean;
}

/** A group needs a name screen readers announce: `aria-label`, or `aria-labelledby` pointing at a visible heading. */
export type RadioGroupProps = RadioGroupBaseProps & ({ 'aria-label': string } | { 'aria-labelledby': string });

/**
 * Lists Radio Button instances vertically or horizontally, as a `<fieldset role="radiogroup">`. Native radios
 * with one name give Tab into the set and arrow keys between options. Figma: Radio Button page, set "Radio Button Group".
 */
export function RadioGroup({
  children,
  name,
  value,
  defaultValue,
  onValueChange,
  size = 'sm',
  orientation = 'vertical',
  className,
  ...rest
}: RadioGroupProps) {
  const ownName = useId();
  return (
    <fieldset
      {...rest}
      role="radiogroup"
      className={`bland-radio-group${className ? ` ${className}` : ''}`}
      data-size={size}
      data-orientation={orientation}
    >
      <RadioGroupContext.Provider value={{ name: name ?? ownName, size, value, defaultValue, onValueChange }}>
        {children}
      </RadioGroupContext.Provider>
    </fieldset>
  );
}
