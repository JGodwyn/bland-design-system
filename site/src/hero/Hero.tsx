// Landing page hero (Figma 7097:36095 and its scroll states). The section is a tall track whose stage stays on
// screen: on load the nav slides in, the headline's characters rise in one after another and the description's
// words follow; on scroll (from the first pixel) each headline word goes from
// bold (with its glow) straight to its outline, while the description's words turn dark one by one and each of
// its five phrases gets a highlighter stroke as that pass reaches it, kept as the pass goes on, while its icon
// pops in beside it until the next phrase takes over (Godwin 2026-11-07); at the last, "dark.", the hero
// switches to Dark mode. The hero is light whatever the system
// theme (Godwin 2026-11-06). The button comes out while the pointer is over the headline and follows it,
// magnetically (Figma annotation, after typesafe.ai's hero).
import { Fragment, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { Icon, Logo } from '../../../src';
// Button's CSS for the link below, which uses its classes without the component.
import '../../../src/components/button/button.css';
import { FigmaLogoIcon, GitHubIcon } from '../icons';
import { clamp01, wave } from './story';
import { heroStyle, useHeroTuning, type HeroTuning } from './tuning';
import { markerImage } from './marker';
import reactIcon from './visuals/react.svg';
import swatchesIcon from './visuals/swatches.svg';
import diamondsIcon from './visuals/diamonds-four.svg';
import sunIcon from './visuals/sun.svg';
import moonIcon from './visuals/moon.svg';
import './hero.css';

/** Figma's three lines; the breaks apply from breakpoint/md. */
const TITLE_LINES = [['Bland', 'by'], ['design.', 'Built'], ['for', 'purpose.']];
const TITLE_WORDS = TITLE_LINES.flat();
/** Characters in the headline: the entrance staggers them one by one. */
const TITLE_CHARS = TITLE_WORDS.join('').length;

type Phrase = { text: string; icon: string; side: 'before' | 'after'; width: number; height: number };
/**
 * The description: plain runs and the five phrases that get a highlighter stroke, with Figma's icons. Every icon
 * is drawn as tall as the React logo, 52 (Godwin 2026-11-07: the others looked smaller; their SVG exports are 46
 * to 52 with the stroke outside, and were squeezed into Figma's 40 to 50 frames).
 */
const DESCRIPTION_PARTS: (string | Phrase)[] = [
  'A',
  { text: 'React design system', icon: reactIcon, side: 'before', width: 58, height: 52 },
  'that comes alive when you give it a',
  { text: 'color.', icon: swatchesIcon, side: 'before', width: 52, height: 52 },
  'Pick one, and every',
  { text: 'button, field, chart', icon: diamondsIcon, side: 'before', width: 52, height: 52 },
  'follows, in',
  { text: 'light', icon: sunIcon, side: 'before', width: 52, height: 52 },
  'and',
  { text: 'dark.', icon: moonIcon, side: 'after', width: 52, height: 52 },
];
const PHRASE_LIST = DESCRIPTION_PARTS.filter((p): p is Phrase => typeof p !== 'string');
const DESCRIPTION_WORDS = DESCRIPTION_PARTS.flatMap((p) => (typeof p === 'string' ? p : p.text).split(' '));
/** Index (in DESCRIPTION_WORDS) of each phrase's first word: the phrase lights when the pass reaches it. */
const PHRASE_STARTS = (() => {
  const starts: number[] = [];
  let i = 0;
  for (const part of DESCRIPTION_PARTS) {
    if (typeof part !== 'string') starts.push(i);
    i += (typeof part === 'string' ? part : part.text).split(' ').length;
  }
  return starts;
})();

/** The highlighter band's top once the hero is dark, as a share of the line: the whole word height. */
const DARK_MARKER_TOP = 0.06;

const links = [
  { label: 'Docs', href: '/docs/' },
  { label: 'Components', href: '/docs/#/components/button' },
  { label: 'Brand theme', href: '/docs/#/brand' },
];

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Scroll progress through the hero track, 0 to 1. It follows the real scroll with inertia (scroll.smoothingMs), eased
 * every frame until it settles, so the story glides instead of stepping with the wheel. Under reduced motion it
 * is the scroll position itself. Each frame goes to `onFrame`, which writes straight to the page: no React render
 * per frame (Godwin 2026-11-09: rendering the whole hero every frame took 40 to 100 ms a frame on a phone).
 */
function useTrackProgress(
  track: React.RefObject<HTMLElement | null>,
  tune: React.RefObject<HeroTuning>,
  onFrame: React.RefObject<(title: number, description: number) => void>,
) {
  // Two followers of the same scroll: the headline's (scroll.smoothingMs) and the description's, heavier
  // (scroll.descriptionSmoothingMs), so the description drifts after the scroll rather than racing it.
  useEffect(() => {
    let frame = 0;
    let target = 0;
    let title = 0;
    let description = 0;
    let last = 0;
    const measure = () => {
      const el = track.current;
      if (!el) return target;
      const rect = el.getBoundingClientRect();
      const distance = rect.height - window.innerHeight;
      return distance > 0 ? clamp01(-rect.top / distance) : 0;
    };
    const follow = (current: number, dt: number, ms: number) => {
      if (reducedMotion()) return target;
      const next = current + (target - current) * (1 - Math.exp(-dt / Math.max(1, ms)));
      return Math.abs(target - next) < 0.0002 ? target : next;
    };
    const tick = (now: number) => {
      const dt = last ? Math.min(64, now - last) : 16;
      last = now;
      title = follow(title, dt, tune.current.scroll.smoothingMs);
      description = follow(description, dt, tune.current.scroll.descriptionSmoothingMs);
      onFrame.current(title, description);
      if (title !== target || description !== target) frame = requestAnimationFrame(tick);
      else {
        frame = 0;
        last = 0;
      }
    };
    const schedule = () => {
      target = measure();
      if (!frame) frame = requestAnimationFrame(tick);
    };
    // Start where the page already is (a reload keeps its scroll), without gliding there.
    target = title = description = measure();
    onFrame.current(title, description);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [track, tune, onFrame]);
}

/** Places each phrase's icon beside its phrase: before the start of the phrase's line, or after the phrase. */
function useIconPlacement(description: React.RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    const root = description.current;
    if (!root) return;
    const place = () => {
      const box = root.getBoundingClientRect();
      const words = [...root.querySelectorAll<HTMLElement>('[data-word]')];
      root.querySelectorAll<HTMLElement>('[data-phrase]').forEach((phrase) => {
        const icon = phrase.querySelector<HTMLElement>('.hero__phrase-icon');
        if (!icon) return;
        const first = phrase.getClientRects()[0];
        const last = [...phrase.getClientRects()].at(-1);
        if (!first || !last) return;
        const gap = parseFloat(getComputedStyle(root).getPropertyValue('--landing-highlight-icon-gap')) || 0;
        const w = icon.offsetWidth;
        const h = icon.offsetHeight;
        let x: number;
        let y: number;
        if (phrase.dataset.side === 'after') {
          x = last.right - box.left + gap;
          y = last.top - box.top + (last.height - h) / 2;
        } else {
          // Before the first word on the phrase's first line (Figma: the icon sits at the line's start). Layout
          // offsets, not screen boxes: while the words rise in they are moved by a transform, which would put them
          // on another line as far as their screen box goes.
          const firstWord = phrase.querySelector<HTMLElement>('[data-word]');
          const lineWords = firstWord ? words.filter((w) => w.offsetTop === firstWord.offsetTop) : [];
          const lineLeft = lineWords.length ? Math.min(...lineWords.map((w) => w.offsetLeft)) + box.left : first.left;
          x = lineLeft - box.left - gap - w;
          y = first.top - box.top + (first.height - h) / 2;
        }
        // No room beside it (a phone): the icon sits just above the phrase's start (or end) instead.
        const stage = (root.closest('.hero__stage') ?? document.body).getBoundingClientRect();
        if (x + box.left < stage.left + gap || x + box.left + w > stage.right - gap) {
          const anchor = phrase.dataset.side === 'after' ? last : first;
          x = (phrase.dataset.side === 'after' ? anchor.right - w : anchor.left) - box.left;
          y = anchor.top - box.top - h;
        }
        icon.style.left = `${x}px`;
        icon.style.top = `${y}px`;
      });
    };
    place();
    const ro = new ResizeObserver(place);
    ro.observe(root);
    document.fonts?.ready.then(place);
    return () => ro.disconnect();
  }, [description]);
}

