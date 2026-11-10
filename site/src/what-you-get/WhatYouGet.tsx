// Landing page "What you get" (Figma 7066:29609 and its five states; Godwin 2026-11-08, motion plan agreed the same
// day). Six slides, each a sentence with Bland parts scattered around it (slides.tsx).
//
// The section is a tall track with a sticky stage, as the feature row is (Godwin 2026-11-09, after a one-screen
// snapping scroller let a fast page flick skip the whole section): the slide follows the scroll position, slide k at
// k / (count - 1) of the track, and once scrolling stops between two slides the page glides to the nearest. A flick
// has to travel the whole track, so the section can't be skipped, and the page never rests between slides; a strong
// flick inside the track can pass more than one slide. The browser scrolls; no gesture is read or swallowed. The
// On a phone the frame does not fit, so the stage holds the sentence with its parts above and under it, on the same
// track (Godwin 2026-11-09).
//
// Reduced motion: nothing rises or pops (they fade).
import { Fragment, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { clamp01 } from '../hero/story';
import { SLIDES, type Slide } from './slides';
import { LiveTiming, useWhatYouGetTuning, whatYouGetStyle, type WhatYouGetTuning } from './tuning';
import './what-you-get.css';

/** Figma's frame, the stage's design size. */
const FRAME_W = 1440;
const FRAME_H = 1024;

const reducedQuery = '(prefers-reduced-motion: reduce)';
const wideQuery = '(min-width: 768px)';

function useMedia(query: string) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setMatches(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, [query]);
  return matches;
}

/** Shown once any of it has been on screen; `inView` while it is. */
function useSeen(ref: React.RefObject<HTMLElement | null>, threshold = 0.15) {
  const [seen, setSeen] = useState(false);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        const on = Boolean(entry?.isIntersecting);
        setInView(on);
        if (on) setSeen(true);
      },
      { threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, threshold]);
  return { seen, inView };
}

/** A sentence as words, each with its place (--d) for the staggered rise. */
function Sentence({ text }: { text: string }) {
  const words = text.split(' ');
  return (
    <p className="wyg__sentence">
      {words.map((word, i) => (
        <Fragment key={i}>
          <span className="wyg__word" style={{ '--d': i } as CSSProperties}>
            {word}
          </span>
          {i < words.length - 1 ? ' ' : null}
        </Fragment>
      ))}
    </p>
  );
}

/** A slide's parts, each in a wrapper at Figma's place (wide) and tilt, popping in by its place in the list (--k). */
function Parts({ slide, live, placed, half }: { slide: Slide; live: boolean; placed: boolean; half?: 'top' | 'bottom' }) {
  return (
    <>
      {slide.parts.map((part, k) => {
        // A phone splits the parts as Figma places them: above the frame's middle over the sentence, the rest under.
        if (half && (part.box[1] + part.box[3] / 2 < FRAME_H / 2 ? 'top' : 'bottom') !== half) return null;
        const [x, y, w, h] = part.box;
        const style = {
          '--k': k,
          '--tilt': `${-(part.tilt ?? 0)}deg`,
          ...(placed ? { '--x': `${x + w / 2}px`, '--y': `${y + h / 2}px` } : {}),
        } as CSSProperties;
        return (
          <div key={part.id} className="wyg__part" data-part={part.id} data-vector={part.vector || undefined} style={style}>
            {!placed && part.reserve ? (
              <div className="wyg__reserve">
                <div className="wyg__reserve-room" aria-hidden>
                  {part.reserve()}
                </div>
                {part.render({ live })}
              </div>
            ) : (
              part.render({ live })
            )}
          </div>
        );
      })}
    </>
  );
}

