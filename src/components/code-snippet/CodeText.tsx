import { useRef, type HTMLAttributes, type ReactNode } from 'react';
import { CheckIcon, CopyIcon } from '../../icons';
import { Icon } from '../icon/Icon';
import { useCopy } from './copy';
import './code-text.css';

export type CodeTextSize = 'sm' | 'md' | 'lg';

export interface CodeTextProps extends HTMLAttributes<HTMLSpanElement> {
  /** Figma `✏️ Code`: the code, set in Geist Mono. */
  children: ReactNode;
  /**
   * Figma `Size`: match the surrounding text. sm (default, as in Figma) next to body-sm, md next to body-md, lg next
   * to body-lg.
   */
  size?: CodeTextSize;
  /**
   * Figma `👀 Copy`: a copy button after the code. Off by default; its target is under 24px, so prefer a Code
   * snippet's copy button for longer code.
   */
  copyable?: boolean;
  /** The copy button's accessible name. Defaults to "Copy code". */
  copyLabel?: string;
  /** What the live region announces after a copy. Defaults to "Copied". */
  copiedLabel?: string;
  /** Called with the copied text after a successful copy. */
  onCopied?: (text: string) => void;
}

/**
 * Inline code inside running text: a `<code>` on surface-200 with a hairline border. Optionally a copy button
 * that copies the code's text. Figma: Code snippet page, set "Code-text".
 */
export function CodeText({
  children,
  size = 'sm',
  copyable = false,
  copyLabel = 'Copy code',
  copiedLabel = 'Copied',
  onCopied,
  className,
  ...rest
}: CodeTextProps) {
  const codeRef = useRef<HTMLElement>(null);
  const { copied, copy, resetProps, status } = useCopy(copiedLabel, onCopied);

  return (
    <span {...rest} className={`bland-code-text bland-smooth${className ? ` ${className}` : ''}`} data-size={size}>
      <code ref={codeRef} className="bland-code-text__code">
        {children}
      </code>
      {copyable && (
        <>
          <button
            type="button"
            className="bland-code-text__copy bland-focus-ring bland-smooth"
            aria-label={copyLabel}
            onClick={() => copy(codeRef.current?.textContent ?? '')}
            {...resetProps}
          >
            <Icon>{copied ? <CheckIcon /> : <CopyIcon />}</Icon>
          </button>
          {status}
        </>
      )}
    </span>
  );
}
