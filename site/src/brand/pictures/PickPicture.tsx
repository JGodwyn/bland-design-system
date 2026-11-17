// Step 1, "Choose your brand color." As Figma 7250:44428 (Godwin 2026-11-11): a panel with the swatch and its hex,
// "500 is your brand color, unchanged", eight of the brand shades and a hue strip; under it a Neutrals card with
// its shades. On a loop the hue strip's knob slides from one color to the other ("this should slide from one
// color to the other"), from Bland's blue to #e11d74 and back: the hex rolls and the shades follow left to right.
// The shades are `npm run brand -- generate "#e11d74" --neutrals subtle` output (.brand-pink); the picture sets the
// brand on itself with data-theme, so Bland's own roles follow. Decorative: aria-hidden and inert.
import type { CSSProperties } from 'react';
import { useLoop } from '../../features/playback';
import { Roll } from '../../features/Roll';

/** Eight of the thirteen shades, light to dark, as Figma's rows. */
const SHADES = [100, 200, 300, 400, 500, 600, 800, 900] as const;
/** Where the hue strip's knob sits for each color: its OKLCH hue over 360 (blue 264, pink 357). */
const BRANDS = {
  blue: { hex: '#387EFF', hue: 264 / 360 },
  pink: { hex: '#E11D74', hue: 357 / 360 },
} as const;
const ORDER = ['blue', 'pink'] as const;
const HOLD = [2200, 2600];
const POSTER = 1;

export function PickPicture({ active, reduced }: { active: boolean; reduced: boolean }) {
  const step = useLoop(active, reduced, HOLD, 0, POSTER);
  const brand = ORDER[step] ?? 'blue';
  const b = BRANDS[brand];
  return (
    <div
      className={`pick-pic${brand === 'pink' ? ' brand-pink' : ''}`}
      data-theme="light"
      data-brand={brand}
      data-step={step}
      aria-hidden
      inert
      style={{ '--hue': b.hue } as CSSProperties}
    >
      <div className="pick-pic__panel bland-smooth">
        <div className="pick-pic__head">
          <span className="pick-pic__swatch bland-smooth" />
          <Roll value={b.hex} className="pick-pic__hex" />
        </div>
        <span className="pick-pic__note">500 is your brand color, unchanged</span>
        <div className="pick-pic__shades">
          {SHADES.map((s, i) => (
            <span key={s} className="pick-pic__shade bland-smooth" style={{ '--s': `var(--brand-${s})`, '--i': i } as CSSProperties} />
          ))}
        </div>
        <div className="pick-pic__hue">
          <span className="pick-pic__hue-dot" />
        </div>
      </div>
      <div className="pick-pic__panel bland-smooth">
        <div className="pick-pic__head">
          <span className="pick-pic__swatch pick-pic__swatch--sm bland-smooth" />
          <span className="pick-pic__label">Neutrals</span>
        </div>
        <div className="pick-pic__shades pick-pic__shades--thin">
          {SHADES.map((s, i) => (
            <span key={s} className="pick-pic__shade bland-smooth" style={{ '--s': `var(--neutral-${s})`, '--i': i } as CSSProperties} />
          ))}
        </div>
      </div>
    </div>
  );
}
