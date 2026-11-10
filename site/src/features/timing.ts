// The feature cards' story timings, one source for the scripts (ms from the start of a run) and their CSS (as
// custom properties on the section). Storytelling motion, so slower than Bland's 250ms UI ceiling, as the hero's
// glides are (INTERFACE.md, "Landing page"); the components keep their own UI timing inside it.

/** Arrival of a part (opacity and a short rise), the landing page's long ease-out. */
export const ARRIVE_MS = 640;
/** Parts that arrive together, in reading order. */
export const ARRIVE_STAGGER_MS = 40;
/** A move across the picture: the light/dark line, the focus ring. */
export const TRAVEL_MS = 900;
/** A color change between brands: distant hues pass through mud however they go, so keep it short. */
export const HUE_MS = 220;
/** The brand steps change left to right, this far apart. */
export const SWATCH_STAGGER_MS = 30;

/**
 * How often the stories repeat, as a multiple of their written step times (Godwin 2026-11-08: "50% faster: the
 * speed at which it repeats", so 1.5). Only the waits between steps divide by it (useLoop, playback.ts); every
 * movement keeps the durations above. A DialKit slider ("Feature row", Stories).
 */
export const STORY_SPEED = 1.5;

export const featuresStyle = {
  '--features-arrive': `${ARRIVE_MS}ms`,
  '--features-arrive-stagger': `${ARRIVE_STAGGER_MS}ms`,
  '--features-travel': `${TRAVEL_MS}ms`,
  '--features-hue': `${HUE_MS}ms`,
  '--features-swatch-stagger': `${SWATCH_STAGGER_MS}ms`,
};
