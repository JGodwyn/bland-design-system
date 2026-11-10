// The Figma kit picture (Figma 7078:34304, annotation on 7101:36529: "a simple design of the Figma file ...
// something simplified"; Godwin 2026-11-09 picked the three-beat story, then asked for a fuller file). The left
// panel (Figma's 200 column with the logo) lists the file's real pages, as Figma names them, scrolled to Buttons,
// and the Buttons page's layers with the set's real variant names; the canvas holds the whole Button set (real
// Bland Buttons: 4 emotions x 4 sizes x 4 types) in Figma's dashed purple frame, running off the canvas's right
// and bottom edges, under a Mode switch and a Variables card with one variable, Button/brand-primary-rest.
//
// One loop, three beats, each lighting its checklist row beside the picture (onBeat):
//   1. Variables for every token: the cursor presses the Light swatch, the variable turns from blue to pink (or
//      back) and the buttons follow one after another.
//   2. Same names as the code: the cursor selects the md brand primary button; its layer row lights up and a
//      code card slides in under it with <Button size="md" emotion="brand" type="primary">, the same names.
//   3. Light and dark modes: the cursor presses Dark and the whole file turns dark (data-theme on the picture),
//      the selection and its code card still shown.
// Then the cursor presses Light again (the reset's cause) and the next loop changes the color the other way, so
// nothing rewinds on its own. It runs while the section is in view and pauses under a mouse (usePlayback).
// Reduced motion: the poster (pink, dark, selected, code shown), no cursor. Decorative: aria-hidden and inert.
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { Button, SegmentedBar } from '../../../src';
import { StorySpeed, useLoop, type Playback } from '../features/playback';
import { ComponentSetGlyph, CursorArrow, FigmaLogoLarge, FrameGlyph } from './vectors';
import type { FigmaKitTuning } from './tuning';

/** The beats, in checklist order: what each step of the loop belongs to. */
export type Beat = 0 | 1 | 2;

/** The cursor's targets (data-target inside the picture). */
type Target = 'rest' | 'swatch' | 'dark' | 'variant' | 'light';

// 0 rest; 1 to the swatch; 2 press; 3 the new color; 4 to the button; 5 press; 6 the code card; 7 to Dark;
// 8 press; 9 dark, the card still shown (poster); 10 to Light; 11 press, light again, the card leaves.
const TARGET: Target[] = ['rest', 'swatch', 'swatch', 'swatch', 'variant', 'variant', 'variant', 'dark', 'dark', 'dark', 'light', 'light'];
const BEAT: Beat[] = [0, 0, 0, 0, 1, 1, 1, 2, 2, 2, 2, 2];
const PRESS = new Set([2, 5, 8, 11]);
const POSTER = 9;
const LAST = TARGET.length - 1;

/** Figma's pages, as the file names them (dividers are pages named ---); the list scrolls to Buttons. */
const PAGES = [
  'Cover', '---', '❖  MISC  ❖', '     •  Brand elements', '     •  Annotations', '---', '❖  BASE  ❖', '     •  Colors',
  '     •  Effects', '     •  Grid system', '     •  Icons', '     •  Spacing', '     •  Typography', '     •  Scroll area', '---',
  '❖  COMPONENTS  ❖', '     •  Accordion', '     •  Alert', '     •  Avatar', '     •  Badges', '     •  Banner', '     •  Breadcrumbs',
  '     •  Buttons', '     •  Checkbox', '     •  Chip', '     •  Code snippet', '     •  Date & Time', '     •  Dropdown',
  '     •  Empty State', '     •  File tab', '     •  File Upload', '     •  Lists',
];
const CURRENT_PAGE = '     •  Buttons';

/** The set's first variants in Figma's layer order; the md brand primary is the one the story selects. */
const SELECTED_VARIANT = 'Size=md, Emotion=brand, Type=primary, State=rest';
const VARIANTS = [
  'Size=lg, Emotion=brand, Type=primary, State=rest',
  'Size=lg, Emotion=brand, Type=secondary, State=rest',
  'Size=lg, Emotion=brand, Type=ghost, State=rest',
  'Size=lg, Emotion=brand, Type=stroke, State=rest',
  SELECTED_VARIANT,
  'Size=sm, Emotion=brand, Type=primary, State=rest',
  'Size=md, Emotion=brand, Type=secondary, State=rest',
  'Size=sm, Emotion=brand, Type=secondary, State=rest',
  'Size=md, Emotion=brand, Type=ghost, State=rest',
  'Size=sm, Emotion=brand, Type=ghost, State=rest',
  'Size=md, Emotion=brand, Type=stroke, State=rest',
  'Size=sm, Emotion=brand, Type=stroke, State=rest',
];

