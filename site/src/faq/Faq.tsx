// Landing page FAQ (Figma 7189:37802, "FAQs" in the Landing page frame 7079:35060; Godwin's redesign 2026-11-09).
// The heading and line on the left, Bland's own Accordion on the right, md and flush, with Figma's dotted rule
// between the questions; the first is open to start, one open at a time. Stacked on a phone. The one-open rule is
// kept here (`openIndex`), not by a native `name` group: the browser closes a group's other item at once, and Bland's
// Accordion follows a browser change without motion, so the old question snapped shut (Godwin 2026-11-10). Set
// through `open`, the other question folds over duration/md like one closed by hand.
// The copy is in questions.tsx (docs/landing-copy.md, "FAQ").
//
// Entrance, once, when a fifth of the section is on screen: the heading's words rise in one after another (the
// Figma kit's rise), then the line, then the questions top to bottom. Reduced motion: everything fades in.
import { Fragment, useEffect, useRef, useState, type CSSProperties } from 'react';
import { Accordion } from '../../../src';
import { FAQ_LINE, FAQ_TITLE, QUESTIONS } from './questions';
import { faqStyle, useFaqTuning } from './tuning';
import './faq.css';

export function Faq() {
  const tuning = useFaqTuning();
  const section = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);
  // Which question is open (Figma: the first, to start); null when the open one is closed.
  const [openIndex, setOpenIndex] = useState<number | null>(0);

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

  const words = FAQ_TITLE.join(' ').split(' ');
  let d = 0;
  return (
    <section
      ref={section}
      className="faq"
      data-theme="light"
      data-shown={shown || undefined}
      aria-labelledby="faq-title"
      style={{ ...faqStyle(tuning), '--faq-words': words.length } as CSSProperties}
    >
      <div className="bland-grid faq__grid">
        <div className="faq__body">
          <div className="faq__head">
            <h2 id="faq-title" className="faq__title">
              {FAQ_TITLE.map((line, l) => (
                <Fragment key={l}>
                  {l > 0 ? ' ' : null}
                  <span className="faq__title-line">
                    {line.split(' ').map((word, i, all) => (
                      <Fragment key={i}>
                        <span className="faq__word" style={{ '--d': d++ } as CSSProperties}>
                          {word}
                        </span>
                        {i < all.length - 1 ? ' ' : null}
                      </Fragment>
                    ))}
                  </span>
                </Fragment>
              ))}
            </h2>
            <p className="faq__line">{FAQ_LINE}</p>
          </div>
          <div className="faq__list">
            {QUESTIONS.map((item, i) => (
              <Fragment key={item.q}>
                {/* Figma's dotted line between two questions: decoration, the list's order says the rest. */}
                {i > 0 && <span className="faq__rule faq__item" style={{ '--i': i } as CSSProperties} aria-hidden="true" />}
                <Accordion
                  className="faq__item"
                  style={{ '--i': i } as CSSProperties}
                  size="md"
                  flush
                  open={openIndex === i}
                  onOpenChange={(open) => setOpenIndex((current) => (open ? i : current === i ? null : current))}
                  title={item.q}
                >
                  <p className="faq__answer">{item.a}</p>
                </Accordion>
              </Fragment>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
