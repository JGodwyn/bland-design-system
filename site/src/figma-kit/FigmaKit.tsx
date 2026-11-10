// Landing page "Figma kit" (Figma 7078:34292, "Figma system" in the Landing page frame 7079:35060; Godwin 2026-11-09,
// plan agreed before the build). The copy (tag, headline, description, "Get the Figma kit") and the three checklist
// rows sit in the left column, the rows level with the picture's foot; the picture, a simplified Bland Figma file
// (FigmaFile.tsx), runs off the right edge from breakpoint/xl as in Figma. Below xl everything stacks.
//
// Entrance, once, when the section comes into view: the headline's words rise in one after another (What you get's
// rise), then the description, button and rows follow, then the picture's parts come in one after another. While
// the picture's story plays, the checklist row of the current beat is lit and the others rest. Reduced motion:
// everything fades in, every row stays lit, the picture shows its poster.
import { Fragment, useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from 'react';
import { Icon } from '../../../src';
import { usePlayback } from '../features/playback';
import { FigmaLogoIcon } from '../icons';
import { FigmaFile, beatDurations, type Beat } from './FigmaFile';
import { figmaKitStyle, useFigmaKitTuning } from './tuning';
import { CodeIcon, DiamondsFourIcon, ToggleRightIcon } from './vectors';
import './figma-kit.css';

/** Where "Get the Figma kit" goes. Godwin has not named one yet (2026-11-09): the Bland file itself until then. */
export const FIGMA_KIT_URL = 'https://www.figma.com/design/32J76yQH71a7sENjf60RqD/Bland-Design-System';

/** Figma's copy (docs/landing-copy.md, "Figma kit"). The headline breaks after the comma, as in Figma. */
const HEADLINE = ['The whole system,', 'in Figma.'];
const DESCRIPTION =
  'Every component starts in the Figma kit and lands in code with the same names, sizes and states. When a token changes in Figma, code catches up in one sync.';
const CHECKLIST: { icon: ReactNode; text: string }[] = [
  { icon: <DiamondsFourIcon />, text: 'Variables for every token' },
  { icon: <CodeIcon />, text: 'Same names as the code' },
  { icon: <ToggleRightIcon />, text: 'Light and dark modes' },
];

/** The headline as words, each with its place (--d) for the staggered rise, one line per Figma line. */
function Headline() {
  let d = 0;
  return (
    <h2 id="fk-title" className="fk__title">
      {HEADLINE.map((line, l) => (
        <span key={l} className="fk__line">
          {line.split(' ').map((word, i, all) => (
            <Fragment key={i}>
              <span className="fk__word" style={{ '--d': d++ } as CSSProperties}>
                {word}
              </span>
              {i < all.length - 1 ? ' ' : null}
            </Fragment>
          ))}
        </span>
      ))}
    </h2>
  );
}

export function FigmaKit() {
  const tuning = useFigmaKitTuning();
  const section = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);
  const [beat, setBeat] = useState<Beat | null>(null);
  const playback = usePlayback(0, { stagger: false });
  const onBeat = useCallback((b: Beat | null) => setBeat(b), []);
  // A new beat restarts its row's progress line (the theme section's line, filling over the beat's time).
  const [run, setRun] = useState(0);
  useEffect(() => setRun((n) => n + 1), [beat]);
  const durations = beatDurations(tuning.story);

  // The entrance plays once, when a fifth of the section is on screen.
  useEffect(() => {
    const el = section.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const words = HEADLINE.join(' ').split(' ').length;
  return (
    <section
      ref={section}
      className="fk"
      data-theme="light"
      data-shown={shown || undefined}
      aria-labelledby="fk-title"
      style={{ ...figmaKitStyle(tuning), '--fk-words': words } as CSSProperties}
    >
      <div className="bland-grid fk__grid">
        <div className="fk__copy">
          <div className="fk__head">
            <p className="fk__tag fk__block bland-smooth" style={{ '--b': 0 } as CSSProperties}>
              Figma kit
            </p>
            <Headline />
            <p className="fk__lede fk__block" style={{ '--b': 1 } as CSSProperties}>
              {DESCRIPTION}
            </p>
            <div className="fk__block" style={{ '--b': 2 } as CSSProperties}>
              {/* A real link drawn as Bland's sm brand primary Button (the Button's own markup and classes). */}
              <a
                className="bland-button bland-focus-ring bland-smooth fk__cta"
                data-size="sm"
                data-emotion="brand"
                data-type="primary"
                href={FIGMA_KIT_URL}
                target="_blank"
                rel="noreferrer"
              >
                <Icon className="bland-button__icon">
                  <FigmaLogoIcon />
                </Icon>
                <span className="bland-button__label">Get the Figma kit</span>
              </a>
            </div>
          </div>

          <ul className="fk__list" aria-label="In the Figma kit">
            {CHECKLIST.map((item, i) => (
              <li key={item.text} className="fk__item fk__block" data-lit={beat === null || beat === i || undefined} style={{ '--b': 3 + i } as CSSProperties}>
                <Icon size="md" className="fk__icon">
                  {item.icon}
                </Icon>
                {item.text}
                {beat === i && (
                  <span
                    key={run}
                    className="fk__fill"
                    data-paused={!playback.active || undefined}
                    style={{ '--fk-beat': `${durations[i]}ms` } as CSSProperties}
                  />
                )}
              </li>
            ))}
          </ul>
        </div>

        <div ref={playback.ref as RefObject<HTMLDivElement>} className="fk__visual">
          <FigmaFile playback={playback} story={tuning.story} onBeat={onBeat} />
        </div>
      </div>
    </section>
  );
}
