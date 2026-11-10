// Every motion parameter of the hero, in one place, with its default and range. In development DialKit
// (dialkit.dev, the panel bottom right) edits them live; in production the panel is hidden and these defaults
// apply. Hero.tsx reads them through useHeroTuning(); the timings CSS needs are set on the hero as custom
// properties (heroStyle), so hero.css never holds a second copy. Godwin 2026-11-07; defaults tuned by Godwin in
// DialKit the same day. Then (description too fast): track 2 to 4 screens with the headline's start and end
// rescaled to the same scroll distance (0.19 / 0.36 of one screen = 0.063 / 0.12 of three), and the description
// on its own, heavier smoothing.
import type { CSSProperties } from 'react';
import { useDialKit, type DialConfig } from 'dialkit';

const config = {
  entrance: {
    charRise: [60, 0, 200, 1],
    charStagger: [18, 0, 80, 1],
    charDuration: [520, 100, 2000, 10],
    // 0, not Godwin's 420 (2026-11-10, landing audit): the description is the largest text on a phone, so its wait
    // was the page's load time (LCP); its words still rise in one by one, from the start with the headline.
    descriptionDelay: [0, 0, 2000, 10],
    descriptionStagger: [14, 0, 80, 1],
    descriptionRise: [68, 0, 120, 1],
    navDelay: [0, 0, 1000, 10],
    replay: { type: 'action', label: 'Replay entrance' },
  },
  scroll: {
    trackScreens: [4, 1.5, 12, 0.1],
    smoothingMs: [120, 0, 600, 5],
    descriptionSmoothingMs: [300, 0, 1200, 10],
    // The headline's bold-to-outline change runs over a fifth of the track, about 500px of scroll on an 850px tall screen,
    // the footer's pace (Godwin 2026-11-09: it was a sixth of that and over before you could see it).
    titleStart: [0.02, 0, 0.5, 0.001],
    titleEnd: [0.22, 0.02, 1, 0.001],
    titleSoftness: [3, 1, 6, 0.5],
    descriptionStart: [0, 0, 0.5, 0.01],
    descriptionEnd: [1, 0.2, 1, 0.01],
    descriptionSoftness: [5, 1, 10, 0.5],
    descriptionRest: [60, 10, 100, 1],
  },

  glide: {
    inMs: [640, 100, 2000, 10],
    outMs: [460, 50, 1500, 10],
    themeMs: [1260, 100, 3000, 10],
  },
  highlight: {
    markerStrength: [85, 5, 100, 1],
    markerTop: [0.38, 0, 1, 0.01],
    markerBottom: [0.92, 0, 1, 0.01],
    markerRoughness: [0.035, 0, 0.15, 0.005],
    popFrom: [0.4, 0.05, 1, 0.01],
    popMs: [620, 100, 2000, 10],
    popOvershoot: [2.2, 1, 4, 0.05],
  },
  glow: {
    opacity: [0.92, 0, 1, 0.01],
    blurScale: [0.85, 0.25, 2, 0.05],
  },
  magnet: {
    pull: [0.25, 0, 1, 0.01],
    reach: [0.18, 0, 0.6, 0.01],
    ease: [0.14, 0.02, 0.5, 0.01],
  },
} satisfies DialConfig;

export type HeroTuning = ReturnType<typeof useHeroTuning>;

/** The hero's live parameters. `onReplay` runs when the panel's Replay entrance is pressed. */
export function useHeroTuning(onReplay: () => void) {
  const v = useDialKit('Landing hero', config, {
    onAction: (action: string) => {
      if (action.endsWith('replay')) onReplay();
    },
  });
  return {
    ...v,
    title: [v.scroll.titleStart, v.scroll.titleEnd] as [number, number],
    description: [v.scroll.descriptionStart, v.scroll.descriptionEnd] as [number, number],
  };
}

/** Figma's progressive blur radii (purple 8 to 32, blue 32 to 8), four steps, before the blur scale. */
const FIGMA_GLOW_RADII = [8, 16, 24, 32];

/** The custom properties hero.css reads for timing and glow. */
export function heroStyle(t: HeroTuning): CSSProperties {
  const ms = (n: number) => `${n}ms`;
  const style: Record<string, string> = {
    '--landing-hero-track': `${t.scroll.trackScreens * 100}svh`,
    '--landing-char-rise': `${t.entrance.charRise}px`,
    '--landing-char-stagger': ms(t.entrance.charStagger),
    '--landing-char-duration': ms(t.entrance.charDuration),
    '--landing-description-delay': ms(t.entrance.descriptionDelay),
    '--landing-description-stagger': ms(t.entrance.descriptionStagger),
    '--landing-description-rise': `${t.entrance.descriptionRise}px`,
    '--landing-nav-delay': ms(t.entrance.navDelay),
    '--landing-glide': ms(t.glide.inMs),
    '--landing-glide-out': ms(t.glide.outMs),
    '--landing-theme-glide': ms(t.glide.themeMs),
    '--landing-hero-glow-opacity': String(t.glow.opacity),
    '--landing-description-rest': `${t.scroll.descriptionRest}%`,
    '--landing-pop-from': String(t.highlight.popFrom),
    '--landing-pop': ms(t.highlight.popMs),
    // A back-out curve: the second control point's y above 1 is how far the icon swings past full size.
    '--landing-ease-pop': `cubic-bezier(0.34, ${t.highlight.popOvershoot}, 0.64, 1)`,
  };
  FIGMA_GLOW_RADII.forEach((r, i) => {
    style[`--landing-hero-glow-blur-${i + 1}`] = `${(r * t.glow.blurScale).toFixed(2)}px`;
  });
  return style as CSSProperties;
}
