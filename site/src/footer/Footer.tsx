// Landing page footer (Figma 7100:36365; plan agreed with Godwin 2026-11-09, the frame has no annotations). Dark
// whatever the system theme, as Figma draws it and as the hero ends. Figma's column: Bland's Logo (the mono mark,
// Figma's white tile on dark), the headline "Start Bland. End up yours." with its glow, Bland's CodeText
// `npm install bland-ui` (copy on), Bland's CodeSnippet with the imports, the links row, the copyright.
//
// Motion, the hero's story run the other way: the headline starts as its outline; when a fifth of the footer is on
// screen its characters rise in (the hero's entrance) and the blocks under it follow; then, as the footer scrolls in,
// each word fills from outline to bold with its glow, so the page ends on the glow. Reduced motion: the headline
// turns bold in one step once the footer is shown, everything only fades.
import { Fragment, useEffect, useRef, useState, type CSSProperties } from 'react';
import { CodeSnippet, CodeText, Icon, Logo } from '../../../src';
import { clamp01, wave } from '../hero/story';
import { footerStyle, useFooterTuning, type FooterTuning } from './tuning';
import { LogIcon, MitIcon, NpmLogo, ReadCvLogoIcon } from './vectors';
import './footer.css';

/** Figma's two lines. */
const TITLE_LINES = [
  ['Start', 'Bland.'],
  ['End', 'up', 'yours.'],
];
const TITLE_WORDS = TITLE_LINES.flat();

/**
 * The import example. Figma shows tokens.css and styles.css only; the README's four imports are what a project
 * needs (fonts.css and base.css carry the fonts, focus ring and corner smoothing), so the copied code works.
 */
const SNIPPET = `import 'bland-ui/tokens.css';
import 'bland-ui/fonts.css';
import 'bland-ui/base.css';
import 'bland-ui/styles.css';
import { Button } from 'bland-ui';

<Button emotion="brand" type="primary">Ship it</Button>`;

/**
 * Where the links go. The GitHub repository is private (2026-11-09), so the changelog and license point at the
 * published package instead, and Figma's GitHub mark is left out until the repository is public.
 */
