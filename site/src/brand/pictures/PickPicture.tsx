// Step 1, "Pick your color. Any hex. It never moves." A picker panel: a hex typed into a Text Input, a hue strip
// whose dot slides to the color, and under it the 13 brand steps and the 13 neutrals `npm run brand` makes from
// that one hex (the neutrals tinted toward it, --neutrals subtle). Step 500 is the hex itself, marked. On a loop
// the field goes from Bland's blue to #e11d74 and back, retyped each time; the steps fan out left to right as
// each hex lands. The picture sets the brand on itself with data-theme, so Bland's own roles follow (LEARNINGS,
// "Brand steps on a nested element"). Decorative: aria-hidden and inert.
import type { CSSProperties } from 'react';
import { TextInput } from '../../../../src';
import { useLoop } from '../../features/playback';

const STEPS = [0, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950, 1000] as const;
const BLUE = '#387eff';
const PINK = '#e11d74';
/** Where the hue strip's dot sits for each color: its OKLCH hue over 360 (blue 264, pink 357). */
const HUE = { blue: 264 / 360, pink: 357 / 360 };
const TYPE_MS = 70;

type Frame = { brand: 'blue' | 'pink'; typed: string; hold: number };
/** Type a hex one character at a time, after the field is cleared. */
const typing = (brand: Frame['brand'], hex: string): Frame[] => [
  { brand: brand === 'pink' ? 'blue' : 'pink', typed: '', hold: 260 },
  ...Array.from(hex, (_, i) => ({ brand: brand === 'pink' ? ('blue' as const) : ('pink' as const), typed: hex.slice(0, i + 1), hold: TYPE_MS })),
  { brand, typed: hex, hold: 2600 },
];
// 0 Bland's blue, as shipped; then pink typed in; then blue typed back in; loop from the pink.
const FRAMES: Frame[] = [{ brand: 'blue', typed: BLUE, hold: 1400 }, ...typing('pink', PINK), ...typing('blue', BLUE)];
const HOLD = FRAMES.map((f) => f.hold);
const POSTER = 1 + PINK.length + 1;

export function PickPicture({ active, reduced }: { active: boolean; reduced: boolean }) {
  const step = useLoop(active, reduced, HOLD, 1, POSTER);
  const frame = FRAMES[step] ?? FRAMES[0]!;
  return (
    <div
      className={`pick-pic${frame.brand === 'pink' ? ' brand-pink' : ''}`}
      data-theme="light"
      data-brand={frame.brand}
      data-step={step}
      aria-hidden
      inert
      style={{ '--hue': HUE[frame.brand] } as CSSProperties}
    >
      <div className="pick-pic__panel bland-smooth">
        <div className="pick-pic__field">
          <span className="pick-pic__swatch bland-smooth" />
          <TextInput size="sm" label="Brand color" value={frame.typed} readOnly tabIndex={-1} className="pick-pic__input" />
        </div>
        <div className="pick-pic__hue">
          <span className="pick-pic__hue-dot" />
        </div>
      </div>
      <div className="pick-pic__scales">
        {(['brand', 'neutral'] as const).map((scale) => (
          <div key={scale} className="pick-pic__scale">
            <span className="pick-pic__scale-name">{scale === 'brand' ? 'Brand' : 'Neutrals'}</span>
            <div className="pick-pic__steps">
              {STEPS.map((s, i) => (
                <span
                  key={s}
                  className="pick-pic__step"
                  data-yours={(scale === 'brand' && s === 500) || undefined}
                  style={{ '--s': `var(--${scale}-${s})`, '--i': i } as CSSProperties}
                />
              ))}
            </div>
          </div>
        ))}
        <span className="pick-pic__note">500 is your color, unchanged</span>
      </div>
    </div>
  );
}
