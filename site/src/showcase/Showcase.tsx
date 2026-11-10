// Landing page "Components showcase" (Figma 7071:32494). Nine real Bland components on a sunken panel, and a toolbar
// that restyles them the way a project's brand.css does: the brand (eight presets or any color, run through the
// brand tool), light or dark, and the font. Godwin's annotations: every component works; the font button cycles
// through preset fonts; the sun button is light and dark; the swatches pick any color, a better range than Figma's
// placeholders. A change reaches the toolbar first and then each card in reading order (the wave); brand colors
// ease, theme and font switch at once in each card. The cards pop in once, in reading order, as the panel comes
// into view. Plan agreed with Godwin before the build (2026-11-09).
import { useEffect, useMemo, useRef, useState, type CSSProperties, type MouseEvent, type ReactNode } from 'react';
import { flushSync } from 'react-dom';
import { Icon, ScrollArea } from '../../../src';
import { cards, lastCards, moreCards } from './Cards';
import { Popover } from '../../../src/components/overlay/Popover';
import { ColorPicker } from '../../../playground/docs/ColorPicker';
import { StackIcon } from '../../../playground/docs/icons';
import { BLAND, BRANDS, FONTS, fontStyle, loadFont, paletteFor, paletteStyle, type Look } from './settings';
import { showcaseStyle, useShowcaseTuning } from './tuning';
import { CaretUpDownIcon, MoonIcon, SunIcon, TextTIcon } from './vectors';
import './showcase.css';

/** How many sets of nine the switcher cycles through. */
const SETS = 3;

const reducedQuery = '(prefers-reduced-motion: reduce)';

function useReducedMotion() {
  const [reduced, setReduced] = useState(() => typeof matchMedia !== 'undefined' && matchMedia(reducedQuery).matches);
  useEffect(() => {
    const q = matchMedia(reducedQuery);
    const on = () => setReduced(q.matches);
    q.addEventListener('change', on);
    return () => q.removeEventListener('change', on);
  }, []);
  return reduced;
}

/**
 * One themed box: the outer element computes the text styles from its font (Bland's --type-* composites are
 * declared for light only, so a dark element can't recompute them; LEARNINGS), the inner one computes every color
 * role from its own brand steps and theme.
 */