/** The canvas: the Button set as Figma lays it out, a row per size and emotion, a column per type. */
const EMOTIONS = ['brand', 'success', 'danger', 'warning'] as const;
const SIZES = ['lg', 'md', 'sm', 'xs'] as const;
const TYPES = ['primary', 'secondary', 'ghost', 'stroke'] as const;
const BUTTONS = EMOTIONS.flatMap((emotion, e) =>
  SIZES.flatMap((size, s) => TYPES.map((type, t) => ({ emotion, size, type, row: e * SIZES.length + s, col: t }))),
);

function holds(t: FigmaKitTuning['story']) {
  const { restMs, moveMs, pressMs, holdMs, codeHoldMs } = t;
  return [restMs, moveMs, pressMs, holdMs, moveMs, pressMs, codeHoldMs, moveMs, pressMs, holdMs, moveMs, pressMs];
}

/** How long each beat lasts, in checklist order: its row's progress line fills over that time. */
export function beatDurations(t: FigmaKitTuning['story']): [number, number, number] {
  const out: [number, number, number] = [0, 0, 0];
  holds(t).forEach((ms, i) => (out[BEAT[i]!] += ms));
  return out;
}

/** The Variables card's rows: the primary brand Button's four variables; the cursor presses the first. */
const VARIABLES = ['Button/brand-primary-rest', 'Button/brand-primary-hover', 'Button/brand-primary-pressed', 'Button/brand-primary-disabled'];

export function FigmaFile({ playback, story, onBeat }: { playback: Playback; story: FigmaKitTuning['story']; onBeat: (beat: Beat | null) => void }) {
  return (
    <StorySpeed.Provider value={1}>
      <Picture playback={playback} story={story} onBeat={onBeat} />
    </StorySpeed.Provider>
  );
}

