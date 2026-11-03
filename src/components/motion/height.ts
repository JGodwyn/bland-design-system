/**
 * Height motion that works in every engine (internal). CSS can animate to `height: auto` only with
 * `interpolate-size`, which only Chromium has, so a component that opens and folds (Accordion, Sidebar groups)
 * measures both heights in pixels and lets its own CSS transition run between them, as Calendar's views area
 * does. The duration and easing stay in the component's CSS (`transition: height var(--duration-md) …`), so
 * reduced motion and keyboard rules that turn the transition off also make the change instant.
 */

/**
 * Eases `el` from `from` to `to` pixels through its CSS height transition. Without one running (none set,
 * reduced motion, equal heights) it ends at once. At the end the inline height is cleared, or `onEnd` runs
 * instead and the caller clears it once its own state has settled. Returns a function that stops listening,
 * for a slide that a new one replaces: the new slide starts from the height the element shows then.
 */
export function slideHeight(el: HTMLElement, from: number, to: number, onEnd?: () => void): () => void {
  // Jump to the start without a transition, then let the change to the end run.
  const transition = el.style.transition;
  el.style.transition = 'none';
  el.style.height = `${from}px`;
  void el.offsetHeight;
  el.style.transition = transition;
  el.style.height = `${to}px`;

  const finish = () => {
    el.removeEventListener('transitionend', end);
    if (onEnd) onEnd();
    else el.style.height = '';
  };
  const end = (event: TransitionEvent) => {
    if (event.target === el && event.propertyName === 'height') finish();
  };
  // getAnimations flushes the style change, so a transition that started is listed.
  const running = el.getAnimations().some((a) => a instanceof CSSTransition && a.transitionProperty === 'height');
  if (!running) {
    finish();
    return () => {};
  }
  el.addEventListener('transitionend', end);
  return () => el.removeEventListener('transitionend', end);
}

/** Whether `el` is in the middle of a slide (it holds an inline height). */
export const sliding = (el: HTMLElement) => el.style.height !== '';
