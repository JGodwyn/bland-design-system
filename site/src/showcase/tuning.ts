// The Components showcase's motion, every parameter with its default and range. In `npm run site` DialKit edits
// them live (the "Showcase" folder, bottom right); builds use the defaults (site/src/dialkit-stub.ts). CSS reads
// them as custom properties (showcaseStyle); the change wave reads them in Showcase.tsx.
import type { CSSProperties } from 'react';
import { useDialKit, type DialConfig } from 'dialkit';

const config = {
  entrance: {
    // The nine cards pop in when the panel scrolls into view: from this scale, swinging past full size by the
    // overshoot, this far apart in reading order (What you get pops its parts the same way, from 0.4).
    from: [0.8, 0.3, 1, 0.01],
    popMs: [620, 100, 2000, 10],
    overshoot: [1.6, 1, 4, 0.05],
    staggerMs: [40, 0, 120, 1],
  },
  wave: {
    // A brand, theme or font change reaches the cards one after another, starting at the toolbar, this far apart.
    staggerMs: [40, 0, 120, 1],
    // Each card's brand colors ease to the new brand over this long (theme and font switch at once in each card).
    brandMs: [200, 0, 1200, 10],
  },
  theme: {
    // The theme button sinks to this scale while pressed, then pops past full size by this much as it lets go.
    sink: [0.9, 0.7, 1, 0.01],
    pop: [1.08, 1, 1.4, 0.01],
    popMs: [420, 100, 1200, 10],
    // The new theme grows out of the button as a circle until it covers the panel (easing/drawer); under reduced
    // motion the panel cross-fades instead.
    revealMs: [600, 100, 2000, 10],
    fadeMs: [200, 0, 1000, 10],
  },
  parts: {
    // The Button shows its spinner this long after a press; the ring under the active swatch slides this long.
    buttonLoadingMs: [1200, 200, 4000, 50],
    swatchRingMs: [200, 0, 1000, 10],
    // An added file climbs a quarter of its progress bar this often.
    uploadStepMs: [400, 100, 2000, 10],
  },
} satisfies DialConfig;

export function useShowcaseTuning() {
  return useDialKit('Showcase', config);
}

export type ShowcaseTuning = ReturnType<typeof useShowcaseTuning>;

/** The custom properties showcase.css reads. */
export function showcaseStyle(t: ShowcaseTuning): CSSProperties {
  const ms = (n: number) => `${n}ms`;
  return {
    '--showcase-pop-from': String(t.entrance.from),
    '--showcase-pop': ms(t.entrance.popMs),
    '--showcase-pop-stagger': ms(t.entrance.staggerMs),
    '--showcase-ease-pop': `cubic-bezier(0.34, ${t.entrance.overshoot}, 0.64, 1)`,
    '--showcase-wave-stagger': ms(t.wave.staggerMs),
    '--showcase-brand-ease': ms(t.wave.brandMs),
    '--showcase-ring': ms(t.parts.swatchRingMs),
    '--showcase-theme-sink': String(t.theme.sink),
  } as CSSProperties;
}
