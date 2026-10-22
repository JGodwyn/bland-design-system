import { useEffect, useRef, useState } from 'react';
import { useVisuallyHidden } from 'react-aria';
import { tokenMs } from '../overlay/floating';

/**
 * Copy to the clipboard, shared by Code snippet and Code text. After a copy the button shows a Check and a
 * polite status region says `copiedLabel` (Figma: announce "Copied" with aria-live). Both stay for
 * `duration/copied-visible` (2s), wherever the pointer is, then the Copy icon comes back (Godwin, 2026-10-22).
 * Another copy in that time starts the wait again.
 */
export function useCopy(copiedLabel: string, onCopied?: (text: string) => void) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const { visuallyHiddenProps } = useVisuallyHidden();
  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // No clipboard (an insecure page, or permission refused): nothing was copied, so say nothing.
      return;
    }
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), tokenMs('--duration-copied-visible'));
    onCopied?.(text);
  };

  return {
    copied,
    copy,
    /** The live region; render it always, so the announcement is read when its text appears. */
    status: (
      <span {...visuallyHiddenProps} role="status">
        {copied ? copiedLabel : ''}
      </span>
    ),
  };
}
