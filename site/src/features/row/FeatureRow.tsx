// The feature cards again, as a row that moves sideways as you scroll down (Figma 7141:36653, Godwin 2026-11-08:
// "duplicate this section, but let it flow horizontally on scroll", after the glide of a Framer template on
// Cosmos). The section is a tall track with a sticky one-screen stage; the scroll position picks a place along the
// row, which holds still on each card for part of the way (`hold`) and follows with inertia (`smoothingMs`). A card's size and opacity
// follow its distance from the middle: 1 in the middle, `sideScale` (0.65) and 20% one card away, fading out past
// that (tuning.ts).
// Every card's picture plays as soon as it shows; only the middle card's controls work, and a click on a
// neighbour scrolls to it.
// Under reduced motion the row moves a whole card at a time, at once. The cards, pictures and copy are cards.ts.
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { FEATURES, type PictureProps } from '../cards';
import { StorySpeed, usePlayback } from '../playback';
import { featuresStyle } from '../timing';
import { useRowTuning } from './tuning';
import './row.css';

const reducedQuery = '(prefers-reduced-motion: reduce)';
const wideQuery = '(min-width: 768px)';
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
/** Past one card away, the next one fades out over this much more distance. */
const FADE_OUT = 0.75;

type Feature = (typeof FEATURES)[number];

function RowCard({
  index,
  feature,
  centered,
  onPick,
  cardRef,
}: {
  index: number;
  feature: Feature;
  centered: boolean;
  onPick: (index: number) => void;
  cardRef: (el: HTMLElement | null) => void;
}) {
  // Every card plays as soon as it shows, neighbours too, so a card is already moving when it reaches the middle.
  const { ref, started, active, reduced, engaged } = usePlayback(index, { stagger: false });
  const Picture: React.ComponentType<PictureProps> = feature.Picture;
  return (
    <article
      ref={(el) => {
        ref.current = el;
        cardRef(el);
      }}
      className="row__card"
      data-centered={centered || undefined}
      data-started={started || undefined}
      data-active={active || undefined}
      aria-hidden={!centered || undefined}
    >
      <div className="row__content" inert={!centered}>
        <h2 className="row__title">{feature.title}</h2>
        <div className="row__picture bland-smooth">
          <Picture active={active} reduced={reduced} engaged={engaged} />
        </div>
        <p className="row__description">{feature.description}</p>
      </div>
      {/* A neighbour is a target: pressing it brings it to the middle. Pointer only; the keyboard scrolls. */}
      {!centered && <span className="row__pick" aria-hidden onClick={() => onPick(index)} />}
    </article>
  );
}

