// Landing page "Brand theme" (Figma 7066:28878 and its two states 7066:28914, 7066:28936; Godwin 2026-11-08): a
// three-step stepper. The tag "One color in. A whole theme out." names the section; the steps (pick, check,
// copy) are a fixed list in that order; the current one becomes the headline in its place (rolling in, below)
// with a blue bar filling under it. Beside them, one picture card that plays the current step's story (Stageshow
// faux UI from real Bland components, its own idea per step: pictures/), and Figma's info Alert under it.
//
// From breakpoint/md the section is a tall track with a sticky stage, as the hero and the feature row are:
// scrolling down moves through the three steps, then the page carries on; pressing a step scrolls to it. On a
// phone the stage would not fit one screen, so the section scrolls normally and the steps advance on their own
// while it is in view (and a tap picks one). Reduced motion: steps change at once, the pictures show posters,
// nothing advances on its own.
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Alert, Button } from '../../../src';
import { usePlayback } from '../features/playback';
import { featuresStyle } from '../features/timing';
import { useBrandTuning } from './tuning';
import { PickPicture } from './pictures/PickPicture';
import { CheckPicture } from './pictures/CheckPicture';
import { CopyPicture } from './pictures/CopyPicture';
import '../features/features.css';
import './brand-theme.css';

/** Figma's copy; docs/landing-copy.md, "Your brand, in one color". */
const STEPS = [
  { title: 'Pick your color. Any hex. It never moves.', Picture: PickPicture },
  { title: 'See every pairing in light and dark, and fix the ones that fail.', Picture: CheckPicture },
  { title: 'Copy the CSS. One file, loaded last. Done.', Picture: CopyPicture },
];

