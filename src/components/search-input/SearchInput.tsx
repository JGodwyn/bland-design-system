import { useRef, type KeyboardEvent } from 'react';
import { MagnifyingGlassIcon, XCircleIcon } from '../../icons';
import { Icon } from '../icon/Icon';
import { InputField, type TextInputProps, type TextInputSize } from '../text-input/TextInput';
import './search-input.css';

export type SearchInputSize = TextInputSize;

export interface SearchInputProps
  extends Omit<TextInputProps, 'type' | 'status' | 'label' | 'helperText' | 'iconStart' | 'iconEnd' | 'altText' | 'leading' | 'trailing'> {
  /** sm 32 (default), md 40, lg 48. */
  size?: SearchInputSize;
  /** A clear button shows while the field has a value. Escape clears too. */
  clearable?: boolean;
  /** Called after the clear button (or Escape) empties the field. `onChange` fires as well, with the empty value. */
  onClear?: () => void;
  /** Accessible name of the clear button. */
  clearLabel?: string;
}

/** Sets the value the way typing does, so React's onChange fires for controlled and uncontrolled fields alike. */
function clearNative(input: HTMLInputElement) {
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!;
  setter.call(input, '');
  input.dispatchEvent(new Event('input', { bubbles: true }));
}

/**
 * Search field with a search icon and an optional clear button. A native `<input type="search">` (role
 * searchbox) on the Text Input field; it is named "Search" unless given an `aria-label` or `aria-labelledby`.
 * Figma: Text-input page, set "Search Input".
 */
export function SearchInput({
  clearable = false,
  onClear,
  clearLabel = 'Clear search',
  className,
  onKeyDown,
  ref,
  ...rest
}: SearchInputProps) {
  const input = useRef<HTMLInputElement | null>(null);
  const named = rest['aria-label'] !== undefined || rest['aria-labelledby'] !== undefined;

  const clear = () => {
    if (!input.current || input.current.value === '') return;
    clearNative(input.current);
    onClear?.();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(event);
    if (!event.defaultPrevented && event.key === 'Escape' && clearable && event.currentTarget.value !== '') {
      event.preventDefault();
      clear();
    }
  };

  return (
    <InputField
      {...rest}
      aria-label={named ? rest['aria-label'] : 'Search'}
      type="search"
      className={`bland-search-input${className ? ` ${className}` : ''}`}
      iconStart={<MagnifyingGlassIcon />}
      onKeyDown={handleKeyDown}
      ref={(el: HTMLInputElement | null) => {
        input.current = el;
        if (typeof ref === 'function') ref(el);
        else if (ref) (ref as { current: HTMLInputElement | null }).current = el;
      }}
      endAction={
        clearable && (
          // Out of the tab order: Escape clears from the keyboard, so Tab goes straight past the field.
          <button
            type="button"
            tabIndex={-1}
            className="bland-search-input__clear"
            aria-label={clearLabel}
            disabled={rest.disabled}
            onClick={() => {
              clear();
              input.current?.focus();
            }}
          >
            <Icon>
              <XCircleIcon />
            </Icon>
          </button>
        )
      }
    />
  );
}