/**
 * Magnetic button: while a fine pointer is over the headline, the button drifts toward it (magnet.pull of the
 * way from the headline's centre) and catches up a little every frame, so it trails the pointer. It eases back
 * to the centre when the pointer leaves. None under reduced motion or without hover (it then sits in the flow).
 */
function useMagnet(
  area: React.RefObject<HTMLElement | null>,
  target: React.RefObject<HTMLElement | null>,
  tune: React.RefObject<HeroTuning>,
) {
  useEffect(() => {
    const zone = area.current;
    const el = target.current;
    if (!zone || !el) return;
    const fine = window.matchMedia('(hover: hover) and (pointer: fine) and (min-width: 768px)');
    let goal = { x: 0, y: 0 };
    let now = { x: 0, y: 0 };
    let frame = 0;
    const step = () => {
      const ease = tune.current.magnet.ease;
      now = { x: now.x + (goal.x - now.x) * ease, y: now.y + (goal.y - now.y) * ease };
      el.style.setProperty('--magnet-x', `${now.x.toFixed(2)}px`);
      el.style.setProperty('--magnet-y', `${now.y.toFixed(2)}px`);
      frame = Math.abs(goal.x - now.x) + Math.abs(goal.y - now.y) > 0.1 ? requestAnimationFrame(step) : 0;
    };
    const run = () => {
      if (!frame) frame = requestAnimationFrame(step);
    };
    const move = (e: PointerEvent) => {
      if (!fine.matches || reducedMotion() || e.pointerType !== 'mouse') return;
      // Measure the words, not the block: the block is as wide as the screen allows, the text is narrower.
      const title = zone.querySelector('h1');
      const range = document.createRange();
      if (title) range.selectNodeContents(title);
      const box = title ? range.getBoundingClientRect() : zone.getBoundingClientRect();
      const { pull, reach } = tune.current.magnet;
      const reachX = (box.width / 2) * reach;
      const reachY = (box.height / 2) * reach;
      const clampTo = (v: number, r: number) => Math.max(-r, Math.min(r, v));
      goal = {
        x: clampTo((e.clientX - (box.left + box.width / 2)) * pull, reachX),
        y: clampTo((e.clientY - (box.top + box.height / 2)) * pull, reachY),
      };
      run();
    };
    const leave = () => {
      goal = { x: 0, y: 0 };
      run();
    };
    zone.addEventListener('pointermove', move);
    zone.addEventListener('pointerleave', leave);
    return () => {
      cancelAnimationFrame(frame);
      zone.removeEventListener('pointermove', move);
      zone.removeEventListener('pointerleave', leave);
    };
  }, [area, target]);
}

