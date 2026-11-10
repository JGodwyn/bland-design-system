// The "What you get" section's motion, every parameter with its default and range (Godwin 2026-11-08: "wire all
// this to dialkit"). In `npm run site` DialKit edits them live (the "What you get" folder, bottom right); builds use
// the defaults (site/src/dialkit-stub.ts). The text and pop numbers start from the hero's own (site/src/hero/
// tuning.ts, Godwin's tuned values) so the sentences rise in as the hero's text does and the drawn icons pop as the
// hero's icons do; components appear one after another. CSS reads them as custom properties (whatYouGetStyle); the
// parts' JS loops read them through LiveTiming.
import { createContext, type CSSProperties } from 'react';
import { useDialKit, type DialConfig } from 'dialkit';

const config = {
  scroll: {
    // Screens of page scroll from one slide to the next (Godwin 2026-11-09: the feature row's model).
    screensPerSlide: [0.9, 0.3, 2, 0.05],
    // Once scrolling stops this long between two slides, the page glides to the nearest, over glideMs plus
    // glideMsPerScreen for each screen it travels (the feature row's numbers).
    settleDelayMs: [260, 40, 600, 10],
    glideMs: [380, 100, 1200, 10],
    glideMsPerScreen: [410, 0, 1500, 10],
  },
  text: {
    // A new sentence's words rise in from this far below, one after another (hero: description rise, stagger,
    // char duration).
    riseY: [68, 0, 120, 1],
    staggerMs: [14, 0, 80, 1],
    riseMs: [520, 100, 2000, 10],
  },
  appear: {
    // Components rise into view from this far below, this far apart, over duration/lg easing/out (Godwin
    // 2026-11-09: no pop on the components; docs/motion.md: 30 to 80ms per item).
    y: [16, 0, 48, 1],
    staggerMs: [60, 30, 80, 1],
  },
  pop: {
    // The drawn icons pop in from this scale, swing past full size by the overshoot (hero: highlight pop), this far
    // apart.
    from: [0.4, 0.05, 1, 0.01],
    popMs: [620, 100, 2000, 10],
    overshoot: [2.2, 1, 4, 0.05],
    staggerMs: [60, 30, 80, 1],
    // On a phone the parts keep this share of Figma's tilt.
    phoneTilt: [0.4, 0, 1, 0.05],
  },
  theme: {
    // The stage's change into and out of Dark mode on "Dark mode that thinks" (hero: theme glide).
    glideMs: [1260, 100, 3000, 10],
  },
  parts: {
    // The field types one character this often; the Segmented bar, Toggle, Accordion and Calendar change this often.
    typeMs: [160, 40, 600, 10],
    tabsMs: [1200, 300, 4000, 50],
    toggleMs: [1600, 300, 4000, 50],
    accordionMs: [2000, 300, 6000, 50],
    calendarMs: [1300, 300, 4000, 50],
    // The button's press, once a loop, to this scale.
    pressLoopMs: [2600, 800, 8000, 50],
    pressScale: [0.97, 0.85, 1, 0.01],
  },
  figure: {
    // The accessibility figure's star jump: one loop, and how far in the arms and legs start.
    loopMs: [3600, 1000, 10000, 50],
    armDeg: [62, 0, 90, 1],
    legDeg: [16, 0, 40, 1],
  },
  eye: {
    // The eye's blink loop, and how far the lid closes (a share of its height).
    loopMs: [4200, 1000, 10000, 50],
    lidShut: [0.08, 0, 1, 0.01],
  },
  grid: {
    // The icon grid's draw: each line, the lines apart, the icon's own strokes.
    lineMs: [700, 100, 3000, 10],
    lineStaggerMs: [12, 0, 60, 1],
    iconMs: [900, 100, 3000, 10],
  },
} satisfies DialConfig;

export function useWhatYouGetTuning() {
  return useDialKit('What you get', config);
}

export type WhatYouGetTuning = ReturnType<typeof useWhatYouGetTuning>;

/** The parts' JS loops (slides.tsx), from the "Parts" folder. */
export type LiveTimings = WhatYouGetTuning['parts'];
export const LiveTiming = createContext<LiveTimings>({
  typeMs: config.parts.typeMs[0],
  tabsMs: config.parts.tabsMs[0],
  toggleMs: config.parts.toggleMs[0],
  accordionMs: config.parts.accordionMs[0],
  calendarMs: config.parts.calendarMs[0],
  pressLoopMs: config.parts.pressLoopMs[0],
  pressScale: config.parts.pressScale[0],
});

/** The custom properties what-you-get.css reads. */
export function whatYouGetStyle(t: WhatYouGetTuning): CSSProperties {
  const ms = (n: number) => `${n}ms`;
  return {
    '--wyg-rise-y': `${t.text.riseY}px`,
    '--wyg-stagger': ms(t.text.staggerMs),
    '--wyg-rise': ms(t.text.riseMs),
    '--wyg-appear-y': `${t.appear.y}px`,
    '--wyg-appear-stagger': ms(t.appear.staggerMs),
    '--wyg-pop-from': String(t.pop.from),
    '--wyg-pop': ms(t.pop.popMs),
    '--wyg-pop-stagger': ms(t.pop.staggerMs),
    '--wyg-ease-pop': `cubic-bezier(0.34, ${t.pop.overshoot}, 0.64, 1)`,
    '--wyg-phone-tilt': String(t.pop.phoneTilt),
    '--wyg-theme-glide': ms(t.theme.glideMs),
    '--wyg-press-loop': ms(t.parts.pressLoopMs),
    '--wyg-press-scale': String(t.parts.pressScale),
    '--wyg-figure-loop': ms(t.figure.loopMs),
    '--wyg-arm-closed': `${t.figure.armDeg}deg`,
    '--wyg-leg-closed': `${t.figure.legDeg}deg`,
    '--wyg-blink-loop': ms(t.eye.loopMs),
    '--wyg-lid-shut': String(t.eye.lidShut),
    '--wyg-draw': ms(t.grid.lineMs),
    '--wyg-draw-stagger': ms(t.grid.lineStaggerMs),
    '--wyg-draw-icon': ms(t.grid.iconMs),
  } as CSSProperties;
}