function Themed({
  look,
  className,
  outerClassName,
  style,
  children,
}: {
  look: Look;
  className: string;
  outerClassName?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  return (
    <div className={outerClassName} data-theme="light" style={fontStyle(look.font)}>
      <div className={className} data-theme={look.theme} style={{ ...paletteStyle(paletteFor(look.hex)), ...style }}>
        {children}
      </div>
    </div>
  );
}

/**
 * The ring sits on the active swatch; the last swatch is "Any color", which opens the docs site's color picker
 * (Godwin 2026-11-09) in the shared popover. At either end of the strip the ring's outer corners round with the
 * strip's (Godwin 2026-11-09).
 */
function Swatches({ hex, onPick, onDraggingChange }: { hex: string; onPick: (hex: string) => void; onDraggingChange: (dragging: boolean) => void }) {
  const preset = BRANDS.findIndex((b) => b.hex === hex);
  const active = preset === -1 ? BRANDS.length : preset;
  const custom = preset === -1 ? hex : null;
  const any = useRef<HTMLButtonElement>(null);
  const [picking, setPicking] = useState<{ instant: boolean } | null>(null);
  const edge = active === 0 ? 'start' : active === BRANDS.length ? 'end' : undefined;
  return (
    <div className="showcase__swatches" style={{ '--active': active, '--swatch-count': BRANDS.length + 1 } as CSSProperties}>
      <div className="showcase__presets" role="radiogroup" aria-label="Brand color">
        {BRANDS.map((b) => (
          <label key={b.id} className="showcase__swatch" style={{ background: b.hex }}>
            <input
              className="showcase__swatch-input"
              type="radio"
              name="showcase-brand"
              aria-label={b.name}
              checked={b.hex === hex}
              onChange={() => onPick(b.hex)}
            />
          </label>
        ))}
      </div>
      <button
        ref={any}
        type="button"
        className="showcase__swatch showcase__swatch--any"
        style={custom ? { background: custom } : undefined}
        aria-label={custom ? `Any color: ${custom.toUpperCase()}` : 'Any color'}
        aria-haspopup="dialog"
        aria-expanded={!!picking}
        onClick={(e) => setPicking(picking ? null : { instant: e.detail === 0 })}
      />
      <span className="showcase__ring" data-edge={edge} aria-hidden="true" />
      <Popover
        open={!!picking}
        reference={any.current}
        placement="top"
        instant={picking?.instant ?? true}
        onClose={() => setPicking(null)}
        returnFocus={any}
        role="dialog"
        aria-label="Pick a brand color"
      >
        <ColorPicker value={hex} onChange={onPick} onDraggingChange={onDraggingChange} />
      </Popover>
    </div>
  );
}

export function Showcase() {
  const t = useShowcaseTuning();
  const reduced = useReducedMotion();
  const [target, setTarget] = useState<Look>({
    hex: BLAND.hex,
    theme: 'light',
    font: FONTS[0]!,
  });
  // Which set of nine the panel shows: Figma's, then two more (the switcher before the font button cycles them).
  const [set, setSet] = useState(0);
  const items = useMemo(
    () =>
      set === 0
        ? cards({
            buttonLoadingMs: t.parts.buttonLoadingMs,
            uploadStepMs: t.parts.uploadStepMs,
          })
        : set === 1
          ? moreCards()
          : lastCards(),
    [set, t.parts.buttonLoadingMs, t.parts.uploadStepMs],
  );
  // While the picker is dragged, a color reaches every card at once (a wave per pointer move would never finish).
  const dragging = useRef(false);
  // A switch from the keyboard shows the new set at once (keyboard actions don't animate, docs/motion.md).
  const [instant, setInstant] = useState(false);
  // looks[0] is the panel and its toolbar; looks[1..9] the cards.
  const [looks, setLooks] = useState<Look[]>(() => Array.from({ length: items.length + 1 }, () => target));
  const timers = useRef<number[]>([]);
  const latest = useRef(0);

  // The wave: the new look reaches the panel, then each card, staggerMs apart (all at once under reduced motion).
  const apply = (next: Look) => {
    setTarget(next);
    const run = ++latest.current;
    const stagger = reduced || dragging.current ? 0 : t.wave.staggerMs;
    const start = () => {
      // A font that loads after a newer change was made starts nothing: only the newest change runs.
      if (run !== latest.current) return;
      timers.current.forEach(clearTimeout);
      timers.current = [];
      for (let i = 0; i <= items.length; i++) {
        const set = () => setLooks((all) => all.map((l, j) => (j === i ? next : l)));
        if (stagger === 0) set();
        else timers.current.push(window.setTimeout(set, i * stagger));
      }
    };
    // A new font waits for its stylesheets, so no card shows the fallback first.
    void loadFont(next.font.id).then(start);
  };
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  // Light and dark: the button sinks while pressed and pops as it lets go, and the new theme grows out of it as a
  // circle until it covers the panel (Godwin 2026-11-09). A view transition of the panel alone: the old panel stays
  // as a picture underneath while the new one, live, is revealed through a growing clip-path. Every card switches
  // in the same frame. Without view transitions the theme switches at once; under reduced motion it cross-fades.
  const themeRef = useRef<HTMLButtonElement>(null);
  // The round buttons' release: from the pressed sink, past full size, back (the press itself is CSS :active).
  const pop = (button: HTMLElement) =>
    button.animate([{ transform: `scale(${t.theme.sink})` }, { transform: `scale(${t.theme.pop})`, offset: 0.45 }, { transform: 'none' }], {
      duration: t.theme.popMs,
      easing: getComputedStyle(button).getPropertyValue('--easing-out').trim() || 'ease-out',
    });
  // The switcher: the other set comes in with the entrance pop, as the first did.
  const switchSet = (e: MouseEvent<HTMLButtonElement>) => {
    const keyboard = e.detail === 0;
    if (!reduced && !keyboard) pop(e.currentTarget);
    setInstant(keyboard);
    setSet((n) => (n + 1) % SETS);
  };
  const toggleTheme = (e: MouseEvent) => {
    const next: Look = {
      ...target,
      theme: target.theme === 'dark' ? 'light' : 'dark',
    };
    const button = themeRef.current;
    // Enter or Space (a click with no pointer press) switches at once: keyboard actions don't animate (docs/motion.md).
    const keyboard = e.detail === 0;
    if (button && !reduced && !keyboard) pop(button);
    const swap = () =>
      flushSync(() => {
        latest.current++;
        timers.current.forEach(clearTimeout);
        timers.current = [];
        setTarget(next);
        setLooks((all) => all.map(() => next));
      });
    const panel = panelRef.current?.querySelector<HTMLElement>('.showcase__panel');
    if (keyboard || !document.startViewTransition || !panel || !button) return swap();
    const transition = document.startViewTransition(swap);
    void transition.ready.then(() => {
      const p = panel.getBoundingClientRect();
      const b = button.getBoundingClientRect();
      const x = b.left + b.width / 2 - p.left;
      const y = b.top + b.height / 2 - p.top;
      // Far enough to reach the furthest corner of the panel's visible part (on a phone the panel is far taller than
      // the screen; growing to its far end would spend the reveal off screen).
      const top = Math.max(p.top, 0) - p.top;
      const bottom = Math.min(p.bottom, innerHeight) - p.top;
      const r = Math.hypot(Math.max(x, p.width - x), Math.max(y - top, bottom - y));
      const pseudoElement = '::view-transition-new(showcase-panel)';
      const root = document.documentElement;
      if (reduced) root.animate({ opacity: [0, 1] }, { duration: t.theme.fadeMs, easing: 'linear', pseudoElement });
      else
        root.animate(
          {
            clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`],
          },
          {
            duration: t.theme.revealMs,
            easing: getComputedStyle(root).getPropertyValue('--easing-drawer').trim() || 'ease-out',
            pseudoElement,
          },
        );
    });
  };

  // The entrance: once, when the panel is a fifth in view.
  const panelRef = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = panelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const nextFont = FONTS[(FONTS.indexOf(target.font) + 1) % FONTS.length]!;
  const dark = target.theme === 'dark';

  return (
    <section className="showcase" aria-labelledby="showcase-title" style={showcaseStyle(t)} data-shown={shown || undefined} data-instant={instant || undefined}>
      <div className="showcase__grid bland-grid">
        <div className="showcase__head">
          <h2 id="showcase-title" className="showcase__title">
            Components showcase
          </h2>
          <p className="showcase__lede">Plain until it&rsquo;s yours. The same components, any brand. Switch the color and watch them follow.</p>
        </div>

        <div ref={panelRef} className="showcase__panel-slot">
          <Themed look={looks[0]!} outerClassName="showcase__panel-font" className="showcase__panel bland-smooth">
            {/* Keyed by the set, so a switch mounts the new cards and they pop in. */}
            <div className="showcase__cards" key={set} data-set={set}>
              {items.map((card, i) => (
                <Themed
                  key={card.id}
                  look={looks[i + 1]!}
                  outerClassName="showcase__card-slot"
                  className="showcase__card bland-smooth"
                  style={{ '--i': i } as CSSProperties}
                >
                  {/* Every card keeps one height (Godwin 2026-11-09): what grows (an open Accordion, an
                      uploaded file, a six-week month) scrolls inside it, with Bland's fade and scrollbar. */}
                  <ScrollArea className="showcase__card-scroll" fadeSize="sm">
                    <div className="showcase__card-body" data-card={card.id} data-top={card.top || undefined}>
                      {card.node}
                    </div>
                  </ScrollArea>
                </Themed>
              ))}
            </div>

            <div className="showcase__toolbar">
              <div className="showcase__looks">
                <button
                  type="button"
                  className="showcase__round"
                  aria-label={`Components: set ${set + 1} of ${SETS}. Show set ${((set + 1) % SETS) + 1}`}
                  onClick={switchSet}
                >
                  <Icon size="md">
                    <StackIcon />
                  </Icon>
                </button>
                <button
                  type="button"
                  className="showcase__font bland-smooth"
                  aria-label={`Font: ${target.font.name}. Switch to ${nextFont.name}`}
                  onClick={() => apply({ ...target, font: nextFont })}
                >
                  <span className="showcase__font-mark bland-smooth" aria-hidden="true">
                    <Icon size="md">
                      <TextTIcon />
                    </Icon>
                  </span>
                  <span className="showcase__font-name">{target.font.name}</span>
                  <Icon size="md" className="showcase__font-caret">
                    <CaretUpDownIcon />
                  </Icon>
                </button>
              </div>

              <div className="showcase__looks">
                <button
                  ref={themeRef}
                  type="button"
                  className="showcase__round showcase__theme"
                  aria-label="Dark theme"
                  aria-pressed={dark}
                  onClick={toggleTheme}
                >
                  <Icon size="md">{dark ? <MoonIcon /> : <SunIcon />}</Icon>
                </button>
                <Swatches hex={target.hex} onPick={(hex) => apply({ ...target, hex })} onDraggingChange={(d) => (dragging.current = d)} />
              </div>
            </div>
          </Themed>
        </div>

        <div className="showcase__more">
          {/* A real link drawn as Bland's md brand primary Button (the Button's own markup and classes). */}
          <a className="bland-button bland-focus-ring bland-smooth" data-size="md" data-emotion="brand" data-type="primary" href="/docs/#/components/button">
            <span className="bland-button__label">Browse all components</span>
          </a>
        </div>
      </div>
    </section>
  );
}
