/**
 * Exit motion for top-layer elements (internal): Menu and Dropdown's popover, Tooltip, Modal. CSS can animate an
 * element out of the top layer only by transitioning `overlay` and `display`, which only Chromium does; Safari and
 * Firefox hide it at once. So the exit styles hang on `data-closing` while the element is still shown (a popover
 * still open, a dialog still open), and it leaves the top layer once those transitions have finished.
 */

const pending = new WeakMap<Element, number>();
let exits = 0;

/**
 * Plays `el`'s exit, then calls `hide`. With no transition running (`data-instant`, reduced motion without
 * one) `hide` runs as soon as the browser settles the promise. A `cancelExit` in between (it opened again) or a
 * newer exit drops this one.
 */
export function exitThenHide(el: HTMLElement, hide: () => void, { subtree = false } = {}) {
  const token = ++exits;
  pending.set(el, token);
  el.setAttribute('data-closing', '');
  // getAnimations flushes the style change, so the exit transitions it starts are listed. Transitions only: an
  // animation that loops inside (a loading spinner) would never let it close.
  const animations = el.getAnimations({ subtree }).filter((a) => a instanceof CSSTransition);
  void Promise.allSettled(animations.map((a) => a.finished)).then(() => {
    if (pending.get(el) !== token) return;
    pending.delete(el);
    el.removeAttribute('data-closing');
    hide();
  });
}

/** Stops a pending exit: `el` is showing again, and its open styles come back from wherever the exit was. */
export function cancelExit(el: HTMLElement) {
  if (!pending.has(el)) return;
  pending.delete(el);
  el.removeAttribute('data-closing');
}

/** Whether `el` is playing its exit. */
export const exiting = (el: Element) => pending.has(el);
