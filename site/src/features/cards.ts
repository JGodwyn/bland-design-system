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
// The copy is docs/landing-copy.md, "Feature cards" (Godwin 2026-11-08; reworded 2026-11-11): change it there first.
export const FEATURES: { title: string; description: string; Picture: ComponentType<PictureProps> }[] = [
  {
    title: '60+ components, one set of tokens',
    description: 'Forms, navigation, overlays, tables, date pickers and messaging, built on the same 600 design tokens, so every screen stays consistent.',
    Picture: ComponentsPicture,
  },
  {
    title: 'Light and dark, designed separately',
    description: 'Dark is its own palette, not an inverted light theme. Every surface, shadow and color is tuned for it. Drag the divider to compare.',
    Picture: ThemePicture,
  },
  {
    title: 'Rebrand with one color',
    description: 'Enter your brand color and Bland builds the full scale, tints the neutrals and updates every component.',
    Picture: RebrandPicture,
  },
  {
    title: 'Accessible by default',
    description: 'Full keyboard support, managed focus and screen reader labels on every control, built on React Aria. Tab through the form to try it.',
    Picture: KeyboardPicture,
  },
  // Added in code (Godwin 2026-11-08); not in the Figma frame yet.
  {
    title: 'Chart palettes from your brand',
    description: 'Eight series colors led by your brand, each checked for contrast and kept distinct for color-blind readers. Switch the view to compare.',
    Picture: ChartsPicture,
  },
  {
    title: 'Fully typed in TypeScript',
    description: 'Every prop and variant is typed, so your editor suggests the valid options and flags the wrong ones before they ship. Pick one to see it.',
    Picture: PropsPicture,
  },
];
