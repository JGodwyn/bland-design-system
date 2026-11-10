// "Charts in your colors": a diagram (Stageshow bento kind). A stacked bar chart in Bland's chart palette
// (--chart-1 is the brand, docs/brand.md "Chart palette"), seen as people with red-green or blue-yellow color
// vision see it: the series stay apart, which is what the palette is built for (neighbours at least ΔE 6 apart
// under protan, deutan and tritan simulation). The bars grow in once; then, on a loop, the view switches from
// typical vision to red-green to blue-yellow. The switch is real Pill tabs: pick a view and it holds until
// the loop's next step. Each view is its own copy of the bars under an SVG color matrix (Machado, Oliveira and
// Fernandes 2009, severity 1, the brand tool's own, scripts/brand/core.ts), so a change crossfades while the
// bars grow in again.
import { useEffect, useId, useRef, useState, type CSSProperties } from 'react';
import { PillTabs } from '../../../../src';
import { useLoop } from '../playback';
import { ARRIVE_MS } from '../timing';
import type { PictureProps } from '../cards';

type View = 'typical' | 'red-green' | 'blue-yellow';
const VIEWS: { id: View; label: string }[] = [
  { id: 'typical', label: 'Typical' },
  { id: 'red-green', label: 'Red-green' },
  { id: 'blue-yellow', label: 'Blue-yellow' },
];
/** Deutan for red-green (the most common), tritan for blue-yellow; feColorMatrix rows, on linear RGB. */
const MATRIX: Record<Exclude<View, 'typical'>, string> = {
  'red-green': '0.367322 0.860646 -0.227968 0 0  0.280085 0.672501 0.047413 0 0  -0.01182 0.04294 0.968881 0 0  0 0 0 1 0',
  'blue-yellow': '1.255528 -0.076749 -0.178779 0 0  -0.078411 0.930809 0.147602 0 0  0.004733 0.691367 0.3039 0 0  0 0 0 1 0',
};

/** Six months of four series, stacked; each column's parts as fractions of the tallest column. */
const SERIES = 4;
const DATA = [
  [0.22, 0.14, 0.12, 0.08],
  [0.26, 0.16, 0.1, 0.12],
  [0.3, 0.14, 0.16, 0.1],
  [0.28, 0.2, 0.14, 0.14],
  [0.36, 0.18, 0.16, 0.12],
  [0.4, 0.22, 0.18, 0.2],
];

/** 0 nothing; 1 the bars grow in (once); then the loop: 2 typical, 3 red-green, 4 blue-yellow. */
const HOLD = [0, ARRIVE_MS + 1600, 2600, 2600, 2600];
const STEP_VIEW: View[] = ['typical', 'typical', 'typical', 'red-green', 'blue-yellow'];
const POSTER = 3;

/** The bars rise from the axis once `grown` is set; a remount (a new key) makes them rise again. */
function Bars({ grown }: { grown: boolean }) {
  const [up, setUp] = useState(false);
  useEffect(() => {
    if (!grown) return;
    // Two frames: the flat start paints first, so the rise is a transition, not a jump.
    let second = 0;
    const first = requestAnimationFrame(() => (second = requestAnimationFrame(() => setUp(true))));
    return () => {
      cancelAnimationFrame(first);
      cancelAnimationFrame(second);
    };
  }, [grown]);
  return (
    <div className="charts-pic__bars" data-grown={up || undefined}>
      {DATA.map((column, c) => (
        <span key={c} className="charts-pic__column" style={{ '--c': c } as CSSProperties}>
          {column.map((v, s) => (
            <span key={s} className="charts-pic__part" data-series={s + 1} style={{ '--v': v } as CSSProperties} />
          ))}
        </span>
      ))}
    </div>
  );
}

/** Drawn in each view, so its keys go through the same color matrix as the bars. */
function Legend() {
  return (
    <div className="charts-pic__legend">
      <span className="charts-pic__key" data-series="1" />
      Your brand
      <span className="charts-pic__legend-rest">
        {Array.from({ length: SERIES - 1 }, (_, i) => (
          <span key={i} className="charts-pic__key" data-series={i + 2} />
        ))}
      </span>
    </div>
  );
}

export function ChartsPicture({ active, reduced }: PictureProps) {
  const step = useLoop(active, reduced, HOLD, 2, POSTER);
  const [mine, setMine] = useState<{ view: View; step: number } | null>(null);
  const view = mine && mine.step === step ? mine.view : (STEP_VIEW[step] ?? 'typical');
  const grown = step >= 1;
  // Every change of view (the loop's or a pick) grows the bars in again, as on the first entrance (Godwin
  // 2026-11-08): the views remount under a new key.
  const [turn, setTurn] = useState(0);
  const lastView = useRef(view);
  useEffect(() => {
    if (lastView.current === view) return;
    lastView.current = view;
    setTurn((t) => t + 1);
  }, [view]);
  // The card is on the page twice (Features and FeatureRow): filter ids must not clash.
  const uid = useId().replace(/:/g, '');

  return (
    <div className="charts-pic" data-step={step} data-view={view}>
      <svg className="charts-pic__filters" aria-hidden focusable="false">
        {Object.entries(MATRIX).map(([id, values]) => (
          <filter key={id} id={`${uid}-${id}`}>
            <feColorMatrix type="matrix" values={values} />
          </filter>
        ))}
      </svg>
      <div className="charts-pic__panel bland-smooth">
        <PillTabs
          aria-label="Color vision"
          size="sm"
          items={VIEWS}
          value={view}
          onValueChange={(v) => setMine({ view: v as View, step })}
        />
        <div className="charts-pic__chart" aria-hidden inert>
          {VIEWS.map((v) => (
            <div
              key={v.id}
              className="charts-pic__view"
              data-shown={v.id === view || undefined}
              style={v.id === 'typical' ? undefined : { filter: `url(#${uid}-${v.id})` }}
            >
              <Bars key={turn} grown={grown} />
              <Legend />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
