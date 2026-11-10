// The footer's motion, every parameter with its default and range. In `npm run site` DialKit edits them live (the
// "Footer" folder, bottom right); builds use the defaults (site/src/dialkit-stub.ts). The headline's numbers start
// from the hero's (its character rise and the scroll smoothing), so the page ends the way it began; the footer runs
// the hero's scroll story the other way, outline to bold with its glow (plan agreed with Godwin 2026-11-09).
import type { CSSProperties } from 'react';
import { useDialKit, type DialConfig } from 'dialkit';

const config = {
  entrance: {
    // When a fifth of the footer is on screen, the headline's characters rise in one after another (the hero's
    // entrance), then the install line, snippet, links and copyright follow, this far apart.
    charRise: [60, 0, 200, 1],
    charStaggerMs: [18, 0, 80, 1],
    charMs: [520, 100, 2000, 10],
    blockDelayMs: [300, 0, 1500, 10],
    blockStaggerMs: [50, 0, 300, 5],
    blockRise: [24, 0, 80, 1],
    blockMs: [520, 100, 2000, 10],
  },
  scroll: {
    // Fractions of the footer scrolled into view (0 its top at the screen's bottom, 1 the end of the page):
    // between these the words fill from outline to bold, one after another, each over `softness` word slots.
    fillStart: [0.3, 0, 0.9, 0.01],
    fillEnd: [0.8, 0.1, 1, 0.01],
    softness: [2, 1, 5, 0.5],
    smoothingMs: [120, 0, 600, 5],
  },
  glow: {
    opacity: [0.75, 0, 1, 0.01],
    // Figma's blurs (pink 16, blue 4) times this; 0.75 is the hero's finding (CSS blur spreads further).
    blurScale: [0.75, 0.25, 2, 0.05],
  },
} satisfies DialConfig;

export function useFooterTuning() {
  return useDialKit('Footer', config);
}

export type FooterTuning = ReturnType<typeof useFooterTuning>;

/** Figma's two glow copies: pink blur 16 one pixel up, Text/text-brand blur 4 one pixel down. */
const FIGMA_GLOW = { outer: 16, inner: 4 };

/** The custom properties footer.css reads. */
export function footerStyle(t: FooterTuning): CSSProperties {
  const ms = (n: number) => `${n}ms`;
  const outer = FIGMA_GLOW.outer * t.glow.blurScale;
  return {
    '--ft-char-rise': `${t.entrance.charRise}px`,
    '--ft-char-stagger': ms(t.entrance.charStaggerMs),
    '--ft-char': ms(t.entrance.charMs),
    '--ft-block-delay': ms(t.entrance.blockDelayMs),
    '--ft-block-stagger': ms(t.entrance.blockStaggerMs),
    '--ft-block-rise': `${t.entrance.blockRise}px`,
    '--ft-block': ms(t.entrance.blockMs),
    '--ft-glow-opacity': String(t.glow.opacity),
    '--ft-glow-outer-blur': `${outer.toFixed(2)}px`,
    '--ft-glow-inner-blur': `${(FIGMA_GLOW.inner * t.glow.blurScale).toFixed(2)}px`,
    // Room around each glow copy so its blur is not cut at the word's box: the rise plus three blur radii.
    '--ft-glow-pad': `${Math.ceil(t.entrance.charRise + outer * 3)}px`,
  } as CSSProperties;
}
