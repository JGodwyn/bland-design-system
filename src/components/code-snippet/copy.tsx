import { useState } from 'react';
import { useVisuallyHidden } from 'react-aria';

/**
 * Copy to the clipboard, shared by Code snippet and Code text. After a copy the button shows a Check and a
 * polite status region says `copiedLabel` (Figma: announce "Copied" with aria-live). Both go back when the
 * pointer leaves the button or it loses focus, so no timer (and no duration token) is needed.
 */
export function useCopy(copiedLabel: string, onCopied?: (text: string) => void) {
  const [copied, setCopied] = useState(false);
  const { visuallyHiddenProps } = useVisuallyHidden();

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // No clipboard (an insecure page, or permission refused): nothing was copied, so say nothing.
      return;
    }
    setCopied(true);
    onCopied?.(text);
  };
  const reset = () => setCopied(false);

  return {
    copied,
    copy,
    /** Spread on the copy button: the Check goes back to Copy when the pointer or focus leaves it. */
    resetProps: { onPointerLeave: reset, onBlur: reset },
    /** The live region; render it always, so the announcement is read when its text appears. */
    status: (
      <span {...visuallyHiddenProps} role="status">
        {copied ? copiedLabel : ''}
      </span>
    ),
  };
}
