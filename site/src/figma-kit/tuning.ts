// The Figma kit section's motion, every parameter with its default and range. In `npm run site` DialKit edits them
// live (the "Figma kit" folder, bottom right); builds use the defaults (site/src/dialkit-stub.ts). The text numbers
// start from What you get's (the hero description's rise), so the copy enters the way the sections above it do; the
// picture's parts follow in a stagger (Godwin 2026-11-09: no pop on the picture). CSS reads them as custom properties (figmaKitStyle); the
// picture's story reads its step times in FigmaFile.tsx.
import type { CSSProperties } from 'react';
import { useDialKit, type DialConfig } from 'dialkit';

const config = {
  text: {
    // When the section comes into view its words rise in from this far below, one after another (What you get's
    // sentence rise), then the description, button and checklist rows follow, this far apart.
    riseY: [68, 0, 120, 1],
    staggerMs: [14, 0, 80, 1],
    riseMs: [520, 100, 2000, 10],
    blockStaggerMs: [80, 0, 300, 5],
  },
  parts: {
    // Then the picture comes in piece by piece: its card fades in, the panel, Mode switch, Button set and
    // Variables card rise in one after another, and the set's buttons appear in a wave from its top left.
    delayMs: [240, 0, 1200, 10],
    fadeMs: [320, 0, 1200, 10],
    riseY: [24, 0, 80, 1],
    riseMs: [520, 100, 2000, 10],
    staggerMs: [90, 0, 300, 5],
    buttonStaggerMs: [18, 0, 80, 1],
  },
  story: {
    // The picture's loop: a rest, the cursor's move to what it presses, the press, then the hold on each result.
    restMs: [1400, 200, 5000, 50],
    moveMs: [800, 200, 3000, 50],
    pressMs: [200, 60, 800, 10],
    holdMs: [2000, 400, 6000, 50],
    codeHoldMs: [2800, 400, 8000, 50],
    // The cursor's glide between targets (the landing glide easing) and how far it sinks while pressing.
    travelMs: [700, 100, 2000, 10],
    pressScale: [0.85, 0.6, 1, 0.01],
    // A new brand reaches the canvas buttons one after another, each easing over this long.
    hueMs: [220, 0, 1200, 10],
    hueStaggerMs: [60, 0, 200, 5],
  },
} satisfies DialConfig;

export function useFigmaKitTuning() {
  return useDialKit('Figma kit', config);
}

export type FigmaKitTuning = ReturnType<typeof useFigmaKitTuning>;

/** The custom properties figma-kit.css reads. */
export function figmaKitStyle(t: FigmaKitTuning): CSSProperties {
  const ms = (n: number) => `${n}ms`;
  return {
    '--fk-rise-y': `${t.text.riseY}px`,
    '--fk-stagger': ms(t.text.staggerMs),
    '--fk-rise': ms(t.text.riseMs),
    '--fk-block-stagger': ms(t.text.blockStaggerMs),
    '--fk-parts-delay': ms(t.parts.delayMs),
    '--fk-parts-fade': ms(t.parts.fadeMs),
    '--fk-part-rise-y': `${t.parts.riseY}px`,
    '--fk-part-rise': ms(t.parts.riseMs),
    '--fk-part-stagger': ms(t.parts.staggerMs),
    '--fk-button-stagger': ms(t.parts.buttonStaggerMs),
    '--fk-travel': ms(t.story.travelMs),
    '--fk-press-scale': String(t.story.pressScale),
    '--fk-hue': ms(t.story.hueMs),
    '--fk-hue-stagger': ms(t.story.hueStaggerMs),
  } as CSSProperties;
}
