// Step 2, the contrast check, as a small copy of what the Brand theme page does when you change the color
// (playground/docs/BrandPage.tsx, Contrast; Godwin 2026-11-11: "mirror, however minified, what happens on the Brand
// theme page"). The color card goes from Bland's blue to #e11d74 and its shades follow; the page's "Contrast
// warning" Banner folds in with Fix contrast and Show breakdown; the breakdown opens on the one real miss the brand
// tool finds for this color (dark, progress fill on its track, 2.85:1, needs 3:1, lighten 400), in its own card
// under the panel as a table row (Figma 7250:44499: the panel is the color, eight shades and the Banner; the
// thirteen-step strip is gone, Godwin 2026-11-11: "mirror what's on Figma, throw what isn't useful away"); Fix contrast is
// pressed, step 400 takes the tool's #f16694 and the warning folds away, as on the page, where only a miss shows.
// Then the color goes back to blue. Decorative: aria-hidden and inert.
import type { CSSProperties } from 'react';
import { Banner, Button, CodeText } from '../../../../src';
import { useLoop } from '../../features/playback';
import { Roll } from '../../features/Roll';

/** Eight of the thirteen shades, light to dark, as Figma's row. */
const SHADES = [100, 200, 300, 400, 500, 600, 800, 900] as const;

type Frame = { brand: 'blue' | 'pink'; warning?: true; breakdown?: true; press?: true; fixed?: true; hold: number };
// 0 Bland's blue: nothing to report. 1 the color changes. 2 the warning folds in. 3 the breakdown opens. 4 Fix
// contrast goes down. 5 fixed: step 400 moves and the warning folds away. Then back to blue.
const FRAMES: Frame[] = [
  { brand: 'blue', hold: 1300 },
  { brand: 'pink', hold: 700 },
  { brand: 'pink', warning: true, hold: 1500 },
  { brand: 'pink', warning: true, breakdown: true, hold: 1900 },
  { brand: 'pink', warning: true, breakdown: true, press: true, hold: 160 },
  { brand: 'pink', fixed: true, hold: 2600 },
];
const HOLD = FRAMES.map((f) => f.hold);
const POSTER = 3;

export function CheckPicture({ active, reduced }: { active: boolean; reduced: boolean }) {
  const step = useLoop(active, reduced, HOLD, 0, POSTER);
  const frame = FRAMES[step] ?? FRAMES[0]!;
  const pink = frame.brand === 'pink';
  return (
    <div
      className={`check-pic${pink ? ' brand-pink' : ''}`}
      data-theme="light"
      data-step={step}
      data-fixed={frame.fixed || undefined}
      aria-hidden
      inert
    >
      <div className="check-pic__panel bland-smooth">
        <div className="check-pic__color">
          <span className="check-pic__swatch bland-smooth" />
          <span className="check-pic__hex">
            <Roll value={pink ? '#E11D74' : '#387EFF'} />
          </span>
        </div>
        <div className="check-pic__steps">
          {SHADES.map((s, i) => (
            <span
              key={s}
              className="check-pic__step bland-smooth"
              data-moved={(frame.fixed && s === 400) || undefined}
              style={{ '--s': `var(--brand-${s})`, '--i': i } as CSSProperties}
            />
          ))}
        </div>
        <div className="check-pic__fold" data-open={frame.warning || undefined}>
          <div className="check-pic__fold-inner">
            <Banner
              status="warning"
              colored
              orientation="vertical"
              title="Contrast warning"
              className="check-pic__banner"
              actions={
                <>
                  <span className="check-pic__press" data-pressed={frame.press || undefined}>
                    <Button size="xs">Fix contrast</Button>
                  </span>
                  <Button size="xs" type="stroke">
                    {frame.breakdown ? 'Hide breakdown' : 'Show breakdown'}
                  </Button>
                </>
              }
            >
              1 of 35 color pairs is harder to read than it should be.
            </Banner>
          </div>
        </div>
      </div>
      {/* The breakdown, detached from the panel above (Figma annotation, 2026-11-11). */}
      <div className="check-pic__fold check-pic__detail" data-open={frame.breakdown || undefined}>
        <div className="check-pic__fold-inner">
          <div className="check-pic__finding bland-smooth">
            <span className="check-pic__cell check-pic__cell--name">
              <CodeText size="lg">progress</CodeText>
            </span>
            <span className="check-pic__cell">Fill on its track in dark: 2.85:1, needs 3:1</span>
          </div>
        </div>
      </div>
    </div>
  );
}
