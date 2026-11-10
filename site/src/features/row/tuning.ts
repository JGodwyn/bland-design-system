// The horizontal feature row's motion (Figma 7141:36653, Godwin 2026-11-08, after a Framer template's glide on
// Cosmos): every parameter with its default and range. In `npm run site` DialKit edits them live (the "Feature
// row" folder in the panel bottom right); builds use the defaults (site/src/dialkit-stub.ts).
import { useDialKit, type DialConfig } from 'dialkit';

// Defaults tuned by Godwin in DialKit (2026-11-08).
const config = {
  stories: {
    // How often the cards' stories repeat: the waits between steps divide by it (motion keeps its durations);
    // 1 is the times in the pictures, 1.5 is Godwin's 50% faster (2026-11-08).
    speed: [1.5, 0.5, 3, 0.05],
  },
  scroll: {
    // Screens of page scroll per card: how long each card takes to pass.
    screensPerCard: [1, 0.3, 3, 0.05],
    // The share of each card's scroll where the row holds still on it, so it settles centred (half before the
    // card, half after); the move between cards eases in and out over the rest.
    hold: [0.71, 0, 0.8, 0.01],
    // The row follows the scroll with this much inertia (time constant).
    smoothingMs: [160, 0, 900, 5],
  },
  guidance: {
    // Once scrolling has stopped this long with the row between two cards, it glides to the nearest one.
    settleDelayMs: [260, 40, 600, 10],
    // The glide's length: a base plus this much per screen of page scroll it covers (an ease-out).
    glideMs: [380, 100, 1200, 10],
    glideMsPerScreen: [410, 0, 1500, 10],
  },
  cards: {
    // Neighbours, one card away from the middle (Figma's were 446 of 560 and 20%; Godwin tuned 0.65).
    sideScale: [0.65, 0.5, 1, 0.001],
    sideOpacity: [0.2, 0, 1, 0.01],
    // Centre to centre, as a share of a card's width (Figma's 608 of 560 was 1.086).
    spacing: [0.991, 0.8, 1.6, 0.001],
  },
} satisfies DialConfig;

export function useRowTuning() {
  return useDialKit('Feature row', config);
}