export const FOOTER_LINKS = {
  docs: '/docs/',
  changelog: 'https://www.npmjs.com/package/bland-ui?activeTab=code',
  license: 'https://unpkg.com/bland-ui/LICENSE',
  npm: 'https://www.npmjs.com/package/bland-ui',
};

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * How far the footer has scrolled into view, 0 (its top at the screen's bottom) to 1 (the page's end, the footer's
 * bottom at the screen's bottom), followed with inertia like the hero's track. Under reduced motion it is not used.
 */
function useFooterProgress(el: React.RefObject<HTMLElement | null>, tune: React.RefObject<FooterTuning>) {
  const [p, setP] = useState(0);
  useEffect(() => {
    let frame = 0;
    let target = 0;
    let now = 0;
    let last = 0;
    const measure = () => {
      const node = el.current;
      if (!node) return target;
      const rect = node.getBoundingClientRect();
      const vh = window.innerHeight;
      return clamp01((vh - rect.top) / Math.max(1, rect.height));
    };
    const tick = (time: number) => {
      const dt = last ? Math.min(64, time - last) : 16;
      last = time;
      const ms = tune.current.scroll.smoothingMs;
      const next = now + (target - now) * (1 - Math.exp(-dt / Math.max(1, ms)));
      now = Math.abs(target - next) < 0.0002 ? target : next;
      setP(now);
      if (now !== target) frame = requestAnimationFrame(tick);
      else {
        frame = 0;
        last = 0;
      }
    };
    const schedule = () => {
      target = measure();
      if (!frame) frame = requestAnimationFrame(tick);
    };
    target = now = measure();
    setP(now);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [el, tune]);
  return p;
}

export function Footer() {
  const tuning = useFooterTuning();
  const tune = useRef(tuning);
  tune.current = tuning;
  const section = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);
  const [reduced, setReduced] = useState(false);
  const p = useFooterProgress(section, tune);

  // The entrance plays once, when a fifth of the footer is on screen.
  useEffect(() => {
    setReduced(reducedMotion());
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

  const { fillStart, fillEnd, softness } = tuning.scroll;
  // Each word's boldness, 0 (outline) to 1 (bold with its glow). Under reduced motion: all bold once shown.
  const boldness = (i: number) =>
    reduced
      ? shown
        ? 1
        : 0
      : wave(p, [fillStart, Math.max(fillStart + 0.01, fillEnd)], i, TITLE_WORDS.length, softness);

  let wordIndex = 0;
  let charIndex = 0;
  const chars = (word: string, first: number) =>
    [...word].map((ch, k) => (
      <span key={k} className="ft__char" style={{ '--c': first + k } as CSSProperties}>
        {ch}
      </span>
    ));
  const block = (b: number) => ({ '--b': b }) as CSSProperties;

  return (
    <footer
      ref={section}
      className="ft"
      data-theme="dark"
      data-shown={shown || undefined}
      aria-labelledby="ft-title"
      style={footerStyle(tuning)}
    >
      <div className="ft__inner">
        {/* Figma's Logo, lg, its Mark slot the white (inverse) tile: Bland's `mono` logo. Not a link, as in Figma. */}
        <div className="ft__block ft__logo">
          <Logo mono />
        </div>

        <h2 id="ft-title" className="ft__title" aria-label={TITLE_WORDS.join(' ')}>
          {TITLE_LINES.map((line, l) => (
            <span key={l} className="ft__line">
              {line.map((word, w) => {
                const i = wordIndex++;
                const c0 = charIndex;
                charIndex += word.length;
                return (
                  <Fragment key={word}>
                    <span className="ft__word" data-word style={{ '--bold': boldness(i).toFixed(3) } as CSSProperties}>
                      <span className="ft__glow ft__glow--outer" aria-hidden>
                        {chars(word, c0)}
                      </span>
                      <span className="ft__glow ft__glow--inner" aria-hidden>
                        {chars(word, c0)}
                      </span>
                      {/* The real text is the outline (as in the hero); the bold fill and glow are copies over and under it. */}
                      <span className="ft__word-outline">{chars(word, c0)}</span>
                      <span className="ft__word-bold" aria-hidden>
                        {chars(word, c0)}
                      </span>
                    </span>
                    {w < line.length - 1 ? ' ' : null}
                  </Fragment>
                );
              })}
            </span>
          ))}
        </h2>

        <div className="ft__block ft__install" style={block(0)}>
          <CodeText size="lg" copyable copyLabel="Copy install command">
            npm install bland-ui
          </CodeText>
        </div>

        <div className="ft__block" style={block(1)}>
          <CodeSnippet
            code={SNIPPET}
            language="tsx"
            lineNumbers
            actionBar={false}
            collapsible={false}
            className="ft__snippet"
          />
        </div>

        <nav className="ft__block" style={block(2)} aria-label="Footer">
          <ul className="ft__links" role="list">
            <li>
              <a className="ft__link ft__link--primary bland-focus-ring bland-smooth" href={FOOTER_LINKS.docs}>
                <Icon size="md">
                  <ReadCvLogoIcon />
                </Icon>
                <span className="ft__label">Read the docs</span>
              </a>
            </li>
            <li>
              <a
                className="ft__link bland-focus-ring bland-smooth"
                href={FOOTER_LINKS.changelog}
                target="_blank"
                rel="noreferrer"
              >
                <Icon size="md">
                  <LogIcon />
                </Icon>
                <span className="ft__label">Changelog</span>
              </a>
            </li>
            <li>
              <a
                className="ft__link bland-focus-ring bland-smooth"
                href={FOOTER_LINKS.license}
                target="_blank"
                rel="noreferrer"
              >
                <Icon size="md">
                  <MitIcon />
                </Icon>
                <span className="ft__label">MIT license</span>
              </a>
            </li>
            <li>
              <a
                className="ft__mark bland-focus-ring bland-smooth"
                href={FOOTER_LINKS.npm}
                target="_blank"
                rel="noreferrer"
                aria-label="bland-ui on npm"
              >
                <NpmLogo className="ft__npm" aria-hidden />
              </a>
            </li>
          </ul>
        </nav>

        <p className="ft__block ft__copyright" style={block(3)}>
          © 2026 Bland Design System. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
