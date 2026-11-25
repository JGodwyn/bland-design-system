// The showcase embed (site/embed/showcase/): the landing page's showcase in its row layout, alone, for the Bland case
// study on godwinjohn.com to frame. It starts light whatever the system says (the portfolio is light; ?theme=dark
// starts it dark), and tells the page that frames it two things: its height, whenever it changes, so the frame never
// scrolls; and that it is ready, once its fonts are in and it has painted, so the page can swap its poster for it.
// Contract in the portfolio's AGENTS.md, "The Bland showcase embed"; tests in tests/embed.spec.ts.
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../../../src/tokens/tokens.css';
import '../../../src/styles/fonts.css';
import '../../../src/styles/base.css';
import '../landing-values.css';
import './embed.css';
import { Showcase } from '../showcase/Showcase';

const theme = new URLSearchParams(location.search).get('theme') === 'dark' ? 'dark' : 'light';

/** Messages to the framing page. The payload is a number and a name, so any parent may read it. */
function post(message: { type: 'bland:height'; height: number } | { type: 'bland:ready' }) {
  if (window.parent !== window) window.parent.postMessage(message, '*');
}

/**
 * The content's height: the lowest edge of anything in the body, the showcase and any floating layer portalled
 * beside it (the color picker, menus). Not scrollHeight: a document is never shorter than its viewport, so a frame
 * sized from it could grow but never shrink back.
 */
function contentHeight() {
  let bottom = 0;
  for (const el of document.body.children) bottom = Math.max(bottom, el.getBoundingClientRect().bottom + window.scrollY);
  return Math.ceil(bottom);
}

/** The content's height, posted on first layout and on every change, at most once a frame. */
function reportHeight() {
  let frame = 0;
  let last = -1;
  const send = () => {
    frame = 0;
    const height = contentHeight();
    if (height === last) return;
    last = height;
    post({ type: 'bland:height', height });
  };
  const queue = () => {
    if (!frame) frame = requestAnimationFrame(send);
  };
  new ResizeObserver(queue).observe(document.body);
  // Floating layers (the color picker, menus) are positioned outside the body's flow: watch for them too.
  new MutationObserver(queue).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['style', 'data-open', 'hidden'] });
  queue();
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <main className="embed">
      <Showcase layout="row" initialTheme={theme} />
    </main>
  </StrictMode>,
);

reportHeight();
void document.fonts.ready.then(() => requestAnimationFrame(() => requestAnimationFrame(() => post({ type: 'bland:ready' }))));