/** Wide screens: the sideways row on a sticky stage. */
function SideRow() {
  const tuning = useRowTuning();
  const count = FEATURES.length;
  const track = useRef<HTMLElement>(null);
  const cards = useRef<(HTMLElement | null)[]>([]);
  const [center, setCenter] = useState(0);
  const settings = useRef(tuning);
  settings.current = tuning;
  /** Glides the page to card `index` (set by the effect, used by a press on a neighbour). */
  const guideTo = useRef<(index: number) => void>(() => {});

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const reduced = window.matchMedia(reducedQuery);
    let x = 0;
    let shownCenter = 0;
    let last = performance.now();
    let raf = 0;
    let running = false;

    const place = (at: number) => {
      const { sideScale, sideOpacity, spacing } = settings.current.cards;
      const width = cards.current[0]?.offsetWidth ?? 0;
      cards.current.forEach((card, i) => {
        if (!card) return;
        const d = i - at;
        const away = Math.abs(d);
        const near = Math.min(away, 1);
        const scale = 1 - (1 - sideScale) * near;
        const opacity = away <= 1 ? 1 - (1 - sideOpacity) * away : sideOpacity * clamp01(1 - (away - 1) / FADE_OUT);
        card.style.translate = `calc(-50% + ${(d * spacing * width).toFixed(2)}px) -50%`;
        card.style.scale = scale.toFixed(4);
        card.style.opacity = opacity.toFixed(3);
        card.style.zIndex = String(100 - Math.round(away * 10));
        card.style.visibility = opacity <= 0.001 ? 'hidden' : '';
      });
      const c = Math.round(at);
      if (c !== shownCenter) {
        shownCenter = c;
        setCenter(c);
      }
    };

    const target = () => {
      const r = el.getBoundingClientRect();
      const span = r.height - window.innerHeight;
      const raw = (span > 0 ? clamp01(-r.top / span) : 0) * (count - 1);
      if (reduced.matches) return Math.round(raw);
      const i = Math.min(Math.floor(raw), count - 2);
      const f = raw - i;
      // Hold on each card for `hold` of the way (half each side), ease in and out between: smootherstep.
      const h = settings.current.scroll.hold / 2;
      const t = clamp01((f - h) / (1 - 2 * h || 1));
      return i + t * t * t * (t * (6 * t - 15) + 10);
    };

    const frame = (now: number) => {
      const goal = target();
      const tau = settings.current.scroll.smoothingMs;
      const dt = Math.min(now - last, 100);
      last = now;
      x = reduced.matches || tau <= 0 ? goal : x + (goal - x) * (1 - Math.exp(-dt / tau));
      if (Math.abs(goal - x) < 0.0005) x = goal;
      place(x);
      raf = running ? requestAnimationFrame(frame) : 0;
    };

    // Run only while the track is near the screen.
    const near = new IntersectionObserver(
      ([entry]) => {
        running = !!entry?.isIntersecting;
        if (running && !raf) {
          last = performance.now();
          raf = requestAnimationFrame(frame);
        }
      },
      { rootMargin: '50% 0px' },
    );
    near.observe(el);
    x = target();
    place(x);

    // Guidance (Godwin 2026-11-08: never left between two cards). Once scrolling stops for `settleDelayMs` with
    // the row between cards, the page glides to the nearest card's place, on its own ease-out over a time that
    // grows with the distance; the row then follows it as it follows any scroll. Any wheel, touch, key or press
    // stops the glide and hands the scroll back. Under reduced motion the row already shows whole cards.
    const scrollOf = (index: number) => {
      const top = el.getBoundingClientRect().top + window.scrollY;
      const span = el.offsetHeight - window.innerHeight;
      return top + (span * index) / (count - 1);
    };
    let glide = 0;
    let gliding = false;
    const stopGlide = () => {
      cancelAnimationFrame(glide);
      glide = 0;
      gliding = false;
    };
    const glideTo = (index: number) => {
      stopGlide();
      const from = window.scrollY;
      const to = scrollOf(index);
      const distance = Math.abs(to - from);
      if (distance < 1) return;
      if (reduced.matches) {
        window.scrollTo(0, to);
        return;
      }
      const { glideMs, glideMsPerScreen } = settings.current.guidance;
      const duration = glideMs + (glideMsPerScreen * distance) / window.innerHeight;
      const start = performance.now();
      gliding = true;
      const step = (now: number) => {
        const t = clamp01((now - start) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        window.scrollTo(0, from + (to - from) * eased);
        if (t < 1 && gliding) glide = requestAnimationFrame(step);
        else stopGlide();
      };
      glide = requestAnimationFrame(step);
    };
    guideTo.current = glideTo;

    let idle = 0;
    const settle = () => {
      if (gliding || reduced.matches) return;
      const r = el.getBoundingClientRect();
      const span = r.height - window.innerHeight;
      const p = span > 0 ? -r.top / span : 0;
      // Only inside the row's own scroll, not before its first card or after its last.
      if (p <= 0 || p >= 1) return;
      const at = target();
      const nearest = Math.round(at);
      // Already resting on a card (inside its hold): nothing to do.
      if (Math.abs(at - nearest) < 0.001) return;
      glideTo(nearest);
    };
    const onScroll = () => {
      if (gliding) return;
      window.clearTimeout(idle);
      idle = window.setTimeout(settle, settings.current.guidance.settleDelayMs);
    };
    const takeBack = () => {
      if (gliding) stopGlide();
    };
    // Only keys that scroll the page take it back; Tab can start a glide (the row's own keyboard handling).
    const scrollKeys = new Set(['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' ']);
    const takeBackKey = (e: KeyboardEvent) => {
      if (scrollKeys.has(e.key)) takeBack();
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('keydown', takeBackKey);
    for (const type of ['wheel', 'touchstart', 'pointerdown'] as const) {
      window.addEventListener(type, takeBack, { passive: true });
    }
    return () => {
      running = false;
      cancelAnimationFrame(raf);
      near.disconnect();
      stopGlide();
      window.clearTimeout(idle);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('keydown', takeBackKey);
      for (const type of ['wheel', 'touchstart', 'pointerdown'] as const) {
        window.removeEventListener(type, takeBack);
      }
    };
  }, [count]);

  /** A press on a neighbour glides the page so that card sits in the middle. */
  const pick = (index: number) => guideTo.current(index);

  // Keyboard (Godwin 2026-11-08: Tab past "Sign in" jumped to the next section, since the other cards are inert):
  // Tab past the middle card's last control, or Shift+Tab before its first, glides the row to the next card in
  // that direction that has controls and focuses its first (or last) one once it is live. With none left that
  // way, Tab leaves the row as usual.
  const controlsOf = (card: HTMLElement | null | undefined) => {
    const content = card?.querySelector<HTMLElement>('.row__content');
    if (!content) return [];
    return [...content.querySelectorAll<HTMLElement>('a[href], button, input, select, textarea, [tabindex]')].filter((el) => {
      if (el.tabIndex < 0 || (el as HTMLButtonElement).disabled) return false;
      // A picture's own decorative parts are inert for good; the card's content is inert only while off-centre.
      const sealed = el.closest('[inert]');
      return !sealed || sealed === content;
    });
  };
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== 'Tab') return;
    const here = cards.current.findIndex((c) => c?.contains(document.activeElement));
    if (here < 0) return;
    const inside = controlsOf(cards.current[here]);
    const at = inside.findIndex((el) => el === document.activeElement || el.contains(document.activeElement));
    const dir = e.shiftKey ? -1 : 1;
    if (at < 0 || (dir === 1 ? at < inside.length - 1 : at > 0)) return;
    for (let j = here + dir; j >= 0 && j < count; j += dir) {
      if (!controlsOf(cards.current[j]).length) continue;
      e.preventDefault();
      guideTo.current(j);
      const started = performance.now();
      const land = () => {
        const content = cards.current[j]?.querySelector<HTMLElement>('.row__content');
        if (content && !content.inert) {
          const list = controlsOf(cards.current[j]);
          (dir === 1 ? list[0] : list.at(-1))?.focus({ preventScroll: true });
        } else if (performance.now() - started < 3000) requestAnimationFrame(land);
      };
      requestAnimationFrame(land);
      return;
    }
  };

  return (
    <section
      ref={track}
      onKeyDown={onKeyDown}
      className="row"
      data-theme="light"
      aria-label="Features, one at a time"
      style={
        {
          ...featuresStyle,
          '--row-count': count,
          '--row-screens-per-card': tuning.scroll.screensPerCard,
        } as CSSProperties
      }
    >
      <StorySpeed.Provider value={tuning.stories.speed}>
      <div className="row__stage">
        {FEATURES.map((f, i) => (
          <RowCard
            key={f.title}
            index={i}
            feature={f}
            centered={i === center}
            onPick={pick}
            cardRef={(node) => void (cards.current[i] = node)}
          />
        ))}
      </div>
      </StorySpeed.Provider>
    </section>
  );
}

/** A phone (Godwin 2026-11-09): the cards stacked, scrolling down with the page; each plays when it shows. */
function StackRow() {
  const tuning = useRowTuning();
  return (
    <section className="row" data-layout="stack" data-theme="light" aria-label="Features" style={featuresStyle as CSSProperties}>
      <StorySpeed.Provider value={tuning.stories.speed}>
        {FEATURES.map((f, i) => (
          <RowCard key={f.title} index={i} feature={f} centered onPick={() => {}} cardRef={() => {}} />
        ))}
      </StorySpeed.Provider>
    </section>
  );
}

function useWide() {
  const [wide, setWide] = useState(() => window.matchMedia(wideQuery).matches);
  useEffect(() => {
    const mq = window.matchMedia(wideQuery);
    const on = () => setWide(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return wide;
}

/** The feature cards: sideways on a sticky stage from breakpoint/md, stacked on a phone. */
export function FeatureRow() {
  return useWide() ? <SideRow /> : <StackRow />;
}