const wide = () => window.matchMedia('(min-width: 768px)').matches;
const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function BrandTheme() {
  const tuning = useBrandTuning();
  const track = useRef<HTMLElement>(null);
  const list = useRef<HTMLOListElement>(null);
  const [current, setCurrent] = useState(0);
  // Each time a step becomes current its story starts from the top (a new key).
  const [turns, setTurns] = useState([0, 0, 0]);
  const shown = useRef(0);
  const { ref: card, active, reduced, engaged } = usePlayback(0, { stagger: false });

  const show = (i: number) => {
    if (i === shown.current) return;
    shown.current = i;
    setCurrent(i);
    setTurns((t) => t.map((n, k) => (k === i ? n + 1 : n)));
  };

  // Wide: the step follows the scroll through the track, and the current step's underline fills left to right
  // with the scroll through its share (Godwin 2026-11-08, after Granola's), followed with a little inertia.
  const settings = useRef(tuning);
  settings.current = tuning;
  useEffect(() => {
    const el = track.current;
    const ol = list.current;
    if (!el || !ol) return;
    let raf = 0;
    let fill = 0;
    let last = performance.now();
    const progress = () => {
      const r = el.getBoundingClientRect();
      const span = r.height - window.innerHeight;
      return (span > 0 ? Math.min(1, Math.max(0, -r.top / span)) : 0) * STEPS.length;
    };
    const frame = (now: number) => {
      raf = 0;
      if (!wide()) return;
      const at = progress();
      const step = Math.min(STEPS.length - 1, Math.floor(at));
      show(step);
      const goal = Math.min(1, Math.max(0, at - step));
      const tau = reducedMotion() ? 0 : settings.current.underline.smoothingMs;
      const dt = Math.min(now - last, 100);
      last = now;
      // A new step's underline starts from empty, not from the last one's fill.
      if (Math.abs(goal - fill) > 0.5) fill = goal < fill ? 0 : goal;
      fill = tau <= 0 ? goal : fill + (goal - fill) * (1 - Math.exp(-dt / tau));
      if (Math.abs(goal - fill) < 0.001) fill = goal;
      ol.querySelectorAll<HTMLElement>('.brand-sec__item').forEach((li, i) =>
        li.style.setProperty('--fill', String(i === step ? fill.toFixed(4) : 0)),
      );
      if (fill !== goal) raf = requestAnimationFrame(frame);
    };
    const kick = () => {
      if (!raf) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    };
    kick();
    window.addEventListener('scroll', kick, { passive: true });
    window.addEventListener('resize', kick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', kick);
      window.removeEventListener('resize', kick);
    };
  }, []);

  // Phone: the steps advance on their own while the section shows and nobody is using it. The underline is the
  // timer: it fills over phoneStepMs (CSS), pauses with the story, and its end moves on to the next step.
  const phoneAuto = !reduced;
  const advance = () => {
    if (!wide()) show((shown.current + 1) % STEPS.length);
  };

  // The current step becomes the headline in its place (Figma), by a roll inside the row (Godwin 2026-11-08: after
  // the scale, the blur and a separate headline were all too much): each step holds its small line and its
  // headline; the row is a mask whose height eases between their measured heights, and on a change the leaving
  // layer goes at once while the arriving one slides in (from below when going on, from above when going back).
  // No scaling, blur or fade.
  const previous = useRef(0);
  useLayoutEffect(() => {
    const ol = list.current;
    if (!ol) return;
    const measure = () => {
      for (const step of ol.querySelectorAll<HTMLElement>('.brand-sec__step')) {
        const big = step.querySelector<HTMLElement>('[data-layer="big"]');
        const small = step.querySelector<HTMLElement>('[data-layer="small"]');
        if (big) step.style.setProperty('--h-big', `${big.offsetHeight}px`);
        if (small) step.style.setProperty('--h-small', `${small.offsetHeight}px`);
      }
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(ol);
    document.fonts?.ready.then(measure);
    return () => ro.disconnect();
  }, []);
  useLayoutEffect(() => {
    const was = previous.current;
    previous.current = current;
    const ol = list.current;
    if (!ol || was === current || reducedMotion()) return;
    const dir = current > was ? 1 : -1;
    const duration = settings.current.headline.rollMs;
    const easing = getComputedStyle(document.documentElement).getPropertyValue('--easing-out').trim() || 'ease-out';
    const steps = ol.querySelectorAll<HTMLElement>('.brand-sec__step');
    // Only the arriving text moves; the leaving text is gone at once, so the two are never on screen together
    // (Godwin 2026-11-08: the old and new text lingered side by side for a moment).
    const roll = (step: HTMLElement | undefined, arriving: 'big' | 'small') => {
      const into = step?.querySelector<HTMLElement>(`[data-layer="${arriving}"]`);
      into?.animate([{ transform: `translateY(${dir * 100}%)` }, { transform: 'translateY(0)' }], { duration, easing });
    };
    roll(steps[current], 'big');
    roll(steps[was], 'small');
  }, [current]);

  const pick = (i: number) => {
    const el = track.current;
    if (!el || !wide()) {
      show(i);
      return;
    }
    // The middle of that step's share of the track.
    const top = el.getBoundingClientRect().top + window.scrollY;
    const span = el.offsetHeight - window.innerHeight;
    window.scrollTo({ top: top + (span * (i + 0.5)) / STEPS.length, behavior: reducedMotion() ? 'auto' : 'smooth' });
  };

  return (
    <section
      ref={track}
      className="brand-sec"
      data-theme="light"
      data-auto={phoneAuto || undefined}
      data-paused={!active || engaged || undefined}
      aria-labelledby="brand-sec-title"
      style={
        {
          ...featuresStyle,
          '--brand-sec-steps': STEPS.length,
          '--brand-sec-screens-per-step': tuning.steps.screensPerStep,
          '--brand-sec-roll': `${tuning.headline.rollMs}ms`,
          '--brand-sec-crossfade': `${tuning.picture.crossfadeMs}ms`,
          '--brand-sec-phone-step': `${tuning.steps.phoneStepMs}ms`,
        } as React.CSSProperties
      }
    >
      <div className="brand-sec__stage">
        <div className="brand-sec__grid bland-grid">
          <div className="brand-sec__copy">
            <h2 id="brand-sec-title" className="brand-sec__tag bland-smooth">
              One color in. A whole theme out.
            </h2>
            <ol ref={list} className="brand-sec__steps">
              {STEPS.map((s, i) => (
                <li key={s.title} className="brand-sec__item" data-current={i === current || undefined}>
                  <button
                    type="button"
                    className="brand-sec__step bland-focus-ring"
                    aria-current={i === current ? 'step' : undefined}
                    aria-label={s.title}
                    onClick={() => pick(i)}
                  >
                    <span className="brand-sec__layer" data-layer="big">
                      {s.title}
                    </span>
                    <span className="brand-sec__layer" data-layer="small" aria-hidden>
                      {s.title}
                    </span>
                  </button>
                  <span className="brand-sec__rule" aria-hidden>
                    <span className="brand-sec__fill" onAnimationEnd={advance} />
                  </span>
                </li>
              ))}
            </ol>
            <Button
              emotion="brand"
              type="primary"
              size="sm"
              onClick={() => {
                location.href = '/docs/#/brand';
              }}
            >
              Open Brand theme
            </Button>
          </div>
          <div className="brand-sec__visual">
            <div ref={card as React.RefObject<HTMLDivElement>} className="brand-sec__card bland-smooth">
              {STEPS.map(({ title, Picture }, i) => (
                <div key={title} className="brand-sec__picture" data-current={i === current || undefined} inert={i !== current}>
                  <Picture key={turns[i]} active={active && i === current} reduced={reduced} />
                </div>
              ))}
            </div>
            <Alert role={undefined} className="brand-sec__note">
              Bland ships blue so it has something to show. Give it your brand color and it works out the other
              twelve shades, tints the grays toward it, and checks the contrast for you. Your fonts too.
            </Alert>
          </div>
        </div>
      </div>
    </section>
  );
}