/**
 * Gives every phrase its highlighter stroke (marker.ts), in --landing-marker-color (highlighter yellow), each
 * with its own seed so no two strokes are the same. Rebuilt when the theme or the Highlight sliders change.
 */
function useMarkers(description: React.RefObject<HTMLElement | null>, dark: boolean, t: HeroTuning) {
  const { markerStrength, markerTop, markerBottom, markerRoughness } = t.highlight;
  useLayoutEffect(() => {
    const root = description.current;
    if (!root) return;
    const probe = document.createElement('span');
    probe.style.color = 'var(--landing-marker-color)';
    root.append(probe);
    const color = getComputedStyle(probe).color;
    probe.remove();
    // Once dark, the phrases keep dark text (data-theme="light"), so the stroke covers the letters' full height:
    // over a low band their tops would sit on the dark page.
    const top = dark ? Math.min(markerTop, DARK_MARKER_TOP) : markerTop;
    const shape = { strength: markerStrength / 100, top, bottom: markerBottom, roughness: markerRoughness };
    root.querySelectorAll<HTMLElement>('[data-phrase]').forEach((phrase, i) => {
      phrase.style.setProperty('--landing-marker-image', markerImage(color, shape, 11 + i * 17));
    });
  }, [description, dark, markerStrength, markerTop, markerBottom, markerRoughness]);
}