function Picture({ playback, story, onBeat }: { playback: Playback; story: FigmaKitTuning['story']; onBeat: (beat: Beat | null) => void }) {
  const { active, reduced, started } = playback;
  const step = useLoop(active, reduced, holds(story), 0, POSTER);

  // Each loop starts from the color the last one ended on.
  const [round, setRound] = useState(0);
  const previous = useRef(step);
  useEffect(() => {
    if (previous.current === LAST && step === 0) setRound((r) => r + 1);
    previous.current = step;
  }, [step]);

  const startsPink = round % 2 === 1;
  const pink = step >= 3 ? !startsPink : startsPink;
  const selected = step >= 6 && step <= 10;
  const dark = step >= 9 && step <= 10;

  // The checklist follows the story once it has started; under reduced motion every row stays lit.
  useEffect(() => {
    onBeat(reduced || !started ? null : BEAT[step]!);
  }, [onBeat, reduced, started, step]);

  // The cursor sits on its target's centre, measured in the picture's own pixels (kept in its own pixels, whatever scale it is shown at).
  const root = useRef<HTMLDivElement>(null);
  const [at, setAt] = useState({ x: 0, y: 0 });
  const target = TARGET[step]!;
  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    const place = () => {
      const goal = el.querySelector<HTMLElement>(`[data-target="${target}"]`);
      if (!goal) return;
      const box = el.getBoundingClientRect();
      const scale = box.width / el.offsetWidth || 1;
      const r = goal.getBoundingClientRect();
      setAt({
        x: (r.left + r.width / 2 - box.left) / scale,
        y: (r.top + r.height / 2 - box.top) / scale,
      });
    };
    place();
    const ro = new ResizeObserver(place);
    ro.observe(el);
    return () => ro.disconnect();
  }, [target]);

  // How much of the picture runs past the page's right edge (from xl), in its own pixels: the Variables card keeps
  // its gap from the edge you can see.
  const [cut, setCut] = useState(0);
  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    const measure = () => {
      const box = el.getBoundingClientRect();
      const scale = box.width / el.offsetWidth || 1;
      // Less the picture's border: the card's offset is measured from inside it.
      setCut(Math.max(0, Math.round((box.right - document.documentElement.clientWidth) / scale - el.clientLeft)));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, []);

  // The page list scrolls so Buttons, the current page, sits in its middle.
  const pages = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const list = pages.current;
    const current = list?.querySelector<HTMLElement>('[data-current]');
    if (!list || !current) return;
    const centre = () => {
      list.scrollTop = current.offsetTop - list.clientHeight / 2 + current.offsetHeight / 2;
    };
    centre();
    const ro = new ResizeObserver(centre);
    ro.observe(list);
    return () => ro.disconnect();
  }, []);

  const theme = dark ? 'dark' : 'light';

  return (
    <div
      ref={root}
      className="fk-pic bland-smooth"
      data-step={step}
      data-theme={theme}
      style={{ '--fk-cut': `${cut}px` } as CSSProperties}
      aria-hidden
      inert
    >
      <div className="fk-pic__panel">
        <div className="fk-pic__file">
          <FigmaLogoLarge className="fk-pic__logo" />
          <p className="fk-pic__file-name">Bland Design System</p>
        </div>
        <p className="fk-pic__heading">Pages</p>
        <div ref={pages} className="fk-pic__pages">
          {PAGES.map((name, i) =>
            name === '---' ? (
              <span key={i} className="fk-pic__divider" />
            ) : (
              <span key={i} className="fk-pic__row fk-pic__page bland-smooth" data-current={name === CURRENT_PAGE || undefined}>
                {name}
              </span>
            ),
          )}
        </div>
        <p className="fk-pic__heading">Layers</p>
        <div className="fk-pic__layers">
          <span className="fk-pic__row bland-smooth">
            <FrameGlyph className="fk-pic__glyph" />
            Buttons
          </span>
          <span className="fk-pic__row bland-smooth fk-pic__set">
            <ComponentSetGlyph className="fk-pic__glyph" />
            Button
          </span>
          {VARIANTS.map((name) => (
            <span
              key={name}
              className="fk-pic__row bland-smooth fk-pic__variant"
              data-selected={(name === SELECTED_VARIANT && selected) || undefined}
            >
              <span className="fk-pic__variant-name">{name}</span>
            </span>
          ))}
        </div>
      </div>

      <div className={`fk-pic__canvas${pink ? ' brand-pink' : ''}`} data-theme={theme}>
        <div className="fk-pic__set-box">
          <span className="fk-pic__frame-label">
            <ComponentSetGlyph className="fk-pic__glyph" />
            Button
          </span>
          <div className="fk-pic__frame bland-smooth" data-theme={theme}>
            {BUTTONS.map((b) => {
              const isSelected = b.emotion === 'brand' && b.size === 'md' && b.type === 'primary';
              return (
                <span
                  key={`${b.emotion}-${b.size}-${b.type}`}
                  className="fk-pic__button"
                  data-type={b.type}
                  data-target={isSelected ? 'variant' : undefined}
                  data-selected={(isSelected && selected) || undefined}
                  style={{ '--i': b.row + b.col } as CSSProperties}
                >
                  <Button emotion={b.emotion} type={b.type} size={b.size} tabIndex={-1}>
                    Button
                  </Button>
                  {isSelected && (
                    <span className="fk-pic__code bland-smooth" data-theme="dark" data-shown={selected || undefined}>
                      <code>
                        <span data-token="punct">&lt;</span>
                        <span data-token="function">Button</span> <span data-token="keyword">size</span>
                        <span data-token="punct">=</span>
                        <span data-token="string">"md"</span> <span data-token="keyword">emotion</span>
                        <span data-token="punct">=</span>
                        <span data-token="string">"brand"</span> <span data-token="keyword">type</span>
                        <span data-token="punct">=</span>
                        <span data-token="string">"primary"</span>
                        <span data-token="punct">&gt;</span>
                      </code>
                    </span>
                  )}
                </span>
              );
            })}
          </div>
        </div>
        <span className="fk-pic__rest" data-target="rest" />

      <div className="fk-pic__mode bland-smooth">
          <SegmentedBar
            aria-label="Mode"
            value={dark ? 'dark' : 'light'}
            items={[
              {
                id: 'light',
                label: <span data-target="light">Light</span>,
                textValue: 'Light',
              },
              {
                id: 'dark',
                label: <span data-target="dark">Dark</span>,
                textValue: 'Dark',
              },
            ]}
          />
        </div>

        {/* Always dark, so it stands out on the light file and keeps its look on the dark one. */}
        <div className="fk-pic__vars bland-smooth" data-theme="dark">
          <div className="fk-pic__vars-head">
            <span>Variables</span>
            <span className="fk-pic__vars-mode">Light</span>
            <span className="fk-pic__vars-mode">Dark</span>
          </div>
          {VARIABLES.map((name, i) => (
            <div key={name} className="fk-pic__var bland-smooth" data-current={i === 0 || undefined} style={{ '--fk-var': `var(--${name.replace('/', '-').toLowerCase()})` } as CSSProperties}>
              <span className="fk-pic__var-name">{name}</span>
              <span
                className="fk-pic__swatch fk-pic__ease bland-smooth"
                data-theme="light"
                data-target={i === 0 ? 'swatch' : undefined}
                data-pressed={(i === 0 && step === 2) || undefined}
              />
              <span className="fk-pic__swatch fk-pic__ease bland-smooth" data-theme="dark" />
            </div>
          ))}
        </div>
      </div>

      {!reduced && (
        <span
          className="fk-pic__cursor"
          data-pressed={PRESS.has(step) || undefined}
          data-hidden={!started || undefined}
          style={{ '--x': `${at.x}px`, '--y': `${at.y}px` } as CSSProperties}
        >
          <CursorArrow className="fk-pic__arrow" />
        </span>
      )}
    </div>
  );
}
