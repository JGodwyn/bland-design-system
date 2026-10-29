import { useEffect, useRef, useState } from 'react';
import { useVisuallyHidden } from 'react-aria';
import { tokenMs } from '../overlay/floating';

/**
 * Copy to the clipboard, shared by Code snippet and Code text. After a copy the button shows a Check and a
 * polite status region says `copiedLabel` (Figma: announce "Copied" with aria-live). Both stay for
 * `duration/copied-visible` (2s), wherever the pointer is, then the Copy icon comes back (Godwin, 2026-10-22).
 * Another copy in that time starts the wait again.
 */
/**
 * Copies through a selected, read-only textarea out of sight and `document.execCommand('copy')`. Deprecated, but
 * the only way on a page without the Clipboard API. Focus goes back where it was. True when the browser copied.
 */
function legacyCopy(text: string): boolean {
  const field = document.createElement('textarea');
  field.value = text;
  field.readOnly = true;
  field.setAttribute('aria-hidden', 'true');
  Object.assign(field.style, { position: 'fixed', top: '0', left: '0', opacity: '0', pointerEvents: 'none' });
  const back = document.activeElement as HTMLElement | null;
  document.body.append(field);
  field.select();
  field.setSelectionRange(0, text.length); // iOS selects nothing with select() alone
  let copied = false;
  try {
    copied = document.execCommand('copy');
  } catch {
    copied = false;
  }
  field.remove();
  back?.focus({ preventScroll: true });
  return copied;
}

export function useCopy(copiedLabel: string, onCopied?: (text: string) => void) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const { visuallyHiddenProps } = useVisuallyHidden();
  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = async (text: string) => {
    // The Clipboard API exists only on secure pages (https, localhost); a page opened by its network address over
    // plain http (a phone on the same Wi-Fi) has none, so the old copy command takes over there.
    if (!navigator.clipboard) {
      if (!legacyCopy(text)) return;
    } else {
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        // Permission refused: try the old way; if that fails too, nothing was copied, so say nothing.
        if (!legacyCopy(text)) return;
      }
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
