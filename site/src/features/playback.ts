// Playback for the feature cards (Godwin 2026-11-08, replacing play-once): each card's story starts when the card
// first scrolls into view (FEATURE_STAGGER_MS apart in reading order) and then loops for as long as it is in view.
// It pauses while a mouse is over the card, while a finger or button is held on it, and while focus is inside it,
// so people can try the controls the cards hold; it picks up where it was once they leave. Under reduced motion
// nothing loops: every card shows its poster step, and its controls still work.
import { createContext, useContext, useEffect, useRef, useState, type RefObject } from 'react';
import { STORY_SPEED } from './timing';

/** How fast the stories play (timing.ts, STORY_SPEED); the row provides its DialKit value. */
export const StorySpeed = createContext(STORY_SPEED);

/** Delay between the cards' first starts when they come into view together, in reading order. */
export const FEATURE_STAGGER_MS = 100;
/** How much of a card must be on screen for its story to run: as soon as it shows (Godwin 2026-11-08, "play
 *  immediately the container comes into view"; was 45%). */
const IN_VIEW = 0.05;

const reducedQuery = '(prefers-reduced-motion: reduce)';

export type Playback = {
  /** The card's root, observed for view, hover, presses and focus. */
  ref: RefObject<HTMLElement | null>;
  /** True once the card has been seen (and its stagger has passed). */
  started: boolean;
  /** True while the story should move: seen, in view, not hovered, held or focused, motion allowed. */
  active: boolean;
  /** True under prefers-reduced-motion: show the poster. */
  reduced: boolean;
  /** True while a mouse is over the card, a press is held on it or focus is inside it. */
  engaged: boolean;
};

export function usePlayback(index: number, { stagger = true }: { stagger?: boolean } = {}): Playback {
  const ref = useRef<HTMLElement | null>(null);
  const [started, setStarted] = useState(false);
  const [inView, setInView] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [held, setHeld] = useState(false);
  const [focused, setFocused] = useState(false);
  const [reduced, setReduced] = useState(() => window.matchMedia(reducedQuery).matches);

  useEffect(() => {
    const media = window.matchMedia(reducedQuery);
    const update = () => setReduced(media.matches);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let timer = 0;
    let seen = false;
    const view = new IntersectionObserver(
      ([entry]) => {
        const visible = !!entry?.isIntersecting;
        setInView(visible);
        if (visible && !seen) {
          seen = true;
          // In the grid, cards that come into view together start in reading order; in the row each starts at once.
          if (stagger && index > 0) timer = window.setTimeout(() => setStarted(true), index * FEATURE_STAGGER_MS);
          else setStarted(true);
        }
      },
      { threshold: IN_VIEW },
    );
    view.observe(el);
    const enter = (e: PointerEvent) => e.pointerType === 'mouse' && setHovered(true);
    const leave = (e: PointerEvent) => e.pointerType === 'mouse' && setHovered(false);
    const down = () => setHeld(true);
    const up = () => setHeld(false);
    const focusIn = () => setFocused(true);
    const focusOut = (e: FocusEvent) => {
      if (!el.contains(e.relatedTarget as Node | null)) setFocused(false);
    };
    el.addEventListener('pointerenter', enter);
    el.addEventListener('pointerleave', leave);
    el.addEventListener('pointerdown', down);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    el.addEventListener('focusin', focusIn);
    el.addEventListener('focusout', focusOut);
    return () => {
      view.disconnect();
      window.clearTimeout(timer);
      el.removeEventListener('pointerenter', enter);
      el.removeEventListener('pointerleave', leave);
      el.removeEventListener('pointerdown', down);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
      el.removeEventListener('focusin', focusIn);
      el.removeEventListener('focusout', focusOut);
    };
  }, [index, stagger]);

  const engaged = hovered || held || focused;
  return { ref, started, active: started && inView && !engaged && !reduced, reduced, engaged };
}

/**
 * A looping story as numbered steps. Step i shows for `hold[i]` ms, then the next; after the last it goes back to
 * `loopFrom` (steps before it, such as an entrance, play once). While `active` is false the clock stops and keeps
 * what was left of the current step, so a pause resumes where it was. Under reduced motion it is always `poster`.
 */
export function useLoop(active: boolean, reduced: boolean, hold: readonly number[], loopFrom: number, poster: number) {
  const [step, setStep] = useState(0);
  const left = useRef<number | null>(null); // ms left of the current step, when paused mid-step
  const speed = useContext(StorySpeed);
  const key = hold.join(',');

  useEffect(() => {
    if (reduced || !active) return;
    const ms = left.current ?? (hold[step] ?? 0) / speed;
    const begun = performance.now();
    let fired = false;
    const timer = window.setTimeout(() => {
      fired = true;
      left.current = null;
      setStep((s) => (s + 1 < hold.length ? s + 1 : loopFrom));
    }, ms);
    return () => {
      window.clearTimeout(timer);
      // Paused mid-step: keep what was left of it for the resume.
      if (!fired) left.current = Math.max(0, ms - (performance.now() - begun));
    };
    // `hold` is read through `key`: a new array with the same times is the same story.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, reduced, step, loopFrom, key, speed]);

  return reduced ? poster : step;
}
