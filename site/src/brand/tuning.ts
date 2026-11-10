// The Brand theme section's motion (Godwin 2026-11-08: "the movement from one point to the other is jittery; wire
// this up to DialKit"): every parameter with its default and range. In `npm run site` DialKit edits them live
// (the "Brand theme" folder in the panel bottom right); builds use the defaults (site/src/dialkit-stub.ts).
import { useDialKit, type DialConfig } from 'dialkit';

// Defaults tuned by Godwin in DialKit (2026-11-08).
const config = {
  steps: {
    // Screens of page scroll per step (breakpoint/md and up).
    screensPerStep: [0.8, 0.3, 2, 0.05],
    // On a phone, how long each step shows before the next.
    phoneStepMs: [5200, 2000, 12000, 100],
  },
  headline: {
    // A step's roll into the headline (and the last one's back to its small line): the row's height eases while
    // the line slides out and the headline slides in, inside the row.
    rollMs: [400, 100, 1500, 10],
  },
  underline: {
    // The current step's underline follows the scroll with this much inertia (wide screens).
    smoothingMs: [100, 0, 600, 5],
  },
  picture: {
    // The pictures' crossfade between steps.
    crossfadeMs: [300, 100, 1500, 10],
  },
} satisfies DialConfig;

export function useBrandTuning() {
  return useDialKit('Brand theme', config);
}