export function Hero() {
  const track = useRef<HTMLElement>(null);
  const description = useRef<HTMLParagraphElement>(null);
  const title = useRef<HTMLHeadingElement>(null);
  const copy = useRef<HTMLDivElement>(null);
  const action = useRef<HTMLDivElement>(null);
  const [entered, setEntered] = useState(false);
  const [reduced, setReduced] = useState(false);
  const replay = () => {
    setEntered(false);
    requestAnimationFrame(() => requestAnimationFrame(() => setEntered(true)));
  };
  const tuning = useHeroTuning(replay);
  const tune = useRef(tuning);
  tune.current = tuning;
  useIconPlacement(description);
  useMagnet(copy, action, tune);

  // The button waits for the headline (Godwin 2026-11-10): ready once its last character has risen in, the
  // entrance's stagger across every character plus one character's rise. A replay starts the wait again.
  const [ready, setReady] = useState(false);
  const { charStagger, charDuration } = tuning.entrance;
  useEffect(() => {
    if (!entered) {
      setReady(false);
      return;
    }
    const id = window.setTimeout(() => setReady(true), charStagger * (TITLE_CHARS - 1) + charDuration);
    return () => window.clearTimeout(id);
  }, [entered, charStagger, charDuration]);

  useEffect(() => {
    setReduced(reducedMotion());
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setEntered(true)));
    return () => cancelAnimationFrame(id);
  }, []);

  // How many phrases the description's pass has reached: the only part of the scroll story React renders (their
  // strokes, the current icon, the turn to dark). Everything continuous is written to the page each frame.
  const [reached, setReached] = useState(0);
  const reducedRef = useRef(false);
  const last = useRef({ title: 0, description: 0 });
  const onFrame = useRef((pTitle: number, pDescription: number) => {
    last.current = { title: pTitle, description: pDescription };
    const t = tune.current;
    // Reduced motion: the headline switches in one step (its CSS crossfades), never scrubbed. The description's
    // words still turn dark one by one: a color change, no movement.
    const words = title.current?.querySelectorAll<HTMLElement>('.hero__word') ?? [];
    words.forEach((word, i) => {
      const bold = reducedRef.current
        ? pTitle < (t.title[0] + t.title[1]) / 2
          ? 1
          : 0
        : 1 - wave(pTitle, t.title, i, TITLE_WORDS.length, t.scroll.titleSoftness);
      word.style.setProperty('--bold', bold.toFixed(3));
    });
    // Each description word's ink, 0 (text-minimal) to 1 (text-bold), washing across a few words at once.
    const descWords = description.current?.querySelectorAll<HTMLElement>('.hero__desc-word') ?? [];
    descWords.forEach((word, i) => {
      const ink = wave(pDescription, t.description, i, DESCRIPTION_WORDS.length, t.scroll.descriptionSoftness);
      word.style.setProperty('--ink', ink.toFixed(3));
      word.toggleAttribute('data-on', ink >= 1);
    });
    // The active text: where the wash is halfway, as a word position (a word is active while its ink passes 0.5).
    // A phrase is marked once the active text reaches it, and keeps its stroke as the pass goes on (Godwin
    // 2026-11-07); scrolling back above it takes the stroke off again.
    const n = DESCRIPTION_WORDS.length;
    const w = t.scroll.descriptionSoftness;
    const [dStart, dEnd] = t.description;
    const q = clamp01((pDescription - dStart) / Math.max(0.0001, dEnd - dStart));
    const front = q * (n + w) - w / 2;
    setReached(PHRASE_STARTS.filter((start) => front >= start).length);
  });
  useTrackProgress(track, tune, onFrame);
  // A tuning change (DialKit) or reduced motion re-applies the current frame.
  useEffect(() => {
    reducedRef.current = reduced;
    onFrame.current(last.current.title, last.current.description);
  }, [reduced, tuning]);
  const marked = PHRASE_STARTS.map((_, i) => i < reached);
  // Reaching the last, "dark.", turns the hero dark.
  const dark = reached === PHRASE_STARTS.length;
  // The icon shows for the newest marked phrase only: it pops in when that phrase is reached and hands over to the
  // next one's; the last, the moon by "dark.", stays.
  const current = reached - 1;
  useMarkers(description, dark, tuning);

  let titleIndex = 0;
  let charIndex = 0;
  /** A word's characters, each its own span with its place in the headline (--c), for the staggered rise. */
  const chars = (word: string, first: number) =>
    [...word].map((ch, k) => (
      <span key={k} className="hero__char" style={{ '--c': first + k } as CSSProperties}>
        {ch}
      </span>
    ));
  let wordIndex = 0;
  let phraseIndex = 0;

  return (
    <section
      ref={track}
      className="hero"
      aria-labelledby="hero-title"
      data-entered={entered || undefined}
      data-ready={ready || undefined}
      style={heroStyle(tuning)}
    >
      <div className="hero__stage" data-theme={dark ? 'dark' : 'light'}>
        <header className="hero__nav-wrap">
          <nav className="hero__nav" aria-label="Main">
            <Logo size="sm" href="/" className="hero__logo" />
            <ul className="hero__links" role="list">
              {links.map((link) => (
                <li key={link.label}>
                  <a className="hero__link bland-focus-ring bland-smooth" href={link.href}>
                    {link.label}
                  </a>
                </li>
              ))}
              <li className="hero__nav-figma">
                <a className="hero__link hero__link--icon bland-focus-ring bland-smooth" href="https://www.figma.com/community">
                  <Icon size="md" label="Figma kit">
                    <FigmaLogoIcon />
                  </Icon>
                </a>
              </li>
              <li>
                <a className="hero__link hero__link--icon bland-focus-ring bland-smooth" href="https://github.com/JGodwyn/bland-design-system">
                  <Icon size="md" label="GitHub">
                    <GitHubIcon />
                  </Icon>
                </a>
              </li>
            </ul>
          </nav>
        </header>

        <div ref={copy} className="hero__copy">
          <h1 ref={title} id="hero-title" className="hero__title" aria-label={TITLE_WORDS.join(' ')}>
            {TITLE_LINES.map((line, l) => (
              <Fragment key={l}>
                {line.map((word, w) => {
                  const i = titleIndex++;
                  const style = { '--i': i } as CSSProperties;
                  const c0 = charIndex;
                  charIndex += word.length;
                  return (
                    <Fragment key={word}>
                      <span className="hero__word" style={style}>
                        <span className="hero__word-outline">{chars(word, c0)}</span>
                        <span className="hero__word-layer hero__word-bold" aria-hidden>
                          {chars(word, c0)}
                        </span>
                      </span>
                      {w < line.length - 1 ? ' ' : null}
                    </Fragment>
                  );
                })}
                {l < TITLE_LINES.length - 1 ? (
                  <>
                    <br className="hero__break" />{' '}
                  </>
                ) : null}
              </Fragment>
            ))}
          </h1>
          <div ref={action} className="hero__action">
            {/* A link drawn as Bland's md brand primary Button (Button renders a <button>, which can't hold an
                href), so open in a new tab, Cmd-click and the address on hover work (landing audit 2026-11-10). */}
            <a className="bland-button bland-focus-ring bland-smooth" data-size="md" data-emotion="brand" data-type="primary" href="/docs/">
              <span className="bland-button__label">Read the docs</span>
            </a>
          </div>
        </div>

        <p ref={description} className="hero__description">
          {DESCRIPTION_PARTS.map((part, k) => {
            const words = (typeof part === 'string' ? part : part.text).split(' ');
            const rendered = words.map((word, w) => {
              const i = wordIndex++;
              return (
                <Fragment key={w}>
                  <span
                    className="hero__desc-word"
                    data-word
                    style={{ '--d': i } as CSSProperties}
                  >
                    {word}
                  </span>
                  {w < words.length - 1 ? ' ' : null}
                </Fragment>
              );
            });
            const space = k < DESCRIPTION_PARTS.length - 1 ? ' ' : null;
            if (typeof part === 'string') {
              return (
                <Fragment key={k}>
                  {rendered}
                  {space}
                </Fragment>
              );
            }
            const index = phraseIndex++;
            return (
              <Fragment key={k}>
                <span
                  className="hero__phrase"
                  data-phrase
                  data-side={part.side}
                  data-lit={marked[index] || undefined}
                  data-theme={marked[index] ? 'light' : undefined}
                  data-current={current === index || undefined}
                >
                  {rendered}
                  <img
                    className="hero__phrase-icon"
                    src={part.icon}
                    alt=""
                    width={part.width}
                    height={part.height}
                    loading="lazy"
                    decoding="async"
                    style={{ '--icon-w': `${part.width}px`, '--icon-h': `${part.height}px` } as CSSProperties}
                  />
                </span>
                {space}
              </Fragment>
            );
          })}
        </p>
      </div>
    </section>
  );
}

export const HERO_PHRASES = PHRASE_LIST.map((p) => p.text);
