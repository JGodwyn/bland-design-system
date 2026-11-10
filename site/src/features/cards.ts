// The landing page's feature cards (Godwin 2026-11-07 and -08): six pictures made with the Stageshow skill, each
// real Bland components drawn by Bland (so vector, on the tokens), one thing happening in each, with its title and
// one line. They live in the feature row (row/FeatureRow.tsx; the grid that came first, Figma 7064:28783, was
// removed 2026-11-08). Each picture loops while it shows and pauses under the pointer or focus (playback.ts); two
// can be used beyond that (the light/dark line drags, the sign-in form takes Tab), two more have a real switch
// (the chart's views, the props listbox). Everything else in a picture is aria-hidden and inert.
import type { ComponentType } from 'react';
import { ComponentsPicture } from './pictures/ComponentsPicture';
import { ThemePicture } from './pictures/ThemePicture';
import { RebrandPicture } from './pictures/RebrandPicture';
import { KeyboardPicture } from './pictures/KeyboardPicture';
import { ChartsPicture } from './pictures/ChartsPicture';
import { PropsPicture } from './pictures/PropsPicture';
import './features.css';

export type PictureProps = {
  /** True while the story should move (playback.ts). */
  active: boolean;
  /** Reduced motion: show the poster step, loop nothing. */
  reduced: boolean;
  /** A mouse is over the card, a press is held on it or focus is inside it. */
  engaged: boolean;
};

/** Figma's order, then the two added in code. */
// The copy is docs/landing-copy.md, "Feature cards" (Godwin 2026-11-08): change it there first.
export const FEATURES: { title: string; description: string; Picture: ComponentType<PictureProps> }[] = [
  {
    title: 'Over 45 components that fit together',
    description: 'Built on one set of tokens and rules, so whatever you put together looks like one product.',
    Picture: ComponentsPicture,
  },
  {
    title: 'Light and dark, each designed',
    description: 'Each theme is drawn on its own, not flipped. Drag the line to compare.',
    Picture: ThemePicture,
  },
  {
    title: 'One color rebrands it all',
    description: 'Change one hex and every button, toggle and bar follows.',
    Picture: RebrandPicture,
  },
  {
    title: 'Works without a mouse',
    description: 'Every control takes the keyboard and tells screen readers what it is. Tab through the form to try it.',
    Picture: KeyboardPicture,
  },
  // Added in code (Godwin 2026-11-08); not in the Figma frame yet.
  {
    title: 'Charts in your colors',
    description: 'Your brand leads, and every series stays clear for color-blind readers. Switch the view to check.',
    Picture: ChartsPicture,
  },
  {
    title: 'Typed down to every prop',
    description: 'Your editor offers every option and flags the wrong ones before they ship. Pick one to see it.',
    Picture: PropsPicture,
  },
];
