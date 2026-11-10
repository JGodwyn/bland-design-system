// The FAQ section's entrance, every parameter with its default and range. In `npm run site` DialKit edits them live
// (the "FAQ" folder, bottom right); builds use the defaults (site/src/dialkit-stub.ts). The text numbers are the
// Figma kit's (What you get's sentence rise), so the heading enters the way the sections above it do; the questions
// follow in a stagger inside docs/motion.md's 30 to 80ms.
import type { CSSProperties } from 'react';
import { useDialKit, type DialConfig } from 'dialkit';

const config = {
  text: {
    // When the section comes into view the heading's words rise in from this far below, one after another, then the
    // line under it.
    riseY: [68, 0, 120, 1],
    staggerMs: [14, 0, 80, 1],
    riseMs: [520, 100, 2000, 10],
    blockStaggerMs: [80, 0, 300, 5],
  },
  questions: {
    // Then the questions rise in from this far below, this far apart, top to bottom.
    riseY: [24, 0, 80, 1],
    riseMs: [520, 100, 2000, 10],
    staggerMs: [40, 30, 80, 1],
  },
} satisfies DialConfig;

export function useFaqTuning() {
  return useDialKit('FAQ', config);
}

export type FaqTuning = ReturnType<typeof useFaqTuning>;

/** The custom properties faq.css reads. */
export function faqStyle(t: FaqTuning): CSSProperties {
  const ms = (n: number) => `${n}ms`;
  return {
    '--faq-rise-y': `${t.text.riseY}px`,
    '--faq-stagger': ms(t.text.staggerMs),
    '--faq-rise': ms(t.text.riseMs),
    '--faq-block-stagger': ms(t.text.blockStaggerMs),
    '--faq-q-rise-y': `${t.questions.riseY}px`,
    '--faq-q-rise': ms(t.questions.riseMs),
    '--faq-q-stagger': ms(t.questions.staggerMs),
  } as CSSProperties;
}