/** The stage, a slide per scroll gesture: the frame on wide screens, the phone's layout below breakpoint/md. */
function Stage({ tuning, reduced, compact }: { tuning: WhatYouGetTuning; reduced: boolean; compact: boolean }) {
  const track = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [leaving, setLeaving] = useState<number | null>(null);
  const [turn, setTurn] = useState(0);
  const [scale, setScale] = useState(1);
  const shown = useRef(0);
  const phone = useRef<HTMLDivElement>(null);
  const { seen, inView } = useSeen(track, 0.01);

  // The frame scales to fit the stage, never above Figma's size.
  useLayoutEffect(() => {
    const el = stage.current;
    if (!el) return;
    const fit = () => setScale(Math.min(1, el.clientWidth / FRAME_W, el.clientHeight / FRAME_H));
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // A phone: the parts shrink (zoom) just enough that sentence and parts fit the screen together; a short phone or
  // a long sentence would otherwise cut the tag off the top and the last part off the bottom.
  useLayoutEffect(() => {
    if (!compact) return;
    const box = phone.current;
    if (!box) return;
    const fit = () => {
      const clusters = [...box.querySelectorAll<HTMLElement>('.wyg__cluster')];
      const copy = box.querySelector<HTMLElement>('.wyg__copy');
      if (!copy) return;
      // At the phone size from CSS first (--landing-wyg-parts-zoom-sm), then smaller only if it still does not fit.
      for (const c of clusters) c.style.zoom = '';
      const cs = getComputedStyle(box);
      const filled = clusters.filter((c) => c.childElementCount > 0);
      const room =
        box.clientHeight -
        parseFloat(cs.paddingTop) -
        parseFloat(cs.paddingBottom) -
        parseFloat(cs.rowGap) * filled.length -
        copy.offsetHeight;
      const natural = filled.reduce((h, c) => h + c.getBoundingClientRect().height, 0);
      if (natural > room && room > 0) {
        for (const c of clusters) c.style.zoom = String((parseFloat(getComputedStyle(c).zoom) || 1) * (room / natural));
      }
    };
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, [compact, index, seen]);

  // The slide on screen follows the scroll through the track: slide k sits at k / (count - 1) of it (the feature
  // row's model, Godwin 2026-11-09), so a fast flick still has to travel the whole track and can't skip the section.
  const settings = useRef(tuning);
  settings.current = tuning;
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const n = SLIDES.length;
    const reducedMq = window.matchMedia(reducedQuery);
    const at = () => {
      const r = el.getBoundingClientRect();
      const span = r.height - window.innerHeight;
      return { p: span > 0 ? -r.top / span : 0, span };
    };
    let raf = 0;
    const paint = () => {
      raf = 0;
      const i = Math.max(0, Math.min(n - 1, Math.round(clamp01(at().p) * (n - 1))));
      if (i !== shown.current) {
        setLeaving(shown.current);
        shown.current = i;
        setIndex(i);
        setTurn((t) => t + 1);
      }
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(paint);
    };

    // Guidance, as the feature row's: once scrolling stops for settleDelayMs with the page between two slides, it
    // glides to the nearest slide on an ease-out that grows with the distance; any wheel, touch, key or press hands
    // the scroll back. Never left between slides.
    const scrollOf = (k: number) => el.getBoundingClientRect().top + window.scrollY + (at().span * k) / (n - 1);
    let glide = 0;
    let gliding = false;
    const stopGlide = () => {
      cancelAnimationFrame(glide);
      glide = 0;
      gliding = false;
    };
    const glideTo = (k: number) => {
      stopGlide();
      const from = window.scrollY;
      const to = scrollOf(k);
      const distance = Math.abs(to - from);
      if (distance < 1) return;
      if (reducedMq.matches) {
        window.scrollTo(0, to);
        return;
      }
      const { glideMs, glideMsPerScreen } = settings.current.scroll;
      const duration = glideMs + (glideMsPerScreen * distance) / window.innerHeight;
      const start = performance.now();
      gliding = true;
      const step = (now: number) => {
        const t = clamp01((now - start) / duration);
        window.scrollTo(0, from + (to - from) * (1 - Math.pow(1 - t, 3)));
        if (t < 1 && gliding) glide = requestAnimationFrame(step);
        else stopGlide();
      };
      glide = requestAnimationFrame(step);
    };
    let idle = 0;
    const settle = () => {
      if (gliding) return;
      const { p } = at();
      if (p <= 0 || p >= 1) return;
      const raw = p * (n - 1);
      const nearest = Math.round(raw);
      if (Math.abs(raw - nearest) * at().span < 2) return;
      glideTo(nearest);
    };
    const onScroll = () => {
      kick();
      if (gliding) return;
      window.clearTimeout(idle);
      idle = window.setTimeout(settle, settings.current.scroll.settleDelayMs);
    };
    const takeBack = () => {
      if (gliding) stopGlide();
    };
    const scrollKeys = new Set(['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' ']);
    const takeBackKey = (e: KeyboardEvent) => {
      if (scrollKeys.has(e.key)) takeBack();
    };
    paint();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', kick);
    window.addEventListener('keydown', takeBackKey);
    for (const type of ['wheel', 'touchstart', 'pointerdown'] as const) window.addEventListener(type, takeBack, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      stopGlide();
      window.clearTimeout(idle);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', kick);
      window.removeEventListener('keydown', takeBackKey);
      for (const type of ['wheel', 'touchstart', 'pointerdown'] as const) window.removeEventListener(type, takeBack);
    };
  }, []);

  const slide = SLIDES[index]!;
  const gone = leaving !== null && leaving !== index ? SLIDES[leaving]! : null;
  const play = seen;

  return (
    <section
      ref={track}
      id="what-you-get"
      className="wyg"
      data-layout={compact ? 'phone' : 'stage'}
      aria-labelledby="wyg-title"
      style={{ ...whatYouGetStyle(tuning), '--wyg-slides': SLIDES.length, '--wyg-screens': tuning.scroll.screensPerSlide } as CSSProperties}
    >
      <div ref={stage} className="wyg__stage" data-theme={slide.dark ? 'dark' : 'light'}>
        {compact ? (
          <div ref={phone} className="wyg__phone">
            {(['top', 'bottom'] as const).map((half) => {
              const parts = (
                <div key={half} className="wyg__parts" data-half={half} aria-hidden inert>
                  {play && (
                    <div key={`pin-${turn}`} className="wyg__cluster wyg__layer wyg__layer--parts" data-slide={slide.id} data-entering>
                      <Parts slide={slide} live={inView && !reduced} placed={false} half={half} />
                    </div>
                  )}
                </div>
              );
              if (half === 'bottom') return parts;
              return (
                <Fragment key="top">
                  {parts}
                  <div className="wyg__copy">
                    <h2 id="wyg-title" className="wyg__tag">
                      What you get
                    </h2>
                    <div className="wyg__sentences" aria-hidden>
                      {gone && (
                        <div
                          key={`out-${turn}`}
                          className="wyg__layer"
                          data-leaving
                          onAnimationEnd={(e) => e.target === e.currentTarget && setLeaving(null)}
                        >
                          <Sentence text={gone.text} />
                        </div>
                      )}
                      {play && (
                        <div key={`in-${turn}`} className="wyg__layer" data-entering>
                          <Sentence text={slide.text} />
                        </div>
                      )}
                    </div>
                  </div>
                </Fragment>
              );
            })}
          </div>
        ) : (
          <div className="wyg__frame" style={{ '--wyg-scale': scale } as CSSProperties}>
            <div className="wyg__copy">
              <h2 id="wyg-title" className="wyg__tag">
                What you get
              </h2>
              <div className="wyg__sentences" aria-hidden>
                {gone && (
                  <div
                    key={`out-${turn}`}
                    className="wyg__layer"
                    data-leaving
                    onAnimationEnd={(e) => e.target === e.currentTarget && setLeaving(null)}
                  >
                    <Sentence text={gone.text} />
                  </div>
                )}
                {play && (
                  <div key={`in-${turn}`} className="wyg__layer" data-entering>
                    <Sentence text={slide.text} />
                  </div>
                )}
              </div>
            </div>
            <div className="wyg__parts" aria-hidden inert>
              {gone && (
                <div key={`pout-${turn}`} className="wyg__layer wyg__layer--parts" data-leaving>
                  <Parts slide={gone} live={false} placed />
                </div>
              )}
              {play && (
                <div key={`pin-${turn}`} className="wyg__layer wyg__layer--parts" data-slide={slide.id} data-entering>
                  <Parts slide={slide} live={inView && !reduced} placed />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      {/* The sentences for screen readers, all six in order: the stage shows one at a time. */}
      <ul className="wyg__hidden">
        {SLIDES.map((s) => (
          <li key={s.id}>{s.text}</li>
        ))}
      </ul>
    </section>
  );
}

export function WhatYouGet() {
  const tuning = useWhatYouGetTuning();
  const reduced = useMedia(reducedQuery);
  const wide = useMedia(wideQuery);
  return (
    <LiveTiming.Provider value={tuning.parts}>
      <Stage tuning={tuning} reduced={reduced} compact={!wide} />
    </LiveTiming.Provider>
  );
}
