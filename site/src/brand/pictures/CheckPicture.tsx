// Step 2, "See every pairing in light and dark, and fix the ones that fail." A checklist of four real pairings for
// #e11d74, each drawn in its own theme beside its ratio and a Pass or Fails badge. The numbers are the brand
// tool's (`npm run brand -- check`, 2026-11-08): the light button label and link are 5.82:1, the dark link 9.22:1,
// and the dark progress fill against its track 2.85:1, under 3:1. On a loop the failing row's Fix is pressed:
// step 400 moves from #ec6290 to #f16694, the tool's own suggestion, the ratio rolls to 3.00:1 and the badge
// turns to Pass; then the list starts over. Decorative: aria-hidden and inert.
import { Badge, Button, ProgressBar } from '../../../../src';
import { useLoop } from '../../features/playback';
import { Roll } from '../../features/Roll';

type Row = { id: string; mode: 'light' | 'dark'; label: string; ratio: string; needs: string; sample: 'button' | 'link' | 'progress' };
const ROWS: Row[] = [
  { id: 'button', mode: 'light', label: 'Button label', ratio: '5.82', needs: '4.5', sample: 'button' },
  { id: 'link', mode: 'light', label: 'Link on the page', ratio: '5.82', needs: '4.5', sample: 'link' },
  { id: 'dark-link', mode: 'dark', label: 'Link on the page', ratio: '9.22', needs: '4.5', sample: 'link' },
  { id: 'progress', mode: 'dark', label: 'Progress on its track', ratio: '2.85', needs: '3', sample: 'progress' },
];

// 0 the failing row stands out; 1 Fix goes down; 2 fixed, the ratio rolls and the badge passes; 3 the list fades
// out to start again (the loop's reset, as one move).
const HOLD = [1800, 160, 2800, 360];
const POSTER = 2;

function Sample({ row }: { row: Row }) {
  if (row.sample === 'button')
    return (
      <Button emotion="brand" type="primary" size="xs">
        Save
      </Button>
    );
  if (row.sample === 'link') return <span className="check-pic__link">Docs</span>;
  return <ProgressBar value={64} showValue={false} aria-label="" className="check-pic__progress" />;
}

export function CheckPicture({ active, reduced }: { active: boolean; reduced: boolean }) {
  const step = useLoop(active, reduced, HOLD, 0, POSTER);
  const fixed = step === 2 || step === 3;
  return (
    <div className="check-pic brand-pink" data-theme="light" data-step={step} aria-hidden inert>
      <div className="check-pic__list bland-smooth" data-leaving={step === 3 || undefined}>
        {ROWS.map((row) => {
          const failing = row.id === 'progress' && !fixed;
          return (
            <div key={row.id} className="check-pic__row" data-failing={failing || undefined}>
              <span className="check-pic__sample bland-smooth brand-pink" data-theme={row.mode} data-fixed={(row.id === 'progress' && fixed) || undefined}>
                <Sample row={row} />
              </span>
              <span className="check-pic__what">
                <span className="check-pic__label">{row.label}</span>
                <span className="check-pic__mode">
                  {row.mode === 'light' ? 'Light' : 'Dark'} · needs {row.needs}:1
                </span>
              </span>
              <span className="check-pic__ratio">
                <Roll value={`${row.id === 'progress' && fixed ? '3.00' : row.ratio}:1`} />
              </span>
              {row.id === 'progress' && !fixed ? (
                <span className="check-pic__fix" data-pressed={step === 1 || undefined}>
                  <Button emotion="brand" type="secondary" size="xs">
                    Fix
                  </Button>
                </span>
              ) : (
                <Badge emotion="success" type="secondary" size="md">
                  Pass
                </Badge>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
