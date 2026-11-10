// "One color to rebrand": the brand override itself (docs/brand.md). One hex in a chip, the 13 brand steps
// `npm run brand` makes from it, and three controls that read Bland's brand roles. On a loop the hex changes from
// Bland's blue to green, to orange and back to blue: the steps follow left to right and the controls follow with
// them. The three sets of steps are real `npm run brand -- generate` output, in landing-values.css
// (`.rebrand-pic[data-brand]`); the picture sets data-theme="light" on itself so Bland's roles are computed from
// its own steps (brand steps set on a nested element reach the roles only where tokens.css defines them).
import { Button, ProgressBar, Toggle } from '../../../../src';
import { useLoop } from '../playback';
import { Roll } from '../Roll';
import type { PictureProps } from '../cards';

const noop = () => {};
const BRANDS = {
  blue: '#387EFF',
  green: '#0F9D58',
  orange: '#F2541B',
} as const;
/** The loop: Bland's blue, then green, orange and blue again; each holds long enough to read. */
const ORDER = ['blue', 'green', 'orange', 'blue'] as const;
const HOLD = [900, 2400, 2400, 2400];
const POSTER = 2;
const STEPS = [0, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950, 1000] as const;

export function RebrandPicture({ active, reduced }: PictureProps) {
  const step = useLoop(active, reduced, HOLD, 1, POSTER);
  const brand = ORDER[step] ?? 'blue';
  return (
    <div className="rebrand-pic" data-theme="light" data-brand={brand} data-step={step} aria-hidden inert>
      <div className="rebrand-pic__panel bland-smooth">
        <div className="rebrand-pic__hex">
          <span className="rebrand-pic__dot" />
          <Roll value={BRANDS[brand]} className="rebrand-pic__hex-value" />
        </div>
        <div className="rebrand-pic__steps">
          {STEPS.map((s, i) => (
            <span key={s} className="rebrand-pic__step" style={{ '--s': `var(--brand-${s})`, '--i': i } as React.CSSProperties} />
          ))}
        </div>
      </div>
      <div className="rebrand-pic__controls">
        <Button emotion="brand" type="primary" size="sm">
          Publish
        </Button>
        <Toggle checked onCheckedChange={noop} aria-label="" tabIndex={-1} />
        <ProgressBar value={60} showValue={false} aria-label="" className="rebrand-pic__progress" />
      </div>
    </div>
  );
}
