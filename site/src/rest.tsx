// Everything below the hero, in its own chunk (Godwin 2026-11-10: on a phone the page showed nothing until one
// script with every section had loaded and run). main.tsx loads it right after the hero is on screen.
import { FeatureRow } from './features/row/FeatureRow';
import { BrandTheme } from './brand/BrandTheme';
import { WhatYouGet } from './what-you-get/WhatYouGet';
import { Showcase } from './showcase/Showcase';
import { FigmaKit } from './figma-kit/FigmaKit';
import { Faq } from './faq/Faq';
import { Footer } from './footer/Footer';

/** The sections inside `<main>`, after the hero. */
export function BelowHero() {
  return (
    <>
      {/* The feature cards, a row that moves sideways as you scroll (Godwin 2026-11-08). */}
      <FeatureRow />
      <BrandTheme />
      <WhatYouGet />
      <Showcase />
      <FigmaKit />
      <Faq />
    </>
  );
}

export { Footer };
